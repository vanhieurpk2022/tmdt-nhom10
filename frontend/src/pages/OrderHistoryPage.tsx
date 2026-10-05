import { useMemo, useState } from "react";
import OrderHistoryBreadcrumb from "../components/order-history/OrderHistoryBreadcrumb";
import OrderHistoryFilters, { type OrderHistoryFilter } from "../components/order-history/OrderHistoryFilters";
import OrderHistoryHero from "../components/order-history/OrderHistoryHero";
import OrderHistoryList from "../components/order-history/OrderHistoryList";
import { orderHistoryItems } from "../data/orderHistoryData";

export default function OrderHistoryPage() {
    const [activeFilter, setActiveFilter] = useState<OrderHistoryFilter>("all");
    const [searchValue, setSearchValue] = useState("");

    const filteredOrders = useMemo(() => {
        const normalizedSearch = searchValue.trim().toLowerCase();

        return orderHistoryItems.filter((order) => {
            const matchesStatus = activeFilter === "all" || order.status === activeFilter;
            const matchesSearch =
                normalizedSearch.length === 0 ||
                order.code.toLowerCase().includes(normalizedSearch) ||
                order.products.some((product) => product.name.toLowerCase().includes(normalizedSearch));

            return matchesStatus && matchesSearch;
        });
    }, [activeFilter, searchValue]);

    return (
        <main className="order-history-page">
            <div className="container-fluid px-4 px-lg-5">
                <div className="order-history-content">
                    <OrderHistoryBreadcrumb />
                    <OrderHistoryHero orders={orderHistoryItems} />
                    <OrderHistoryFilters
                        activeFilter={activeFilter}
                        orders={orderHistoryItems}
                        searchValue={searchValue}
                        onFilterChange={setActiveFilter}
                        onSearchChange={setSearchValue}
                    />
                    <OrderHistoryList orders={filteredOrders} />
                </div>
            </div>
        </main>
    );
}
