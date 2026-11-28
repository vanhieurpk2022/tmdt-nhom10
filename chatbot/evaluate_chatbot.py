"""So sánh model bằng cùng câu hỏi tiếng Việt và dữ liệu xưởng hiện tại.

Chạy: python -B evaluate_chatbot.py --model qwen2.5:3b --model qwen3:1.7b
Không tải model, không ghi đơn hàng và không tạo chỉ mục trên đĩa.
"""
import argparse
import asyncio
import json
import time

from app import config, rag
from app.conversation import ADVICE_UNAVAILABLE, plan_question
from app.transport import model_request


async def evaluate(models):
    factories = await rag.load_factories()
    labcos = next(f for f in factories if rag.normalize(f["name"]) == "labcos")
    vipsen = next(f for f in factories if rag.normalize(f["name"]) == "vipsen")
    history = [{"role": "user", "content": "Tìm bạc hà Labcos 10ml dưới 400k"},
               {"role": "assistant", "content": "Bạc Hà Labcos 10ml: 370.000đ."}]
    cases = [
        ("opening", "Mình mới tìm hiểu tinh dầu, tư vấn giúp mình với", [], {"clarify"}, None, None),
        ("count", "Xưởng Labcos hiện có tất cả bao nhiêu sản phẩm?", [], {"product_count"}, labcos["id"], None),
        ("rank", "Xưởng nào đang có nhiều sản phẩm nhất?", [], {"factory_rank"}, None, None),
        ("stock", "Bạc hà Labcos 10ml còn bao nhiêu chai?", [], {"stock"}, labcos["id"], None),
        ("price", "Giá bạc hà Labcos bao nhiêu?", [], {"detail"}, labcos["id"], None),
        ("number", "Gợi ý 5 sản phẩm bạc hà dưới 500k", [], {"recommend", "advice"}, None, 5),
        ("unknown", "Xưởng Không Hề Tồn Tại có những sản phẩm nào?", [], {"clarify"}, None, None),
        ("followup", "Còn bên VIPSEN thì sao?", history, {"recommend", "advice", "product_list"}, vipsen["id"], None),
    ]
    for model in models:
        config.LLM_MODEL = model
        passed, durations = 0, []
        for name, question, context, operations, factory_id, count in cases:
            start = time.monotonic()
            try:
                plan = await asyncio.wait_for(plan_question(question, context, factories, model_request), config.CHAT_TIMEOUT)
                valid = plan.operation in operations
                if factory_id is not None:
                    valid &= plan.factory_id == factory_id
                if count is not None:
                    valid &= plan.limit == count
                detail = {"operation": plan.operation, "query": plan.query,
                          "factory_id": plan.factory_id, "limit": plan.limit, "message": plan.message}
            except (OSError, ValueError, KeyError, TimeoutError) as exc:
                valid, detail = False, {"error": type(exc).__name__, "detail": str(exc)}
            duration = time.monotonic() - start
            durations.append(duration)
            passed += bool(valid)
            print(json.dumps({"model": model, "case": name, "passed": bool(valid),
                              "seconds": round(duration, 2), "plan": detail}, ensure_ascii=True), flush=True)
        print(json.dumps({"summary": model, "passed": passed, "total": len(cases),
                          "average_seconds": round(sum(durations) / len(durations), 2)}), flush=True)


async def evaluate_consultation(models):
    all_passed = True
    for model in models:
        config.LLM_MODEL = model
        passed, durations, history = 0, [], []
        cases = [
            ("opening", "Mình mới tìm hiểu tinh dầu, bạn tư vấn giúp mình với", "empty"),
            ("specific", "Tôi muốn mùi bạc hà để xông phòng, chai 10ml của Labcos, ngân sách 400k", "labcos"),
            ("followup", "Còn VIPSEN thì sao?", "vipsen"),
            ("five", "Gợi ý 5 loại bạc hà 10ml dưới 1 triệu", "five"),
            ("sleep", "muốn hỏi bạn là sản phẩm nào giúp dễ ngủ", "need"),
            ("legacy_ack", "ừ", "need"),
        ]
        for name, question, expected in cases:
            if name in ("five", "sleep"):
                history = []
            if name == "legacy_ack":
                history = [{"role": "user", "content": "muốn hỏi bạn là sản phẩm nào giúp dễ ngủ"},
                           {"role": "assistant", "content": "Bạn muốn tìm sản phẩm nào giúp dễ ngủ?"},
                           {"role": "user", "content": "ừ"},
                           {"role": "assistant", "content": "Bạn có thể muốn tìm sản phẩm nào giúp dễ ngủ?"}]
            start = time.monotonic()
            try:
                reply, products = await asyncio.wait_for(rag.ask_question(question, history), config.CHAT_TIMEOUT)
                valid = bool(reply) and "chưa hoàn tất" not in reply and ADVICE_UNAVAILABLE not in reply
                if expected == "empty":
                    valid &= not products and "?" in reply and len(reply) > 15
                if expected in ("labcos", "vipsen"):
                    valid &= bool(products) and all(rag.normalize(p["factoryName"]) == expected
                        and p["volumeMl"] == 10 and p["price"] <= 400000 for p in products)
                if expected == "five":
                    valid &= len(products) == 5 and all("bac ha" in rag.normalize(p["name"])
                        and p["volumeMl"] == 10 and p["price"] <= 1000000 for p in products)
                if expected == "need":
                    valid &= bool(products) and "Bạn muốn tìm sản phẩm nào" not in reply
                detail = {"reply": reply, "ids": [p["id"] for p in products]}
                history = (history + [{"role": "user", "content": question}, {"role": "assistant", "content": reply}])[-8:]
            except (OSError, ValueError, KeyError, TimeoutError) as exc:
                valid, detail = False, {"error": type(exc).__name__, "detail": str(exc)}
            duration = time.monotonic() - start
            durations.append(duration)
            passed += bool(valid)
            print(json.dumps({"model": model, "case": name, "passed": bool(valid),
                              "seconds": round(duration, 2), "answer": detail}, ensure_ascii=True), flush=True)
        print(json.dumps({"summary": model, "passed": passed, "total": len(cases),
                          "average_seconds": round(sum(durations) / len(durations), 2)}), flush=True)
        all_passed &= passed == len(cases)
    return all_passed


if __name__ == "__main__":
    import sys
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--model", action="append", required=True)
    parser.add_argument("--backend", default="http://localhost:8080")
    parser.add_argument("--ollama", default="http://localhost:11434")
    parser.add_argument("--mode", choices=["plan", "consult"], default="plan")
    args = parser.parse_args()
    config.CATALOG_URL = args.backend.rstrip("/") + "/products/chatbot-catalog"
    config.OLLAMA_BASE_URL = args.ollama.rstrip("/")
    if args.mode == "consult":
        raise SystemExit(0 if asyncio.run(evaluate_consultation(args.model)) else 1)
    asyncio.run(evaluate(args.model))
