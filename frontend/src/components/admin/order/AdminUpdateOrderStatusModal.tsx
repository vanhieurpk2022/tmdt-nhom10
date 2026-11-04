import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faPenToSquare,
    faTriangleExclamation,
    faCheck,
    faClock,
    faCircleCheck,
    faFlask,
    faTruckFast,
    faRoute,
    faCircleXmark,
    faUser,
    faMoneyBillWave,
    faBoxArchive,
} from "@fortawesome/free-solid-svg-icons";
import { OrderStatus } from "../../../enums/OrderStatus";
import type { AdminOrderListItem, AdminOrderDetail } from "../../../api/AdminOrderService";
import { OrderStatusBadge } from "../../../pages/AdminOrder";
import CustomBadge from "../badge/CustomBadge";

interface Props {
    order: AdminOrderListItem | AdminOrderDetail | null;
    show: boolean;
    onClose: () => void;
    onSave: (id: number, status: OrderStatus, note?: string, cancelReason?: string) => Promise<void>;
}

const STATUS_OPTIONS: Array<{
    value: OrderStatus;
    label: string;
    desc: string;
    icon: any;
    colorClass: string;
    activeBorder: string;
    activeBg: string;
}> = [
    {
        value: OrderStatus.PENDING,
        label: "Chờ xác nhận",
        desc: "Đơn mới phát sinh, cần xưởng/CSKH tiếp nhận và duyệt",
        icon: faClock,
        colorClass: "text-warning",
        activeBorder: "border-warning",
        activeBg: "bg-warning-subtle",
    },
    {
        value: OrderStatus.CONFIRMED,
        label: "Đã xác nhận",
        desc: "Đã chốt đơn và thông tin người nhận, chuẩn bị gia công",
        icon: faCircleCheck,
        colorClass: "text-primary",
        activeBorder: "border-primary",
        activeBg: "bg-primary-subtle",
    },
    {
        value: OrderStatus.PROCESSING,
        label: "Đang gia công / Chiết rót",
        desc: "Xưởng đang thực hiện pha chế mùi hương, đóng chai và dán nhãn",
        icon: faFlask,
        colorClass: "text-info",
        activeBorder: "border-info",
        activeBg: "bg-info-subtle",
    },
    {
        value: OrderStatus.SHIPPED,
        label: "Đã gửi hàng cho ĐVVC",
        desc: "Kiện hàng đã bàn giao hoàn tất cho bên vận chuyển (GHN/GHTK)",
        icon: faTruckFast,
        colorClass: "text-info",
        activeBorder: "border-info",
        activeBg: "bg-info-subtle",
    },
    {
        value: OrderStatus.DELIVERING,
        label: "Đang giao đến khách",
        desc: "Shipper đang trên đường giao hàng đến tay người nhận",
        icon: faRoute,
        colorClass: "text-primary",
        activeBorder: "border-primary",
        activeBg: "bg-primary-subtle",
    },
    {
        value: OrderStatus.DELIVERED,
        label: "Đã giao thành công",
        desc: "Khách đã nhận kiện hàng và hoàn tất thanh toán tiền COD",
        icon: faCircleCheck,
        colorClass: "text-success",
        activeBorder: "border-success",
        activeBg: "bg-success-subtle",
    },
    {
        value: OrderStatus.CANCELLED,
        label: "Hủy đơn hàng",
        desc: "Hủy đơn hàng và ghi nhận lý do vào hệ thống",
        icon: faCircleXmark,
        colorClass: "text-danger",
        activeBorder: "border-danger",
        activeBg: "bg-danger-subtle",
    },
];

const CANCEL_REASONS = [
    { value: "CUSTOMER_CHANGED_MIND", label: "Khách hàng đổi ý / không còn nhu cầu" },
    { value: "OUT_OF_STOCK", label: "Hết nguyên liệu / tinh dầu mẫu tại xưởng" },
    { value: "DELIVERY_TIME_CONFLICT", label: "Thời gian giao hàng không khớp yêu cầu của khách" },
    { value: "FACTORY_CONFIRM_LATE", label: "Xưởng điều phối phản hồi chậm trễ" },
    { value: "CANNOT_CONTACT", label: "Không liên hệ được với người nhận sau 3 lần gọi" },
];

const formatVnd = (val?: number) => (val || 0).toLocaleString("vi-VN") + "đ";

