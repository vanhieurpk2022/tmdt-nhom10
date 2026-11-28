"""Tìm trên catalog hiện tại, chọn ID, rồi định dạng thông tin đã kiểm chứng.
Không tải model, đọc SQL mẫu hay xây file chỉ mục khi khởi động.
"""
import asyncio
import json
import logging
import math
import re
import time
import unicodedata
from collections import OrderedDict
from functools import lru_cache
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit
from urllib.request import Request, urlopen

from app import config
from app.conversation import InvalidModelAnswer, plan_question, write_advice
from app.transport import call_request, model_request
from app.progress import report_progress
from app.vector_cache import get_vectors, save_vectors

logger = logging.getLogger(__name__)
_model_names = (0.0, set())
_model_digests = {}
_embedding_cache = OrderedDict()
_conversation_lock = asyncio.Lock()


class CatalogUnavailable(RuntimeError):
    pass


def json_request(url, payload=None, timeout=5):
    data = None if payload is None else json.dumps(payload).encode("utf-8")
    request = Request(url, data=data, headers={"Content-Type": "application/json", "Accept": "application/json"})
    with urlopen(request, timeout=timeout) as response:
        return json.load(response)


async def load_catalog(include_unavailable=False):
    # Đọc mỗi câu hỏi để giá và tồn kho không bị cũ khi xưởng cập nhật.
    try:
        url = config.CATALOG_URL
        if include_unavailable:
            parts = urlsplit(url)
            query = dict(parse_qsl(parts.query))
            query["includeUnavailable"] = "true"
            url = urlunsplit(parts._replace(query=urlencode(query)))
        result = await asyncio.to_thread(json_request, url)
        if not isinstance(result, dict) or not isinstance(result.get("data"), list):
            raise ValueError("Invalid catalog")
        return result["data"]
    except (OSError, ValueError) as exc:
        logger.warning("Không đọc được catalog: %s", type(exc).__name__)
        raise CatalogUnavailable("Tạm thời chưa lấy được sản phẩm. Bạn thử lại sau ít phút nhé.") from exc


async def load_factories():
    # Đọc riêng danh sách xưởng để nhận biết cả xưởng mới chưa có sản phẩm.
    base = config.CATALOG_URL.rsplit("/products/", 1)[0]
    try:
        result = await asyncio.to_thread(json_request, base + "/factories")
        if not isinstance(result, dict) or not isinstance(result.get("data"), list):
            raise ValueError("Invalid factories")
        return [factory for factory in result["data"]
                if factory.get("factoryStatus") in (None, "ACTIVE") and factory.get("name")]
    except (OSError, ValueError) as exc:
        raise CatalogUnavailable("Tạm thời chưa lấy được danh sách xưởng. Bạn thử lại sau nhé.") from exc


async def installed_models():
    global _model_names, _model_digests
    if time.monotonic() - _model_names[0] < 30:
        return _model_names[1]
    try:
        response = await asyncio.to_thread(json_request, config.OLLAMA_BASE_URL + "/api/tags", None, 2)
        names = {model["name"] for model in response.get("models", []) if isinstance(model.get("name"), str)}
        _model_digests = {model["name"]: model.get("digest", "") for model in response.get("models", []) if isinstance(model.get("name"), str)}
    except (OSError, ValueError, KeyError, TypeError):
        names = set()
    _model_names = time.monotonic(), names
    return names


def has_model(names, configured):
    return configured in names or configured + ":latest" in names


async def semantic_rerank(question, candidates, limit):
    names = await installed_models()
    fingerprint = config.EMBEDDING_MODEL + ":" + (_model_digests.get(config.EMBEDDING_MODEL) or _model_digests.get(config.EMBEDDING_MODEL + ":latest") or "")
    lightweight = config.EMBEDDING_MODEL.startswith("embeddinggemma")
    if lightweight:
        texts = ["task: search result | query: " + question] + [
            f"title: {p['name']} | text: {p.get('category') or ''}. " + (p.get("description") or "")[:400] for p in candidates]
    else:
        texts = [question] + [p["name"] + " " + (p.get("description") or "")[:400] for p in candidates]
    # Giữ vector của lượt hiện tại riêng, kể cả khi catalog lớn hơn giới hạn cache RAM.
    embeddings = {text: _embedding_cache[(fingerprint, text)] for text in texts if (fingerprint, text) in _embedding_cache}
    documents = set(texts[1:])
    cached = await asyncio.to_thread(get_vectors, config.EMBEDDING_CACHE_PATH, fingerprint,
                                     [text for text in documents if text not in embeddings])
    embeddings.update(cached)
    missing = list(dict.fromkeys(text for text in texts if text not in embeddings))
    if missing:
        # Docker ít RAM: giải phóng Qwen trước khi chạy BGE, không giữ hai model cùng lúc.
        if not lightweight and has_model(names, config.LLM_MODEL):
            await call_request(model_request, config.OLLAMA_BASE_URL + "/api/generate",
                                    {"model": config.LLM_MODEL, "keep_alive": 0}, 10)
        batch_size = 16
        for offset in range(0, len(missing), batch_size):
            batch = missing[offset:offset + batch_size]
            response = await call_request(model_request, config.OLLAMA_BASE_URL + "/api/embed", {
                "model": config.EMBEDDING_MODEL, "input": batch,
                "keep_alive": config.LLM_KEEP_ALIVE if lightweight else ("5m" if offset + batch_size < len(missing) else "0"),
                "options": {"use_mmap": True, "num_batch": 256},
            }, config.LLM_TIMEOUT)
            vectors = response.get("embeddings", [])
            if len(vectors) != len(batch) or any(not vector or not all(isinstance(n, (float, int)) and math.isfinite(n) for n in vector) for vector in vectors):
                raise ValueError("Invalid embedding response")
            for text, vector in zip(batch, vectors):
                embeddings[text] = vector
        await asyncio.to_thread(save_vectors, config.EMBEDDING_CACHE_PATH, fingerprint,
                                {text: embeddings[text] for text in missing if text in documents})
    for text, vector in embeddings.items():
        _embedding_cache[(fingerprint, text)] = vector
        _embedding_cache.move_to_end((fingerprint, text))
    while len(_embedding_cache) > 512:
        _embedding_cache.popitem(last=False)
    query = embeddings[texts[0]]
    def cosine(vector):
        if len(vector) != len(query):
            raise ValueError("Embedding dimension mismatch")
        denominator = math.sqrt(sum(n * n for n in query) * sum(n * n for n in vector))
        return sum(a * b for a, b in zip(query, vector)) / denominator if denominator else 0
    ranked = sorted(zip(candidates, texts[1:]), key=lambda item: cosine(embeddings[item[1]]), reverse=True)
    return [item[0] for item in ranked[:limit]]


