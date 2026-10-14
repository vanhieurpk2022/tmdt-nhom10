import { faCopy } from "@fortawesome/free-regular-svg-icons";
import { faWallet } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    formatOrderCode,
    getPaymentMethodLabel,
    type OrderResponse,
} from "../../api/OrderService";
import { onlinePaymentInfo, onlinePaymentSteps } from "../../data/onlinePaymentData";

interface PaymentDetailsProps {
    amount: number;
    order?: OrderResponse;
}

const currencyFormatter = new Intl.NumberFormat("vi-VN");

function formatPrice(price: number) {
    return `${currencyFormatter.format(price)}đ`;
}

export default function PaymentDetails({ amount, order }: PaymentDetailsProps) {
    const orderCode = order ? formatOrderCode(order.id) : onlinePaymentInfo.orderCode;
    const paymentCode = order ? `PAY-${orderCode}-${Math.round(amount)}` : onlinePaymentInfo.paymentCode;
    const methodName = getPaymentMethodLabel(order?.paymentMethod);

    return (
        <section className="online-payment-detail-card">
            <div className="online-payment-method d-flex align-items-center">
                <span className="d-inline-flex align-items-center justify-content-center">
                    <FontAwesomeIcon icon={faWallet} />
                </span>
                <div>
                    <strong>{methodName}</strong>
                    <p>Thanh toán qua {onlinePaymentInfo.providerName}</p>
                </div>
            </div>

            <div className="online-payment-info-list d-flex flex-column">
                <div>
                    <span>Mã đơn hàng</span>
                    <strong>{orderCode}</strong>
                    <button type="button" aria-label="Sao chép mã đơn hàng">
                        <FontAwesomeIcon icon={faCopy} />
                    </button>
                </div>
                <div>
                    <span>Mã thanh toán</span>
                    <strong>{paymentCode}</strong>
                    <button type="button" aria-label="Sao chép mã thanh toán">
                        <FontAwesomeIcon icon={faCopy} />
                    </button>
                </div>
                <div>
                    <span>Người nhận</span>
                    <strong>{order?.recipientName ?? onlinePaymentInfo.accountName}</strong>
                </div>
                <div>
                    <span>Số tiền</span>
                    <strong className="online-payment-amount">{formatPrice(amount)}</strong>
                </div>
            </div>

            <div className="online-payment-steps">
                <h2>Hướng dẫn thanh toán</h2>
                <ol>
                    {onlinePaymentSteps.map((step) => (
                        <li key={step}>{step}</li>
                    ))}
                </ol>
            </div>
        </section>
    );
}
