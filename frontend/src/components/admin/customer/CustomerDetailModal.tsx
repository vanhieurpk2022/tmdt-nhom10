import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faKey,
    faBan,
    faXmark,
    faStar,
    faCheck,
    faFileArrowDown,
    faLock,
    faUnlock,
    faClock,
    faBoxesPacking,
    faLocationDot,
    faShieldHalved,
    faPlus,
    faCoins,
    faTicket,
    faCircleCheck,
} from "@fortawesome/free-solid-svg-icons";
import type { CustomerDetail } from "../../../api/CustomerAdminService";

interface CustomerDetailModalProps {
    detail: CustomerDetail;
    loading?: boolean;
    onClose: () => void;
    onToggleStatus: () => void;
}

type TabKey = "info" | "scent" | "orders" | "disputes" | "wallet";

export default function CustomerDetailModal({
    detail,
    loading = false,
    onClose,
    onToggleStatus,
}: CustomerDetailModalProps) {
    const { customer, addresses = [], recentOrders = [] } = detail;
    const [activeTab, setActiveTab] = useState<TabKey>("scent");
    const [storeCredit, setStoreCredit] = useState<number>(1250000);
    const [cskhNote, setCskhNote] = useState<string>("Khách hàng ưu tiên nhóm hương gỗ và hoa hồng Grasse.");
    const [isLabLocked, setIsLabLocked] = useState<boolean>(false);

    const formatVnd = (val: number) => (val || 0).toLocaleString("vi-VN") + "đ";

    const isBanned = customer.statusCode === "BANNED" || customer.status === "Tạm khóa";

    const handleAddCredit = () => {
        const input = window.prompt("Nhập số tiền Store Credit cần cộng cho khách hàng (VNĐ):", "500000");
        if (input) {
            const num = parseInt(input.replace(/\D/g, ""), 10);
            if (!isNaN(num) && num > 0) {
                setStoreCredit((prev) => prev + num);
                alert(`Đã cộng thành công ${formatVnd(num)} vào Ví Store Credit của khách hàng!`);
            }
        }
    };

    const handleResetPassword = () => {
        if (window.confirm(`Gửi email đặt lại mật khẩu cho khách hàng ${customer.name} (${customer.email})?`)) {
            alert("Đã gửi liên kết khôi phục mật khẩu vào hòm thư khách hàng.");
        }
    };

    const handleSaveNote = () => {
        alert("Đã lưu ghi chú CSKH thành công!");
    };

    const handleUpdateProfile = () => {
        alert("Cập nhật thông tin hồ sơ khách hàng thành công!");
    };

    return (
        <div
            className="modal show d-block"
            tabIndex={-1}
            style={{ backgroundColor: "rgba(15, 23, 42, 0.65)", zIndex: 1050 }}
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div className="modal-dialog modal-dialog-centered customer-detail-modal-dialog">
                <div className="modal-content border-0 rounded-4 shadow-lg overflow-hidden bg-white">
                    {/* ── MODAL HEADER ── */}
                    <div className="modal-header border-bottom px-4 pt-4 pb-3 bg-white align-items-start">
                        <div className="d-flex align-items-center gap-3 flex-grow-1">
                            {/* Avatar */}
                            <div className="customer-detail-avatar">
                                {customer.initials || "NLA"}
                            </div>

                            {/* Info */}
                            <div className="d-flex flex-column">
                                <div className="d-flex align-items-center gap-2 flex-wrap">
                                    <h5 className="modal-title fw-bold text-dark mb-0 fs-5" style={{ letterSpacing: "-0.2px" }}>
                                        {customer.name || customer.fullname || "Nguyễn Lan Anh"}
                                    </h5>
                                    <span className="vip-diamond-pill">
                                        <FontAwesomeIcon icon={faStar} style={{ fontSize: "10px" }} />
                                        {customer.tier || "VIP Diamond"}
                                    </span>
                                </div>
                                <div className="d-flex align-items-center gap-2 text-muted small mt-1">
                                    <span>Mã: CUST-{customer.id || "882"}</span>
                                    <span>•</span>
                                    <span>Tham gia: {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString("vi-VN", { month: "2-digit", year: "numeric" }) : "03/2023"}</span>
                                    <span>•</span>
                                    <span className="text-success fw-semibold">Chốt đơn: 98%</span>
                                </div>
                            </div>
                        </div>

                        {/* Top Action Icons */}
                        <div className="d-flex align-items-center gap-3 ms-2">
                            <button
                                type="button"
                                className="btn btn-link p-1 text-secondary border-0"
                                title="Cấp lại / Đặt lại mật khẩu"
                                onClick={handleResetPassword}
                                style={{ color: "#94a3b8" }}
                                onMouseEnter={(e) => (e.currentTarget.style.color = "#0f172a")}
                                onMouseLeave={(e) => (e.currentTarget.style.color = "#94a3b8")}
                            >
                                <FontAwesomeIcon icon={faKey} style={{ fontSize: "15px" }} />
                            </button>

                            <button
                                type="button"
                                className="btn btn-link p-1 border-0"
                                title={isBanned ? "Mở khóa tài khoản" : "Khóa tài khoản"}
                                onClick={onToggleStatus}
                                style={{ color: isBanned ? "#16a34a" : "#ef4444" }}
                            >
                                <FontAwesomeIcon icon={isBanned ? faUnlock : faBan} style={{ fontSize: "15px" }} />
                            </button>

                            <button
                                type="button"
                                className="btn-close ms-1"
                                aria-label="Close"
                                onClick={onClose}
                            />
                        </div>
                    </div>

                    {/* ── MODAL BODY ── */}
                    <div className="modal-body p-4" style={{ maxHeight: "78vh", overflowY: "auto" }}>
                        {loading ? (
                            <div className="text-center py-5">
                                <div className="spinner-border text-danger" role="status" />
                                <div className="mt-2 text-muted small">Đang nạp hồ sơ khách hàng...</div>
                            </div>
                        ) : (
                            <>
                                {/* 1. Strip 4 thông số (Tổng LTV, Đã chốt, Scent Vault, Loyalty Pts) */}
                                <div className="detail-metrics-strip mb-4">
                                    <div className="row g-0 text-center">
                                        <div className="col-3 detail-metric-col">
                                            <span className="detail-metric-label">TỔNG LTV</span>
                                            <span className="detail-metric-val">{formatVnd(customer.ltv || 42500000)}</span>
                                        </div>
                                        <div className="col-3 detail-metric-col">
                                            <span className="detail-metric-label">ĐÃ CHỐT</span>
                                            <span className="detail-metric-val">{customer.orders || 24} đơn</span>
                                        </div>
                                        <div className="col-3 detail-metric-col">
                                            <span className="detail-metric-label">SCENT VAULT</span>
                                            <span className="detail-metric-val text-primary" style={{ color: "#2563eb" }}>
                                                {customer.formulas || 15} mùi
                                            </span>
                                        </div>
                                        <div className="col-3 detail-metric-col">
                                            <span className="detail-metric-label">LOYALTY PTS</span>
                                            <span className="detail-metric-val" style={{ color: "#d97706" }}>
                                                2.450 pts
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* 2. Thanh Tabs Điều Hướng */}
                                <div className="detail-nav-tabs mb-4">
                                    <button
                                        type="button"
                                        className={`detail-tab-btn ${activeTab === "info" ? "active" : ""}`}
                                        onClick={() => setActiveTab("info")}
                                    >
                                        1. Thông tin &amp; Bảo mật
                                    </button>
                                    <button
                                        type="button"
                                        className={`detail-tab-btn ${activeTab === "scent" ? "active" : ""}`}
                                        onClick={() => setActiveTab("scent")}
                                    >
                                        2. Scent Vault &amp; Công thức
                                        <span className="detail-tab-badge">{customer.formulas || 15}</span>
                                    </button>
                                    <button
                                        type="button"
                                        className={`detail-tab-btn ${activeTab === "orders" ? "active" : ""}`}
                                        onClick={() => setActiveTab("orders")}
                                    >
                                        3. Đơn hàng &amp; RFQ
                                    </button>
                                    <button
                                        type="button"
                                        className={`detail-tab-btn ${activeTab === "disputes" ? "active" : ""}`}
                                        onClick={() => setActiveTab("disputes")}
                                    >
                                        4. Khiếu nại (0)
                                    </button>
                                    <button
                                        type="button"
                                        className={`detail-tab-btn ${activeTab === "wallet" ? "active" : ""}`}
                                        onClick={() => setActiveTab("wallet")}
                                    >
                                        5. Ví &amp; Điểm
                                    </button>
                                </div>

                                {/* ── TAB 2: SCENT VAULT & CÔNG THỨC ── */}
                                {activeTab === "scent" && (
                                    <div>
                                        {/* Tiêu đề mục */}
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <div>
                                                <h6 className="fw-bold text-dark mb-1" style={{ fontSize: "14px" }}>
                                                    Kho công thức hương cá nhân (Scent Vault)
                                                </h6>
                                                <p className="text-secondary small mb-0" style={{ fontSize: "12px" }}>
                                                    Lưu trữ bản quyền công thức, tỉ lệ phối tầng hương và xưởng gia công chỉ định.
                                                </p>
                                            </div>
                                            <span className="badge rounded-pill fw-semibold px-3 py-2" style={{ backgroundColor: "#eff6ff", color: "#2563eb", border: "1px solid #bfdbfe", fontSize: "12px" }}>
                                                {customer.formulas || 15} Công thức đã lưu
                                            </span>
                                        </div>

                                        {/* Công thức 1: Aura de Grasse No. 04 (Tháp nốt hương chuẩn) */}
                                        <div className="scent-formula-card">
                                            <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-1">
                                                <div>
                                                    <div className="d-flex align-items-center gap-2">
                                                        <h6 className="fw-bold text-dark mb-0" style={{ fontSize: "15px" }}>
                                                            Aura de Grasse No. 04
                                                        </h6>
                                                        <span className="scent-tag-badge">#SCT-882-04</span>
                                                    </div>
                                                    <div className="text-muted small mt-1" style={{ fontSize: "12px" }}>
                                                        Eau de Parfum (EDP 50ml) • Nồng độ tinh dầu: 20%
                                                    </div>
                                                </div>
                                                <span className="scent-status-ordered">
                                                    <FontAwesomeIcon icon={faCheck} className="me-1" />
                                                    Đã gia công 3 lô (Re-ordered)
                                                </span>
                                            </div>

                                            {/* Xưởng gia công độc quyền */}
                                            <div className="scent-workshop-banner">
                                                <span>
                                                    Xưởng gia công độc quyền: <strong className="text-dark">Mộc Perfume Lab</strong> <span className="text-muted">(WS-102)</span>
                                                </span>
                                                <span className="fw-semibold text-success">
                                                    Chuẩn GMP Lab
                                                </span>
                                            </div>

                                            {/* Tháp hương */}
                                            <div className="d-flex justify-content-between align-items-center mb-2 px-1">
                                                <span className="fw-bold text-uppercase" style={{ fontSize: "11px", color: "#475569", letterSpacing: "0.4px" }}>
                                                    CẤU TRÚC THÁP NỐT HƯƠNG (SCENT PYRAMID)
                                                </span>
                                                <span className="text-muted" style={{ fontSize: "11px", fontWeight: 500 }}>
                                                    TỈ LỆ HÒA TAN CHUẨN
                                                </span>
                                            </div>

                                            {/* Tầng 1: Hương đầu */}
                                            <div className="scent-pyramid-box top">
                                                <div className="scent-tier-header">
                                                    <span>HƯƠNG ĐẦU (TOP NOTES) - 30%</span>
                                                    <span>0 - 15 phút</span>
                                                </div>
                                                <p className="scent-tier-desc">
                                                    Cam Bergamot Ý, Quả lý chua đen, Tiêu hồng hữu cơ
                                                </p>
                                            </div>

                                            {/* Tầng 2: Hương giữa */}
                                            <div className="scent-pyramid-box middle">
                                                <div className="scent-tier-header">
                                                    <span>HƯƠNG GIỮA (HEART / MIDDLE NOTES) - 50%</span>
                                                    <span>15m - 4 giờ</span>
                                                </div>
                                                <p className="scent-tier-desc">
                                                    Hoa hồng Grasse Pháp, Hoa nhài Sambac, Tinh dầu hoa diên vĩ
                                                </p>
                                            </div>

                                            {/* Tầng 3: Hương cuối */}
                                            <div className="scent-pyramid-box base">
                                                <div className="scent-tier-header">
                                                    <span>HƯƠNG CUỐI (BASE NOTES) - 20%</span>
                                                    <span>4 - 12 giờ</span>
                                                </div>
                                                <p className="scent-tier-desc">
                                                    Gỗ tuyết tùng Virginia, Xạ hương trắng Cashmere, Hổ phách xám
                                                </p>
                                            </div>

                                            {/* Actions của Card 1 */}
                                            <div className="d-flex justify-content-between align-items-center pt-2 flex-wrap gap-2">
                                                <div className="d-flex gap-2">
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm fw-semibold"
                                                        style={{
                                                            backgroundColor: "#fff1f2",
                                                            border: "1px solid #fecdd3",
                                                            color: "#e11d48",
                                                            fontSize: "12px",
                                                            padding: "5px 12px",
                                                        }}
                                                        onClick={() => alert("Chi tiết phổ sắc ký khí và bảng phối liệu Lab.")}
                                                    >
                                                        Xem chi tiết nốt hương Lab
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-light border fw-semibold text-dark"
                                                        style={{ fontSize: "12px", padding: "5px 12px" }}
                                                        onClick={() => alert("Đã mở lệnh tái đặt hàng với Xưởng Mộc Perfume Lab.")}
                                                    >
                                                        Tái đặt hàng với xưởng
                                                    </button>
                                                </div>
                                                <a
                                                    href="#download-ifra"
                                                    className="text-decoration-none text-secondary small fw-medium"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        alert("Đang tải xuống chứng chỉ IFRA Compliance (PDF)...");
                                                    }}
                                                >
                                                    <FontAwesomeIcon icon={faFileArrowDown} className="me-1" />
                                                    Tải IFRA Compliance
                                                </a>
                                            </div>
                                        </div>

                                        {/* Công thức 2: Midnight Velvet Scented Candle */}
                                        <div className="scent-formula-card secondary">
                                            <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-1">
                                                <div>
                                                    <div className="d-flex align-items-center gap-2">
                                                        <h6 className="fw-bold text-dark mb-0" style={{ fontSize: "14px" }}>
                                                            Midnight Velvet Scented Candle
                                                        </h6>
                                                        <span className="scent-tag-badge">#SCT-882-08</span>
                                                    </div>
                                                    <div className="text-muted small mt-1" style={{ fontSize: "12px" }}>
                                                        Nến thơm sáp đậu nành cao cấp 220g
                                                    </div>
                                                </div>
                                                <span className="badge rounded-pill fw-semibold" style={{ backgroundColor: "#eff6ff", color: "#2563eb", border: "1px solid #dbeafe", fontSize: "11px", padding: "4px 10px" }}>
                                                    Đang lưu mẫu Lab
                                                </span>
                                            </div>
                                            <div className="text-secondary small mt-2" style={{ fontSize: "12px" }}>
                                                <strong className="text-dark">Tầng hương chính:</strong> Gỗ đàn hương Mysore, Vani Madagascar nguyên chất, Hoắc hương Sumatra.
                                            </div>
                                        </div>

                                        {/* Ví Store Credit của Khách hàng */}
                                        <div className="store-credit-box">
                                            <div className="d-flex justify-content-between align-items-center mb-1">
                                                <h6 className="fw-bold text-dark mb-0" style={{ fontSize: "14px" }}>
                                                    Ví Store Credit của Khách hàng
                                                </h6>
                                                <span className="fw-bold text-success" style={{ fontSize: "14px" }}>
                                                    Số dư: {formatVnd(storeCredit)}
                                                </span>
                                            </div>
                                            <p className="text-secondary small mb-3" style={{ fontSize: "12px" }}>
                                                Cộng/Trừ số dư Store Credit (Bồi hoàn hoặc tri ân):
                                            </p>
                                            <div className="d-flex justify-content-end">
                                                <button
                                                    type="button"
                                                    className="btn btn-sm fw-semibold text-white px-3 py-2"
                                                    style={{ backgroundColor: "#0f172a", borderRadius: "6px", fontSize: "12px" }}
                                                    onClick={handleAddCredit}
                                                >
                                                    Cộng tiền vào ví khách
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* ── TAB 1: THÔNG TIN & BẢO MẬT ── */}
                                {activeTab === "info" && (
                                    <div>
                                        <h6 className="fw-bold text-dark mb-3" style={{ fontSize: "14px" }}>
                                            <FontAwesomeIcon icon={faShieldHalved} className="text-danger me-2" />
                                            Thông tin cá nhân &amp; Bảo mật
                                        </h6>

                                        <div className="row g-3 mb-4">
                                            <div className="col-12 col-md-6">
                                                <label className="form-label small fw-bold text-secondary mb-1">Họ và tên</label>
                                                <input
                                                    type="text"
                                                    className="form-control form-control-sm"
                                                    defaultValue={customer.name || customer.fullname || ""}
                                                />
                                            </div>
                                            <div className="col-12 col-md-6">
                                                <label className="form-label small fw-bold text-secondary mb-1">Email</label>
                                                <input
                                                    type="email"
                                                    className="form-control form-control-sm"
                                                    defaultValue={customer.email || ""}
                                                />
                                            </div>
                                            <div className="col-12 col-md-6">
                                                <label className="form-label small fw-bold text-secondary mb-1">Số điện thoại</label>
                                                <input
                                                    type="tel"
                                                    className="form-control form-control-sm"
                                                    defaultValue={customer.phone || ""}
                                                />
                                            </div>
                                            <div className="col-12 col-md-6">
                                                <label className="form-label small fw-bold text-secondary mb-1">Trạng thái xác thực email</label>
                                                <div className="pt-1">
                                                    {customer.emailVerified ? (
                                                        <span className="badge bg-success-subtle text-success border border-success-subtle">
                                                            <FontAwesomeIcon icon={faCircleCheck} className="me-1" /> Đã xác thực
                                                        </span>
                                                    ) : (
                                                        <span className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle">
                                                            <FontAwesomeIcon icon={faClock} className="me-1" /> Chưa xác thực
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Sổ địa chỉ giao hàng */}
                                        <h6 className="fw-bold text-dark mb-2" style={{ fontSize: "14px" }}>
                                            <FontAwesomeIcon icon={faLocationDot} className="text-danger me-2" />
                                            Sổ địa chỉ giao hàng
                                        </h6>
                                        {addresses.length > 0 ? (
                                            <div className="list-group mb-4">
                                                {addresses.map((addr) => (
                                                    <div key={addr.id} className="list-group-item d-flex justify-content-between align-items-center">
                                                        <div>
                                                            <div className="fw-semibold text-dark">
                                                                {addr.recipentName} - {addr.phoneNumber}
                                                                {addr.isDefault && <span className="badge bg-secondary ms-2" style={{ fontSize: 10 }}>Mặc định</span>}
                                                            </div>
                                                            <div className="text-muted small">
                                                                {addr.street}, {addr.ward}, {addr.district}, {addr.city}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="p-3 bg-light rounded-3 text-muted small mb-4">
                                                Khách hàng chưa thêm sổ địa chỉ giao hàng.
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* ── TAB 3: ĐƠN HÀNG & RFQ ── */}
                                {activeTab === "orders" && (
                                    <div>
                                        <h6 className="fw-bold text-dark mb-3" style={{ fontSize: "14px" }}>
                                            <FontAwesomeIcon icon={faBoxesPacking} className="text-primary me-2" />
                                            Lịch sử đơn hàng &amp; Yêu cầu báo giá (RFQ)
                                        </h6>
                                        {recentOrders.length > 0 ? (
                                            <div className="table-responsive border rounded-3">
                                                <table className="table table-sm table-hover align-middle mb-0">
                                                    <thead className="table-light">
                                                        <tr>
                                                            <th>Mã đơn</th>
                                                            <th>Ngày đặt</th>
                                                            <th>Tổng tiền</th>
                                                            <th>Trạng thái</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {recentOrders.map((ord) => (
                                                            <tr key={ord.id}>
                                                                <td className="fw-bold">#{ord.id}</td>
                                                                <td>{ord.createdAt ? new Date(ord.createdAt).toLocaleDateString("vi-VN") : "N/A"}</td>
                                                                <td className="fw-bold text-dark">{formatVnd(ord.totalPrice)}</td>
                                                                <td><span className="badge bg-info">{ord.status}</span></td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ) : (
                                            <div className="p-4 text-center text-muted bg-light rounded-3">
                                                Khách hàng đã chốt <strong>{customer.orders || 24}</strong> đơn trên toàn sàn. Hiện chưa có đơn chờ xử lý nào.
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* ── TAB 4: KHIẾU NẠI (0) ── */}
                                {activeTab === "disputes" && (
                                    <div className="p-4 text-center text-muted bg-light rounded-3">
                                        <FontAwesomeIcon icon={faCircleCheck} className="text-success fs-1 mb-2 d-block" />
                                        <h6 className="fw-bold text-dark">Không có khiếu nại đang chờ xử lý</h6>
                                        <p className="small mb-0 text-secondary">
                                            Khách hàng đạt điểm tín nhiệm cao, không có tranh chấp hoặc hoàn trả nào vi phạm SLA.
                                        </p>
                                    </div>
                                )}

                                {/* ── TAB 5: VÍ & ĐIỂM ── */}
                                {activeTab === "wallet" && (
                                    <div>
                                        <div className="row g-3 mb-4">
                                            <div className="col-6">
                                                <div className="p-3 border rounded-3 bg-light">
                                                    <span className="text-muted small fw-bold">SỐ DƯ STORE CREDIT</span>
                                                    <h4 className="fw-bold text-success mt-1 mb-0">{formatVnd(storeCredit)}</h4>
                                                </div>
                                            </div>
                                            <div className="col-6">
                                                <div className="p-3 border rounded-3 bg-light">
                                                    <span className="text-muted small fw-bold">ĐIỂM THƯỞNG LOYALTY</span>
                                                    <h4 className="fw-bold text-warning mt-1 mb-0">2.450 pts</h4>
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-dark"
                                            onClick={handleAddCredit}
                                        >
                                            <FontAwesomeIcon icon={faPlus} className="me-1" /> Nạp tiền Store Credit
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* ── MODAL FOOTER ── */}
                    <div className="modal-footer border-top px-4 py-3 bg-white d-flex justify-content-between align-items-center">
                        <button
                            type="button"
                            className="btn btn-link p-0 text-danger border-0 fw-semibold text-decoration-none"
                            style={{ fontSize: "13px" }}
                            onClick={() => {
                                setIsLabLocked((prev) => !prev);
                                alert(isLabLocked ? "Đã mở khóa quyền tạo hương Lab cho khách hàng!" : "Đã khóa quyền tạo hương Lab của khách hàng!");
                            }}
                        >
                            {isLabLocked ? "Mở khóa quyền tạo hương Lab" : "Khóa quyền tạo hương Lab"}
                        </button>

                        <div className="d-flex align-items-center gap-2">
                            <button
                                type="button"
                                className="btn btn-sm fw-semibold"
                                style={{
                                    backgroundColor: "#f8fafc",
                                    border: "1px solid #e2e8f0",
                                    color: "#334155",
                                    fontSize: "13px",
                                    padding: "7px 16px",
                                    borderRadius: "6px",
                                }}
                                onClick={handleSaveNote}
                            >
                                Lưu ghi chú CSKH
                            </button>
                            <button
                                type="button"
                                className="btn btn-sm fw-semibold text-white"
                                style={{
                                    backgroundColor: "#e11d48",
                                    border: "1px solid #e11d48",
                                    fontSize: "13px",
                                    padding: "7px 18px",
                                    borderRadius: "6px",
                                }}
                                onClick={handleUpdateProfile}
                            >
                                Cập nhật hồ sơ
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
