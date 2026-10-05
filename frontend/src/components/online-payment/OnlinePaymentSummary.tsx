import { Link } from "react-router";
import type { CartItem } from "../../data/cartData";
import { checkoutTotals } from "../../data/checkoutData";
import { onlinePaymentInfo } from "../../data/onlinePaymentData";

interface OnlinePaymentSummaryProps {
    items: CartItem[];
}

const currencyFormatter = new Intl.NumberFormat("vi-VN");

function formatPrice(price: number) {
    return `${currencyFormatter.format(price)}đ`;
}

export default function OnlinePaymentSummary({ items }: OnlinePaymentSummaryProps) {
    const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);
    const total = subtotal - checkoutTotals.discount + checkoutTotals.shippingFee;

    return (
        <aside className="online-payment-summary-card">
            <div className="online-payment-summary-heading">
                <h2>Thông tin đơn hàng</h2>
                <span>{onlinePaymentInfo.orderCode}</span>
            </div>

            <div className="online-payment-summary-products">
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

            <div className="online-payment-summary-adjustments">
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
            </div>

            <div className="online-payment-summary-total">
                <span>Cần thanh toán</span>
                <strong>{formatPrice(total)}</strong>
            </div>

            <div className="d-grid gap-2">
                <button className="btn online-payment-confirm-btn" type="button">
                    Tôi đã thanh toán
                </button>
                <Link to="/checkout" className="btn online-payment-back-btn">
                    Đổi phương thức thanh toán
                </Link>
            </div>
        </aside>
    );
}
