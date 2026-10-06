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

        <section className="bg-white rounded-4 shadow-sm p-3 d-flex flex-column flex-xl-row justify-content-between align-items-xl-center gap-3">
            <div className="d-flex flex-wrap gap-2" aria-label="Lọc đơn hàng theo trạng thái">
                {filterOptions.map((option) => {
                    const isActive = activeFilter === option.value;
                    const count = countByFilter(option.value);
                    
                    return (
                        <button
                            className={`btn btn-sm rounded-pill d-inline-flex align-items-center px-3 py-2 fw-bold ${
                                isActive ? "btn-dark text-white" : "btn-white border text-muted"
                            }`}
                            key={option.value}
                            type="button"
                            onClick={() => onFilterChange(option.value)}
                        >
                            {option.label}
                            {isActive ? (
                                <span className="badge bg-white text-danger rounded-pill ms-2">{count}</span>
                            ) : (
                                <span className="text-danger ms-2">{count}</span>
                            )}
                        </button>
                    );
                })}
            </div>

            <div className="position-relative w-100 flex-shrink-0" style={{ maxWidth: "350px" }}>
                <FontAwesomeIcon icon={faMagnifyingGlass} className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
                <input
                    type="search"
                    className="form-control rounded-pill ps-5 py-2 text-muted border"
                    placeholder="Tìm theo mã đơn hoặc tên sản phẩm..."
                    value={searchValue}
                    onChange={(event) => onSearchChange(event.target.value)}
                />
            </div>
            </label>
        </section>
    );
}
