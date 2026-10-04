import { faCircleCheck, faReceipt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { orderSuccessInfo } from "../../data/orderSuccessData";

export default function OrderSuccessHero() {
    return (
        <section className="order-success-hero">
            <div className="order-success-icon">
                <FontAwesomeIcon icon={faCircleCheck} />
            </div>
            <span className="order-success-label">{orderSuccessInfo.paymentStatus}</span>
            <h1>{orderSuccessInfo.status}</h1>
            <p>
                Cảm ơn bạn đã mua hàng tại Oilia. Đơn hàng của bạn đã được xác nhận và đang được chuẩn bị để giao đi.
            </p>

            <div className="order-success-code">
                <FontAwesomeIcon icon={faReceipt} />
                <span>Mã đơn hàng</span>
                <strong>{orderSuccessInfo.orderCode}</strong>
            </div>
        </section>
    );
}
