import os
import sys
from pathlib import Path
from tqdm import tqdm
from langchain_community.vectorstores import FAISS
from langchain_community.vectorstores.utils import DistanceStrategy
from langchain_ollama import OllamaEmbeddings

# Đảm bảo console Windows in tiếng Việt UTF-8 không lỗi
if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

from app import config
from app.sql_loader import load_products_from_sql

def rebuild_faiss():
    print("==================================================")
    print("    BẮT ĐẦU REBUILD FAISS TỪ FILE .SQL")
    print("==================================================")
    print(f"• Embedding model: {config.EMBEDDING_MODEL}")
    print(f"• Ollama Base URL: {config.OLLAMA_BASE_URL}")
    print(f"• Thư mục lưu Index: {config.INDEX_DIR}")
    print("--------------------------------------------------")

    # 1. Nạp sản phẩm và documents trực tiếp từ file SQL
    print("[1/3] Đang nạp dữ liệu từ file V2__INSERT_DATA.sql...")
    products_map, docs = load_products_from_sql(only_in_stock=True)
    print(f"-> Đã lọc và nạp thành công {len(docs)} sản phẩm CÒN HÀNG từ SQL.")

    # 2. Khởi tạo embeddings
    embeddings = OllamaEmbeddings(
        model=config.EMBEDDING_MODEL,
        base_url=config.OLLAMA_BASE_URL,
        keep_alive="1800",
    )

    # 3. Tạo Vectorstore và Embeddings
    print("[2/3] Đang tạo vector embeddings và đưa vào FAISS...")
    BATCH_SIZE = 32
    vectorstore = None

    for i in tqdm(range(0, len(docs), BATCH_SIZE), desc="Đang xử lý batches"):
        batch = docs[i : i + BATCH_SIZE]
        if vectorstore is None:
            vectorstore = FAISS.from_documents(
                documents=batch,
                embedding=embeddings,
                distance_strategy=DistanceStrategy.COSINE,
            )
        else:
            vectorstore.add_documents(documents=batch)

    # 4. Lưu FAISS Index mới
    print("[3/3] Đang ghi đè index mới vào thư mục faiss_index...")
    target_dir = Path(config.INDEX_DIR)
    target_dir.mkdir(parents=True, exist_ok=True)
    vectorstore.save_local(str(target_dir))

    print("==================================================")
    print("✅ REBUILD FAISS TỪ SQL HOÀN TẤT THÀNH CÔNG!")
    print(f"• Tổng số sản phẩm được lập chỉ mục: {len(docs)}")
    print(f"• Dữ liệu lưu tại: {target_dir}")
    print("==================================================")

if __name__ == "__main__":
    rebuild_faiss()
