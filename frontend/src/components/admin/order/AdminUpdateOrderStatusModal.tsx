import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faPenToSquare,
    faTriangleExclamation,
    faCheck,
} from "@fortawesome/free-solid-svg-icons";
import { OrderStatus } from "../../../enums/OrderStatus";
import type { AdminOrderListItem, AdminOrderDetail } from "../../../api/AdminOrderService";

interface Props {
    order: AdminOrderListItem | AdminOrderDetail | null;
    show: boolean;
    onClose: () => void;
    onSave: (id: number, status: OrderStatus, note?: string, cancelReason?: string) => Promise<void>;
}

const STATUS_OPTIONS: Array<{ value: OrderStatus; label: string; desc: string; color: string }> = [
    { value: OrderStatus.PENDING, label: "Chờ xác nhận", desc: "Đơn mới phát sinh, cần CSKH tiếp nhận", color: "text-warning" },
    { value: OrderStatus.CONFIRMED, label: "Đã xác nhận", desc: "Đã chốt thông tin người nhận, chuẩn bị gửi xưởng", color: "text-primary" },
    { value: OrderStatus.PROCESSING, label: "Đang gia công", desc: "Xưởng đang pha chế hương và chiết rót", color: "text-info" },
    { value: OrderStatus.SHIPPED, label: "Đã gửi hàng", desc: "Kiện hàng đã bàn giao cho đơn vị vận chuyển", color: "text-info" },
    { value: OrderStatus.DELIVERING, label: "Đang giao", desc: "Shipper đang trên đường giao tới người nhận", color: "text-primary" },
    { value: OrderStatus.DELIVERED, label: "Đã giao thành công", desc: "Người nhận đã nhận hàng và hoàn tất thanh toán", color: "text-success" },
    { value: OrderStatus.CANCELLED, label: "Đã hủy đơn", desc: "Hủy đơn hàng và ghi nhận lý do", color: "text-danger" },
];

const CANCEL_REASONS = [
    { value: "CUSTOMER_CHANGED_MIND", label: "Khách hàng đổi ý / không còn nhu cầu" },
    { value: "OUT_OF_STOCK", label: "Hết nguyên liệu / tinh dầu mẫu tại xưởng" },
    { value: "DELIVERY_TIME_CONFLICT", label: "Thời gian giao hàng không khớp yêu cầu" },
    { value: "FACTORY_CONFIRM_LATE", label: "Xưởng điều phối phản hồi chậm trễ" },
];

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
            style={{ backgroundColor: "rgba(15, 23, 42, 0.65)", zIndex: 1060 }}
        >
            <div className="modal-dialog modal-dialog-centered modal-md">
                <div className="modal-content rounded-4 border-0 shadow-lg overflow-hidden">
                    <form onSubmit={handleSubmit}>
                        {/* Header */}
                        <div className="modal-header border-bottom px-4 py-3 bg-light">
                            <div className="d-flex align-items-center gap-2">
                                <FontAwesomeIcon icon={faPenToSquare} className="text-danger" />
                                <h6 className="modal-title fw-bold text-dark mb-0 fs-6">
                                    Cập nhật trạng thái đơn {order.code || `#ORD-${order.id}`}
                                </h6>
                            </div>
                            <button
                                type="button"
                                className="btn-close"
                                onClick={onClose}
                                disabled={loading}
                            />
                        </div>

                        {/* Body */}
                        <div className="modal-body p-4">
                            {error && (
                                <div className="alert alert-danger py-2 px-3 small rounded-3 mb-3 d-flex align-items-center gap-2">
                                    <FontAwesomeIcon icon={faTriangleExclamation} />
                                    <span>{error}</span>
                                </div>
                            )}

                            <label className="form-label fw-bold text-dark small mb-2">
                                Chọn trạng thái mới:
                            </label>

                            <div className="d-flex flex-column gap-2 mb-3">
                                {STATUS_OPTIONS.map((opt) => {
                                    const isSelected = selectedStatus === opt.value;
                                    return (
                                        <div
                                            key={opt.value}
                                            className={`p-2 px-3 rounded-3 border d-flex align-items-center justify-content-between cursor-pointer transition ${
                                                isSelected ? "border-danger bg-danger-subtle" : "bg-white hover-bg-light"
                                            }`}
                                            onClick={() => setSelectedStatus(opt.value)}
                                            style={{ cursor: "pointer" }}
                                        >
                                            <div>
                                                <div className={`fw-bold small ${opt.color}`}>
                                                    {opt.label}
                                                </div>
                                                <div className="text-secondary" style={{ fontSize: "11.5px" }}>
                                                    {opt.desc}
                                                </div>
                                            </div>
                                            <input
                                                type="radio"
                                                name="orderStatus"
                                                className="form-check-input"
                                                checked={isSelected}
                                                onChange={() => setSelectedStatus(opt.value)}
                                            />
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Lý do hủy nếu chọn CANCELLED */}
                            {selectedStatus === OrderStatus.CANCELLED && (
                                <div className="mb-3 p-3 bg-danger-subtle border border-danger-subtle rounded-3">
                                    <label className="form-label fw-bold text-danger small mb-1">
                                        Lý do hủy đơn:
                                    </label>
                                    <select
                                        className="form-select form-select-sm"
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
                            <div className="mb-2">
                                <label className="form-label fw-bold text-dark small mb-1">
                                    Ghi chú điều phối (tùy chọn):
                                </label>
                                <textarea
                                    className="form-control form-control-sm rounded-3"
                                    rows={2}
                                    placeholder="Nhập ghi chú thêm cho lần cập nhật này..."
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="modal-footer border-top px-4 py-3 bg-light">
                            <button
                                type="button"
                                className="btn btn-sm btn-secondary rounded-3 px-3"
                                onClick={onClose}
                                disabled={loading}
                            >
                                Hủy bỏ
                            </button>
                            <button
                                type="submit"
                                className="btn btn-sm btn-danger rounded-3 px-4 fw-semibold d-flex align-items-center gap-2"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm" role="status" />
                                        <span>Đang lưu...</span>
                                    </>
                                ) : (
                                    <>
                                        <FontAwesomeIcon icon={faCheck} />
                                        <span>Xác nhận cập nhật</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