export default function AdminUpdateOrderStatusModal({ order, show, onClose, onSave }: Props) {
    const [selectedStatus, setSelectedStatus] = useState<OrderStatus>(OrderStatus.PENDING);
    const [note, setNote] = useState<string>("");
    const [cancelReason, setCancelReason] = useState<string>("CUSTOMER_CHANGED_MIND");
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (order) {
            setSelectedStatus(order.status || OrderStatus.PENDING);
            setNote("");
            setError(null);
        }
    }, [order]);

    if (!show || !order) return null;

    const customerName =
        ("customerName" in order && order.customerName) ||
        ("recipientName" in order && order.recipientName) ||
        ("recipient" in order && order.recipient?.name) ||
        ("user" in order && order.user?.name) ||
        "Khách hàng";

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await onSave(
                order.id,
                selectedStatus,
                note.trim() ? note.trim() : undefined,
                selectedStatus === OrderStatus.CANCELLED ? cancelReason : undefined
            );
            onClose();
        } catch (err: any) {
            console.error("Lỗi cập nhật trạng thái đơn hàng:", err);
            setError(err?.response?.data?.message || "Không thể cập nhật trạng thái đơn hàng. Vui lòng thử lại!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="modal fade show d-block"
            tabIndex={-1}
            style={{ backgroundColor: "rgba(15, 23, 42, 0.7)", zIndex: 1060 }}
        >
            <div className="modal-dialog modal-dialog-centered modal-lg">
                <div
                    className="modal-content rounded-4 border-0 shadow-lg overflow-hidden d-flex flex-column"
                    style={{ maxHeight: "90vh" }}
                >
                    {/* Header - Luôn cố định ở trên */}
                    <div className="modal-header border-bottom px-4 py-3 bg-dark text-white d-flex align-items-center justify-content-between flex-shrink-0 w-100">
                        <div className="d-flex align-items-center gap-3">
                            <div
                                className="d-flex align-items-center justify-content-center bg-danger rounded-3"
                                style={{ width: "38px", height: "38px" }}
                            >
                                <FontAwesomeIcon icon={faPenToSquare} className="text-white fs-6" />
                            </div>
                            <div>
                                <h6 className="modal-title fw-bold text-white mb-0 fs-5">
                                    Cập nhật trạng thái đơn {order.code || `#ORD-${order.id}`}
                                </h6>
                                <span className="small text-white-50">
                                    Điều phối tiến độ xử lý và cập nhật cho khách hàng
                                </span>
                            </div>
                        </div>
                        <button
                            type="button"
                            className="btn-close btn-close-white ms-auto"
                            onClick={onClose}
                            disabled={loading}
                            aria-label="Close"
                            style={{ filter: "brightness(0) invert(1)", opacity: 0.85, cursor: "pointer" }}
                        />
                    </div>

                    {/* Body - Cuộn mượt độc lập bên trong */}
                    <div className="modal-body p-4 bg-light overflow-y-auto flex-grow-1">
                        <form id="update-order-status-form" onSubmit={handleSubmit}>
                            {error && (
                                <div className="alert alert-danger py-2 px-3 small rounded-3 mb-3 d-flex align-items-center gap-2">
                                    <FontAwesomeIcon icon={faTriangleExclamation} />
                                    <span>{error}</span>
                                </div>
                            )}

                            {/* Tóm tắt thông tin đơn hàng */}
                            <div className="card border-0 shadow-sm rounded-3 mb-3 bg-white">
                                <div className="card-body p-3">
                                    <div className="row g-2 align-items-center">
                                        <div className="col-12 col-md-4">
                                            <div className="small text-muted mb-1">
                                                <FontAwesomeIcon icon={faUser} className="me-1 text-secondary" />
                                                Khách hàng:
                                            </div>
                                            <div className="fw-bold text-dark text-truncate">{customerName}</div>
                                        </div>
                                        <div className="col-12 col-md-4">
                                            <div className="small text-muted mb-1">
                                                <FontAwesomeIcon icon={faMoneyBillWave} className="me-1 text-success" />
                                                Tổng tiền:
                                            </div>
                                            <div className="fw-bold text-danger">{formatVnd(order.totalPrice)}</div>
                                        </div>
                                        <div className="col-12 col-md-4">
                                            <div className="small text-muted mb-1">
                                                <FontAwesomeIcon icon={faBoxArchive} className="me-1 text-primary" />
                                                Trạng thái hiện tại:
                                            </div>
                                            <div>
                                                {order.status && OrderStatusBadge[order.status] && (
                                                    <CustomBadge
                                                        label={OrderStatusBadge[order.status].label}
                                                        badge={OrderStatusBadge[order.status].badge}
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <label className="form-label fw-bold text-dark small mb-2">
                                Chọn trạng thái chuyển tiếp:
                            </label>

                            {/* Danh sách các trạng thái lựa chọn */}
                            <div className="d-flex flex-column gap-2 mb-3">
                                {STATUS_OPTIONS.map((opt) => {
                                    const isSelected = selectedStatus === opt.value;
                                    const isCurrent = order.status === opt.value;

                                    return (
                                        <div
                                            key={opt.value}
                                            className={`p-3 rounded-3 border d-flex align-items-center justify-content-between transition shadow-sm ${
                                                isSelected
                                                    ? `${opt.activeBorder} ${opt.activeBg} border-2`
                                                    : "bg-white border-light-subtle hover-bg-light"
                                            }`}
                                            onClick={() => setSelectedStatus(opt.value)}
                                            style={{ cursor: "pointer", transition: "all 0.15s ease-in-out" }}
                                        >
                                            <div className="d-flex align-items-center gap-3">
                                                <div
                                                    className={`d-flex align-items-center justify-content-center rounded-circle ${
                                                        isSelected ? "bg-white shadow-sm" : "bg-light"
                                                    }`}
                                                    style={{ width: "36px", height: "36px" }}
                                                >
                                                    <FontAwesomeIcon icon={opt.icon} className={opt.colorClass} />
                                                </div>
                                                <div>
                                                    <div className="d-flex align-items-center gap-2">
                                                        <span className={`fw-bold small ${opt.colorClass}`}>
                                                            {opt.label}
                                                        </span>
                                                        {isCurrent && (
                                                            <span className="badge bg-secondary-subtle text-secondary" style={{ fontSize: "10px" }}>
                                                                Hiện tại
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-secondary small mt-1" style={{ fontSize: "12px" }}>
                                                        {opt.desc}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="form-check m-0">
                                                <input
                                                    type="radio"
                                                    name="orderStatus"
                                                    className="form-check-input"
                                                    checked={isSelected}
                                                    onChange={() => setSelectedStatus(opt.value)}
                                                    style={{ width: "18px", height: "18px", cursor: "pointer" }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Lý do hủy nếu chọn CANCELLED */}
                            {selectedStatus === OrderStatus.CANCELLED && (
                                <div className="mb-3 p-3 bg-danger-subtle border border-danger rounded-3 shadow-sm">
                                    <div className="d-flex align-items-center gap-2 mb-2 text-danger fw-bold small">
                                        <FontAwesomeIcon icon={faTriangleExclamation} />
                                        <span>CẢNH BÁO: ĐƠN HÀNG SẼ BỊ HỦY VÀ HOÀN KHO NGUYÊN LIỆU</span>
                                    </div>
                                    <label className="form-label fw-bold text-dark small mb-1">
                                        Lý do hủy đơn hàng: <span className="text-danger">*</span>
                                    </label>
                                    <select
                                        className="form-select form-select-sm rounded-3 border-danger"
                                        value={cancelReason}
                                        onChange={(e) => setCancelReason(e.target.value)}
                                    >
                                        {CANCEL_REASONS.map((r) => (
                                            <option key={r.value} value={r.value}>
                                                {r.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Ghi chú điều phối */}
                            <div className="card border-0 shadow-sm rounded-3 p-3 bg-white">
                                <label className="form-label fw-bold text-dark small mb-1">
                                    Ghi chú điều phối bổ sung (tùy chọn):
                                </label>
                                <textarea
                                    className="form-control form-control-sm rounded-3"
                                    rows={2}
                                    placeholder="Nhập ghi chú cho lần chuyển trạng thái này..."
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                />
                            </div>
                        </form>
                    </div>

                    {/* Footer - LUÔN CỐ ĐỊNH Ở ĐÁY, KHÔNG BAO GIỜ BỊ CHE */}
                    <div className="modal-footer border-top px-4 py-3 bg-white d-flex justify-content-between align-items-center flex-shrink-0 w-100">
                        <button
                            type="button"
                            className="btn btn-secondary btn-sm rounded-3 px-4 fw-semibold"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Đóng
                        </button>
                        <button
                            type="submit"
                            form="update-order-status-form"
                            className={`btn btn-sm px-4 fw-semibold rounded-3 d-flex align-items-center gap-2 shadow-sm ${
                                selectedStatus === OrderStatus.CANCELLED ? "btn-outline-danger" : "btn-danger"
                            }`}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm" role="status" />
                                    <span>Đang cập nhật...</span>
                                </>
                            ) : (
                                <>
                                    <FontAwesomeIcon icon={faCheck} />
                                    <span>Xác nhận cập nhật</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
