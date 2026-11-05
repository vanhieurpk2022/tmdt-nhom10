import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import Modal from "react-bootstrap/Modal";
import {
    faArrowsRotate,
    faBagShopping,
    faBan,
    faCheckCircle,
    faCreditCard,
    faMoneyBill1Wave,
    faReceipt,
    faRotateRight,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    formatOrderCode,
    getPaymentMethodLabel,
    getPaymentStatusLabel,
    orderService,
    type CancelOrderRequest,
    type OrderResponse,
} from "../../api/OrderService";
import { useCart } from "../../api/CartContext";
import { cancelReasonLabels, getOrderError } from "../../data/orderDetailsData";
import { ROUTES } from "../../routes/routes";

interface OrderSuccessSummaryProps {
    order: OrderResponse;
    onOrderChange?: (order: OrderResponse) => void;
    onRefresh?: () => void;
}

const currencyFormatter = new Intl.NumberFormat("vi-VN");

function formatPrice(price: number) {
    return `${currencyFormatter.format(price)}₫`;
}

export default function OrderSuccessSummary({ order, onOrderChange, onRefresh }: OrderSuccessSummaryProps) {
    const navigate = useNavigate();
    const { applyCart, showCartNotice } = useCart();
    const [dialog, setDialog] = useState<"cancel" | "reorder" | null>(null);
    const [request, setRequest] = useState<CancelOrderRequest>({ reason: "CUSTOMER_CHANGED_MIND", note: "" });
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const submitting = useRef(false);

    const subtotal = order.subtotalPrice;
    const orderCode = formatOrderCode(order.id);
    const paymentMethod = getPaymentMethodLabel(order.paymentMethod);
    const paymentStatusText = getPaymentStatusLabel(order);

    const isPaid = order.paymentStatus === "PAID";
    const isRefundPending = order.paymentStatus === "REFUND_PENDING";
    const isRefunded = order.paymentStatus === "REFUNDED";

    const canCancel = ["PENDING_PAYMENT", "PENDING"].includes(order.status)
        && !["REFUND_PENDING", "REFUNDED"].includes(order.paymentStatus ?? "");
    const canPay = order.paymentMethod === "VNPAY" && order.status === "PENDING_PAYMENT"
        && ["PENDING", "FAILED"].includes(order.paymentStatus ?? "PENDING");

    function openDialog(value: "cancel" | "reorder") {
        setError("");
        setMessage("");
        setDialog(value);
    }

    async function confirm() {
        if (!dialog || submitting.current) return;
        submitting.current = true;
        setBusy(true);
        setError("");
        try {
            if (dialog === "cancel") {
                const updated = await orderService.cancelOrder(order.id, { ...request, note: request.note?.trim() });
                if (onOrderChange) onOrderChange(updated);
                setMessage(updated.paymentStatus === "REFUND_PENDING"
                    ? "Đã hủy đơn và ghi nhận yêu cầu hoàn tiền."
                    : "Đã hủy đơn hàng thành công.");
                setDialog(null);
            } else {
                const cart = await orderService.reorder(order.id);
                applyCart(cart);
                showCartNotice("Đã cập nhật giỏ hàng theo giá và tồn kho hiện tại.");
                navigate(ROUTES.CART);
            }
        } catch (cause) {
            setError(getOrderError(cause, "Chưa thể thực hiện thao tác. Vui lòng kiểm tra lại."));
        } finally {
            submitting.current = false;
            setBusy(false);
        }
    }

    return (
        <aside className="bg-white rounded-4 border shadow-sm p-3 p-md-4 mb-3" aria-labelledby="order-summary-title">
            {/* Header thẻ tóm tắt */}
            <div className="d-flex align-items-center justify-content-between pb-3 mb-3 border-bottom">
                <div className="d-flex align-items-center gap-2">
                    <div className="rounded-circle d-flex align-items-center justify-content-center bg-primary bg-opacity-10 text-primary" style={{ width: "36px", height: "36px" }}>
                        <FontAwesomeIcon icon={faReceipt} className="fs-7" />
                    </div>
                    <div>
                        <h2 id="order-summary-title" className="fs-6 fw-bold text-dark mb-0">
                            Tóm tắt thanh toán
                        </h2>
                        <span className="text-muted fs-8">Chi tiết chi phí & Thao tác</span>
                    </div>
                </div>

                <span className="badge bg-light text-dark border rounded-pill px-2.5 py-1 fs-8 fw-bold">
                    #{orderCode}
                </span>
            </div>

            {/* Các dòng chiết tính */}
            <div className="d-flex flex-column gap-2 mb-3 fs-7">
                <div className="d-flex align-items-center justify-content-between text-muted">
                    <span>Tạm tính</span>
                    <strong className="text-dark fw-bold">{formatPrice(subtotal)}</strong>
                </div>

                <div className="d-flex align-items-center justify-content-between text-muted">
                    <span>Phí vận chuyển</span>
                    <strong className="text-dark fw-bold">{formatPrice(order.shippingFee)}</strong>
                </div>

                <div className="d-flex align-items-center justify-content-between text-muted">
                    <span>Phương thức</span>
                    <span className="d-inline-flex align-items-center gap-1.5 fw-bold text-dark">
                        <FontAwesomeIcon
                            icon={order.paymentMethod === "VNPAY" ? faCreditCard : faMoneyBill1Wave}
                            className={order.paymentMethod === "VNPAY" ? "text-primary fs-8" : "text-success fs-8"}
                        />
                        <span>{paymentMethod}</span>
                    </span>
                </div>

                <div className="d-flex align-items-center justify-content-between text-muted">
                    <span>Thanh toán</span>
                    <span className={`badge rounded-pill px-2.5 py-1 fs-8 fw-bold ${
                        isPaid
                            ? "bg-success bg-opacity-10 text-success border border-success border-opacity-25"
                            : isRefundPending
                            ? "bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25"
                            : isRefunded
                            ? "bg-info bg-opacity-10 text-info border border-info border-opacity-25"
                            : "bg-secondary bg-opacity-10 text-secondary border"
                    }`}>
                        {paymentStatusText}
                    </span>
                </div>
            </div>

            <hr className="my-3 opacity-25" />

            {/* Tổng thanh toán nổi bật */}
            <div className="d-flex align-items-baseline justify-content-between mb-3">
                <div>
                    <span className="fs-7 fw-bold text-dark d-block">Tổng thanh toán</span>
                    <span className="text-muted d-block" style={{ fontSize: "11px" }}>Đã gồm VAT & phí giao hàng</span>
                </div>
                <strong className="fs-4 fw-black text-danger">
                    {formatPrice(order.totalPrice)}
                </strong>
            </div>

            {message && (
                <div className="p-2.5 rounded-3 bg-success bg-opacity-10 border border-success border-opacity-25 d-flex align-items-center gap-2 mb-3 text-success fs-7" role="status">
                    <FontAwesomeIcon icon={faCheckCircle} className="flex-shrink-0" />
                    <span>{message}</span>
                </div>
            )}

            {/* Khối các nút thao tác tập trung */}
            <div className="d-flex flex-column gap-2 pt-2 border-top">
                {canPay && (
                    <Link
                        className="btn btn-primary rounded-pill py-2.5 fw-bold fs-7 d-inline-flex align-items-center justify-content-center gap-2 shadow-xs"
                        to={`${ROUTES.VNPAY_RESULT}?orderId=${order.id}`}
                    >
                        <FontAwesomeIcon icon={faCreditCard} />
                        <span>Tiếp tục thanh toán VNPay</span>
                    </Link>
                )}

                {order.items.length > 0 && (
                    <button
                        type="button"
                        className="btn btn-primary rounded-pill py-2.5 fw-bold fs-7 d-inline-flex align-items-center justify-content-center gap-2 shadow-xs"
                        disabled={busy}
                        onClick={() => openDialog("reorder")}
                    >
                        <FontAwesomeIcon icon={faRotateRight} />
                        <span>Đặt lại đơn hàng này</span>
                    </button>
                )}

                {onRefresh && (
                    <button
                        type="button"
                        className="btn btn-light border rounded-pill py-2 fw-bold fs-7 text-dark d-inline-flex align-items-center justify-content-center gap-2 hover-border-dark"
                        disabled={busy}
                        onClick={onRefresh}
                    >
                        <FontAwesomeIcon icon={faArrowsRotate} />
                        <span>Cập nhật trạng thái</span>
                    </button>
                )}

                <Link
                    to={ROUTES.PRODUCTS}
                    className="btn btn-outline-secondary rounded-pill py-2 fw-bold fs-7 d-inline-flex align-items-center justify-content-center gap-2 hover-border-dark"
                >
                    <FontAwesomeIcon icon={faBagShopping} className="fs-8" />
                    <span>Tiếp tục mua sắm</span>
                </Link>

                {canCancel && (
                    <button
                        type="button"
                        className="btn btn-link text-danger fs-8 text-decoration-none py-1 mt-1 d-inline-flex align-items-center justify-content-center gap-1.5"
                        disabled={busy}
                        onClick={() => openDialog("cancel")}
                    >
                        <FontAwesomeIcon icon={faBan} />
                        <span>Hủy đơn hàng này</span>
                    </button>
                )}
            </div>

            {/* Modal xác nhận */}
            <Modal
                show={dialog !== null}
                onHide={() => { if (!busy) setDialog(null); }}
                centered
                backdrop={busy ? "static" : true}
                keyboard={!busy}
                aria-labelledby="order-action-title"
            >
                <Modal.Header closeButton={!busy} className="border-bottom pb-3">
                    <Modal.Title as="h2" id="order-action-title" className="fs-5 fw-bold text-dark">
                        {dialog === "cancel" ? "Xác nhận hủy đơn hàng" : "Đặt lại đơn hàng"}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body aria-busy={busy} className="py-3">
                    {dialog === "cancel" ? (
                        <>
                            <div className="p-3 rounded-3 bg-light border mb-3 fs-7 text-secondary">
                                {order.paymentStatus === "PAID"
                                    ? "Đơn hàng sẽ được hủy và hệ thống sẽ tự động tạo yêu cầu hoàn tiền đối soát qua VNPay."
                                    : "Đơn hàng sẽ ngừng xử lý sau khi xác nhận hủy."}
                            </div>

                            <label className="form-label fs-7 fw-bold text-dark" htmlFor="cancel-reason">
                                Lý do hủy đơn <span className="text-danger">*</span>
                            </label>
                            <select
                                id="cancel-reason"
                                className="form-select mb-3 fs-7 rounded-3"
                                disabled={busy}
                                value={request.reason}
                                onChange={event => setRequest({ ...request, reason: event.target.value as CancelOrderRequest["reason"] })}
                            >
                                {Object.entries(cancelReasonLabels).map(([value, label]) => (
                                    <option key={value} value={value}>{label}</option>
                                ))}
                            </select>

                            <label className="form-label fs-7 fw-bold text-dark" htmlFor="cancel-note">
                                Ghi chú thêm (không bắt buộc)
                            </label>
                            <textarea
                                id="cancel-note"
                                className="form-control fs-7 rounded-3"
                                rows={3}
                                maxLength={500}
                                disabled={busy}
                                placeholder="Nhập lý do chi tiết..."
                                value={request.note}
                                onChange={event => setRequest({ ...request, note: event.target.value })}
                            />
                            <p className="small text-muted mt-1 mb-0 fs-8">{request.note?.length ?? 0}/500 ký tự</p>
                        </>
                    ) : (
                        <p className="fs-7 text-secondary mb-0">
                            Các sản phẩm khả dụng trong đơn sẽ được cập nhật vào giỏ hàng theo giá và tồn kho hiện tại để bạn tiến hành đặt lại.
                        </p>
                    )}

                    {error && (
                        <div className="p-3 rounded-3 bg-danger bg-opacity-10 border border-danger border-opacity-25 text-danger fs-7 mt-3" role="alert">
                            {error}
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer className="border-top pt-2">
                    <button
                        type="button"
                        className="btn btn-outline-secondary rounded-pill px-4 fs-7 fw-bold"
                        disabled={busy}
                        onClick={() => setDialog(null)}
                    >
                        Quay lại
                    </button>
                    <button
                        type="button"
                        className={`btn rounded-pill px-4 fs-7 fw-bold ${dialog === "cancel" ? "btn-danger" : "btn-primary"}`}
                        disabled={busy}
                        onClick={() => { void confirm(); }}
                    >
                        {busy ? "Đang xử lý…" : dialog === "cancel" ? "Xác nhận hủy đơn" : "Thêm vào giỏ hàng"}
                    </button>
                </Modal.Footer>
            </Modal>
        </aside>
    );
}