@lru_cache(maxsize=2048)
def normalize(text):
    text = unicodedata.normalize("NFD", text.lower().replace("đ", "d"))
    return re.sub(r"[^a-z0-9]+", " ", "".join(c for c in text if not unicodedata.combining(c))).strip()


def contains(text, phrase):
    return f" {phrase} " in f" {text} "


SCENTS = {
    "bac ha": ("bac ha", "peppermint", "mint"),
    "oai huong": ("oai huong", "lavender"),
    "sa chanh": ("sa chanh", "lemongrass"),
    "hoa hong": ("hoa hong", "rose"),
    "hoa lai": ("hoa lai", "hoa nhai", "jasmine"),
    "cam": ("cam ngot", "cam", "orange"),
    "chanh": ("chanh", "lemon", "lime"),
    "tram tra": ("tram tra", "tea tree"),
    "khuynh diep": ("khuynh diep", "eucalyptus", "bach dan"),
    "ngoc lan tay": ("ngoc lan tay", "ylang"),
    "huong thao": ("huong thao", "rosemary"),
    "phong lu": ("phong lu", "geranium"),
    "tuyet tung": ("tuyet tung", "cedarwood"),
    "dan huong": ("dan huong", "sandalwood"),
    "dua": ("dau dua", "dua", "coconut"),
    "sa java": ("sa java", "citronella"),
}
SCENT_ALIASES = sorted(((alias, key) for key, names in SCENTS.items() for alias in names),
                      key=lambda item: len(item[0]), reverse=True)
NEEDS = {
    "thanh mat": ("bac ha", "chanh", "cam", "khuynh diep", "sa chanh"),
    "tuoi mat": ("bac ha", "chanh", "cam", "sa chanh"),
    "thu gian": ("oai huong", "hoa lai", "hoa hong", "dan huong"),
    "ngu ngon": ("oai huong", "hoa lai", "dan huong"),
    "stress": ("oai huong", "hoa hong", "dan huong"),
    "duoi muoi": ("sa chanh", "sa java"),
    "khu mui": ("sa chanh", "chanh", "bac ha"),
    "huong hoa": ("hoa hong", "hoa lai", "ngoc lan tay", "phong lu", "oai huong"),
    "huong go": ("dan huong", "tuyet tung"),
}
NEED_ALIASES = {
    "ngu ngon": ("de ngu", "ngon giac", "truoc khi ngu", "giac ngu"),
    "thu gian": ("relax", "thu thai"),
}
ACKNOWLEDGEMENTS = {"u", "uh", "vang", "da", "dung", "dung roi", "co", "co chu", "ok", "oke", "duoc", "tiep di", "tu van di"}


def need_keys(text):
    return {need for need in NEEDS if any(contains(text, alias)
            for alias in (need, *NEED_ALIASES.get(need, ())))}


def continuing_acknowledgement(question, history):
    if normalize(question) not in ACKNOWLEDGEMENTS:
        return False
    previous = next((m["content"] for m in reversed(history or []) if m.get("role") == "assistant"), "")
    return previous.rstrip().endswith("?")


STOP_WORDS = set("toi minh ban cho can muon tim goi y san pham tinh dau mui huong co nao la gi cua voi va gia duoi tren tu den khoang ngan sach dong nghin ngan trieu re hon nhat mua lo chai ml xuong san xuat giup nhe a oi xem cac tat ca con hang ngay phu hop".split())
STOP_WORDS.update("bao nhieu may tong cong so luong loai mat ke liet danh sach dang hien tai he thong shop gian thuong hieu vay thi do nay o ben sp dem ton kho lai nhung duoc bat ky".split())
STOP_WORDS.update("het cong khai k d vnd khong thich sao nua the lay nhu hoi".split())
MAX_PRODUCT_RESULTS = 12


def scent_keys(text):
    found, remaining = set(), re.sub(r"\bcam (?:giac|thay|on|cum)\b", " ", text)
    # Cụm dài trước: 'sả chanh' không bị hiểu thành riêng 'chanh'.
    for phrase, key in SCENT_ALIASES:
        if contains(remaining, phrase):
            found.add(key)
            remaining = f" {remaining} ".replace(f" {phrase} ", " ").strip()
    return found


def budget(text):
    amounts = []
    pattern = r"(\d+(?:[.,]\d+)*)\s*(?:(trieu|triệu|tr|nghin|nghìn|ngan|ngàn|k|vnd|dong|đồng|đ|d)(?=\W|$))?"
    raw = text.lower()
    for match in re.finditer(pattern, raw):
        number, unit = match.groups()
        if not unit and re.match(r"\s*(?:ml|san pham|sản phẩm|sp|loai|loại|mui|mùi|chai|lọ|lo|xuong|xưởng|shop)\b", raw[match.end():]):
            continue
        if unit in ("tr", "trieu", "triệu"):
            value = float(number.replace(",", ".")) * 1_000_000
        elif unit in ("k", "nghin", "nghìn", "ngan", "ngàn"):
            value = float(number.replace(",", ".")) * 1_000
        else:
            value = float(re.sub(r"[.,]", "", number))
            nearby = normalize(raw[max(0, match.start() - 40):match.end() + 20])
            price_context = any(contains(nearby, word) for word in ("gia", "ngan sach", "duoi", "tren", "toi da", "toi thieu", "khoang", "tu", "den"))
            if not unit and (value < 1000 or not price_context):
                continue
        prefix = normalize(raw[max(0, match.start() - 40):match.start()])
        minimum = bool(re.search(r"(?:tren|toi thieu|it nhat|tu)$", prefix))
        exact = bool(re.search(r"(?:dung|chinh xac|bang)$", prefix))
        amounts.append((value, minimum, exact, match.start(), match.end()))
    if len(amounts) >= 2:
        between = raw[amounts[0][4]:amounts[1][3]]
        if any(contains(normalize(between), word) for word in ("den", "toi")) or re.search(r"[-–—]", between):
            return min(amounts[0][0], amounts[1][0]), max(amounts[0][0], amounts[1][0])
    if amounts:
        value, minimum, exact, _, _ = amounts[0]
        if exact:
            return value, value
        return (value, None) if minimum else (None, value)
    return None, None


