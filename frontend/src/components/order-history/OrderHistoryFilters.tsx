import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { OrderHistoryItem, OrderStatus } from "../../data/orderHistoryData";
import { orderStatusLabels } from "../../data/orderHistoryData";

export type OrderHistoryFilter = "all" | OrderStatus;

interface OrderHistoryFiltersProps {
    activeFilter: OrderHistoryFilter;
    orders: OrderHistoryItem[];
    searchValue: string;
    onFilterChange: (filter: OrderHistoryFilter) => void;
    onSearchChange: (value: string) => void;
}

const filterOptions: Array<{ value: OrderHistoryFilter; label: string }> = [
    { value: "all", label: "Tất cả" },
    { value: "processing", label: orderStatusLabels.processing },
    { value: "shipping", label: orderStatusLabels.shipping },
    { value: "completed", label: orderStatusLabels.completed },
    { value: "cancelled", label: orderStatusLabels.cancelled },
];

export default function OrderHistoryFilters({
    activeFilter,
    orders,
    searchValue,
    onFilterChange,
    onSearchChange,
}: OrderHistoryFiltersProps) {
    function countByFilter(filter: OrderHistoryFilter) {
        if (filter === "all") {
            return orders.length;
        }

        return orders.filter((order) => order.status === filter).length;
    }

    return (
        <section className="order-history-toolbar">
            <div className="order-history-filter-tabs d-flex flex-wrap" aria-label="Lọc đơn hàng theo trạng thái">
                {filterOptions.map((option) => (
                    <button
                        className={`d-inline-flex align-items-center ${activeFilter === option.value ? "active" : ""}`}
                        key={option.value}
                        type="button"
                        onClick={() => onFilterChange(option.value)}
                    >
                        {option.label}
                        <span className="d-inline-flex align-items-center justify-content-center">{countByFilter(option.value)}</span>
                    </button>
                ))}
            </div>

            <label className="order-history-search d-flex align-items-center">
                <FontAwesomeIcon icon={faMagnifyingGlass} />
                <input
                    type="search"
                    placeholder="Tìm theo mã đơn hoặc tên sản phẩm..."
                    value={searchValue}
                    onChange={(event) => onSearchChange(event.target.value)}
                />
            </label>
        </section>
    );
}
