import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import Modal from "react-bootstrap/Modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRotateLeft, faCreditCard, faRotate, faXmark } from "@fortawesome/free-solid-svg-icons";
import { orderService, type OrderResponse } from "../../api/OrderService";
import { useCart } from "../../api/CartContext";
import { canCancelOrder, getOrderError } from "../../data/orderDetailsData";
import { ROUTES } from "../../routes/routes";

interface OrderActionsProps {
    order: OrderResponse;
    onRefresh: () => void;
}

export default function OrderActions({ order, onRefresh }: OrderActionsProps) {
    const navigate = useNavigate();
    const { applyCart, showCartNotice } = useCart();
    const [showReorder, setShowReorder] = useState(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const submitting = useRef(false);
    const canPay = order.paymentMethod === "VNPAY" && order.status === "PENDING_PAYMENT"
        && ["PENDING", "FAILED"].includes(order.paymentStatus ?? "PENDING");
    const canReorder = order.items.length > 0
        && ["DELIVERED", "CANCELLED", "RETURNED", "REFUNDED"].includes(order.status);

    async function confirm() {
        if (!showReorder || submitting.current) return;
        submitting.current = true;
        setBusy(true);
        setError("");
        try {
            const cart = await orderService.reorder(order.id);
            applyCart(cart);
            showCartNotice("Đã cập nhật giỏ hàng theo giá và tồn kho hiện tại. Vui lòng kiểm tra trước khi thanh toán.");
            navigate(ROUTES.CART);
        } catch (cause) {
            setError(getOrderError(cause, "Chưa thể thực hiện thao tác. Vui lòng kiểm tra lại trạng thái đơn và thử lại."));
        } finally {
            submitting.current = false;
            setBusy(false);
        }
    }

    return (
        <section className="order-details-actions" aria-label="Thao tác đơn hàng">
            <div className="d-flex flex-wrap gap-2">
                {canPay && <Link className="btn order-detail-button order-detail-button-primary order-details-pay" to={`${ROUTES.VNPAY_RESULT}?orderId=${order.id}`}>
                    <FontAwesomeIcon icon={faCreditCard} aria-hidden="true" /> Tiếp tục thanh toán
                </Link>}
                {canReorder && <button type="button" className="btn order-detail-button order-detail-button-primary" disabled={busy} onClick={() => { setError(""); setShowReorder(true); }}>
                    <FontAwesomeIcon icon={faArrowRotateLeft} aria-hidden="true" /> Đặt lại đơn
                </button>}
                {canCancelOrder(order) && <Link className="btn order-detail-button order-detail-button-danger" to={ROUTES.ORDER_CANCEL.replace(":id", String(order.id))}>
                    <FontAwesomeIcon icon={faXmark} aria-hidden="true" /> Hủy đơn hàng
                </Link>}
                <button type="button" className="btn order-detail-button order-details-refresh" disabled={busy} onClick={onRefresh}>
                    <FontAwesomeIcon icon={faRotate} aria-hidden="true" /> Cập nhật trạng thái
                </button>
            </div>
            <Modal show={showReorder} onHide={() => { if (!busy) setShowReorder(false); }} centered
                className="account-modal account-modal-compact" backdrop={busy ? "static" : true} keyboard={!busy}
                aria-labelledby="order-action-title" aria-describedby="order-action-description">
                <Modal.Header closeButton={!busy} closeLabel="Đóng">
                    <Modal.Title as="h2" id="order-action-title">Đặt lại đơn hàng</Modal.Title>
                </Modal.Header>
                <Modal.Body aria-busy={busy}>
                    <p id="order-action-description" className="text-secondary mb-0">Sản phẩm sẽ được cập nhật vào giỏ hàng theo giá và tồn kho hiện tại. Vui lòng kiểm tra lại trước khi đặt đơn mới.</p>
                    {error && <p className="alert alert-danger mt-3 mb-0" role="alert">{error}</p>}
                </Modal.Body>
                <Modal.Footer className="border-0 pt-0">
                    <button type="button" className="btn btn-light border account-button m-0" disabled={busy} onClick={() => setShowReorder(false)} autoFocus>Quay lại</button>
                    <button type="button" className="btn btn-primary account-button m-0" disabled={busy} onClick={() => { void confirm(); }}>
                        {busy ? "Đang xử lý…" : "Cập nhật giỏ hàng"}
                    </button>
                </Modal.Footer>
            </Modal>
        </section>
    );
}
