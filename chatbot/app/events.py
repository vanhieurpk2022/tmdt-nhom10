"""Luồng tiến trình chỉ gửi câu trả lời sau khi đã kiểm tra đầy đủ dữ liệu."""
import asyncio
import json
import logging

from app.progress import progress_callback

logger = logging.getLogger(__name__)


async def chat_events(answer):
    queue = asyncio.Queue()

    async def produce():
        token = progress_callback.set(queue.put_nowait)
        try:
            result = await answer()
            queue.put_nowait({"type": "result", **result})
        except asyncio.CancelledError:
            raise
        except Exception:
            logger.exception("Không hoàn tất luồng hội thoại")
            queue.put_nowait({"type": "error", "detail": "Chưa lấy được câu trả lời. Bạn thử lại sau nhé."})
        finally:
            progress_callback.reset(token)

    task = asyncio.create_task(produce())
    try:
        yield json.dumps({"type": "status", "phase": "understanding"}) + "\n"
        while True:
            try:
                event = await asyncio.wait_for(queue.get(), timeout=10)
            except TimeoutError:
                event = {"type": "ping"}
            yield json.dumps(event, ensure_ascii=False) + "\n"
            if event["type"] in ("result", "error"):
                break
    finally:
        task.cancel()
        await asyncio.gather(task, return_exceptions=True)
