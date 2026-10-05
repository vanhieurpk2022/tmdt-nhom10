import { faLocationDot, faTruckFast } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { receiverInfo } from "../../data/checkoutData";
import { orderSuccessInfo } from "../../data/orderSuccessData";

export default function OrderShippingInfo() {
    return (
        <section className="order-success-card">
            <div className="order-success-section-heading">
                <h2>Thông tin giao hàng</h2>
                <span>{orderSuccessInfo.estimatedDelivery}</span>
            </div>

            <div className="order-success-shipping-grid">
                <div>
                    <span>
                        <FontAwesomeIcon icon={faLocationDot} />
                    </span>
                    <div>
                        <strong>{receiverInfo.name}</strong>
                        <p>{receiverInfo.phone}</p>
                        <p>{receiverInfo.address}</p>
                    </div>
                </div>
                <div>
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
