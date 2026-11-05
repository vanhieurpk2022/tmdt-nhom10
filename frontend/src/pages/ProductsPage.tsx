import { faHeart } from "@fortawesome/free-regular-svg-icons";
import { faStar, faFire, faLeaf, faBagShopping, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useNavigationType, useSearchParams } from "react-router";
import { useAuth } from "../api/AuthContext";
import { useCart } from "../api/CartContext";
import { cartService } from "../api/CartService";
import { getBuyNowUrl, getPurchaseErrorMessage } from "../api/CheckoutSelection";
import { ROUTES } from "../routes/routes";
import "../css/pages/products.css";
import {
    productService,
    type ProductCard,
    type FilterMeta,
    type ProductFilterParams,
} from "../api/ProductService";

// Helpers
const PRODUCT_SORT_OPTIONS = [
    { value: "popular", label: "Mặc định (Phổ biến)" },
    { value: "newest", label: "Sản phẩm mới về" },
    { value: "bestseller", label: "Bán chạy nhất" },
    { value: "most-viewed", label: "Xem nhiều nhất" },
    { value: "price-asc", label: "Giá: Thấp đến Cao" },
    { value: "price-desc", label: "Giá: Cao đến Thấp" },
] as const;

const stockBadgeClass = (s: string) =>
    s === "Còn hàng" ? "stock-green" : s === "Sắp hết" ? "stock-yellow" : "stock-red";

const getPaginationItems = (currentPage: number, totalPages: number): (number | string)[] => {
    if (totalPages <= 7) {
        return Array.from({ length: totalPages }, (_, i) => i);
    }
    const delta = 1;
    const range: number[] = [];
    for (
        let i = Math.max(1, currentPage - delta);
        i <= Math.min(totalPages - 2, currentPage + delta);
        i++
    ) {
        range.push(i);
    }

    const items: (number | string)[] = [0];
    if (range[0] > 1) items.push("...");
    range.forEach((i) => items.push(i));
    if (range[range.length - 1] < totalPages - 2) items.push("...");
    items.push(totalPages - 1);
    return items;
};

// Caching helpers để ghi nhớ danh sách sản phẩm & vị trí cuộn
const getCacheKey = (search: string) => `products_cache_${search}`;
const getScrollKey = (search: string) => `products_scroll_${search}`;

export function clearProductsCache() {
    try {
        const keysToRemove: string[] = [];
        for (let i = 0; i < sessionStorage.length; i++) {
            const k = sessionStorage.key(i);
            if (k && (k.startsWith("products_cache_") || k.startsWith("products_scroll_"))) {
                keysToRemove.push(k);
            }
        }
        keysToRemove.forEach((k) => sessionStorage.removeItem(k));
    } catch {
        // ignore
    }
}

