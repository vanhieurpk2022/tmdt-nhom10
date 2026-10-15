import { faChevronDown, faTag } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { CartItem } from "../../data/cartData";

interface CheckoutSummaryProps {
    items: CartItem[];
    shippingFee: number;
    isLoading?: boolean;
    isShippingFeeLoading?: boolean;
    shippingFeeError?: string;
    isSubmitting?: boolean;
    hasAddress?: boolean;
    onContinue: () => void;
}

const currencyFormatter = new Intl.NumberFormat("vi-VN");

function formatPrice(price: number) {
    return `${currencyFormatter.format(price)}đ`;
}

export default function CheckoutSummary({
    items,
    shippingFee,
    isLoading = false,
    isShippingFeeLoading = false,
    shippingFeeError = "",
    isSubmitting = false,
    hasAddress = true,
    onContinue,
}: CheckoutSummaryProps) {
    const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);
    const originalSubtotal = items.reduce((total, item) => total + (item.basePrice ?? item.price) * item.quantity, 0);
    const productDiscount = Math.max(originalSubtotal - subtotal, 0);
    const total = subtotal + shippingFee;
    const isDisabled = isLoading || isShippingFeeLoading || isSubmitting || items.length === 0 || !hasAddress || Boolean(shippingFeeError);

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
                    <strong>{formatPrice(originalSubtotal)}</strong>
                </div>
                {productDiscount > 0 && (
                    <div>
                        <span>Ưu đãi sản phẩm</span>
                        <strong>-{formatPrice(productDiscount)}</strong>
                    </div>
                )}
                <div>
                    <span>Phí vận chuyển</span>
                    <strong className={shippingFeeError ? "text-danger" : ""}>
                        {isShippingFeeLoading ? "Đang tính..." : shippingFeeError ? "Chưa tính được" : formatPrice(shippingFee)}
                    </strong>
                </div>
            </div>

            {shippingFeeError && (
                <p className="checkout-summary-empty text-danger mb-3">{shippingFeeError}</p>
            )}

            <div className="checkout-summary-total">
                <span>Tổng tiền</span>
                <strong>{formatPrice(total)}</strong>
            </div>

            <button
                className="btn checkout-continue-btn d-flex align-items-center justify-content-center fw-bold w-100"
                type="button"
                disabled={isDisabled}
                onClick={onContinue}
            >
                {isSubmitting ? "Đang tạo đơn..." : "Tiếp tục"}
            </button>
        </aside>
    );
}
