import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";

/**
 * DataTable<T> (React + TypeScript + Bootstrap 5.3)
 * Yêu cầu: đã import Bootstrap CSS trong app:
 *   import "bootstrap/dist/css/bootstrap.min.css";
 */

export type RowKey = string | number;

export interface Column<T> {
    /** id duy nhất của cột */
    key: string;
    title: ReactNode;
    /** Trường lấy dữ liệu trong row (mặc định = key) */
    dataIndex?: keyof T & string;
    /** value có kiểu any để bạn tự ép kiểu ở nơi dùng: render: (v: number) => ... */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    render?: (value: any, row: T, index: number) => ReactNode;
    width?: number | string;
    align?: "start" | "center" | "end";
    sortable?: boolean;
    /** Tuỳ chọn, mặc định so sánh theo dataIndex */
    sorter?: (a: T, b: T) => number;
}

export interface DataTableProps<T> {
    data: T[];
    columns: Column<T>[];
    /** Tên trường làm khoá, hoặc hàm trả về khoá. Mặc định "id" */
    rowKey?: (keyof T & string) | ((row: T) => RowKey);
    selectable?: boolean;
    /** Truyền vào để dùng chế độ controlled */
    selectedRowKeys?: RowKey[];
    onSelectionChange?: (keys: RowKey[], rows: T[]) => void;
    pageSizeOptions?: number[];
    defaultPageSize?: number;
    /** Vd: "đối tác" -> "Tổng cộng: 5 đối tác" */
    totalLabel?: string;
    loading?: boolean;
    emptyText?: ReactNode;
    onRowClick?: (row: T) => void;
    rowClassName?: (row: T) => string;
    /** Nội dung chèn phía trên bảng, bên trong khung card (vd: thanh tổng số + nút hành động) */
    header?: ReactNode;
}

type SortState = { key: string | null; dir: "asc" | "desc" };

