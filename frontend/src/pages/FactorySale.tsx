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
import SideBarFactory from "../components/admin/factory/SideBarFactory";
import StatCard from "../components/admin/dashboard/StartCard";
import { useState } from "react";
import "../css/pages/dashboard/admin.css";
import "../css/pages/dashboard/dashboard.css";

const ExampleData: Voucher[] = [
    {
        id: 1,
        code: "SHOP10",
        discountType: DiscountTypeAdmin.PERCENT,
        discountValue: 10,
        maxDiscountAmount: 50000,
        minOrderValue: 200000,
        usageLimit: 100,
        usedCount: 35,
        startDate: "2026-10-01T00:00:00Z",
        endDate: "2026-10-31T23:59:59Z",
        status: VourcherStatusAdmin.RUNNING,
    },
    {
        id: 2,
        code: "FREESHIP",
        discountType: DiscountTypeAdmin.FIXED,
        discountValue: 30000,
        maxDiscountAmount: 30000,
        minOrderValue: 100000,
        usageLimit: 200,
        usedCount: 120,
        startDate: "2026-10-01T00:00:00Z",
        endDate: "2026-10-31T23:59:59Z",
        status: VourcherStatusAdmin.RUNNING,
    },
    {
        id: 3,
        code: "NEWUSER",
        discountType: DiscountTypeAdmin.PERCENT,
        discountValue: 15,
        maxDiscountAmount: 80000,
        minOrderValue: 300000,
        usageLimit: 50,
        usedCount: 50,
        startDate: "2026-09-01T00:00:00Z",
        endDate: "2026-09-30T23:59:59Z",
        status: VourcherStatusAdmin.EXPIRED,
    },
    {
        id: 4,
        code: "XMAS2026",
        discountType: DiscountTypeAdmin.PERCENT,
        discountValue: 20,
        maxDiscountAmount: 100000,
        minOrderValue: 500000,
        usageLimit: 500,
        usedCount: 0,
        startDate: "2026-12-20T00:00:00Z",
        endDate: "2026-12-31T23:59:59Z",
        status: VourcherStatusAdmin.SCHEDULED,
    },
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
        cell: info => (info.getValue() === DiscountTypeAdmin.PERCENT ? "Phần trăm" : "Cố định"),
    }),
    columnHelper.accessor("discountValue", {
        header: "Mức giảm",
        cell: info => {
            const value = info.row.original;
            return value.discountType === DiscountTypeAdmin.PERCENT
                ? `${value.discountValue}%`
                : `${value.discountValue.toLocaleString("vi-VN")}đ`;
        },
    }),
    columnHelper.accessor("maxDiscountAmount", {
        header: "Giảm tối đa",
        cell: info => {
            const v = info.getValue();
            return v !== null ? `${v.toLocaleString("vi-VN")}đ` : "–";
        },
    }),
    columnHelper.accessor("minOrderValue", {
        header: "Đơn tối thiểu",
        cell: info => `${info.getValue().toLocaleString("vi-VN")}đ`,
    }),
    columnHelper.accessor("usageLimit", {
        header: "Số lượng",
        cell: info => info.getValue(),
    }),
    columnHelper.accessor("usedCount", {
        header: "Đã dùng",
        cell: info => info.getValue(),
    }),
    columnHelper.accessor("startDate", {
        header: "Bắt đầu",
        cell: info => new Date(info.getValue()).toLocaleDateString("vi-VN"),
        sortFn: "datetime",
    }),
    columnHelper.accessor("endDate", {
        header: "Kết thúc",
        cell: info => new Date(info.getValue()).toLocaleDateString("vi-VN"),
        sortFn: "datetime",
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
                <div className="d-flex align-items-center gap-2">
                    <button type="button" className="btn btn-sm btn-outline-primary" title="Xem chi tiết">
                        <FontAwesomeIcon icon={faEye} />
                    </button>
                    <button type="button" className="btn btn-sm btn-outline-warning" title="Chỉnh sửa">
                        <FontAwesomeIcon icon={faPenToSquare} />
                    </button>
                    <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary"
                        title="Tạm dừng"
                        disabled={voucher.status !== VourcherStatusAdmin.RUNNING}
                    >
                        <FontAwesomeIcon icon={faPause} />
                    </button>
                    <button type="button" className="btn btn-sm btn-outline-danger" title="Xóa">
                        <FontAwesomeIcon icon={faTrash} />
                    </button>
                </div>
            );
        },
    }),
]);

