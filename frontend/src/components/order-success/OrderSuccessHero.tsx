import { faCircleCheck, faReceipt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { formatOrderCode, type OrderResponse } from "../../api/OrderService";
import { orderSuccessInfo } from "../../data/orderSuccessData";

interface OrderSuccessHeroProps {
    order?: OrderResponse;
}

export default function OrderSuccessHero({ order }: OrderSuccessHeroProps) {
    const orderCode = order ? formatOrderCode(order.id) : orderSuccessInfo.orderCode;

    return (
        <section className="order-success-hero d-flex flex-column align-items-center">
            <div className="order-success-icon d-flex align-items-center justify-content-center">
                <FontAwesomeIcon icon={faCircleCheck} />
            </div>
            <span className="order-success-label d-inline-flex">{orderSuccessInfo.paymentStatus}</span>
            <h1>Đặt hàng thành công</h1>
            <p>
                Cảm ơn bạn đã mua hàng tại Oilia. Đơn hàng của bạn đã được xác nhận và đang được chuẩn bị để giao đi.
            </p>

            <div className="order-success-code d-inline-flex align-items-center">
                <FontAwesomeIcon icon={faReceipt} />
                <span>Mã đơn hàng</span>
                <strong>{orderCode}</strong>
            </div>
        </section>
    );
}
