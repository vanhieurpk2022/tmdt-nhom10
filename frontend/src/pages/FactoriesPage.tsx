import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faIndustry,
    faLocationDot,
    faBoxArchive,
    faSearch,
    faArrowRight,
    faShieldHalved,
    faCircleCheck,
    faStore,
    faXmark,
    faImages,
    faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";
import { FactoryApiService, type FactoryItem } from "../api/FactoryService";
import { ROUTES } from "../routes/routes";
import "../css/pages/factories.css";

export default function FactoriesPage() {
    const [factories, setFactories] = useState<FactoryItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [selectedFactory, setSelectedFactory] = useState<FactoryItem | null>(null);

    useEffect(() => {
        let isMounted = true;
        const fetchFactories = async () => {
            try {
                setLoading(true);
                const data = await FactoryApiService.getAllFactories();
                if (isMounted) {
                    setFactories(data);
                }
            } catch (err) {
                console.error("Lỗi khi tải danh sách xưởng:", err);
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };
        fetchFactories();
        return () => {
            isMounted = false;
        };
    }, []);

    // Lọc theo từ khóa tìm kiếm (tên, địa chỉ, mô tả)
    const filteredFactories = useMemo(() => {
        if (!searchTerm.trim()) return factories;
        const term = searchTerm.toLowerCase();
        return factories.filter(
            (f) =>
                f.name.toLowerCase().includes(term) ||
                (f.address && f.address.toLowerCase().includes(term)) ||
                (f.description && f.description.toLowerCase().includes(term))
        );
    }, [factories, searchTerm]);

    const totalProducts = useMemo(() => {
        return factories.reduce((sum, f) => sum + (f.productCount || 0), 0);
    }, [factories]);

    return (
        <div className="factories-page">
            {/* HERO SECTION */}
            <section className="factories-hero">
                <div className="container px-3 px-lg-4">
                    <div className="row align-items-center g-4">
                        <div className="col-12 col-lg-7">
                            <span className="factories-hero-badge">
                                <FontAwesomeIcon icon={faShieldHalved} />
                                Đối Tác Kiểm Định GC/MS
                            </span>
                            <h1 className="factories-hero-title">
                                Hệ Thống <span>Xưởng & Nhà Máy</span> Tinh Dầu
                            </h1>
                            <p className="factories-hero-desc">
                                Kết nối trực tiếp khách hàng với các cơ sở chưng cất và chiết xuất tinh dầu thiên nhiên
                                đạt chuẩn kiểm định. Mua sắm an tâm với nguồn gốc minh bạch từ xưởng.
                            </p>
                        </div>
                        <div className="col-12 col-lg-5">
                            <div className="row g-3">
                                <div className="col-4">
                                    <div className="factories-stat-pill">
                                        <div className="factories-stat-num">{factories.length}</div>
                                        <div className="factories-stat-label">Xưởng Đối Tác</div>
                                    </div>
                                </div>
                                <div className="col-4">
                                    <div className="factories-stat-pill">
                                        <div className="factories-stat-num">{totalProducts}+</div>
                                        <div className="factories-stat-label">Sản Phẩm</div>
                                    </div>
                                </div>
                                <div className="col-4">
                                    <div className="factories-stat-pill">
                                        <div className="factories-stat-num">100%</div>
                                        <div className="factories-stat-label">Chính Hãng</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* SEARCH & CONTROLS BAR */}
            <div className="container px-3 px-lg-4">
                <div className="factories-bar">
                    <div className="row align-items-center g-3">
                        <div className="col-12 col-md-6 col-lg-5">
                            <div className="position-relative">
                                <FontAwesomeIcon
                                    icon={faSearch}
                                    className="position-absolute text-muted"
                                    style={{ top: "50%", left: "1rem", transform: "translateY(-50%)" }}
                                />
                                <input
                                    type="text"
                                    className="form-control factories-search-input"
                                    placeholder="Tìm tên xưởng, địa chỉ, thương hiệu..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="col-12 col-md-6 col-lg-7 d-flex justify-content-md-end align-items-center gap-2">
                            <span className="text-secondary small">
                                Hiển thị <strong className="text-dark">{filteredFactories.length}</strong> / {factories.length} xưởng
                            </span>
                            {searchTerm && (
                                <button
                                    className="btn btn-sm btn-outline-secondary rounded-pill ms-2"
                                    onClick={() => setSearchTerm("")}
                                >
                                    Xóa tìm kiếm
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* FACTORY CARDS GRID */}
            <div className="container px-3 px-lg-4 py-5">
                {loading ? (
                    <div className="text-center py-5">
                        <div className="spinner-border text-danger" role="status">
                            <span className="visually-hidden">Đang tải danh sách xưởng...</span>
                        </div>
                        <p className="text-muted mt-3">Đang kết nối danh sách xưởng...</p>
                    </div>
                ) : filteredFactories.length === 0 ? (
                    <div className="text-center py-5 bg-white rounded-4 border p-5">
                        <FontAwesomeIcon icon={faStore} className="text-muted display-4 mb-3" />
                        <h5 className="fw-bold text-dark">Không tìm thấy xưởng phù hợp</h5>
                        <p className="text-muted">Vui lòng thử tìm kiếm với từ khóa khác</p>
                    </div>
                ) : (
                    <div className="row g-4">
                        {filteredFactories.map((factory) => {
                            const initial = factory.name ? factory.name.charAt(0).toUpperCase() : "X";
                            return (
                                <div key={factory.id} className="col-12 col-md-6 col-lg-4 col-xl-3">
                                    <div className="factory-card">
                                        {/* BANNER & AVATAR */}
                                        <div className="factory-card-banner">
                                            {factory.bannerUrl ? (
                                                <img src={factory.bannerUrl} alt={factory.name} />
                                            ) : (
                                                <div className="w-100 h-100 bg-dark" />
                                            )}
                                            <div className="factory-card-banner-overlay" />

                                            <span className="factory-status-badge active">
                                                <FontAwesomeIcon icon={faCircleCheck} className="me-1" />
                                                Hoạt động
                                            </span>

                                            <div className="factory-card-avatar">
                                                {factory.avatarUrl ? (
                                                    <img src={factory.avatarUrl} alt={factory.name} />
                                                ) : (
                                                    <div className="factory-card-avatar-placeholder">
                                                        {initial}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* CARD BODY */}
                                        <div className="factory-card-body">
                                            <h3
                                                className="factory-card-title cursor-pointer"
                                                title={factory.name}
                                                onClick={() => setSelectedFactory(factory)}
                                                style={{ cursor: "pointer" }}
                                            >
                                                {factory.name}
                                            </h3>

                                            <div className="factory-card-address" title={factory.address}>
                                                <FontAwesomeIcon icon={faLocationDot} className="text-danger flex-shrink-0 mt-1" />
                                                <span>{factory.address || "Việt Nam"}</span>
                                            </div>

                                            <p className="factory-card-desc" title={factory.description}>
                                                {factory.description || "Nhà xưởng đối tác cung cấp tinh dầu thiên nhiên cao cấp trên sàn Oilia."}
                                            </p>

                                            <div className="factory-card-meta">
                                                <div className="factory-meta-item">
                                                    <span className="factory-meta-label">Sản phẩm</span>
                                                    <span className="factory-meta-value">
                                                        <FontAwesomeIcon icon={faBoxArchive} className="me-1 text-danger" />
                                                        {factory.productCount} mục
                                                    </span>
                                                </div>
                                                <div className="factory-meta-item text-end">
                                                    <span className="factory-meta-label">Kiểm định</span>
                                                    <span className="factory-meta-value text-success">
                                                        Đạt chuẩn GC/MS
                                                    </span>
                                                </div>
                                            </div>

                                            {/* ACTIONS */}
                                            <div className="mt-auto pt-2">
                                                <Link
                                                    to={`${ROUTES.PRODUCTS}?factoryIds=${factory.id}`}
                                                    className="btn-view-factory-products"
                                                >
                                                    <span>Xem {factory.productCount} sản phẩm</span>
                                                    <FontAwesomeIcon icon={faArrowRight} />
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* DETAIL MODAL */}
            {selectedFactory && (
                <div
                    className="modal fade show d-block"
                    tabIndex={-1}
                    style={{ backgroundColor: "rgba(0, 0, 0, 0.65)", backdropFilter: "blur(4px)" }}
                    onClick={() => setSelectedFactory(null)}
                >
                    <div
                        className="modal-dialog modal-dialog-centered modal-lg"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="modal-content border-0 rounded-4 overflow-hidden shadow-lg">
                            {/* MODAL BANNER */}
                            <div className="factory-modal-header-banner position-relative">
                                {selectedFactory.bannerUrl ? (
                                    <img src={selectedFactory.bannerUrl} alt={selectedFactory.name} />
                                ) : (
                                    <div className="w-100 h-100 bg-dark" />
                                )}
                                <button
                                    type="button"
                                    className="btn btn-sm btn-light rounded-circle position-absolute top-0 end-0 m-3 shadow"
                                    style={{ width: "36px", height: "36px", zIndex: 10 }}
                                    onClick={() => setSelectedFactory(null)}
                                >
                                    <FontAwesomeIcon icon={faXmark} />
                                </button>
                            </div>

                            {/* MODAL BODY */}
                            <div className="modal-body p-4">
                                <div className="d-flex align-items-center gap-3 mb-3">
                                    <div
                                        style={{
                                            width: "60px",
                                            height: "60px",
                                            borderRadius: "12px",
                                            overflow: "hidden",
                                            border: "2px solid #ef4444",
                                            flexShrink: 0,
                                        }}
                                    >
                                        {selectedFactory.avatarUrl ? (
                                            <img
                                                src={selectedFactory.avatarUrl}
                                                alt={selectedFactory.name}
                                                className="w-100 h-100 object-fit-cover"
                                            />
                                        ) : (
                                            <div className="w-100 h-100 bg-danger text-white d-flex align-items-center justify-content-center fw-bold fs-4">
                                                {selectedFactory.name.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="fw-bold mb-1 text-dark">{selectedFactory.name}</h4>
                                        <p className="text-secondary small mb-0">
                                            <FontAwesomeIcon icon={faLocationDot} className="text-danger me-1" />
                                            {selectedFactory.address}
                                        </p>
                                    </div>
                                </div>

                                <div className="p-3 bg-light rounded-3 mb-3">
                                    <h6 className="fw-bold text-dark mb-2">
                                        <FontAwesomeIcon icon={faInfoCircle} className="text-danger me-2" />
                                        Giới thiệu nhà xưởng
                                    </h6>
                                    <p className="text-secondary mb-0 small" style={{ lineHeight: 1.6 }}>
                                        {selectedFactory.description || "Chưa có mô tả chi tiết."}
                                    </p>
                                </div>

                                {selectedFactory.galleryImages && selectedFactory.galleryImages.length > 0 && (
                                    <div className="mb-4">
                                        <h6 className="fw-bold text-dark mb-2">
                                            <FontAwesomeIcon icon={faImages} className="text-danger me-2" />
                                            Hình ảnh cơ sở / sản xuất
                                        </h6>
                                        <div className="d-flex gap-2 overflow-x-auto pb-2">
                                            {selectedFactory.galleryImages.map((imgUrl, idx) => (
                                                <img
                                                    key={idx}
                                                    src={imgUrl}
                                                    alt={`Gallery ${idx + 1}`}
                                                    style={{
                                                        width: "120px",
                                                        height: "80px",
                                                        objectFit: "cover",
                                                        borderRadius: "8px",
                                                        flexShrink: 0,
                                                        border: "1px solid #e2e8f0",
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="d-flex justify-content-end gap-2 pt-2 border-top">
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary px-3"
                                        onClick={() => setSelectedFactory(null)}
                                    >
                                        Đóng
                                    </button>
                                    <Link
                                        to={`${ROUTES.PRODUCTS}?factoryIds=${selectedFactory.id}`}
                                        className="btn btn-danger px-4 fw-semibold"
                                        onClick={() => setSelectedFactory(null)}
                                    >
                                        Xem tất cả {selectedFactory.productCount} sản phẩm
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
