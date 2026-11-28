import asyncio
import json
import unittest
import tempfile
from pathlib import Path
from unittest.mock import AsyncMock, patch

from app import conversation, rag
from test_chatbot import product


def model_json(body):
    return {"message": {"content": json.dumps(body, ensure_ascii=False)}}


class ModelConversationTests(unittest.IsolatedAsyncioTestCase):
    async def ask(self, question, history=None):
        return await rag.run_model_answer(question, history, rag.answer_with_model)

    async def asyncSetUp(self):
        rag._embedding_cache.clear()
        self.catalog = [product(i, "Bạc Hà") for i in range(1, 8)]
        self.catalog.append(product(20, "Hoa Lài", factory="VIPSEN"))
        self.factories = [{"id": 1, "name": "Labcos"}, {"id": 2, "name": "VIPSEN"}, {"id": 3, "name": "Xưởng mới"}]
        self.patches = [patch.object(rag, "installed_models", AsyncMock(return_value={rag.config.LLM_MODEL})),
                        patch.object(rag.config, "EMBEDDING_CACHE_PATH", ""),
                        patch.object(rag.config, "LLM_ENABLED", True),
                        patch.object(rag, "load_catalog", AsyncMock(side_effect=lambda **kw: self.catalog)),
                        patch.object(rag, "load_factories", AsyncMock(return_value=self.factories))]
        for setting in self.patches:
            setting.start()

    async def asyncTearDown(self):
        for setting in reversed(self.patches):
            setting.stop()

    async def test_model_can_request_aggregation_without_a_matching_question_pattern(self):
        with patch.object(rag, "model_request", return_value=model_json({"operation": "factory_rank"})) as request:
            reply, cards = await self.ask("Mình muốn ghé nơi có lựa chọn đa dạng nhất")
        self.assertIn("**Labcos**: **7 sản phẩm**", reply)
        self.assertNotIn("**VIPSEN**", reply)
        self.assertEqual([], cards)
        self.assertEqual(1, request.call_count)
        self.assertEqual("/api/chat", request.call_args.args[0][-9:])

    async def test_model_counts_fresh_data_instead_of_generating_a_number(self):
        with patch.object(rag, "model_request", return_value=model_json({"operation": "product_count", "factory_id": 1})):
            first, _ = await self.ask("Cho mình tổng số mặt hàng bên Labcos")
            self.catalog.append(product(30, "Chanh"))
            second, _ = await self.ask("Cho mình tổng số mặt hàng bên Labcos")
        self.assertIn("**7 sản phẩm**", first)
        self.assertIn("**8 sản phẩm**", second)

    async def test_advice_uses_history_and_can_choose_one_product_with_an_explanation(self):
        history = [{"role": "user", "content": "Tôi muốn một mùi bạc hà từ Labcos"},
                   {"role": "assistant", "content": "Bạn muốn dung tích nào?"}]
        responses = [model_json({"operation": "advice", "query": "bạc hà 10ml", "factory_id": 1}),
                     model_json({"message": "Đúng mùi bạc hà bạn đang tìm. Bạn có thể bắt đầu với một lựa chọn.",
                                 "selections": [{"id": 2}]})]
        with patch.object(rag, "model_request", side_effect=responses) as request:
            reply, cards = await self.ask("Lấy chai nhỏ trước thì sao?", history)
        self.assertIn("Đúng mùi bạc hà", reply)
        self.assertIn("200.000đ", reply)
        self.assertEqual([2], [p["id"] for p in cards])
        self.assertEqual(history, json.loads(request.call_args_list[0].args[1]["messages"][-1]["content"])["history"])
        self.assertEqual(2, request.call_count)

    async def test_consultation_can_ask_a_question_without_any_product_cards(self):
        body = {"operation": "clarify", "message": "Bạn định dùng mùi hương cho phòng làm việc hay làm quà?"}
        with patch.object(rag, "model_request", return_value=model_json(body)):
            reply, cards = await self.ask("Tôi chưa biết nên chọn thế nào")
        self.assertEqual(body["message"], reply)
        self.assertEqual([], cards)

    async def test_advice_awaits_the_model_reply_within_the_conversation_deadline(self):
        async def slow_plan(*args):
            await asyncio.sleep(0.03)
            return conversation.QueryPlan("clarify", message="Bạn thích nhóm mùi nào?")
        with patch.object(rag, "plan_question", side_effect=slow_plan), patch.object(rag.config, "CHAT_TIMEOUT", 1):
            reply, cards = await self.ask("Tư vấn giúp tôi")
        self.assertEqual("Bạn thích nhóm mùi nào?", reply)
        self.assertEqual([], cards)

    async def test_deadline_reports_failure_instead_of_silently_returning_three_products(self):
        async def slow_plan(*args):
            await asyncio.sleep(1)
        with patch.object(rag, "plan_question", side_effect=slow_plan), patch.object(rag.config, "CHAT_TIMEOUT", 0.01):
            reply, cards = await self.ask("Tư vấn giúp tôi")
        self.assertIn("chưa hoàn tất", reply)
        self.assertEqual([], cards)
        self.assertFalse(rag._conversation_lock.locked())

    async def test_model_cannot_add_an_unknown_factory_or_product(self):
        invalid_plans = [{"operation": "product_count", "factory_id": 999}, {"operation": "run_sql", "query": "anything"}]
        for body in invalid_plans:
            with self.subTest(body=body), patch.object(rag, "model_request", return_value=model_json(body)):
                reply, cards = await self.ask("Tôi muốn xem sản phẩm")
            self.assertIn("chưa hoàn tất", reply)
            self.assertEqual([], cards)
        replies = [model_json({"operation": "recommend", "query": "bạc hà"}),
                   model_json({"message": "Bạn tham khảo lựa chọn này nhé.", "selections": [{"id": 999}]}),
                   model_json({"message": "Bạn tham khảo lựa chọn này nhé.", "selections": [{"id": 999}]})]
        with patch.object(rag, "model_request", side_effect=replies):
            reply, cards = await self.ask("Gợi ý bạc hà")
        self.assertEqual([], cards)
        self.assertIn("chưa hoàn tất", reply)

    async def test_generated_product_attributes_unverified_prices_and_links_are_rejected(self):
        invalid_advice = [
            {"message": "Chai này giá 1.000đ.", "selections": []},
            {"message": "Xem [ở đây](https://example.com)", "selections": []},
            {"message": "Một lựa chọn cho bạn.", "selections": [{"id": 1, "reason": "Có công dụng chưa được xưởng xác nhận.", "evidence": "Nội dung tự bịa"}]},
            {"message": "Một lựa chọn cho bạn.", "selections": [{"id": 1, "reason": "Xuất xứ Pháp.", "evidence": "Bạc Hà"}]},
        ]
        for advice in invalid_advice:
            with self.subTest(advice=advice), patch.object(rag, "model_request", side_effect=[model_json({"operation": "advice", "query": "bạc hà"}), model_json(advice), model_json(advice)]):
                reply, cards = await self.ask("Tư vấn bạc hà")
            self.assertEqual([], cards)
            self.assertIn("chưa hoàn tất", reply)

    async def test_advice_has_current_price_and_allows_only_verified_money(self):
        response = model_json({"message": "Giá 200.000đ nằm trong ngân sách 300k của bạn.", "selections": [{"id": 1}]})
        with patch.object(rag, "model_request", return_value=response) as model:
            reply, cards = await rag.ask_question("Tư vấn bạc hà Labcos 10ml dưới 300k")
        self.assertEqual([1], [p["id"] for p in cards])
        self.assertIn("200.000đ", reply)
        payload = json.loads(model.call_args.args[1]["messages"][-1]["content"])
        self.assertEqual(200000, payload["products"][0]["priceVnd"])
        self.assertEqual(10, payload["products"][0]["volumeMl"])

    def test_money_validation_keeps_vietnamese_words_and_rejects_invented_prices(self):
        self.assertEqual("Bạn lưu ý 2 điều này.", conversation.advice_message("Bạn lưu ý 2 điều này."))
        self.assertEqual("Trong ngân sách 1,5 triệu.", conversation.advice_message("Trong ngân sách 1,5 triệu.", {1500000}))
        with self.assertRaises(conversation.InvalidModelAnswer):
            conversation.advice_message("Chai này chỉ 1.000đ.", {200000})

    async def test_generated_product_notes_get_one_repair_instead_of_being_shown(self):
        replies = [model_json({"operation": "advice", "query": "bạc hà"}),
                   model_json({"message": "Một lựa chọn cho bạn.", "selections": [{"id": 1, "reason": "Đúng mùi bạn chọn.", "evidence": "Không có trong mô tả"}]}),
                   model_json({"message": "Một lựa chọn cho bạn.", "selections": [{"id": 1}]})]
        with patch.object(rag, "model_request", side_effect=replies) as request:
            reply, cards = await self.ask("Tư vấn bạc hà")
        self.assertEqual([1], [p["id"] for p in cards])
        self.assertIn("200.000đ", reply)
        self.assertEqual(3, request.call_count)
        self.assertIn("correction", json.loads(request.call_args.args[1]["messages"][-1]["content"]))

    async def test_new_wording_can_retrieve_semantically_before_composing_advice(self):
        replies = [model_json({"operation": "advice", "query": "cảm giác ấm cúng"}),
                   model_json({"message": "Bạn dùng trong không gian nào?", "selections": []})]
        with patch.object(rag, "installed_models", AsyncMock(return_value={rag.config.LLM_MODEL, rag.config.EMBEDDING_MODEL})), patch.object(rag, "model_request", side_effect=replies), patch.object(rag, "semantic_rerank", AsyncMock(return_value=[])) as semantic:
            reply, cards = await self.ask("Muốn không gian có cảm giác ấm cúng")
        semantic.assert_awaited_once()
        self.assertEqual(8, len(semantic.call_args.args[1]))
        self.assertEqual([], cards)
        self.assertIn("không gian", reply)

    async def test_missing_chat_model_is_not_claimed_as_conversational_ai(self):
        with patch.object(rag, "installed_models", AsyncMock(return_value={rag.config.EMBEDDING_MODEL})), patch.object(rag, "json_request") as request:
            reply, cards = await rag.ask_question("Tư vấn giúp tôi")
        self.assertIn("tư vấn AI hiện chưa sẵn sàng", reply)
        self.assertEqual([], cards)
        request.assert_not_called()

    async def test_generic_consultation_does_not_load_embedding_model_without_search_criteria(self):
        with patch.object(rag, "semantic_rerank", AsyncMock()) as semantic:
            result = await rag.retrieve_advice_candidates("tinh dầu", self.catalog, None)
        self.assertEqual([], result)
        semantic.assert_not_awaited()

    async def test_embedding_batches_release_models_and_work_beyond_ram_cache_capacity(self):
        rag._embedding_cache.clear()
        self.patches.append(patch.object(rag.config, "EMBEDDING_MODEL", "bge-m3"))
        self.patches[-1].start()
        def respond(url, body, timeout):
            if url.endswith("/api/generate"):
                return {"done": True}
            return {"embeddings": [[1.0, 1.0] for text in body["input"]]}
        catalog = [product(i, f"Mùi {i}") for i in range(1, 521)]
        with patch.object(rag, "model_request", side_effect=respond) as request:
            result = await rag.semantic_rerank("Mùi dịu nhẹ", catalog, limit=12)
        self.assertEqual(12, len(result))
        self.assertEqual(0, request.call_args_list[0].args[1]["keep_alive"])
        batches = [call.args[1] for call in request.call_args_list if call.args[0].endswith("/api/embed")]
        self.assertEqual(521, sum(len(body["input"]) for body in batches))
        self.assertTrue(all(len(body["input"]) <= 16 for body in batches))
        self.assertEqual("0", batches[-1]["keep_alive"])
        self.assertEqual(512, len(rag._embedding_cache))
        rag._embedding_cache.clear()

    async def test_existing_lookup_mode_answers_the_screenshot_ranking_question(self):
        with patch.object(rag, "installed_models", AsyncMock(return_value=set())):
            reply, cards = await rag.ask_question("xưởng nào có nhiều sản phẩm nhất")
        self.assertIn("**Labcos**: **7 sản phẩm**", reply)
        self.assertNotIn("Hiện có 3 xưởng", reply)
        self.assertEqual([], cards)

    async def test_known_scent_filters_keep_hot_qwen_without_loading_another_model(self):
        self.catalog = [product(1, "Bạc Hà"), product(2, "Hoa Lài"), product(3, "Chanh", price=900000),
                        product(4, "Chanh", volume=50), product(5, "Chanh", factory="VIPSEN"), product(6, "Oải Hương")]
        with patch.object(rag, "installed_models", AsyncMock(return_value={rag.config.EMBEDDING_MODEL})), patch.object(rag, "semantic_rerank", AsyncMock(return_value=[])) as semantic:
            result = await rag.retrieve_advice_candidates("thư giãn 10ml dưới 300k không thích bạc hà", self.catalog, self.factories[0])
        self.assertEqual([2, 6], [p["id"] for p in result])
        semantic.assert_not_awaited()

    async def test_general_need_shortlists_different_scents_but_explicit_count_keeps_factory_alternatives(self):
        catalog = [product(1, "Oải Hương"), product(2, "Oải Hương", factory="VIPSEN", price=300000),
                   product(3, "Hoa Lài", price=400000), product(4, "Đàn Hương", price=500000),
                   product(5, "Hoa Lài", factory="VIPSEN", price=600000)]
        result = await rag.retrieve_advice_candidates("sản phẩm nào giúp dễ ngủ", catalog, None)
        self.assertEqual([1, 3, 4], [p["id"] for p in result])
        requested = await rag.retrieve_advice_candidates("gợi ý 5 sản phẩm cho giấc ngủ", catalog, None)
        self.assertEqual(5, len(requested))

    async def test_requested_number_is_not_reduced_to_three_by_the_model_flow(self):
        replies = [model_json({"operation": "recommend", "query": "bạc hà", "limit": 5}),
                   model_json({"message": "Bạn có thể đối chiếu các lựa chọn này.",
                               "selections": [{"id": i} for i in range(1, 7)]})]
        with patch.object(rag, "model_request", side_effect=replies):
            _, cards = await self.ask("Cho mình 5 sản phẩm bạc hà")
        self.assertEqual(5, len(cards))

    async def test_ranking_keeps_ties_and_can_include_an_empty_factory(self):
        self.catalog = [product(1, "Chanh"), product(2, "Hoa Lài", factory="VIPSEN")]
        self.catalog[0]["variants"].append({"id": 100, "mil": 50, "price": 100000, "stockQuantity": 5, "isActive": True})
        with patch.object(rag, "model_request", return_value=model_json({"operation": "factory_rank"})):
            reply, _ = await self.ask("Đơn vị nào có nhiều lựa chọn nhất?")
        self.assertIn("**Labcos**: **1 sản phẩm**", reply)
        self.assertIn("**VIPSEN**: **1 sản phẩm**", reply)
        with patch.object(rag, "model_request", return_value=model_json({"operation": "factory_rank", "descending": False})):
            reply, _ = await self.ask("Nơi nào có ít mặt hàng nhất?")
        self.assertIn("**Xưởng mới**: **0 sản phẩm**", reply)

    async def test_primary_consultation_asks_needs_with_one_model_call(self):
        response = model_json({"message": "Bạn muốn dùng hương thơm cho không gian nào?", "selections": []})
        with patch.object(rag, "plan_question", side_effect=AssertionError("Unnecessary planning")), \
                patch.object(rag, "model_request", return_value=response) as model, \
                patch.object(rag, "semantic_rerank", AsyncMock()) as semantic:
            reply, cards = await rag.ask_question("Mình mới tìm hiểu tinh dầu, tư vấn giúp mình với")
        self.assertIn("không gian", reply)
        self.assertEqual([], cards)
        self.assertEqual(1, model.call_count)
        semantic.assert_not_awaited()

    async def test_screenshot_sleep_request_returns_advice_without_planning_or_echoing(self):
        self.catalog = [product(1, "Oải Hương"), product(2, "Bạc Hà")]
        response = model_json({"message": "Bạn có thể cân nhắc mùi hương cho không gian thư giãn.", "selections": [{"id": 1}]})
        with patch.object(rag, "plan_question", side_effect=AssertionError("Wrong consultation route")), \
                patch.object(rag, "model_request", return_value=response) as model:
            reply, cards = await rag.ask_question("muốn hỏi bạn là sản phẩm nào giúp dễ ngủ")
        self.assertEqual([1], [p["id"] for p in cards])
        self.assertNotIn("Bạn muốn tìm sản phẩm nào", reply)
        self.assertEqual(1, model.call_count)
        body = model.call_args.args[1]
        self.assertEqual(1, body["format"]["properties"]["selections"]["minItems"])
        self.assertEqual([1], [p["id"] for p in json.loads(body["messages"][-1]["content"])["products"]])

    async def test_acknowledgement_repairs_existing_loop_without_clearing_chat_history(self):
        self.catalog = [product(1, "Oải Hương"), product(2, "Bạc Hà")]
        history = [{"role": "user", "content": "muốn hỏi bạn là sản phẩm nào giúp dễ ngủ"},
                   {"role": "assistant", "content": "Bạn muốn tìm sản phẩm nào giúp dễ ngủ?"},
                   {"role": "user", "content": "ừ"},
                   {"role": "assistant", "content": "Bạn có thể muốn tìm sản phẩm nào giúp dễ ngủ?"}]
        response = model_json({"message": "Mình gợi ý theo sở thích mùi hương cho phòng ngủ.", "selections": [{"id": 1}]})
        with patch.object(rag, "model_request", return_value=response) as model:
            _, cards = await rag.ask_question("ừ", history)
        self.assertEqual([1], [p["id"] for p in cards])
        payload = json.loads(model.call_args.args[1]["messages"][-1]["content"])
        self.assertEqual("ừ", payload["question"])
        self.assertIn("dễ ngủ", payload["search_context"])
        self.assertFalse(any(m["role"] == "assistant" for m in payload["history"]))

    async def test_echoed_question_is_repaired_even_if_product_cards_are_present(self):
        self.catalog = [product(1, "Oải Hương")]
        selections = [{"id": 1}]
        responses = [model_json({"message": "Bạn muốn tìm sản phẩm nào giúp dễ ngủ?", "selections": selections}),
                     model_json({"message": "Bạn có thể cân nhắc lựa chọn này cho không gian thư giãn.", "selections": selections})]
        with patch.object(rag, "model_request", side_effect=responses) as model:
            reply, cards = await rag.ask_question("muốn hỏi bạn là sản phẩm nào giúp dễ ngủ")
        self.assertEqual([1], [p["id"] for p in cards])
        self.assertNotIn("Bạn muốn tìm sản phẩm nào", reply)
        self.assertEqual(2, model.call_count)

    async def test_invalid_prose_keeps_only_verified_choices_with_an_explicit_unavailable_notice(self):
        self.catalog = [product(1, "Oải Hương")]
        invalid = model_json({"message": "Bạn muốn tìm sản phẩm nào giúp dễ ngủ?", "selections": [{"id": 1}]})
        with patch.object(rag, "model_request", return_value=invalid):
            reply, cards = await rag.ask_question("muốn hỏi bạn là sản phẩm nào giúp dễ ngủ")
        self.assertIn(conversation.ADVICE_UNAVAILABLE, reply)
        self.assertNotIn("Bạn muốn tìm sản phẩm nào", reply)
        self.assertEqual([1], [p["id"] for p in cards])
        with patch.object(rag, "model_request", return_value=model_json({"message": "...", "selections": [{"id": 999}]})):
            _, cards = await rag.ask_question("muốn hỏi bạn là sản phẩm nào giúp dễ ngủ")
        self.assertEqual([], cards)

    async def test_unsupported_chemical_explanation_is_rewritten_from_verified_names_only(self):
        self.catalog = [product(1, "Oải Hương")]
        responses = [model_json({"message": "Có thể giúp thư giãn do chứa các hợp chất chống oxy hóa.", "selections": [{"id": 1}]}),
                     model_json({"message": "Bạn có thể cân nhắc hương hoa nếu thấy mùi này dễ chịu."})]
        with patch.object(rag, "model_request", side_effect=responses) as model:
            reply, cards = await rag.ask_question("sản phẩm nào giúp dễ ngủ")
        self.assertEqual([1], [p["id"] for p in cards])
        self.assertNotIn("chống oxy hóa", reply)
        self.assertIn("không xác nhận tác dụng", reply)
        repair = json.loads(model.call_args.args[1]["messages"][-1]["content"])
        self.assertEqual({"products"}, set(repair))
        self.assertEqual({"name", "factoryName"}, set(repair["products"][0]))

    def test_sleep_claims_are_rejected_but_scent_preferences_and_disclaimers_are_allowed(self):
        for text in ("Sản phẩm giúp dễ ngủ.", "Mùi này cải thiện giấc ngủ.", "Có thể trị mất ngủ.",
                     "Giúp thư giãn và dễ ngủ.", "Hoa lài từ Ấn Độ, có nguồn gốc rõ ràng."):
            with self.subTest(text=text), self.assertRaises(conversation.InvalidModelAnswer):
                conversation.advice_message(text)
        self.assertEqual("Không bảo đảm giúp dễ ngủ.", conversation.advice_message("Không bảo đảm giúp dễ ngủ."))
        disclaimer = "Chưa có bằng chứng khoa học rõ ràng để khẳng định sản phẩm giúp dễ ngủ."
        self.assertEqual(disclaimer, conversation.advice_message(disclaimer))
        with self.assertRaises(conversation.InvalidModelAnswer):
            conversation.advice_message("Không thích bạc hà nhưng hoa lài giúp dễ ngủ.")
        self.assertEqual("Mùi hương cho không gian thư giãn.", conversation.advice_message("Mùi hương cho không gian thư giãn."))

    async def test_placeholder_answer_is_repaired_and_never_shown_as_advice(self):
        responses = [model_json({"message": "...", "selections": []}),
                     model_json({"message": "Bạn muốn dùng hương thơm trong không gian nào?", "selections": []})]
        with patch.object(rag, "model_request", side_effect=responses) as model:
            reply, cards = await rag.ask_question("Mình mới tìm hiểu tinh dầu, tư vấn giúp mình với")
        self.assertIn("không gian", reply)
        self.assertEqual([], cards)
        self.assertEqual(2, model.call_count)

    async def test_primary_consultation_applies_factory_budget_volume_before_ai(self):
        self.catalog = [product(1, "Bạc Hà", price=370000), product(2, "Bạc Hà", factory="VIPSEN"),
                        product(3, "Bạc Hà", volume=50), product(4, "Bạc Hà", stock=0),
                        product(5, "Bạc Hà", price=500000)]
        response = model_json({"message": "Bạn có thể cân nhắc lựa chọn này.", "selections": [{"id": 1}]})
        with patch.object(rag, "plan_question", side_effect=AssertionError("Unnecessary planning")), \
                patch.object(rag, "model_request", return_value=response) as model:
            _, cards = await rag.ask_question("Tôi muốn bạc hà Labcos 10ml, ngân sách 400k để xông phòng")
        self.assertEqual([1], [p["id"] for p in cards])
        self.assertEqual(370000, cards[0]["price"])
        payload = json.loads(model.call_args.args[1]["messages"][-1]["content"])
        self.assertEqual([1], [p["id"] for p in payload["products"]])
        self.assertEqual(1, model.call_count)

    async def test_explicit_five_product_search_returns_five_without_a_model(self):
        with patch.object(rag, "model_request", AsyncMock()) as model:
            _, cards = await rag.ask_question("Gợi ý 5 loại bạc hà 10ml dưới 1 triệu")
        self.assertEqual(5, len(cards))
        model.assert_not_awaited()

    async def test_followup_keeps_mint_volume_budget_and_changes_only_factory(self):
        self.catalog = [product(1, "Bạc Hà", price=370000), product(2, "Bạc Hà", factory="VIPSEN", price=260000),
                        product(3, "Hoa Lài", factory="VIPSEN"), product(4, "Bạc Hà", factory="VIPSEN", volume=50)]
        response = model_json({"message": "Có lựa chọn ở xưởng bạn vừa hỏi.", "selections": [{"id": 2}]})
        history = [{"role": "user", "content": "Bạc hà Labcos 10ml dưới 400k"}]
        with patch.object(rag, "model_request", return_value=response) as model:
            _, cards = await rag.ask_question("Còn VIPSEN thì sao?", history)
        self.assertEqual([2], [p["id"] for p in cards])
        payload = json.loads(model.call_args.args[1]["messages"][-1]["content"])
        self.assertEqual([2], [p["id"] for p in payload["products"]])

    async def test_unavailable_named_scent_never_uses_other_scents_as_substitutes(self):
        with patch.object(rag, "semantic_rerank", AsyncMock()) as semantic:
            result = await rag.retrieve_advice_candidates("hoa hồng Labcos 10ml dưới 300k", self.catalog, self.factories[0])
        self.assertEqual([], result)
        semantic.assert_not_awaited()

    async def test_light_embedding_model_keeps_chat_model_loaded(self):
        rag._embedding_cache.clear()
        async def respond(url, body, timeout):
            self.assertTrue(url.endswith("/api/embed"))
            return {"embeddings": [[1.0, 0.5] for _ in body["input"]]}
        with patch.object(rag.config, "EMBEDDING_MODEL", "embeddinggemma:300m-qat-q8_0"), \
                patch.object(rag, "model_request", side_effect=respond) as request:
            ranked = await rag.semantic_rerank("ấm cúng", [product(1, "Hoa Lài")], 1)
        self.assertEqual([1], [p["id"] for p in ranked])
        self.assertEqual(1, request.call_count)
        self.assertTrue(request.call_args.args[1]["input"][0].startswith("task: search result | query:"))

    async def test_document_vectors_survive_ram_reset_but_query_and_prices_are_not_persisted(self):
        async def respond(url, body, timeout):
            return {"embeddings": [[1.0, 0.5] for _ in body["input"]]}
        with tempfile.TemporaryDirectory() as directory, \
                patch.object(rag.config, "EMBEDDING_CACHE_PATH", str(Path(directory) / "vectors.sqlite3")), \
                patch.object(rag.config, "EMBEDDING_MODEL", "embeddinggemma:300m-qat-q8_0"), \
                patch.object(rag, "model_request", side_effect=respond) as request:
            original = {**product(1, "Hoa Lài"), "price": 200000}
            await rag.semantic_rerank("không gian ấm cúng", [original], 1)
            rag._embedding_cache.clear()
            updated = {**original, "price": 350000}
            result = await rag.semantic_rerank("không gian dịu nhẹ", [updated], 1)
            self.assertEqual(2, request.call_count)
            # Lượt sau chỉ tạo vector câu hỏi mới, lấy vector tài liệu từ SQLite.
            self.assertEqual(1, len(request.call_args.args[1]["input"]))
            self.assertTrue(request.call_args.args[1]["input"][0].startswith("task: search result | query:"))
            self.assertEqual(350000, result[0]["price"])


if __name__ == "__main__":
    unittest.main()
