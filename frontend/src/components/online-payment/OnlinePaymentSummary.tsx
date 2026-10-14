import { Link } from "react-router";
import {
    formatOrderCode,
    type OrderResponse,
} from "../../api/OrderService";
import type { CartItem } from "../../data/cartData";
import { checkoutTotals } from "../../data/checkoutData";
import { onlinePaymentInfo } from "../../data/onlinePaymentData";
import { ROUTES } from "../../routes/routes";

interface OnlinePaymentSummaryProps {
    items: CartItem[];
    order?: OrderResponse;
}

const currencyFormatter = new Intl.NumberFormat("vi-VN");

function formatPrice(price: number) {
    return `${currencyFormatter.format(price)}đ`;
}

export default function OnlinePaymentSummary({ items, order }: OnlinePaymentSummaryProps) {
    const subtotal = order?.subtotalPrice ?? items.reduce((total, item) => total + item.price * item.quantity, 0);
    const discount = order?.discountAmount ?? checkoutTotals.discount;
    const shippingFee = order?.shippingFee ?? checkoutTotals.shippingFee;
    const total = order?.totalPrice ?? subtotal - discount + shippingFee;
    const orderCode = order ? formatOrderCode(order.id) : onlinePaymentInfo.orderCode;

    return (
        <aside className="online-payment-summary-card">
            <div className="online-payment-summary-heading d-flex align-items-start justify-content-between">
                <h2>Thông tin đơn hàng</h2>
                <span>{orderCode}</span>
            </div>

            <div className="online-payment-summary-products d-flex flex-column">
                {items.map((item) => (
                    <div className="online-payment-summary-line" key={item.id}>
                        <img src={item.image} alt={item.name} />
                        <div>
                            <p>{item.name}</p>
                            <small>Số lượng: {item.quantity}</small>
                        </div>
                        <strong>{formatPrice(item.price * item.quantity)}</strong>
                    </div>
                ))}
            </div>

            <div className="online-payment-summary-adjustments d-flex flex-column">
                <div>
                    <span>Tạm tính</span>
                    <strong>{formatPrice(subtotal)}</strong>
                </div>
                <div>
                    <span>Giảm giá</span>
                    <strong>-{formatPrice(discount)}</strong>
                </div>
                <div>
                    <span>Phí vận chuyển</span>
                    <strong>{formatPrice(shippingFee)}</strong>
                </div>
            </div>

            <div className="online-payment-summary-total">
                <span>Cần thanh toán</span>
                <strong>{formatPrice(total)}</strong>
            </div>

            <div className="d-grid gap-2">
                <Link to={ROUTES.ORDER_SUCCESS} state={{ order }} className="btn online-payment-confirm-btn fw-bold w-100">
                    Tôi đã thanh toán
                </Link>
                <Link to={ROUTES.CHECKOUT} className="btn online-payment-back-btn fw-bold w-100">
                    Đổi phương thức thanh toán
                </Link>
            </div>
        </aside>
    );
}
