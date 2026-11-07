import type { CartItem } from "../../data/cartData";
import type { PaymentMethod } from "../../data/checkoutData";

interface CheckoutSummaryProps {
    items: CartItem[];
    shippingFee: number;
    isLoading?: boolean;
    isShippingFeeLoading?: boolean;
    shippingFeeError?: string;
    isSubmitting?: boolean;
    hasAddress?: boolean;
    paymentMethod: PaymentMethod["id"];
    paymentUnavailable?: boolean;
    onContinue: () => void;
}

const currencyFormatter = new Intl.NumberFormat("vi-VN");

function formatPrice(price: number) {
    return `${currencyFormatter.format(price)} ₫`;
}

export default function CheckoutSummary({
    items,
    shippingFee,
    isLoading = false,
    isShippingFeeLoading = false,
    shippingFeeError = "",
    isSubmitting = false,
    hasAddress = true,
    paymentMethod,
    paymentUnavailable = false,
    onContinue,
}: CheckoutSummaryProps) {
    const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);
    const total = subtotal + shippingFee;
    const isDisabled = isLoading || isShippingFeeLoading || isSubmitting || paymentUnavailable || items.length === 0 || !hasAddress || Boolean(shippingFeeError);

    return (
        <aside className="checkout-summary-card">
            <div className="checkout-summary-heading">
                <h2>Tóm tắt đơn hàng</h2>
                <span>{items.length} sản phẩm</span>
            </div>

            <div className="checkout-summary-products">
                {items.length > 0 ? (
                    items.map((item) => (
                        <div className="checkout-summary-line" key={item.id}>
                            <div>
                                <p>{item.name}</p>
                                <small>{item.variant} · SL: {item.quantity}</small>
                            </div>
                            <strong>{formatPrice(item.price * item.quantity)}</strong>
                        </div>
                    ))
                ) : (
                    <p className="checkout-summary-empty">Chọn sản phẩm trong giỏ hàng để tiếp tục đặt hàng.</p>
                )}
            </div>

            <div className="checkout-summary-adjustments">
                <div>
                    <span>Tạm tính</span>
                    <strong>{formatPrice(subtotal)}</strong>
                </div>
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
                className="btn checkout-continue-btn"
                type="button"
                disabled={isDisabled}
                onClick={onContinue}
            >
                {isSubmitting ? "Đang tạo đơn..." : paymentMethod === "vnpay" ? "Thanh toán VNPay" : "Đặt hàng"}
            </button>
            <p className="checkout-summary-note">
                {paymentMethod === "vnpay" ? "Bạn sẽ được chuyển đến VNPay để thanh toán." : "Thanh toán bằng tiền mặt khi nhận hàng."}
            </p>
        </aside>
    );
}
