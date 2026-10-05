import { faCreditCard, faMoneyBillWave, faQrcode, faShieldHalved } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import type { PaymentMethod } from "../../data/checkoutData";
import CheckoutSectionTitle from "./CheckoutSectionTitle";

interface PaymentMethodListProps {
    methods: PaymentMethod[];
}

const methodIcons: Record<PaymentMethod["type"], IconDefinition | null> = {
    momo: null,
    card: faCreditCard,
    qr: faQrcode,
    cod: faMoneyBillWave,
};

export default function PaymentMethodList({ methods }: PaymentMethodListProps) {
    return (
        <section className="checkout-block">
            <CheckoutSectionTitle index={3} title="Chọn phương thức thanh toán" />

            <div className="checkout-payment-list d-flex flex-column">
                {methods.map((method) => (
                    <label className={`checkout-payment-option ${method.selected ? "active" : ""}`} key={method.id}>
                        <input type="radio" name="paymentMethod" defaultChecked={method.selected} />
                        <span className="checkout-payment-check" />
                        <div>
                            <strong>{method.name}</strong>
                            <p>{method.description}</p>
                        </div>
                        <span className={`checkout-payment-mark ${method.type}`}>
                            {method.type === "momo" ? "mo" : <FontAwesomeIcon icon={methodIcons[method.type] as IconDefinition} />}
                        </span>
                    </label>
                ))}
            </div>

            <div className="checkout-security-note d-flex align-items-center">
                <span className="d-inline-flex align-items-center justify-content-center">
                    <FontAwesomeIcon icon={faShieldHalved} />
                </span>
                <div>
                    <strong>Thanh toán online nhanh chóng, an toàn</strong>
                    <p>Bảo mật thông tin mã hóa SSL 256-bit tiêu chuẩn ngân hàng</p>
                </div>
            </div>
        </section>
    );
}
