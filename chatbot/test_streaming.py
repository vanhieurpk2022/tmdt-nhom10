import asyncio
import json
import unittest
from unittest.mock import patch

import httpx

from app.events import chat_events
from app.progress import progress_callback, report_progress
from app.transport import model_request


class StreamTests(unittest.IsolatedAsyncioTestCase):
    async def test_progress_precedes_validated_result(self):
        async def answer():
            report_progress("searching")
            report_progress("writing")
            return {"reply": "Đã tìm thấy sản phẩm.", "products": []}
        events = [json.loads(line) async for line in chat_events(answer)]
        self.assertEqual(["status", "status", "status", "result"], [e["type"] for e in events])
        self.assertEqual("Đã tìm thấy sản phẩm.", events[-1]["reply"])
        self.assertIsNone(progress_callback.get())

    async def test_closing_stream_cancels_inference_worker(self):
        stopped = asyncio.Event()
        async def answer():
            try:
                report_progress("writing")
                await asyncio.Event().wait()
            finally:
                stopped.set()
        stream = chat_events(answer)
        await anext(stream)
        self.assertEqual("writing", json.loads(await anext(stream))["phase"])
        await stream.aclose()
        self.assertTrue(stopped.is_set())

    async def test_error_is_an_explicit_event_without_leaking_internal_message(self):
        async def answer():
            raise RuntimeError("internal details")
        with self.assertLogs("app.events", level="ERROR"):
            events = [json.loads(line) async for line in chat_events(answer)]
        self.assertEqual("error", events[-1]["type"])
        self.assertNotIn("internal details", events[-1]["detail"])

    async def test_progress_is_isolated_between_conversations(self):
        async def collect(phase):
            async def answer():
                await asyncio.sleep(0)
                report_progress(phase)
                return {"reply": phase, "products": []}
            return [json.loads(line) async for line in chat_events(answer)]
        first, second = await asyncio.gather(collect("searching"), collect("writing"))
        self.assertEqual("searching", first[1]["phase"])
        self.assertEqual("writing", second[1]["phase"])


class TransportTests(unittest.IsolatedAsyncioTestCase):
    async def test_cancel_closes_http_response_instead_of_leaving_model_running(self):
        started, closed = asyncio.Event(), asyncio.Event()
        class Body(httpx.AsyncByteStream):
            async def __aiter__(self):
                started.set()
                await asyncio.Event().wait()
                yield b'{}'
            async def aclose(self):
                closed.set()
        transport = httpx.MockTransport(lambda request: httpx.Response(200, stream=Body()))
        client_class = httpx.AsyncClient
        with patch("httpx.AsyncClient", side_effect=lambda **kw: client_class(transport=transport, **kw)):
            task = asyncio.create_task(model_request("http://model/api/chat", {"model": "test"}))
            await asyncio.wait_for(started.wait(), 1)
            task.cancel()
            with self.assertRaises(asyncio.CancelledError):
                await task
        self.assertTrue(closed.is_set())

    async def test_model_connection_error_has_a_stable_public_error(self):
        def offline(request):
            raise httpx.ConnectError("private internal endpoint")
        transport = httpx.MockTransport(offline)
        client_class = httpx.AsyncClient
        with patch("httpx.AsyncClient", side_effect=lambda **kw: client_class(transport=transport, **kw)):
            with self.assertRaisesRegex(OSError, "Model service is unavailable"):
                await model_request("http://model/api/chat", {})


if __name__ == "__main__":
    unittest.main()
