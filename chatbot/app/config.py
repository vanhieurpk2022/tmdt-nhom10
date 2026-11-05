import os
from pathlib import Path
from dotenv import load_dotenv

# Tải biến môi trường từ .env nếu có
BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

INDEX_DIR = str(BASE_DIR / os.getenv("INDEX_DIR", "faiss_index"))
DATA_DIR = str(BASE_DIR / os.getenv("DATA_DIR", "data"))
BASE_PRODUCT_URL = os.getenv("BASE_PRODUCT_URL", "http://localhost:5173/product-detail")
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL") or os.getenv("OLLAMA_HOST", "http://localhost:11434")

EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "bge-m3")
LLM_MODEL = os.getenv("LLM_MODEL", "qwen2.5:3b")
LLM_TEMPERATURE = float(os.getenv("LLM_TEMPERATURE", "0.3"))
LLM_NUM_CTX = int(os.getenv("LLM_NUM_CTX", "4096"))
TOP_K = int(os.getenv("TOP_K", "4"))

