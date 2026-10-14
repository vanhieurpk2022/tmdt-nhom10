import { Link } from "react-router";
import {
    formatOrderCode,
    getPaymentMethodLabel,
    type OrderResponse,
} from "../../api/OrderService";
import type { CartItem } from "../../data/cartData";
import { checkoutTotals } from "../../data/checkoutData";
import { orderSuccessInfo } from "../../data/orderSuccessData";
import { ROUTES } from "../../routes/routes";

interface OrderSuccessSummaryProps {
    items: CartItem[];
    order?: OrderResponse;
}

const currencyFormatter = new Intl.NumberFormat("vi-VN");

function formatPrice(price: number) {
    return `${currencyFormatter.format(price)}đ`;
}

export default function OrderSuccessSummary({ items, order }: OrderSuccessSummaryProps) {
    const subtotal = order?.subtotalPrice ?? items.reduce((total, item) => total + item.price * item.quantity, 0);
    const discount = order?.discountAmount ?? checkoutTotals.discount;
    const shippingFee = order?.shippingFee ?? checkoutTotals.shippingFee;
    const total = order?.totalPrice ?? subtotal - discount + shippingFee;
    const orderCode = order ? formatOrderCode(order.id) : orderSuccessInfo.orderCode;
    const paymentMethod = order ? getPaymentMethodLabel(order.paymentMethod) : orderSuccessInfo.paymentMethod;

    return (
        <aside className="order-success-summary">
            <h2>Tóm tắt đơn hàng</h2>

            <div className="order-success-summary-code">
                <span>Mã đơn hàng</span>
                <strong>{orderCode}</strong>
            </div>

            <div className="order-success-summary-lines">
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
                <div>
                    <span>Phương thức</span>
                    <strong>{paymentMethod}</strong>
                </div>
            </div>

            <div className="order-success-summary-total">
                <span>Tổng thanh toán</span>
                <strong>{formatPrice(total)}</strong>
            </div>

            <div className="order-success-actions d-grid gap-2 mx-auto">
                <Link to={ROUTES.ORDERS} className="btn order-success-primary-btn fw-bold">
                    Xem lịch sử mua hàng
                </Link>
                <Link to={ROUTES.HOME} className="btn order-success-secondary-btn fw-bold">
                    Tiếp tục mua sắm
                </Link>
            </div>
        </aside>
    );
}
