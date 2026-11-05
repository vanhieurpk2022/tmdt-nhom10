import { faCreditCard, faMoneyBillWave, faShieldHalved } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
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
            {/* Header mục thanh toán */}
            <div className="d-flex align-items-center gap-2.5 pb-3 mb-3 border-bottom">
                <div className="rounded-circle d-flex align-items-center justify-content-center bg-primary bg-opacity-10 text-primary fw-bold" style={{ width: "32px", height: "32px", fontSize: "14px" }}>
                    3
                </div>
                <div>
                    <h2 id="checkout-payment-title" className="h6 fw-bold text-dark mb-0">
                        Phương thức thanh toán
                    </h2>
                    <span className="text-muted" style={{ fontSize: "12.5px" }}>Chọn hình thức thanh toán phù hợp với bạn</span>
                </div>
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
                                    ? "bg-primary bg-opacity-10 border-primary shadow-xs"
                                    : "bg-light bg-opacity-50 hover-bg-light"
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

                            <div className="rounded-circle d-flex align-items-center justify-content-center bg-white border flex-shrink-0" style={{ width: "38px", height: "38px" }}>
                                <FontAwesomeIcon
                                    icon={isVnPay ? faCreditCard : faMoneyBillWave}
                                    className={isVnPay ? "text-primary fs-6" : "text-success fs-6"}
                                />
                            </div>
                        </label>
                    );
                })}
            </div>

            <div className="p-3 rounded-3 bg-light bg-opacity-75 border d-flex align-items-center gap-2.5 text-muted" style={{ fontSize: "12.5px" }}>
                <FontAwesomeIcon icon={faShieldHalved} className="text-success fs-7 flex-shrink-0" />
                <span>
                    Với thanh toán khi nhận hàng (COD), bạn chỉ thanh toán tiền mặt sau khi đã nhận và kiểm tra kiện hàng.
                </span>
            </div>
        </section>
    );
}