export default function FactorySale() {
    const [search, setSearch] = useState("");

    const table = useTable({
        data: ExampleData,
        columns,
        features,
    });

    const runningCount = ExampleData.filter(v => v.status === VourcherStatusAdmin.RUNNING).length;
    const scheduledCount = ExampleData.filter(v => v.status === VourcherStatusAdmin.SCHEDULED).length;

    return (
        <div className="row g-0 min-vh-100 bg-light">
            <aside
                className="col-12 col-xl-2 flex-shrink-0 position-sticky top-0 align-self-start"
                style={{ height: "100vh" }}
            >
                <SideBarFactory isVoucher={true} />
            </aside>

            <main className="col-12 col-xl-10 p-3 p-lg-4 admin-content overflow-x-auto">
                {/* Header */}
                <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-4">
                    <div>
                        <div className="text-danger fw-semibold small mb-2">
                            QUẢN LÝ KHUYẾN MÃI
                        </div>
                        <h2 className="fw-bold text-dark mb-2">
                            Khuyến mãi gian hàng
                        </h2>
                        <p className="text-secondary mb-0">
                            Tạo và quản lý các chương trình khuyến mãi, voucher giảm giá cho gian hàng của bạn.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="btn btn-danger d-inline-flex align-items-center gap-2 px-4 py-2 fw-semibold shadow-sm"
                    >
                        <FontAwesomeIcon icon={faPlus} />
                        Tạo khuyến mãi
                    </button>
                </div>

                {/* Statistic cards */}
                <section className="row g-3 mb-4">
                    <div className="col-12 col-md-6 col-xxl-3">
                        <StatCard
                            label="VOUCHER ĐANG CHẠY"
                            value={String(runningCount)}
                            icon={faTicket}
                            tone="danger"
                            note="Đang hoạt động"
                        />
                    </div>
                    <div className="col-12 col-md-6 col-xxl-3">
                        <StatCard
                            label="SẮP DIỄN RA"
                            value={String(scheduledCount)}
                            icon={faMoneyBill}
                            tone="warning"
                            note="Chờ kích hoạt"
                        />
                    </div>
                    <div className="col-12 col-md-6 col-xxl-3">
                        <StatCard
                            label="TỔNG LƯỢT SỬ DỤNG"
                            value={String(ExampleData.reduce((s, v) => s + v.usedCount, 0))}
                            icon={faChartSimple}
                            tone="info"
                            note="Tổng lượt đã dùng"
                        />
                    </div>
                    <div className="col-12 col-md-6 col-xxl-3">
                        <StatCard
                            label="TỶ LỆ SỬ DỤNG"
                            value={(() => {
                                const total = ExampleData.reduce((s, v) => s + v.usageLimit, 0);
                                const used = ExampleData.reduce((s, v) => s + v.usedCount, 0);
                                return total > 0 ? `${((used / total) * 100).toFixed(1)}%` : "0%";
                            })()}
                            icon={faCartShopping}
                            tone="success"
                            note="Tỷ lệ voucher được dùng"
                        />
                    </div>
                </section>

                {/* Voucher table */}
                <section className="card border-0 shadow-sm rounded-4 overflow-hidden">
                    <div className="card-body p-0">
                        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 p-3 p-lg-4 border-bottom">
                            <div>
                                <h5 className="fw-bold mb-1">Danh sách voucher</h5>
                                <p className="text-secondary small mb-0">
                                    Quản lý và theo dõi các voucher của gian hàng
                                </p>
                            </div>
                            <span className="badge rounded-pill bg-light text-dark border px-3 py-2">
                                {table.getRowModel().rows.length} voucher
                            </span>
                        </div>

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
                            <table className="table table-hover align-middle mb-0">
                                <thead>
                                    {table.getHeaderGroups().map((headerGroup) => (
                                        <tr key={headerGroup.id}>
                                            {headerGroup.headers.map((header) => {
                                                const sorted = header.column.getIsSorted();
                                                return (
                                                    <th key={header.id} className="text-nowrap">
                                                        {header.isPlaceholder ? null : (
                                                            <div
                                                                className="d-flex align-items-center gap-2"
                                                                onClick={header.column.getToggleSortingHandler()}
                                                                style={{
                                                                    cursor: header.column.getCanSort() ? "pointer" : "default",
                                                                }}
                                                            >
                                                                <table.FlexRender header={header} />
                                                                {header.column.getCanSort() && (
                                                                    <FontAwesomeIcon
                                                                        icon={
                                                                            sorted === "asc" ? faArrowDownAZ
                                                                                : sorted === "desc" ? faArrowUpAZ
                                                                                    : faSort
                                                                        }
                                                                        className={sorted ? "text-danger" : "text-secondary"}
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
