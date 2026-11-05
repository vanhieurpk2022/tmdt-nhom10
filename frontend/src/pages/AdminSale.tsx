import type { Voucher } from "../models/Voucher";
import { VourcherStatusAdmin } from "../enums/VourcherStatusAdmin";
import {
    createFilteredRowModel,
    createColumnHelper,
    createSortedRowModel,
    tableFeatures,
    useTable,
    rowSortingFeature,
    columnFilteringFeature,
    globalFilteringFeature,
    filterFn_includesString,
    sortFn_alphanumeric,
    sortFn_basic,
    sortFn_datetime,
} from "@tanstack/react-table";
import {
    faArrowDownAZ,
    faArrowUpAZ,
    faSort,
    faTicket,
    faMoneyBill,
    faChartSimple,
    faCartShopping,
    faPlus,
    faMagnifyingGlass,
} from "@fortawesome/free-solid-svg-icons";
import { DiscountTypeAdmin } from "../enums/DiscountTypeAdmin";
import { VoucherStatusBadge } from "../models/VoucherStatusBadge";
import { faEye, faPause, faPenToSquare, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import SidebarAdmin from "../components/admin/dashboard/SideBarAdmin";
import { useAdminSidebar } from "../api/AdminSidebarContext";
import StatCard from "../components/admin/dashboard/StartCard";
import PromotionEffectChart from "../components/admin/statistics/PromotionEffectChart";
import { useState } from "react";

const ExampleData: Voucher[] = [
    {
        id: 1,
        code: "SALE1",
        discountType: DiscountTypeAdmin.PERCENT,
        discountValue: 20,
        maxDiscountAmount: 100000,
        minOrderValue: 500000,
        usageLimit: 100,
        usedCount: 50,
        startDate: "2023-12-01T00:00:00Z",
        endDate: "2023-12-31T23:59:59Z",
        status: `${VourcherStatusAdmin.RUNNING}`,
    },
    {
        id: 2,
        code: "SALE2",
        discountType: DiscountTypeAdmin.FIXED,
        discountValue: 50000,
        maxDiscountAmount: 100000,
        minOrderValue: 500000,
        usageLimit: 100,
        usedCount: 50,
        startDate: "2023-12-01T00:00:00Z",
        endDate: "2023-12-31T23:59:59Z",
        status: VourcherStatusAdmin.RUNNING
    }
];
const features = tableFeatures({
    rowSortingFeature,
    columnFilteringFeature,
    globalFilteringFeature,

    sortedRowModel: createSortedRowModel(),
    filteredRowModel: createFilteredRowModel(),

    sortFns: {
        alphanumeric: sortFn_alphanumeric,
        basic: sortFn_basic,
        datetime: sortFn_datetime,
    },

    filterFns: {
        includesString: filterFn_includesString,
    },
});
const columnHelper = createColumnHelper<typeof features, Voucher>();
const columns = columnHelper.columns([
    columnHelper.accessor("code", {
        header: "Mã giảm giá",
        cell: info => <b>{info.getValue()}</b>,
        sortFn: "alphanumeric",
    }),
    columnHelper.accessor("discountType", {
        header: "Loại giảm giá",
        cell: info => info.getValue(),
    }),
    columnHelper.accessor("discountValue", {
        header: "Mức giảm giá",
        cell: info => {
            const value = info.row.original;;
            return value.discountType === DiscountTypeAdmin.PERCENT ?
                `${value.discountValue}%`
                : `${value.discountValue.toLocaleString("vi-VN")}đ`;;
        },
    }),
    columnHelper.accessor("maxDiscountAmount", {
        header: "Giảm tối đa",
        cell: info => info.getValue(),
    }),
    columnHelper.accessor("minOrderValue", {
        header: "Giá trị đơn tối thiểu",
        cell: info => info.getValue(),
    }),
    columnHelper.accessor("usageLimit", {
        header: "Số lượng",
        cell: info => info.getValue(),
    }),
    columnHelper.accessor("usedCount", {
        header: "Đã sử dụng",
        cell: info => info.getValue(),
    }),
    columnHelper.accessor("startDate", {
        header: "Ngày bắt đầu",
        cell: info => new Date(info.getValue()).toLocaleDateString(),
    }),
    columnHelper.accessor("endDate", {
        header: "Hết hạn",
        cell: info => new Date(info.getValue()).toLocaleDateString("vi-VN"),
    }),
    columnHelper.accessor("status", {
        header: "Trạng thái",
        cell: info => {
            const status = info.getValue();
            const config = VoucherStatusBadge[status];

            return (
                <span className={`badge ${config.badge}`}>
                    {config.label}
                </span>
            );
        },
    }),
    columnHelper.display({
        id: "actions",
        header: "Hành động",
        cell: info => {
            const voucher = info.row.original;
            return (
                <div className="d-flex align-items-center gap-2 ">
                    {/* Xem chi tiết */}
                    <button type="button" className="btn btn-sm btn-outline-primary" title="Xem chi tiết">
                        <FontAwesomeIcon icon={faEye} />
                    </button>

                    {/* Chỉnh sửa */}
                    <button
                        type="button"
                        className="btn btn-sm btn-outline-warning"
                        title="Chỉnh sửa"
                    >
                        <FontAwesomeIcon icon={faPenToSquare} />
                    </button>

                    {/* Tạm dừng */}
                    <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary"
                        title="Tạm dừng"
                        disabled={voucher.status !== VourcherStatusAdmin.RUNNING}
                    >
                        <FontAwesomeIcon icon={faPause} />
                    </button>

                    {/* Xóa */}
                    <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        title="Xóa"
                    >
                        <FontAwesomeIcon icon={faTrash} />
                    </button>
                </div>
            );
        }


    }),
]);

export function AdminSale() {
    const [search, setSearch] = useState("");

    const table = useTable({
        data: ExampleData,
        columns,
        features,
    });


    const { isCollapsed } = useAdminSidebar();

    return (
        <div className="d-flex min-vh-100 bg-light">
            {/* Sidebar */}
            <aside
                className="flex-shrink-0 position-sticky top-0 align-self-start"
                style={{
                    height: "100vh",
                    width: isCollapsed ? "72px" : "250px",
                    transition: "width 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
            >
                <SidebarAdmin isVoucher={true} />
            </aside>

            {/* Main content */}
            <main className="flex-grow-1 p-3 p-lg-4 admin-content overflow-x-auto" style={{ minWidth: 0 }}>
                {/* Header */}
                <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-4">
                    <div>
                        <div className="text-danger fw-semibold small mb-2">
                            QUẢN LÝ BÁN HÀNG
                        </div>

                        <h2 className="fw-bold text-dark mb-2">
                            Quản lý khuyến mãi
                        </h2>

                        <p className="text-secondary mb-0">
                            Điều phối ngân sách trợ giá toàn sàn, tối ưu tỷ lệ
                            chuyển đổi cho xưởng chưng cất và khách hàng Oilia.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="btn btn-danger d-inline-flex align-items-center gap-2 px-4 py-2 fw-semibold shadow-sm admin-create-btn"
                    >
                        <FontAwesomeIcon icon={faPlus} />
                        Tạo khuyến mãi
                    </button>
                </div>

                {/* Statistic cards */}
                <section className="row g-3 mb-4">
                    <div className="col-12 col-md-6 col-xxl-3">
                        <StatCard
                            label="TỔNG VOUCHER ĐANG CHẠY"
                            value="12"
                            icon={faTicket}
                            tone="danger"
                            note="Chiến dịch hoạt động"
                        />
                    </div>

                    <div className="col-12 col-md-6 col-xxl-3">
                        <StatCard
                            label="NGÂN SÁCH TRỢ GIÁ SÀN"
                            value="145.000.000đ"
                            icon={faMoneyBill}
                            tone="success"
                            note="Hạn mức tháng: 250M"
                        />
                    </div>

                    <div className="col-12 col-md-6 col-xxl-3">
                        <StatCard
                            label="DOANH THU KÍCH CẦU"
                            value="890.000.000đ"
                            icon={faChartSimple}
                            tone="info"
                            actionText="Giám định sản"
                        />
                    </div>

                    <div className="col-12 col-md-6 col-xxl-3">
                        <StatCard
                            label="TỶ LỆ CHUYỂN ĐỔI VOUCHER"
                            value="28.4%"
                            icon={faCartShopping}
                            tone="warning"
                            actionText="Độ phản hồi giỏ hàng"
                        />
                    </div>
                </section>

                {/* Promotion chart */}
                <section className="mb-4">
                    <PromotionEffectChart />
                </section>

                {/* Voucher table */}
                <section className="card border-0 shadow-sm rounded-4 overflow-hidden">
                    <div className="card-body p-0">
                        {/* Table heading */}
                        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 p-3 p-lg-4 border-bottom">
                            <div>
                                <h5 className="fw-bold mb-1">
                                    Danh sách khuyến mãi
                                </h5>
                                <p className="text-secondary small mb-0">
                                    Quản lý và theo dõi các voucher trên toàn sàn
                                </p>
                            </div>

                            <span className="badge rounded-pill bg-light text-dark border px-3 py-2">
                                {table.getRowModel().rows.length} voucher
                            </span>
                        </div>

                        {/* Scrollable table */}
                        <div className="table-responsive admin-table-scroll">
                            <div className="input-group mb-3" style={{ maxWidth: "350px" }}>
                                <span className="input-group-text bg-white">
                                    <FontAwesomeIcon icon={faMagnifyingGlass} />
                                </span>

                                <input
                                    type="search"
                                    className="form-control"
                                    placeholder="Tìm mã voucher, trạng thái..."
                                    value={search}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setSearch(value);
                                        table.setGlobalFilter(value);
                                    }}
                                />
                            </div>
                            <table className="table table-hover align-middle mb-0 admin-voucher-table">
                                <thead>
                                    {table.getHeaderGroups().map((headerGroup) => (
                                        <tr key={headerGroup.id}>
                                            {headerGroup.headers.map((header) => {
                                                const sorted =
                                                    header.column.getIsSorted();

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
                                                Chưa có voucher nào.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Table footer */}
                        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 px-3 px-lg-4 py-3 border-top">
                            <span className="text-secondary small">
                                Tổng cộng {table.getRowModel().rows.length} bản ghi
                            </span>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}