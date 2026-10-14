import { faLocationDot, faTruckFast } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { OrderResponse } from "../../api/OrderService";
import { receiverInfo } from "../../data/checkoutData";
import { orderSuccessInfo } from "../../data/orderSuccessData";

interface OrderShippingInfoProps {
    order?: OrderResponse;
}

export default function OrderShippingInfo({ order }: OrderShippingInfoProps) {
    const recipientName = order?.recipientName ?? receiverInfo.name;
    const phoneNumber = order?.phoneNumber ?? receiverInfo.phone;
    const shippingAddress = order?.shippingAddress ?? receiverInfo.address;
    const note = order?.note ?? receiverInfo.note;

    return (
        <section className="order-success-card">
            <div className="order-success-section-heading d-flex align-items-center justify-content-between">
                <h2>Thông tin giao hàng</h2>
                <span>{orderSuccessInfo.estimatedDelivery}</span>
            </div>

            <div className="order-success-shipping-grid">
                <div className="d-flex align-items-start">
                    <span>
                        <FontAwesomeIcon icon={faLocationDot} />
                    </span>
                    <div>
                        <strong>{recipientName}</strong>
                        <p>{phoneNumber}</p>
                        <p>{shippingAddress}</p>
                    </div>
                </div>
                <div className="d-flex align-items-start">
                    <span>
                        <FontAwesomeIcon icon={faTruckFast} />
                    </span>
                    <div>
                        <strong>Giao hàng tiêu chuẩn</strong>
                        <p>{note}</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
