import os
from pathlib import Path
try:
    from dotenv import load_dotenv
except ImportError:
    # Core retrieval tests dùng thư viện chuẩn; không cần cài thêm gói.
    def load_dotenv(path):
        return False

# Tải biến môi trường từ .env nếu có
BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

INDEX_DIR = str(BASE_DIR / os.getenv("INDEX_DIR", "faiss_index"))
DATA_DIR = str(BASE_DIR / os.getenv("DATA_DIR", "data"))
BASE_PRODUCT_URL = os.getenv("BASE_PRODUCT_URL", "http://localhost:5173/product-detail")
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL") or os.getenv("OLLAMA_HOST", "http://localhost:11434")

EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "embeddinggemma:300m-qat-q8_0")
EMBEDDING_CACHE_PATH = os.getenv("EMBEDDING_CACHE_PATH", str(BASE_DIR / "runtime" / "embeddings.sqlite3"))
LLM_MODEL = os.getenv("LLM_MODEL", "qwen2.5:3b")
LLM_TEMPERATURE = float(os.getenv("LLM_TEMPERATURE", "0.3"))
LLM_NUM_CTX = int(os.getenv("LLM_NUM_CTX", "4096"))
TOP_K = int(os.getenv("TOP_K", "4"))
_backend_host = "host.docker.internal" if Path("/.dockerenv").exists() else "localhost"
CATALOG_URL = os.getenv("CATALOG_URL", f"http://{_backend_host}:8080/products/chatbot-catalog")
LLM_ENABLED = os.getenv("LLM_ENABLED", "true").lower() == "true"
LLM_TIMEOUT = float(os.getenv("LLM_TIMEOUT", "90"))
# Tư vấn cần model viết câu trả lời; không dùng thời hạn xếp hạng 0,6 giây cho bước này.
CHAT_TIMEOUT = max(1, float(os.getenv("CHAT_TIMEOUT", "240")))
LLM_KEEP_ALIVE = os.getenv("LLM_KEEP_ALIVE", "15m")
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",")

