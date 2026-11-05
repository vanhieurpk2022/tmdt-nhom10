"""
main.py - Dịch vụ gợi ý sản phẩm tương tự dựa trên đặc trưng nốt hương và Cosine Similarity.

Endpoints:
  GET /api/recommendations/{product_id}?top_k=4
    -> Trả về danh sách các sản phẩm có độ đo tương đồng cao nhất.
"""

import os
import sys

if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

from typing import List, Optional
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

print("[Service] Đang tải dữ liệu từ cơ sở dữ liệu và xây dựng mô hình gợi ý...")
from engine import RecommendationEngine

_engine = RecommendationEngine()
print("[Service] Mô hình gợi ý sản phẩm đã sẵn sàng phục vụ!")


class ProductCard(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    factoryName: Optional[str] = None
    price: Optional[float] = None
    avgRating: float = 0.0
    totalSold: int = 0
    stockStatus: str = "Còn hàng"
    thumbnailUrl: Optional[str] = None
    similarityScore: Optional[float] = None


class RecommendationResponse(BaseModel):
    productId: int
    recommendations: List[ProductCard]


app = FastAPI(
    title="Oilia Recommendation Service",
    description=(
        "API gợi ý sản phẩm tương tự dựa trên đặc trưng nốt hương, "
        "công dụng trị liệu, dung tích và độ đo tương đồng Cosine (Cosine Similarity)."
    ),
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", tags=["General"])
def root():
    return {
        "service": "Oilia Product Recommendation Service",
        "algorithm": "TF-IDF & Cosine Similarity",
        "status": "running",
        "documentation": "/docs",
    }


@app.get("/health", tags=["General"])
def health():
    return {
        "status": "healthy",
        "total_products": len(_engine.products),
        "feature_dimensions": list(_engine._feature_matrix.shape),
    }


@app.get(
    "/api/recommendations/{product_id}",
    response_model=RecommendationResponse,
    tags=["Recommendations"],
)
def get_recommendations(
    product_id: int,
    top_k: int = Query(default=4, ge=1, le=12, description="Số lượng sản phẩm đề xuất"),
):
    """
    Gợi ý sản phẩm tương tự dựa trên đặc trưng nốt hương:
    Vector hóa các thuộc tính mùi hương (tầng hương, công dụng trị liệu, dung tích)
    và dùng độ đo tương đồng Cosine (Cosine Similarity) để tự động đề xuất các lọ
    tinh dầu có mùi hương tương đương trên trang chi tiết sản phẩm.
    """
    if product_id not in _engine.id_to_idx:
        raise HTTPException(
            status_code=404,
            detail=f"Không tìm thấy sản phẩm có mã định danh {product_id} trong cơ sở dữ liệu.",
        )

    results = _engine.recommend(product_id, top_k=top_k)
    return RecommendationResponse(
        productId=product_id,
        recommendations=[ProductCard(**r) for r in results],
    )


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("RECOMMENDATION_PORT", "8001"))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)

