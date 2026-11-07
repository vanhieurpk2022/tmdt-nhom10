import { Link } from "react-router";
import {
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
    return `${currencyFormatter.format(price)} ₫`;
}

export default function OrderSuccessSummary({ order }: OrderSuccessSummaryProps) {
    const subtotal = order.subtotalPrice;
    const paymentMethod = getPaymentMethodLabel(order.paymentMethod);

    return (
        <aside className="order-success-summary">
            <h2>Thông tin thanh toán</h2>

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
                    <strong className={["PAID", "REFUNDED"].includes(order.paymentStatus ?? "") ? "text-success" : undefined}>{getPaymentStatusLabel(order)}</strong>
                </div>
            </div>

            <div className="order-success-summary-total">
                <span>Tổng thanh toán</span>
                <strong>{formatPrice(order.totalPrice)}</strong>
            </div>

            <div className="order-success-actions d-grid gap-2">
                <Link to={ROUTES.ORDERS} className="btn order-detail-button">
                    Xem lịch sử mua hàng
                </Link>
                <Link to={ROUTES.HOME} className="btn order-detail-button">
                    Tiếp tục mua sắm
                </Link>
            </div>
        </aside>
    );
}
