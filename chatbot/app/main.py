import asyncio
import logging
from collections import OrderedDict, deque
from time import monotonic

from fastapi import FastAPI, HTTPException, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse

from app import config
from app.events import chat_events
from app.schemas import ChatRequest, ChatResponse, HealthResponse, ProductItem
from app.rag import CatalogUnavailable, ask_question, json_request, load_catalog, lookup_products, installed_models, has_model

logger = logging.getLogger(__name__)
app = FastAPI(title="Oilia Assistant", version="2.0.0")
app.add_middleware(CORSMiddleware, allow_origins=config.ALLOWED_ORIGINS,
                   allow_credentials=False, allow_methods=["GET", "POST"], allow_headers=["Content-Type"])
_clients = OrderedDict()


@app.middleware("http")
async def limit_chat_requests(request: Request, call_next):
    if request.method == "POST" and request.url.path.startswith("/api/chat"):
        address = request.client.host if request.client else "unknown"
        now = monotonic()
        timestamps = _clients.setdefault(address, deque())
        _clients.move_to_end(address)
        while timestamps and now - timestamps[0] > 60:
            timestamps.popleft()
        if len(timestamps) >= 30:
            return JSONResponse(status_code=429, content={"detail": "Bạn gửi hơi nhanh. Vui lòng thử lại sau một phút."})
        timestamps.append(now)
        if len(_clients) > 1024:
            _clients.popitem(last=False)
    return await call_next(request)


@app.exception_handler(CatalogUnavailable)
async def catalog_error(request: Request, exc: CatalogUnavailable):
    return JSONResponse(status_code=503, content={"detail": str(exc)})


@app.get("/")
async def root():
    return {"message": "Oilia Assistant", "health_check": "/health"}


@app.get("/health", response_model=HealthResponse)
async def health():
    async def catalog_status():
        try:
            return True, len(await load_catalog())
        except CatalogUnavailable:
            return False, 0

    async def model_status():
        names = await installed_models()
        return config.LLM_ENABLED and has_model(names, config.LLM_MODEL), has_model(names, config.EMBEDDING_MODEL)

    (ready, count), (chat_ready, embedding_ready) = await asyncio.gather(catalog_status(), model_status())
    body = HealthResponse(status=("ok" if chat_ready else "limited") if ready else "degraded", catalog_ready=ready,
                          catalog_count=count, model_ready=chat_ready,
                          chat_model_ready=chat_ready, embedding_model_ready=embedding_ready)
    return JSONResponse(status_code=200 if ready else 503, content=body.model_dump())


@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    reply, products = await ask_question(request.message, [m.model_dump() for m in request.history])
    return ChatResponse(reply=reply, products=[ProductItem(**p) for p in products])


@app.post("/api/chat/stream")
async def stream(request: ChatRequest):
    # Xử lý trước khi gửi headers để lỗi BE trả 503, không thành stream rỗng 200.
    reply, _ = await ask_question(request.message, [m.model_dump() for m in request.history])

    async def chunks():
        for line in reply.splitlines(keepends=True):
            yield line

    return StreamingResponse(chunks(), media_type="text/plain; charset=utf-8")


@app.post("/api/chat/events")
async def events(request: ChatRequest):
    async def answer():
        try:
            reply, products = await ask_question(request.message, [m.model_dump() for m in request.history])
            return ChatResponse(reply=reply, products=[ProductItem(**p) for p in products]).model_dump()
        except CatalogUnavailable as exc:
            return {"reply": str(exc), "products": []}

    return StreamingResponse(chat_events(answer), media_type="application/x-ndjson",
                             headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"})


@app.get("/api/products/lookup", response_model=list[ProductItem])
async def lookup(ids: str = Query(max_length=200)):
    parts = ids.split(",")
    if len(parts) > 12 or any(not p.strip().isdigit() for p in parts):
        raise HTTPException(422, "Danh sách ID không hợp lệ")
    return await lookup_products({int(p.strip()) for p in parts})


@app.get("/api/recommendations/{product_id}")
async def recommendations(product_id: int, limit: int = Query(default=4, ge=1, le=12)):
    # Một nguồn thuật toán duy nhất ở BE, không giữ thêm bản FAISS cũ.
    base = config.CATALOG_URL.rsplit("/products/", 1)[0]
    try:
        result = await asyncio.to_thread(json_request, f"{base}/products/{product_id}/similar?limit={limit}")
        return {"product_ids": [p["id"] for p in result.get("data", [])]}
    except (OSError, ValueError) as exc:
        raise HTTPException(503, "Chưa lấy được gợi ý sản phẩm") from exc
