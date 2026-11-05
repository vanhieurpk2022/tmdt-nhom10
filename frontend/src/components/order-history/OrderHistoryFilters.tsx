import { faMagnifyingGlass, faXmark } from "@fortawesome/free-solid-svg-icons";
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
        <section className="bg-white rounded-4 shadow-sm border p-3 d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3">
            {/* Thanh chọn trạng thái lọc */}
            <div className="d-flex flex-wrap gap-2" role="tablist" aria-label="Lọc đơn hàng theo trạng thái">
                {filterOptions.map((option) => {
                    const isActive = activeFilter === option.value;
                    const count = counts?.[option.value] ?? 0;

                    return (
                        <button
                            key={option.value}
                            type="button"
                            className={`btn btn-sm rounded-pill d-inline-flex align-items-center px-3 py-2 fw-bold transition-all ${
                                isActive
                                    ? "btn-dark text-white shadow-sm"
                                    : "btn-light text-muted border border-light-subtle hover-border-dark"
                            }`}
                            onClick={() => onFilterChange(option.value)}
                        >
                            <span>{option.label}</span>
                            <span
                                className={`badge rounded-pill ms-2 ${
                                    isActive
                                        ? "bg-white text-dark"
                                        : "bg-secondary bg-opacity-10 text-secondary"
                                }`}
                                style={{ fontSize: "0.75rem", padding: "0.25em 0.6em" }}
                            >
                                {count}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Ô tìm kiếm mã đơn hoặc tên sản phẩm */}
            <div className="position-relative w-100 flex-shrink-0" style={{ maxWidth: "340px" }}>
                <FontAwesomeIcon
                    icon={faMagnifyingGlass}
                    className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted fs-7 pointer-events-none"
                />
                <input
                    type="search"
                    className="form-control rounded-pill ps-5 pe-4 py-2 fs-7 text-dark border bg-light bg-opacity-50"
                    maxLength={150}
                    placeholder="Tìm mã đơn hoặc tên sản phẩm..."
                    value={searchValue}
                    onChange={(event) => onSearchChange(event.target.value)}
                />
                {searchValue && (
                    <button
                        type="button"
                        onClick={() => onSearchChange("")}
                        className="btn btn-link position-absolute top-50 end-0 translate-middle-y me-2 p-0 text-muted border-0"
                        title="Xóa tìm kiếm"
                    >
                        <FontAwesomeIcon icon={faXmark} className="fs-7" />
                    </button>
                )}
            </div>
        </section>
    );
}
