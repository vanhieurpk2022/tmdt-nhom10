import os
import sys

# Đảm bảo in tiếng Việt trên console Windows không bị lỗi
if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

from typing import List
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

from app import config
from app.schemas import ChatRequest, ChatResponse, HealthResponse, ProductItem, RecommendationResponse
from app.rag import ask_question, stream_question, find_similar_product_ids, PRODUCTS_MAP

app = FastAPI(
    title="Oilia Chatbot RAG API",
    description="API tư vấn sản phẩm tinh dầu tích hợp FAISS và Ollama",
    version="1.0.0",
)

# Cấu hình CORS để Web Frontend (React/Vite) gọi được không bị chặn
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Cho phép tất cả các nguồn hoặc chỉ định http://localhost:5173
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/", tags=["General"])
async def root():
    return {
        "message": "Oilia Chatbot API đang hoạt động!",
        "documentation": "/docs",
        "health_check": "/health",
    }

@app.get("/health", response_model=HealthResponse, tags=["General"])
async def health_check():
    return HealthResponse(
        status="ok",
        ollama_url=config.OLLAMA_BASE_URL,
        faiss_index_exists=os.path.exists(config.INDEX_DIR),
    )

@app.get("/api/recommendations/{product_id}", response_model=RecommendationResponse, tags=["Recommendations"])
async def recommendations(product_id: int, limit: int = Query(default=4, ge=1, le=12)):
    return RecommendationResponse(
        product_ids=find_similar_product_ids(product_id, limit)
    )

@app.post("/api/chat", response_model=ChatResponse, tags=["Chat"])
async def chat_endpoint(request: ChatRequest):
    """
    Endpoint chat thông thường: Nhận câu hỏi, trả về câu trả lời kèm danh sách sản phẩm có hình ảnh.
    """
    try:
        reply, products = await ask_question(request.message)
        return ChatResponse(
            reply=reply,
            products=[ProductItem(**p) for p in products] if products else None
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Lỗi xử lý câu hỏi: {str(e)}",
        )

@app.post("/api/chat/stream", tags=["Chat"])
async def chat_stream_endpoint(request: ChatRequest):
    """
    Endpoint chat dạng Streaming (SSE): Trả về từng token theo thời gian thực (giống ChatGPT).
    """
    try:
        async def event_generator():
            async for token in stream_question(request.message):
                yield token

        return StreamingResponse(event_generator(), media_type="text/plain; charset=utf-8")
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Lỗi streaming: {str(e)}",
        )

@app.get("/api/products/lookup", response_model=List[ProductItem], tags=["Products"])
async def lookup_products(ids: str = Query(..., description="Danh sách ID sản phẩm cách nhau bởi dấu phẩy, vd: 1,2,3")):
    """
    Tra cứu danh sách sản phẩm (kèm hình ảnh, giá) theo danh sách ID.
    Dùng cho Frontend sau khi nhận kết quả stream.
    """
    id_list = [i.strip() for i in ids.split(",") if i.strip()]
    matched = [ProductItem(**PRODUCTS_MAP[pid]) for pid in id_list if pid in PRODUCTS_MAP]
    return matched
