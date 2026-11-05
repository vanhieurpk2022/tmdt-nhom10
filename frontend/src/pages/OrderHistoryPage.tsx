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
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faChevronRight, faSpinner } from "@fortawesome/free-solid-svg-icons";

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
            }).catch(() => { if (active) setError("Chưa tải được danh sách đơn hàng. Vui lòng thử lại sau."); })
                .finally(() => { if (active) setLoading(false); });
        }, 200);
        return () => { active = false; clearTimeout(timer); };
    }, [query]);

    function updateQuery(next: typeof query) {
        setLoading(true);
        setQuery(next);
    }

    const totalPages = result?.totalPages ?? 0;
    const currentPage = query.page + 1;

    return (
        <AccountLayout breadcrumbCurrent="Đơn hàng của tôi">
            <div className="d-flex flex-column gap-3">
                <OrderHistoryHero summary={result?.summary} />

                {error && (
                    <div className="alert alert-danger rounded-4 py-3 px-4 shadow-sm border-0 d-flex align-items-center justify-content-between">
                        <span>{error}</span>
                        <button type="button" className="btn btn-sm btn-outline-danger rounded-pill" onClick={() => updateQuery({ ...query })}>
                            Thử lại
                        </button>
                    </div>
                )}

                <OrderHistoryFilters
                    activeFilter={query.status}
                    counts={result?.statusCounts}
                    searchValue={query.search}
                    onFilterChange={status => updateQuery({ ...query, page: 0, status })}
                    onSearchChange={search => updateQuery({ ...query, page: 0, search })}
                />

                {loading ? (
                    <div className="bg-white rounded-4 border shadow-sm p-5 text-center my-2">
                        <FontAwesomeIcon icon={faSpinner} spin className="fs-2 text-primary mb-3" />
                        <p className="text-muted fw-bold mb-0 fs-7">Đang tải danh sách đơn hàng...</p>
                    </div>
                ) : (
                    <OrderHistoryList orders={(result?.orders ?? []).map(toHistoryItem)} />
                )}

                {/* Phân trang hiện đại */}
                {!loading && totalPages > 1 && (
                    <div className="d-flex justify-content-center align-items-center gap-2 mt-3 pt-2">
                        <button
                            type="button"
                            className="btn btn-sm btn-white border rounded-pill px-3 py-2 fw-bold text-muted hover-border-dark d-inline-flex align-items-center gap-2"
                            disabled={query.page === 0 || loading}
                            onClick={() => updateQuery({ ...query, page: query.page - 1 })}
                        >
                            <FontAwesomeIcon icon={faChevronLeft} className="fs-8" />
                            <span>Trang trước</span>
                        </button>

                        <div className="px-3 py-1 rounded-pill bg-white border fs-7 fw-bold text-dark shadow-xs">
                            Trang {currentPage} / {totalPages}
                        </div>

                        <button
                            type="button"
                            className="btn btn-sm btn-white border rounded-pill px-3 py-2 fw-bold text-muted hover-border-dark d-inline-flex align-items-center gap-2"
                            disabled={loading || currentPage >= totalPages}
                            onClick={() => updateQuery({ ...query, page: query.page + 1 })}
                        >
                            <span>Trang sau</span>
                            <FontAwesomeIcon icon={faChevronRight} className="fs-8" />
                        </button>
                    </div>
                )}
            </div>
        </AccountLayout>
    );
}

function toHistoryItem(order: OrderResponse): OrderHistoryItem {
    return {
        id: String(order.id),
        code: formatOrderCode(order.id),
        createdAt: new Date(order.createdAt).toLocaleString("vi-VN"),
        status: order.status === "CANCELLED" || order.status === "REFUNDED" || order.status === "RETURNED"
            ? "cancelled"
            : order.status === "DELIVERED"
            ? "completed"
            : ["SHIPPED", "DELIVERING"].includes(order.status)
            ? "shipping"
            : "processing",
        paymentMethod: getPaymentMethodLabel(order.paymentMethod),
        statusLabel: getOrderStatusView(order.status).label,
        paymentStatus: getPaymentStatusLabel(order),
        deliveryAddress: order.shippingAddress,
        products: order.items.map(item => ({
            id: item.id,
            name: item.productName,
            variant: item.mil ? `${item.mil}ml` : "Tinh dầu",
            image: item.thumbnailUrl || fallbackCartImage,
            quantity: item.quantity,
            price: item.unitPrice
        })),
        total: order.totalPrice,
        detailUrl: ROUTES.ORDER_DETAIL.replace(":id", String(order.id)),
    };
}
