import { faReceipt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { formatOrderCode, type OrderResponse } from "../../api/OrderService";
import { getOrderStatusView } from "../../data/orderSuccessData";

interface OrderSuccessHeroProps {
    order: OrderResponse;
    detail?: boolean;
}

export default function OrderSuccessHero({ order, detail = false }: OrderSuccessHeroProps) {
    const orderCode = formatOrderCode(order.id);
    const view = getOrderStatusView(order.status);

    return (
        <section className={`order-success-hero d-flex flex-column align-items-center ${["CANCELLED", "RETURNED"].includes(order.status) ? "order-success-hero-cancelled" : order.status === "PENDING_PAYMENT" ? "order-success-hero-pending" : ""}`}>
            <div className="order-success-icon d-flex align-items-center justify-content-center">
                <FontAwesomeIcon icon={faReceipt} />
            </div>
            <span className="order-success-label d-inline-flex">{view.label}</span>
            <h1>{detail ? "Chi tiết đơn hàng" : order.status === "PENDING" ? "Đặt hàng thành công" : "Thông tin đơn hàng"}</h1>
            <p>{view.description}</p>

            <div className="order-success-code d-inline-flex align-items-center">
                <FontAwesomeIcon icon={faReceipt} />
                <span>Mã đơn hàng</span>
                <strong>{orderCode}</strong>
            </div>
            <p className="mt-3 small">Đặt lúc {new Date(order.createdAt).toLocaleString("vi-VN")}</p>
        </section>
    );
}
