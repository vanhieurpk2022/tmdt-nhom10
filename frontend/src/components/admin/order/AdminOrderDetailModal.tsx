import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faXmark,
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
} from "@fortawesome/free-solid-svg-icons";
import type { AdminOrderDetail } from "../../../api/AdminOrderService";
import { getPaymentStatusLabel } from "../../../api/OrderService";
import { OrderStatusBadge, ProductTypeBadge } from "../../../pages/AdminOrder";
import CustomBadge from "../badge/CustomBadge";
import { ProductType } from "../../../enums/ProductType";

interface Props {
    order: AdminOrderDetail | null;
    loading: boolean;
    onClose: () => void;
    onOpenStatusUpdate?: (order: AdminOrderDetail) => void;
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

export default function AdminOrderDetailModal({ order, loading, onClose, onOpenStatusUpdate }: Props) {
    if (!order && !loading) return null;

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
                                style={{ width: "40px", height: "40px" }}
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
                                <span className="small text-white-50">
                                    <FontAwesomeIcon icon={faClock} className="me-1" />
                                    Tạo lúc: {formatDateTime(order?.createdAt)}
                                </span>
                            </div>
                        </div>

                        <div className="d-flex align-items-center gap-2">
                            {order && onOpenStatusUpdate && (
                                <button
                                    type="button"
                                    className="btn btn-sm btn-outline-light rounded-3"
                                    onClick={() => onOpenStatusUpdate(order)}
                                >
                                    Chuyển trạng thái
                                </button>
                            )}
                            <button
                                type="button"
                                className="btn-close btn-close-white"
                                onClick={onClose}
                                aria-label="Close"
                            />
                        </div>
                    </div>

                    {/* Body */}
                    <div className="modal-body p-4 bg-light">
                        {loading || !order ? (
                            <div className="text-center py-5">
                                <div className="spinner-border text-danger mb-2" role="status" />
                                <div className="text-secondary small">Đang nạp chi tiết đơn hàng...</div>
                            </div>
                        ) : (
                            <div className="row g-3">
                                {/* CỘT TRÁI: Người nhận & Khách hàng */}
                                <div className="col-12 col-lg-4">
                                    {/* Card: Thông tin người nhận */}
                                    <div className="card border-0 shadow-sm rounded-4 mb-3">
                                        <div className="card-body p-3">
                                            <div className="d-flex align-items-center gap-2 mb-3 text-danger fw-bold small">
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
                                            <div className="d-flex align-items-center gap-2 mb-3 text-primary fw-bold small">
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
                                            <div className="d-flex align-items-center gap-2 mb-3 text-success fw-bold small">
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
                                                <span className={`badge ${order.paymentStatus === "PAID" ? "bg-success-subtle text-success-emphasis" : "bg-warning-subtle text-warning-emphasis"}`}>
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
                                                    <strong>Ghi chú:</strong> {order.note}
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
                                    <div className="card border-0 shadow-sm rounded-4 mb-3">
                                        <div className="card-header bg-white border-bottom py-3 px-4 d-flex justify-content-between align-items-center">
                                            <div className="d-flex align-items-center gap-2 fw-bold text-dark">
                                                <FontAwesomeIcon icon={faBoxOpen} className="text-danger" />
                                                <span>Sản phẩm trong đơn hàng ({order.items?.length || 0})</span>
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
                                                            <th className="ps-4">Sản phẩm</th>
                                                            <th className="text-center">Xưởng điều phối</th>
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
                                                                                <div className="small text-secondary d-flex align-items-center gap-2">
                                                                                    <span>Dung tích: {it.volumeMl || 10}ml</span>
                                                                                    {it.scentTier && (
                                                                                        <span className="badge bg-secondary-subtle text-secondary-emphasis">
                                                                                            Tầng {it.scentTier}
                                                                                        </span>
                                                                                    )}
                                                                                    {it.productType === ProductType.CUSTOM && ProductTypeBadge[it.productType] && (
                                                                                        <CustomBadge
                                                                                            label={ProductTypeBadge[it.productType].label}
                                                                                            badge={ProductTypeBadge[it.productType].badge}
                                                                                        />
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                    <td className="text-center">
                                                                        <span className="badge bg-light text-dark border">
                                                                            <FontAwesomeIcon icon={faIndustry} className="me-1 text-danger" />
                                                                            {it.factoryName || "OILIA Lab"}
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

                                            {/* Tổng tiền và chiết khấu */}
                                            <div className="p-4 bg-light border-top">
                                                <div className="row justify-content-end">
                                                    <div className="col-12 col-md-6">
                                                        <div className="d-flex justify-content-between small mb-2">
                                                            <span className="text-secondary">Tạm tính:</span>
                                                            <span className="fw-semibold">{formatVnd(order.subtotalPrice)}</span>
                                                        </div>
                                                        <div className="d-flex justify-content-between small mb-2">
                                                            <span className="text-secondary">Phí vận chuyển:</span>
                                                            <span className="fw-semibold">{formatVnd(order.shippingFee)}</span>
                                                        </div>
                                                        <div className="d-flex justify-content-between small mb-2">
                                                            <span className="text-secondary">Giảm giá voucher:</span>
                                                            <span className="fw-semibold text-danger">-{formatVnd(order.discountAmount)}</span>
                                                        </div>
                                                        <hr style={{ borderColor: "#cbd5e1" }} />
                                                        <div className="d-flex justify-content-between align-items-center">
                                                            <span className="fw-bold text-dark fs-6">Tổng thanh toán:</span>
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
                        )}
                    </div>

                    {/* Footer */}
                    <div className="modal-footer bg-white border-top px-4 py-3 d-flex justify-content-between align-items-center">
                        <button
                            type="button"
                            className="btn btn-outline-secondary btn-sm"
                            onClick={() => window.print()}
                        >
                            <FontAwesomeIcon icon={faPrint} className="me-2" />
                            In hóa đơn / Phiếu vận đơn
                        </button>

                        <button
                            type="button"
                            className="btn btn-danger btn-sm px-4 fw-semibold rounded-3"
                            onClick={onClose}
                        >
                            Đóng
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