def effective_question(question, history, catalog=None):
    q = normalize(question)
    if continuing_acknowledgement(question, history):
        # 'Ừ' xác nhận lượt trước, không phải một nhu cầu tìm sản phẩm mới.
        for index in range(len(history) - 1, -1, -1):
            previous = history[index]
            if previous.get("role") == "user" and normalize(previous["content"]) not in ACKNOWLEDGEMENTS:
                return effective_question(previous["content"], history[:index], catalog)
    names = {p.get("factoryName") or "" for p in catalog or []} - {""}
    factory = next((name for name in names if contains(q, normalize(name))), "")
    topic = scent_keys(q) or need_keys(q)
    volume = re.search(r"\d+\s*ml\b", q)
    bounds = budget(question)
    followup = (q.startswith(("con ", "khong ")) or q.endswith("thi sao")
                or any(contains(q, s) for s in ("loai do", "loai nay", "re hon", "con loai", "nhu cu", "nhu vay", "nhu tren", "giu nguyen"))
                or (not topic and bool(factory or volume or bounds != (None, None))))
    if not followup or not history:
        return question
    previous_topic, previous_factory, previous_volume, previous_bounds = set(), "", None, (None, None)
    for message in reversed(history):
        if message.get("role") != "user":
            continue
        previous = normalize(message["content"])
        if not previous_topic:
            previous_topic = scent_keys(previous) or need_keys(previous)
        if not previous_factory:
            previous_factory = next((name for name in names if contains(previous, normalize(name))), "")
        if previous_volume is None:
            previous_volume = re.search(r"\d+\s*ml\b", previous)
        if previous_bounds == (None, None):
            previous_bounds = budget(message["content"])
    topic = topic or previous_topic
    factory = factory or previous_factory
    volume = volume or previous_volume
    bounds = bounds if bounds != (None, None) else previous_bounds
    if contains(q, "re hon"):
        for response in reversed(history):
            if response.get("role") == "assistant":
                prices = [int(n.replace(".", "")) for n in re.findall(r"(\d{1,3}(?:\.\d{3})+)đ", response["content"])]
                if prices:
                    bounds = (bounds[0], min(bounds[1], min(prices) - 1) if bounds[1] is not None else min(prices) - 1)
                break
    filters = []
    if bounds[0] is not None and bounds[1] is not None:
        filters.append(f"từ {bounds[0]:.0f}đ đến {bounds[1]:.0f}đ")
    elif bounds[0] is not None:
        filters.append(f"trên {bounds[0]:.0f}đ")
    elif bounds[1] is not None:
        filters.append(f"dưới {bounds[1]:.0f}đ")
    if volume:
        filters.append(volume[0])
    return " ".join(sorted(topic)) + " " + factory + " " + " ".join(filters) + " " + question


def select_products(question, catalog, limit=8, *, available_only=True, allow_all=False, factory_name=None, price_bounds=None, volume_ml=None):
    q = normalize(question)
    requested = scent_keys(q)
    excluded = set()
    for match in re.finditer(r"(?:khong (?:thich |lay |can )?|ngoai tru |tru )(.*?)(?:nhung|thay bang|$)", q):
        excluded.update(scent_keys(match[1]))
    requested -= excluded
    if not requested:
        requested = {key for need in need_keys(q) for key in NEEDS[need]}
    factories = {normalize(p.get("factoryName") or "") for p in catalog} - {""}
    factory = normalize(factory_name) if factory_name else next((f for f in sorted(factories, key=len, reverse=True) if contains(q, f)), None)
    categories = {normalize(p.get("category") or "") for p in catalog} - {""}
    category = next((name for name in sorted(categories, key=len, reverse=True)
                     if contains(q, name) and (name != "tinh dau" or contains(q, "danh muc"))), None)
    minimum, maximum = price_bounds if price_bounds is not None else budget(question)
    volume_match = re.search(r"(\d+)\s*ml\b", question.lower())
    volume = volume_ml if volume_ml is not None else (int(volume_match[1]) if volume_match else None)
    text_terms = q
    for name in factories | ({factory} if factory else set()):
        text_terms = re.sub(r"(?<![a-z0-9])" + re.escape(name) + r"(?![a-z0-9])", " ", text_terms)
    if category:
        text_terms = f" {text_terms} ".replace(f" {category} ", " ").strip()
    text_terms = re.sub(r"(?:khong (?:thich |lay |can )?|ngoai tru |tru )(.*?)(?:nhung|thay bang|$)", " ", text_terms)
    terms = set(re.sub(r"\b\d+[a-z]*\b", " ", text_terms).split()) - STOP_WORDS
    candidates = []
    # Một sản phẩm có nhiều dung tích vẫn chỉ được đếm một lần.
    for product in {p["id"]: p for p in catalog}.values():
        if factory and normalize(product.get("factoryName") or "") != factory:
            continue
        if category and normalize(product.get("category") or "") != category:
            continue
        variants = [v for v in product.get("variants", []) if v.get("isActive", True)
                    and (v.get("stockQuantity", 0) > 0 if available_only else v.get("stockQuantity", 0) >= 0) and v.get("price", 0) > 0
                    and (volume is None or v.get("mil") == volume)
                    and (minimum is None or v["price"] >= minimum)
                    and (maximum is None or v["price"] <= maximum)]
        if not variants and (available_only or volume is not None or minimum is not None or maximum is not None):
            continue
        name = normalize(product["name"])
        keys = scent_keys(name)
        if keys.intersection(excluded):
            continue
        if requested and not keys.intersection(requested):
            continue
        score = len(terms.intersection(set(name.split()))) * 4
        score += len(terms.intersection(set(normalize(product.get("description") or "").split())))
        score += 20 * len(keys.intersection(requested))
        if not requested and terms and not score:
            continue
        if not requested and not factory and not category and minimum is None and maximum is None and volume is None and not score and not allow_all and not excluded:
            continue
        variant = min(variants, key=lambda v: (v["price"], v.get("mil", 0), v["id"])) if variants else None
        candidates.append((score, variant["price"] if variant else math.inf, product["id"], {
            **product, "price": variant["price"] if variant else None, "volumeMl": variant["mil"] if variant else None, "variants": variants,
        }))
    candidates.sort(key=lambda row: (-row[0], row[1], row[2]))
    return [row[3] for row in candidates[:limit]]


