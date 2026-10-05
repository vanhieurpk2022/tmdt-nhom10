import { faCircleCheck, faCircleXmark, faClock, faTruckFast } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import type { OrderHistoryItem, OrderStatus } from "../../data/orderHistoryData";
import { orderStatusLabels } from "../../data/orderHistoryData";

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
    return `${currencyFormatter.format(price)}đ`;
}

export default function OrderHistoryCard({ order }: OrderHistoryCardProps) {
    const total = order.subtotal - order.discount + order.shippingFee;
    const remainingProducts = Math.max(order.products.length - 2, 0);

    return (
        <article className="order-history-card">
            <div className="order-history-card-head">
                <div>
                    <span>Mã đơn hàng</span>
                    <h2>{order.code}</h2>
                    <p>{order.createdAt}</p>
                </div>
                <div className={`order-history-status ${order.status}`}>
                    <FontAwesomeIcon icon={statusIcons[order.status]} />
                    {orderStatusLabels[order.status]}
                </div>
            </div>

            <div className="order-history-products">
                {order.products.slice(0, 2).map((product) => (
                    <div className="order-history-product" key={product.id}>
                        <img src={product.image} alt={product.name} />
                        <div>
                            <h3>{product.name}</h3>
                            <p>{product.variant}</p>
                            <span>Số lượng: {product.quantity}</span>
                        </div>
                        <strong>{formatPrice(product.price * product.quantity)}</strong>
                    </div>
                ))}
                {remainingProducts > 0 && (
                    <p className="order-history-more-products">+{remainingProducts} sản phẩm khác trong đơn hàng</p>
                )}
            </div>

            <div className="order-history-meta">
                <div>
                    <span>Thanh toán</span>
                    <strong>{order.paymentMethod}</strong>
                    <p>{order.paymentStatus}</p>
                </div>
                <div>
                    <span>Giao đến</span>
                    <strong>{order.deliveryAddress}</strong>
                    <p>{order.status === "completed" ? "Đơn hàng đã hoàn tất" : "Địa chỉ nhận hàng đã xác nhận"}</p>
                </div>
                <div>
                    <span>Tổng tiền</span>
                    <strong className="order-history-total">{formatPrice(total)}</strong>
                    <p>Đã gồm ưu đãi và phí vận chuyển</p>
                </div>
            </div>

            <div className="order-history-actions d-flex flex-wrap gap-2 justify-content-end">
                <button className="btn order-history-outline-btn fw-bold" type="button">
                    Xem chi tiết
                </button>
                {order.status === "completed" && (
                    <button className="btn order-history-primary-btn fw-bold" type="button">
                        Mua lại
                    </button>
                )}
            </div>
        </article>
    );
}
