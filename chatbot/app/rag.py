import os
import re
from pathlib import Path
from typing import AsyncGenerator, List, Dict, Any, Tuple
from langchain_community.vectorstores import FAISS
from langchain_community.vectorstores.utils import DistanceStrategy
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_ollama import ChatOllama, OllamaEmbeddings

from app import config
from app.sql_loader import load_products_from_sql

# Khởi tạo embedding model
embeddings = OllamaEmbeddings(
    model=config.EMBEDDING_MODEL,
    base_url=config.OLLAMA_BASE_URL,
    keep_alive="1800",
)

# Nạp trực tiếp dữ liệu sản phẩm từ file SQL
PRODUCTS_MAP: Dict[str, Dict[str, Any]] = {}
try:
    PRODUCTS_MAP, _sql_docs = load_products_from_sql(only_in_stock=True)
    print(f"[RAG] Đã nạp thành công {len(PRODUCTS_MAP)} sản phẩm còn hàng từ file SQL.")
except Exception as e:
    print(f"[RAG] Lỗi nạp dữ liệu từ SQL: {e}")

def get_or_create_vectorstore():
    """Tải FAISS vectorstore nếu đã có, hoặc tạo mới trực tiếp từ file SQL."""
    index_path = Path(config.INDEX_DIR)
    if (index_path / "index.faiss").is_file() and (index_path / "index.pkl").is_file():
        return FAISS.load_local(
            config.INDEX_DIR, embeddings, allow_dangerous_deserialization=True
        )

    print("[RAG] Chưa có FAISS index, đang khởi tạo mới từ file SQL...")
    _, docs = load_products_from_sql(only_in_stock=True)
    BATCH_SIZE = 32
    vectorstore = None
    for i in range(0, len(docs), BATCH_SIZE):
        batch = docs[i : i + BATCH_SIZE]
        if vectorstore is None:
            vectorstore = FAISS.from_documents(
                documents=batch,
                embedding=embeddings,
                distance_strategy=DistanceStrategy.COSINE,
            )
        else:
            vectorstore.add_documents(documents=batch)

    vectorstore.save_local(config.INDEX_DIR)
    return vectorstore

# Khởi tạo vector store và retriever
vectorstore = get_or_create_vectorstore()
retriever = vectorstore.as_retriever(search_kwargs={"k": config.TOP_K})

def find_similar_product_ids(product_id: int, limit: int) -> List[int]:
    """Tìm sản phẩm tương đồng bằng vector FAISS của sản phẩm được chọn."""
    document = next(
        (
            doc
            for doc in vectorstore.docstore._dict.values()
            if doc.metadata.get("id") == product_id
        ),
        None,
    )
    if document is None:
        return []

    matches = vectorstore.similarity_search(document.page_content, k=max(limit + 1, 2))
    result: List[int] = []
    for match in matches:
        match_id = match.metadata.get("id")
        if isinstance(match_id, int) and match_id != product_id and match_id not in result:
            result.append(match_id)
        if len(result) >= limit:
            break
    return result

# Prompt tư vấn
prompt_template = (
    "Bạn là nhân viên tư vấn bán hàng của shop tinh dầu Oilia. "
    "Giọng văn thân thiện, lịch sự, ngắn gọn.\n\n"
    "QUY TẮC BẮT BUỘC:\n"
    "1) CHỈ dùng thông tin trong mục 'Ngữ cảnh'. Không bịa công dụng, giá, thành phần. "
    "Không nhắc đến từ 'ngữ cảnh' hay 'dữ liệu' khi trả lời khách.\n"
    "2) Với mỗi sản phẩm gợi ý, trình bày đúng mẫu sau:\n"
    "• **Tên sản phẩm**\n"
    "- Xưởng: tên xưởng\n"
    "- Giá: dung tích và giá, chép đúng như trong ngữ cảnh, không tính toán, không làm tròn\n"
    "- Phù hợp vì: 1 câu nêu mùi hương/công dụng liên quan đến nhu cầu của khách\n"
    "- [Xem chi tiết](link sản phẩm)\n"
    "   Link phải chép nguyên văn từ dòng 'Link' của đúng sản phẩm đó, không tự tạo link.\n"
    "3) Khách hỏi về một xưởng cụ thể: liệt kê TẤT CẢ sản phẩm của xưởng đó có trong "
    "thông tin được cung cấp, không thêm sản phẩm của xưởng khác.\n"
    "4) Các câu hỏi khác: gợi ý tối đa 3 sản phẩm phù hợp nhất, sắp xếp từ phù hợp nhất.\n"
    "5) Khách hỏi chung chung (ví dụ 'tư vấn giúp tôi'): hỏi lại ĐÚNG 1 câu ngắn "
    "về nhu cầu (mùi hương, công dụng hoặc ngân sách), không gợi ý sản phẩm.\n"
    "6) Khách hỏi cụ thể nhưng không có sản phẩm phù hợp: chỉ trả lời "
    "\"Hiện shop chưa có sản phẩm phù hợp với yêu cầu của bạn. "
    "Bạn có thể mô tả thêm nhu cầu để shop tìm giúp nhé!\"\n"
    "7) Khách chào hỏi: chào lại ngắn gọn và hỏi họ đang tìm mùi hương/công dụng gì. "
    "Câu hỏi không liên quan đến tinh dầu: từ chối lịch sự và mời khách hỏi về sản phẩm.\n"
    "8) Trả lời hoàn toàn bằng tiếng Việt.\n\n"
    "Ví dụ một sản phẩm (chỉ để tham khảo định dạng):\n"
    "• **Tinh dầu Sả Chanh**\n"
    "- Xưởng: Xưởng ABC\n"
    "- Giá: 10ml - 50.000đ\n"
    "- Phù hợp vì: mùi thơm tươi mát, hợp để đuổi muỗi và khử mùi phòng.\n"
    "- [Xem chi tiết](http://localhost:5173/product-detail/12)\n\n"
    "Ngữ cảnh:\n{context}\n\n"
    "Câu hỏi của khách: {question}\n\n"
    "Trả lời:"
)
prompt = ChatPromptTemplate.from_template(prompt_template)

