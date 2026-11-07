import { faMoneyBillWave, faShieldHalved, faWallet } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { PaymentMethod } from "../../data/checkoutData";
import CheckoutSectionTitle from "./CheckoutSectionTitle";

interface PaymentMethodListProps {
    methods: PaymentMethod[];
    selectedMethodId: PaymentMethod["id"];
    onSelectMethod: (methodId: PaymentMethod["id"]) => void;
    vnpayAvailable: boolean;
    vnpayMessage: string;
}

const methodIcons = {
    cod: faMoneyBillWave,
    vnpay: faWallet,
} satisfies Record<PaymentMethod["type"], typeof faMoneyBillWave>;

export default function PaymentMethodList({ methods, selectedMethodId, onSelectMethod, vnpayAvailable, vnpayMessage }: PaymentMethodListProps) {
    return (
        <section className="checkout-block">
            <CheckoutSectionTitle index={3} title="Phương thức thanh toán" />

            <div className="checkout-payment-list d-flex flex-column">
                {methods.map((method) => (
                    <label className={`checkout-payment-option ${method.id === selectedMethodId ? "active" : ""}`} key={method.id}>
                        <input
                            type="radio"
                            name="paymentMethod"
                            value={method.id}
                            aria-label={method.name}
                            checked={method.id === selectedMethodId}
                            disabled={method.type === "vnpay" && !vnpayAvailable}
                            onChange={() => onSelectMethod(method.id)}
                        />
                        <div>
                            <strong>{method.name}</strong>
                            <p>{method.type === "vnpay" && !vnpayAvailable ? vnpayMessage : method.description}</p>
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
                    <strong>Thông tin thanh toán</strong>
                    <p>Với COD, bạn thanh toán khi nhận hàng. Với VNPay, bạn được chuyển đến cổng thanh toán để hoàn tất.</p>
                </div>
            </div>
        </section>
    );
}
