from typing import Literal
from pydantic import BaseModel, Field, field_validator


class HistoryMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(min_length=1, max_length=2000)


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=2000)
    history: list[HistoryMessage] = Field(default_factory=list, max_length=8)

    @field_validator("message")
    @classmethod
    def not_blank(cls, value):
        value = value.strip()
        if not value:
            raise ValueError("Câu hỏi không được để trống")
        return value


class ProductItem(BaseModel):
    id: int
    name: str
    price: float
    imageUrl: str | None = None
    link: str | None = None
    category: str | None = None
    factoryName: str | None = None
    volumeMl: int | None = None


class ChatResponse(BaseModel):
    reply: str
    products: list[ProductItem] = Field(default_factory=list)


class HealthResponse(BaseModel):
    status: str
    catalog_ready: bool
    catalog_count: int
    model_ready: bool
    chat_model_ready: bool
    embedding_model_ready: bool
