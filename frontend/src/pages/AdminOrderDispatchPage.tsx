import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faSliders,
    faCheck,
    faUser,
    faFlask,
    faBuilding,
    faReceipt,
    faMagnifyingGlass,
    faRightLeft,
    faPlus,
    faMinus,
    faFloppyDisk,
    faArrowLeft,
    faPhone,
    faEnvelope,
    faLocationDot,
    faCircleCheck,
    faTag,
    faBoxesPacking,
    faXmark,
} from "@fortawesome/free-solid-svg-icons";

import SidebarAdmin from "../components/admin/dashboard/SideBarAdmin";
import { useAdminSidebar } from "../api/AdminSidebarContext";
import { ROUTES } from "../routes/routes";
import { CustomerAdminService, type CustomerItem } from "../api/CustomerAdminService";
import { FactoryApiService, type FactoryItem } from "../api/FactoryService";
import "../css/pages/admin-order-dispatch.css";

interface CustomerOption {
    id: string | number;
    code: string;
    name: string;
    phone: string;
    email: string;
    address: string;
    initials: string;
}

const DEFAULT_CUSTOMER: CustomerOption = {
    id: 1,
    code: "#CUST-98241",
    name: "Nguyễn Văn A",
    phone: "090 123 4567",
    email: "nguyen.van.a@email.com",
    address: "Số 12, Ngõ 84, Đường Láng, Phường Láng Thượng, Quận Đống Đa, TP. Hà Nội",
    initials: "NA",
};

