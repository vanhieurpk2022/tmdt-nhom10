import type { CartItem } from "../../data/cartData";

interface CheckoutSummaryProps {
    items: CartItem[];
    shippingFee: number;
    isLoading?: boolean;
    isShippingFeeLoading?: boolean;
    shippingFeeError?: string;
    isSubmitting?: boolean;
    hasAddress?: boolean;
    paymentUnavailable?: boolean;
    onContinue: () => void;
}

const currencyFormatter = new Intl.NumberFormat("vi-VN");

function formatPrice(price: number) {
    return `${currencyFormatter.format(price)}₫`;
}

export default function CheckoutSummary({
    items,
    shippingFee,
    isLoading = false,
    isShippingFeeLoading = false,
    shippingFeeError = "",
    isSubmitting = false,
    hasAddress = true,
    paymentUnavailable = false,
    onContinue,
}: CheckoutSummaryProps) {
    const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);
    const total = subtotal + shippingFee;
    const isDisabled = isLoading || isShippingFeeLoading || isSubmitting || paymentUnavailable || items.length === 0 || !hasAddress || Boolean(shippingFeeError);

    return (
        <aside className="bg-white rounded-4 border shadow-sm p-4 mb-4" aria-labelledby="checkout-summary-title">
            {/* Header sạch sẽ, không icon tròn rườm rà */}
            <div className="d-flex align-items-center justify-content-between pb-3 mb-3 border-bottom">
                <div>
                    <h2 id="checkout-summary-title" className="h6 fw-bold text-dark mb-0.5">
                        Chi tiết đơn hàng
                    </h2>
                    <span className="text-muted" style={{ fontSize: "12.5px" }}>Tóm tắt chi phí thanh toán</span>
                </div>

                <span className="badge bg-light text-dark border rounded-pill px-2.5 py-1 fw-semibold" style={{ fontSize: "12px" }}>
                    {items.length} món
                </span>
            </div>

            {/* Danh sách tóm lược sản phẩm */}
            <div className="d-flex flex-column gap-2 mb-3 max-h-48 overflow-y-auto pe-1" style={{ fontSize: "13.5px" }}>
                {items.length > 0 ? (
                    items.map((item) => (
                        <div className="d-flex align-items-center justify-content-between text-muted py-1" key={item.id}>
                            <div className="d-flex align-items-center gap-2 text-truncate me-2">
                                <span className="text-muted fw-semibold" style={{ fontSize: "12px" }}>x{item.quantity}</span>
                                <span className="text-dark text-truncate" title={item.name}>{item.name}</span>
                            </div>
                            <strong className="text-dark fw-semibold text-nowrap">{formatPrice(item.price * item.quantity)}</strong>
                        </div>
                    ))
                ) : (
                    <p className="text-muted text-center py-2 mb-0" style={{ fontSize: "13px" }}>Chưa chọn sản phẩm nào.</p>
                )}
            </div>

            <hr className="my-3 opacity-25" />

            {/* Chiết tính */}
            <div className="d-flex flex-column gap-2.5 mb-3" style={{ fontSize: "13.5px" }}>
                <div className="d-flex align-items-center justify-content-between text-muted">
                    <span>Tạm tính</span>
                    <strong className="text-dark fw-semibold">{formatPrice(subtotal)}</strong>
                </div>

                <div className="d-flex align-items-center justify-content-between text-muted">
                    <span>Phí vận chuyển</span>
                    <strong className={`fw-semibold ${shippingFeeError ? "text-danger" : "text-dark"}`}>
                        {isShippingFeeLoading ? (
                            <span className="text-muted fw-normal" style={{ fontSize: "12.5px" }}>Đang tính phí GHN…</span>
                        ) : shippingFeeError ? (
                            "Chưa tính được"
                        ) : (
                            formatPrice(shippingFee)
                        )}
                    </strong>
                </div>
            </div>

            {shippingFeeError && (
                <div className="p-2.5 rounded-3 bg-danger bg-opacity-10 border border-danger border-opacity-25 text-danger mb-3" style={{ fontSize: "12.5px" }}>
                    {shippingFeeError}
                </div>
            )}

            <hr className="my-3 opacity-25" />

            {/* Tổng tiền */}
            <div className="d-flex align-items-baseline justify-content-between mb-4">
                <div>
                    <span className="fw-semibold text-dark d-block" style={{ fontSize: "14px" }}>Tổng thanh toán</span>
                    <span className="text-muted d-block" style={{ fontSize: "11.5px" }}>Đã bao gồm VAT & phí vận chuyển</span>
                </div>
                <strong className="fw-bold" style={{ fontSize: "21px", color: "var(--color-primary, #e11d48)" }}>
                    {formatPrice(total)}
                </strong>
            </div>

            {/* Nút đặt hàng chuẩn màu Oilia */}
            <button
                className="btn w-100 rounded-pill py-3 fw-bold fs-7 d-inline-flex align-items-center justify-content-center shadow-sm text-white transition-all"
                style={{
                    backgroundColor: "var(--color-primary, #e11d48)",
                    borderColor: "var(--color-primary, #e11d48)",
                    cursor: isDisabled ? "not-allowed" : "pointer",
                    opacity: isDisabled ? 0.65 : 1,
                }}
                type="button"
                disabled={isDisabled}
                onClick={onContinue}
            >
                <span>{isSubmitting ? "Đang xử lý đặt hàng…" : "Xác nhận đặt hàng"}</span>
            </button>

            {/* Thông báo bảo mật tinh tế */}
            <p className="text-center text-muted mb-0 mt-3" style={{ fontSize: "12px" }}>
                Thông tin thanh toán được bảo mật 100%
            </p>
        </aside>
    );
}
