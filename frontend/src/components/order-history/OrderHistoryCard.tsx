import { faCircleCheck, faCircleXmark, faClock, faTruckFast } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import type { OrderHistoryItem, OrderStatus } from "../../data/orderHistoryData";
import { orderStatusLabels } from "../../data/orderHistoryData";
import { Link } from "react-router";
import { fallbackCartImage } from "../../data/cartData";

interface OrderHistoryCardProps {
    order: OrderHistoryItem;
}

const currencyFormatter = new Intl.NumberFormat("vi-VN");

const statusIcons: Record<OrderStatus, IconDefinition> = {
    processing: faClock,
    shipping: faTruckFast,
    completed: faCircleCheck,
    cancelled: faCircleXmark,
};

function formatPrice(price: number) {
    return `${currencyFormatter.format(price)} ₫`;
}

export default function OrderHistoryCard({ order }: OrderHistoryCardProps) {
    const remainingProducts = Math.max(order.products.length - 2, 0);

    return (
        <article className="account-panel order-history-card">
            <div className="order-history-card-head">
                <div>
                    <span>Mã đơn hàng</span>
                    <h3>{order.code}</h3>
                    <p>{order.createdAt}</p>
                </div>
                <div className={`order-history-status ${order.status}`}>
                    <FontAwesomeIcon icon={statusIcons[order.status]} />
                    {order.statusLabel ?? orderStatusLabels[order.status]}
                </div>
            </div>

            <div className="order-history-products">
                {order.products.slice(0, 2).map((product) => (
                    <div className="order-history-product" key={product.id}>
                        <img src={product.image} alt={product.name} onError={(event) => { event.currentTarget.src = fallbackCartImage; }} />
                        <div>
                            <h4>{product.name}</h4>
                            <p>{product.variant} · Số lượng: {product.quantity}</p>
                        </div>
                        <strong>{formatPrice(product.price * product.quantity)}</strong>
                    </div>
                ))}
                {remainingProducts > 0 && (
                    <p className="order-history-more-products">+{remainingProducts} sản phẩm khác</p>
                )}
            </div>

            <div className="order-history-meta">
                <div>
                    <span>Thanh toán</span>
                    <strong>{order.paymentMethod}</strong>
                    {order.paymentStatus !== order.paymentMethod && <p>{order.paymentStatus}</p>}
                </div>
                <div>
                    <span>Giao đến</span>
                    <strong>{order.deliveryAddress}</strong>
                </div>
                <div>
                    <span>Tổng thanh toán</span>
                    <strong className="order-history-total">{formatPrice(order.total)}</strong>
                    <p>Đã gồm phí vận chuyển</p>
                </div>
            </div>

            <div className="order-history-actions">
                <Link className="btn btn-outline-primary account-button order-history-outline-btn" to={order.detailUrl || "/orders"}>
                    Xem chi tiết
                </Link>
            </div>
        </article>
    );
}
