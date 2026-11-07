import { useEffect, useState } from "react";
import OrderHistoryFilters, { type OrderHistoryFilter } from "../components/order-history/OrderHistoryFilters";
import OrderHistoryHero from "../components/order-history/OrderHistoryHero";
import OrderHistoryList from "../components/order-history/OrderHistoryList";
import type { OrderHistoryItem } from "../data/orderHistoryData";
import { orderService, formatOrderCode, getPaymentMethodLabel, getPaymentStatusLabel, type OrderResponse, type OrderHistoryResponse } from "../api/OrderService";
import { fallbackCartImage } from "../data/cartData";
import { ROUTES } from "../routes/routes";
import AccountLayout from "../components/layout/AccountLayout";
import { getOrderStatusView } from "../data/orderSuccessData";

export default function OrderHistoryPage() {
    const [query, setQuery] = useState<{ page: number; status: OrderHistoryFilter; search: string }>({
        page: 0, status: "all", search: "",
    });
    const [result, setResult] = useState<OrderHistoryResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;
        const timer = setTimeout(() => {
            setLoading(true);
            orderService.listOrders(query.page, query.status, query.search).then(response => {
                if (active) { setResult(response); setError(""); }
            }).catch(() => { if (active) setError("Chưa tải được danh sách đơn hàng. Vui lòng thử lại."); })
                .finally(() => { if (active) setLoading(false); });
        }, 200);
        return () => { active = false; clearTimeout(timer); };
    }, [query]);

    function updateQuery(next: typeof query) {
        setLoading(true);
        setQuery(next);
    }

    return (
        <AccountLayout breadcrumbCurrent="Đơn hàng của tôi">
            <div className="order-history-page">
                <OrderHistoryHero summary={result?.summary} />
                {error && <p className="alert alert-danger mb-0" role="alert">{error}</p>}
                {loading && <p className="order-history-feedback" role="status">Đang tải đơn hàng…</p>}

                <OrderHistoryFilters
                    activeFilter={query.status}
                    counts={result?.statusCounts}
                    searchValue={query.search}
                    onFilterChange={status => updateQuery({ ...query, page: 0, status })}
                    onSearchChange={search => updateQuery({ ...query, page: 0, search })}
                />

                {!loading && !error && <OrderHistoryList orders={(result?.orders ?? []).map(toHistoryItem)} />}
                {!error && Boolean(result?.totalPages) && <nav className="order-history-pagination" aria-label="Phân trang đơn hàng">
                    <button type="button" disabled={query.page === 0 || loading}
                        onClick={() => updateQuery({ ...query, page: query.page - 1 })}>Trang trước</button>
                    <span aria-live="polite">Trang {query.page + 1} / {result?.totalPages}</span>
                    <button type="button" disabled={loading || query.page + 1 >= (result?.totalPages ?? 0)}
                        onClick={() => updateQuery({ ...query, page: query.page + 1 })}>Trang sau</button>
                </nav>}
            </div>
        </AccountLayout>
    );
}

function toHistoryItem(order: OrderResponse): OrderHistoryItem {
    return {
        id: String(order.id), code: formatOrderCode(order.id), createdAt: new Date(order.createdAt).toLocaleString("vi-VN"),
        status: order.status === "CANCELLED" || order.status === "REFUNDED" || order.status === "RETURNED" ? "cancelled"
            : order.status === "DELIVERED" ? "completed" : ["SHIPPED", "DELIVERING"].includes(order.status) ? "shipping" : "processing",
        paymentMethod: getPaymentMethodLabel(order.paymentMethod),
        statusLabel: getOrderStatusView(order.status).label,
        paymentStatus: getPaymentStatusLabel(order),
        deliveryAddress: order.shippingAddress,
        products: order.items.map(item => ({ id: item.id, name: item.productName, variant: item.mil ? `${item.mil}ml` : "Tinh dầu", image: item.thumbnailUrl || fallbackCartImage, quantity: item.quantity, price: item.unitPrice })),
        total: order.totalPrice,
        detailUrl: ROUTES.ORDER_DETAIL.replace(":id", String(order.id)),
    };
}
