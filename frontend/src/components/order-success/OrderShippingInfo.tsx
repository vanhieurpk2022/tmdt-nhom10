import { faLocationDot, faTruckFast } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { receiverInfo } from "../../data/checkoutData";
import { orderSuccessInfo } from "../../data/orderSuccessData";

export default function OrderShippingInfo() {
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
                        <strong>{receiverInfo.name}</strong>
                        <p>{receiverInfo.phone}</p>
                        <p>{receiverInfo.address}</p>
                    </div>
                </div>
                <div className="d-flex align-items-start">
                    <span>
                        <FontAwesomeIcon icon={faTruckFast} />
                    </span>
                    <div>
                        <strong>Giao hàng tiêu chuẩn</strong>
                        <p>{receiverInfo.note}</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
