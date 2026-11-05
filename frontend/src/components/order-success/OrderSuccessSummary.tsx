import { Link } from "react-router";
import {
    faBagShopping,
    faCreditCard,
    faListUl,
    faMoneyBill1Wave,
    faReceipt,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    formatOrderCode,
    getPaymentMethodLabel,
    getPaymentStatusLabel,
    type OrderResponse,
} from "../../api/OrderService";
import { ROUTES } from "../../routes/routes";

interface OrderSuccessSummaryProps {
    order: OrderResponse;
}

const currencyFormatter = new Intl.NumberFormat("vi-VN");

function formatPrice(price: number) {
    return `${currencyFormatter.format(price)}đ`;
}

export default function OrderSuccessSummary({ order }: OrderSuccessSummaryProps) {
    const subtotal = order.subtotalPrice;
    const orderCode = formatOrderCode(order.id);
    const paymentMethod = getPaymentMethodLabel(order.paymentMethod);
    const paymentStatusText = getPaymentStatusLabel(order);

    const isPaid = order.paymentStatus === "PAID";
    const isRefundPending = order.paymentStatus === "REFUND_PENDING";
    const isRefunded = order.paymentStatus === "REFUNDED";

    return (
        <aside className="bg-white rounded-4 border shadow-sm p-4 mb-4" aria-labelledby="order-summary-title">
            <div className="d-flex align-items-center justify-content-between pb-3 mb-3 border-bottom">
                <div className="d-flex align-items-center gap-2">
                    <div className="rounded-circle d-flex align-items-center justify-content-center bg-primary bg-opacity-10 text-primary" style={{ width: "36px", height: "36px" }}>
                        <FontAwesomeIcon icon={faReceipt} className="fs-7" />
                    </div>
                    <h2 id="order-summary-title" className="fs-6 fw-bold text-dark mb-0">
                        Tóm tắt đơn hàng
                    </h2>
                </div>

                <span className="badge bg-light text-secondary border rounded-pill px-2 py-1 fs-8 fw-bold">
                    #{orderCode}
                </span>
            </div>

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
                    <span className="d-inline-flex align-items-center gap-1 fw-bold text-dark">
                        <FontAwesomeIcon
                            icon={order.paymentMethod === "VNPAY" ? faCreditCard : faMoneyBill1Wave}
                            className={order.paymentMethod === "VNPAY" ? "text-primary fs-8" : "text-success fs-8"}
                        />
                        <span>{paymentMethod}</span>
                    </span>
                </div>

                <div className="d-flex align-items-center justify-content-between text-muted">
                    <span>Thanh toán</span>
                    <span className={`badge rounded-pill px-2 py-1 fs-8 fw-bold ${
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

            <div className="d-flex align-items-baseline justify-content-between mb-4">
                <div>
                    <span className="fs-7 fw-bold text-dark d-block">Tổng thanh toán</span>
                    <span className="fs-9 text-muted d-block">Đã gồm VAT & phí giao hàng</span>
                </div>
                <strong className="fs-4 fw-black text-primary">
                    {formatPrice(order.totalPrice)}
                </strong>
            </div>

            <div className="d-flex flex-column gap-2">
                <Link
                    to={ROUTES.ORDERS}
                    className="btn btn-dark rounded-pill py-2 fw-bold fs-7 d-inline-flex align-items-center justify-content-center gap-2 transition-all shadow-xs"
                >
                    <FontAwesomeIcon icon={faListUl} className="fs-8" />
                    <span>Lịch sử đơn hàng</span>
                </Link>

                <Link
                    to={ROUTES.PRODUCTS}
                    className="btn btn-outline-secondary rounded-pill py-2 fw-bold fs-7 d-inline-flex align-items-center justify-content-center gap-2 hover-border-dark"
                >
                    <FontAwesomeIcon icon={faBagShopping} className="fs-8" />
                    <span>Tiếp tục mua sắm</span>
                </Link>
            </div>
        </aside>
    );
}
