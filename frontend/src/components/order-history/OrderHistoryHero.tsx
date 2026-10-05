import { faBoxOpen, faClockRotateLeft, faReceipt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { OrderHistoryItem } from "../../data/orderHistoryData";

interface OrderHistoryHeroProps {
    orders: OrderHistoryItem[];
}

const currencyFormatter = new Intl.NumberFormat("vi-VN");

function formatPrice(price: number) {
    return `${currencyFormatter.format(price)}đ`;
}

export default function OrderHistoryHero({ orders }: OrderHistoryHeroProps) {
    const completedOrders = orders.filter((order) => order.status === "completed").length;
    const totalPaid = orders.reduce((total, order) => total + order.subtotal - order.discount + order.shippingFee, 0);

    return (
        <section className="order-history-hero">
            <div>
                <span className="order-history-label d-inline-flex align-items-center">
                    <FontAwesomeIcon icon={faClockRotateLeft} />
                    Lịch sử mua hàng
                </span>
                <h1>Theo dõi toàn bộ đơn hàng của bạn</h1>
                <p>
                    Kiểm tra trạng thái xử lý, phương thức thanh toán và các sản phẩm đã mua tại Oilia.
                </p>
            </div>

            <div className="order-history-stats">
                <article className="d-flex flex-column">
                    <FontAwesomeIcon icon={faReceipt} />
                    <span>Tổng đơn</span>
                    <strong>{orders.length}</strong>
                </article>
                <article className="d-flex flex-column">
                    <FontAwesomeIcon icon={faBoxOpen} />
                    <span>Đã giao</span>
                    <strong>{completedOrders}</strong>
                </article>
                <article className="d-flex flex-column">
                    <FontAwesomeIcon icon={faReceipt} />
                    <span>Tổng chi tiêu</span>
                    <strong>{formatPrice(totalPaid)}</strong>
                </article>
            </div>
        </section>
    );
}
