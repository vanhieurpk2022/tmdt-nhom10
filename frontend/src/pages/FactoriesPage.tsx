import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faLocationDot,
    faBoxArchive,
    faSearch,
    faArrowRight,
    faShieldHalved,
    faCircleCheck,
    faStore,
} from "@fortawesome/free-solid-svg-icons";
import { FactoryApiService, type FactoryItem } from "../api/FactoryService";
import { ROUTES } from "../routes/routes";
import "../css/pages/factories.css";

export default function FactoriesPage() {
    const [factories, setFactories] = useState<FactoryItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [searchTerm, setSearchTerm] = useState<string>("");

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
                                            <h3 className="factory-card-title" title={factory.name}>
                                                <Link to={`${ROUTES.FACTORY_DETAIL}/${factory.id}`} className="text-reset text-decoration-none">{factory.name}</Link>
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
                                                    to={`${ROUTES.FACTORY_DETAIL}/${factory.id}`}
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

        </div>
    );
}
