import type { PaymentMethod } from "../../data/checkoutData";

interface PaymentMethodListProps {
    methods: PaymentMethod[];
    selectedMethodId: PaymentMethod["id"];
    onSelectMethod: (methodId: PaymentMethod["id"]) => void;
    vnpayAvailable: boolean;
    vnpayMessage: string;
}

export default function PaymentMethodList({
    methods,
    selectedMethodId,
    onSelectMethod,
    vnpayAvailable,
    vnpayMessage,
}: PaymentMethodListProps) {
    return (
        <section className="bg-white rounded-4 border shadow-sm p-4 mb-4" aria-labelledby="checkout-payment-title">
            {/* Header mục thanh toán - Sạch sẽ */}
            <div className="pb-3 mb-3 border-bottom">
                <h2 id="checkout-payment-title" className="h6 fw-bold text-dark mb-0.5">
                    Phương thức thanh toán
                </h2>
                <span className="text-muted" style={{ fontSize: "12.5px" }}>Chọn hình thức thanh toán phù hợp với bạn</span>
            </div>

            <div className="d-flex flex-column gap-2.5 mb-3">
                {methods.map((method) => {
                    const isSelected = method.id === selectedMethodId;
                    const isVnPay = method.type === "vnpay";
                    const isDisabled = isVnPay && !vnpayAvailable;

                    return (
                        <label
                            key={method.id}
                            className={`p-3 rounded-3 border d-flex align-items-center justify-content-between gap-3 transition-all cursor-pointer ${
                                isSelected
                                    ? "bg-light border-dark shadow-xs"
                                    : "bg-white hover-bg-light"
                            } ${isDisabled ? "opacity-50" : ""}`}
                            style={{
                                cursor: isDisabled ? "not-allowed" : "pointer",
                                borderColor: isSelected ? "var(--color-primary, #e11d48)" : undefined,
                            }}
                        >
                            <div className="d-flex align-items-center gap-3">
                                <input
                                    type="radio"
                                    name="paymentMethod"
                                    className="form-check-input mt-0"
                                    checked={isSelected}
                                    disabled={isDisabled}
                                    onChange={() => onSelectMethod(method.id)}
                                />
                                <div>
                                    <strong className="d-block text-dark fw-bold mb-0.5" style={{ fontSize: "14px" }}>
                                        {method.name}
                                    </strong>
                                    <p className="text-muted mb-0" style={{ fontSize: "12.5px" }}>
                                        {isVnPay && !vnpayAvailable ? vnpayMessage : method.description}
                                    </p>
                                </div>
                            </div>
                        </label>
                    );
                })}
            </div>

            <p className="text-muted mb-0 pt-1" style={{ fontSize: "12.5px" }}>
                * Với thanh toán khi nhận hàng (COD), bạn chỉ thanh toán tiền mặt sau khi đã nhận và kiểm tra kiện hàng.
            </p>
        </section>
    );
}
