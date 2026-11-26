import { clearProductsCache } from "../api/productsCache";
import { faSliders, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useLocation, useSearchParams } from "react-router";
import CatalogProductCard from "../components/product/CatalogProductCard";
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

// Component
export default function ProductsPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const factoryParam = searchParams.get("factoryId") || searchParams.get("factoryIds");
    const pageParam = searchParams.get("page");
    const currentPage = Math.max(0, (Number(pageParam) || 1) - 1);
    const sort = PRODUCT_SORT_OPTIONS.find((option) => option.value === searchParams.get("sort"))?.value ?? "popular";

    const location = useLocation();

    const cacheKey = getCacheKey(location.search);
    const scrollKey = getScrollKey(location.search);

    const cachedData = (() => {
        try {
            const raw = sessionStorage.getItem(cacheKey);
            if (raw) return JSON.parse(raw);
        } catch { /* Bộ nhớ trình duyệt không khả dụng; vẫn tải dữ liệu từ API. */ }
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
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [applied, setApplied] = useState({ selectedCategories, selectedFactories, priceRange, pricePreset, minRating });

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
        setApplied(previous => ({ ...previous, selectedFactories: next }));
    }, [factoryParam]);

    // Tải lại bộ lọc khi quay về tab để nhận các xưởng mới được thêm.
    useEffect(() => {
        let active = true;
        let loadingMeta = false;

        const loadMeta = async () => {
            if (loadingMeta || document.visibilityState !== "visible") return;
            loadingMeta = true;
            try {
                const nextMeta = await productService.getFilterMeta();
                if (active) setMeta(nextMeta);
            } catch (error) {
                console.error(error);
            } finally {
                loadingMeta = false;
            }
        };

        void loadMeta();
        window.addEventListener("focus", loadMeta);
        document.addEventListener("visibilitychange", loadMeta);
        return () => {
            active = false;
            window.removeEventListener("focus", loadMeta);
            document.removeEventListener("visibilitychange", loadMeta);
        };
    }, []);

    // Lọc & lấy dữ liệu sản phẩm
    const fetchProducts = useCallback(async (page: number) => {
        const { selectedCategories, selectedFactories, priceRange, pricePreset, minRating } = applied;
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

            const factoriesToUse = selectedFactories;

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
            } catch { /* Bộ nhớ trình duyệt không khả dụng; vẫn tải dữ liệu từ API. */ }
        } catch (err) {
            console.error(err);
        } finally {
            if (requestId === productRequestId.current) setLoading(false);
        }
    }, [applied, sort, cacheKey]);

    // Tự động fetch lại khi currentPage, sort hoặc factoryParam thay đổi
    useEffect(() => {
        fetchProducts(currentPage);
    }, [currentPage, fetchProducts]);

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
        setFiltersOpen(false);
        setSearchParams((previousParams) => {
            const nextParams = new URLSearchParams(previousParams);
            nextParams.delete("page");
            return nextParams;
        });
        setApplied({ selectedCategories, selectedFactories, priceRange, pricePreset, minRating });
        window.scrollTo({ top: 80, behavior: "smooth" });
    };

    const handleReset = () => {
        clearProductsCache();
        setSelectedCategories([]);
        setSelectedFactories([]);
        setPriceRange({ min: "", max: "" });
        setPricePreset("");
        setMinRating(undefined);
        setApplied({ selectedCategories: [], selectedFactories: [], priceRange: { min: "", max: "" }, pricePreset: "", minRating: undefined });
        setSearchParams(new URLSearchParams());
    };

    const activeFilterCount = selectedCategories.length + selectedFactories.length
        + (pricePreset || priceRange.min || priceRange.max ? 1 : 0)
        + (minRating ? 1 : 0);

    // Render
    return (
        <main className="products-page">
            <div className="products-container">
                <button
                    type="button"
                    className="products-filter-toggle"
                    aria-expanded={filtersOpen}
                    aria-controls="products-filters"
                    onClick={() => setFiltersOpen((open) => !open)}
                >
                    <FontAwesomeIcon icon={faSliders} />
                    Bộ lọc{activeFilterCount > 0 && <span>{activeFilterCount}</span>}
                </button>
                <div className="products-layout">

                    {/* Sidebar bộ lọc */}
                    <aside id="products-filters" className={`products-filters${filtersOpen ? " is-open" : ""}`}>
                        <div className="products-sidebar">
                            <div className="products-sidebar-heading">
                                <h2><FontAwesomeIcon icon={faSliders} /> Bộ lọc</h2>
                                <button type="button" className="products-reset-filters" onClick={handleReset}>Xóa lọc</button>
                            </div>

                            {/* Danh mục */}
                            <details className="filter-group" open>
                                <summary>
                                    <span>Danh mục</span>
                                    {selectedCategories.length > 0 && <span className="filter-summary-value">{selectedCategories.length} đã chọn</span>}
                                </summary>
                                <div className="filter-options">
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
                            </details>

                            {/* Khoảng giá */}
                            <details className="filter-group">
                                <summary>
                                    <span>Khoảng giá</span>
                                    <span className="filter-summary-value">{pricePreset || priceRange.min || priceRange.max ? "Đã chọn" : "Tất cả"}</span>
                                </summary>
                                <div className="filter-options filter-price-options">
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
                                <div className="filter-price-inputs">
                                    <input type="text" inputMode="numeric" aria-label="Giá thấp nhất" className="form-control form-control-sm" placeholder="Từ"
                                        value={priceRange.min}
                                        onChange={(e) => { setPriceRange({ ...priceRange, min: e.target.value }); setPricePreset(""); }}
                                    />
                                    <span className="text-muted">-</span>
                                    <input type="text" inputMode="numeric" aria-label="Giá cao nhất" className="form-control form-control-sm" placeholder="Đến"
                                        value={priceRange.max}
                                        onChange={(e) => { setPriceRange({ ...priceRange, max: e.target.value }); setPricePreset(""); }}
                                    />
                                </div>
                            </details>

                            {/* Đánh giá sao */}
                            <details className="filter-group">
                                <summary>
                                    <span>Đánh giá</span>
                                    <span className="filter-summary-value">{minRating ? `Từ ${minRating} sao` : "Tất cả"}</span>
                                </summary>
                                <select
                                    id="products-min-rating"
                                    aria-label="Đánh giá tối thiểu"
                                    className="form-select form-select-sm"
                                    value={minRating ?? ""}
                                    onChange={(event) => setMinRating(event.target.value ? Number(event.target.value) : undefined)}
                                >
                                    <option value="">Tất cả đánh giá</option>
                                    {[5, 4, 3, 2, 1].map((star) => (
                                        <option key={star} value={star}>{star === 5 ? "5 sao" : `Từ ${star} sao trở lên`}</option>
                                    ))}
                                </select>
                            </details>

                            {/* Xưởng sản xuất */}
                            <details className="filter-group">
                                <summary>
                                    <span>Xưởng sản xuất</span>
                                    <span className="filter-summary-value">{selectedFactories.length > 0 ? `${selectedFactories.length} đã chọn` : `${meta.factories.length} xưởng`}</span>
                                </summary>
                                <div className="filter-options products-factory-options">
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
                            </details>

                            <div className="products-sidebar-footer">
                                <button className="btn btn-primary w-100 fw-bold" onClick={handleApplyFilters} disabled={loading}>
                                    {loading ? <FontAwesomeIcon icon={faSpinner} spin /> : "Lọc sản phẩm"}
                                </button>
                            </div>
                        </div>
                    </aside>

                    {/* Danh sách sản phẩm */}
                    <section className="products-results" aria-label="Danh sách sản phẩm">
                        {/* Sort & count */}
                        <div className="products-toolbar">
                            <p className="products-result-count" role="status">
                                Hiển thị <strong>{products.length}</strong> / <strong>{totalElements}</strong> sản phẩm
                            </p>
                            <div className="products-sort">
                                <label htmlFor="products-sort">Sắp xếp:</label>
                                <select
                                    id="products-sort"
                                    className="form-select form-select-sm"
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
                            <div className="products-grid">
                                {products.map((product) => (
                                    <CatalogProductCard key={product.id} product={product} />
                                ))}
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