# LLM
llm = ChatOllama(
    model=config.LLM_MODEL,
    base_url=config.OLLAMA_BASE_URL,
    temperature=config.LLM_TEMPERATURE,
    num_ctx=config.LLM_NUM_CTX,
    keep_alive="30m",
)

def format_docs(docs):
    formatted = []
    for d in docs:
        content = d.page_content.strip()
        src = str(d.metadata.get("source", "unknown"))
        prod_id = src.replace("product_", "") if src.startswith("product_") else src
        if prod_id.isdigit() and f"{config.BASE_PRODUCT_URL}/{prod_id}" not in content:
            content += f"\nLink sản phẩm: {config.BASE_PRODUCT_URL}/{prod_id}"
        formatted.append(content)
    return "\n\n".join(formatted)

def clean_and_format_links(text: str) -> str:
    """Làm sạch các lỗi markdown do AI vô tình sinh ra."""
    # 1. Sửa lỗi markdown nhầm [Tên](nguồn: product_X) thành **Tên**
    text = re.sub(r"\[([^\]]+)\]\([^)]*(?:nguồn|product_)[^)]*\)", r"**\1**", text)

    # 2. Xóa các chuỗi 'nguồn: product_X' thừa thãi hiển thị cho khách
    text = re.sub(r"\(?nguồn:\s*product_\d+\)?", "", text)

    # 3. Chuẩn hóa link dạng 'Link sản phẩm: http://...' thành '[Bấm đường dẫn để xem](http://...)'
    text = re.sub(
        r"Link(?:\s+xem)?\s+sản\s+phẩm:\s*(https?://[^\s\)]+)",
        r"[Bấm đường dẫn để xem](\1)",
        text,
    )

    # 4. Chuẩn hóa link cũ '[Xem sản phẩm](...)' hoặc '[Xem chi tiết](...)'
    text = re.sub(
        r"\[Xem\s+(?:chi\s+tiết\s+)?sản\s+phẩm\]\((https?://[^\s\)]+)\)",
        r"[Bấm đường dẫn để xem](\1)",
        text,
    )

    # 5. Dọn dẹp bất kỳ placeholder nào bị sót lại
    text = re.sub(r"\[Dán link[^\n\]]*\]", "", text)
    text = re.sub(r"URL_LINK_SAN_PHAM", "", text)

    # 6. Xóa các link trùng lặp sát nhau
    text = re.sub(
        r"(\[Bấm đường dẫn để xem\]\([^\)]+\))(?:\s*\[Bấm đường dẫn để xem\]\([^\)]+\))+",
        r"\1",
        text,
    )

    return text.strip()

# RAG Chain
rag_chain = (
    {"context": retriever | format_docs, "question": RunnablePassthrough()}
    | prompt
    | llm
    | StrOutputParser()
    | clean_and_format_links
)

def extract_products_from_text(text: str) -> List[Dict[str, Any]]:
    """Trích xuất danh sách sản phẩm (kèm hình ảnh, giá) từ các ID xuất hiện trong câu trả lời."""
    found_ids: List[str] = []
    # Tìm dạng /product-detail/123
    matches = re.findall(r"/product-detail/(\d+)", text)
    for mid in matches:
        if mid not in found_ids and mid in PRODUCTS_MAP:
            found_ids.append(mid)

    return [PRODUCTS_MAP[pid] for pid in found_ids[:4]]

async def ask_question(question: str) -> Tuple[str, List[Dict[str, Any]]]:
    """Gọi RAG chain bất đồng bộ và trả về kết quả kèm danh sách thẻ sản phẩm có hình ảnh."""
    result = await rag_chain.ainvoke(question)
    products = extract_products_from_text(result)
    return result, products

async def stream_question(question: str) -> AsyncGenerator[str, None]:
    """Streaming từng token qua Server-Sent Events (SSE)."""
    streaming_chain = (
        {"context": retriever | format_docs, "question": RunnablePassthrough()}
        | prompt
        | llm
        | StrOutputParser()
    )
    async for chunk in streaming_chain.astream(question):
        yield chunk
