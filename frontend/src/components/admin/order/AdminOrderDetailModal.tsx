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
    faFlask,
    faPrint,
    faTriangleExclamation,
    faTruckFast,
    faTag,
    faCircleCheck,
} from "@fortawesome/free-solid-svg-icons";
import type { AdminOrderDetail } from "../../../api/AdminOrderService";
import { getPaymentStatusLabel } from "../../../api/OrderService";
import { OrderStatusBadge, ProductTypeBadge } from "../../../pages/AdminOrder";
import CustomBadge from "../badge/CustomBadge";
import { OrderStatus } from "../../../enums/OrderStatus";
import { ProductType } from "../../../enums/ProductType";

interface Props {
    order: AdminOrderDetail | null;
    loading: boolean;
    onClose: () => void;
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

export default function AdminOrderDetailModal({ order, loading, onClose }: Props) {
    const [activeTab, setActiveTab] = useState<"overview" | "shippingSlip">("overview");

    if (!order && !loading) return null;

    // Tiến trình 4 chặng đơn hàng chuẩn thương mại điện tử:
    // 1: Khách đặt hàng (User checkout)
    // 2: Đã xác nhận (Confirmed)
    // 3: Đang đóng gói & Giao hàng (Processing & Shipping)
    // 4: Đã giao thành công (Delivered)
    const getStepState = () => {
        if (!order) return 1;
        switch (order.status) {
            case OrderStatus.PENDING_PAYMENT:
            case OrderStatus.PENDING:
                return 1;
            case OrderStatus.CONFIRMED:
                return 2;
            case OrderStatus.PROCESSING:
            case OrderStatus.SHIPPED:
            case OrderStatus.DELIVERING:
                return 3;
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
                                        Chi tiết đơn hàng {order?.code || `#ORD-${order?.id}`}
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
                                </div>
                            </div>
                        </div>

                        <div className="d-flex align-items-center gap-2">
                            <button
                                type="button"
                                className="btn-close btn-close-white"
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
                                Tổng quan &amp; Chi tiết đơn
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
                                {/* 1. PIPELINE STEPPER: Tiến trình đơn hàng */}
                                <div className="card border-0 shadow-sm rounded-4 mb-3">
                                    <div className="card-body p-3 p-md-4">
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <span className="fw-bold text-dark small text-uppercase letter-spacing">
                                                Tiến trình xử lý đơn hàng
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
                                                            1. Đặt hàng
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
                                                            2. Đã xác nhận
                                                        </div>
                                                        <div className="small text-muted" style={{ fontSize: "11px" }}>
                                                            {currentStep >= 2 ? "Đã duyệt đơn" : "Chờ xác nhận"}
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
                                                            3. Đang giao hàng
                                                        </div>
                                                        <div className="small text-muted" style={{ fontSize: "11px" }}>
                                                            Đóng gói &amp; Vận chuyển
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
                                                            4. Hoàn tất
                                                        </div>
                                                        <div className="small text-muted" style={{ fontSize: "11px" }}>
                                                            {order.status === OrderStatus.DELIVERED
                                                                ? "Đã giao thành công"
                                                                : "Chờ giao đến khách"}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="row g-3">
                                    {/* CỘT TRÁI: Người nhận, Khách hàng, Thanh toán */}
                                    <div className="col-12 col-lg-4">
                                        {/* Card: Thông tin người nhận */}
                                        <div className="card border-0 shadow-sm rounded-4 mb-3 border-start border-4 border-danger">
                                            <div className="card-body p-3">
                                                <div className="d-flex align-items-center gap-2 mb-2 text-danger fw-bold small text-uppercase">
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
                                                        {getPaymentStatusLabel(order)}
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

                                    {/* CỘT PHẢI: Danh sách sản phẩm & Tổng hóa đơn */}
                                    <div className="col-12 col-lg-8">
                                        {/* Danh sách sản phẩm */}
                                        <div className="card border-0 shadow-sm rounded-4 mb-3">
                                            <div className="card-header bg-white border-bottom py-3 px-4 d-flex justify-content-between align-items-center">
                                                <div className="d-flex align-items-center gap-2 fw-bold text-dark">
                                                    <FontAwesomeIcon icon={faBoxOpen} className="text-danger" />
                                                    <span>Sản phẩm trong đơn hàng ({order.items?.length || 0})</span>
                                                </div>
                                                {order.vouchers && order.vouchers.length > 0 && (
                                                    <span className="badge bg-danger-subtle text-danger-emphasis">
                                                        <FontAwesomeIcon icon={faTag} className="me-1" />
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
                                                                <th className="text-center">Loại đơn</th>
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
                                                                                    <div className="fw-semibold text-dark">
                                                                                        {it.productName}
                                                                                    </div>
                                                                                    <div className="small text-muted">
                                                                                        Dung tích: {it.volumeMl || 10}ml
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </td>
                                                                        <td className="text-center">
                                                                            {ProductTypeBadge[it.productType] ? (
                                                                                <CustomBadge
                                                                                    label={ProductTypeBadge[it.productType].label}
                                                                                    badge={ProductTypeBadge[it.productType].badge}
                                                                                />
                                                                            ) : (
                                                                                <span className="badge bg-light text-dark border">
                                                                                    {it.productType}
                                                                                </span>
                                                                            )}
                                                                        </td>
                                                                        <td className="text-end fw-semibold text-secondary">
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
                                                                        Chưa có thông tin sản phẩm
                                                                    </td>
                                                                </tr>
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Card: Tổng hợp hóa đơn thanh toán */}
                                        <div className="card border-0 shadow-sm rounded-4">
                                            <div className="card-body p-3 p-md-4">
                                                <h6 className="fw-bold text-dark mb-3">TỔNG KẾT THANH TOÁN</h6>
                                                <div className="d-flex justify-content-between small mb-2">
                                                    <span className="text-secondary">Tạm tính tiền hàng:</span>
                                                    <span className="fw-semibold text-dark">
                                                        {formatVnd(order.subtotalPrice || order.totalPrice)}
                                                    </span>
                                                </div>
                                                <div className="d-flex justify-content-between small mb-2">
                                                    <span className="text-secondary">Phí vận chuyển:</span>
                                                    <span className="fw-semibold text-dark">
                                                        {order.shippingFee && order.shippingFee > 0
                                                            ? formatVnd(order.shippingFee)
                                                            : "Miễn phí (0đ)"}
                                                    </span>
                                                </div>
                                                {order.discountAmount && order.discountAmount > 0 && (
                                                    <div className="d-flex justify-content-between small mb-2 text-danger">
                                                        <span>Giảm giá khuyến mãi / Voucher:</span>
                                                        <span className="fw-semibold">
                                                            -{formatVnd(order.discountAmount)}
                                                        </span>
                                                    </div>
                                                )}
                                                <hr className="my-2" />
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <span className="fw-bold text-dark fs-6">Tổng tiền thanh toán:</span>
                                                    <span className="fw-bold text-danger fs-4">
                                                        {formatVnd(order.totalPrice)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Lịch sử hoàn tiền nếu có */}
                                        {order.refunds && order.refunds.length > 0 && (
                                            <div className="card border-0 shadow-sm rounded-4 mt-3 border-start border-4 border-warning">
                                                <div className="card-body p-3">
                                                    <div className="fw-bold text-dark small mb-2">
                                                        YÊU CẦU HOÀN TIỀN ({order.refunds.length})
                                                    </div>
                                                    {order.refunds.map((ref) => (
                                                        <div key={ref.id} className="small text-secondary mb-1">
                                                            • Hoàn <strong>{formatVnd(ref.amount)}</strong> - Trạng thái:{" "}
                                                            <span className="badge bg-warning-subtle text-warning-emphasis">
                                                                {ref.status}
                                                            </span>{" "}
                                                            ({ref.reason})
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </>
                        ) : (
                            /* 2. TAB: PHIẾU GIAO VẬN HÀNG (SHIPPING SLIP) */
                            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white" id="printable-shipping-slip">
                                <div className="border-bottom pb-3 mb-3 d-flex justify-content-between align-items-center">
                                    <div>
                                        <h4 className="fw-bold text-danger mb-0">OILIA PERFUME ATELIER</h4>
                                        <div className="small text-secondary">PHIẾU ĐÓNG GÓI &amp; GIAO VẬN HÀNG HÓA</div>
                                    </div>
                                    <div className="text-end">
                                        <div className="badge bg-dark fs-6 px-3 py-2">MÃ ĐƠN: {order.code || `#ORD-${order.id}`}</div>
                                        <div className="small text-muted mt-1">Ngày lập phiếu: {formatDateTime(order.createdAt)}</div>
                                    </div>
                                </div>

                                <div className="row g-3 mb-4">
                                    <div className="col-6">
                                        <div className="p-3 border rounded-3 bg-light">
                                            <div className="fw-bold text-dark small text-uppercase mb-1">NGƯỜI GỬI:</div>
                                            <div className="fw-bold text-dark">OILIA STORE - KHO HÀNG TRUNG TÂM</div>
                                            <div className="small text-secondary">Hotline: 1900 6868</div>
                                            <div className="small text-secondary">Địa chỉ: Tân Thuận, Quận 7, TP. Hồ Chí Minh</div>
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
        </div>
    );
}
