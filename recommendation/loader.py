"""
loader.py - Module trích xuất và tiền xử lý dữ liệu sản phẩm từ cơ sở dữ liệu.

Chức năng:
  - Kết nối trực tiếp cơ sở dữ liệu MySQL (oilia-store) để lấy thông tin sản phẩm,
    danh mục, nhà xưởng, biến thể dung tích (product_mil) và hình ảnh đại diện.
  - Cung cấp cơ chế dự phòng (fallback) đọc từ tệp dữ liệu di trú V2__INSERT_DATA.sql.
  - Chuẩn hóa cấu trúc bản ghi sản phẩm sẵn sàng cho quá trình vector hóa đặc trưng.
"""

import os
from pathlib import Path
from typing import Any, Dict, List, Optional

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = int(os.getenv("DB_PORT", "3306"))
DB_USER = os.getenv("DB_USER", "oilia")
DB_PASSWORD = os.getenv("DB_PASSWORD", "123456")
DB_NAME = os.getenv("DB_NAME", "oilia-store")

_SQL_FALLBACK_PATH = (
    Path(__file__).resolve().parent.parent
    / "backend/src/main/resources/db/migration/V2__INSERT_DATA.sql"
)

CATEGORIES: Dict[str, str] = {
    "1": "Tinh dầu",
    "2": "Dầu nền",
    "3": "Tinh dầu chiết xuất",
    "4": "Tinh dầu phối trộn",
}

FACTORIES: Dict[str, str] = {
    "1": "Labcos",
    "2": "VIPSEN",
    "3": "BIYÒKEA",
    "4": "DALOSA Việt Nam",
    "5": "Lê Mai Việt Nam",
    "6": "HAKU Farm",
    "7": "Tinh Dầu 100",
    "8": "Kho Tinh Dầu",
}


def load_products_from_db() -> List[Dict[str, Any]]:
    """Truy vấn trực tiếp từ cơ sở dữ liệu MySQL."""
    import pymysql

    connection = pymysql.connect(
        host=DB_HOST,
        port=DB_PORT,
        user=DB_USER,
        password=DB_PASSWORD,
        database=DB_NAME,
        charset="utf8mb4",
        cursorclass=pymysql.cursors.DictCursor,
    )

    try:
        with connection.cursor() as cursor:
            # 1. Lấy danh sách sản phẩm thông thường
            cursor.execute(
                """
                SELECT 
                    p.id,
                    p.name,
                    p.description,
                    p.category_id,
                    p.factory_id,
                    c.name AS category_name,
                    f.name AS factory_name,
                    p.min_price,
                    p.min_base_price,
                    p.views,
                    p.total_sold
                FROM product p
                LEFT JOIN category c ON p.category_id = c.id
                LEFT JOIN factory f ON p.factory_id = f.id
                WHERE (p.product_type = 'NORMAL' OR p.product_type IS NULL)
                ORDER BY p.id ASC
                """
            )
            raw_products = cursor.fetchall()

            # 2. Lấy biến thể dung tích
            cursor.execute(
                """
                SELECT 
                    id, product_id, mil, base_price, price, stock_quantity, is_active
                FROM product_mil
                """
            )
            mils_by_product: Dict[int, List[Dict[str, Any]]] = {}
            for row in cursor.fetchall():
                pid = row["product_id"]
                mils_by_product.setdefault(pid, []).append(
                    {
                        "mil": row["mil"],
                        "base_price": float(row["base_price"] or 0),
                        "price": float(row["price"] or 0),
                        "stock_quantity": int(row["stock_quantity"] or 0),
                        "is_active": bool(row["is_active"]),
                    }
                )

            # 3. Lấy ảnh thumbnail đại diện
            cursor.execute(
                """
                SELECT product_id, image_url
                FROM product_image
                WHERE is_thumbnail = 1
                """
            )
            thumbnails: Dict[int, str] = {
                row["product_id"]: row["image_url"] for row in cursor.fetchall()
            }

        products: List[Dict[str, Any]] = []
        for p in raw_products:
            pid = p["id"]
            mils = mils_by_product.get(pid, [])
            total_stock = sum(m["stock_quantity"] for m in mils)

            active_prices = [
                m["price"] or m["base_price"]
                for m in mils
                if m["is_active"] and (m["price"] or m["base_price"]) > 0
            ]
            display_price = (
                min(active_prices)
                if active_prices
                else float(p["min_price"] or p["min_base_price"] or 0)
            )

            products.append(
                {
                    "id": pid,
                    "name": p["name"],
                    "description": p["description"] or "",
                    "category_id": str(p["category_id"] or "1"),
                    "factory_id": str(p["factory_id"] or "1"),
                    "category_name": p["category_name"] or CATEGORIES.get(str(p["category_id"]), "Tinh dầu"),
                    "factory_name": p["factory_name"] or FACTORIES.get(str(p["factory_id"]), "Oilia"),
                    "min_price": display_price,
                    "thumbnail_url": thumbnails.get(pid, ""),
                    "total_stock": total_stock,
                    "mils": mils,
                    "views": p.get("views") or 0,
                    "total_sold": p.get("total_sold") or 0,
                }
            )

        print(f"[Loader] Đã nạp {len(products)} sản phẩm từ cơ sở dữ liệu MySQL.")
        return products
    finally:
        connection.close()