def has_clear_filters(question, candidates):
    """Yêu cầu đã xác định được bằng catalog không cần chờ thêm model."""
    q = normalize(question)
    minimum, maximum = budget(question)
    return (bool(scent_keys(q)) or bool(need_keys(q))
            or minimum is not None or maximum is not None
            or bool(re.search(r"\d+\s*ml\b", question.lower()))
            or any(contains(q, phrase) for phrase in ("re nhat", "re hon", "gia thap"))
            or any(p.get("factoryName") and contains(q, normalize(p["factoryName"])) for p in candidates))


def product_item(product):
    return {key: product.get(key) for key in ("id", "name", "price", "imageUrl", "link", "category", "factoryName", "volumeMl")}


def question_intent(question):
    """Phân loại trước khi tìm kiếm: đếm/thống kê không đi qua model chọn top 3."""
    q = normalize(question)
    # Câu số liệu rõ ràng dùng phép tính trên catalog; câu tư vấn dùng model chat.
    if any(contains(q, phrase) for phrase in ("re nhat", "dat nhat", "gia thap nhat", "gia cao nhat")):
        return "price_rank"
    if any(contains(q, noun) for noun in ("xuong", "shop", "gian hang")) and any(contains(q, noun) for noun in ("san pham", "mat hang")) and re.search(r"(?:nhieu|it).*nhat|xep hang|\btop\b", q):
        return "factory_rank"
    if re.search(r"(?:bao nhieu|may) (?:xuong|shop|gian hang)|(?:so luong|tong so) (?:xuong|shop|gian hang)", q):
        return "factory_count"
    if re.search(r"(?:gia|bao gia).*bao nhieu|bao nhieu (?:tien|dong)", q) or any(contains(q, phrase) for phrase in ("thanh phan", "cong dung", "chi tiet", "thong tin", "gia cua")):
        return "detail"
    if re.search(r"(?:bao nhieu|may) (?:san pham|sp|mat hang|loai|tinh dau)|(?:so luong|tong so) (?:san pham|sp|mat hang)", q):
        return "product_count"
    if contains(q, "ton kho") or re.search(r"(?:bao nhieu|may) (?:chai|lo|ml)|(?:so luong|luong) con lai", q):
        return "stock"
    if any(contains(q, phrase) for phrase in ("cac xuong", "danh sach xuong", "kham pha cac xuong", "xuong nao", "shop nao")):
        return "factory_list"
    if need_keys(q) or any(contains(q, phrase) for phrase in ("tu van", "goi y", "nen chon", "phu hop", "giup", "dung cho", "dung de")):
        return "recommend"
    if any(contains(q, phrase) for phrase in ("liet ke", "ke ten", "tat ca san pham", "danh sach san pham", "nhung san pham", "san pham nao", "cac san pham cua", "ban nhung gi", "co nhung gi")):
        return "product_list"
    return "recommend"


def requested_product_limit(question):
    match = re.search(r"\b(\d{1,4})\s*(?:san pham|sp|loai|mui)\b", normalize(question))
    return min(int(match[1]), MAX_PRODUCT_RESULTS) if match else None


def available(product):
    return any(v.get("isActive", True) and v.get("stockQuantity", 0) > 0 and v.get("price", 0) > 0
               for v in product.get("variants", []))


def filter_availability(question, products):
    q = normalize(question)
    if any(contains(q, phrase) for phrase in ("ke ca het hang", "bao gom het hang", "ca con hang va het hang")):
        return products
    if contains(q, "het hang") or contains(q, "khong con hang"):
        return [p for p in products if not available(p)]
    if contains(q, "con hang"):
        return [p for p in products if available(p)]
    return products


def match_factory(question, factories, history=None):
    def find(text):
        normalized = normalize(text)
        return next((f for f in sorted(factories, key=lambda f: len(f["name"]), reverse=True)
                     if contains(normalized, normalize(f["name"]))), None)
    selected = find(question)
    if selected:
        return selected
    q = normalize(question)
    if any(contains(q, phrase) for phrase in ("xuong do", "xuong nay", "shop do", "shop nay", "ben do", "ben nay")):
        for message in reversed(history or []):
            if message.get("role") == "user" and (selected := find(message["content"])):
                return selected
    return None


def needs_factory_name(question, factory):
    if factory:
        return False
    q = normalize(question)
    if any(contains(q, phrase) for phrase in ("xuong do", "xuong nay", "shop do", "shop nay")):
        return True
    match = re.search(r"\b(?:xuong|shop|gian hang) (?:san xuat )?(.+)", q)
    if not match:
        return False
    # 'Xưởng ABC có...' phải hỏi lại tên; không được đếm cả hệ thống thay cho ABC.
    first = match[1].split()[0]
    return first not in {"co", "nao", "dang", "bao", "may", "san", "voi", "ban", "tren", "trong"}


def products_link(factory=None):
    return "/products?" + urlencode({"factoryId": factory["id"]}) if factory and factory.get("id") is not None else "/products"


def format_products(products, heading):
    lines = [heading]
    cards = []
    for product in products:
        if product.get("price") is None:
            details = "Chưa có dung tích đang mở bán."
        else:
            price = f"{product['price']:,.0f}".replace(",", ".") + "đ"
            details = f"{product['volumeMl']}ml · {price} · " + ("Còn hàng" if available(product) else "Hết hàng")
            if available(product):
                cards.append(product_item(product))
        lines.append(f"• **{product['name']}**\nXưởng: {product.get('factoryName') or 'Chưa cập nhật'} · {details}\n[Xem chi tiết](/product-detail/{product['id']})")
    return "\n\n".join(lines), cards


