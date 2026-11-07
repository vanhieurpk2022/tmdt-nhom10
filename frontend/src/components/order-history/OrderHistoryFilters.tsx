import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { OrderStatus } from "../../data/orderHistoryData";
import { orderStatusLabels } from "../../data/orderHistoryData";

export type OrderHistoryFilter = "all" | OrderStatus;

interface OrderHistoryFiltersProps {
    activeFilter: OrderHistoryFilter;
    counts?: Record<OrderHistoryFilter, number>;
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
    counts,
    searchValue,
    onFilterChange,
    onSearchChange,
}: OrderHistoryFiltersProps) {
    return (
        <section className="account-panel order-history-toolbar" aria-label="Tìm kiếm và lọc đơn hàng">
            <div className="order-history-filter-tabs" role="group" aria-label="Lọc đơn hàng theo trạng thái">
                {filterOptions.map((option) => {
                    const isActive = activeFilter === option.value;
                    const count = counts?.[option.value] ?? "—";

                    return (
                        <button
                            className={isActive ? "active" : ""}
                            key={option.value}
                            type="button"
                            aria-pressed={isActive}
                            onClick={() => onFilterChange(option.value)}
                        >
                            {option.label}
                            <span>{count}</span>
                        </button>
                    );
                })}
            </div>

            <label className="order-history-search">
                <FontAwesomeIcon icon={faMagnifyingGlass} aria-hidden="true" />
                <input
                    type="search"
                    maxLength={150}
                    aria-label="Tìm đơn hàng theo mã hoặc tên sản phẩm"
                    placeholder="Mã đơn đầy đủ hoặc tên sản phẩm"
                    value={searchValue}
                    onChange={(event) => onSearchChange(event.target.value)}
                />
            </label>
        </section>
    );
}
