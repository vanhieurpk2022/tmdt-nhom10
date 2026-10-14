import { useState } from "react";
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
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import SideBarFactory from "../components/admin/factory/SideBarFactory";
import CustomBadge from "../components/admin/badge/CustomBadge";
import "../css/pages/dashboard/admin.css";
import "../css/pages/dashboard/dashboard.css";

interface FactoryProfileData {
    name: string;
    code: string;
    owner: string;
    email: string;
    phone: string;
    address: string;
    description: string;
    status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
    rating: number;
    totalOrders: number;
    totalProducts: number;
    joinedAt: string;
    taxCode: string;
    businessLicense: string;
    website: string;
    avatar: string;
}

const profileData: FactoryProfileData = {
    name: "Mộc Perfume Lab",
    code: "WS-102",
    owner: "Trần Đình Mộc",
    email: "moclab@perfume.vn",
    phone: "0918.423.869",
    address: "123 Đường Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh",
    description:
        "Xưởng chuyên sản xuất và phân phối các sản phẩm tinh dầu thiên nhiên, nước hoa handmade và nến thơm cao cấp. Cam kết sử dụng 100% nguyên liệu tự nhiên, an toàn cho sức khỏe.",
    status: "ACTIVE",
    rating: 4.9,
    totalOrders: 320,
    totalProducts: 45,
    joinedAt: "2025-01-15T08:00:00Z",
    taxCode: "0123456789",
    businessLicense: "ĐKKD-2025-001234",
    website: "https://mocperfumelab.vn",
    avatar: "M",
};

const StatusBadge: Record<string, { label: string; badge: string }> = {
    ACTIVE: { label: "Đang hoạt động", badge: "bg-success-subtle text-success-emphasis" },
    INACTIVE: { label: "Tạm dừng", badge: "bg-secondary-subtle text-secondary-emphasis" },
    SUSPENDED: { label: "Bị khóa", badge: "bg-danger-subtle text-danger-emphasis" },
};

