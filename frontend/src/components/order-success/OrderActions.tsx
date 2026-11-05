import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import Modal from "react-bootstrap/Modal";
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
        <section className="order-success-card" aria-label="Thao tác đơn hàng">
            <div className="d-flex flex-wrap gap-2">
                {canPay && <Link className="btn order-success-primary-btn w-auto" to={`${ROUTES.VNPAY_RESULT}?orderId=${order.id}`}>Kiểm tra / tiếp tục thanh toán</Link>}
                {canCancel && <button type="button" className="btn btn-outline-danger" disabled={busy} onClick={() => openDialog("cancel")}>Hủy đơn hàng</button>}
                {order.items.length > 0 && <button type="button" className="btn btn-outline-primary" disabled={busy} onClick={() => openDialog("reorder")}>Đặt lại đơn</button>}
                <button type="button" className="btn btn-outline-secondary" disabled={busy} onClick={onRefresh}>Cập nhật trạng thái</button>
            </div>
            {message && <p className="alert alert-success mt-3 mb-0" role="status">{message}</p>}
            <Modal show={dialog !== null} onHide={() => { if (!busy) setDialog(null); }} centered
                backdrop={busy ? "static" : true} keyboard={!busy} aria-labelledby="order-action-title">
                <Modal.Header closeButton={!busy}>
                    <Modal.Title as="h2" id="order-action-title">{dialog === "cancel" ? "Xác nhận hủy đơn hàng" : "Đặt lại đơn hàng"}</Modal.Title>
                </Modal.Header>
                <Modal.Body aria-busy={busy}>
                    {dialog === "cancel" ? <>
                        <p>{order.paymentStatus === "PAID"
                            ? "Đơn hàng sẽ được hủy và tạo yêu cầu hoàn tiền. Tiền chỉ được ghi nhận đã hoàn khi có kết quả xác nhận."
                            : "Đơn hàng sẽ ngừng xử lý sau khi hủy. Nếu đã thanh toán qua VNPay, khoản tiền sẽ được đối soát để xử lý hoàn tiền."}</p>
                        <label className="form-label" htmlFor="cancel-reason">Lý do hủy đơn</label>
                        <select id="cancel-reason" className="form-select mb-3" disabled={busy} value={request.reason}
                            onChange={event => setRequest({ ...request, reason: event.target.value as CancelOrderRequest["reason"] })}>
                            {Object.entries(cancelReasonLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                        </select>
                        <label className="form-label" htmlFor="cancel-note">Ghi chú (không bắt buộc)</label>
                        <textarea id="cancel-note" className="form-control" rows={3} maxLength={500} disabled={busy}
                            value={request.note} onChange={event => setRequest({ ...request, note: event.target.value })} />
                        <p className="small text-secondary mt-1 mb-0">{request.note?.length ?? 0}/500 ký tự</p>
                    </> : <p className="mb-0">Sản phẩm trong đơn sẽ được cập nhật vào giỏ hàng theo giá và tồn kho hiện tại. Bạn sẽ kiểm tra lại giỏ hàng, địa chỉ và phương thức thanh toán trước khi tạo đơn mới.</p>}
                    {error && <p className="alert alert-danger mt-3 mb-0" role="alert">{error}</p>}
                </Modal.Body>
                <Modal.Footer>
                    <button type="button" className="btn btn-outline-secondary" disabled={busy} onClick={() => setDialog(null)}>Quay lại</button>
                    <button type="button" className={`btn ${dialog === "cancel" ? "btn-danger" : "btn-primary"}`} disabled={busy} onClick={() => { void confirm(); }}>
                        {busy ? "Đang xử lý…" : dialog === "cancel" ? "Xác nhận hủy đơn" : "Cập nhật giỏ hàng"}
                    </button>
                </Modal.Footer>
            </Modal>
        </section>
    );
}
