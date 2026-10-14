import { faMoneyBillWave, faShieldHalved, faWallet } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { PaymentMethod } from "../../data/checkoutData";
import CheckoutSectionTitle from "./CheckoutSectionTitle";

interface PaymentMethodListProps {
    methods: PaymentMethod[];
    selectedMethodId: PaymentMethod["id"];
    onSelectMethod: (methodId: PaymentMethod["id"]) => void;
}

const methodIcons = {
    cod: faMoneyBillWave,
    vnpay: faWallet,
} satisfies Record<PaymentMethod["type"], typeof faMoneyBillWave>;

export default function PaymentMethodList({ methods, selectedMethodId, onSelectMethod }: PaymentMethodListProps) {
    return (
        <section className="checkout-block">
            <CheckoutSectionTitle index={3} title="Chọn phương thức thanh toán" />

            <div className="checkout-payment-list d-flex flex-column">
                {methods.map((method) => (
                    <label className={`checkout-payment-option ${method.id === selectedMethodId ? "active" : ""}`} key={method.id}>
                        <input
                            type="radio"
                            name="paymentMethod"
                            checked={method.id === selectedMethodId}
                            onChange={() => onSelectMethod(method.id)}
                        />
                        <span className="checkout-payment-check" />
                        <div>
                            <strong>{method.name}</strong>
                            <p>{method.description}</p>
                        </div>
                        <span className={`checkout-payment-mark ${method.type}`}>
                            <FontAwesomeIcon icon={methodIcons[method.type]} />
                        </span>
                    </label>
                ))}
            </div>

            <div className="checkout-security-note d-flex align-items-center">
                <span className="d-inline-flex align-items-center justify-content-center">
                    <FontAwesomeIcon icon={faShieldHalved} />
                </span>
                <div>
                    <strong>Thanh toán qua VNPay an toàn, tiện lợi</strong>
                    <p>Với COD, bạn chỉ thanh toán tiền mặt sau khi đã nhận và kiểm tra hàng.</p>
                </div>
            </div>
        </section>
    );
}
