import re
import csv
import sys
from pathlib import Path
from typing import Dict, List, Any, Tuple
from langchain_core.documents import Document

from app import config

def parse_sql_values(val_str: str) -> List[Any]:
    """Tách các giá trị trong mệnh đề VALUES (...) của câu lệnh SQL."""
    tokens = []
    current = []
    in_quotes = False
    quote_char = ""
    escaped = False

    for char in val_str:
        if escaped:
            current.append(char)
            escaped = False
        elif char == "\\":
            escaped = True
        elif char in ("'", '"'):
            if in_quotes and char == quote_char:
                in_quotes = False
            elif not in_quotes:
                in_quotes = True
                quote_char = char
            else:
                current.append(char)
        elif char == "," and not in_quotes:
            tokens.append("".join(current).strip())
            current = []
        else:
            current.append(char)

    if current:
        tokens.append("".join(current).strip())

    cleaned = []
    for t in tokens:
        if (t.startswith("'") and t.endswith("'")) or (t.startswith('"') and t.endswith('"')):
            cleaned.append(t[1:-1].replace("\\'", "'").replace('\\"', '"'))
        elif t.upper() == "NULL":
            cleaned.append(None)
        else:
            try:
                cleaned.append(float(t) if "." in t else int(t))
            except ValueError:
                cleaned.append(t)
    return cleaned

