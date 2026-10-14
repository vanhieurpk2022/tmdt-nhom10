import { faChevronDown, faTag } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router";
import type { CartItem } from "../../data/cartData";
import { checkoutTotals } from "../../data/checkoutData";

interface CheckoutSummaryProps {
    items: CartItem[];
    isLoading?: boolean;
    hasAddress?: boolean;
}

const currencyFormatter = new Intl.NumberFormat("vi-VN");

function formatPrice(price: number) {
    return `${currencyFormatter.format(price)}đ`;
}

export default function CheckoutSummary({ items, isLoading = false, hasAddress = true }: CheckoutSummaryProps) {
    const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);
    const originalSubtotal = items.reduce((total, item) => total + (item.basePrice ?? item.price) * item.quantity, 0);
    const productDiscount = Math.max(originalSubtotal - subtotal, 0);
    const shippingFee = items.length > 0 ? checkoutTotals.shippingFee : 0;
    const total = subtotal + shippingFee;
    const isDisabled = isLoading || items.length === 0 || !hasAddress;

    return (
        <aside className="checkout-summary-card">
            <h2>Xác nhận</h2>

            <div className="checkout-summary-products">
                <span>Sản phẩm</span>
                {items.length > 0 ? (
                    items.map((item) => (
                        <div className="checkout-summary-line" key={item.id}>
                            <p>{item.name}</p>
                            <strong>{formatPrice(item.price * item.quantity)}</strong>
                        </div>
                    ))
                ) : (
                    <p className="checkout-summary-empty">Chọn sản phẩm trong giỏ hàng để tiếp tục đặt hàng.</p>
                )}
            </div>

            <button className="checkout-promo-select" type="button">
                <span>
                    <FontAwesomeIcon icon={faTag} />
                    Chọn mã khuyến mãi
                </span>
                <FontAwesomeIcon icon={faChevronDown} />
            </button>

            <div className="checkout-summary-adjustments">
                <div>
                    <span>Tạm tính</span>
                    <strong>{formatPrice(subtotal)}</strong>
                </div>
                {productDiscount > 0 && (
                    <div>
                        <span>Ưu đãi sản phẩm</span>
                        <strong>-{formatPrice(productDiscount)}</strong>
                    </div>
                )}
                <div>
                    <span>Phí vận chuyển</span>
                    <strong>{formatPrice(shippingFee)}</strong>
                </div>
            </div>

            <div className="checkout-summary-total">
                <span>Tổng tiền</span>
                <strong>{formatPrice(total)}</strong>
            </div>

            <Link
                to="/online-payment"
                className={`btn checkout-continue-btn d-flex align-items-center justify-content-center fw-bold w-100 ${isDisabled ? "disabled" : ""}`}
            >
                Tiếp tục
            </Link>
        </aside>
    );
}
