import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import Modal from "react-bootstrap/Modal";
import {
    faArrowsRotate,
    faBan,
    faCheckCircle,
    faCreditCard,
    faRotateRight,
    faSliders,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { orderService, type CancelOrderRequest, type OrderResponse } from "../../api/OrderService";
import { useCart } from "../../api/CartContext";
import { cancelReasonLabels, getOrderError } from "../../data/orderDetailsData";
import { ROUTES } from "../../routes/routes";

interface OrderActionsProps {
    order: OrderResponse;
    onOrderChange: (order: OrderResponse) => void;
    onRefresh: () => void;
}

export default function OrderActions({ order, onOrderChange, onRefresh }: OrderActionsProps) {
    const navigate = useNavigate();
    const { applyCart, showCartNotice } = useCart();
    const [dialog, setDialog] = useState<"cancel" | "reorder" | null>(null);
    const [request, setRequest] = useState<CancelOrderRequest>({ reason: "CUSTOMER_CHANGED_MIND", note: "" });
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const submitting = useRef(false);

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
                onOrderChange(updated);
                setMessage(updated.paymentStatus === "REFUND_PENDING"
                    ? "Đã hủy đơn và ghi nhận yêu cầu hoàn tiền. Bạn có thể theo dõi tiến trình bên dưới."
                    : "Đã hủy đơn hàng thành công.");
                setDialog(null);
            } else {
                const cart = await orderService.reorder(order.id);
                applyCart(cart);
                showCartNotice("Đã cập nhật giỏ hàng theo giá và tồn kho hiện tại. Vui lòng kiểm tra trước khi thanh toán.");
                navigate(ROUTES.CART);
            }
        } catch (cause) {
            setError(getOrderError(cause, "Chưa thể thực hiện thao tác. Vui lòng kiểm tra lại trạng thái đơn và thử lại."));
        } finally {
            submitting.current = false;
            setBusy(false);
        }
    }

    return (
        <section className="bg-white rounded-4 border shadow-sm p-4 mb-4" aria-label="Thao tác đơn hàng">
            <div className="d-flex align-items-center gap-2 pb-3 mb-3 border-bottom">
                <div className="rounded-circle d-flex align-items-center justify-content-center bg-primary bg-opacity-10 text-primary" style={{ width: "36px", height: "36px" }}>
                    <FontAwesomeIcon icon={faSliders} className="fs-7" />
                </div>
                <div>
                    <h2 className="fs-6 fw-bold text-dark mb-0">Thao tác đơn hàng</h2>
                    <span className="text-muted fs-8">Hành động khả dụng cho đơn này</span>
                </div>
            </div>

            <div className="d-flex flex-column gap-2">
                {canPay && (
                    <Link
                        className="btn btn-primary rounded-pill py-2 fw-bold fs-7 d-inline-flex align-items-center justify-content-center gap-2"
                        to={`${ROUTES.VNPAY_RESULT}?orderId=${order.id}`}
                    >
                        <FontAwesomeIcon icon={faCreditCard} />
                        <span>Tiếp tục thanh toán VNPay</span>
                    </Link>
                )}

                {order.items.length > 0 && (
                    <button
                        type="button"
                        className="btn btn-outline-primary rounded-pill py-2 fw-bold fs-7 d-inline-flex align-items-center justify-content-center gap-2"
                        disabled={busy}
                        onClick={() => openDialog("reorder")}
                    >
                        <FontAwesomeIcon icon={faRotateRight} />
                        <span>Đặt lại đơn hàng này</span>
                    </button>
                )}

                <button
                    type="button"
                    className="btn btn-light border rounded-pill py-2 fw-bold fs-7 text-secondary d-inline-flex align-items-center justify-content-center gap-2 hover-border-dark"
                    disabled={busy}
                    onClick={onRefresh}
                >
                    <FontAwesomeIcon icon={faArrowsRotate} />
                    <span>Cập nhật trạng thái</span>
                </button>

                {canCancel && (
                    <button
                        type="button"
                        className="btn btn-outline-danger rounded-pill py-2 fw-bold fs-7 d-inline-flex align-items-center justify-content-center gap-2 mt-1"
                        disabled={busy}
                        onClick={() => openDialog("cancel")}
                    >
                        <FontAwesomeIcon icon={faBan} />
                        <span>Hủy đơn hàng</span>
                    </button>
                )}
            </div>

            {message && (
                <div className="p-3 rounded-3 bg-success bg-opacity-10 border border-success border-opacity-25 d-flex align-items-center gap-2 mt-3 text-success fs-7" role="status">
                    <FontAwesomeIcon icon={faCheckCircle} className="flex-shrink-0" />
                    <span>{message}</span>
                </div>
            )}

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
                                    ? "Đơn hàng sẽ được hủy và hệ thống sẽ tự động tạo yêu cầu hoàn tiền. Khoản tiền sẽ được đối soát và xử lý theo quy định."
                                    : "Đơn hàng sẽ ngừng xử lý sau khi hủy. Nếu bạn đã thanh toán qua VNPay, số tiền sẽ được đối soát để hoàn trả."}
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
                                placeholder="Nhập lý do chi tiết (nếu có)..."
                                value={request.note}
                                onChange={event => setRequest({ ...request, note: event.target.value })}
                            />
                            <p className="small text-muted mt-1 mb-0 fs-8">{request.note?.length ?? 0}/500 ký tự</p>
                        </>
                    ) : (
                        <p className="fs-7 text-secondary mb-0">
                            Các sản phẩm khả dụng trong đơn sẽ được thêm vào giỏ hàng với mức giá và tồn kho hiện hành. Bạn có thể kiểm tra lại thông tin trước khi đặt hàng mới.
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
                        {busy ? "Đang xử lý…" : dialog === "cancel" ? "Xác nhận hủy đơn" : "Cập nhật giỏ hàng"}
                    </button>
                </Modal.Footer>
            </Modal>
        </section>
    );
}
