"""HTTP bất đồng bộ để hủy hội thoại cũng hủy yêu cầu suy luận tới Ollama."""
import asyncio
import inspect


async def model_request(url, payload=None, timeout=90):
    import httpx

    async with httpx.AsyncClient(timeout=httpx.Timeout(timeout, connect=5), trust_env=False) as client:
        try:
            response = await client.post(url, json=payload) if payload is not None else await client.get(url)
            response.raise_for_status()
            return response.json()
        except httpx.HTTPError as exc:
            raise OSError("Model service is unavailable") from exc


async def call_request(request, url, payload=None, timeout=90):
    # Request đồng bộ giả lập giúp kiểm thử mà không cần khởi động Ollama.
    if inspect.iscoroutinefunction(request):
        return await request(url, payload, timeout)
    return await asyncio.to_thread(request, url, payload, timeout)
