import type { OrderHistoryItem } from "../../data/orderHistoryData";
import OrderHistoryCard from "./OrderHistoryCard";

interface OrderHistoryListProps {
    orders: OrderHistoryItem[];
}

export default function OrderHistoryList({ orders }: OrderHistoryListProps) {
    if (orders.length === 0) {
        return (
            <section className="order-history-empty">
                <h2>Chưa tìm thấy đơn hàng phù hợp</h2>
                <p>Thử đổi trạng thái lọc hoặc nhập mã đơn hàng khác để kiểm tra lại.</p>
            </section>
        );
    }

    return (
        <section className="order-history-list" aria-label="Danh sách đơn hàng">
            {orders.map((order) => (
                <OrderHistoryCard key={order.id} order={order} />
            ))}
        </section>
    );
}