def rank_factories(question, catalog, factories, limit=None, descending=True):
    """GROUP BY xưởng, COUNT DISTINCT sản phẩm, ORDER BY số lượng; giữ cả các xưởng đồng hạng."""
    q = normalize(question)
    filtered = bool(scent_keys(q)) or bool(need_keys(q))
    filtered |= budget(question) != (None, None) or bool(re.search(r"\d+\s*ml", q))
    matches = select_products(question if filtered else "", catalog, limit=None, available_only=False, allow_all=True)
    matches = filter_availability(question, matches)
    rows = []
    for factory in factories:
        products = [p for p in matches if p.get("factoryId") == factory["id"]
                    or (p.get("factoryId") is None and normalize(p.get("factoryName") or "") == normalize(factory["name"]))]
        rows.append((factory, len(products), sum(available(p) for p in products)))
    rows.sort(key=lambda row: ((-row[1] if descending else row[1]), row[0]["id"]))
    if not rows:
        return "Hiện chưa có xưởng công khai phù hợp để so sánh.", []
    if limit is None:
        rows = [row for row in rows if row[1] == rows[0][1]]
    else:
        rows = rows[:min(limit, MAX_PRODUCT_RESULTS)]
    label = "nhiều nhất" if descending else "ít nhất"
    heading = (f"Xưởng có số sản phẩm {label}" if limit is None else "Xếp hạng xưởng theo số sản phẩm")
    if filtered or contains(q, "con hang") or contains(q, "het hang"):
        heading += " theo điều kiện bạn yêu cầu"
    lines = [heading + ":"]
    for factory, count, in_stock in rows:
        lines.append(f"• **{factory['name']}**: **{count} sản phẩm**, trong đó {in_stock} sản phẩm còn hàng.\n[Xem sản phẩm]({products_link(factory)})")
    return "\n\n".join(lines), []


async def answer_catalog_question(question, intent, history, factories=None, *, catalog=None, result_limit=None, descending=True, selected_factory=None):
    # Đọc toàn bộ sản phẩm công khai, kể cả hết hàng, để số tổng không bị hụt.
    if catalog is None and factories is None:
        catalog, factories = await asyncio.gather(load_catalog(include_unavailable=True), load_factories())
    elif catalog is None:
        catalog = await load_catalog(include_unavailable=True)
    elif factories is None:
        factories = await load_factories()
    factory = selected_factory or match_factory(question, factories, history)
    if needs_factory_name(question, factory):
        return "Mình chưa xác định được xưởng bạn đang hỏi. Bạn cho mình tên xưởng đúng như trên [danh sách xưởng](/factories) nhé.", []

    if intent == "factory_rank":
        count_match = re.search(r"\b(\d+)\s*(?:xuong|shop|gian hang)\b", normalize(question))
        if result_limit is None and count_match:
            result_limit = int(count_match[1])
        return rank_factories(question, catalog, factories, result_limit,
                              descending and not bool(re.search(r"\bit\b.*\bnhat\b", normalize(question))))

    if intent in ("factory_count", "factory_list"):
        q = normalize(question)
        if scent_keys(q) or need_keys(q) or budget(question) != (None, None) or re.search(r"\d+\s*ml", q) or contains(q, "con hang") or contains(q, "het hang"):
            matching = select_products(question, catalog, limit=None, available_only=False, allow_all=True)
            matching = filter_availability(question, matching)
            names = {normalize(p.get("factoryName") or "") for p in matching}
            factories = [f for f in factories if normalize(f["name"]) in names]
            heading = f"Có {len(factories)} xưởng có sản phẩm phù hợp với yêu cầu này."
        else:
            heading = f"Hiện có {len(factories)} xưởng đang hoạt động trên hệ thống."
        if intent == "factory_list" and factories:
            heading += "\n\n" + "\n".join(f"• [{f['name']}](/factories/{f['id']})" for f in factories)
        return heading + "\n\n[Xem các xưởng sản xuất](/factories)", []

    search = effective_question(question, history, catalog)
    products = select_products(search, catalog, limit=None, available_only=False, allow_all=True,
                               factory_name=factory["name"] if factory else None)
    q = normalize(question)
    out_of_stock = contains(q, "het hang") or contains(q, "khong con hang")
    products = filter_availability(question, products)
    scope = f"tại xưởng **{factory['name']}**" if factory else "trên catalog công khai"

    if intent == "price_rank":
        include_sold_out = contains(q, "het hang") or contains(q, "khong con hang")
        products = select_products(search, catalog, limit=None, available_only=not include_sold_out,
                                   allow_all=True, factory_name=factory["name"] if factory else None)
        products = [p for p in filter_availability(question, products) if p.get("price") is not None]
        products.sort(key=lambda p: (p["price"] * (-1 if descending else 1), p["id"]))
        if not products:
            return f"Mình chưa tìm thấy sản phẩm có giá phù hợp {scope}.", []
        if result_limit is None:
            shown = [p for p in products if p["price"] == products[0]["price"]][:MAX_PRODUCT_RESULTS]
        else:
            shown = products[:min(result_limit, MAX_PRODUCT_RESULTS)]
        return format_products(shown, f"Sản phẩm có giá {'cao' if descending else 'thấp'} nhất phù hợp {scope}:")

    if intent == "product_count":
        in_stock = sum(available(p) for p in products)
        reply = f"Có **{len(products)} sản phẩm** phù hợp với yêu cầu {scope}."
        if products and not out_of_stock:
            reply += f" Trong đó **{in_stock} sản phẩm còn hàng** có thể đặt mua."
        return reply + f"\n\n[Xem danh sách sản phẩm]({products_link(factory)})", []

    if not products:
        return f"Mình chưa tìm thấy sản phẩm phù hợp {scope}. Bạn kiểm tra lại tên, dung tích hoặc khoảng giá nhé.", []

    if intent == "stock":
        count = sum(v.get("stockQuantity", 0) for p in products for v in p.get("variants", []))
        lines = [f"Hiện còn **{count} chai** thuộc **{len(products)} sản phẩm** phù hợp {scope}."]
        for product in products[:MAX_PRODUCT_RESULTS]:
            variants = "; ".join(f"{v['mil']}ml: {v.get('stockQuantity', 0)} chai" for v in product.get("variants", []))
            lines.append(f"• **{product['name']}** · {product.get('factoryName') or 'Chưa cập nhật'}: {variants or 'Chưa có dung tích đang bán'}")
        if len(products) > MAX_PRODUCT_RESULTS:
            lines.append(f"Đang hiển thị chi tiết {MAX_PRODUCT_RESULTS}/{len(products)} sản phẩm. Bạn nêu tên sản phẩm để xem cụ thể hơn.")
        return "\n\n".join(lines), []

    if intent == "detail":
        if len(products) > 1:
            names = ", ".join(sorted({p.get("factoryName") or "Chưa cập nhật" for p in products}))
            if factory or len({p.get("factoryName") for p in products}) == 1:
                return f"Mình tìm thấy {len(products)} sản phẩm phù hợp tại {names}. Bạn cho mình tên sản phẩm muốn xem thông tin nhé.", []
            return f"Mình tìm thấy {len(products)} sản phẩm phù hợp từ {names}. Bạn muốn xem thông tin sản phẩm của xưởng nào?", []
        product = products[0]
        lines = [f"**{product['name']}** · {product.get('factoryName') or 'Chưa cập nhật'}"]
        for variant in product.get("variants", []):
            price = f"{variant['price']:,.0f}".replace(",", ".") + "đ"
            stock = f"Còn {variant['stockQuantity']} chai" if variant.get("stockQuantity", 0) > 0 else "Hết hàng"
            lines.append(f"• {variant['mil']}ml: **{price}** · {stock}")
        if any(contains(q, phrase) for phrase in ("thanh phan", "cong dung", "chi tiet", "thong tin")):
            lines.append((product.get("description") or "Xưởng chưa cập nhật mô tả chi tiết.")[:600])
        lines.append(f"[Xem chi tiết](/product-detail/{product['id']})")
        return "\n\n".join(lines), []

    limit = result_limit if result_limit is not None else requested_product_limit(question)
    if limit == 0:
        return "Bạn muốn xem bao nhiêu sản phẩm? Hãy chọn từ 1 đến 12 sản phẩm mỗi lần nhé.", []
    shown = products[:min(limit if limit is not None else MAX_PRODUCT_RESULTS, MAX_PRODUCT_RESULTS)]
    reply, cards = format_products(shown, f"Tìm thấy **{len(products)} sản phẩm** phù hợp {scope}; đang hiển thị {len(shown)} sản phẩm:")
    if len(shown) < len(products):
        reply += f"\n\n[Xem thêm sản phẩm]({products_link(factory)})"
    return reply, cards


