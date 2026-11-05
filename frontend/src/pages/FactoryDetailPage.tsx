import { QueryClient, useQuery } from "@tanstack/react-query";
import { Link, useParams, useSearchParams } from "react-router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faArrowRight, faBoxArchive, faIndustry, faLocationDot, faStar } from "@fortawesome/free-solid-svg-icons";
import { FactoryApiService } from "../api/FactoryService";
import { productService } from "../api/ProductService";
import { ROUTES } from "../routes/routes";
import "../css/pages/factory-detail.css";

const PAGE_SIZE = 12;
const SORT_OPTIONS = [
    ["popular", "Mặc định"],
    ["newest", "Mới nhất"],
    ["bestseller", "Bán chạy nhất"],
    ["price-asc", "Giá thấp đến cao"],
    ["price-desc", "Giá cao đến thấp"],
] as const;
const FALLBACK_IMAGE = "/images/home/lavender-france.png";
const factoryStoreClient = new QueryClient();

function positiveInteger(value: string | null) {
    const number = Number(value);
    return Number.isSafeInteger(number) && number > 0 ? number : undefined;
}

export default function FactoryDetailPage() {
    const { id } = useParams();
    const factoryId = positiveInteger(id ?? null);
    const [params, setParams] = useSearchParams();
    const categoryId = positiveInteger(params.get("category"));
    const page = (positiveInteger(params.get("page")) ?? 1) - 1;
    const requestedSort = params.get("sort");
    const sort = SORT_OPTIONS.find(([value]) => value === requestedSort)?.[0] ?? "popular";
    const factoryQuery = useQuery({
        queryKey: ["factory-store", factoryId],
        queryFn: () => Promise.all([
            FactoryApiService.getFactoryDetail(factoryId!),
            FactoryApiService.getFactoryCategories(factoryId!),
        ]),
        enabled: Boolean(factoryId),
        retry: false,
    }, factoryStoreClient);
    const productsQuery = useQuery({
        queryKey: ["factory-store-products", factoryId, categoryId, sort, page],
        queryFn: () => productService.filterProducts({
            factoryIds: [factoryId!],
            categoryIds: categoryId ? [categoryId] : undefined,
            sort,
            page,
            size: PAGE_SIZE,
        }),
        enabled: Boolean(factoryId) && factoryQuery.isSuccess,
        retry: false,
    }, factoryStoreClient);
    const factory = factoryQuery.data?.[0];
    const categories = factoryQuery.data?.[1] ?? [];
    const catalog = productsQuery.data;
    const loadingProducts = productsQuery.isPending;
    const factoryStatus = (factoryQuery.error as { response?: { status?: number } } | null)?.response?.status;

    function selectCategory(nextId?: number) {
        const next = new URLSearchParams(params);
        if (nextId) next.set("category", String(nextId));
        else next.delete("category");
        next.delete("page");
        setParams(next);
    }

    function changePage(nextPage: number) {
        const next = new URLSearchParams(params);
        next.set("page", String(nextPage + 1));
        setParams(next);
        document.getElementById("factory-products")?.scrollIntoView({ block: "start" });
    }

    const selectedCategory = categories.find((category) => category.id === categoryId);
    const pagination = catalog ? [...new Set([0, page - 1, page, page + 1, catalog.totalPages - 1])]
        .filter((index) => index >= 0 && index < catalog.totalPages).sort((left, right) => left - right) : [];

    if (factoryId && factoryQuery.isPending) {
        return <div className="factory-detail-page text-center py-5" role="status">
            <div className="spinner-border text-danger" /><p className="mt-3">Đang tải thông tin xưởng...</p>
        </div>;
    }

    if (!factoryId || factoryQuery.isError || !factory) {
        return <div className="factory-detail-page text-center py-5">
            <FontAwesomeIcon icon={faIndustry} className="display-4 text-secondary mb-3" />
            <h1 className="h4" role="alert">{!factoryId || factoryStatus === 404 ? "Không tìm thấy xưởng." : "Không thể tải thông tin xưởng. Vui lòng thử lại."}</h1>
            <div className="d-flex gap-3 justify-content-center mt-3">
                <Link to={ROUTES.FACTORIES} className="btn btn-outline-secondary">Danh sách xưởng</Link>
                {factoryId && <button type="button" className="btn btn-danger" onClick={() => factoryQuery.refetch()}>Thử lại</button>}
            </div>
        </div>;
    }

    return (
        <div className="factory-detail-page">
            <div className="factory-store-banner">
                {factory.bannerUrl && <img src={factory.bannerUrl} alt={`Không gian ${factory.name}`} />}
            </div>
            <div className="container px-3 px-lg-4">
                <section className="factory-store-profile" aria-label="Thông tin xưởng">
                    <Link to={ROUTES.FACTORIES} className="factory-store-back">
                        <FontAwesomeIcon icon={faArrowLeft} /> Tất cả xưởng
                    </Link>
                    <div className="factory-store-identity">
                        <div className="factory-store-avatar">
                            {factory.avatarUrl ? <img src={factory.avatarUrl} alt={factory.name} /> : <FontAwesomeIcon icon={faIndustry} />}
                        </div>
                        <div className="flex-grow-1">
                            <span className="factory-store-eyebrow">Gian hàng nhà xưởng</span>
                            <h1>{factory.name}</h1>
                            <p className="text-secondary mb-0"><FontAwesomeIcon icon={faLocationDot} className="text-danger me-2" />{factory.address || "Chưa cập nhật địa chỉ"}</p>
                        </div>
                        <div className="factory-store-count"><strong>{factory.productCount}</strong><span>sản phẩm</span></div>
                    </div>
                    <p className="factory-store-description">{factory.description || "Khám phá danh mục và các sản phẩm tinh dầu từ xưởng."}</p>
                    {factory.galleryImages?.length > 0 && <div className="factory-store-gallery" aria-label="Hình ảnh xưởng">
                        {factory.galleryImages.map((url, index) => <a key={`${url}-${index}`} href={url} target="_blank" rel="noreferrer">
                            <img src={url} alt={`Hình ảnh ${factory.name} ${index + 1}`} loading="lazy" />
                        </a>)}
                    </div>}
                </section>

                <div className="factory-store-catalog" id="factory-products">
                    <aside className="factory-store-categories" aria-label="Danh mục của xưởng">
                        <h2>Danh mục của xưởng</h2>
                        <button type="button" className={!categoryId ? "active" : ""} aria-pressed={!categoryId} onClick={() => selectCategory()}>
                            <span>Tất cả sản phẩm</span><span>{factory.productCount}</span>
                        </button>
                        {categories.map((category) => <button key={category.id} type="button" className={categoryId === category.id ? "active" : ""}
                            aria-pressed={categoryId === category.id} onClick={() => selectCategory(category.id)}>
                            <span>{category.name}</span><span>{category.productCount}</span>
                        </button>)}
                        {categories.length === 0 && <p className="text-secondary small mt-3 mb-0">Xưởng chưa có danh mục sản phẩm.</p>}
                    </aside>

                    <section className="factory-store-products" aria-labelledby="factory-products-title">
                        <div className="factory-store-toolbar">
                            <div><h2 id="factory-products-title">{selectedCategory?.name || (categoryId ? "Sản phẩm theo danh mục" : "Tất cả sản phẩm")}</h2>
                                <p className="text-secondary small mb-0" aria-live="polite">{loadingProducts ? "Đang tải sản phẩm..." : `${catalog?.totalElements ?? 0} sản phẩm tại ${factory.name}`}</p>
                            </div>
                            <div className="d-flex align-items-center gap-2">
                                <label htmlFor="factory-sort" className="small text-secondary text-nowrap">Sắp xếp</label>
                                <select id="factory-sort" className="form-select form-select-sm" value={sort} onChange={(event) => {
                                    const next = new URLSearchParams(params);
                                    next.set("sort", event.target.value);
                                    next.delete("page");
                                    setParams(next);
                                }}>{SORT_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
                            </div>
                        </div>

                        {loadingProducts ? <div className="factory-store-empty" role="status"><div className="spinner-border text-danger" /><p>Đang tải sản phẩm của xưởng...</p></div>
                            : productsQuery.isError ? <div className="factory-store-empty" role="alert"><p>Không thể tải sản phẩm của xưởng. Vui lòng thử lại.</p><button type="button" className="btn btn-outline-danger" onClick={() => productsQuery.refetch()}>Thử lại</button></div>
                                : !catalog?.products.length ? <div className="factory-store-empty">
                                    <FontAwesomeIcon icon={faBoxArchive} className="fs-1 text-secondary" />
                                    <h3 className="h5 mt-3">Chưa có sản phẩm</h3>
                                    <p>{categoryId ? "Không có sản phẩm thuộc danh mục này tại xưởng." : "Xưởng chưa có sản phẩm để hiển thị."}</p>
                                    {(categoryId || page > 0) && <button type="button" className="btn btn-outline-danger" onClick={() => selectCategory()}>Xem tất cả sản phẩm của xưởng</button>}
                                </div> : <>
                                    <div className="factory-store-grid">
                                        {catalog.products.map((product) => <article key={product.id} className="factory-store-product">
                                            <Link to={`${ROUTES.PRODUCT_DETAIL}/${product.id}`} className="factory-store-product-image">
                                                <img src={product.thumbnailUrl || FALLBACK_IMAGE} alt={product.name} loading="lazy" onError={(event) => {
                                                    if (!event.currentTarget.src.endsWith(FALLBACK_IMAGE)) {
                                                        event.currentTarget.src = FALLBACK_IMAGE;
                                                    }
                                                }} />
                                            </Link>
                                            <div className="factory-store-product-body">
                                                <h3><Link to={`${ROUTES.PRODUCT_DETAIL}/${product.id}`}>{product.name}</Link></h3>
                                                <div className="factory-store-rating"><FontAwesomeIcon icon={faStar} /><span>{product.avgRating.toFixed(1)}</span><span className="text-secondary">Đã bán {product.totalSold}</span></div>
                                                <strong className="factory-store-price">{product.price ? `${product.price.toLocaleString("vi-VN")}đ` : "Liên hệ"}</strong>
                                                <span className={`factory-store-stock ${product.stockStatus === "Hết hàng" ? "sold-out" : ""}`}>{product.stockStatus}</span>
                                                <Link className="factory-store-product-link" to={`${ROUTES.PRODUCT_DETAIL}/${product.id}`}>Xem sản phẩm <FontAwesomeIcon icon={faArrowRight} /></Link>
                                            </div>
                                        </article>)}
                                    </div>
                                    {catalog.totalPages > 1 && <nav aria-label="Phân trang sản phẩm của xưởng" className="factory-store-pagination">
                                        <button type="button" disabled={page === 0} aria-label="Trang trước" onClick={() => changePage(page - 1)}><FontAwesomeIcon icon={faArrowLeft} /></button>
                                        {pagination.map((index, position) => <span key={index} className="d-inline-flex align-items-center gap-2">
                                            {position > 0 && index - pagination[position - 1] > 1 && <span>…</span>}
                                            <button type="button" className={index === page ? "active" : ""} aria-current={index === page ? "page" : undefined} onClick={() => changePage(index)}>{index + 1}</button>
                                        </span>)}
                                        <button type="button" disabled={page >= catalog.totalPages - 1} aria-label="Trang sau" onClick={() => changePage(page + 1)}><FontAwesomeIcon icon={faArrowRight} /></button>
                                    </nav>}
                                </>}
                    </section>
                </div>
            </div>
        </div>
    );
}
