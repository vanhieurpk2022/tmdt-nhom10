import {
    createFilteredRowModel,
    createColumnHelper,
    createSortedRowModel,
    createPaginatedRowModel,
    tableFeatures,
    useTable,
    rowSortingFeature,
    rowPaginationFeature,
    rowSelectionFeature,
    columnFilteringFeature,
    globalFilteringFeature,
    filterFn_includesString,
    sortFn_alphanumeric,
    sortFn_basic,
    type PaginationState,
} from "@tanstack/react-table";
import {
    faArrowDownAZ,
    faArrowUpAZ,
    faSort,
    faMagnifyingGlass,
    faLocationDot,
    faCheck,
    faXmark,
    faFilePdf,
    faFileImage,
    faFile,
    faChevronLeft,
    faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useMemo, useState } from "react";
import axios from "axios";
import "../../../css/pages/dashboard/modal.css";
import type { FactoryRegisterResponse } from "../../../dto/factory/FactoryRegister";
import { AdminService } from "../../../api/admin/AdminApi";
import { FactoryStatus } from "../../../enums/FactoryStatus";

const DEFAULT_THUMB =
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="88" height="88" viewBox="0 0 24 24" fill="none" stroke="#adb5bd" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <rect width="24" height="24" fill="#f1f3f5" stroke="none"/>
            <path d="M3 21h18M5 21V9l5 3V9l5 3V5h4v16"/>
        </svg>`
    );


const getFileIcon = (name: string) => {
    const ext = name.split(".").pop()?.toLowerCase() ?? "";

    if (ext === "pdf") {
        return <FontAwesomeIcon icon={faFilePdf} className="text-danger" />;
    }

    if (["jpg", "jpeg", "png"].includes(ext)) {
        return <FontAwesomeIcon icon={faFileImage} className="text-primary" />;
    }

    return <FontAwesomeIcon icon={faFile} className="text-secondary" />;
};

const features = tableFeatures({
    rowSortingFeature,
    rowPaginationFeature,
    rowSelectionFeature,
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

const columnHelper = createColumnHelper<typeof features, FactoryRegisterResponse>();

interface DataTableProps {
    list: FactoryRegisterResponse[];
    onChanged?: () => void; // component cha truyền xuống để tải lại danh sách
}

export function DataTableApprove({ list, onChanged }: DataTableProps) {
    const [search, setSearch] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [loadingId, setLoadingId] = useState<number | null>(null);
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });

    // Duyệt / hủy hồ sơ: gộp chung, chỉ khác status
    const handleUpdateStatus = async (id: number | undefined, status: FactoryStatus) => {
        if (!id) return;
        setLoadingId(id);
        setErrorMessage("");
        try {
            await AdminService.updateStatusFactory(id, status);
            onChanged?.();
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (!error.response) {
                    setErrorMessage("Không kết nối được máy chủ, vui lòng thử lại");
                } else {
                    setErrorMessage(error.response.data?.message);
                }
            }
        } finally {
            setLoadingId(null);
        }
    };

    const columns = useMemo(
        () =>
            columnHelper.columns([
                columnHelper.display({
                    id: "select",
                    header: ({ table }) => (
                        <input
                            type="checkbox"
                            className="form-check-input"
                            checked={table.getIsAllRowsSelected()}
                            onChange={table.getToggleAllRowsSelectedHandler()}
                        />
                    ),
                    cell: ({ row }) => (
                        <input
                            type="checkbox"
                            className="form-check-input"
                            checked={row.getIsSelected()}
                            onChange={row.getToggleSelectedHandler()}
                        />
                    ),
                    enableSorting: false,
                }),

                columnHelper.accessor("name", {
                    header: "Mã hồ sơ / Tên xưởng",
                    cell: info => {
                        const row = info.row.original;
                        const src = row.avatarUrl?.trim() ? row.avatarUrl : DEFAULT_THUMB;

                        return (
                            <div className="d-flex align-items-center gap-3">
                                <img
                                    className="ws-avatar"
                                    src={src}
                                    alt={row.name}
                                    loading="lazy"
                                    onError={(e) => {
                                        e.currentTarget.onerror = null;
                                        e.currentTarget.src = DEFAULT_THUMB;
                                    }}
                                />

                                <div>
                                    <div className="fw-bold">{row.name}</div>
                                    <span className="badge bg-secondary-subtle text-secondary-emphasis fw-normal">
                                        HS-{String(row.id).padStart(4, "0")}
                                    </span>
                                </div>
                            </div>
                        );
                    },
                    sortFn: "alphanumeric",
                }),

                columnHelper.accessor("address", {
                    header: "Địa chỉ",
                    cell: info => (
                        <div>
                            <FontAwesomeIcon icon={faLocationDot} className="text-secondary me-2" />
                            {info.getValue()}
                        </div>
                    ),
                    sortFn: "alphanumeric",
                }),

                columnHelper.display({
                    id: "docs",
                    header: "Hồ sơ & giấy phép",
                    cell: info => {
                        const row = info.row.original;
                        const docs = [
                            { label: "Giấy phép", url: row.licenseUrl },
                            { label: "Hóa đơn nguồn gốc", url: row.originInvoiceUrl },
                            { label: "Tài liệu TCCS", url: row.tcssDocUrl },
                        ].filter(d => d.url);

                        if (docs.length === 0) {
                            return <span className="text-secondary small">Chưa có tài liệu</span>;
                        }

                        return (
                            <div className="d-flex flex-column gap-1">
                                {docs.map(doc => (
                                    <a
                                        key={doc.label}
                                        href={doc.url!}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="doc-chip text-decoration-none"
                                    >
                                        {getFileIcon(doc.url!)}
                                        <span className="text-truncate">{doc.label}</span>
                                    </a>
                                ))}
                            </div>
                        );
                    },
                    enableSorting: false,
                }),

                columnHelper.display({
                    id: "actions",
                    header: "Thao tác",
                    cell: info => {
                        const workshop = info.row.original;
                        const busy = loadingId === workshop.id;

                        return (
                            <div className="d-flex gap-2 justify-content-center">
                                {/* Duyệt */}
                                <button
                                    type="button"
                                    className="btn btn-sm btn-success px-3"
                                    disabled={busy}
                                    onClick={() =>
                                        handleUpdateStatus(workshop.id, FactoryStatus.ACTIVE)
                                    }
                                >
                                    <FontAwesomeIcon icon={faCheck} className="me-1" />
                                    Duyệt
                                </button>

                                {/* Hủy (đổi REJECTED theo đúng tên trong enum của bạn) */}
                                <button
                                    type="button"
                                    className="btn btn-sm btn-outline-danger px-3"
                                    disabled={busy}
                                    onClick={() =>
                                        handleUpdateStatus(workshop.id, FactoryStatus.REJECTED)
                                    }
                                >
                                    <FontAwesomeIcon icon={faXmark} className="me-1" />
                                    Hủy
                                </button>
                            </div>
                        );
                    },
                    enableSorting: false,
                }),
            ]),
        [loadingId, onChanged]
    );

    const table = useTable({
        data: list,
        columns,
        features,
        state: { pagination },
        onPaginationChange: setPagination,
        initialState: {
            sorting: [{ id: "name", desc: false }],
        },
    });

    const { pageIndex, pageSize } = pagination;

    return (
        <section className="card border-0 shadow-sm rounded-4 overflow-hidden">
            <div className="card-body p-0">
                {/* Table heading */}
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 p-3 p-lg-4 border-bottom">
                    <div>
                        <h5 className="fw-bold mb-1">Danh sách xưởng chờ duyệt</h5>

                        <p className="text-secondary small mb-0">
                            Xem xét hồ sơ, giấy phép và công suất trước khi duyệt xưởng.
                        </p>
                    </div>

                    <span className="badge rounded-pill bg-light text-dark border px-3 py-2">
                        {table.getFilteredRowModel().rows.length} hồ sơ
                    </span>
                </div>

                {/* Error message */}
                {errorMessage && (
                    <div className="alert alert-danger mx-3 mx-lg-4 mt-3 mb-0">
                        {errorMessage}
                    </div>
                )}

                {/* Toolbar */}
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 p-3 p-lg-4">
                    <div className="input-group" style={{ maxWidth: "350px" }}>
                        <span className="input-group-text bg-white">
                            <FontAwesomeIcon icon={faMagnifyingGlass} />
                        </span>

                        <input
                            type="search"
                            className="form-control"
                            placeholder="Tìm theo tên xưởng..."
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
                    <table className="table table-hover align-middle mb-0 workshop-table">
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
                                                            cursor: header.column.getCanSort()
                                                                ? "pointer"
                                                                : "default",
                                                        }}
                                                    >
                                                        <table.FlexRender header={header} />

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
                                        Không tìm thấy kết quả phù hợp.
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
                        {" · "}đã chọn {table.getSelectedRowModel().rows.length}
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
    );
}