def unresolved_catalog_terms(question, catalog, factories):
    remaining = normalize(question)
    names = [f["name"] for f in factories] + [alias for alias, _ in SCENT_ALIASES]
    names += list({p.get("category") or "" for p in catalog} - {""})
    for name in sorted(names, key=len, reverse=True):
        remaining = re.sub(r"(?<![a-z0-9])" + re.escape(normalize(name)) + r"(?![a-z0-9])", " ", remaining)
    remaining = re.sub(r"\b\d+[a-z]*\b", " ", remaining)
    return set(remaining.split()) - STOP_WORDS


async def direct_catalog_answer(question, history):
    """Câu số liệu có điều kiện rõ được tính bằng BE, không yêu cầu model đoán đối tượng đếm."""
    intent = question_intent(question)
    explicit_list = requested_product_limit(question) is not None
    if intent == "recommend" and not explicit_list:
        return None
    q = normalize(question)
    if intent == "factory_list" and not scent_keys(q) and not any(contains(q, phrase) for phrase in ("danh sach xuong", "cac xuong", "kham pha cac xuong")):
        return None
    catalog, factories = await asyncio.gather(load_catalog(include_unavailable=True), load_factories())
    factory = match_factory(question, factories, history)
    if needs_factory_name(question, factory):
        return "Mình chưa xác định được xưởng bạn đang hỏi. Bạn cho mình tên xưởng đúng như trên [danh sách xưởng](/factories) nhé.", []
    categories = {p.get("category") or "" for p in catalog} - {""}
    category = next((name for name in sorted(categories, key=len, reverse=True)
                     if contains(q, normalize(name)) and (normalize(name) != "tinh dau" or contains(q, "danh muc"))), "")
    if unresolved_catalog_terms(question, catalog, factories):
        return None  # Còn yêu cầu ngữ nghĩa chưa rõ: để model hiểu, không bỏ điều kiện của khách.
    if intent == "recommend":
        # Khách đã nêu số lượng và các điều kiện mua hàng: liệt kê đúng dữ liệu,
        # không bắt model chép lại từng sản phẩm hay tự đặt số lượng mặc định.
        intent = "product_list"
    if intent in ("stock", "detail", "price_rank") and not scent_keys(q) and not factory and not category:
        return None
    query = question
    descending = not any(contains(q, phrase) for phrase in ("re nhat", "gia thap nhat", "it nhat"))
    return await answer_catalog_question(query, intent, history, factories, catalog=catalog,
                                         result_limit=requested_product_limit(question), descending=descending,
                                         selected_factory=factory)


async def try_model_answer(question, history):
    # Danh sách với điều kiện rõ đã được direct_catalog_answer xử lý. Phần
    # còn lại như 'sản phẩm nào dịu mát cho phòng làm việc' cần tư vấn ngữ nghĩa.
    worker = consult_with_model if question_intent(question) in ("recommend", "product_list") else answer_with_model
    return await run_model_answer(question, history, worker)


async def run_model_answer(question, history, worker):
    """Giới hạn đồng thời và hủy đúng HTTP khi người dùng kết thúc hội thoại."""
    if not config.LLM_ENABLED or not has_model(await installed_models(), config.LLM_MODEL):
        return None
    if _conversation_lock.locked():
        return "Mình đang xử lý một lượt tư vấn khác. Bạn thử gửi lại sau một chút nhé.", []
    async with _conversation_lock:
        try:
            return await asyncio.wait_for(worker(question, history), timeout=config.CHAT_TIMEOUT)
        except CatalogUnavailable:
            raise
        except (OSError, ValueError, KeyError, TypeError, TimeoutError) as exc:
            detail = str(exc) if isinstance(exc, InvalidModelAnswer) else type(exc).__name__
            logger.warning("Chưa hoàn tất tư vấn bằng model chat: %s", detail)
            return "Mình chưa hoàn tất được lượt tư vấn này. Bạn thử gửi lại sau nhé; bạn vẫn có thể xem sản phẩm trực tiếp tại [danh sách sản phẩm](/products).", []


