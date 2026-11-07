import { faReceipt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { ReactNode } from "react";
import { formatOrderCode, type OrderResponse } from "../../api/OrderService";
import { getOrderStatusView } from "../../data/orderSuccessData";

interface OrderSuccessHeroProps {
    order: OrderResponse;
    detail?: boolean;
    children?: ReactNode;
}

export default function OrderSuccessHero({ order, detail = false, children }: OrderSuccessHeroProps) {
    const orderCode = formatOrderCode(order.id);
    const view = getOrderStatusView(order.status);
    const description = order.status === "CANCELLED" && order.paymentStatus === "REFUNDED"
        ? "Đơn hàng đã hủy. Cửa hàng đã xác nhận hoàn tiền cho bạn."
        : order.status === "CANCELLED" && order.paymentStatus === "REFUND_PENDING"
        ? "Đơn hàng đã hủy. Cửa hàng đang xử lý yêu cầu hoàn tiền."
        : view.description;
    const tone = ["CANCELLED", "RETURNED"].includes(order.status) ? "danger"
        : ["PENDING_PAYMENT", "PENDING"].includes(order.status) ? "warning"
        : ["DELIVERED", "REFUNDED"].includes(order.status) ? "success" : "info";

    return (
        <section className="order-details-header" aria-labelledby="order-details-title">
            <div className="order-details-heading">
                <div>
                    <h1 id="order-details-title">{detail ? "Chi tiết đơn hàng" : order.status === "PENDING" ? "Đặt hàng thành công" : "Thông tin đơn hàng"}</h1>
                    <div className="order-details-meta">
                        <strong><FontAwesomeIcon icon={faReceipt} aria-hidden="true" /> {orderCode}</strong>
                        <span>Đặt lúc <time dateTime={order.createdAt}>{new Date(order.createdAt).toLocaleString("vi-VN")}</time></span>
                    </div>
                </div>
                <span className={`badge rounded-pill bg-${tone}-subtle text-${tone}-emphasis order-details-status`}>{view.label}</span>
            </div>
            <p className="order-details-description">{description}</p>
            {children}
        </section>
    );
}
