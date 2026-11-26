import { toApiError } from "../utils/apiError";
import { useState, useEffect, useCallback } from "react";
import {
    faBuilding,
    faMapMarkerAlt,
    faPhone,
    faEnvelope,
    faCalendarCheck,
    faStar,
    faShieldHalved,
    faPenToSquare,
    faCamera,
    faGlobe,
    faFileLines,
    faCircleCheck,
    faSpinner,
    faXmark,
    faFloppyDisk,
    faRotate,
    faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import SideBarFactory from "../components/admin/factory/SideBarFactory";
import CustomBadge from "../components/admin/badge/CustomBadge";
import { useToastContext } from "../components/toasts/ToastContext";
import {
    FactoryServiceManager,
    type FactoryProfileDto,
    type FactoryProfileUpdateRequest,
} from "../api/factory/FactoryService";
import "../css/pages/dashboard/admin.css";
import "../css/pages/dashboard/dashboard.css";

const StatusBadge: Record<string, { label: string; badge: string }> = {
    ACTIVE: { label: "Đang hoạt động", badge: "bg-success-subtle text-success-emphasis" },
    PENDING: { label: "Chờ phê duyệt", badge: "bg-warning-subtle text-warning-emphasis" },
    INACTIVE: { label: "Tạm dừng", badge: "bg-secondary-subtle text-secondary-emphasis" },
    SUSPENDED: { label: "Bị khóa", badge: "bg-danger-subtle text-danger-emphasis" },
};

export default function FactoryProfile() {
    const { showToast } = useToastContext();

    const [profile, setProfile] = useState<FactoryProfileDto | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [saving, setSaving] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>("");

    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [showAvatarModal, setShowAvatarModal] = useState<boolean>(false);
    const [avatarInput, setAvatarInput] = useState<string>("");

    const [formData, setFormData] = useState<FactoryProfileUpdateRequest>({
        name: "",
        owner: "",
        phone: "",
        address: "",
        description: "",
        taxCode: "",
        businessLicense: "",
        website: "",
        avatarUrl: "",
    });

    const loadProfile = useCallback(async () => {
        try {
            setLoading(true);
            setErrorMessage("");
            const res = await FactoryServiceManager.getProfile();
            if (res.data) {
                setProfile(res.data);
                setFormData({
                    name: res.data.name || "",
                    owner: res.data.owner || "",
                    phone: res.data.phone || "",
                    address: res.data.address || "",
                    description: res.data.description || "",
                    taxCode: res.data.taxCode || "",
                    businessLicense: res.data.businessLicense || "",
                    website: res.data.website || "",
                    avatarUrl: res.data.avatarUrl || "",
                });
            }
        } catch (caught: unknown) {
            const err = toApiError(caught);
            console.error("Lỗi khi tải thông tin hồ sơ xưởng:", err);
            setErrorMessage(
                err?.response?.data?.message ||
                "Không thể tải thông tin gian hàng. Vui lòng thử lại sau."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadProfile();
    }, [loadProfile]);

    const handleStartEditing = () => {
        if (!profile) return;
        setFormData({
            name: profile.name || "",
            owner: profile.owner || "",
            phone: profile.phone || "",
            address: profile.address || "",
            description: profile.description || "",
            taxCode: profile.taxCode || "",
            businessLicense: profile.businessLicense || "",
            website: profile.website || "",
            avatarUrl: profile.avatarUrl || "",
        });
        setIsEditing(true);
    };

    const handleCancelEditing = () => {
        if (!profile) return;
        setFormData({
            name: profile.name || "",
            owner: profile.owner || "",
            phone: profile.phone || "",
            address: profile.address || "",
            description: profile.description || "",
            taxCode: profile.taxCode || "",
            businessLicense: profile.businessLicense || "",
            website: profile.website || "",
            avatarUrl: profile.avatarUrl || "",
        });
        setIsEditing(false);
    };

    const handleSaveProfile = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!formData.name.trim()) {
            showToast("Vui lòng nhập tên gian hàng!", "danger");
            return;
        }

        try {
            setSaving(true);
            const res = await FactoryServiceManager.updateProfile(formData);
            if (res.data) {
                setProfile(res.data);
                showToast("Cập nhật thông tin gian hàng thành công!", "success");
                setIsEditing(false);
            }
        } catch (caught: unknown) {
            const err = toApiError(caught);
            console.error("Lỗi khi lưu hồ sơ:", err);
            showToast(
                err?.response?.data?.message || "Không thể cập nhật hồ sơ gian hàng. Vui lòng thử lại!",
                "danger"
            );
        } finally {
            setSaving(false);
        }
    };

    const statusConf = StatusBadge[profile?.status || "ACTIVE"] || StatusBadge.ACTIVE;
    const initialLetter = (profile?.name?.trim()?.charAt(0) || "M").toUpperCase();

    return (
        <div className="row g-0 min-vh-100 bg-light">
            <aside
                className="col-12 col-xl-2 flex-shrink-0 position-sticky top-0 align-self-start"
                style={{ height: "100vh", zIndex: 100 }}
            >
                <SideBarFactory isProfile={true} />
            </aside>

            <main className="col-12 col-xl-10 p-3 p-lg-4 admin-content overflow-x-auto">
                {/* Header */}
                <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-4">
                    <div>
                        <div className="text-danger fw-semibold small mb-2 text-uppercase tracking-wide">
                            HỒ SƠ GIAN HÀNG
                        </div>
                        <h2 className="fw-bold text-dark mb-2">
                            Thông tin gian hàng
                        </h2>
                        <p className="text-secondary mb-0">
                            Quản lý và cập nhật thông tin gian hàng của bạn trên sàn thương mại điện tử.
                        </p>
                    </div>

                    <div className="d-flex align-items-center gap-2">
                        {isEditing ? (
                            <>
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary fw-semibold px-3"
                                    onClick={handleCancelEditing}
                                    disabled={saving}
                                >
                                    <FontAwesomeIcon icon={faXmark} className="me-2" />
                                    Hủy
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-success fw-semibold px-3 shadow-sm d-flex align-items-center gap-2"
                                    onClick={() => handleSaveProfile()}
                                    disabled={saving}
                                >
                                    {saving ? (
                                        <>
                                            <FontAwesomeIcon icon={faSpinner} spin />
                                            <span>Đang lưu...</span>
                                        </>
                                    ) : (
                                        <>
                                            <FontAwesomeIcon icon={faFloppyDisk} />
                                            <span>Lưu thay đổi</span>
                                        </>
                                    )}
                                </button>
                            </>
                        ) : (
                            <button
                                type="button"
                                className="btn btn-danger fw-semibold px-3 shadow-sm d-flex align-items-center gap-2"
                                onClick={handleStartEditing}
                                disabled={loading || !profile}
                            >
                                <FontAwesomeIcon icon={faPenToSquare} />
                                <span>Chỉnh sửa hồ sơ</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Trạng thái lỗi */}
                {errorMessage && (
                    <div className="alert alert-danger d-flex align-items-center justify-content-between mb-4 rounded-3 shadow-sm">
                        <div className="d-flex align-items-center gap-2">
                            <FontAwesomeIcon icon={faTriangleExclamation} />
                            <span>{errorMessage}</span>
                        </div>
                        <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={loadProfile}
                        >
                            <FontAwesomeIcon icon={faRotate} className="me-1" />
                            Thử lại
                        </button>
                    </div>
                )}

                {/* Trạng thái đang tải */}
                {loading ? (
                    <div className="card border-0 shadow-sm rounded-4 p-5 text-center bg-white my-3">
                        <FontAwesomeIcon icon={faSpinner} spin className="text-danger fs-2 mb-3" />
                        <div className="fw-semibold text-secondary">Đang tải thông tin gian hàng...</div>
                    </div>
                ) : profile ? (
                    <form onSubmit={handleSaveProfile}>
                        <div className="row g-4">
                            {/* Cột trái: Thẻ đại diện gian hàng */}
                            <div className="col-12 col-xl-4">
                                <div className="card border-0 shadow-sm rounded-4 bg-white">
                                    <div className="card-body text-center p-4">
                                        {/* Avatar */}
                                        <div className="position-relative d-inline-block mb-3">
                                            {formData.avatarUrl ? (
                                                <img
                                                    src={formData.avatarUrl}
                                                    alt={profile.name}
                                                    className="rounded-circle object-fit-cover shadow-sm border"
                                                    style={{ width: 104, height: 104 }}
                                                />
                                            ) : (
                                                <div
                                                    className="rounded-circle d-flex align-items-center justify-content-center text-white mx-auto shadow-sm"
                                                    style={{
                                                        width: 104,
                                                        height: 104,
                                                        backgroundColor: "#E11D48",
                                                        fontSize: "2.6rem",
                                                        fontWeight: 700,
                                                    }}
                                                >
                                                    {initialLetter}
                                                </div>
                                            )}

                                            {isEditing && (
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-light border shadow-sm rounded-circle position-absolute d-flex align-items-center justify-content-center"
                                                    style={{
                                                        bottom: 0,
                                                        right: -4,
                                                        width: 34,
                                                        height: 34,
                                                        backgroundColor: "#ffffff",
                                                    }}
                                                    title="Thay đổi ảnh đại diện"
                                                    onClick={() => {
                                                        setAvatarInput(formData.avatarUrl || "");
                                                        setShowAvatarModal(true);
                                                    }}
                                                >
                                                    <FontAwesomeIcon icon={faCamera} className="text-secondary small" />
                                                </button>
                                            )}
                                        </div>

                                        <h4 className="fw-bold mb-1 text-dark">
                                            {isEditing ? (formData.name || profile.name) : profile.name}
                                        </h4>
                                        <p className="text-muted small mb-2 font-monospace">Mã: {profile.code}</p>
                                        <CustomBadge label={statusConf.label} badge={statusConf.badge} />

                                        <hr className="my-3 opacity-10" />

                                        {/* Thống kê nhanh */}
                                        <div className="row g-3 text-center">
                                            <div className="col-4">
                                                <div className="fw-bold fs-5 text-danger">{profile.rating}</div>
                                                <div className="small text-muted" style={{ fontSize: "0.78rem" }}>
                                                    <FontAwesomeIcon icon={faStar} className="text-warning me-1" />
                                                    Đánh giá
                                                </div>
                                            </div>
                                            <div className="col-4">
                                                <div className="fw-bold fs-5 text-primary">{profile.totalOrders}</div>
                                                <div className="small text-muted" style={{ fontSize: "0.78rem" }}>Đơn hàng</div>
                                            </div>
                                            <div className="col-4">
                                                <div className="fw-bold fs-5 text-success">{profile.totalProducts}</div>
                                                <div className="small text-muted" style={{ fontSize: "0.78rem" }}>Sản phẩm</div>
                                            </div>
                                        </div>

                                        <hr className="my-3 opacity-10" />

                                        <div className="text-start d-flex flex-column gap-2 ps-2">
                                            <div className="small text-secondary">
                                                <FontAwesomeIcon icon={faCalendarCheck} className="me-2 text-muted" style={{ width: 16 }} />
                                                Tham gia: {profile.joinedAt ? new Date(profile.joinedAt).toLocaleDateString("vi-VN") : "—"}
                                            </div>
                                            <div className="small">
                                                <FontAwesomeIcon icon={faShieldHalved} className={`me-2 ${profile.kycVerified ? "text-success" : "text-warning"}`} style={{ width: 16 }} />
                                                <span className={`${profile.kycVerified ? "text-success" : "text-warning"} fw-semibold`}>
                                                    {profile.kycVerified ? "Đã xác thực KYC" : "Chờ xác thực hồ sơ"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Cột phải: Các khối biểu mẫu chi tiết */}
                            <div className="col-12 col-xl-8 d-flex flex-column gap-4">
                                {/* Khối 1: Thông tin chung */}
                                <div className="card border-0 shadow-sm rounded-4 bg-white">
                                    <div className="card-body p-4">
                                        <h5 className="fw-bold mb-3 d-flex align-items-center gap-2 text-dark fs-6">
                                            <FontAwesomeIcon icon={faBuilding} className="text-danger" />
                                            Thông tin chung
                                        </h5>
                                        <div className="row g-3">
                                            <div className="col-12 col-md-6">
                                                <label className="form-label small fw-semibold text-muted">
                                                    Tên gian hàng <span className="text-danger">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    className="form-control form-control-sm"
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                    disabled={!isEditing}
                                                    placeholder="VD: Mộc Perfume Lab"
                                                    required
                                                />
                                            </div>
                                            <div className="col-12 col-md-6">
                                                <label className="form-label small fw-semibold text-muted">Chủ sở hữu / Người đại diện</label>
                                                <input
                                                    type="text"
                                                    className="form-control form-control-sm"
                                                    value={formData.owner}
                                                    onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                                                    disabled={!isEditing}
                                                    placeholder="Họ tên người đại diện pháp luật"
                                                />
                                            </div>
                                            <div className="col-12">
                                                <label className="form-label small fw-semibold text-muted">Mô tả gian hàng</label>
                                                <textarea
                                                    className="form-control form-control-sm"
                                                    rows={3}
                                                    value={formData.description}
                                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                    disabled={!isEditing}
                                                    placeholder="Giới thiệu về xưởng, năng lực chưng cất, nguyên liệu, chứng chỉ chất lượng..."
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Khối 2: Thông tin liên hệ */}
                                <div className="card border-0 shadow-sm rounded-4 bg-white">
                                    <div className="card-body p-4">
                                        <h5 className="fw-bold mb-3 d-flex align-items-center gap-2 text-dark fs-6">
                                            <FontAwesomeIcon icon={faPhone} className="text-primary" />
                                            Thông tin liên hệ
                                        </h5>
                                        <div className="row g-3">
                                            <div className="col-12 col-md-6">
                                                <label className="form-label small fw-semibold text-muted">
                                                    <FontAwesomeIcon icon={faEnvelope} className="me-2 text-secondary" />
                                                    Email tài khoản (cố định)
                                                </label>
                                                <input
                                                    type="email"
                                                    className="form-control form-control-sm bg-light text-secondary"
                                                    value={profile.email}
                                                    disabled
                                                    title="Email gắn liền với tài khoản đăng nhập xưởng"
                                                />
                                            </div>
                                            <div className="col-12 col-md-6">
                                                <label className="form-label small fw-semibold text-muted">
                                                    <FontAwesomeIcon icon={faPhone} className="me-2 text-secondary" />
                                                    Số điện thoại xưởng
                                                </label>
                                                <input
                                                    type="tel"
                                                    className="form-control form-control-sm"
                                                    value={formData.phone}
                                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                    disabled={!isEditing}
                                                    placeholder="VD: 0918.423.869"
                                                />
                                            </div>
                                            <div className="col-12 col-md-6">
                                                <label className="form-label small fw-semibold text-muted">
                                                    <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2 text-secondary" />
                                                    Địa chỉ xưởng chế tác
                                                </label>
                                                <input
                                                    type="text"
                                                    className="form-control form-control-sm"
                                                    value={formData.address}
                                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                                    disabled={!isEditing}
                                                    placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành"
                                                />
                                            </div>
                                            <div className="col-12 col-md-6">
                                                <label className="form-label small fw-semibold text-muted">
                                                    <FontAwesomeIcon icon={faGlobe} className="me-2 text-secondary" />
                                                    Website / Fanpage gian hàng
                                                </label>
                                                <input
                                                    type="text"
                                                    className="form-control form-control-sm"
                                                    value={formData.website}
                                                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                                    disabled={!isEditing}
                                                    placeholder="https://..."
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Khối 3: Thông tin pháp lý & đối soát */}
                                <div className="card border-0 shadow-sm rounded-4 bg-white">
                                    <div className="card-body p-4">
                                        <h5 className="fw-bold mb-3 d-flex align-items-center gap-2 text-dark fs-6">
                                            <FontAwesomeIcon icon={faFileLines} className="text-success" />
                                            Thông tin pháp lý
                                        </h5>
                                        <div className="row g-3">
                                            <div className="col-12 col-md-6">
                                                <label className="form-label small fw-semibold text-muted">Mã số thuế / CCCD</label>
                                                <div className="input-group input-group-sm">
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        value={formData.taxCode}
                                                        onChange={(e) => setFormData({ ...formData, taxCode: e.target.value })}
                                                        disabled={!isEditing}
                                                        placeholder="VD: 0123456789"
                                                    />
                                                    {profile.taxCode && (
                                                        <span className="input-group-text bg-success-subtle text-success">
                                                            <FontAwesomeIcon icon={faCircleCheck} />
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="col-12 col-md-6">
                                                <label className="form-label small fw-semibold text-muted">Số ĐKKD / Giấy phép kinh doanh</label>
                                                <div className="input-group input-group-sm">
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        value={formData.businessLicense}
                                                        onChange={(e) => setFormData({ ...formData, businessLicense: e.target.value })}
                                                        disabled={!isEditing}
                                                        placeholder="VD: ĐKKD-2025-001234"
                                                    />
                                                    {profile.businessLicense && (
                                                        <span className="input-group-text bg-success-subtle text-success">
                                                            <FontAwesomeIcon icon={faCircleCheck} />
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                ) : null}
            </main>

            {/* Modal Thay Đổi URL Ảnh Đại Diện */}
            {showAvatarModal && (
                <div
                    className="modal fade show d-block"
                    tabIndex={-1}
                    style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1055 }}
                >
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 rounded-4 shadow-lg overflow-hidden">
                            <div className="modal-header bg-dark text-white border-0 px-4 py-3">
                                <h5 className="modal-title fs-6 fw-bold d-flex align-items-center gap-2">
                                    <FontAwesomeIcon icon={faCamera} />
                                    Cập Nhật Ảnh Đại Diện Gian Hàng
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close btn-close-white"
                                    onClick={() => setShowAvatarModal(false)}
                                ></button>
                            </div>
                            <div className="modal-body p-4 d-flex flex-column gap-3">
                                <div>
                                    <label className="form-label small fw-semibold text-dark">
                                        Đường dẫn ảnh đại diện (URL)
                                    </label>
                                    <input
                                        type="url"
                                        className="form-control form-control-sm"
                                        placeholder="https://example.com/logo-xưởng.png"
                                        value={avatarInput}
                                        onChange={(e) => setAvatarInput(e.target.value)}
                                        autoFocus
                                    />
                                    <div className="form-text text-muted small mt-1" style={{ fontSize: "0.75rem" }}>
                                        Dán đường dẫn ảnh logo hoặc hình đại diện xưởng định dạng PNG, JPG, WebP.
                                    </div>
                                </div>

                                {avatarInput && (
                                    <div className="text-center p-3 bg-light rounded-3 border">
                                        <div className="small text-muted mb-2">Xem trước:</div>
                                        <img
                                            src={avatarInput}
                                            alt="Preview"
                                            className="rounded-circle object-fit-cover shadow-sm border"
                                            style={{ width: 80, height: 80 }}
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src =
                                                    "https://placehold.co/100x100?text=Error";
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                            <div className="modal-footer bg-light border-0 px-4 py-3 d-flex justify-content-end gap-2">
                                <button
                                    type="button"
                                    className="btn btn-sm btn-outline-secondary px-3"
                                    onClick={() => setShowAvatarModal(false)}
                                >
                                    Đóng
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-sm btn-danger px-3 fw-semibold"
                                    onClick={() => {
                                        setFormData({ ...formData, avatarUrl: avatarInput.trim() });
                                        setShowAvatarModal(false);
                                    }}
                                >
                                    Áp dụng ảnh
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