def render_advice(message, selections):
    if not selections:
        return message, []
    return format_products(selections, message)


async def consult_with_model(question, history):
    catalog, factories = await asyncio.gather(load_catalog(include_unavailable=True), load_factories())
    literal_factory = match_factory(question, factories, history)
    if needs_factory_name(question, literal_factory):
        return "Mình chưa xác định được xưởng bạn đang hỏi. Bạn kiểm tra lại tên trên [danh sách xưởng](/factories) nhé.", []
    query = effective_question(question, history, catalog)
    factory = literal_factory or match_factory(query, factories, history)
    report_progress("searching")
    candidates = await retrieve_advice_candidates(query, catalog, factory)
    count = requested_product_limit(question)
    if count == 0:
        return "Bạn muốn xem bao nhiêu sản phẩm? Hãy chọn từ 1 đến 12 sản phẩm mỗi lần nhé.", []
    report_progress("writing")
    message, selections = await write_advice(question, history, candidates, count or config.TOP_K, model_request,
        search_context=query,
        require_count=count is not None and not unresolved_catalog_terms(question, catalog, factories),
        recommend_required=bool(need_keys(normalize(query)) or scent_keys(normalize(query))))
    return render_advice(message, selections)


async def answer_with_model(question, history):
    catalog, factories = await asyncio.gather(load_catalog(include_unavailable=True), load_factories())
    literal_factory = match_factory(question, factories, history)
    if needs_factory_name(question, literal_factory):
        return "Mình chưa xác định được xưởng bạn đang hỏi. Bạn cho mình tên xưởng đúng như trên [danh sách xưởng](/factories) nhé.", []
    report_progress("understanding")
    plan = await plan_question(question, history, factories, model_request)
    if plan.operation in ("clarify", "general"):
        return plan.message, []
    report_progress("searching")
    # Tên xưởng khách nêu rõ được đối chiếu BE, tránh model chọn nhầm ID khác.
    factory = literal_factory or next((f for f in factories if f["id"] == plan.factory_id), None)
    query = plan.query
    if factory:
        query += " " + factory["name"]
    if plan.availability != "all":
        query += " " + ("còn hàng" if plan.availability == "in_stock" else "hết hàng")
    if plan.operation not in ("recommend", "advice", "compare"):
        return await answer_catalog_question(query, plan.operation, [], factories, catalog=catalog,
                                             result_limit=plan.limit, descending=plan.descending, selected_factory=factory)

    max_products = min(plan.limit or config.TOP_K, MAX_PRODUCT_RESULTS)
    price_bounds = budget(question)
    volume = re.search(r"(\d+)\s*ml\b", question.lower())
    candidates = await retrieve_advice_candidates(query, catalog, factory,
        price_bounds=price_bounds if price_bounds != (None, None) else None,
        volume_ml=int(volume[1]) if volume else None)
    report_progress("writing")
    message, selections = await write_advice(question, history, candidates, max_products, model_request)
    return render_advice(message, selections)


async def retrieve_advice_candidates(query, catalog, factory, *, price_bounds=None, volume_ml=None):
    # Chỉ lọc cứng điều kiện mua hàng. Hoàn cảnh sử dụng được tìm theo ngữ nghĩa
    # trên toàn bộ sản phẩm còn hàng phù hợp, không cắt 8 sản phẩm bằng từ khóa trước.
    minimum, maximum = price_bounds if price_bounds is not None else budget(query)
    terms = set(normalize(query).split()) - STOP_WORDS - set(re.findall(r"\d+", normalize(query)))
    if not terms and not factory and minimum is None and maximum is None and not re.search(r"\d+\s*ml\b", normalize(query)):
        return []  # Chưa có tiêu chí: để model hỏi thêm, không tìm cả catalog.
    intro = any(contains(normalize(query), phrase) for phrase in ("moi tim hieu", "chua biet chon", "chua biet nen chon", "tu van giup"))
    if intro and not has_clear_filters(query, catalog) and not select_products(query, catalog):
        return []
    filters = []
    if minimum is not None and maximum is not None:
        filters.append(f"từ {minimum:.0f}đ đến {maximum:.0f}đ")
    elif minimum is not None:
        filters.append(f"trên {minimum:.0f}đ")
    elif maximum is not None:
        filters.append(f"dưới {maximum:.0f}đ")
    volume = re.search(r"\d+\s*ml\b", normalize(query))
    selected_volume = volume_ml if volume_ml is not None else (int(volume[0].replace(" ", "").removesuffix("ml")) if volume else None)
    if selected_volume is not None:
        filters.append(f"{selected_volume}ml")
    pool = select_products(" ".join(filters), catalog, limit=None, allow_all=True,
                           factory_name=factory["name"] if factory else None)
    excluded = set()
    for match in re.finditer(r"(?:khong (?:thich |lay |can )?|ngoai tru |tru )(.*?)(?:nhung|thay bang|$)", normalize(query)):
        excluded.update(scent_keys(match[1]))
    pool = [p for p in pool if not scent_keys(normalize(p["name"])).intersection(excluded)]
    pool = filter_availability(query, pool)
    # Mùi được khách nêu rõ là điều kiện bắt buộc, không thay bằng mùi gần nghĩa.
    general_need = bool(need_keys(normalize(query))) and not (scent_keys(normalize(query)) - excluded)
    varied_scents = general_need and requested_product_limit(query) is None
    exact = select_products(query, pool, limit=None if varied_scents else MAX_PRODUCT_RESULTS, allow_all=True,
                            factory_name=factory["name"] if factory else None,
                            price_bounds=(minimum, maximum), volume_ml=selected_volume)
    q = normalize(query)
    if scent_keys(q) - excluded:
        return exact
    if exact and need_keys(q):
        if varied_scents:
            # Nhu cầu chung: đưa các nhóm mùi khác nhau cho model, tránh nhồi
            # nhiều bản cùng mùi từ các xưởng. Yêu cầu số lượng cụ thể vẫn giữ đủ.
            representatives = {}
            for product in sorted(exact, key=lambda p: (p["price"], p["id"])):
                family = tuple(sorted(scent_keys(normalize(product["name"]))))
                representatives.setdefault(family or (product["id"],), product)
            return list(representatives.values())[:MAX_PRODUCT_RESULTS]
        return exact
    if len(pool) > 1 and has_model(await installed_models(), config.EMBEDDING_MODEL):
        return await semantic_rerank(query, pool, limit=MAX_PRODUCT_RESULTS)
    return select_products(query, pool, limit=MAX_PRODUCT_RESULTS, allow_all=True,
                           factory_name=factory["name"] if factory else None,
                           price_bounds=(minimum, maximum), volume_ml=selected_volume)