def load_products_from_sql(sql_file_path: Path = None, only_in_stock: bool = True) -> Tuple[Dict[str, Dict[str, Any]], List[Document]]:
    """
    Nạp dữ liệu trực tiếp từ file .sql (V2__INSERT_DATA.sql).
    Trả về:
    1. products_map: Dict id -> thông tin chi tiết sản phẩm (ảnh, giá, tồn kho, link)
    2. documents: Danh sách Document để nạp vào FAISS Vectorstore
    """
    if sql_file_path is None:
        sql_file_path = Path(config.DATA_DIR) / "V2__INSERT_DATA.sql"
        if not sql_file_path.exists():
            # Thử tìm ở thư mục cha hoặc migration
            alt_path = Path(config.BASE_DIR).parent / "backend/src/main/resources/db/migration/V2__INSERT_DATA.sql"
            if alt_path.exists():
                sql_file_path = alt_path

    if not sql_file_path.exists():
        raise FileNotFoundError(f"Không tìm thấy file SQL tại {sql_file_path}")

    categories: Dict[str, str] = {
        "1": "Tinh dầu",
        "2": "Dầu nền",
        "3": "Tinh dầu chiết xuất",
        "4": "Tinh dầu phối trộn",
    }
    factories: Dict[str, Dict[str, str]] = {
        "1": {"name": "Labcos", "address": "KCN Thái Hòa, Xã Đức Lập, Tây Ninh"},
        "2": {"name": "VIPSEN", "address": "Bãi Dài, Tiến Xuân, Thạch Thất, Hà Nội"},
        "3": {"name": "BIYÒKEA", "address": "247/27 Lê Thị Kim, Xã Xuân Thới Sơn, TP.HCM"},
        "4": {"name": "DALOSA Việt Nam", "address": "265 Thống Nhất, P. Phú Thọ Hoà, TP.HCM"},
        "5": {"name": "Lê Mai Việt Nam", "address": "43R/10 Hồ Văn Huê, P. 9, Q. Phú Nhuận, TP.HCM"},
        "6": {"name": "HAKU Farm", "address": "940 Cách Mạng Tháng 8, P. 5, Q. Tân Bình, TP.HCM"},
        "7": {"name": "Tinh Dầu 100", "address": "146 Phố Chùa Quỳnh, P. Bạch Mai, Hà Nội"},
        "8": {"name": "Kho Tinh Dầu", "address": "Lô 17 đường 5, KDC Phú Hữu, TP.HCM"},
    }
    thumbnails: Dict[str, str] = {}
    product_mils: Dict[str, List[Dict[str, Any]]] = {}
    raw_products: Dict[str, Dict[str, Any]] = {}

    with open(sql_file_path, mode="r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue

            # 1. Bảng product_image (ảnh thumbnail đại diện)
            if "INSERT INTO `product_image`" in line or "INSERT INTO product_image" in line:
                idx = line.find("VALUES (")
                if idx != -1:
                    end_idx = line.rfind(")")
                    vals = parse_sql_values(line[idx + 8 : end_idx])
                    # (id, image_url, uploaded_at, product_id, is_thumbnail)
                    if len(vals) >= 5 and vals[4] in (1, "1", True):
                        thumbnails[str(vals[3])] = str(vals[1] or "")

            # 2. Bảng product_mil (dung tích, giá, số lượng tồn kho)
            if "INSERT INTO `product_mil`" in line or "INSERT INTO product_mil" in line:
                idx = line.find("VALUES (")
                if idx != -1:
                    end_idx = line.rfind(")")
                    vals = parse_sql_values(line[idx + 8 : end_idx])
                    # (id, product_id, mil, base_price, price, stock_quantity)
                    if len(vals) >= 6:
                        pid = str(vals[1])
                        product_mils.setdefault(pid, []).append({
                            "mil": vals[2],
                            "base_price": vals[3],
                            "price": vals[4],
                            "stock_quantity": int(vals[5] or 0),
                        })

            # 3. Bảng product
            if "INSERT INTO `product` " in line or "INSERT INTO product " in line:
                idx = line.find("VALUES (")
                if idx != -1:
                    end_idx = line.rfind(")")
                    vals = parse_sql_values(line[idx + 8 : end_idx])
                    # (id, name, description, created_at, updated_at, product_type, category_id, factory_id, wish_list_id, sale_id, min_price, min_base_price, views)
                    if len(vals) >= 11:
                        pid = str(vals[0])
                        raw_products[pid] = {
                            "id": int(pid),
                            "name": str(vals[1] or "").strip(),
                            "description": str(vals[2] or "").strip(),
                            "category_id": str(vals[6] or "1"),
                            "factory_id": str(vals[7] or "1"),
                            "min_price": float(vals[10] or 0),
                        }

    # Tổng hợp dữ liệu sản phẩm
    products_map: Dict[str, Dict[str, Any]] = {}
    documents: List[Document] = []

    for pid, p in raw_products.items():
        mils = product_mils.get(pid, [])
        total_stock = sum(m["stock_quantity"] for m in mils)
        has_stock = total_stock > 0 and len(mils) > 0

        # Nếu chỉ lấy hàng còn tồn kho thì bỏ qua các sản phẩm chưa có hàng
        if only_in_stock and not has_stock:
            continue

        variants_list = [f"{m['mil']}ml: {int(m['price']):,}đ (còn {m['stock_quantity']})" for m in mils]
        variants_str = "; ".join(variants_list) if variants_list else "Đang cập nhật"

        cat_name = categories.get(p["category_id"], "Tinh dầu")
        fac_info = factories.get(p["factory_id"], {"name": "Oilia", "address": ""})
        fac_name = fac_info["name"]

        stock_status = "Còn hàng" if has_stock else "Hết hàng"
        thumb_url = thumbnails.get(pid, "")

        product_data = {
            "id": p["id"],
            "name": p["name"],
            "description": p["description"],
            "category": cat_name,
            "factory": fac_name,
            "min_price": p["min_price"],
            "thumbnail_url": thumb_url,
            "imageUrl": thumb_url,
            "link": f"/product-detail/{pid}",
            "mils": mils,
            "total_stock": total_stock,
            "stock_status": stock_status,
        }
        products_map[pid] = product_data

        # Nội dung nạp vào FAISS cho AI tìm kiếm
        doc_content = (
            f"Sản phẩm: {p['name']}. Danh mục: {cat_name}. Xưởng/nhà cung cấp: {fac_name}.\n"
            f"Mô tả: {p['description']}\n"
            f"Dung tích và giá: {variants_str}.\n"
            f"Tình trạng tồn kho: {stock_status} (Tổng số lượng còn: {total_stock}).\n"
            f"Link sản phẩm: {config.BASE_PRODUCT_URL}/{pid}"
        )
        documents.append(
            Document(
                page_content=doc_content,
                metadata={
                    "source": f"product_{pid}",
                    "id": p["id"],
                    "name": p["name"],
                    "factory": fac_name,
                    "stock_status": stock_status,
                },
            )
        )

    return products_map, documents

