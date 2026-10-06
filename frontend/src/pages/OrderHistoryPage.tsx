import { useMemo, useState } from "react";
import OrderHistoryFilters, { type OrderHistoryFilter } from "../components/order-history/OrderHistoryFilters";
import OrderHistoryHero from "../components/order-history/OrderHistoryHero";
import OrderHistoryList from "../components/order-history/OrderHistoryList";
import { orderHistoryItems } from "../data/orderHistoryData";
import AccountLayout from "../components/layout/AccountLayout";


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
                <AccountLayout breadcrumbCurrent="Đơn hàng của tôi">
                        <div className="d-flex flex-column gap-4">
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
                            </AccountLayout>
    );
}