async def ask_question(question, history=None):
    q = normalize(question)
    if q in ("chao", "xin chao", "hello", "hi", "alo"):
        return "Chào bạn! Bạn thích mùi hương nào hoặc muốn tìm trong khoảng giá bao nhiêu?", []
    if q in ("cam on", "cam on ban", "cam on nhe", "ok", "oke", "duoc roi") and not continuing_acknowledgement(question, history):
        return "Rất vui được hỗ trợ bạn. Khi cần tìm sản phẩm hoặc xem thông tin xưởng, bạn cứ nhắn nhé.", []
    if any(contains(q, s) for s in ("uong tinh dau", "chua benh", "tri benh", "tre so sinh", "mang thai")):
        return "Tinh dầu không thay thế thuốc. Mình không hướng dẫn uống tinh dầu hay dùng để điều trị bệnh. Bạn nên hỏi nhân viên y tế trước khi sử dụng trong trường hợp này.", []
    if any(contains(q, s) for s in ("giao hang", "van chuyen", "phi ship", "doi tra", "hoan tien")):
        return "Phí giao hàng được tính theo địa chỉ và giỏ hàng ở bước thanh toán. Với đổi trả hoặc hoàn tiền, bạn hãy mở đơn hàng trong tài khoản để xem lựa chọn hỗ trợ; mình chưa thể xác nhận thời gian hay mức phí ngoài thông tin hiển thị trên đơn.", []
    if any(contains(q, s) for s in ("nhan vien", "hotline", "lien he", "don hang cua toi")):
        return "Bạn có thể xem đơn trong tài khoản hoặc [gửi yêu cầu hỗ trợ](/support) kèm mã đơn để xưởng phản hồi. Mình chưa có quyền tra cứu đơn hay chuyển cuộc trò chuyện trực tiếp cho nhân viên.", []
    if any(contains(q, s) for s in ("cach dat phoi", "tu phoi", "phoi huong rieng", "tu thiet ke")):
        return "Mở [Phối hương](/custom-scent), chọn xưởng, nguyên liệu và tỷ lệ sao cho tổng bằng 100%, sau đó chọn dung tích và kiểm tra giá trước khi thêm vào giỏ. Chỉ nguyên liệu đang mở bán tại cùng xưởng mới được phối chung.", []
    direct = await direct_catalog_answer(question, history)
    if direct is not None:
        return direct
    answer = await try_model_answer(question, history)
    if answer is not None:
        return answer
    if q in ("tu van", "tu van giup toi", "goi y", "tim san pham", "tinh dau", "goi y san pham"):
        return "Phần tư vấn AI hiện chưa sẵn sàng. Mình vẫn có thể tra cứu sản phẩm theo mùi, xưởng, giá và dung tích. Bạn đang muốn tìm loại nào?", []
    intent = question_intent(question)
    factories = None
    # Giữ đúng ý định và sản phẩm khi khách trả lời tên xưởng hoặc hỏi tiếp về dung tích.
    if intent == "recommend" and history:
        previous = next((m["content"] for m in reversed(history or []) if m.get("role") == "user"), "")
        previous_intent = question_intent(previous)
        if previous_intent in ("product_count", "stock", "product_list", "detail"):
            factories = await load_factories()
            current_factory = match_factory(question, factories)
            followup = q.startswith("con ") or q.endswith("thi sao") or bool(re.search(r"\d+\s*ml\b", q))
            if current_factory or followup:
                intent = previous_intent
                selected_factory = current_factory or match_factory(previous, factories)
                topic = scent_keys(normalize(previous)) if not scent_keys(q) else set()
                question = " ".join(sorted(topic)) + " " + (selected_factory["name"] if selected_factory else "") + " " + question
    if intent != "recommend":
        return await answer_catalog_question(question, intent, history, factories)

    catalog = await load_catalog()
    question = effective_question(question, history, catalog)
    if not has_clear_filters(question, catalog):
        return "Phần tư vấn AI hiện chưa sẵn sàng nên mình chưa thể tư vấn đầy đủ câu hỏi này. Bạn vẫn có thể tra cứu theo tên mùi, xưởng, giá hoặc dung tích nhé.", []
    limit = requested_product_limit(question)
    if limit == 0:
        return "Bạn muốn xem bao nhiêu sản phẩm? Hãy chọn từ 1 đến 12 sản phẩm mỗi lần nhé.", []
    products = select_products(question, catalog, limit=limit if limit is not None else MAX_PRODUCT_RESULTS, allow_all=True)
    if not products:
        return "Mình chưa tìm thấy sản phẩm còn hàng phù hợp với yêu cầu này. Bạn thử đổi mùi hương, dung tích hoặc khoảng giá nhé.", []
    return format_products(products, "Kết quả tra cứu sản phẩm còn hàng:")


async def stream_question(question, history=None):
    reply, _ = await ask_question(question, history)
    for line in reply.splitlines(keepends=True):
        yield line


async def lookup_products(ids):
    result = []
    for product in await load_catalog():
        variants = product.get("variants") or []
        if product["id"] in ids and variants:
            variant = min(variants, key=lambda v: v["price"])
            result.append(product_item({**product, "price": variant["price"], "volumeMl": variant["mil"]}))
    return result
