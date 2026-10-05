import { Link } from "react-router";
import type { CartItem } from "../../data/cartData";
import { checkoutTotals } from "../../data/checkoutData";
import { orderSuccessInfo } from "../../data/orderSuccessData";

interface OrderSuccessSummaryProps {
    items: CartItem[];
}

const currencyFormatter = new Intl.NumberFormat("vi-VN");

function formatPrice(price: number) {
    return `${currencyFormatter.format(price)}đ`;
}

export default function OrderSuccessSummary({ items }: OrderSuccessSummaryProps) {
    const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);
    const total = subtotal - checkoutTotals.discount + checkoutTotals.shippingFee;

    return (
        <aside className="order-success-summary">
            <h2>Tóm tắt đơn hàng</h2>

            <div className="order-success-summary-code">
                <span>Mã đơn hàng</span>
                <strong>{orderSuccessInfo.orderCode}</strong>
            </div>

            <div className="order-success-summary-lines">
                <div>
                    <span>Tạm tính</span>
                    <strong>{formatPrice(subtotal)}</strong>
                </div>
                <div>
                    <span>Giảm giá</span>
                    <strong>-{formatPrice(checkoutTotals.discount)}</strong>
                </div>
                <div>
                    <span>Phí vận chuyển</span>
                    <strong>{formatPrice(checkoutTotals.shippingFee)}</strong>
                </div>
                <div>
                    <span>Phương thức</span>
                    <strong>{orderSuccessInfo.paymentMethod}</strong>
                </div>
            </div>

            <div className="order-success-summary-total">
                <span>Tổng thanh toán</span>
                <strong>{formatPrice(total)}</strong>
            </div>

            <div className="order-success-actions d-grid gap-2 mx-auto">
                <Link to="/orders" className="btn order-success-primary-btn fw-bold">
                    Xem lịch sử mua hàng
                </Link>
                <Link to="/" className="btn order-success-secondary-btn fw-bold">
                    Tiếp tục mua sắm
                </Link>
            </div>
        </aside>
    );
}