export default function DataTable<T extends object>({
    data,
    columns,
    rowKey = "id" as keyof T & string,
    selectable = false,
    selectedRowKeys,
    onSelectionChange,
    pageSizeOptions = [10, 20, 50],
    defaultPageSize = 10,
    totalLabel = "bản ghi",
    loading = false,
    emptyText = "Không có dữ liệu",
    onRowClick,
    rowClassName,
    header,
}: DataTableProps<T>) {
    const getKey = (row: T, i: number): RowKey =>
        typeof rowKey === "function" ? rowKey(row) : ((row[rowKey] as RowKey | undefined) ?? i);

    /* ---------- sắp xếp ---------- */
    const [sort, setSort] = useState<SortState>({ key: null, dir: "asc" });

    const sortedData = useMemo<T[]>(() => {
        if (!sort.key) return data;
        const col = columns.find((c) => c.key === sort.key);
        if (!col) return data;
        const field = (col.dataIndex ?? col.key) as keyof T;

        const cmp =
            col.sorter ??
            ((a: T, b: T) => {
                const x = a[field] as unknown;
                const y = b[field] as unknown;
                if (x == null) return 1;
                if (y == null) return -1;
                if (typeof x === "number" && typeof y === "number") return x - y;
                return String(x).localeCompare(String(y), "vi");
            });

        const sorted = [...data].sort(cmp);
        return sort.dir === "asc" ? sorted : sorted.reverse();
    }, [data, columns, sort]);

    const toggleSort = (col: Column<T>) => {
        if (!col.sortable) return;
        setSort((s) =>
            s.key !== col.key
                ? { key: col.key, dir: "asc" }
                : s.dir === "asc"
                    ? { key: col.key, dir: "desc" }
                    : { key: null, dir: "asc" }
        );
    };

    /* ---------- phân trang ---------- */
    const [pageSize, setPageSize] = useState<number>(defaultPageSize);
    const [page, setPage] = useState<number>(1);
    const total = sortedData.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    useEffect(() => {
        if (page > totalPages) setPage(totalPages);
    }, [page, totalPages]);

    const pageRows = useMemo(
        () => sortedData.slice((page - 1) * pageSize, page * pageSize),
        [sortedData, page, pageSize]
    );

    const pageNumbers = useMemo(() => {
        const maxBtn = 5;
        let start = Math.max(1, page - Math.floor(maxBtn / 2));
        const end = Math.min(totalPages, start + maxBtn - 1);
        start = Math.max(1, end - maxBtn + 1);
        return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    }, [page, totalPages]);

    /* ---------- chọn dòng ---------- */
    const [innerKeys, setInnerKeys] = useState<RowKey[]>([]);
    const isControlled = selectedRowKeys !== undefined;
    const selectedKeys = isControlled ? selectedRowKeys : innerKeys;
    const selectedSet = useMemo(() => new Set<RowKey>(selectedKeys), [selectedKeys]);

    const commitSelection = (keys: RowKey[]) => {
        if (!isControlled) setInnerKeys(keys);
        const set = new Set(keys);
        onSelectionChange?.(
            keys,
            data.filter((r, i) => set.has(getKey(r, i)))
        );
    };

    const pageKeys = pageRows.map((r, i) => getKey(r, i));
    const selectedOnPage = pageKeys.filter((k) => selectedSet.has(k)).length;
    const allChecked = pageKeys.length > 0 && selectedOnPage === pageKeys.length;
    const someChecked = selectedOnPage > 0 && !allChecked;

    const headRef = useRef<HTMLInputElement>(null);
    useEffect(() => {
        if (headRef.current) headRef.current.indeterminate = someChecked;
    }, [someChecked]);

    const toggleAll = () => {
        const next = new Set(selectedSet);
        pageKeys.forEach((k) => (allChecked ? next.delete(k) : next.add(k)));
        commitSelection([...next]);
    };

    const toggleRow = (key: RowKey) => {
        const next = new Set(selectedSet);
        if (next.has(key)) next.delete(key);
        else next.add(key);
        commitSelection([...next]);
    };

    const colSpan = columns.length + (selectable ? 1 : 0);

    return (
        <div className="card border shadow-sm rounded-4 overflow-hidden">
            {header}
            <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                        <tr className="small text-uppercase text-body-secondary">
                            {selectable && (
                                <th className="ps-4" style={{ width: 48 }}>
                                    <input
                                        ref={headRef}
                                        type="checkbox"
                                        className="form-check-input"
                                        checked={allChecked}
                                        onChange={toggleAll}
                                        aria-label="Chọn tất cả các dòng trong trang"
                                    />
                                </th>
                            )}
                            {columns.map((col) => {
                                const active = sort.key === col.key;
                                return (
                                    <th
                                        key={col.key}
                                        scope="col"
                                        className={`py-3 text-nowrap text-${col.align ?? "start"} ${col.sortable ? "user-select-none" : ""
                                            }`}
                                        style={{ width: col.width, cursor: col.sortable ? "pointer" : undefined }}
                                        aria-sort={
                                            active ? (sort.dir === "asc" ? "ascending" : "descending") : undefined
                                        }
                                        onClick={() => toggleSort(col)}
                                    >
                                        {col.title}
                                        {col.sortable && (
                                            <span
                                                className={`ms-1 ${active ? "text-danger" : "opacity-50"}`}
                                                style={{ fontSize: 9 }}
                                            >
                                                {active ? (sort.dir === "asc" ? "▲" : "▼") : "↕"}
                                            </span>
                                        )}
                                    </th>
                                );
                            })}
                        </tr>
                    </thead>

                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={colSpan} className="text-center text-body-secondary py-5">
                                    <span className="spinner-border spinner-border-sm me-2" role="status" />
                                    Đang tải dữ liệu…
                                </td>
                            </tr>
                        ) : pageRows.length === 0 ? (
                            <tr>
                                <td colSpan={colSpan} className="text-center text-body-secondary py-5">
                                    {emptyText}
                                </td>
                            </tr>
                        ) : (
                            pageRows.map((row, i) => {
                                const key = getKey(row, i);
                                const checked = selectedSet.has(key);
                                return (
                                    <tr
                                        key={key}
                                        className={[checked ? "table-active" : "", rowClassName?.(row) ?? ""].join(" ")}
                                        style={onRowClick ? { cursor: "pointer" } : undefined}
                                        onClick={() => onRowClick?.(row)}
                                    >
                                        {selectable && (
                                            <td className="ps-4" onClick={(e) => e.stopPropagation()}>
                                                <input
                                                    type="checkbox"
                                                    className="form-check-input"
                                                    checked={checked}
                                                    onChange={() => toggleRow(key)}
                                                    aria-label="Chọn dòng"
                                                />
                                            </td>
                                        )}
                                        {columns.map((col) => {
                                            const value = row[(col.dataIndex ?? col.key) as keyof T];
                                            return (
                                                <td key={col.key} className={`py-3 text-${col.align ?? "start"}`}>
                                                    {col.render ? col.render(value, row, i) : ((value as ReactNode) ?? "—")}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            <div className="card-footer bg-white d-flex flex-wrap justify-content-between align-items-center gap-3 px-4 py-3">
                <div className="d-flex align-items-center gap-3 small text-body-secondary">
                    <label className="d-flex align-items-center gap-2 mb-0">
                        Dòng hiển thị:
                        <select
                            className="form-select form-select-sm w-auto"
                            value={pageSize}
                            onChange={(e) => {
                                setPageSize(Number(e.target.value));
                                setPage(1);
                            }}
                        >
                            {pageSizeOptions.map((n) => (
                                <option key={n} value={n}>
                                    {n} dòng
                                </option>
                            ))}
                        </select>
                    </label>
                    <span>
                        Tổng cộng: {total} {totalLabel}
                    </span>
                </div>

                <div className="d-flex align-items-center gap-3">
                    <span className="small text-body-secondary">
                        Trang {page} trên {totalPages}
                    </span>
                    <nav aria-label="Phân trang">
                        <ul className="pagination pagination-sm mb-0">
                            <li className={`page-item ${page <= 1 ? "disabled" : ""}`}>
                                <button type="button" className="page-link" onClick={() => setPage(page - 1)}>
                                    Trước
                                </button>
                            </li>
                            {pageNumbers.map((n) => (
                                <li key={n} className={`page-item ${n === page ? "active" : ""}`}>
                                    <button
                                        type="button"
                                        className="page-link"
                                        onClick={() => setPage(n)}
                                        aria-current={n === page ? "page" : undefined}
                                    >
                                        {n}
                                    </button>
                                </li>
                            ))}
                            <li className={`page-item ${page >= totalPages ? "disabled" : ""}`}>
                                <button type="button" className="page-link" onClick={() => setPage(page + 1)}>
                                    Tiếp theo
                                </button>
                            </li>
                        </ul>
                    </nav>
                </div>
            </div>
        </div>
    );
}