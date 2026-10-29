import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faUser,
    faLocationDot,
    faPhone,
    faEnvelope,
    faBoxOpen,
    faCreditCard,
    faReceipt,
    faClock,
    faIndustry,
    faFlask,
    faPrint,
    faTriangleExclamation,
    faTruckFast,
    faRightLeft,
    faClipboardCheck,
} from "@fortawesome/free-solid-svg-icons";
import type { AdminOrderDetail } from "../../../api/AdminOrderService";
import { OrderStatusBadge, ProductTypeBadge } from "../../../pages/AdminOrder";
import CustomBadge from "../badge/CustomBadge";
import { OrderStatus } from "../../../enums/OrderStatus";
import { ProductType } from "../../../enums/ProductType";
import type { FactoryItem } from "../../../api/FactoryService";

interface Props {
    order: AdminOrderDetail | null;
    loading: boolean;
    factories?: FactoryItem[];
    onClose: () => void;
    onOpenStatusUpdate?: (order: AdminOrderDetail) => void;
    onQuickDispatch?: (order: AdminOrderDetail) => void;
    onReassignFactory?: (orderId: number, factoryId: number, reason?: string) => Promise<void>;
}

const formatVnd = (val?: number) => (val || 0).toLocaleString("vi-VN") + "đ";

const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return "Chưa cập nhật";
    try {
        const d = new Date(dateStr);
        return d.toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    } catch {
        return dateStr;
    }
};

