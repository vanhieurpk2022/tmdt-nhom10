import unittest
from unittest.mock import AsyncMock, patch
from app import rag


def product(identifier, name, factory="Labcos", price=200000, volume=10, stock=5):
    return {"id": identifier, "name": name, "factoryName": factory, "category": "Tinh dầu",
            "description": "Nguyên liệu tinh dầu", "imageUrl": "/image.png", "link": f"/product-detail/{identifier}",
            "variants": [{"id": identifier * 10, "mil": volume, "price": price, "stockQuantity": stock, "isActive": True}]}


class RetrievalTests(unittest.TestCase):
    def test_need_question_routes_to_consultation_rather_than_catalog_listing(self):
        question = "muốn hỏi bạn là sản phẩm nào giúp dễ ngủ"
        self.assertEqual("recommend", rag.question_intent(question))
        self.assertEqual({"ngu ngon"}, rag.need_keys(rag.normalize(question)))
        self.assertEqual("product_count", rag.question_intent("Labcos có bao nhiêu sản phẩm cho giấc ngủ?"))

    def test_acknowledgement_recovers_the_original_need_from_a_broken_conversation(self):
        question = "muốn hỏi bạn là sản phẩm nào giúp dễ ngủ"
        history = [{"role": "user", "content": question},
                   {"role": "assistant", "content": "Bạn muốn tìm sản phẩm nào giúp dễ ngủ?"},
                   {"role": "user", "content": "ừ"},
                   {"role": "assistant", "content": "Bạn có thể muốn tìm sản phẩm nào giúp dễ ngủ?"}]
        self.assertEqual(question, rag.effective_question("ừ", history))
        self.assertEqual("ừ", rag.effective_question("ừ", []))

    def test_sleep_need_alias_filters_the_same_candidates_as_the_existing_need(self):
        catalog = [product(1, "Oải Hương"), product(2, "Bạc Hà"), product(3, "Đàn Hương")]
        self.assertEqual([1, 3], [p["id"] for p in rag.select_products("sản phẩm nào cho phòng dễ ngủ", catalog)])

    def test_unknown_scent_is_not_replaced_by_arbitrary_products_from_the_requested_factory(self):
        result = rag.select_products("vani Labcos 10ml dưới 300k", [product(1, "Bạc Hà"), product(2, "Chanh")])
        self.assertEqual([], result)

    def test_only_excluding_a_scent_keeps_other_available_products(self):
        result = rag.select_products("không thích bạc hà", [product(1, "Bạc Hà"), product(2, "Chanh")], allow_all=True)
        self.assertEqual([2], [p["id"] for p in result])

    def test_accent_insensitive_and_compound_scents(self):
        self.assertEqual({"sa chanh"}, rag.scent_keys(rag.normalize("Tinh dầu Sả Chanh")))
        self.assertEqual({"hoa lai"}, rag.scent_keys("jasmine"))

    def test_budget_does_not_treat_volume_as_money(self):
        self.assertEqual((None, 250000), rag.budget("Bạc hà 50ml dưới 250k"))
        self.assertEqual((200000, 500000), rag.budget("từ 200.000đ đến 500.000đ"))
        self.assertEqual((None, 1500000), rag.budget("ngân sách 1,5 triệu"))
        self.assertEqual((None, None), rag.budget("Liệt kê 1000 sản phẩm"))

    def test_budget_direction_is_local_to_the_amount(self):
        self.assertEqual((None, 300000), rag.budget("đặt trên bàn, ngân sách dưới 300k"))
        self.assertEqual((300000, None), rag.budget("ngân sách tối thiểu 300k"))
        self.assertEqual((300000, 300000), rag.budget("giá đúng 300k"))
        self.assertEqual((200000, 500000), rag.budget("khoảng 200k - 500k cho 5 sản phẩm 10ml"))

    def test_emotion_is_not_mistaken_for_orange(self):
        self.assertEqual(set(), rag.scent_keys("cam giac am cung"))
        self.assertEqual({"cam"}, rag.scent_keys("cam ngot"))

    def test_followup_uses_latest_volume_and_new_budget_across_several_turns(self):
        history = [{"role": "user", "content": "Bạc hà Labcos 10ml dưới 400k"},
                   {"role": "assistant", "content": "Bạn cần chai lớn hơn không?"},
                   {"role": "user", "content": "Chuyển sang 50ml"}]
        catalog = [product(1, "Bạc Hà", volume=10), product(2, "Bạc Hà", volume=50, price=920000),
                   product(3, "Bạc Hà", volume=50, factory="VIPSEN")]
        query = rag.effective_question("Tăng ngân sách lên 1 triệu", history, catalog)
        self.assertEqual([2], [p["id"] for p in rag.select_products(query, catalog)])

    def test_acknowledgement_keeps_updated_volume_and_budget(self):
        history = [{"role": "user", "content": "Gợi ý oải hương Labcos 10ml dưới 300k"},
                   {"role": "assistant", "content": "Bạn muốn đổi sang chai lớn không?"},
                   {"role": "user", "content": "50ml dưới 1 triệu"},
                   {"role": "assistant", "content": "Bạn đang muốn tìm chai lớn hơn đúng không?"}]
        catalog = [product(1, "Oải Hương", volume=10), product(2, "Oải Hương", volume=50, price=900000),
                   product(3, "Oải Hương", volume=50, price=1200000)]
        query = rag.effective_question("vâng", history, catalog)
        self.assertEqual([2], [p["id"] for p in rag.select_products(query, catalog)])

    def test_filters_factory_volume_price_and_stock_before_ranking(self):
        catalog = [product(1, "Bạc Hà", price=260000), product(2, "Bạc Hà", factory="VIPSEN"),
                   product(3, "Bạc Hà", stock=0), product(4, "Bạc Hà", volume=50), product(5, "Bạc Hà")]
        result = rag.select_products("Bạc hà Labcos 10ml dưới 250k", catalog)
        self.assertEqual([5], [p["id"] for p in result])

    def test_does_not_recommend_unrelated_scent(self):
        self.assertEqual([], rag.select_products("tinh dầu hoa hồng", [product(1, "Tinh dầu Bạc Hà")]))

    def test_no_mint_in_lemongrass_result(self):
        result = rag.select_products("sả chanh", [product(1, "Sả Chanh"), product(2, "Chanh")])
        self.assertEqual([1], [p["id"] for p in result])

    def test_negated_scent_is_excluded(self):
        result = rag.select_products("thanh mát không thích bạc hà", [product(1, "Bạc Hà"), product(2, "Sả Chanh")])
        self.assertEqual([2], [p["id"] for p in result])

    def test_cheaper_followup_uses_previous_displayed_price(self):
        history = [{"role": "user", "content": "Bạc Hà Labcos"},
                   {"role": "assistant", "content": "Bạc Hà · 300.000đ"}]
        catalog = [product(1, "Bạc Hà", price=300000), product(2, "Bạc Hà", price=250000),
                   product(3, "Bạc Hà", factory="VIPSEN", price=200000)]
        result = rag.select_products(rag.effective_question("loại rẻ hơn", history, catalog), catalog)
        self.assertEqual([2], [p["id"] for p in result])

    def test_followup_inherits_topic_but_uses_new_budget(self):
        history = [{"role": "user", "content": "Bạc hà dưới 500k"}]
        question = rag.effective_question("loại đó dưới 250k", history)
        result = rag.select_products(question, [product(1, "Bạc Hà", price=300000), product(2, "Bạc Hà")])
        self.assertEqual([2], [p["id"] for p in result])


