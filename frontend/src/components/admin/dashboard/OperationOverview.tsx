import type { RowData } from "@tanstack/react-table";
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
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";

import PageHeader from "./PageHeader";
import StatCard from "./StartCard";
import "../../../css/pages/dashboard/dashboard.css";
import type { AppTable } from "../../table/features";
import { formatVnd } from "../../format/FormatMoney";
import { PieChartStatistics } from "../statistics/PieChartStatistics";
import { BarChartStatistic } from "../statistics/BarChartStatistic";

// 1. Import 2 component biểu đồ mới (Sửa lại đường dẫn cho đúng với thư mục của bạn)

const TOTAL_SELLER_REVENUE = 450000000;

/* ---------- Props dành riêng cho Factory Dashboard ---------- */
interface OperationsOverviewProps<TData extends RowData> {
    isShow?: boolean;
    table: AppTable<TData>;
    pageIndex: number;
}

function OperationsOverview<TData extends RowData>({
    isShow,
    table,
    pageIndex,
}: OperationsOverviewProps<TData>) {
    const [search, setSearch] = useState("");

    const totalRows = table.getFilteredRowModel().rows.length;
    const hasRows = table.getRowModel().rows.length > 0;
    const isSearching = search.trim() !== "";

    return (
        <main
            className="p-4 d-flex flex-column gap-4"
            style={{ backgroundColor: "var(--color-bg-page)", minHeight: "100vh" }}
        >
            {/* Header Kênh Người Bán */}
            <PageHeader
                title="Kênh Người Bán & Đối Tác Gia Công - Mộc Perfume Lab"
                isShow={isShow}
            />

            {/* Statistic cards */}
            <section className="row g-3">
                <div className="col-12 col-md-6 col-xl-3">
                    <StatCard
                        label="Đơn đặt hàng của Shop"
                        value="36"
                        icon={faBagShopping}
                        tone="danger"
                        note="đơn mới chờ xác nhận"
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

            {/* 2. Khu vực Charts đã được thay bằng CancelRatePieChart và RevenueBarChart */}
            <section className="row g-3">
                {/* Cancel rate PieChart */}
                <div className="col-12 col-xl-5">
                    <PieChartStatistics />
                </div>

                {/* Revenue BarChart */}
                <div className="col-12 col-xl-7">
                    <BarChartStatistic totalRevenue={formatVnd(TOTAL_SELLER_REVENUE)} />
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
                            {totalRows} đơn hàng
                        </span>
                    </div>

                    {/* Toolbar */}
                    <div className="p-3 p-lg-4">
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
                    </div>

                    {/* Scrollable table */}
                    <div className="table-responsive admin-table-scroll">
                        <table className="table table-hover align-middle mb-0 admin-order-table">
                            <thead>
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <tr key={headerGroup.id}>
                                        {headerGroup.headers.map((header) => {
                                            const sorted = header.column.getIsSorted();
                                            const canSort = header.column.getCanSort();

                                            return (
                                                <th key={header.id} className="text-nowrap">
                                                    {header.isPlaceholder ? null : (
                                                        <div
                                                            className="d-flex align-items-center gap-2"
                                                            onClick={header.column.getToggleSortingHandler()}
                                                            style={{ cursor: canSort ? "pointer" : "default" }}
                                                        >
                                                            <table.FlexRender header={header} />

                                                            {canSort && (
                                                                <FontAwesomeIcon
                                                                    icon={
                                                                        sorted === "asc"
                                                                            ? faArrowDownAZ
                                                                            : sorted === "desc"
                                                                                ? faArrowUpAZ
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

                                {!hasRows && (
                                    <tr>
                                        <td
                                            colSpan={table.getHeaderGroups()[0]?.headers.length ?? 1}
                                            className="text-center py-5 text-secondary"
                                        >
                                            {isSearching
                                                ? "Không tìm thấy kết quả phù hợp."
                                                : "Chưa có đơn hàng nào."}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Table footer */}
                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 px-3 px-lg-4 py-3 border-top">
                        <span className="text-secondary small">Tổng cộng {totalRows} bản ghi</span>

                        <div className="d-flex align-items-center gap-2">
                            <button
                                type="button"
                                className="btn btn-sm btn-outline-secondary"
                                onClick={() => table.previousPage()}
                                disabled={!table.getCanPreviousPage()}
                                aria-label="Trang trước"
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
                                aria-label="Trang sau"
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