export default function AdminOrderDetailModal({
    order,
    loading,
    factories = [],
    onClose,
    onOpenStatusUpdate,
    onQuickDispatch,
    onReassignFactory,
}: Props) {
    const [activeTab, setActiveTab] = useState<"overview" | "shippingSlip" | "workshopTicket">("overview");
    const [showReassignModal, setShowReassignModal] = useState<boolean>(false);
    const [selectedNewFactoryId, setSelectedNewFactoryId] = useState<number | "">("");
    const [reassignReason, setReassignReason] = useState<string>("");
    const [submittingReassign, setSubmittingReassign] = useState<boolean>(false);

    if (!order && !loading) return null;

    // Calculate current step index in 4-step pipeline:
    // 1: Khách đặt hàng (User Checkout)
    // 2: Admin duyệt & Điều phối (Admin Dispatch)
    // 3: Xưởng chế tác & Đóng gói (Workshop Crafting)
    // 4: Giao hàng & Hoàn tất (Shipping & Delivered)
    const getStepState = () => {
        if (!order) return 1;
        switch (order.status) {
            case OrderStatus.PENDING_PAYMENT:
            case OrderStatus.PENDING:
                return 1;
            case OrderStatus.CONFIRMED:
                return 2;
            case OrderStatus.PROCESSING:
                return 3;
            case OrderStatus.SHIPPED:
            case OrderStatus.DELIVERING:
            case OrderStatus.DELIVERED:
                return 4;
            case OrderStatus.CANCELLED:
            case OrderStatus.RETURNED:
            case OrderStatus.REFUNDED:
                return -1;
            default:
                return 1;
        }
    };

    const currentStep = getStepState();
    const isCancelled = currentStep === -1;

    // Handle submit factory reassign
    const handleConfirmReassign = async () => {
        if (!order || !selectedNewFactoryId || !onReassignFactory) return;
        setSubmittingReassign(true);
        try {
            await onReassignFactory(order.id, Number(selectedNewFactoryId), reassignReason.trim());
            setShowReassignModal(false);
            setReassignReason("");
        } catch (err) {
            console.error("Lỗi khi điều phối lại xưởng:", err);
        } finally {
            setSubmittingReassign(false);
        }
    };

    // Primary factory for this order
    const primaryFactoryName =
        order?.items && order.items.length > 0 && order.items[0].factoryName
            ? order.items[0].factoryName
            : "Nordic Lab TP.HCM";
    const primaryFactoryPhone =
        order?.items && order.items.length > 0 && order.items[0].factoryPhone
            ? order.items[0].factoryPhone
            : "0988 123 456";
    const primaryFactoryAddress =
        order?.items && order.items.length > 0 && order.items[0].factoryAddress
            ? order.items[0].factoryAddress
            : "Khu Chế Xuất Tân Thuận, Quận 7, TP. Hồ Chí Minh";

    return (
        <div
            className="modal fade show d-block"
            tabIndex={-1}
            style={{ backgroundColor: "rgba(15, 23, 42, 0.65)", zIndex: 1050 }}
        >
            <div className="modal-dialog modal-dialog-centered modal-xl modal-dialog-scrollable">
                <div className="modal-content rounded-4 border-0 shadow-lg overflow-hidden">
                    {/* Header */}
                    <div className="modal-header bg-dark text-white px-4 py-3 border-0">
                        <div className="d-flex align-items-center gap-3">
                            <div
                                className="d-flex align-items-center justify-content-center bg-danger rounded-3"
                                style={{ width: "42px", height: "42px" }}
                            >
                                <FontAwesomeIcon icon={faReceipt} className="text-white fs-5" />
                            </div>
                            <div>
                                <div className="d-flex align-items-center gap-2">
                                    <h5 className="modal-title fw-bold text-white mb-0">
                                        Đơn hàng {order?.code || `#ORD-${order?.id}`}
                                    </h5>
                                    {order?.status && OrderStatusBadge[order.status] && (
                                        <CustomBadge
                                            label={OrderStatusBadge[order.status].label}
                                            badge={OrderStatusBadge[order.status].badge}
                                        />
                                    )}
                                </div>
                                <div className="d-flex align-items-center gap-3 small text-white-50 mt-1">
                                    <span>
                                        <FontAwesomeIcon icon={faClock} className="me-1" />
                                        Đặt lúc: {formatDateTime(order?.createdAt)}
                                    </span>
                                    <span>•</span>
                                    <span>
                                        <FontAwesomeIcon icon={faIndustry} className="me-1" />
                                        Xưởng gia công: <strong className="text-white">{primaryFactoryName}</strong>
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="d-flex align-items-center gap-2">
                            {order && order.status === OrderStatus.PENDING && onQuickDispatch && (
                                <button
                                    type="button"
                                    className="btn btn-sm btn-success rounded-3 fw-semibold px-3 shadow-sm"
                                    onClick={() => onQuickDispatch(order)}
                                >
                                    <FontAwesomeIcon icon={faClipboardCheck} className="me-1" />
                                    Duyệt &amp; Gửi xưởng ngay
                                </button>
                            )}
                            {order && onOpenStatusUpdate && (
                                <button
                                    type="button"
                                    className="btn btn-sm btn-outline-light rounded-3 px-3"
                                    onClick={() => onOpenStatusUpdate(order)}
                                >
                                    Chuyển trạng thái
                                </button>
                            )}
                            <button
                                type="button"
                                className="btn-close btn-close-white ms-2"
                                onClick={onClose}
                                aria-label="Close"
                            />
                        </div>
                    </div>

                    {/* Sub-header Navigation Tabs */}
                    <div className="bg-white border-bottom px-4 py-2 d-flex align-items-center justify-content-between">
                        <div className="nav nav-pills gap-2">
                            <button
                                className={`nav-link btn-sm py-1 px-3 rounded-pill fw-semibold ${
                                    activeTab === "overview" ? "active bg-danger text-white" : "text-secondary"
                                }`}
                                onClick={() => setActiveTab("overview")}
                            >
                                <FontAwesomeIcon icon={faBoxOpen} className="me-2" />
                                Tổng quan &amp; Tiến trình
                            </button>
                            <button
                                className={`nav-link btn-sm py-1 px-3 rounded-pill fw-semibold ${
                                    activeTab === "shippingSlip" ? "active bg-danger text-white" : "text-secondary"
                                }`}
                                onClick={() => setActiveTab("shippingSlip")}
                            >
                                <FontAwesomeIcon icon={faTruckFast} className="me-2" />
                                Phiếu Vận đơn Giao hàng
                            </button>
                            <button
                                className={`nav-link btn-sm py-1 px-3 rounded-pill fw-semibold ${
                                    activeTab === "workshopTicket" ? "active bg-danger text-white" : "text-secondary"
                                }`}
                                onClick={() => setActiveTab("workshopTicket")}
                            >
                                <FontAwesomeIcon icon={faFlask} className="me-2" />
                                Lệnh Sản xuất Xưởng (Work Order)
                            </button>
                        </div>

                        <div className="d-flex align-items-center gap-2">
                            <button
                                type="button"
                                className="btn btn-sm btn-outline-dark rounded-3 px-3"
                                onClick={() => window.print()}
                            >
                                <FontAwesomeIcon icon={faPrint} className="me-1" />
                                In phiếu
                            </button>
                        </div>
                    </div>

                    {/* Modal Body */}
                    <div className="modal-body p-4 bg-light">
                        {loading || !order ? (
                            <div className="text-center py-5">
                                <div className="spinner-border text-danger mb-2" role="status" />
                                <div className="text-secondary small">Đang nạp chi tiết đơn hàng...</div>
                            </div>
                        ) : activeTab === "overview" ? (
                            <>
                                {/* 1. PIPELINE STEPPER: Luồng liên kết User -> Admin -> Xưởng -> Khách */}
                                <div className="card border-0 shadow-sm rounded-4 mb-3">
                                    <div className="card-body p-3 p-md-4">
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <span className="fw-bold text-dark small text-uppercase letter-spacing">
                                                Tiến trình vận hành liên kết 3 bên (Khách hàng - Admin - Xưởng gia công)
                                            </span>
                                            {isCancelled ? (
                                                <span className="badge bg-danger text-white">Đơn hàng đã hủy</span>
                                            ) : (
                                                <span className="badge bg-success-subtle text-success-emphasis">
                                                    Đang ở chặng {currentStep} / 4
                                                </span>
                                            )}
                                        </div>

                                        <div className="position-relative">
                                            <div className="row g-2 text-center">
                                                {/* Chặng 1 */}
                                                <div className="col-3">
                                                    <div
                                                        className={`p-2 rounded-3 border ${
                                                            currentStep >= 1 && !isCancelled
                                                                ? "bg-primary-subtle border-primary text-primary"
                                                                : "bg-light text-secondary"
                                                        }`}
                                                    >
                                                        <div className="fw-bold mb-1" style={{ fontSize: "13px" }}>
                                                            1. Khách đặt hàng
                                                        </div>
                                                        <div className="small text-muted" style={{ fontSize: "11px" }}>
                                                            {order.paymentMethod === "VNPAY"
                                                                ? "Thanh toán VNPay"
                                                                : "Thanh toán COD"}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Chặng 2 */}
                                                <div className="col-3">
                                                    <div
                                                        className={`p-2 rounded-3 border ${
                                                            currentStep >= 2 && !isCancelled
                                                                ? "bg-warning-subtle border-warning text-warning-emphasis"
                                                                : "bg-light text-secondary"
                                                        }`}
                                                    >
                                                        <div className="fw-bold mb-1" style={{ fontSize: "13px" }}>
                                                            2. Admin điều phối
                                                        </div>
                                                        <div className="small text-muted" style={{ fontSize: "11px" }}>
                                                            {currentStep >= 2
                                                                ? "Đã giao lệnh xưởng"
                                                                : "Chờ Admin duyệt"}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Chặng 3 */}
                                                <div className="col-3">
                                                    <div
                                                        className={`p-2 rounded-3 border ${
                                                            currentStep >= 3 && !isCancelled
                                                                ? "bg-info-subtle border-info text-info-emphasis"
                                                                : "bg-light text-secondary"
                                                        }`}
                                                    >
                                                        <div className="fw-bold mb-1" style={{ fontSize: "13px" }}>
                                                            3. Xưởng chế tác
                                                        </div>
                                                        <div className="small text-muted" style={{ fontSize: "11px" }}>
                                                            Pha chế &amp; Đóng gói
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Chặng 4 */}
                                                <div className="col-3">
                                                    <div
                                                        className={`p-2 rounded-3 border ${
                                                            currentStep >= 4 && !isCancelled
                                                                ? "bg-success-subtle border-success text-success-emphasis"
                                                                : "bg-light text-secondary"
                                                        }`}
                                                    >
                                                        <div className="fw-bold mb-1" style={{ fontSize: "13px" }}>
                                                            4. Vận chuyển &amp; Giao
                                                        </div>
                                                        <div className="small text-muted" style={{ fontSize: "11px" }}>
                                                            {order.status === OrderStatus.DELIVERED
                                                                ? "Đã giao thành công"
                                                                : "Bàn giao bưu cục GHN"}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Quick Alert if Pending */}
                                {order.status === OrderStatus.PENDING && (
                                    <div className="alert alert-warning border-warning shadow-sm rounded-4 d-flex align-items-center justify-content-between p-3 mb-3">
                                        <div className="d-flex align-items-center gap-3">
                                            <div className="bg-warning text-dark p-2 rounded-circle fs-5">
                                                <FontAwesomeIcon icon={faTriangleExclamation} />
                                            </div>
                                            <div>
                                                <div className="fw-bold text-dark">
                                                    Đơn hàng đang chờ Admin tiếp nhận &amp; phát lệnh xưởng
                                                </div>
                                                <div className="small text-secondary">
                                                    Khách hàng đã đặt đơn thành công. Bạn hãy kiểm tra nguyên liệu xưởng và bấm duyệt để xưởng chế tác bắt đầu sản xuất.
                                                </div>
                                            </div>
                                        </div>
                                        {onQuickDispatch && (
                                            <button
                                                type="button"
                                                className="btn btn-danger btn-sm px-3 py-2 fw-semibold rounded-3 shadow-sm"
                                                onClick={() => onQuickDispatch(order)}
                                            >
                                                <FontAwesomeIcon icon={faClipboardCheck} className="me-2" />
                                                Duyệt &amp; Phát lệnh xưởng
                                            </button>
                                        )}
                                    </div>
                                )}

                                <div className="row g-3">
                                    {/* CỘT TRÁI: Người nhận, Xưởng gia công, Thanh toán */}
                                    <div className="col-12 col-lg-4">
                                        {/* Card: Xưởng phụ trách gia công & Điều phối */}
                                        <div className="card border-0 shadow-sm rounded-4 mb-3 border-start border-4 border-danger">
                                            <div className="card-body p-3">
                                                <div className="d-flex align-items-center justify-content-between mb-2">
                                                    <div className="d-flex align-items-center gap-2 text-danger fw-bold small text-uppercase">
                                                        <FontAwesomeIcon icon={faIndustry} />
                                                        XƯỞNG CHẾ TÁC PHỤ TRÁCH
                                                    </div>
                                                    {onReassignFactory && (
                                                        <button
                                                            type="button"
                                                            className="btn btn-outline-danger btn-sm py-0 px-2 rounded-pill"
                                                            style={{ fontSize: "11px" }}
                                                            onClick={() => setShowReassignModal(true)}
                                                        >
                                                            <FontAwesomeIcon icon={faRightLeft} className="me-1" />
                                                            Đổi xưởng
                                                        </button>
                                                    )}
                                                </div>

                                                <div className="fw-bold text-dark fs-6 mb-1">
                                                    {primaryFactoryName}
                                                </div>
                                                <div className="small text-secondary mb-2">
                                                    <FontAwesomeIcon icon={faPhone} className="me-2 text-danger" />
                                                    Hotline xưởng: {primaryFactoryPhone}
                                                </div>
                                                <div className="small text-dark p-2 bg-light rounded-3 border">
                                                    <FontAwesomeIcon icon={faLocationDot} className="me-1 text-danger" />
                                                    {primaryFactoryAddress}
                                                </div>
                                                <div className="mt-2 text-muted" style={{ fontSize: "11.5px" }}>
                                                    * Lệnh sản xuất sẽ được gửi trực tiếp đến xưởng này khi đơn chuyển trạng thái sang <strong>Đã xác nhận / Đang gia công</strong>.
                                                </div>
                                            </div>
                                        </div>

                                        {/* Card: Thông tin người nhận */}
                                        <div className="card border-0 shadow-sm rounded-4 mb-3">
                                            <div className="card-body p-3">
                                                <div className="d-flex align-items-center gap-2 mb-3 text-danger fw-bold small text-uppercase">
                                                    <FontAwesomeIcon icon={faLocationDot} />
                                                    ĐỊA CHỈ NHẬN HÀNG
                                                </div>
                                                <div className="fw-bold text-dark fs-6 mb-1">
                                                    {order.recipient?.name || order.user?.name || "Chưa có tên người nhận"}
                                                </div>
                                                <div className="small text-secondary mb-2">
                                                    <FontAwesomeIcon icon={faPhone} className="me-2 text-danger" />
                                                    {order.recipient?.phone || order.user?.phone || "Chưa có số điện thoại"}
                                                </div>
                                                <div className="small text-dark p-2 bg-light rounded-3 border">
                                                    {order.recipient?.address || "Chưa cập nhật địa chỉ giao hàng"}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Card: Tài khoản đặt mua */}
                                        <div className="card border-0 shadow-sm rounded-4 mb-3">
                                            <div className="card-body p-3">
                                                <div className="d-flex align-items-center gap-2 mb-3 text-primary fw-bold small text-uppercase">
                                                    <FontAwesomeIcon icon={faUser} />
                                                    TÀI KHOẢN ĐẶT HÀNG
                                                </div>
                                                <div className="fw-bold text-dark mb-1">
                                                    #{order.user?.id} - {order.user?.name}
                                                </div>
                                                <div className="small text-muted mb-1">
                                                    <FontAwesomeIcon icon={faEnvelope} className="me-2 text-muted" />
                                                    {order.user?.email || "Chưa có email"}
                                                </div>
                                                <div className="small text-muted">
                                                    <FontAwesomeIcon icon={faPhone} className="me-2 text-muted" />
                                                    {order.user?.phone || "Chưa có SĐT"}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Card: Thanh toán & Vận chuyển */}
                                        <div className="card border-0 shadow-sm rounded-4">
                                            <div className="card-body p-3">
                                                <div className="d-flex align-items-center gap-2 mb-3 text-success fw-bold small text-uppercase">
                                                    <FontAwesomeIcon icon={faCreditCard} />
                                                    THANH TOÁN &amp; VẬN CHUYỂN
                                                </div>
                                                <div className="d-flex justify-content-between small mb-2">
                                                    <span className="text-secondary">Phương thức:</span>
                                                    <span className="badge bg-light text-dark border fw-bold">
                                                        {order.paymentMethod || "COD"}
                                                    </span>
                                                </div>
                                                <div className="d-flex justify-content-between small mb-2">
                                                    <span className="text-secondary">Trạng thái TT:</span>
                                                    <span
                                                        className={`badge ${
                                                            order.paymentStatus === "PAID"
                                                                ? "bg-success-subtle text-success-emphasis"
                                                                : "bg-warning-subtle text-warning-emphasis"
                                                        }`}
                                                    >
                                                        {order.paymentStatus === "PAID" ? "Đã thanh toán" : "Chưa thanh toán (Thu COD)"}
                                                    </span>
                                                </div>
                                                {order.deliveredAt && (
                                                    <div className="d-flex justify-content-between small mb-2">
                                                        <span className="text-secondary">Ngày giao:</span>
                                                        <span className="fw-semibold">{formatDateTime(order.deliveredAt)}</span>
                                                    </div>
                                                )}
                                                {order.note && (
                                                    <div className="mt-2 p-2 bg-warning-subtle rounded-3 small text-dark border border-warning">
                                                        <strong>Ghi chú đơn:</strong> {order.note}
                                                    </div>
                                                )}
                                                {order.cancelReason && (
                                                    <div className="mt-2 p-2 bg-danger-subtle rounded-3 small text-danger border border-danger">
                                                        <FontAwesomeIcon icon={faTriangleExclamation} className="me-1" />
                                                        <strong>Lý do hủy:</strong> {order.cancelReason}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* CỘT PHẢI: Danh sách sản phẩm & Thông số chế tác xưởng */}
                                    <div className="col-12 col-lg-8">
                                        <div className="card border-0 shadow-sm rounded-4 mb-3">
                                            <div className="card-header bg-white border-bottom py-3 px-4 d-flex justify-content-between align-items-center">
                                                <div className="d-flex align-items-center gap-2 fw-bold text-dark">
                                                    <FontAwesomeIcon icon={faBoxOpen} className="text-danger" />
                                                    <span>Sản phẩm &amp; Chi tiết chế tác ({order.items?.length || 0})</span>
                                                </div>
                                                {order.vouchers && order.vouchers.length > 0 && (
                                                    <span className="badge bg-danger-subtle text-danger-emphasis">
                                                        Voucher: {order.vouchers.join(", ")}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="card-body p-0">
                                                <div className="table-responsive">
                                                    <table className="table table-hover align-middle mb-0">
                                                        <thead className="table-light small text-secondary">
                                                            <tr>
                                                                <th className="ps-4">Sản phẩm / Mùi hương</th>
                                                                <th className="text-center">Xưởng chế tác</th>
                                                                <th className="text-end">Đơn giá</th>
                                                                <th className="text-center">Số lượng</th>
                                                                <th className="text-end pe-4">Thành tiền</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {order.items && order.items.length > 0 ? (
                                                                order.items.map((it) => (
                                                                    <tr key={it.id}>
                                                                        <td className="ps-4">
                                                                            <div className="d-flex align-items-center gap-3">
                                                                                {it.productImage ? (
                                                                                    <img
                                                                                        src={it.productImage}
                                                                                        alt={it.productName}
                                                                                        className="rounded-3 border object-fit-cover"
                                                                                        style={{ width: "48px", height: "48px" }}
                                                                                    />
                                                                                ) : (
                                                                                    <div
                                                                                        className="rounded-3 bg-light border d-flex align-items-center justify-content-center text-secondary"
                                                                                        style={{ width: "48px", height: "48px" }}
                                                                                    >
                                                                                        <FontAwesomeIcon icon={faFlask} />
                                                                                    </div>
                                                                                )}
                                                                                <div>
                                                                                    <div className="fw-bold text-dark mb-0">
                                                                                        {it.productName}
                                                                                    </div>
                                                                                    <div className="small text-secondary d-flex align-items-center gap-2 mt-1">
                                                                                        <span className="badge bg-light text-dark border">
                                                                                            {it.volumeMl || 10}ml
                                                                                        </span>
                                                                                        {it.productType === ProductType.CUSTOM && ProductTypeBadge[it.productType] ? (
                                                                                            <CustomBadge
                                                                                                label={ProductTypeBadge[it.productType].label}
                                                                                                badge={ProductTypeBadge[it.productType].badge}
                                                                                            />
                                                                                        ) : (
                                                                                            <span className="badge bg-secondary-subtle text-secondary-emphasis">
                                                                                                Tiêu chuẩn
                                                                                            </span>
                                                                                        )}
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </td>
                                                                        <td className="text-center">
                                                                            <span className="badge bg-light text-dark border">
                                                                                <FontAwesomeIcon icon={faIndustry} className="me-1 text-danger" />
                                                                                {it.factoryName || primaryFactoryName}
                                                                            </span>
                                                                        </td>
                                                                        <td className="text-end fw-semibold">
                                                                            {formatVnd(it.unitPrice)}
                                                                        </td>
                                                                        <td className="text-center fw-bold">
                                                                            x{it.quantity}
                                                                        </td>
                                                                        <td className="text-end pe-4 fw-bold text-dark">
                                                                            {formatVnd(it.totalPrice || it.unitPrice * it.quantity)}
                                                                        </td>
                                                                    </tr>
                                                                ))
                                                            ) : (
                                                                <tr>
                                                                    <td colSpan={5} className="text-center py-4 text-muted">
                                                                        Không có chi tiết sản phẩm.
                                                                    </td>
                                                                </tr>
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>

                                                {/* Thông số kỹ thuật chế tác cho Xưởng (Workshop Manufacturing Spec) */}
                                                <div className="p-3 bg-light-subtle border-top border-bottom">
                                                    <div className="fw-bold text-dark small text-uppercase mb-2 d-flex align-items-center gap-2">
                                                        <FontAwesomeIcon icon={faFlask} className="text-danger" />
                                                        Ghi chú kỹ thuật chế tác &amp; Yêu cầu xưởng
                                                    </div>
                                                    <div className="bg-white p-3 rounded-3 border small">
                                                        <div className="row g-2">
                                                            <div className="col-12 col-md-6">
                                                                <div className="text-muted">Quy cách đóng gói:</div>
                                                                <div className="fw-semibold text-dark">
                                                                    Chai thủy tinh thủ công, bọc xốp bóng khí 3 lớp chống sốc.
                                                                </div>
                                                            </div>
                                                            <div className="col-12 col-md-6">
                                                                <div className="text-muted">Dán nhãn niêm phong:</div>
                                                                <div className="fw-semibold text-dark">
                                                                    Tem vỡ chống giả thương hiệu Oilia Atelier.
                                                                </div>
                                                            </div>
                                                            <div className="col-12">
                                                                <div className="text-muted">Lưu ý giao nhận:</div>
                                                                <div className="fw-semibold text-danger">
                                                                    {order.note || "Hàng nước hoa tinh dầu dễ vỡ, yêu cầu shipper không đè nén kiện hàng."}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Bảng tính chi phí đơn hàng */}
                                                <div className="p-4 bg-light">
                                                    <div className="row justify-content-end">
                                                        <div className="col-12 col-md-6">
                                                            <div className="d-flex justify-content-between small mb-2">
                                                                <span className="text-secondary">Tạm tính sản phẩm:</span>
                                                                <span className="fw-semibold">{formatVnd(order.subtotalPrice)}</span>
                                                            </div>
                                                            <div className="d-flex justify-content-between small mb-2">
                                                                <span className="text-secondary">Phí vận chuyển (GHN):</span>
                                                                <span className="fw-semibold">{formatVnd(order.shippingFee)}</span>
                                                            </div>
                                                            <div className="d-flex justify-content-between small mb-2">
                                                                <span className="text-secondary">Chiết khấu Voucher:</span>
                                                                <span className="fw-semibold text-danger">
                                                                    -{formatVnd(order.discountAmount)}
                                                                </span>
                                                            </div>
                                                            <hr style={{ borderColor: "#cbd5e1" }} />
                                                            <div className="d-flex justify-content-between align-items-center">
                                                                <span className="fw-bold text-dark fs-6">Tổng thu người nhận:</span>
                                                                <span className="fw-bold text-danger fs-4">
                                                                    {formatVnd(order.totalPrice)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : activeTab === "shippingSlip" ? (
                            /* 2. TAB: PHIẾU VẬN ĐƠN GIAO HÀNG (PRINTABLE SLIP) */
                            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white" id="printable-shipping-slip">
                                <div className="border-bottom pb-3 mb-3 d-flex justify-content-between align-items-center">
                                    <div>
                                        <h4 className="fw-bold text-dark mb-0">OILIA ATELIER</h4>
                                        <div className="small text-secondary">Nền tảng thương mại nước hoa &amp; Phối hương độc bản</div>
                                    </div>
                                    <div className="text-end">
                                        <div className="fw-bold text-danger fs-5">PHIẾU GIAO HÀNG &amp; VẬN ĐƠN</div>
                                        <div className="small text-muted">Mã đơn: <strong>{order.code || `#ORD-${order.id}`}</strong></div>
                                    </div>
                                </div>

                                <div className="row g-3 mb-4">
                                    <div className="col-6">
                                        <div className="p-3 border rounded-3 bg-light">
                                            <div className="fw-bold text-dark small text-uppercase mb-1">ĐƠN VỊ GỬI HÀNG:</div>
                                            <div className="fw-semibold text-dark">{primaryFactoryName}</div>
                                            <div className="small text-secondary">{primaryFactoryAddress}</div>
                                            <div className="small text-secondary">Hotline: {primaryFactoryPhone}</div>
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="p-3 border rounded-3 bg-light">
                                            <div className="fw-bold text-danger small text-uppercase mb-1">NGƯỜI NHẬN HÀNG:</div>
                                            <div className="fw-bold text-dark fs-6">{order.recipient?.name || order.user?.name}</div>
                                            <div className="fw-semibold text-dark">{order.recipient?.phone || order.user?.phone}</div>
                                            <div className="small text-secondary">{order.recipient?.address}</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="table-responsive mb-3">
                                    <table className="table table-bordered align-middle small mb-0">
                                        <thead className="table-light">
                                            <tr>
                                                <th style={{ width: "40px" }}>STT</th>
                                                <th>Tên mặt hàng / Mùi hương</th>
                                                <th className="text-center">Dung tích</th>
                                                <th className="text-center">Số lượng</th>
                                                <th className="text-end">Thành tiền</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {order.items?.map((it, idx) => (
                                                <tr key={it.id}>
                                                    <td className="text-center">{idx + 1}</td>
                                                    <td className="fw-semibold text-dark">{it.productName}</td>
                                                    <td className="text-center">{it.volumeMl || 10}ml</td>
                                                    <td className="text-center fw-bold">x{it.quantity}</td>
                                                    <td className="text-end fw-bold">{formatVnd(it.totalPrice || it.unitPrice * it.quantity)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="row g-3 align-items-center mb-4">
                                    <div className="col-7">
                                        <div className="p-3 border rounded-3 bg-light-subtle">
                                            <div className="fw-bold small text-dark mb-1">Ghi chú giao nhận:</div>
                                            <div className="small text-danger fw-semibold">
                                                {order.note || "Cho khách xem hàng trước khi nhận. Hàng tinh dầu thủy tinh chống sốc cẩn thận."}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-5">
                                        <div className="p-3 border rounded-3 bg-danger-subtle text-danger border-danger">
                                            <div className="small fw-semibold">TIỀN THU HỘ (COD):</div>
                                            <div className="fs-4 fw-bold">
                                                {order.paymentStatus === "PAID" ? "0đ (ĐÃ THANH TOÁN VNPAY)" : formatVnd(order.totalPrice)}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="row text-center mt-3 pt-3 border-top">
                                    <div className="col-4">
                                        <div className="small fw-bold">Người gửi hàng</div>
                                        <div className="text-muted" style={{ height: "60px" }} />
                                        <div className="small text-secondary">(Ký, ghi rõ họ tên)</div>
                                    </div>
                                    <div className="col-4">
                                        <div className="small fw-bold">Đơn vị vận chuyển (GHN)</div>
                                        <div className="text-muted" style={{ height: "60px" }} />
                                        <div className="small text-secondary">(Ký nhận kiện hàng)</div>
                                    </div>
                                    <div className="col-4">
                                        <div className="small fw-bold">Người nhận hàng</div>
                                        <div className="text-muted" style={{ height: "60px" }} />
                                        <div className="small text-secondary">(Ký và xác nhận nguyên vẹn)</div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            /* 3. TAB: LỆNH SẢN XUẤT XƯỞNG (WORKSHOP WORK ORDER) */
                            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white" id="printable-workshop-ticket">
                                <div className="border-bottom pb-3 mb-3 d-flex justify-content-between align-items-center">
                                    <div>
                                        <h4 className="fw-bold text-dark mb-0">OILIA LAB &amp; ATELIER</h4>
                                        <div className="small text-secondary">LỆNH SẢN XUẤT &amp; ĐIỀU PHỐI GIA CÔNG</div>
                                    </div>
                                    <div className="text-end">
                                        <div className="badge bg-dark fs-6 px-3 py-2">MÃ LỆNH: #DISP-{order.id}</div>
                                        <div className="small text-muted mt-1">Ngày phát lệnh: {formatDateTime(order.createdAt)}</div>
                                    </div>
                                </div>

                                <div className="p-3 rounded-3 bg-light border mb-4">
                                    <div className="row g-2">
                                        <div className="col-6">
                                            <div className="small text-muted">Xưởng chế tác tiếp nhận:</div>
                                            <div className="fw-bold text-danger fs-6">{primaryFactoryName}</div>
                                            <div className="small text-secondary">{primaryFactoryAddress}</div>
                                        </div>
                                        <div className="col-6">
                                            <div className="small text-muted">Hạn hoàn tất đóng gói:</div>
                                            <div className="fw-bold text-dark fs-6">Trong vòng 24h kể từ khi nhận lệnh</div>
                                            <div className="small text-success fw-semibold">
                                                Ưu tiên điều phối: Đơn phối hương khách đặt riêng
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <h6 className="fw-bold text-dark mb-2">CHI TIẾT MÙI HƯƠNG &amp; THÔNG SỐ SẢN XUẤT</h6>
                                <div className="table-responsive mb-4">
                                    <table className="table table-bordered align-middle small mb-0">
                                        <thead className="table-light">
                                            <tr>
                                                <th style={{ width: "40px" }}>STT</th>
                                                <th>Tên sản phẩm / Mùi hương độc bản</th>
                                                <th className="text-center">Loại đơn</th>
                                                <th className="text-center">Dung tích</th>
                                                <th className="text-center">Số lượng</th>
                                                <th>Yêu cầu phối chế &amp; Đóng chai</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {order.items?.map((it, idx) => (
                                                <tr key={it.id}>
                                                    <td className="text-center">{idx + 1}</td>
                                                    <td className="fw-bold text-dark">{it.productName}</td>
                                                    <td className="text-center">
                                                        {it.productType === ProductType.CUSTOM ? (
                                                            <span className="badge bg-purple-subtle text-purple-emphasis">Phối hương độc bản</span>
                                                        ) : (
                                                            <span className="badge bg-light text-dark border">Chuẩn</span>
                                                        )}
                                                    </td>
                                                    <td className="text-center fw-bold">{it.volumeMl || 10}ml</td>
                                                    <td className="text-center fw-bold">x{it.quantity}</td>
                                                    <td className="small text-secondary">
                                                        Pha chế theo công thức chuẩn phòng Lab Oilia, dán nhãn độc bản tem vỡ niêm phong.
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="p-3 border rounded-3 bg-light-subtle mb-4">
                                    <div className="fw-bold small text-dark mb-1">Ghi chú kỹ thuật từ Admin &amp; Khách hàng:</div>
                                    <div className="small text-dark">
                                        {order.note || "Yêu cầu kiểm tra kỹ độ kín nắp chai tinh dầu trước khi đóng seal niêm phong. Bọc xốp bóng khí 3 lớp."}
                                    </div>
                                </div>

                                <div className="row text-center mt-3 pt-3 border-top">
                                    <div className="col-4">
                                        <div className="small fw-bold">Admin điều phối</div>
                                        <div className="text-muted" style={{ height: "60px" }} />
                                        <div className="small text-secondary">(Ký duyệt lệnh)</div>
                                    </div>
                                    <div className="col-4">
                                        <div className="small fw-bold">Chuyên viên pha chế (Perfumer)</div>
                                        <div className="text-muted" style={{ height: "60px" }} />
                                        <div className="small text-secondary">(Xác nhận công thức)</div>
                                    </div>
                                    <div className="col-4">
                                        <div className="small fw-bold">Trưởng xưởng QC đóng gói</div>
                                        <div className="text-muted" style={{ height: "60px" }} />
                                        <div className="small text-secondary">(Kiểm tra niêm phong &amp; Bàn giao)</div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="modal-footer bg-white border-top px-4 py-3 d-flex justify-content-between align-items-center">
                        <div className="small text-muted">
                            Trạng thái hiện tại: <strong>{OrderStatusBadge[order?.status || OrderStatus.PENDING]?.label}</strong>
                        </div>

                        <div className="d-flex align-items-center gap-2">
                            <button
                                type="button"
                                className="btn btn-secondary btn-sm px-4 fw-semibold rounded-3"
                                onClick={onClose}
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* MODAL CON: ĐIỀU PHỐI ĐỔI XƯỞNG GIA CÔNG */}
            {showReassignModal && (
                <div
                    className="modal fade show d-block"
                    tabIndex={-1}
                    style={{ backgroundColor: "rgba(0, 0, 0, 0.7)", zIndex: 1100 }}
                >
                    <div className="modal-dialog modal-dialog-centered modal-md">
                        <div className="modal-content rounded-4 border-0 shadow-lg">
                            <div className="modal-header bg-light border-bottom px-4 py-3">
                                <h6 className="modal-title fw-bold text-dark mb-0">
                                    <FontAwesomeIcon icon={faRightLeft} className="text-danger me-2" />
                                    Điều phối chuyển xưởng chế tác
                                </h6>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowReassignModal(false)}
                                />
                            </div>
                            <div className="modal-body p-4">
                                <div className="small text-secondary mb-3">
                                    Bạn đang điều phối lại đơn hàng <strong>{order?.code || `#ORD-${order?.id}`}</strong> sang xưởng chế tác khác trong hệ thống.
                                </div>

                                <div className="mb-3">
                                    <label className="form-label small fw-bold text-dark">
                                        Chọn xưởng gia công mới:
                                    </label>
                                    <select
                                        className="form-select form-select-sm rounded-3"
                                        value={selectedNewFactoryId}
                                        onChange={(e) => setSelectedNewFactoryId(e.target.value ? Number(e.target.value) : "")}
                                    >
                                        <option value="">-- Chọn xưởng gia công --</option>
                                        {factories.map((f) => (
                                            <option key={f.id} value={f.id}>
                                                {f.name} ({f.address})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label small fw-bold text-dark">
                                        Lý do chuyển xưởng / Ghi chú điều phối:
                                    </label>
                                    <textarea
                                        className="form-control form-control-sm rounded-3"
                                        rows={2}
                                        placeholder="Ví dụ: Xưởng cũ quá tải, khách yêu cầu xưởng gần hơn..."
                                        value={reassignReason}
                                        onChange={(e) => setReassignReason(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="modal-footer bg-light border-top px-4 py-2 d-flex justify-content-end gap-2">
                                <button
                                    type="button"
                                    className="btn btn-sm btn-secondary rounded-3"
                                    onClick={() => setShowReassignModal(false)}
                                    disabled={submittingReassign}
                                >
                                    Hủy
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-sm btn-danger rounded-3 fw-semibold px-3"
                                    disabled={!selectedNewFactoryId || submittingReassign}
                                    onClick={handleConfirmReassign}
                                >
                                    {submittingReassign ? "Đang lưu..." : "Xác nhận chuyển xưởng"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
