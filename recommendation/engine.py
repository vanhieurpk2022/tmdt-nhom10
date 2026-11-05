"""
engine.py - Thuật toán gợi ý sản phẩm tương tự dựa trên đặc trưng nốt hương và Cosine Similarity.

Thuật toán:
  1. Trích xuất thuộc tính mùi hương (tầng hương/họ hương: hoa, trái cây, thảo mộc, gỗ, gia vị, nhựa cây)
     và các từ khóa công dụng trị liệu (thư giãn, kháng khuẩn, khử mùi, giảm stress...) từ tên và mô tả sản phẩm.
  2. Kết hợp thông tin danh mục, nhà cung cấp và dải dung tích khả dụng thành chuỗi biểu diễn đặc trưng có trọng số.
  3. Vector hóa không gian văn bản bằng mô hình TF-IDF (Term Frequency - Inverse Document Frequency) kết hợp char n-gram.
  4. Ghép vector đặc trưng phân loại (one-hot encoding danh mục, nhà xưởng) và thang giá chuẩn hóa.
  5. Tính toán ma trận độ đo tương đồng Cosine (Cosine Similarity):
         cos_sim(u, v) = (u . v) / (||u|| * ||v||)
  6. Xếp hạng và trả về Top-K sản phẩm có độ tương đồng cao nhất với sản phẩm đang xem.
"""

from __future__ import annotations

import re
from typing import Any, Dict, List, Optional

import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import normalize
from scipy.sparse import hstack, csr_matrix

from loader import load_products


# Bảng đối chiếu nhóm mùi hương / tầng hương chuẩn hóa
_SCENT_GROUPS: Dict[str, str] = {
    # Nhóm hương hoa (Floral)
    "hoa hồng": "huong_hoa", "hoa lài": "huong_hoa", "hoa cam": "huong_hoa",
    "ngọc lan tây": "huong_hoa", "oải hương": "huong_hoa", "lavender": "huong_hoa",
    "ylang": "huong_hoa", "phong lữ": "huong_hoa", "hoa nhài": "huong_hoa",

    # Nhóm hương trái cây / Cam chanh (Citrus & Fruity)
    "cam ngọt": "huong_trai_cay", "chanh": "huong_trai_cay", "quýt": "huong_trai_cay",
    "bưởi": "huong_trai_cay", "bergamot": "huong_trai_cay", "sả chanh": "huong_trai_cay",
    "limonene": "huong_trai_cay", "citral": "huong_trai_cay", "citronellal": "huong_trai_cay",

    # Nhóm thảo mộc / Tươi mát (Herbal & Fresh)
    "bạc hà": "huong_thao_moc", "khuynh diệp": "huong_thao_moc", "tràm gió": "huong_thao_moc",
    "tràm trà": "huong_thao_moc", "trà xanh": "huong_thao_moc", "húng quế": "huong_thao_moc",
    "hương nhu": "huong_thao_moc", "bạch đàn": "huong_thao_moc", "eucalyptol": "huong_thao_moc",
    "menthol": "huong_thao_moc", "cineole": "huong_thao_moc",

    # Nhóm hương gỗ (Woody & Earthy)
    "gỗ hồng": "huong_go", "pơ mu": "huong_go", "trắc bách diệp": "huong_go",
    "tuyết tùng": "huong_go", "đàn hương": "huong_go", "nerolidol": "huong_go",
    "sesquiterpenes": "huong_go", "fokienol": "huong_go", "linalool": "huong_go",

    # Nhóm gia vị / Ấm nồng (Spicy & Warm)
    "gừng": "huong_gia_vi", "quế": "huong_gia_vi", "đinh hương": "huong_gia_vi",
    "hồi": "huong_gia_vi", "nhục đậu khấu": "huong_gia_vi", "nghệ": "huong_gia_vi",
    "zingiberene": "huong_gia_vi", "eugenol": "huong_gia_vi", "curcumin": "huong_gia_vi",

    # Nhóm hương nhựa cây / Trầm (Balsamic & Resinous)
    "nhũ hương": "huong_nhua_cay", "frankincense": "huong_nhua_cay", "myrrh": "huong_nhua_cay",
    "lộc đề xanh": "huong_nhua_cay", "sả hoa hồng": "huong_nhua_cay",

    # Nhóm dầu dưỡng nền (Carrier Oil)
    "jojoba": "dau_nen", "argan": "dau_nen", "dừa": "dau_nen",
    "hạnh nhân": "dau_nen", "macadamia": "dau_nen", "hướng dương": "dau_nen",
}

# Các từ khóa công dụng trị liệu đặc trưng
_THERAPY_KEYWORDS = [
    "thư giãn", "ngủ ngon", "giảm stress", "khử mùi", "đuổi muỗi",
    "kháng khuẩn", "dưỡng da", "dưỡng tóc", "massage", "tăng tập trung",
    "giảm đau", "chống oxy hóa", "thông mũi", "giải cảm", "tinh thần",
    "sảng khoái", "ấm áp", "dịu mát",
]


def _extract_scent_features(text: str) -> str:
    """Trích xuất danh mục nốt hương từ nội dung văn bản."""
    text_lower = text.lower()
    detected_groups = [
        group for keyword, group in _SCENT_GROUPS.items() if keyword in text_lower
    ]
    return " ".join(sorted(set(detected_groups)))


def _extract_therapy_features(text: str) -> str:
    """Trích xuất từ khóa công dụng trị liệu từ mô tả sản phẩm."""
    text_lower = text.lower()
    matched = [term for term in _THERAPY_KEYWORDS if term in text_lower]
    return " ".join(matched)


