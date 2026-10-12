import { faHeart } from "@fortawesome/free-regular-svg-icons";
import { faStar, faFire, faLeaf, faBagShopping, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useCallback, useEffect, useState } from "react";
import "../css/pages/products.css";
import {
    productService,
    type ProductCard,
    type FilterMeta,
    type ProductFilterParams,
} from "../api/ProductService";

// Helpers
const stockBadgeClass = (s: string) =>
    s === "Còn hàng" ? "stock-green" : s === "Sắp hết" ? "stock-yellow" : "stock-red";

const discountLabel = (basePrice: number, price: number) => {
    if (!basePrice || !price || basePrice <= price) return null;
    return `-${Math.round((1 - price / basePrice) * 100)}%`;
};

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

// Component
export default function ProductsPage() {
    // Filter meta (sidebar data)
    const [meta, setMeta] = useState<FilterMeta>({ categories: [], factories: [] });

    // Filter state
    const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
    const [selectedFactories, setSelectedFactories]   = useState<number[]>([]);
    const [priceRange, setPriceRange] = useState({ min: "", max: "" });
    const [pricePreset, setPricePreset] = useState<string>("");
    const [minRating, setMinRating] = useState<number | undefined>(undefined);
    const [sort, setSort] = useState("popular");

    // Products state
    const [products, setProducts]       = useState<ProductCard[]>([]);
    const [totalElements, setTotal]     = useState(0);
    const [totalPages, setTotalPages]   = useState(0);
    const [currentPage, setPage]        = useState(0);
    const [loading, setLoading]         = useState(false);

    // Load sidebar metadata một lần
    useEffect(() => {
        productService.getFilterMeta().then(setMeta).catch(console.error);
    }, []);

    // Lọc & lấy dữ liệu sản phẩm
    const fetchProducts = useCallback(async (page = 0) => {
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

            const params: ProductFilterParams = {
                categoryIds: selectedCategories.length ? selectedCategories : undefined,
                factoryIds: selectedFactories.length ? selectedFactories : undefined,
                minPrice,
                maxPrice,
                minRating,
                sort,
                page,
                size: 12,
            };

            const result = await productService.filterProducts(params);
            setProducts(result.products);
            setTotal(result.totalElements);
            setTotalPages(result.totalPages);
            setPage(result.currentPage);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [selectedCategories, selectedFactories, priceRange, pricePreset, minRating, sort]);

    // Fetch khi sort thay đổi (auto-apply)
    useEffect(() => { fetchProducts(0); }, [sort]);

    // Toggle helpers
    const toggleCategory = (id: number) =>
        setSelectedCategories((prev) =>
            prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
        );

    const toggleFactory = (id: number) =>
        setSelectedFactories((prev) =>
            prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
        );

    const handleReset = () => {
        setSelectedCategories([]);
        setSelectedFactories([]);
        setPriceRange({ min: "", max: "" });
        setPricePreset("");
        setMinRating(undefined);
        setSort("popular");
        fetchProducts(0);
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

                            <div className="d-flex gap-2">
                                <button className="btn btn-primary flex-grow-1 fw-bold" onClick={() => fetchProducts(0)} disabled={loading}>
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
                                    onChange={(e) => setSort(e.target.value)}
                                >
                                    <option value="popular">Mặc định (Phổ biến)</option>
                                    <option value="bestseller">Bán chạy nhất</option>
                                    <option value="price-asc">Giá: Thấp đến Cao</option>
                                    <option value="price-desc">Giá: Cao đến Thấp</option>
                                </select>
                            </div>
                        </div>

                        {/* Products grid */}
                        {loading ? (
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
                                    const label = discountLabel(product.basePrice, product.price);
                                    return (
                                        <div className="col" key={product.id}>
                                            <div className="card h-100 product-card border-0 shadow-sm rounded-4 overflow-hidden">
                                                <div className="position-relative">
                                                    <img
                                                        src={product.thumbnailUrl ?? "/images/home/lavender-france.png"}
                                                        className="card-img-top product-img"
                                                        alt={product.name}
                                                        onError={(e) => { (e.target as HTMLImageElement).src = "/images/home/lavender-france.png"; }}
                                                    />
                                                    <button className="btn btn-light bg-white rounded-circle position-absolute top-0 end-0 m-3 p-2 shadow-sm d-flex align-items-center justify-content-center text-muted fav-btn">
                                                        <FontAwesomeIcon icon={faHeart} />
                                                    </button>
                                                </div>
                                                <div className="card-body p-4 d-flex flex-column">
                                                    <div className="d-flex align-items-center gap-1 mb-2">
                                                        <FontAwesomeIcon icon={faStar} className="text-warning fs-7" />
                                                        <span className="fw-bold fs-7">{product.avgRating.toFixed(1)}</span>
                                                        <span className="text-muted fs-7">({product.totalSold}+ đã bán)</span>
                                                    </div>
                                                    <h5 className="card-title fs-6 fw-bold mb-1 product-title">{product.name}</h5>
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
                                                        <div className="d-flex align-items-center gap-2 mb-3">
                                                            {product.basePrice != null && product.price != null && product.basePrice > product.price && (
                                                                <span className="text-muted text-decoration-line-through fs-7">
                                                                    {product.basePrice.toLocaleString("vi-VN")}đ
                                                                </span>
                                                            )}
                                                            {label && (
                                                                <span className="badge bg-danger bg-opacity-10 text-danger fs-8 fw-bold">{label}</span>
                                                            )}
                                                        </div>
                                                        <div className="row g-2">
                                                            <div className="col-6">
                                                                <button
                                                                    className="btn btn-outline-primary w-100 fw-bold bg-white text-primary btn-add-cart d-flex align-items-center justify-content-center gap-2"
                                                                    disabled={product.stockStatus === "Hết hàng"}
                                                                >
                                                                    <FontAwesomeIcon icon={faBagShopping} /> Thêm giỏ
                                                                </button>
                                                            </div>
                                                            <div className="col-6">
                                                                <button
                                                                    className="btn btn-primary w-100 fw-bold btn-buy-now"
                                                                    disabled={product.stockStatus === "Hết hàng"}
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
                                            onClick={() => {
                                                fetchProducts(currentPage - 1);
                                                window.scrollTo({ top: 80, behavior: "smooth" });
                                            }}
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
                                                    onClick={() => {
                                                        fetchProducts(item);
                                                        window.scrollTo({ top: 80, behavior: "smooth" });
                                                    }}
                                                >
                                                    {item + 1}
                                                </button>
                                            </li>
                                        )
                                    )}

                                    <li>
                                        <button
                                            className="page-btn"
                                            onClick={() => {
                                                fetchProducts(currentPage + 1);
                                                window.scrollTo({ top: 80, behavior: "smooth" });
                                            }}
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