// Component
export default function ProductsPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const factoryParam = searchParams.get("factoryId") || searchParams.get("factoryIds");
    const pageParam = searchParams.get("page");
    const currentPage = Math.max(0, (Number(pageParam) || 1) - 1);
    const sort = PRODUCT_SORT_OPTIONS.find((option) => option.value === searchParams.get("sort"))?.value ?? "popular";

    const navigate = useNavigate();
    const location = useLocation();
    const { user, loading: authLoading } = useAuth();
    const { applyCart, showCartNotice } = useCart();
    const [addingProductIds, setAddingProductIds] = useState<number[]>([]);

    const cacheKey = getCacheKey(location.search);
    const scrollKey = getScrollKey(location.search);

    const cachedData = (() => {
        try {
            const raw = sessionStorage.getItem(cacheKey);
            if (raw) return JSON.parse(raw);
        } catch { }
        return null;
    })();

    const handleSortChange = (value: string) => {
        setSearchParams((previousParams) => {
            const nextParams = new URLSearchParams(previousParams);
            if (value === "popular") nextParams.delete("sort");
            else nextParams.set("sort", value);
            nextParams.delete("page");
            return nextParams;
        });
        window.scrollTo({ top: 80, behavior: "smooth" });
    };

    const handlePageChange = (newPage: number) => {
        setSearchParams((previousParams) => {
            const nextParams = new URLSearchParams(previousParams);
            if (newPage === 0) {
                nextParams.delete("page");
            } else {
                nextParams.set("page", (newPage + 1).toString());
            }
            return nextParams;
        });
        window.scrollTo({ top: 80, behavior: "smooth" });
    };

    const handleAddToCart = async (product: ProductCard) => {
        if (!user) {
            navigate(ROUTES.LOGIN, { state: { from: location } });
            return;
        }
        if (addingProductIds.includes(product.id)) return;
        setAddingProductIds((ids) => [...ids, product.id]);
        try {
            const cart = await cartService.addItem({ productId: product.id, quantity: 1 });
            applyCart(cart);
            showCartNotice(`Đã thêm ${product.name} vào giỏ hàng.`);
        } catch (error) {
            showCartNotice(getPurchaseErrorMessage(error, "Chưa thêm được sản phẩm vào giỏ hàng."), "error");
        } finally {
            setAddingProductIds((ids) => ids.filter((id) => id !== product.id));
        }
    };

    const handleBuyNow = (product: ProductCard) => {
        const checkoutUrl = getBuyNowUrl({ productId: product.id, quantity: 1 });
        if (!user) {
            navigate(ROUTES.LOGIN, { state: { from: checkoutUrl } });
            return;
        }
        navigate(checkoutUrl);
    };

    // Filter meta (sidebar data)
    const [meta, setMeta] = useState<FilterMeta>({ categories: [], factories: [] });

    // Filter state
    const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
    const [selectedFactories, setSelectedFactories] = useState<number[]>(() => {
        if (!factoryParam) return [];
        return factoryParam.split(",").map((id) => Number(id.trim())).filter((id) => !isNaN(id) && id > 0);
    });
    const [priceRange, setPriceRange] = useState({ min: "", max: "" });
    const [pricePreset, setPricePreset] = useState<string>("");
    const [minRating, setMinRating] = useState<number | undefined>(undefined);

    // Products state
    const [products, setProducts] = useState<ProductCard[]>(() => cachedData?.products || []);
    const [totalElements, setTotal] = useState(() => cachedData?.totalElements || 0);
    const [totalPages, setTotalPages] = useState(() => cachedData?.totalPages || 0);
    const [loading, setLoading] = useState(false);
    const productRequestId = useRef(0);

    // Lưu vị trí cuộn theo từng URL query / trang
    useEffect(() => {
        const onScroll = () => {
            if (window.scrollY > 0) {
                sessionStorage.setItem(scrollKey, window.scrollY.toString());
            }
        };
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => {
            window.removeEventListener("scroll", onScroll);
        };
    }, [scrollKey]);

    // Khôi phục vị trí cuộn khi render
    useLayoutEffect(() => {
        const savedScroll = sessionStorage.getItem(scrollKey);
        if (savedScroll) {
            const top = parseInt(savedScroll, 10);
            if (top > 0) {
                window.scrollTo({ top, behavior: "instant" });
                const timer = setTimeout(() => {
                    window.scrollTo({ top, behavior: "instant" });
                }, 50);
                return () => clearTimeout(timer);
            }
        }
    }, [scrollKey, products.length]);

    // Cập nhật selectedFactories khi URL query param thay đổi từ bên ngoài (ví dụ bấm từ trang chủ)
    useEffect(() => {
        const next = factoryParam
            ? factoryParam.split(",").map((id) => Number(id.trim())).filter((id) => !isNaN(id) && id > 0)
            : [];
        setSelectedFactories(next);
    }, [factoryParam]);

    // Load sidebar metadata một lần
    useEffect(() => {
        productService.getFilterMeta().then(setMeta).catch(console.error);
    }, []);

    // Lọc & lấy dữ liệu sản phẩm
    const fetchProducts = useCallback(async (page: number, overrideFactories?: number[]) => {
        const requestId = ++productRequestId.current;
        setLoading(true);
        try {
            // Xử lý preset giá
            let minPrice: number | undefined;
            let maxPrice: number | undefined;
            if (pricePreset === "under250") { maxPrice = 250000; }
            else if (pricePreset === "250to500") { minPrice = 250000; maxPrice = 500000; }
            else if (pricePreset === "over500") { minPrice = 500000; }
            else {
                if (priceRange.min) minPrice = Number(priceRange.min.replace(/\D/g, ""));
                if (priceRange.max) maxPrice = Number(priceRange.max.replace(/\D/g, ""));
            }

            const factoriesToUse = overrideFactories !== undefined ? overrideFactories : selectedFactories;

            const params: ProductFilterParams = {
                categoryIds: selectedCategories.length ? selectedCategories : undefined,
                factoryIds: factoriesToUse.length ? factoriesToUse : undefined,
                minPrice,
                maxPrice,
                minRating,
                sort,
                page,
                size: 12,
            };

            const result = await productService.filterProducts(params);
            if (requestId !== productRequestId.current) return;
            setProducts(result.products);
            setTotal(result.totalElements);
            setTotalPages(result.totalPages);

            try {
                sessionStorage.setItem(cacheKey, JSON.stringify({
                    products: result.products,
                    totalElements: result.totalElements,
                    totalPages: result.totalPages,
                }));
            } catch { }
        } catch (err) {
            console.error(err);
        } finally {
            if (requestId === productRequestId.current) setLoading(false);
        }
    }, [selectedCategories, selectedFactories, priceRange, pricePreset, minRating, sort, cacheKey]);

    // Tự động fetch lại khi currentPage, sort hoặc factoryParam thay đổi
    useEffect(() => {
        fetchProducts(currentPage);
    }, [currentPage, sort, factoryParam]);

    // Toggle helpers
    const toggleCategory = (id: number) =>
        setSelectedCategories((prev) =>
            prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
        );

    const toggleFactory = (id: number) =>
        setSelectedFactories((prev) =>
            prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
        );

    const handleApplyFilters = () => {
        setSearchParams((previousParams) => {
            const nextParams = new URLSearchParams(previousParams);
            nextParams.delete("page");
            return nextParams;
        });
        fetchProducts(0);
        window.scrollTo({ top: 80, behavior: "smooth" });
    };

    const handleReset = () => {
        clearProductsCache();
        setSelectedCategories([]);
        setSelectedFactories([]);
        setPriceRange({ min: "", max: "" });
        setPricePreset("");
        setMinRating(undefined);
        setSearchParams(new URLSearchParams());
    };

    // Render
    return (
        <main className="products-page bg-light py-4">
            <div className="container-fluid px-4 px-lg-5">
                <div className="row g-4">

                    {/* Sidebar bộ lọc */}
                    <aside className="col-12 col-lg-3">
                        <div className="bg-white p-4 rounded-3 shadow-sm products-sidebar">
                            <div className="d-flex align-items-center mb-4">
                                <h5 className="mb-0 fw-bold d-flex align-items-center gap-2">
                                    <svg className="text-primary" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
                                    Bộ lọc tìm kiếm
                                </h5>
                            </div>

                            {/* Danh mục */}
                            <div className="filter-group mb-4">
                                <h6 className="filter-title fs-7 text-uppercase text-muted fw-bold mb-3">Danh mục</h6>
                                <div className="d-flex flex-column gap-2">
                                    {meta.categories.map((cat) => (
                                        <label key={cat.id} className="d-flex align-items-center custom-checkbox">
                                            <input
                                                type="checkbox"
                                                className="form-check-input me-2"
                                                checked={selectedCategories.includes(cat.id)}
                                                onChange={() => toggleCategory(cat.id)}
                                            />
                                            {cat.name}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Khoảng giá */}
                            <div className="filter-group mb-4">
                                <h6 className="filter-title fs-7 text-uppercase text-muted fw-bold mb-3">Khoảng giá (VNĐ)</h6>
                                <div className="d-flex flex-column gap-2 mb-3">
                                    {[
                                        { val: "under250", label: "Dưới 250.000đ" },
                                        { val: "250to500", label: "250.000đ - 500.000đ" },
                                        { val: "over500", label: "Trên 500.000đ" },
                                    ].map(({ val, label }) => (
                                        <label key={val} className="custom-radio">
                                            <input
                                                type="radio"
                                                name="price"
                                                className="form-check-input me-2"
                                                checked={pricePreset === val}
                                                onChange={() => { setPricePreset(val); setPriceRange({ min: "", max: "" }); }}
                                            />
                                            {label}
                                        </label>
                                    ))}
                                </div>
                                <div className="d-flex align-items-center gap-2">
                                    <input type="text" className="form-control form-control-sm" placeholder="Từ"
                                        value={priceRange.min}
                                        onChange={(e) => { setPriceRange({ ...priceRange, min: e.target.value }); setPricePreset(""); }}
                                    />
                                    <span className="text-muted">-</span>
                                    <input type="text" className="form-control form-control-sm" placeholder="Đến"
                                        value={priceRange.max}
                                        onChange={(e) => { setPriceRange({ ...priceRange, max: e.target.value }); setPricePreset(""); }}
                                    />
                                </div>
                            </div>

                            {/* Đánh giá sao */}
                            <div className="filter-group mb-4">
                                <h6 className="filter-title fs-7 text-uppercase text-muted fw-bold mb-3">Đánh giá sao</h6>
                                <div className="d-flex flex-column gap-2">
                                    {[5, 4, 3, 2, 1].map((star) => (
                                        <label key={star} className="d-flex align-items-center gap-2 custom-checkbox">
                                            <input
                                                type="checkbox"
                                                className="form-check-input"
                                                checked={minRating === star}
                                                onChange={() => setMinRating(minRating === star ? undefined : star)}
                                            />
                                            <div className="text-warning fs-7">
                                                {Array.from({ length: 5 }).map((_, i) => (
                                                    <FontAwesomeIcon key={i} icon={faStar} className={i < star ? "text-warning" : "text-muted opacity-25"} />
                                                ))}
                                            </div>
                                            <span className="text-muted fs-7">({star} sao)</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Gian hàng */}
                            <div className="filter-group mb-4">
                                <h6 className="filter-title fs-7 text-uppercase text-muted fw-bold mb-3">Gian hàng</h6>
                                <div className="d-flex flex-column gap-2">
                                    {meta.factories.map((fac) => (
                                        <label key={fac.id} className="d-flex align-items-center custom-checkbox">
                                            <input
                                                type="checkbox"
                                                className="form-check-input me-2"
                                                checked={selectedFactories.includes(fac.id)}
                                                onChange={() => toggleFactory(fac.id)}
                                            />
                                            {fac.name}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="d-flex gap-2 products-sidebar-footer">
                                <button className="btn btn-primary flex-grow-1 fw-bold" onClick={handleApplyFilters} disabled={loading}>
                                    {loading ? <FontAwesomeIcon icon={faSpinner} spin /> : "Áp dụng"}
                                </button>
                                <button className="btn btn-light border fw-bold text-muted" onClick={handleReset}>Đặt lại</button>
                            </div>
                        </div>
                    </aside>

                    {/* Danh sách sản phẩm */}
                    <section className="col-12 col-lg-9">
                        {/* Search tags */}
                        <div className="d-flex align-items-center gap-2 mb-4 flex-wrap">
                            <span className="text-muted fs-7"><FontAwesomeIcon icon={faFire} className="text-warning me-1" /> Gợi ý tìm kiếm:</span>
                            <div className="d-flex gap-2 flex-wrap search-tags">
                                {["Ngủ ngon", "Đuổi muỗi", "Trị liệu stress", "Sả Java", "Máy khuếch tán gốm"].map((tag) => (
                                    <span key={tag} className="badge bg-white text-dark border rounded-pill px-3 py-2 fw-normal">{tag}</span>
                                ))}
                            </div>
                        </div>

                        {/* Sort & count */}
                        <div className="d-flex flex-column flex-sm-row justify-content-sm-between align-items-sm-center gap-3 mb-4">
                            <p className="text-muted fs-7 mb-0">
                                Hiển thị <strong>{products.length}</strong> / <strong>{totalElements}</strong> sản phẩm phù hợp tiêu chí
                            </p>
                            <div className="d-flex align-items-center gap-2">
                                <span className="text-muted fs-7 text-nowrap">Sắp xếp:</span>
                                <select
                                    className="form-select form-select-sm border-0 bg-white shadow-sm fw-semibold text-dark px-3 py-2 rounded-pill"
                                    style={{ minWidth: "180px", cursor: "pointer" }}
                                    value={sort}
                                    onChange={(e) => handleSortChange(e.target.value)}
                                >
                                    {PRODUCT_SORT_OPTIONS.map((option) => (
                                        <option key={option.value} value={option.value}>{option.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Products grid */}
                        {loading && products.length === 0 ? (
                            <div className="d-flex justify-content-center py-5">
                                <FontAwesomeIcon icon={faSpinner} spin size="2x" className="text-primary" />
                            </div>
                        ) : products.length === 0 ? (
                            <div className="text-center py-5 text-muted">
                                <p className="fs-5">Không tìm thấy sản phẩm phù hợp.</p>
                                <button className="btn btn-outline-primary" onClick={handleReset}>Xóa bộ lọc</button>
                            </div>
                        ) : (
                            <div className="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-4">
                                {products.map((product) => {
                                    return (
                                        <div className="col" key={product.id}>
                                            <div className="card h-100 product-card border-0 shadow-sm rounded-4 overflow-hidden">
                                                {/* Ảnh sản phẩm - click để xem chi tiết */}
                                                <div className="position-relative">
                                                    <Link to={`/product-detail/${product.id}`}>
                                                        <img
                                                            src={product.thumbnailUrl ?? "/images/home/lavender-france.png"}
                                                            className="card-img-top product-img"
                                                            alt={product.name}
                                                            onError={(e) => { (e.target as HTMLImageElement).src = "/images/home/lavender-france.png"; }}
                                                        />
                                                    </Link>
                                                    <button className="btn btn-light bg-white rounded-circle position-absolute top-0 end-0 m-3 p-2 shadow-sm d-flex align-items-center justify-content-center text-muted fav-btn">
                                                        <FontAwesomeIcon icon={faHeart} />
                                                    </button>
                                                </div>
                                                <div className="card-body p-4 d-flex flex-column">
                                                    <div className="d-flex align-items-center gap-1 mb-2">
                                                        <FontAwesomeIcon icon={faStar} className="text-warning fs-7" />
                                                        <span className="fw-bold fs-7">{product.avgRating.toFixed(1)}</span>
                                                        <span className="text-muted fs-7">
                                                            ({product.totalSold}+ đã bán{product.views ? ` • ${product.views.toLocaleString("vi-VN")} lượt xem` : ""})
                                                        </span>
                                                    </div>
                                                    <h5 className="card-title fs-6 fw-bold mb-1 product-title">
                                                        <Link to={`/product-detail/${product.id}`} className="text-dark text-decoration-none hover-primary">
                                                            {product.name}
                                                        </Link>
                                                    </h5>
                                                    <p className="card-text text-muted fs-7 mb-3 product-desc">{product.description}</p>

                                                    <div className="mt-auto">
                                                        {product.factoryName && (
                                                            <div className="d-flex align-items-center gap-2 mb-3 text-muted fs-7">
                                                                <FontAwesomeIcon icon={faLeaf} className="text-success" />
                                                                <span>{product.factoryName}</span>
                                                            </div>
                                                        )}
                                                        <div className="d-flex justify-content-between align-items-end mb-1">
                                                            <span className="fs-5 fw-bold text-dark">
                                                                {product.price ? `${product.price.toLocaleString("vi-VN")}đ` : "Liên hệ"}{" "}
                                                                <span className="fs-7 fw-normal text-muted">/10ml</span>
                                                            </span>
                                                            <span className={`badge rounded-pill fw-normal px-2 py-1 ${stockBadgeClass(product.stockStatus)}`}>
                                                                {product.stockStatus}
                                                            </span>
                                                        </div>
                                                        <div className="row g-2">
                                                            <div className="col-6">
                                                                <button
                                                                    className="btn btn-outline-primary w-100 fw-bold bg-white text-primary btn-add-cart d-flex align-items-center justify-content-center gap-2"
                                                                    onClick={() => handleAddToCart(product)}
                                                                    disabled={authLoading || addingProductIds.includes(product.id) || product.stockStatus === "Hết hàng"}
                                                                >
                                                                    <FontAwesomeIcon icon={addingProductIds.includes(product.id) ? faSpinner : faBagShopping} spin={addingProductIds.includes(product.id)} /> Thêm giỏ
                                                                </button>
                                                            </div>
                                                            <div className="col-6">
                                                                <button
                                                                    className="btn btn-primary w-100 fw-bold btn-buy-now"
                                                                    onClick={() => handleBuyNow(product)}
                                                                    disabled={authLoading || addingProductIds.includes(product.id) || product.stockStatus === "Hết hàng"}
                                                                >
                                                                    Mua ngay
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <nav className="mt-5 d-flex justify-content-center">
                                <ul className="custom-pagination">
                                    <li>
                                        <button
                                            className="page-btn"
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={currentPage === 0}
                                            title="Trang trước"
                                        >
                                            ‹
                                        </button>
                                    </li>

                                    {getPaginationItems(currentPage, totalPages).map((item, idx) =>
                                        typeof item === "string" ? (
                                            <li key={`ellipsis-${idx}`} className="page-ellipsis">
                                                …
                                            </li>
                                        ) : (
                                            <li key={item}>
                                                <button
                                                    className={`page-btn ${item === currentPage ? "active" : ""}`}
                                                    onClick={() => handlePageChange(item)}
                                                >
                                                    {item + 1}
                                                </button>
                                            </li>
                                        )
                                    )}

                                    <li>
                                        <button
                                            className="page-btn"
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            disabled={currentPage === totalPages - 1}
                                            title="Trang sau"
                                        >
                                            ›
                                        </button>
                                    </li>
                                </ul>
                            </nav>
                        )}
                    </section>
                </div>
            </div>
        </main>
    );
}
