import {
    createFilteredRowModel,
    createColumnHelper,
    createSortedRowModel,
    createPaginatedRowModel,
    tableFeatures,
    useTable,
    rowSortingFeature,
    rowPaginationFeature,
    columnFilteringFeature,
    globalFilteringFeature,
    filterFn_includesString,
    sortFn_alphanumeric,
    sortFn_basic,
    type PaginationState,
} from "@tanstack/react-table";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import {
    faArrowDownAZ,
    faArrowUpAZ,
    faSort,
    faMagnifyingGlass,
    faBagShopping,
    faChartColumn,
    faShieldHalved,
    faTriangleExclamation,
    faChevronLeft,
    faChevronRight,
    faClock,
    faShop,
    faFlask,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import PageHeader from "./PageHeader";
import StatCard from "./StartCard";
import CustomBadge from "../badge/CustomBadge";
import { ModalApprove } from "./ModalApprove";
import "../../../css/pages/dashboard/dashboard.css";

type OrderStatus = "Chờ xác nhận" | "Đang sản xuất" | "Hoàn thành" | "Đã hủy";

interface OrderTable {
    code: string;
    time: string;
    customer: string;
    shop: string;
    product: string;
    notes: string;
    lab: string;
    workshop: string;
    status: OrderStatus;
}

interface CancelReason {
    label: string;
    percent: number;
    count: number;
    color: string;
}

interface RevenueItem {
    label: string;
    amount: number;
    percent: number;
    color: string;
    highlight?: boolean;
}

export const ExampleData: OrderTable[] = [
    {
        code: "DH-2026-1024",
        time: "10 phút trước",
        customer: "Nguyễn Hoàng Nam",
        shop: "Maison De Saigon",
        product: "Amber Oud EDP 50ml",
        notes: "Trầm hương Lào & hổ phách",
        lab: "Mộc Perfume Lab",
        workshop: "WS-102 (GMP ASEAN)",
        status: "Chờ xác nhận",
    },
    {
        code: "DH-2026-1025",
        time: "10 phút trước",
        customer: "Nguyễn Hoàng Nam",
        shop: "Maison De Saigon",
        product: "Amber Oud EDP 50ml",
        notes: "Trầm hương Lào & hổ phách",
        lab: "Mộc Perfume Lab",
        workshop: "WS-102 (GMP ASEAN)",
        status: "Chờ xác nhận",
    },
    {
        code: "DH-2026-1026",
        time: "10 phút trước",
        customer: "Nguyễn Hoàng Nam",
        shop: "Maison De Saigon",
        product: "Amber Oud EDP 50ml",
        notes: "Trầm hương Lào & hổ phách",
        lab: "Mộc Perfume Lab",
        workshop: "WS-102 (GMP ASEAN)",
        status: "Chờ xác nhận",
    },
];

export const cancelReasons: CancelReason[] = [
    { label: "Chờ nguyên liệu & tinh dầu nhập khẩu", percent: 38, count: 7, color: "var(--color-primary)" },
    { label: "Xưởng quá tải công suất sản xuất", percent: 29, count: 5, color: "var(--color-warning)" },
    { label: "Khách đổi công thức / Nốt hương điều chỉnh", percent: 21, count: 4, color: "var(--color-info)" },
    { label: "Lý do khác (Thỏa thuận song phương)", percent: 12, count: 2, color: "var(--color-neutral)" },
];

export const revenueItems: RevenueItem[] = [
    { label: "Đã giải ngân xưởng", amount: 913300000, percent: 49.4, color: "var(--color-info)" },
    { label: "Chờ giải ngân (Pending)", amount: 542800000, percent: 29.3, color: "var(--color-warning)" },
    { label: "Phí sàn thu được (Take-rate)", amount: 268500000, percent: 14.5, color: "var(--color-success)" },
    { label: "Tạm giữ Escrow (Tranh chấp)", amount: 125400000, percent: 6.8, color: "var(--color-primary)", highlight: true },
];

export const OrderStatusBadge: Record<OrderStatus, { label: string; badge: string }> = {
    "Chờ xác nhận": {
        label: "Chờ xác nhận",
        badge: "bg-warning-subtle text-warning-emphasis",
    },
    "Đang sản xuất": {
        label: "Đang sản xuất",
        badge: "bg-primary-subtle text-primary-emphasis",
    },
    "Hoàn thành": {
        label: "Hoàn thành",
        badge: "bg-success-subtle text-success-emphasis",
    },
    "Đã hủy": {
        label: "Đã hủy",
        badge: "bg-secondary-subtle text-secondary-emphasis",
    },
};

const PAGE_SIZES = [5, 10, 20, 50];
const TOTAL_REVENUE = 1850000000;

const formatVnd = (value: number) => value.toLocaleString("vi-VN") + " ₫";

const features = tableFeatures({
    rowSortingFeature,
    rowPaginationFeature,
    columnFilteringFeature,
    globalFilteringFeature,

    sortedRowModel: createSortedRowModel(),
    filteredRowModel: createFilteredRowModel(),
    paginatedRowModel: createPaginatedRowModel(),

    sortFns: {
        alphanumeric: sortFn_alphanumeric,
        basic: sortFn_basic,
    },

    filterFns: {
        includesString: filterFn_includesString,
    },
});

const columnHelper = createColumnHelper<typeof features, OrderTable>();
const columns = columnHelper.columns([
    columnHelper.accessor("code", {
        header: "Mã đơn / Khách hàng",
        cell: info => {
            const row = info.row.original;

            return (
                <div className="d-flex flex-column gap-1">
                    <b>{row.code}</b>

                    <span className="small text-muted">
                        <FontAwesomeIcon icon={faClock} className="me-2" />
                        {row.time}
                    </span>

                    <span className="fw-semibold text-dark">{row.customer}</span>

                    <span className="small text-secondary">
                        <FontAwesomeIcon icon={faShop} className="me-2" />
                        {row.shop}
                    </span>
                </div>
            );
        },
        sortFn: "alphanumeric",
    }),

    columnHelper.accessor("product", {
        header: "Sản phẩm",
        cell: info => {
            const row = info.row.original;

            return (
                <div className="d-flex flex-column gap-1">
                    <span className="fw-semibold">{row.product}</span>
                    <span className="small text-secondary">{row.notes}</span>
                </div>
            );
        },
        sortFn: "alphanumeric",
    }),

    columnHelper.accessor("lab", {
        header: "Lab / Xưởng",
        cell: info => {
            const row = info.row.original;

            return (
                <div className="d-flex flex-column gap-1">
                    <span className="fw-semibold">{row.lab}</span>

                    <span className="badge bg-info-subtle text-info-emphasis fw-normal align-self-start">
                        <FontAwesomeIcon icon={faFlask} className="me-1" />
                        {row.workshop}
                    </span>
                </div>
            );
        },
        sortFn: "alphanumeric",
    }),

    columnHelper.accessor("status", {
        header: "Trạng thái",
        cell: info => {
            const conf = OrderStatusBadge[info.getValue()];

            return <CustomBadge label={conf.label} badge={conf.badge} />;
        },
        enableSorting: false,
    }),
]);

interface DonutProps {
    data: { name: string; value: number; color: string }[];
    centerLabel?: string;
    centerValue?: string;
}

function DonutChart({ data, centerLabel, centerValue }: DonutProps) {
    return (
        <div className="position-relative" style={{ width: 180, height: 180 }}>
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={58}
                        outerRadius={84}
                        paddingAngle={2}
                        stroke="none"
                    >
                        {data.map((item) => (
                            <Cell key={item.name} fill={item.color} />
                        ))}
                    </Pie>
                    <Tooltip />
                </PieChart>
            </ResponsiveContainer>

            {centerValue && (
                <div className="position-absolute top-50 start-50 translate-middle text-center pe-none">
                    <div className="fw-bold fs-5">{centerValue}</div>
                    {centerLabel && <div className="small text-secondary">{centerLabel}</div>}
                </div>
            )}
        </div>
    );
}

function OperationsOverview() {
    const [showApprove, setShowApprove] = useState(false);
    const [search, setSearch] = useState("");
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });

    const table = useTable({
        data: ExampleData,
        columns,
        features,
        state: { pagination },
        onPaginationChange: setPagination,
    });

    const { pageIndex, pageSize } = pagination;

    return (
        <main
            className="p-4 d-flex flex-column gap-4"
            style={{ backgroundColor: "var(--color-bg-page)", minHeight: "100vh" }}
        >
            {/* Header */}
            <PageHeader
                title="Trung tâm Điều phối & Quản trị Sàn B2B - Olla ScentOS"
                pendingCount={5}
                onApprove={() => setShowApprove(true)}
            />

            <ModalApprove show={showApprove} onClose={() => setShowApprove(false)} />

            {/* Statistic cards */}
            <section className="row g-3">
                <div className="col-12 col-md-6 col-xl-3">
                    <StatCard
                        label="Tổng đơn khách đặt (GMV sàn)"
                        value="142"
                        icon={faBagShopping}
                        tone="danger"
                        note="840 đơn/tháng"
                    />
                </div>

                <div className="col-12 col-md-6 col-xl-3">
                    <StatCard
                        label="Hiệu suất khớp lệnh & xưởng"
                        value="94.6%"
                        icon={faChartColumn}
                        tone="success"
                        note="18 xưởng gia công đối tác"
                    />
                </div>

                <div className="col-12 col-md-6 col-xl-3">
                    <StatCard
                        label="Chuẩn hóa sàn (IFRA / GMP)"
                        value="99.2%"
                        icon={faShieldHalved}
                        tone="info"
                        actionText="Giám định sản"
                    />
                </div>

                <div className="col-12 col-md-6 col-xl-3">
                    <StatCard
                        label="Tranh chấp & khiếu nại (Escrow)"
                        value="04"
                        icon={faTriangleExclamation}
                        tone="warning"
                        actionText="Xử lý ngay"
                    />
                </div>
            </section>

            {/* Charts */}
            <section className="row g-3">
                {/* Cancel rate */}
                <div className="col-12 col-xl-5">
                    <div className="card border-0 shadow-sm rounded-4 h-100">
                        <div className="card-body p-3 p-lg-4">
                            <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-3">
                                <div>
                                    <h5 className="fw-bold mb-1">Tỷ lệ hủy đơn</h5>
                                    <p className="text-secondary small mb-0">
                                        Chỉ tiêu SLA: &lt; 4.0%
                                    </p>
                                </div>

                                <span className="badge rounded-pill bg-light text-dark border px-3 py-2">
                                    3.2%
                                </span>
                            </div>

                            <div className="d-flex align-items-center gap-4 flex-wrap">
                                <DonutChart
                                    data={cancelReasons.map((r) => ({
                                        name: r.label,
                                        value: r.percent,
                                        color: r.color,
                                    }))}
                                    centerValue="3.2%"
                                    centerLabel="Tỷ lệ hủy"
                                />

                                <ul className="list-unstyled mb-0 d-flex flex-column gap-2 flex-grow-1">
                                    {cancelReasons.map((reason) => (
                                        <li
                                            key={reason.label}
                                            className="d-flex align-items-start gap-2 small"
                                        >
                                            <span
                                                className="rounded-circle flex-shrink-0 mt-1"
                                                style={{
                                                    width: 10,
                                                    height: 10,
                                                    backgroundColor: reason.color,
                                                }}
                                            />
                                            <span className="flex-grow-1">{reason.label}</span>
                                            <span className="fw-semibold text-nowrap">
                                                {reason.percent}% ({reason.count})
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Revenue */}
                <div className="col-12 col-xl-7">
                    <div className="card border-0 shadow-sm rounded-4 h-100">
                        <div className="card-body p-3 p-lg-4">
                            <div className="mb-3">
                                <h5 className="fw-bold mb-1">Dòng tiền sàn</h5>
                                <p className="text-secondary small mb-0">
                                    Tổng giá trị: {formatVnd(TOTAL_REVENUE)}
                                </p>
                            </div>

                            <div className="d-flex align-items-center gap-4 flex-wrap">
                                <DonutChart
                                    data={revenueItems.map((r) => ({
                                        name: r.label,
                                        value: r.percent,
                                        color: r.color,
                                    }))}
                                    centerValue="49.4%"
                                    centerLabel="GIẢI NGÂN"
                                />

                                <ul className="list-unstyled mb-0 d-flex flex-column gap-2 flex-grow-1">
                                    {revenueItems.map((item) => (
                                        <li
                                            key={item.label}
                                            className={`d-flex align-items-center gap-2 small ${item.highlight ? "fw-semibold text-danger" : ""
                                                }`}
                                        >
                                            <span
                                                className="rounded-circle flex-shrink-0"
                                                style={{
                                                    width: 10,
                                                    height: 10,
                                                    backgroundColor: item.color,
                                                }}
                                            />
                                            <span className="flex-grow-1">{item.label}</span>
                                            <span className="fw-semibold text-nowrap">
                                                {formatVnd(item.amount)}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="text-secondary small mt-3">
                                <FontAwesomeIcon icon={faShieldHalved} className="me-2" />
                                Bảo chứng bởi Olla Escrow System
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Order table */}
            <section className="card border-0 shadow-sm rounded-4 overflow-hidden">
                <div className="card-body p-0">
                    {/* Table heading */}
                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 p-3 p-lg-4 border-bottom">
                        <div>
                            <h5 className="fw-bold mb-1">Đơn hàng mới nhất</h5>

                            <p className="text-secondary small mb-0">
                                Theo dõi đơn đặt, sản phẩm và xưởng gia công phụ trách.
                            </p>
                        </div>

                        <span className="badge rounded-pill bg-light text-dark border px-3 py-2">
                            {table.getFilteredRowModel().rows.length} đơn hàng
                        </span>
                    </div>

                    {/* Toolbar */}
                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 p-3 p-lg-4">
                        <div className="input-group" style={{ maxWidth: "350px" }}>
                            <span className="input-group-text bg-white">
                                <FontAwesomeIcon icon={faMagnifyingGlass} />
                            </span>

                            <input
                                type="search"
                                className="form-control"
                                placeholder="Tìm mã đơn, sản phẩm..."
                                value={search}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setSearch(value);
                                    table.setGlobalFilter(value);
                                }}
                            />
                        </div>

                        <select
                            className="form-select w-auto"
                            value={pageSize}
                            onChange={(e) => table.setPageSize(Number(e.target.value))}
                        >
                            {PAGE_SIZES.map((size) => (
                                <option key={size} value={size}>
                                    {size} dòng / trang
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Scrollable table */}
                    <div className="table-responsive admin-table-scroll">
                        <table className="table table-hover align-middle mb-0 admin-order-table">
                            <thead>
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <tr key={headerGroup.id}>
                                        {headerGroup.headers.map((header) => {
                                            const sorted = header.column.getIsSorted();

                                            return (
                                                <th
                                                    key={header.id}
                                                    className="text-nowrap"
                                                >
                                                    {header.isPlaceholder ? null : (
                                                        <div
                                                            className="d-flex align-items-center gap-2"
                                                            onClick={header.column.getToggleSortingHandler()}
                                                            style={{
                                                                cursor: header.column.getCanSort()
                                                                    ? "pointer"
                                                                    : "default",
                                                            }}
                                                        >
                                                            <table.FlexRender
                                                                header={header}
                                                            />

                                                            {header.column.getCanSort() && (
                                                                <FontAwesomeIcon
                                                                    icon={
                                                                        sorted === "asc"
                                                                            ? faArrowDownAZ
                                                                            : sorted === "desc"
                                                                                ? faArrowUpAZ
                                                                                : faSort
                                                                    }
                                                                    className={
                                                                        sorted
                                                                            ? "text-danger"
                                                                            : "text-secondary"
                                                                    }
                                                                    size="sm"
                                                                />
                                                            )}
                                                        </div>
                                                    )}
                                                </th>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </thead>

                            <tbody>
                                {table.getRowModel().rows.map((row) => (
                                    <tr key={row.id}>
                                        {row.getAllCells().map((cell) => (
                                            <td key={cell.id}>
                                                <table.FlexRender cell={cell} />
                                            </td>
                                        ))}
                                    </tr>
                                ))}

                                {table.getRowModel().rows.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={table.getHeaderGroups()[0]?.headers.length ?? 1}
                                            className="text-center py-5 text-secondary"
                                        >
                                            Chưa có đơn hàng nào.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Table footer */}
                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 px-3 px-lg-4 py-3 border-top">
                        <span className="text-secondary small">
                            Tổng cộng {table.getFilteredRowModel().rows.length} bản ghi
                        </span>

                        <div className="d-flex align-items-center gap-2">
                            <button
                                type="button"
                                className="btn btn-sm btn-outline-secondary"
                                onClick={() => table.previousPage()}
                                disabled={!table.getCanPreviousPage()}
                            >
                                <FontAwesomeIcon icon={faChevronLeft} />
                            </button>

                            <span className="small text-secondary">
                                Trang {pageIndex + 1} / {Math.max(table.getPageCount(), 1)}
                            </span>

                            <button
                                type="button"
                                className="btn btn-sm btn-outline-secondary"
                                onClick={() => table.nextPage()}
                                disabled={!table.getCanNextPage()}
                            >
                                <FontAwesomeIcon icon={faChevronRight} />
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}

export default OperationsOverview;