def _build_feature_representation(product: Dict[str, Any]) -> str:
    """
    Xây dựng chuỗi văn bản đại diện cho sản phẩm với trọng số phân cấp:
      - Tên sản phẩm (hệ số trọng số x4)
      - Nhóm danh mục (hệ số x3)
      - Đặc trưng tầng hương đã chuẩn hóa (hệ số x3)
      - Đơn vị sản xuất (hệ số x2)
      - Công dụng trị liệu và dải dung tích thực tế (hệ số x1)
    """
    name = product["name"]
    desc = product.get("description") or ""
    cat_name = product.get("category_name") or ""
    factory_name = product.get("factory_name") or ""
    mils_str = " ".join(f"{item['mil']}ml" for item in product.get("mils", []))

    content = f"{name} {desc}"
    scent_signature = _extract_scent_features(content)
    therapy_signature = _extract_therapy_features(content)

    weighted_tokens = (
        (name + " ") * 4
        + (cat_name + " ") * 3
        + (scent_signature + " ") * 3
        + (factory_name + " ") * 2
        + desc + " "
        + therapy_signature + " "
        + mils_str
    )
    return weighted_tokens.strip()


class RecommendationEngine:
    """
    Bộ máy tính toán gợi ý sản phẩm dựa trên độ tương đồng Cosine (Cosine Similarity).
    Dữ liệu được nạp và cập nhật tự động từ cơ sở dữ liệu hệ thống.
    """

    def __init__(self, sql_path: Optional[str] = None):
        # 1. Tải toàn bộ danh mục sản phẩm từ cơ sở dữ liệu
        self.products = load_products()
        self.id_to_idx: Dict[int, int] = {
            p["id"]: index for index, p in enumerate(self.products)
        }

        # 2. Xây dựng ma trận TF-IDF
        feature_texts = [_build_feature_representation(p) for p in self.products]
        self.vectorizer = TfidfVectorizer(
            analyzer="char_wb",
            ngram_range=(2, 4),
            min_df=1,
            max_features=8000,
            sublinear_tf=True,
        )
        tfidf_matrix = self.vectorizer.fit_transform(feature_texts)

        # 3. Mã hóa đặc trưng phân loại (Category & Factory)
        total_items = len(self.products)
        max_cat_id = max(int(p["category_id"]) for p in self.products) + 1
        max_fac_id = max(int(p["factory_id"]) for p in self.products) + 1

        category_matrix = np.zeros((total_items, max_cat_id))
        factory_matrix = np.zeros((total_items, max_fac_id))

        for idx, item in enumerate(self.products):
            category_matrix[idx, int(item["category_id"])] = 1.0
            factory_matrix[idx, int(item["factory_id"])] = 0.5

        # 4. Chuẩn hóa đặc trưng mức giá
        prices = np.array([p["min_price"] or 1.0 for p in self.products], dtype=float)
        normalized_prices = normalize(np.log1p(prices).reshape(-1, 1), norm="max")

        # 5. Kết hợp toàn bộ không gian đặc trưng vào ma trận thưa
        self._feature_matrix = hstack([
            tfidf_matrix,
            csr_matrix(category_matrix),
            csr_matrix(factory_matrix),
            csr_matrix(normalized_prices),
        ])

        print(
            f"[RecommendationEngine] Khởi tạo thành công mô hình: "
            f"{self._feature_matrix.shape[0]} sản phẩm, {self._feature_matrix.shape[1]} chiều không gian đặc trưng."
        )

    def recommend(
        self,
        product_id: int,
        top_k: int = 4,
        same_category_bias: float = 0.15,
    ) -> List[Dict[str, Any]]:
        """
        Tính toán độ tương đồng Cosine giữa sản phẩm chỉ định và tập dữ liệu để trả về Top-K sản phẩm.

        Args:
            product_id: Mã định danh của sản phẩm đang xem.
            top_k: Số lượng sản phẩm tương tự cần đề xuất.
            same_category_bias: Trọng số ưu tiên cho sản phẩm cùng danh mục.
        """
        target_idx = self.id_to_idx.get(product_id)
        if target_idx is None:
            return []

        target_vector = self._feature_matrix[target_idx]
        target_category = self.products[target_idx]["category_id"]

        # Tính toán ma trận độ đo tương đồng Cosine
        similarity_scores = cosine_similarity(target_vector, self._feature_matrix).flatten()

        # Cộng điểm ưu tiên cho sản phẩm thuộc cùng danh mục
        for idx, item in enumerate(self.products):
            if idx == target_idx:
                continue
            if item["category_id"] == target_category:
                similarity_scores[idx] += same_category_bias

        # Loại trừ chính sản phẩm mục tiêu
        similarity_scores[target_idx] = -1.0

        # Sắp xếp giảm dần theo điểm tương đồng và lấy Top-K
        ranked_indices = np.argsort(similarity_scores)[::-1][:top_k]

        results = []
        for ranked_idx in ranked_indices:
            prod = self.products[ranked_idx]
            stock = prod.get("total_stock", 0)
            stock_label = (
                "Còn hàng" if stock > 10
                else "Sắp hết" if stock > 0
                else "Hết hàng"
            )
            results.append(
                {
                    "id": prod["id"],
                    "name": prod["name"],
                    "description": prod["description"],
                    "factoryName": prod["factory_name"],
                    "price": prod["min_price"],
                    "avgRating": 5.0,
                    "totalSold": prod.get("total_sold") or 0,
                    "stockStatus": stock_label,
                    "thumbnailUrl": prod.get("thumbnail_url") or None,
                    "similarityScore": float(round(similarity_scores[ranked_idx], 4)),
                }
            )
        return results