class ChatTests(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        self.factories_setting = patch.object(rag, "load_factories", AsyncMock(return_value=[
            {"id": 1, "name": "Labcos", "factoryStatus": "ACTIVE"},
            {"id": 2, "name": "VIPSEN", "factoryStatus": "ACTIVE"},
            {"id": 3, "name": "Mộc Mới", "factoryStatus": "ACTIVE"},
        ]))
        self.factories_setting.start()
        self.models_setting = patch.object(rag, "installed_models", AsyncMock(return_value=set()))
        self.models_setting.start()

    async def asyncTearDown(self):
        self.factories_setting.stop()
        self.models_setting.stop()

    async def test_factory_count_uses_all_products_not_top_three_or_eight(self):
        catalog = [product(i, f"Tinh dầu thử {i}") for i in range(1, 16)]
        catalog.append(product(99, "Sản phẩm khác", factory="VIPSEN"))
        with patch.object(rag, "load_catalog", AsyncMock(return_value=catalog)) as loader:
            reply, cards = await rag.ask_question("xưởng labcos có bao nhiêu sản phẩm")
        self.assertIn("**15 sản phẩm**", reply)
        self.assertIn("**15 sản phẩm còn hàng**", reply)
        self.assertEqual([], cards)
        loader.assert_awaited_once_with(include_unavailable=True)

    async def test_explicit_facts_are_calculated_without_waiting_for_the_model(self):
        with patch.object(rag, "load_catalog", AsyncMock(return_value=[product(1, "Bạc Hà"), product(2, "Chanh")])), patch.object(rag, "model_request", AsyncMock()) as model:
            reply, cards = await rag.ask_question("Xưởng Labcos hiện có tất cả bao nhiêu sản phẩm?")
        self.assertIn("**2 sản phẩm**", reply)
        self.assertEqual([], cards)
        model.assert_not_awaited()

    async def test_listing_large_requested_count_still_caps_display_at_twelve(self):
        with patch.object(rag, "load_catalog", AsyncMock(return_value=[product(i, f"Mùi {i}") for i in range(1, 31)])):
            reply, cards = await rag.ask_question("Liệt kê 1000 sản phẩm của Labcos")
        self.assertEqual(12, len(cards))
        self.assertIn("30 sản phẩm", reply)

    async def test_cheapest_product_is_computed_from_actual_matching_variants(self):
        catalog = [product(1, "Bạc Hà", price=300000), product(2, "Bạc Hà", factory="VIPSEN", price=200000),
                   product(3, "Hoa Lài", price=100000), product(4, "Bạc Hà", price=50000, stock=0)]
        with patch.object(rag, "load_catalog", AsyncMock(return_value=catalog)):
            reply, cards = await rag.ask_question("Bạc hà ở đâu rẻ nhất?")
        self.assertEqual([2], [p["id"] for p in cards])
        self.assertIn("200.000đ", reply)

    async def test_counts_product_once_and_separates_sold_out_products(self):
        available = product(1, "Bạc Hà")
        available["variants"].append({"id": 11, "mil": 50, "price": 500000, "stockQuantity": 2, "isActive": True})
        catalog = [available, product(2, "Hoa Lài", stock=0), product(3, "Chanh", factory="VIPSEN")]
        with patch.object(rag, "load_catalog", AsyncMock(return_value=catalog)):
            reply, cards = await rag.ask_question("Labcos có bao nhiêu sản phẩm?")
        self.assertIn("**2 sản phẩm**", reply)
        self.assertIn("**1 sản phẩm còn hàng**", reply)
        self.assertEqual([], cards)

    async def test_total_count_without_factory_counts_the_full_public_catalog(self):
        catalog = [product(i, f"Tinh dầu thử {i}") for i in range(1, 22)]
        catalog.append({**product(22, "Chưa có dung tích"), "variants": []})
        with patch.object(rag, "load_catalog", AsyncMock(return_value=catalog)):
            reply, cards = await rag.ask_question("Hệ thống hiện có tổng cộng bao nhiêu sản phẩm?")
        self.assertIn("**22 sản phẩm**", reply)
        self.assertIn("**21 sản phẩm còn hàng**", reply)
        self.assertEqual([], cards)

    async def test_count_applies_budget_scent_volume_and_stock_filters(self):
        catalog = [product(1, "Bạc Hà"), product(2, "Bạc Hà", price=350000), product(3, "Bạc Hà", volume=50),
                   product(4, "Bạc Hà", stock=0), product(5, "Hoa Lài")]
        with patch.object(rag, "load_catalog", AsyncMock(return_value=catalog)):
            reply, _ = await rag.ask_question("Labcos có bao nhiêu sản phẩm bạc hà 10ml dưới 300k còn hàng?")
        self.assertIn("**1 sản phẩm**", reply)

    async def test_counts_sold_out_products_when_explicitly_requested(self):
        with patch.object(rag, "load_catalog", AsyncMock(return_value=[product(1, "Bạc Hà"), product(2, "Chanh", stock=0)])):
            reply, cards = await rag.ask_question("Xưởng Labcos có bao nhiêu sản phẩm hết hàng?")
        self.assertIn("**1 sản phẩm**", reply)
        self.assertEqual([], cards)

    async def test_empty_factory_returns_zero_without_counting_other_factories(self):
        with patch.object(rag, "load_catalog", AsyncMock(return_value=[product(1, "Bạc Hà")])):
            reply, cards = await rag.ask_question("Xưởng Mộc Mới có bao nhiêu sản phẩm?")
        self.assertIn("**0 sản phẩm**", reply)
        self.assertIn("Mộc Mới", reply)
        self.assertEqual([], cards)

    async def test_unknown_factory_asks_for_a_name_instead_of_counting_everything(self):
        with patch.object(rag, "load_catalog", AsyncMock(return_value=[product(1, "Bạc Hà")])):
            reply, cards = await rag.ask_question("Xưởng Không Tồn Tại có bao nhiêu sản phẩm?")
        self.assertIn("chưa xác định được xưởng", reply)
        self.assertEqual([], cards)

    async def test_factory_count_includes_an_active_factory_without_products(self):
        with patch.object(rag, "load_catalog", AsyncMock(return_value=[product(1, "Bạc Hà")])):
            reply, cards = await rag.ask_question("Có bao nhiêu xưởng sản xuất?")
        self.assertIn("3 xưởng", reply)
        self.assertEqual([], cards)

    async def test_factory_listing_includes_the_empty_factory(self):
        with patch.object(rag, "load_catalog", AsyncMock(return_value=[product(1, "Bạc Hà")])):
            reply, cards = await rag.ask_question("Danh sách các xưởng sản xuất")
        self.assertIn("Mộc Mới", reply)
        self.assertEqual([], cards)

    async def test_count_followup_switches_to_the_new_factory(self):
        history = [{"role": "user", "content": "Xưởng Labcos có bao nhiêu sản phẩm?"}]
        catalog = [product(1, "Bạc Hà"), product(2, "Chanh"), product(3, "Hoa Lài", factory="VIPSEN")]
        with patch.object(rag, "load_catalog", AsyncMock(return_value=catalog)):
            reply, cards = await rag.ask_question("Còn VIPSEN thì sao?", history)
        self.assertIn("**1 sản phẩm**", reply)
        self.assertIn("VIPSEN", reply)
        self.assertEqual([], cards)

    async def test_factory_reference_uses_the_previous_user_question(self):
        history = [{"role": "user", "content": "Tìm bạc hà Labcos"}]
        with patch.object(rag, "load_catalog", AsyncMock(return_value=[product(1, "Bạc Hà"), product(2, "Chanh")])):
            reply, _ = await rag.ask_question("Xưởng đó có bao nhiêu sản phẩm?", history)
        self.assertIn("**2 sản phẩm**", reply)
        self.assertIn("Labcos", reply)

    async def test_inventory_question_counts_bottles_not_products(self):
        item = product(1, "Bạc Hà", stock=5)
        item["variants"].append({"id": 11, "mil": 50, "price": 900000, "stockQuantity": 2, "isActive": True})
        with patch.object(rag, "load_catalog", AsyncMock(return_value=[item])):
            reply, cards = await rag.ask_question("Bạc hà Labcos còn bao nhiêu chai?")
        self.assertIn("**7 chai**", reply)
        self.assertIn("10ml: 5 chai", reply)
        self.assertIn("50ml: 2 chai", reply)
        self.assertEqual([], cards)

    async def test_price_question_is_not_misclassified_as_product_count(self):
        item = product(1, "Bạc Hà")
        item["variants"].append({"id": 11, "mil": 50, "price": 900000, "stockQuantity": 2, "isActive": True})
        with patch.object(rag, "load_catalog", AsyncMock(return_value=[item])):
            reply, cards = await rag.ask_question("Giá bạc hà Labcos bao nhiêu?")
        self.assertIn("200.000đ", reply)
        self.assertIn("900.000đ", reply)
        self.assertEqual([], cards)

    async def test_listing_is_not_truncated_to_three_recommendations(self):
        catalog = [product(i, f"Tinh dầu thử {i}") for i in range(1, 21)]
        with patch.object(rag, "load_catalog", AsyncMock(return_value=catalog)):
            reply, cards = await rag.ask_question("Liệt kê tất cả sản phẩm của Labcos")
        self.assertIn("**20 sản phẩm**", reply)
        self.assertEqual(12, len(cards))
        self.assertIn("Xem thêm sản phẩm", reply)

    async def test_recommendation_uses_the_number_requested_by_the_user(self):
        catalog = [product(i, "Bạc Hà") for i in range(1, 11)]
        with patch.object(rag, "load_catalog", AsyncMock(return_value=catalog)):
            _, cards = await rag.ask_question("Gợi ý 5 sản phẩm bạc hà Labcos")
        self.assertEqual(5, len(cards))

    async def test_statistical_answers_use_fresh_catalog_each_time(self):
        with patch.object(rag, "load_catalog", AsyncMock(side_effect=[[product(1, "Bạc Hà")], [product(1, "Bạc Hà"), product(2, "Chanh")]])):
            first, _ = await rag.ask_question("Labcos có bao nhiêu sản phẩm?")
            second, _ = await rag.ask_question("Labcos có bao nhiêu sản phẩm?")
        self.assertIn("**1 sản phẩm**", first)
        self.assertIn("**2 sản phẩm**", second)

    async def test_thanks_does_not_trigger_product_recommendations(self):
        with patch.object(rag, "load_catalog", AsyncMock(side_effect=AssertionError("unexpected"))):
            _, cards = await rag.ask_question("Cảm ơn bạn")
        self.assertEqual([], cards)

    async def test_price_followup_accepts_a_factory_name_without_recommending_random_products(self):
        history = [{"role": "user", "content": "Giá bạc hà bao nhiêu?"}]
        catalog = [product(1, "Bạc Hà"), product(2, "Hoa Lài"), product(3, "Bạc Hà", factory="VIPSEN", price=300000)]
        with patch.object(rag, "load_catalog", AsyncMock(return_value=catalog)):
            reply, cards = await rag.ask_question("VIPSEN", history)
        self.assertIn("300.000đ", reply)
        self.assertNotIn("Hoa Lài", reply)
        self.assertEqual([], cards)

    async def test_factory_count_with_stock_filter_excludes_a_sold_out_factory(self):
        catalog = [product(1, "Bạc Hà"), product(2, "Bạc Hà", factory="VIPSEN", stock=0)]
        with patch.object(rag, "load_catalog", AsyncMock(return_value=catalog)):
            reply, cards = await rag.ask_question("Có bao nhiêu xưởng có bạc hà còn hàng?")
        self.assertIn("1 xưởng", reply)
        self.assertEqual([], cards)

    async def test_prices_and_links_come_from_current_catalog(self):
        catalog = [product(1, "Tinh dầu Bạc Hà")]
        with patch.object(rag, "load_catalog", AsyncMock(return_value=catalog)), patch.object(rag.config, "LLM_ENABLED", False):
            reply, cards = await rag.ask_question("Bạc Hà")
            self.assertIn("200.000đ", reply)
            self.assertEqual("/product-detail/1", cards[0]["link"])
            catalog[0]["variants"][0]["price"] = 230000
            reply, cards = await rag.ask_question("Bạc Hà")
            self.assertIn("230.000đ", reply)
            self.assertEqual(230000, cards[0]["price"])
            catalog[0]["variants"][0]["stockQuantity"] = 0
            _, cards = await rag.ask_question("Bạc Hà")
            self.assertEqual([], cards)


    async def test_general_question_does_not_require_catalog(self):
        with patch.object(rag, "load_catalog", AsyncMock(side_effect=AssertionError("unexpected"))):
            reply, products = await rag.ask_question("Tư vấn giúp tôi")
        self.assertIn("tư vấn AI hiện chưa sẵn sàng", reply)
        self.assertEqual([], products)

    async def test_backend_down_does_not_fall_back_to_sample_sql(self):
        with patch.object(rag, "json_request", side_effect=OSError("offline")):
            with self.assertRaises(rag.CatalogUnavailable):
                await rag.ask_question("Tìm bạc hà")

    async def test_greeting_does_not_require_backend(self):
        with patch.object(rag, "load_catalog", AsyncMock(side_effect=AssertionError("unexpected"))):
            reply, products = await rag.ask_question("Xin chào")
        self.assertIn("Chào", reply)
        self.assertEqual([], products)

    async def test_shipping_answer_does_not_invent_fees(self):
        reply, products = await rag.ask_question("Chính sách giao hàng")
        self.assertNotIn("500.000", reply)
        self.assertNotIn("Freeship", reply)
        self.assertEqual([], products)


if __name__ == "__main__":
    unittest.main()
