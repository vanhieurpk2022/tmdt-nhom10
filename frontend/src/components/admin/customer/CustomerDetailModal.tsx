import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faKey,
    faBan,
    faXmark,
    faStar,
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
    faRotate,
    faUserCheck,
    faPhone,
    faEnvelope,
    faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";
import { CustomerAdminService, type CustomerDetail, type CustomerItem } from "../../../api/CustomerAdminService";

interface CustomerDetailModalProps {
    detail: CustomerDetail;
    loading?: boolean;
    onClose: () => void;
    onToggleStatus: () => void;
    onUpdateCustomer?: (updated: CustomerItem) => void;
}

type TabKey = "info" | "orders" | "disputes" | "wallet";

export default function CustomerDetailModal({
    detail,
    loading = false,
    onClose,
    onToggleStatus,
    onUpdateCustomer,
}: CustomerDetailModalProps) {
    const { customer, addresses = [], recentOrders = [], disputes = [], formulas = [] } = detail;
    const [activeTab, setActiveTab] = useState<TabKey>("info");

    // Form states
    const [fullname, setFullname] = useState(customer.fullname || customer.name || "");
    const [phone, setPhone] = useState(customer.phone || "");
    const [birthday, setBirthday] = useState(customer.birthday || "");
    const [gender, setGender] = useState(customer.gender || "Nam");
    const [cskhNote, setCskhNote] = useState<string>(
        customer.cskhNote || "Khách hàng ưu tiên nhóm hương gỗ và hoa hồng Grasse."
    );
    const [storeCredit, setStoreCredit] = useState<number>(customer.storeCredit ?? 0);
    const [loyaltyPoints, setLoyaltyPoints] = useState<number>(
        customer.loyaltyPoints ?? Math.round((customer.ltv || 0) / 10000)
    );
    const [isLabLocked, setIsLabLocked] = useState<boolean>(false);
    const [saving, setSaving] = useState<boolean>(false);
    const [message, setMessage] = useState<{ type: "success" | "danger"; text: string } | null>(null);

    // Sync when detail changes
    useEffect(() => {
        setActiveTab("info");
        setFullname(customer.fullname || customer.name || "");
        setPhone(customer.phone || "");
        setBirthday(customer.birthday || "");
        setGender(customer.gender || "Nam");
        setCskhNote(customer.cskhNote || "Khách hàng ưu tiên nhóm hương gỗ và hoa hồng Grasse.");
        setStoreCredit(customer.storeCredit ?? 0);
        setLoyaltyPoints(customer.loyaltyPoints ?? Math.round((customer.ltv || 0) / 10000));
    }, [customer]);

    const formatVnd = (val: number) => (val || 0).toLocaleString("vi-VN") + "đ";

    const isBanned = customer.statusCode === "BANNED" || customer.status === "Tạm khóa";

    // Nạp Store Credit
    const handleAddCredit = async () => {
        const input = window.prompt("Nhập số tiền Store Credit cần cộng cho khách hàng (VNĐ):", "500000");
        if (!input) return;
        const num = parseInt(input.replace(/\D/g, ""), 10);
        if (isNaN(num) || num <= 0) {
            alert("Số tiền không hợp lệ.");
            return;
        }

        try {
            setSaving(true);
            const updated = await CustomerAdminService.updateStoreCredit(customer.id, num);
            setStoreCredit(updated.storeCredit ?? storeCredit + num);
            onUpdateCustomer?.(updated);
            alert(`Đã cộng thành công ${formatVnd(num)} vào Ví Store Credit của khách hàng!`);
        } catch {
            alert("Không thể cập nhật Store Credit. Vui lòng thử lại.");
        } finally {
            setSaving(false);
        }
    };

    // Đặt lại mật khẩu
    const handleResetPassword = async () => {
        if (!window.confirm(`Bạn có chắc chắn muốn đặt lại mật khẩu cho khách hàng ${customer.name} (${customer.email})?`)) {
            return;
        }
        try {
            setSaving(true);
            const defaultPassword = await CustomerAdminService.resetPassword(customer.id);
            alert(`Đặt lại mật khẩu thành công! Mật khẩu mới của khách hàng là: ${defaultPassword}`);
        } catch {
            alert("Không thể đặt lại mật khẩu. Vui lòng thử lại sau.");
        } finally {
            setSaving(false);
        }
    };

    // Lưu ghi chú CSKH
    const handleSaveNote = async () => {
        try {
            setSaving(true);
            const updated = await CustomerAdminService.updateInfo(customer.id, { cskhNote });
            onUpdateCustomer?.(updated);
            setMessage({ type: "success", text: "Đã lưu ghi chú CSKH vào cơ sở dữ liệu thành công!" });
            setTimeout(() => setMessage(null), 4000);
        } catch {
            setMessage({ type: "danger", text: "Có lỗi xảy ra khi lưu ghi chú." });
        } finally {
            setSaving(false);
        }
    };

    // Cập nhật thông tin hồ sơ
    const handleUpdateProfile = async () => {
        try {
            setSaving(true);
            const updated = await CustomerAdminService.updateInfo(customer.id, {
                fullname,
                phone,
                birthday,
                gender,
                cskhNote,
            });
            onUpdateCustomer?.(updated);
            setMessage({ type: "success", text: "Cập nhật thông tin khách hàng thành công!" });
            setTimeout(() => setMessage(null), 4000);
        } catch {
            setMessage({ type: "danger", text: "Không thể cập nhật thông tin khách hàng." });
        } finally {
            setSaving(false);
        }
    };

    const getOrderStatusBadge = (status: string) => {
        switch (status?.toUpperCase()) {
            case "COMPLETED":
            case "DELIVERED":
                return <span className="badge bg-success-subtle text-success border border-success-subtle">Giao thành công</span>;
            case "PENDING":
            case "PENDING_PAYMENT":
                return <span className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle">Chờ thanh toán</span>;
            case "PROCESSING":
            case "SHIPPING":
            case "SHIPPED":
                return <span className="badge bg-info-subtle text-info-emphasis border border-info-subtle">Đang vận chuyển</span>;
            case "CANCELLED":
                return <span className="badge bg-danger-subtle text-danger border border-danger-subtle">Đã hủy</span>;
            default:
                return <span className="badge bg-secondary-subtle text-secondary border border-secondary-subtle">{status || "Đang xử lý"}</span>;
        }
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
                                {customer.initials || "KH"}
                            </div>

                            {/* Info */}
                            <div className="d-flex flex-column">
                                <div className="d-flex align-items-center gap-2 flex-wrap">
                                    <h5 className="modal-title fw-bold text-dark mb-0 fs-5" style={{ letterSpacing: "-0.2px" }}>
                                        {customer.fullname || customer.name || "Khách hàng"}
                                    </h5>
                                    <span className="vip-diamond-pill">
                                        <FontAwesomeIcon icon={faStar} style={{ fontSize: "10px" }} />
                                        {customer.tier || "Thành viên"}
                                    </span>
                                </div>
                                <div className="d-flex align-items-center gap-2 text-muted small mt-1">
                                    <span>Mã: CUST-{customer.id}</span>
                                    <span>•</span>
                                    <span>Email: {customer.email || "Chưa có"}</span>
                                    <span>•</span>
                                    <span>
                                        Tham gia:{" "}
                                        {customer.createdAt
                                            ? new Date(customer.createdAt).toLocaleDateString("vi-VN", {
                                                  month: "2-digit",
                                                  year: "numeric",
                                              })
                                            : "Mới tạo"}
                                    </span>
                                    <span>•</span>
                                    <span className="text-success fw-semibold">
                                        Đơn chốt: {customer.orders || 0}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Top Action Icons */}
                        <div className="d-flex align-items-center gap-3 ms-2">
                            <button
                                type="button"
                                className="btn btn-link p-1 text-secondary border-0"
                                title="Đặt lại mật khẩu (Default: Password123@)"
                                onClick={handleResetPassword}
                                disabled={saving}
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

                    {/* Alert Message */}
                    {message && (
                        <div className={`alert alert-${message.type} py-2 px-4 mb-0 rounded-0 small d-flex align-items-center justify-content-between`}>
                            <span>{message.text}</span>
                            <button type="button" className="btn-close btn-close-sm" onClick={() => setMessage(null)} />
                        </div>
                    )}

                    {/* ── MODAL BODY ── */}
                    <div className="modal-body p-4" style={{ maxHeight: "78vh", overflowY: "auto" }}>
                        {loading ? (
                            <div className="text-center py-5">
                                <div className="spinner-border text-danger" role="status" />
                                <div className="mt-2 text-muted small">Đang nạp hồ sơ khách hàng...</div>
                            </div>
                        ) : (
                            <>
                                {/* 1. Strip 3 thông số (Tổng LTV, Đã chốt, Loyalty Pts) */}
                                <div className="detail-metrics-strip mb-4">
                                    <div className="row g-0 text-center">
                                        <div className="col-4 detail-metric-col">
                                            <span className="detail-metric-label">TỔNG LTV</span>
                                            <span className="detail-metric-val">{formatVnd(customer.ltv || 0)}</span>
                                        </div>
                                        <div className="col-4 detail-metric-col">
                                            <span className="detail-metric-label">ĐÃ CHỐT</span>
                                            <span className="detail-metric-val">{customer.orders || 0} đơn</span>
                                        </div>
                                        <div className="col-4 detail-metric-col">
                                            <span className="detail-metric-label">LOYALTY PTS</span>
                                            <span className="detail-metric-val" style={{ color: "#d97706" }}>
                                                {loyaltyPoints.toLocaleString("vi-VN")} pts
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
                                        className={`detail-tab-btn ${activeTab === "orders" ? "active" : ""}`}
                                        onClick={() => setActiveTab("orders")}
                                    >
                                        2. Đơn hàng ({recentOrders.length})
                                    </button>
                                    <button
                                        type="button"
                                        className={`detail-tab-btn ${activeTab === "disputes" ? "active" : ""}`}
                                        onClick={() => setActiveTab("disputes")}
                                    >
                                        3. Khiếu nại ({disputes.length})
                                    </button>
                                    <button
                                        type="button"
                                        className={`detail-tab-btn ${activeTab === "wallet" ? "active" : ""}`}
                                        onClick={() => setActiveTab("wallet")}
                                    >
                                        4. Ví &amp; Điểm
                                    </button>
                                </div>

                                {/* ── TAB 1: THÔNG TIN & BẢO MẬT ── */}
                                {activeTab === "info" && (
                                    <div>
                                        <h6 className="fw-bold text-dark mb-3" style={{ fontSize: "14px" }}>
                                            <FontAwesomeIcon icon={faShieldHalved} className="text-danger me-2" />
                                            Thông tin cá nhân &amp; Tài khoản
                                        </h6>

                                        <div className="row g-3 mb-4">
                                            <div className="col-12 col-md-6">
                                                <label className="form-label small fw-bold text-secondary mb-1">Họ và tên</label>
                                                <input
                                                    type="text"
                                                    className="form-control form-control-sm"
                                                    value={fullname}
                                                    onChange={(e) => setFullname(e.target.value)}
                                                    placeholder="Nhập họ và tên"
                                                />
                                            </div>
                                            <div className="col-12 col-md-6">
                                                <label className="form-label small fw-bold text-secondary mb-1">Email</label>
                                                <input
                                                    type="email"
                                                    className="form-control form-control-sm bg-light"
                                                    value={customer.email || ""}
                                                    disabled
                                                    readOnly
                                                />
                                            </div>
                                            <div className="col-12 col-md-6">
                                                <label className="form-label small fw-bold text-secondary mb-1">Số điện thoại</label>
                                                <input
                                                    type="tel"
                                                    className="form-control form-control-sm"
                                                    value={phone}
                                                    onChange={(e) => setPhone(e.target.value)}
                                                    placeholder="Ví dụ: 0912345678"
                                                />
                                            </div>
                                            <div className="col-12 col-md-6">
                                                <label className="form-label small fw-bold text-secondary mb-1">Ngày sinh</label>
                                                <input
                                                    type="date"
                                                    className="form-control form-control-sm"
                                                    value={birthday}
                                                    onChange={(e) => setBirthday(e.target.value)}
                                                />
                                            </div>
                                            <div className="col-12 col-md-6">
                                                <label className="form-label small fw-bold text-secondary mb-1">Giới tính</label>
                                                <select
                                                    className="form-select form-select-sm"
                                                    value={gender}
                                                    onChange={(e) => setGender(e.target.value)}
                                                >
                                                    <option value="Nam">Nam</option>
                                                    <option value="Nữ">Nữ</option>
                                                    <option value="Khác">Khác</option>
                                                </select>
                                            </div>
                                            <div className="col-12 col-md-6">
                                                <label className="form-label small fw-bold text-secondary mb-1">Xác thực tài khoản</label>
                                                <div className="pt-1">
                                                    {customer.emailVerified ? (
                                                        <span className="badge bg-success-subtle text-success border border-success-subtle">
                                                            <FontAwesomeIcon icon={faCircleCheck} className="me-1" /> Đã xác thực email
                                                        </span>
                                                    ) : (
                                                        <span className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle">
                                                            <FontAwesomeIcon icon={faClock} className="me-1" /> Chưa xác thực email
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="col-12">
                                                <label className="form-label small fw-bold text-secondary mb-1">Ghi chú chăm sóc khách hàng (CSKH)</label>
                                                <textarea
                                                    className="form-control form-control-sm"
                                                    rows={3}
                                                    value={cskhNote}
                                                    onChange={(e) => setCskhNote(e.target.value)}
                                                    placeholder="Ghi chú sở thích mùi hương, lưu ý giao hàng, hoặc yêu cầu đặc biệt..."
                                                />
                                            </div>
                                        </div>

                                        {/* Sổ địa chỉ giao hàng */}
                                        <h6 className="fw-bold text-dark mb-2" style={{ fontSize: "14px" }}>
                                            <FontAwesomeIcon icon={faLocationDot} className="text-danger me-2" />
                                            Sổ địa chỉ giao hàng ({addresses.length})
                                        </h6>
                                        {addresses.length > 0 ? (
                                            <div className="list-group mb-4">
                                                {addresses.map((addr) => (
                                                    <div key={addr.id} className="list-group-item d-flex justify-content-between align-items-center">
                                                        <div>
                                                            <div className="fw-semibold text-dark">
                                                                {addr.recipentName} - {addr.phoneNumber}
                                                                {addr.isDefault && (
                                                                    <span className="badge bg-danger ms-2" style={{ fontSize: 10 }}>
                                                                        Mặc định
                                                                    </span>
                                                                )}
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

                                {/* ── TAB 2: ĐƠN HÀNG ── */}
                                {activeTab === "orders" && (
                                    <div>
                                        <h6 className="fw-bold text-dark mb-3" style={{ fontSize: "14px" }}>
                                            <FontAwesomeIcon icon={faBoxesPacking} className="text-primary me-2" />
                                            Lịch sử đơn hàng gần đây ({recentOrders.length})
                                        </h6>
                                        {recentOrders.length > 0 ? (
                                            <div className="table-responsive border rounded-3">
                                                <table className="table table-sm table-hover align-middle mb-0">
                                                    <thead className="table-light">
                                                        <tr>
                                                            <th>Mã đơn</th>
                                                            <th>Ngày đặt</th>
                                                            <th>Người nhận &amp; Địa chỉ</th>
                                                            <th>Số món</th>
                                                            <th>Tổng tiền</th>
                                                            <th>Trạng thái</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {recentOrders.map((ord) => (
                                                            <tr key={ord.id}>
                                                                <td className="fw-bold text-danger">#{ord.id}</td>
                                                                <td>
                                                                    {ord.createdAt
                                                                        ? new Date(ord.createdAt).toLocaleDateString("vi-VN")
                                                                        : "N/A"}
                                                                </td>
                                                                <td>
                                                                    <div className="fw-semibold text-dark small">
                                                                        {ord.recipientName || customer.name}
                                                                    </div>
                                                                    <div className="text-muted text-truncate" style={{ maxWidth: 220, fontSize: 11 }}>
                                                                        {ord.shippingAddress || "N/A"}
                                                                    </div>
                                                                </td>
                                                                <td className="small">{ord.itemCount || 1} sp</td>
                                                                <td className="fw-bold text-dark">{formatVnd(ord.totalPrice)}</td>
                                                                <td>{getOrderStatusBadge(ord.status)}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ) : (
                                            <div className="p-4 text-center text-muted bg-light rounded-3">
                                                <FontAwesomeIcon icon={faBoxesPacking} className="fs-1 text-muted mb-2 d-block opacity-50" />
                                                <div className="fw-semibold">Khách hàng chưa có đơn hàng nào phát sinh.</div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* ── TAB 3: KHIẾU NẠI (DISPUTES) ── */}
                                {activeTab === "disputes" && (
                                    <div>
                                        <h6 className="fw-bold text-dark mb-3" style={{ fontSize: "14px" }}>
                                            <FontAwesomeIcon icon={faTriangleExclamation} className="text-warning me-2" />
                                            Danh sách khiếu nại &amp; Hoàn tiền ({disputes.length})
                                        </h6>
                                        {disputes.length > 0 ? (
                                            <div className="table-responsive border rounded-3">
                                                <table className="table table-sm table-hover align-middle mb-0">
                                                    <thead className="table-light">
                                                        <tr>
                                                            <th>Mã khiếu nại</th>
                                                            <th>Mã đơn</th>
                                                            <th>Lý do</th>
                                                            <th>Số tiền hoàn</th>
                                                            <th>Ngày gửi</th>
                                                            <th>Trạng thái</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {disputes.map((d) => (
                                                            <tr key={d.id}>
                                                                <td className="fw-bold text-danger">#REF-{d.id}</td>
                                                                <td>#{d.orderId}</td>
                                                                <td>{d.reason}</td>
                                                                <td className="fw-bold">{formatVnd(d.amount || 0)}</td>
                                                                <td className="small">
                                                                    {d.createdAt ? new Date(d.createdAt).toLocaleDateString("vi-VN") : "N/A"}
                                                                </td>
                                                                <td>
                                                                    <span className="badge bg-warning-subtle text-warning-emphasis border">
                                                                        {d.status || "Chờ xử lý"}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ) : (
                                            <div className="p-4 text-center text-muted bg-light rounded-3">
                                                <FontAwesomeIcon icon={faCircleCheck} className="text-success fs-1 mb-2 d-block" />
                                                <h6 className="fw-bold text-dark">Không có khiếu nại đang chờ xử lý</h6>
                                                <p className="small mb-0 text-secondary">
                                                    Khách hàng đạt điểm tín nhiệm cao, không có tranh chấp hoặc khiếu nại hoàn trả nào.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* ── TAB 4: VÍ & ĐIỂM ── */}
                                {activeTab === "wallet" && (
                                    <div>
                                        <div className="row g-3 mb-4">
                                            <div className="col-6">
                                                <div className="p-3 border rounded-3 bg-light">
                                                    <span className="text-muted small fw-bold">SỐ DƯ STORE CREDIT</span>
                                                    <h4 className="fw-bold text-success mt-1 mb-0">{formatVnd(storeCredit)}</h4>
                                                    <div className="text-muted small mt-1">Dùng để thanh toán đơn hàng &amp; bù trừ hoàn tiền</div>
                                                </div>
                                            </div>
                                            <div className="col-6">
                                                <div className="p-3 border rounded-3 bg-light">
                                                    <span className="text-muted small fw-bold">ĐIỂM THƯỞNG LOYALTY</span>
                                                    <h4 className="fw-bold text-warning mt-1 mb-0">
                                                        {loyaltyPoints.toLocaleString("vi-VN")} pts
                                                    </h4>
                                                    <div className="text-muted small mt-1">Tích lũy từ chi tiêu trên sàn (10.000đ = 1 pt)</div>
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-dark"
                                            onClick={handleAddCredit}
                                            disabled={saving}
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
                                alert(
                                    isLabLocked
                                        ? "Đã mở khóa quyền tạo hương Lab cho khách hàng!"
                                        : "Đã khóa quyền tạo hương Lab của khách hàng!"
                                );
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
                                disabled={saving}
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
                                disabled={saving}
                            >
                                {saving ? "Đang lưu..." : "Cập nhật hồ sơ"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
