import { Link } from "react-router";
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
                    <span>Phí vận chuyển</span>
                    <strong>{formatPrice(order.shippingFee)}</strong>
                </div>
                <div>
                    <span>Phương thức</span>
                    <strong>{paymentMethod}</strong>
                </div>
                <div>
                    <span>Trạng thái thanh toán</span>
                    <strong>{getPaymentStatusLabel(order)}</strong>
                </div>
            </div>

            <div className="order-success-summary-total">
                <span>Tổng thanh toán</span>
                <strong>{formatPrice(order.totalPrice)}</strong>
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
