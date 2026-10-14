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
    faTruckFast,
    faStar,
    faTriangleExclamation,
    faChevronLeft,
    faChevronRight,
    faClock,
    faShop,
    faShieldHalved,
    faCalendarCheck,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import PageHeader from "./PageHeader";
import StatCard from "./StartCard";
import CustomBadge from "../badge/CustomBadge";
import { ModalApprove } from "./ModalApprove";
import "../../../css/pages/dashboard/dashboard.css";

type OrderStatus = "Chờ xác nhận" | "Đang chuẩn bị hàng" | "Đã giao" | "Đã hủy";

interface OrderTable {
    code: string;
    time: string;
    customer: string;
    shop: string;
    product: string;
    notes: string;
    totalAmount: number;
    deadline: string;
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

const formatVnd = (value: number) => value.toLocaleString("vi-VN") + " ₫";

export const ExampleData: OrderTable[] = [
    {
        code: "DH-2026-1024",
        time: "10 phút trước",
        customer: "Nguyễn Hoàng Nam",
        shop: "Maison De Saigon",
        product: "Amber Oud EDP 50ml (SL: 200 chai)",
        notes: "Trầm hương Lào & hổ phách",
        totalAmount: 45000000,
        deadline: "Hạn giao: 25/10/2026",
        status: "Chờ xác nhận",
    },
    {
        code: "DH-2026-1025",
        time: "2 giờ trước",
        customer: "Trần Minh Thư",
        shop: "L'Apothiquaire Indie",
        product: "White Tea & Fig EDP 30ml (SL: 500 chai)",
        notes: "Trà trắng, sung ngọt & xạ hương",
        totalAmount: 82500000,
        deadline: "Hạn giao: 28/10/2026",
        status: "Đang chuẩn bị hàng",
    },
    {
        code: "DH-2026-1026",
        time: "1 ngày trước",
        customer: "Lê Quốc Bảo",
        shop: "Scent Studio VN",
        product: "Vetiver Bourbon Extrait 100ml (SL: 150 chai)",
        notes: "Cỏ hương bài & gỗ tuyết tùng",
        totalAmount: 60000000,
        deadline: "Đã giao đúng hạn",
        status: "Đã giao",
    },
];

export const cancelReasons: CancelReason[] = [
    { label: "Khách đổi ý / Thay đổi yêu cầu mùi hương", percent: 45, count: 4, color: "var(--color-info)" },
    { label: "Hết nguyên liệu / Tạm ngừng nhận mẫu này", percent: 30, count: 3, color: "var(--color-primary)" },
    { label: "Không thống nhất được thời gian giao hàng", percent: 15, count: 1, color: "var(--color-warning)" },
    { label: "Xưởng xác nhận trễ hạn (Quá 24h)", percent: 10, count: 1, color: "var(--color-neutral)" },
];

export const revenueItems: RevenueItem[] = [
    { label: "Đã đối soát (Có thể rút về ngân hàng)", amount: 285000000, percent: 63.3, color: "var(--color-success)" },
    { label: "Chờ đối soát (Đơn đang xử lý / chờ khách nhận)", amount: 112500000, percent: 25.0, color: "var(--color-warning)" },
    { label: "Phí cố định & Hoa hồng sàn (Commission Fee)", amount: 36000000, percent: 8.0, color: "var(--color-info)" },
    { label: "Đang tạm giữ do Khiếu nại / Trả hàng", amount: 16500000, percent: 3.7, color: "var(--color-primary)", highlight: true },
];

export const OrderStatusBadge: Record<OrderStatus, { label: string; badge: string }> = {
    "Chờ xác nhận": {
        label: "Chờ xác nhận",
        badge: "bg-warning-subtle text-warning-emphasis",
    },
    "Đang chuẩn bị hàng": {
        label: "Đang chuẩn bị hàng",
        badge: "bg-primary-subtle text-primary-emphasis",
    },
    "Đã giao": {
        label: "Hoàn thành",
        badge: "bg-success-subtle text-success-emphasis",
    },
    "Đã hủy": {
        label: "Đã hủy",
        badge: "bg-secondary-subtle text-secondary-emphasis",
    },
};

const PAGE_SIZES = [5, 10, 20, 50];
const TOTAL_SELLER_REVENUE = 450000000;

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
        header: "Mã đơn / Khách đặt hàng",
        cell: info => {
            const row = info.row.original;

            return (
                <div className="d-flex flex-column gap-1">
                    {/* Đặt Mã đơn và Thời gian nằm cùng 1 hàng ngang */}
                    <div className="d-flex align-items-center flex-wrap gap-2">
                        <b>{row.code}</b>

                        <span className="small text-muted">
                            <FontAwesomeIcon icon={faClock} className="me-1" />
                            {row.time}
                        </span>
                    </div>

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
        header: "Sản phẩm đặt gia công",
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

    columnHelper.accessor("totalAmount", {
        header: "Giá trị đơn / Hạn giao",
        cell: info => {
            const row = info.row.original;

            return (
                <div className="d-flex flex-column gap-1">
                    <span className="fw-bold text-dark">{formatVnd(row.totalAmount)}</span>

                    <span className="badge bg-info-subtle text-info-emphasis fw-normal align-self-start">
                        <FontAwesomeIcon icon={faCalendarCheck} className="me-1" />
                        {row.deadline}
                    </span>
                </div>
            );
        },
        sortFn: "basic",
    }),

    columnHelper.accessor("status", {
        header: "Trạng thái đơn",
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
interface OperationsOverviewProps {
    isShow?: boolean;
}
function OperationsOverview({ isShow }: OperationsOverviewProps) {
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
            {/* Header Kênh Người Bán */}
            <PageHeader
                title="Kênh Người Bán & Đối Tác Gia Công - Mộc Perfume Lab"
                pendingCount={5}
                onApprove={() => setShowApprove(true)}
                isShow={isShow}
            />

            <ModalApprove show={showApprove} onClose={() => setShowApprove(false)} />

            {/* Statistic cards */}
            <section className="row g-3">
                <div className="col-12 col-md-6 col-xl-3">
                    <StatCard
                        label="Đơn đặt hàng của Shop"
                        value="36"
                        icon={faBagShopping}
                        tone="danger"
                        note="5 đơn mới chờ xác nhận"
                    />
                </div>

                <div className="col-12 col-md-6 col-xl-3">
                    <StatCard
                        label="Tỷ lệ giao hàng đúng hạn"
                        value="96.8%"
                        icon={faTruckFast}
                        tone="success"
                        note="Đạt chuẩn Shop Uy Tín"
                    />
                </div>

                <div className="col-12 col-md-6 col-xl-3">
                    <StatCard
                        label="Đánh giá Gian hàng & Hồ sơ"
                        value="4.9 / 5"
                        icon={faStar}
                        tone="info"
                        actionText="128 đánh giá từ khách"
                    />
                </div>

                <div className="col-12 col-md-6 col-xl-3">
                    <StatCard
                        label="Trả hàng / Hoàn tiền / Khiếu nại"
                        value="01"
                        icon={faTriangleExclamation}
                        tone="warning"
                        actionText="Phản hồi khiếu nại"
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
                                    <h5 className="fw-bold mb-1">Tỷ lệ đơn hủy của Shop</h5>
                                    <p className="text-secondary small mb-0">
                                        Giới hạn cho phép của sàn: &lt; 4.0%
                                    </p>
                                </div>

                                <span className="badge rounded-pill bg-light text-dark border px-3 py-2">
                                    2.4%
                                </span>
                            </div>

                            <div className="d-flex align-items-center gap-4 flex-wrap">
                                <DonutChart
                                    data={cancelReasons.map((r) => ({
                                        name: r.label,
                                        value: r.percent,
                                        color: r.color,
                                    }))}
                                    centerValue="2.4%"
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
                                <h5 className="fw-bold mb-1">Doanh thu & Ví Người Bán</h5>
                                <p className="text-secondary small mb-0">
                                    Tổng doanh thu đơn hàng tháng này: {formatVnd(TOTAL_SELLER_REVENUE)}
                                </p>
                            </div>

                            <div className="d-flex align-items-center gap-4 flex-wrap">
                                <DonutChart
                                    data={revenueItems.map((r) => ({
                                        name: r.label,
                                        value: r.percent,
                                        color: r.color,
                                    }))}
                                    centerValue="63.3%"
                                    centerLabel="THỰC NHẬN"
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
                                Sàn tự động giải ngân vào Ví Người Bán sau khi khách xác nhận đã nhận hàng
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
                            <h5 className="fw-bold mb-1">Đơn đặt hàng từ khách</h5>

                            <p className="text-secondary small mb-0">
                                Quản lý đơn khách đặt qua sàn, giá trị thanh toán và thời hạn giao hàng.
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
                                placeholder="Tìm mã đơn, tên khách, sản phẩm..."
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