export default function FactoryProfile() {
    const [isEditing, setIsEditing] = useState(false);
    const profile = profileData;
    const statusConf = StatusBadge[profile.status];

    return (
        <div className="row g-0 min-vh-100 bg-light">
            <aside
                className="col-12 col-xl-2 flex-shrink-0 position-sticky top-0 align-self-start"
                style={{ height: "100vh" }}
            >
                <SideBarFactory isProfile={true} />
            </aside>

            <main className="col-12 col-xl-10 p-3 p-lg-4 admin-content overflow-x-auto">
                {/* Header */}
                <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-4">
                    <div>
                        <div className="text-danger fw-semibold small mb-2">
                            HỒ SƠ GIAN HÀNG
                        </div>
                        <h2 className="fw-bold text-dark mb-2">
                            Thông tin gian hàng
                        </h2>
                        <p className="text-secondary mb-0">
                            Quản lý và cập nhật thông tin gian hàng của bạn trên sàn thương mại điện tử.
                        </p>
                    </div>

                    <button
                        type="button"
                        className={`btn ${isEditing ? "btn-success" : "btn-danger"} fw-semibold`}
                        onClick={() => setIsEditing(!isEditing)}
                    >
                        <FontAwesomeIcon icon={faPenToSquare} className="me-2" />
                        {isEditing ? "Lưu thay đổi" : "Chỉnh sửa hồ sơ"}
                    </button>
                </div>

                <div className="row g-4">
                    {/* Profile card */}
                    <div className="col-12 col-xl-4">
                        <div className="card border-0 shadow-sm rounded-4">
                            <div className="card-body text-center p-4">
                                {/* Avatar */}
                                <div className="position-relative d-inline-block mb-3">
                                    <div
                                        className="rounded-circle d-flex align-items-center justify-content-center text-white mx-auto"
                                        style={{
                                            width: 100,
                                            height: 100,
                                            backgroundColor: "#E11D48",
                                            fontSize: "2.5rem",
                                            fontWeight: 700,
                                        }}
                                    >
                                        {profile.avatar}
                                    </div>
                                    {isEditing && (
                                        <button
                                            className="btn btn-sm btn-light border rounded-circle position-absolute"
                                            style={{ bottom: 0, right: -5, width: 32, height: 32 }}
                                            title="Đổi ảnh đại diện"
                                        >
                                            <FontAwesomeIcon icon={faCamera} size="sm" />
                                        </button>
                                    )}
                                </div>

                                <h4 className="fw-bold mb-1">{profile.name}</h4>
                                <p className="text-muted small mb-2">Mã: {profile.code}</p>
                                <CustomBadge label={statusConf.label} badge={statusConf.badge} />

                                <hr className="my-3" />

                                {/* Quick stats */}
                                <div className="row g-3 text-center">
                                    <div className="col-4">
                                        <div className="fw-bold fs-5 text-danger">{profile.rating}</div>
                                        <div className="small text-muted">
                                            <FontAwesomeIcon icon={faStar} className="text-warning me-1" />
                                            Đánh giá
                                        </div>
                                    </div>
                                    <div className="col-4">
                                        <div className="fw-bold fs-5 text-primary">{profile.totalOrders}</div>
                                        <div className="small text-muted">Đơn hàng</div>
                                    </div>
                                    <div className="col-4">
                                        <div className="fw-bold fs-5 text-success">{profile.totalProducts}</div>
                                        <div className="small text-muted">Sản phẩm</div>
                                    </div>
                                </div>

                                <hr className="my-3" />

                                <div className="text-start d-flex flex-column gap-2">
                                    <div className="small">
                                        <FontAwesomeIcon icon={faCalendarCheck} className="me-2 text-muted" style={{ width: 16 }} />
                                        Tham gia: {new Date(profile.joinedAt).toLocaleDateString("vi-VN")}
                                    </div>
                                    <div className="small">
                                        <FontAwesomeIcon icon={faShieldHalved} className="me-2 text-success" style={{ width: 16 }} />
                                        <span className="text-success fw-semibold">Đã xác thực KYC</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Detail info */}
                    <div className="col-12 col-xl-8">
                        {/* General info */}
                        <div className="card border-0 shadow-sm rounded-4 mb-4">
                            <div className="card-body p-4">
                                <h5 className="fw-bold mb-3">
                                    <FontAwesomeIcon icon={faBuilding} className="me-2 text-danger" />
                                    Thông tin chung
                                </h5>
                                <div className="row g-3">
                                    <div className="col-12 col-md-6">
                                        <label className="form-label small fw-semibold text-muted">Tên gian hàng</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            defaultValue={profile.name}
                                            disabled={!isEditing}
                                        />
                                    </div>
                                    <div className="col-12 col-md-6">
                                        <label className="form-label small fw-semibold text-muted">Chủ sở hữu</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            defaultValue={profile.owner}
                                            disabled={!isEditing}
                                        />
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label small fw-semibold text-muted">Mô tả gian hàng</label>
                                        <textarea
                                            className="form-control"
                                            rows={3}
                                            defaultValue={profile.description}
                                            disabled={!isEditing}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contact info */}
                        <div className="card border-0 shadow-sm rounded-4 mb-4">
                            <div className="card-body p-4">
                                <h5 className="fw-bold mb-3">
                                    <FontAwesomeIcon icon={faPhone} className="me-2 text-primary" />
                                    Thông tin liên hệ
                                </h5>
                                <div className="row g-3">
                                    <div className="col-12 col-md-6">
                                        <label className="form-label small fw-semibold text-muted">
                                            <FontAwesomeIcon icon={faEnvelope} className="me-2" />
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            defaultValue={profile.email}
                                            disabled={!isEditing}
                                        />
                                    </div>
                                    <div className="col-12 col-md-6">
                                        <label className="form-label small fw-semibold text-muted">
                                            <FontAwesomeIcon icon={faPhone} className="me-2" />
                                            Số điện thoại
                                        </label>
                                        <input
                                            type="tel"
                                            className="form-control"
                                            defaultValue={profile.phone}
                                            disabled={!isEditing}
                                        />
                                    </div>
                                    <div className="col-12 col-md-6">
                                        <label className="form-label small fw-semibold text-muted">
                                            <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2" />
                                            Địa chỉ
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            defaultValue={profile.address}
                                            disabled={!isEditing}
                                        />
                                    </div>
                                    <div className="col-12 col-md-6">
                                        <label className="form-label small fw-semibold text-muted">
                                            <FontAwesomeIcon icon={faGlobe} className="me-2" />
                                            Website
                                        </label>
                                        <input
                                            type="url"
                                            className="form-control"
                                            defaultValue={profile.website}
                                            disabled={!isEditing}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Legal info */}
                        <div className="card border-0 shadow-sm rounded-4">
                            <div className="card-body p-4">
                                <h5 className="fw-bold mb-3">
                                    <FontAwesomeIcon icon={faFileLines} className="me-2 text-success" />
                                    Thông tin pháp lý
                                </h5>
                                <div className="row g-3">
                                    <div className="col-12 col-md-6">
                                        <label className="form-label small fw-semibold text-muted">Mã số thuế</label>
                                        <div className="input-group">
                                            <input
                                                type="text"
                                                className="form-control"
                                                defaultValue={profile.taxCode}
                                                disabled={!isEditing}
                                            />
                                            <span className="input-group-text bg-success-subtle text-success">
                                                <FontAwesomeIcon icon={faCircleCheck} />
                                            </span>
                                        </div>
                                    </div>
                                    <div className="col-12 col-md-6">
                                        <label className="form-label small fw-semibold text-muted">Số ĐKKD</label>
                                        <div className="input-group">
                                            <input
                                                type="text"
                                                className="form-control"
                                                defaultValue={profile.businessLicense}
                                                disabled={!isEditing}
                                            />
                                            <span className="input-group-text bg-success-subtle text-success">
                                                <FontAwesomeIcon icon={faCircleCheck} />
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
