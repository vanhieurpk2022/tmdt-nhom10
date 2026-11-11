from typing import Optional, List
from pydantic import BaseModel, Field

class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, description="Câu hỏi của khách hàng", example="Gợi ý tinh dầu hoa hồng")

class ProductItem(BaseModel):
    id: int
    name: str
    price: float
    imageUrl: Optional[str] = None
    link: Optional[str] = None
    category: Optional[str] = None

class ChatResponse(BaseModel):
    reply: str = Field(..., description="Câu trả lời từ trợ lý tư vấn")
    products: Optional[List[ProductItem]] = Field(default=None, description="Danh sách sản phẩm gợi ý kèm hình ảnh")

class HealthResponse(BaseModel):
    status: str
    ollama_url: str
    faiss_index_exists: bool

class RecommendationResponse(BaseModel):
    product_ids: List[int]