export default function AdminOrderDispatchPage() {
    const navigate = useNavigate();
    const { isCollapsed: isSidebarCollapsed } = useAdminSidebar();

    // Customer Selection
    const [customer, setCustomer] = useState<CustomerOption>(DEFAULT_CUSTOMER);
    const [searchKeyword, setSearchKeyword] = useState<string>("0901234567 - Nguyễn Văn A");
    const [showCustomerModal, setShowCustomerModal] = useState<boolean>(false);
    const [realCustomers, setRealCustomers] = useState<CustomerItem[]>([]);

    // Operation Notes
    const [operationNotes, setOperationNotes] = useState<string>(
        "Giao giờ hành chính (9h - 17h), bọc chống sốc kỹ 3 lớp cho chai tinh dầu thủy tinh thủ công, dán tem vỡ niêm phong Oilia Atelier."
    );

    // Quantity & Pricing
    const [quantity, setQuantity] = useState<number>(1);
    const baseUnitPrice = 800000;
    const shippingFee = 35000;
    const discountAmount = 35000; // Voucher SCENTFIRST20
    const voucherCode = "SCENTFIRST20";

    const subTotal = baseUnitPrice * quantity;
    const grandTotal = Math.max(0, subTotal + shippingFee - discountAmount);

    const formatVnd = (val: number) => (val || 0).toLocaleString("vi-VN") + "đ";

    // Workshop Selection
    const [factories, setFactories] = useState<FactoryItem[]>([]);
    const [selectedWorkshop, setSelectedWorkshop] = useState<string>("Nordic Lab TP.HCM (Quận 7)");

    // Action loading / Feedback
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "info" } | null>(null);

    // Load actual factories & customers if available
    useEffect(() => {
        FactoryApiService.getAllFactories()
            .then((list) => {
                if (list && list.length > 0) {
                    setFactories(list);
                }
            })
            .catch(() => {
                /* fallback to defaults */
            });

        CustomerAdminService.getCustomers(0, 15)
            .then((res) => {
                if (res?.content && res.content.length > 0) {
                    setRealCustomers(res.content);
                }
            })
            .catch(() => {
                /* ignore */
            });
    }, []);

    const showToast = (text: string, type: "success" | "info" = "success") => {
        setToastMessage({ text, type });
        setTimeout(() => setToastMessage(null), 4000);
    };

    // Handle Issue Order (Phát hành đơn)
    const handleIssueOrder = () => {
        setSubmitting(true);
        setTimeout(() => {
            setSubmitting(false);
            showToast("Phát hành lệnh điều phối gia công thành công! Đã gửi thông báo tới xưởng chế tác.", "success");
            setTimeout(() => {
                navigate(ROUTES.ADMIN_ORDER);
            }, 1200);
        }, 800);
    };

    // Handle Save Draft (Lưu bản nháp)
    const handleSaveDraft = () => {
        showToast("Đã lưu bản nháp lệnh điều phối (#DRA-98241).", "info");
    };

    // Select customer from list
    const handleSelectCustomer = (c: CustomerItem) => {
        const fullAddr = "Địa chỉ liên kết hệ thống, Quận 1, TP. Hồ Chí Minh";
        const selectedOpt: CustomerOption = {
            id: c.id,
            code: `#CUST-${c.id}`,
            name: c.fullname || c.name || "Khách hàng",
            phone: c.phone || "090 123 4567",
            email: c.email || "customer@oilia.vn",
            address: fullAddr,
            initials: c.initials || "KH",
        };
        setCustomer(selectedOpt);
        setSearchKeyword(`${selectedOpt.phone} - ${selectedOpt.name}`);
        setShowCustomerModal(false);
        showToast(`Đã chọn người nhận: ${selectedOpt.name}`, "info");
    };

    return (
        <div className="d-flex min-vh-100 w-100 admin-dispatch-page">
            {/* Sidebar matching UserManager */}
            <aside
                className="flex-shrink-0 position-sticky top-0 align-self-start"
                style={{
                    width: isSidebarCollapsed ? "72px" : "250px",
                    minWidth: isSidebarCollapsed ? "72px" : "250px",
                    height: "100vh",
                    zIndex: 1000,
                    backgroundColor: "var(--color-bg-dark, #111827)",
                    transition: "width 0.25s cubic-bezier(0.4, 0, 0.2, 1), min-width 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
            >
                <SidebarAdmin isOrder={true} />
            </aside>

            {/* Main Content Area */}
            <div className="flex-grow-1 p-3 p-lg-4 overflow-x-auto" style={{ minWidth: 0 }}>
                {/* Toast Notification */}
                {toastMessage && (
                    <div
                        className={`alert alert-${toastMessage.type === "success" ? "success" : "primary"} d-flex align-items-center justify-content-between mb-3 py-2 px-3 shadow-sm rounded-3`}
                        style={{ fontSize: "13px" }}
                    >
                        <div className="d-flex align-items-center gap-2">
                            <FontAwesomeIcon icon={faCircleCheck} />
                            <span>{toastMessage.text}</span>
                        </div>
                        <button
                            type="button"
                            className="btn-close"
                            aria-label="Close"
                            onClick={() => setToastMessage(null)}
                        />
                    </div>
                )}

                {/* Breadcrumb & Header */}
                <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-3">
                    <div>
                        <div className="dispatch-breadcrumb">
                            <span>Quản trị hệ thống</span>
                            <span className="crumb-sep">›</span>
                            <Link to={ROUTES.ADMIN_ORDER} className="text-secondary text-decoration-none">
                                Quản lý đơn đặt hàng
                            </Link>
                            <span className="crumb-sep">›</span>
                            <span className="active-crumb">Tạo đơn điều phối mới</span>
                        </div>
                        <h1 className="h4 fw-bold text-dark mb-1" style={{ letterSpacing: "-0.2px" }}>
                            Tạo đơn điều phối vận hành &amp; Điều hướng xưởng chế tác
                        </h1>
                        <p className="text-secondary small mb-0" style={{ maxWidth: "780px" }}>
                            Khởi tạo luồng điều phối gia công bespoke, ấn định xưởng chưng cất, thiết lập kiểm định QC và gán đơn vị vận chuyển B2B2C.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="btn btn-sm btn-white border rounded-3 fw-semibold text-secondary d-flex align-items-center gap-2 px-3 py-2 shadow-sm"
                        style={{ backgroundColor: "#ffffff" }}
                        onClick={handleSaveDraft}
                    >
                        <FontAwesomeIcon icon={faFloppyDisk} />
                        Lưu bản nháp
                    </button>
                </div>

                {/* Banner: Tiến trình thiết lập đơn vận hành (Stepper Tracker) */}
                <div className="stepper-banner-card">
                    <div className="d-flex align-items-center gap-3">
                        <div className="stepper-icon-box">
                            <FontAwesomeIcon icon={faSliders} />
                        </div>
                        <div>
                            <h6 className="fw-bold text-dark mb-0" style={{ fontSize: "14px" }}>
                                Tiến trình thiết lập đơn vận hành
                            </h6>
                            <p className="text-secondary small mb-0" style={{ fontSize: "12px" }}>
                                Hồ sơ công thức &amp; thông số kho vận đang được chuẩn hóa
                            </p>
                        </div>
                    </div>

                    <div className="stepper-track">
                        {/* Step 1: Khách hàng (Hoàn tất) */}
                        <div className="step-item completed">
                            <span className="step-bubble completed">
                                <FontAwesomeIcon icon={faCheck} />
                            </span>
                            <span>Khách hàng</span>
                        </div>
                        <div className="step-line completed" />

                        {/* Step 2: Công thức Lab (Đang thực hiện) */}
                        <div className="step-item active">
                            <span className="step-bubble active">2</span>
                            <span>Công thức Lab</span>
                        </div>
                        <div className="step-line" />

                        {/* Step 3: Xưởng chỉ định */}
                        <div className="step-item pending">
                            <span className="step-bubble pending">3</span>
                            <span>Xưởng chỉ định</span>
                        </div>
                        <div className="step-line" />

                        {/* Step 4: Vận chuyển */}
                        <div className="step-item pending">
                            <span className="step-bubble pending">4</span>
                            <span>Vận chuyển</span>
                        </div>
                    </div>
                </div>

                {/* 2-Column Grid Layout */}
                <div className="row g-4">
                    {/* CỘT TRÁI: Cards 1, 2, 3 */}
                    <div className="col-12 col-xl-8 col-lg-7">
                        {/* ── CARD 1: Thông tin người nhận & Địa chỉ giao hàng ── */}
                        <div className="dispatch-section-card">
                            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                                <div className="d-flex align-items-center gap-2">
                                    <div className="section-icon-badge">
                                        <FontAwesomeIcon icon={faUser} />
                                    </div>
                                    <h6 className="fw-bold text-dark mb-0" style={{ fontSize: "15px" }}>
                                        1. Thông tin người nhận &amp; Địa chỉ giao hàng
                                    </h6>
                                </div>
                                <button
                                    type="button"
                                    className="btn btn-link p-0 text-danger border-0 fw-semibold text-decoration-none small d-flex align-items-center gap-1"
                                    onClick={() => setShowCustomerModal(true)}
                                >
                                    <FontAwesomeIcon icon={faRightLeft} style={{ fontSize: "11px" }} />
                                    Đổi người nhận
                                </button>
                            </div>

                            {/* Search box auto-suggest */}
                            <div className="position-relative mb-2">
                                <span
                                    className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary"
                                    style={{ fontSize: "13px" }}
                                >
                                    <FontAwesomeIcon icon={faMagnifyingGlass} />
                                </span>
                                <input
                                    type="text"
                                    className="form-control rounded-3 ps-5 bg-light border-0 shadow-none"
                                    style={{ fontSize: "13.5px", padding: "10px 14px 10px 38px", color: "#1e293b" }}
                                    value={searchKeyword}
                                    onChange={(e) => setSearchKeyword(e.target.value)}
                                    placeholder="Tìm theo số điện thoại hoặc họ tên khách hàng..."
                                />
                            </div>

                            {/* Customer Profile Display Card */}
                            <div className="customer-highlight-box">
                                <div className="d-flex align-items-start gap-3">
                                    <div className="avatar-circle-red">
                                        {customer.initials}
                                    </div>
                                    <div className="flex-grow-1" style={{ minWidth: 0 }}>
                                        <div className="d-flex align-items-center gap-2 flex-wrap">
                                            <h6 className="fw-bold text-dark mb-0 fs-6">{customer.name}</h6>
                                            <span className="text-secondary small">
                                                Mã định danh khách: <strong>{customer.code}</strong>
                                            </span>
                                        </div>

                                        <div className="customer-detail-grid">
                                            <div className="d-flex align-items-center gap-2">
                                                <FontAwesomeIcon icon={faPhone} className="text-secondary" />
                                                <span>{customer.phone}</span>
                                            </div>
                                            <div className="d-flex align-items-center gap-2">
                                                <FontAwesomeIcon icon={faEnvelope} className="text-secondary" />
                                                <span className="text-truncate">{customer.email}</span>
                                            </div>
                                            <div className="d-flex align-items-start gap-2 grid-col-span" style={{ gridColumn: "1 / -1" }}>
                                                <FontAwesomeIcon icon={faLocationDot} className="text-danger mt-1 flex-shrink-0" />
                                                <span>{customer.address}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Ghi chú vận hành & giao nhận */}
                            <div className="mt-3">
                                <label className="form-label small fw-semibold text-secondary mb-1">
                                    Ghi chú vận hành &amp; giao nhận:
                                </label>
                                <textarea
                                    className="form-control form-control-sm rounded-3 bg-light border-0"
                                    rows={2}
                                    style={{ fontSize: "12.5px", lineHeight: "1.6", color: "#334155" }}
                                    value={operationNotes}
                                    onChange={(e) => setOperationNotes(e.target.value)}
                                    placeholder="Ghi chú đóng gói bọc xốp, giờ giao nhận..."
                                />
                            </div>
                        </div>

                        {/* ── CARD 2: Chọn sản phẩm và chế tác theo yêu cầu ── */}
                        <div className="dispatch-section-card">
                            <div className="d-flex align-items-center gap-2 mb-3">
                                <div className="section-icon-badge flask">
                                    <FontAwesomeIcon icon={faFlask} />
                                </div>
                                <h6 className="fw-bold text-dark mb-0" style={{ fontSize: "15px" }}>
                                    2. Chọn sản phẩm và chế tác theo yêu cầu
                                </h6>
                            </div>

                            {/* Product Info Row */}
                            <div className="product-dispatch-card">
                                <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                                    <div className="d-flex align-items-center gap-3" style={{ minWidth: 0 }}>
                                        <div className="product-thumb-container">
                                            <img
                                                src="/images/home/lavender-france.png"
                                                alt="Tinh dầu Lavender Pháp"
                                                onError={(e) => {
                                                    e.currentTarget.src = "https://placehold.co/80x80/e2e8f0/475569?text=Oilia";
                                                }}
                                            />
                                            <span className="thumb-vol-badge">10ml</span>
                                        </div>

                                        <div>
                                            <h6 className="fw-bold text-dark mb-1" style={{ fontSize: "14px" }}>
                                                Tinh dầu Lavender Pháp (10ml) + Tràm Trà Tea Tree
                                            </h6>
                                            <span
                                                className="badge fw-semibold"
                                                style={{
                                                    backgroundColor: "#be123c",
                                                    color: "#ffffff",
                                                    fontSize: "11px",
                                                    padding: "3px 8px",
                                                    borderRadius: "4px",
                                                }}
                                            >
                                                Chế tác thủ công
                                            </span>
                                        </div>
                                    </div>

                                    {/* Quantity Stepper */}
                                    <div className="qty-stepper">
                                        <button
                                            type="button"
                                            className="qty-btn"
                                            onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                                            title="Giảm số lượng"
                                        >
                                            <FontAwesomeIcon icon={faMinus} style={{ fontSize: "10px" }} />
                                        </button>
                                        <span className="qty-text">
                                            {String(quantity).padStart(2, "0")} Chai (10ml)
                                        </span>
                                        <button
                                            type="button"
                                            className="qty-btn"
                                            onClick={() => setQuantity((prev) => prev + 1)}
                                            title="Tăng số lượng"
                                        >
                                            <FontAwesomeIcon icon={faPlus} style={{ fontSize: "10px" }} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Tỷ lệ công thức phối chế độc quyền */}
                            <div className="mt-4">
                                <div className="d-flex justify-content-between align-items-center">
                                    <span className="fw-bold text-dark" style={{ fontSize: "13px" }}>
                                        Tỷ lệ công thức phối chế độc quyền
                                    </span>
                                    <span className="text-secondary small fw-medium">Tổng 100% Volume</span>
                                </div>

                                {/* Multi-color segmented progress bar */}
                                <div className="formula-multi-progress">
                                    <div className="segment-lavender" title="60% Lavender Pháp" />
                                    <div className="segment-teatree" title="30% Tràm Trà Úc" />
                                    <div className="segment-cedar" title="10% Tuyết Tùng" />
                                </div>

                                {/* 3 Breakdown Cards */}
                                <div className="row g-2">
                                    <div className="col-12 col-md-4">
                                        <div className="formula-ratio-card">
                                            <div className="d-flex align-items-center gap-2 mb-1">
                                                <span className="formula-dot red" />
                                                <span className="fw-bold text-dark" style={{ fontSize: "12.5px" }}>
                                                    60% Lavender Pháp
                                                </span>
                                            </div>
                                            <div className="text-secondary small ps-3" style={{ fontSize: "11.5px" }}>
                                                {(6.0 * quantity).toFixed(1)} ml • Cất hơi nước
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-12 col-md-4">
                                        <div className="formula-ratio-card">
                                            <div className="d-flex align-items-center gap-2 mb-1">
                                                <span className="formula-dot green" />
                                                <span className="fw-bold text-dark" style={{ fontSize: "12.5px" }}>
                                                    30% Tràm Trà Úc
                                                </span>
                                            </div>
                                            <div className="text-secondary small ps-3" style={{ fontSize: "11.5px" }}>
                                                {(3.0 * quantity).toFixed(1)} ml • Tiêu chuẩn Organic
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-12 col-md-4">
                                        <div className="formula-ratio-card">
                                            <div className="d-flex align-items-center gap-2 mb-1">
                                                <span className="formula-dot blue" />
                                                <span className="fw-bold text-dark" style={{ fontSize: "12.5px" }}>
                                                    10% Tuyết Tùng
                                                </span>
                                            </div>
                                            <div className="text-secondary small ps-3" style={{ fontSize: "11.5px" }}>
                                                {(1.0 * quantity).toFixed(1)} ml • Nốt hương trầm
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ── CARD 3: Phân bổ Xưởng chế tác ── */}
                        <div className="dispatch-section-card mb-0">
                            <div className="d-flex align-items-center gap-2 mb-3">
                                <div className="section-icon-badge workshop">
                                    <FontAwesomeIcon icon={faBuilding} />
                                </div>
                                <h6 className="fw-bold text-dark mb-0" style={{ fontSize: "15px" }}>
                                    3. Phân bổ Xưởng chế tác
                                </h6>
                            </div>

                            <div>
                                <label className="form-label small fw-semibold text-secondary mb-2">
                                    Xưởng chế tác chỉ định thực hiện:
                                </label>
                                <select
                                    className="form-select form-select-lg rounded-3 fs-6"
                                    style={{ borderColor: "#cbd5e1" }}
                                    value={selectedWorkshop}
                                    onChange={(e) => setSelectedWorkshop(e.target.value)}
                                >
                                    <option value="Nordic Lab TP.HCM (Quận 7)">
                                        Nordic Lab TP.HCM (Quận 7)
                                    </option>
                                    <option value="Labcos - Viện nghiên cứu hương liệu TP.HCM">
                                        Labcos - Viện nghiên cứu hương liệu TP.HCM
                                    </option>
                                    <option value="VIPSEN - Xưởng chưng cất tự nhiên Hà Nội">
                                        VIPSEN - Xưởng chưng cất tự nhiên Hà Nội
                                    </option>
                                    <option value="BIYOKEA - Xưởng tinh dầu dược liệu">
                                        BIYOKEA - Xưởng tinh dầu dược liệu
                                    </option>
                                    <option value="DALOSA Việt Nam">
                                        DALOSA Việt Nam
                                    </option>
                                    {factories.map((f) => (
                                        <option key={f.id} value={`${f.name} - ${f.address}`}>
                                            {f.name} ({f.address})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* CỘT PHẢI: Card Tổng tiền & Hành động (Sticky) */}
                    <div className="col-12 col-xl-4 col-lg-5">
                        <div className="summary-card-sticky">
                            <div className="d-flex align-items-center gap-2 mb-4">
                                <div className="section-icon-badge summary">
                                    <FontAwesomeIcon icon={faReceipt} />
                                </div>
                                <h6 className="fw-bold text-dark mb-0" style={{ fontSize: "16px" }}>
                                    Tổng tiền
                                </h6>
                            </div>

                            {/* Bảng tính giá */}
                            <div className="d-flex flex-column gap-3 mb-4">
                                <div className="d-flex justify-content-between align-items-center text-secondary small">
                                    <span>Giá gốc tinh dầu (10ml Handmade)</span>
                                    <span className="fw-bold text-dark">{formatVnd(subTotal)}</span>
                                </div>

                                <div className="d-flex justify-content-between align-items-center text-secondary small">
                                    <span>Phí vận chuyển</span>
                                    <span className="fw-bold text-dark">{formatVnd(shippingFee)}</span>
                                </div>

                                <div className="d-flex justify-content-between align-items-center small">
                                    <span
                                        className="badge text-danger border border-danger-subtle fw-bold"
                                        style={{ backgroundColor: "#fff1f2", fontSize: "11px", padding: "4px 8px" }}
                                    >
                                        <FontAwesomeIcon icon={faTag} className="me-1" />
                                        {voucherCode}
                                    </span>
                                    <span className="fw-bold text-danger">-{formatVnd(discountAmount)}</span>
                                </div>
                            </div>

                            <hr style={{ borderColor: "#e2e8f0", margin: "16px 0 20px" }} />

                            {/* Tổng thanh toán */}
                            <div className="d-flex justify-content-between align-items-baseline mb-4">
                                <span className="fw-bold text-dark" style={{ fontSize: "15px" }}>
                                    Tổng thanh toán:
                                </span>
                                <span
                                    className="fw-bold"
                                    style={{ fontSize: "24px", color: "#be123c", letterSpacing: "-0.5px" }}
                                >
                                    {formatVnd(grandTotal)}
                                </span>
                            </div>

                            {/* Action Buttons */}
                            <div className="d-flex flex-column gap-2">
                                <button
                                    type="button"
                                    className="btn-issue-order"
                                    onClick={handleIssueOrder}
                                    disabled={submitting}
                                >
                                    {submitting ? "Đang phát hành..." : "Phát hành đơn"}
                                </button>

                                <button
                                    type="button"
                                    className="btn-back-order"
                                    onClick={() => navigate(ROUTES.ADMIN_ORDER)}
                                >
                                    Quay lại
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal: Đổi người nhận / Chọn khách hàng từ hệ thống */}
            {showCustomerModal && (
                <div
                    className="modal fade show d-block"
                    tabIndex={-1}
                    style={{ backgroundColor: "rgba(15, 23, 42, 0.6)", zIndex: 1050 }}
                >
                    <div className="modal-dialog modal-dialog-centered modal-lg">
                        <div className="modal-content rounded-4 border-0 shadow-lg">
                            <div className="modal-header border-bottom px-4 py-3">
                                <div className="d-flex align-items-center gap-2">
                                    <FontAwesomeIcon icon={faUser} className="text-danger" />
                                    <h5 className="modal-title fw-bold text-dark fs-6 mb-0">
                                        Chọn khách hàng nhận đơn điều phối
                                    </h5>
                                </div>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowCustomerModal(false)}
                                />
                            </div>

                            <div className="modal-body p-4">
                                <p className="text-secondary small mb-3">
                                    Chọn khách hàng từ cơ sở dữ liệu để tự động nạp thông tin giao nhận và công thức liên kết:
                                </p>

                                <div className="list-group">
                                    {realCustomers.length > 0 ? (
                                        realCustomers.map((c) => (
                                            <button
                                                key={c.id}
                                                type="button"
                                                className="list-group-item list-group-item-action d-flex justify-content-between align-items-center py-3"
                                                onClick={() => handleSelectCustomer(c)}
                                            >
                                                <div className="d-flex align-items-center gap-3">
                                                    <div className="avatar-circle-red" style={{ width: "36px", height: "36px", fontSize: "12px" }}>
                                                        {c.initials || "KH"}
                                                    </div>
                                                    <div>
                                                        <div className="fw-bold text-dark mb-0">
                                                            {c.fullname || c.name}
                                                        </div>
                                                        <div className="text-secondary small">
                                                            {c.phone || "Chưa có SĐT"} • {c.email}
                                                        </div>
                                                    </div>
                                                </div>
                                                <span className="badge bg-light text-secondary border">
                                                    #{c.id}
                                                </span>
                                            </button>
                                        ))
                                    ) : (
                                        <div className="text-center py-3 text-muted">
                                            Đang tải dữ liệu khách hàng...
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="modal-footer border-top px-4 py-2">
                                <button
                                    type="button"
                                    className="btn btn-sm btn-secondary"
                                    onClick={() => setShowCustomerModal(false)}
                                >
                                    Đóng
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