def _parse_values(val_str: str) -> List[Any]:
    tokens: List[str] = []
    current: List[str] = []
    in_quotes = False
    quote_char = ""
    escaped = False

    for ch in val_str:
        if escaped:
            current.append(ch)
            escaped = False
        elif ch == "\\":
            escaped = True
        elif ch in ("'", '"'):
            if in_quotes and ch == quote_char:
                in_quotes = False
            elif not in_quotes:
                in_quotes = True
                quote_char = ch
            else:
                current.append(ch)
        elif ch == "," and not in_quotes:
            tokens.append("".join(current).strip())
            current = []
        else:
            current.append(ch)

    if current:
        tokens.append("".join(current).strip())

    cleaned: List[Any] = []
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


def load_products_from_sql(sql_path: Path) -> List[Dict[str, Any]]:
    """Phương thức dự phòng đọc trực tiếp từ tệp SQL di trú."""
    thumbnails: Dict[str, str] = {}
    product_mils: Dict[str, List[Dict[str, Any]]] = {}
    raw: Dict[str, Dict[str, Any]] = {}

    with open(sql_path, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue

            if "INSERT INTO `product_image`" in line or "INSERT INTO product_image " in line:
                idx = line.find("VALUES (")
                if idx != -1:
                    end_idx = line.rfind(")")
                    vals = _parse_values(line[idx + 8 : end_idx])
                    if len(vals) >= 5:
                        is_thumb = vals[4] in (1, "1", True, b"\x01")
                        if isinstance(vals[4], bytes):
                            is_thumb = vals[4] == b"\x01"
                        if is_thumb:
                            thumbnails[str(vals[3])] = str(vals[1] or "")

            if "INSERT INTO `product_mil`" in line or "INSERT INTO product_mil " in line:
                idx = line.find("VALUES (")
                if idx != -1:
                    end_idx = line.rfind(")")
                    vals = _parse_values(line[idx + 8 : end_idx])
                    if len(vals) >= 6:
                        pid = str(vals[1])
                        is_active = True
                        if len(vals) >= 7:
                            is_active = vals[6] not in (0, "0", False, b"\x00")
                            if isinstance(vals[6], bytes):
                                is_active = vals[6] != b"\x00"
                        product_mils.setdefault(pid, []).append(
                            {
                                "mil": int(vals[2]),
                                "base_price": float(vals[3] or 0),
                                "price": float(vals[4] or 0),
                                "stock_quantity": int(vals[5] or 0),
                                "is_active": is_active,
                            }
                        )

            if (
                "INSERT INTO `product` " in line
                or "INSERT INTO product " in line
            ) and "product_mil" not in line and "product_image" not in line and "product_custom" not in line:
                idx = line.find("VALUES (")
                if idx != -1:
                    end_idx = line.rfind(")")
                    vals = _parse_values(line[idx + 8 : end_idx])
                    if len(vals) >= 8:
                        pid = str(vals[0])
                        product_type = str(vals[5] or "NORMAL")
                        if product_type != "NORMAL" and product_type != "None" and vals[5] is not None:
                            if str(vals[5]).upper() == "CUSTOM":
                                continue
                        raw[pid] = {
                            "id": int(pid),
                            "name": str(vals[1] or "").strip(),
                            "description": str(vals[2] or "").strip(),
                            "category_id": str(vals[6] or "1"),
                            "factory_id": str(vals[7] or "1"),
                            "min_price": float(vals[10] if len(vals) > 10 and vals[10] else 0),
                        }

    products: List[Dict[str, Any]] = []
    for pid, p in raw.items():
        mils = product_mils.get(pid, [])
        total_stock = sum(m["stock_quantity"] for m in mils)
        thumb = thumbnails.get(pid, "")

        active_prices = [
            m["price"] or m["base_price"]
            for m in mils
            if m["is_active"] and (m["price"] or m["base_price"]) > 0
        ]
        display_price = min(active_prices) if active_prices else p["min_price"]

        products.append(
            {
                "id": p["id"],
                "name": p["name"],
                "description": p["description"],
                "category_id": p["category_id"],
                "factory_id": p["factory_id"],
                "category_name": CATEGORIES.get(p["category_id"], "Tinh dầu"),
                "factory_name": FACTORIES.get(p["factory_id"], "Oilia"),
                "min_price": display_price,
                "thumbnail_url": thumb,
                "total_stock": total_stock,
                "mils": mils,
            }
        )

    print(f"[Loader] Đã nạp {len(products)} sản phẩm từ tệp dự phòng SQL.")
    return products


def load_products(sql_path: Optional[Path] = None) -> List[Dict[str, Any]]:
    """
    Nạp dữ liệu sản phẩm từ cơ sở dữ liệu MySQL; tự động chuyển sang đọc tệp SQL
    nếu cơ sở dữ liệu chưa sẵn sàng.
    """
    try:
        return load_products_from_db()
    except Exception as db_err:
        print(f"[Loader] Không thể kết nối cơ sở dữ liệu ({db_err}). Chuyển sang đọc tệp SQL...")
        target_sql = sql_path or _SQL_FALLBACK_PATH
        return load_products_from_sql(target_sql)

