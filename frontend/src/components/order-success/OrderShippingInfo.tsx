import { faLocationDot, faTruckFast } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { OrderResponse } from "../../api/OrderService";

interface OrderShippingInfoProps {
    order: OrderResponse;
}

export default function OrderShippingInfo({ order }: OrderShippingInfoProps) {
    return (
        <section className="order-success-card">
            <div className="order-success-section-heading d-flex align-items-center justify-content-between">
                <h2>Thông tin giao hàng</h2>
            </div>

            <div className="order-success-shipping-grid">
                <div className="d-flex align-items-start">
                    <span>
                        <FontAwesomeIcon icon={faLocationDot} />
                    </span>
                    <div>
                        <strong>{order.recipientName}</strong>
                        <p>{order.phoneNumber}</p>
                        <p>{order.shippingAddress}</p>
                    </div>
                </div>
                <div className="d-flex align-items-start">
                    <span>
                        <FontAwesomeIcon icon={faTruckFast} />
                    </span>
                    <div>
                        <strong>Ghi chú giao hàng</strong>
                        <p>{order.note?.trim() || "Không có ghi chú."}</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
