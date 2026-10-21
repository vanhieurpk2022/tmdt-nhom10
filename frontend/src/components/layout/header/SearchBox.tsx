import { faBuilding, faMagnifyingGlass, faSpinner, faTimes, faBoxOpen } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { productService, type FactoryDto, type ProductCard } from "../../../api/ProductService";
import { ROUTES } from "../../../routes/routes";

interface FindProps {
    PlaceHolder?: string;
}

export default function SearchBox({ PlaceHolder = "Tìm kiếm tinh dầu, gian hàng xưởng..." }: FindProps) {
    const navigate = useNavigate();
    const [keyword, setKeyword] = useState("");
    const [factories, setFactories] = useState<FactoryDto[]>([]);
    const [allProducts, setAllProducts] = useState<ProductCard[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<"all" | "factory" | "product">("all");
    const [isLoading, setIsLoading] = useState(false);

    const boxRef = useRef<HTMLDivElement>(null);

    // Tải danh sách gian hàng & sản phẩm mẫu một lần
    useEffect(() => {
        let isMounted = true;
        async function loadInitialData() {
            try {
                setIsLoading(true);
                const [meta, prodRes] = await Promise.all([
                    productService.getFilterMeta(),
                    productService.filterProducts({ size: 30 }),
                ]);
                if (isMounted) {
                    setFactories(meta.factories || []);
                    setAllProducts(prodRes.products || []);
                }
            } catch (err) {
                console.error("Không thể tải dữ liệu tìm kiếm:", err);
            } finally {
                if (isMounted) setIsLoading(false);
            }
        }
        loadInitialData();
        return () => {
            isMounted = false;
        };
    }, []);

    // Đóng dropdown khi click ra ngoài
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const trimmedKeyword = keyword.trim().toLowerCase();

    // Lọc gian hàng theo từ khoá
    const matchedFactories = factories.filter((fac) =>
        !trimmedKeyword ? true : fac.name.toLowerCase().includes(trimmedKeyword)
    );

    // Lọc sản phẩm theo từ khoá
    const matchedProducts = allProducts.filter((p) =>
        !trimmedKeyword
            ? true
            : p.name.toLowerCase().includes(trimmedKeyword) ||
              (p.factoryName && p.factoryName.toLowerCase().includes(trimmedKeyword)) ||
              (p.description && p.description.toLowerCase().includes(trimmedKeyword))
    );

    const handleSelectFactory = (factory: FactoryDto) => {
        setIsOpen(false);
        setKeyword("");
        navigate(`${ROUTES.PRODUCTS}?factoryId=${factory.id}`);
    };

    const handleSelectProduct = (productId: number) => {
        setIsOpen(false);
        setKeyword("");
        navigate(`${ROUTES.PRODUCT_DETAIL}/${productId}`);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            if (matchedFactories.length === 1 && matchedProducts.length === 0) {
                handleSelectFactory(matchedFactories[0]);
            } else if (matchedFactories.length > 0) {
                handleSelectFactory(matchedFactories[0]);
            } else {
                navigate(ROUTES.PRODUCTS);
                setIsOpen(false);
            }
        } else if (e.key === "Escape") {
            setIsOpen(false);
        }
    };

    return (
        <div className="search-box-container position-relative w-100" ref={boxRef}>
            <div className="search-box d-flex align-items-center px-3">
                <FontAwesomeIcon icon={faMagnifyingGlass} className="search-icon me-2" />
                <input
                    type="text"
                    className="search-input"
                    placeholder={PlaceHolder}
                    value={keyword}
                    onChange={(e) => {
                        const val = e.target.value;
                        setKeyword(val);
                        setIsOpen(val.trim().length > 0);
                    }}
                    onFocus={() => {
                        if (keyword.trim().length > 0) {
                            setIsOpen(true);
                        }
                    }}
                    onKeyDown={handleKeyDown}
                />
                {keyword && (
                    <button
                        type="button"
                        className="btn btn-link p-0 text-muted ms-2 text-decoration-none"
                        onClick={() => {
                            setKeyword("");
                            setIsOpen(false);
                        }}
                        aria-label="Xoá tìm kiếm"
                    >
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                )}
            </div>

            {/* Dropdown kết quả tìm kiếm - chỉ hiện khi người dùng nhập từ khoá */}
            {isOpen && keyword.trim().length > 0 && (
                <div className="search-dropdown shadow-lg bg-white rounded-4 border position-absolute mt-2 p-2">
                    {/* Bộ lọc tab nhanh */}
                    <div className="d-flex align-items-center gap-2 p-1 mb-2 border-bottom pb-2">
                        <button
                            type="button"
                            className={`btn btn-sm search-tab-btn ${activeTab === "all" ? "active" : ""}`}
                            onClick={() => setActiveTab("all")}
                        >
                            Tất cả
                        </button>
                        <button
                            type="button"
                            className={`btn btn-sm search-tab-btn d-flex align-items-center gap-1.5 ${activeTab === "factory" ? "active" : ""}`}
                            onClick={() => setActiveTab("factory")}
                        >
                            <FontAwesomeIcon icon={faBuilding} className="fs-8" />
                            Gian hàng <span className="tab-count">{matchedFactories.length}</span>
                        </button>
                        <button
                            type="button"
                            className={`btn btn-sm search-tab-btn d-flex align-items-center gap-1.5 ${activeTab === "product" ? "active" : ""}`}
                            onClick={() => setActiveTab("product")}
                        >
                            <FontAwesomeIcon icon={faBoxOpen} className="fs-8" />
                            Sản phẩm <span className="tab-count">{matchedProducts.length}</span>
                        </button>
                    </div>

                    {isLoading ? (
                        <div className="text-center py-4 text-muted fs-7">
                            <FontAwesomeIcon icon={faSpinner} spin className="me-2 text-primary" />
                            Đang tìm kiếm dữ liệu...
                        </div>
                    ) : (
                        <div className="search-results-list custom-scrollbar" style={{ maxHeight: "380px", overflowY: "auto" }}>
                            {/* Danh sách Gian hàng */}
                            {(activeTab === "all" || activeTab === "factory") && (
                                <div className="search-section mb-2">
                                    <div className="px-2.5 py-1.5 text-dark fs-8 text-uppercase fw-bold d-flex align-items-center gap-1.5 letter-spacing-wide">
                                        <FontAwesomeIcon icon={faBuilding} className="text-danger" />
                                        <span>Gian hàng &amp; Xưởng sản xuất</span>
                                        <span className="badge bg-danger bg-opacity-10 text-danger rounded-pill px-2 py-0.5 ms-auto fw-bold">
                                            {matchedFactories.length}
                                        </span>
                                    </div>
                                    {matchedFactories.length === 0 ? (
                                        <div className="px-3 py-2 text-muted fs-7 fst-italic">Không có gian hàng phù hợp.</div>
                                    ) : (
                                        <div className="d-flex flex-column gap-1 mt-1">
                                            {matchedFactories.slice(0, 5).map((fac) => (
                                                <div
                                                    key={fac.id}
                                                    className="search-item d-flex align-items-center justify-content-between p-2 rounded-3 cursor-pointer"
                                                    onClick={() => handleSelectFactory(fac)}
                                                >
                                                    <div className="d-flex align-items-center gap-2.5 min-w-0">
                                                        <img
                                                            src={fac.avatarUrl || "/images/home/lavender-france.png"}
                                                            alt={fac.name}
                                                            className="search-item-badge rounded-circle object-fit-cover border"
                                                            onError={(e) => {
                                                                (e.target as HTMLImageElement).src = "/images/home/lavender-france.png";
                                                            }}
                                                        />
                                                        <div className="text-truncate">
                                                            <div className="fw-bold fs-7 text-dark text-truncate">{fac.name}</div>
                                                            <div className="text-muted fs-8">{fac.productCount} sản phẩm có sẵn</div>
                                                        </div>
                                                    </div>
                                                    <span className="search-action-btn fs-8 fw-bold text-danger">Xem gian hàng →</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Danh sách Sản phẩm */}
                            {(activeTab === "all" || activeTab === "product") && (
                                <div className="search-section">
                                    <div className="px-2.5 py-1.5 text-dark fs-8 text-uppercase fw-bold d-flex align-items-center gap-1.5 letter-spacing-wide border-top pt-2">
                                        <FontAwesomeIcon icon={faBoxOpen} className="text-danger" />
                                        <span>Sản phẩm</span>
                                        <span className="badge bg-dark bg-opacity-10 text-dark rounded-pill px-2 py-0.5 ms-auto fw-bold">
                                            {matchedProducts.length}
                                        </span>
                                    </div>
                                    {matchedProducts.length === 0 ? (
                                        <div className="px-3 py-2 text-muted fs-7 fst-italic">Không có sản phẩm phù hợp.</div>
                                    ) : (
                                        <div className="d-flex flex-column gap-1 mt-1">
                                            {matchedProducts.slice(0, 5).map((p) => (
                                                <div
                                                    key={p.id}
                                                    className="search-item d-flex align-items-center justify-content-between p-2 rounded-3 cursor-pointer"
                                                    onClick={() => handleSelectProduct(p.id)}
                                                >
                                                    <div className="d-flex align-items-center gap-2.5 min-w-0">
                                                        <img
                                                            src={p.thumbnailUrl || "/images/home/lavender-france.png"}
                                                            alt={p.name}
                                                            className="rounded-2 object-fit-cover flex-shrink-0 border"
                                                            style={{ width: "38px", height: "38px" }}
                                                            onError={(e) => {
                                                                (e.target as HTMLImageElement).src = "/images/home/lavender-france.png";
                                                            }}
                                                        />
                                                        <div className="text-truncate">
                                                            <div className="fw-bold fs-7 text-dark text-truncate">
                                                                {p.name}
                                                            </div>
                                                            <div className="text-muted fs-8">
                                                                {p.factoryName || "Xưởng Olla"} ·{" "}
                                                                <span className="text-danger fw-bold">
                                                                    {p.price ? `${p.price.toLocaleString("vi-VN")}đ` : "Liên hệ"}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <span className="search-action-btn fs-8 fw-semibold text-secondary">Chi tiết →</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

