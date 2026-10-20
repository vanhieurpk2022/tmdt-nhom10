import {
    faArrowDownAZ,
    faArrowUpAZ,
    faChevronLeft,
    faChevronRight,
    faMagnifyingGlass,
    faSort,
} from "@fortawesome/free-solid-svg-icons";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FactoryServiceManager } from "../../../../api/factory/FactoryService";
import { useEffect, useState } from "react";
import type { FactoryProductVariantItem } from "../../../../dto/factory/FactoryProductRes";
import { ProductMil } from "../../../../models/ProductMil";
import type { RowData } from "@tanstack/react-table";
import type { AppTable } from "../../../table/features";

interface VariantTableProps<TData extends RowData> {
    table: AppTable<TData>;
    pageIndex: number;
}
export function VariantTable<TData extends RowData>({ table, pageIndex }: VariantTableProps<TData>) {

    const [search, setSearch] = useState("");
    const totalRows = table.getFilteredRowModel().rows.length;
    const hasRows = table.getRowModel().rows.length > 0;
    const isSearching = search.trim() !== "";

    return (
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

    );
};
