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
    faFlask,
    faCheck,
    faXmark,
    faFilePdf,
    faFileImage,
    faFile,
    faChevronLeft,
    faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import "../../../css/pages/dashboard/modal.css";

interface WorkshopDoc {
    name: string;
    url: string;
}

interface Workshop {
    code: string;
    name: string;
    address: string;
    capacity: string;
    thumbnail?: string;
    docs: WorkshopDoc[];
}

export const ExampleData: Workshop[] = [
    {
        code: "REQ-2026-081",
        name: "AromaBio Tech Lab",
        address: "KCN Tân Bình, TP.HCM",
        capacity: "80.000 chai/tháng",
        thumbnail: "https://picsum.photos/seed/aroma/80",
        docs: [
            { name: "GMP ASEAN.pdf", url: "example.com" },
            { name: "ISO_22716.jpg", url: "example.com" },
        ],
    },
    {
        code: "REQ-2026-082",
        name: "Flora Essence Manufacturing",
        address: "Long Thành, Đồng Nai",
        capacity: "120.000 chai/tháng",
        docs: [
            { name: "IFRA_Standard_v51.pdf", url: "example.com" },
            { name: "ISO_9001_2015.pdf", url: "example.com" },
        ],
    },
    {
        code: "REQ-2026-083",
        name: "ScentCraft Co-Lab",
        address: "KCN Quế Võ, Bắc Ninh",
        capacity: "45.000 chai/tháng",
        docs: [{ name: "Phieu_tiep_nhan_GMP_VN.pdf", url: "example.com" }],
    },
    {
        code: "REQ-2026-084",
        name: "VietScent Organic Lab",
        address: "Đà Lạt, Lâm Đồng",
        capacity: "30.000 chai/tháng",
        docs: [
            { name: "USDA_Organic_Cert.pdf", url: "example.com" },
            { name: "COA_Nguon_Goc_2026.pdf", url: "example.com" },
        ],
    },
    {
        code: "REQ-2026-085",
        name: "Indochine Perfumery Hub",
        address: "Bến Cát, Bình Dương",
        capacity: "60.000 chai/tháng",
        docs: [
            { name: "GMP_ASEAN_BinhDuong.pdf", url: "example.com" },
            { name: "IFRA_Certificate_2026.pdf", url: "example.com" },
        ],
    },
];

const DEFAULT_THUMB =
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="88" height="88" viewBox="0 0 24 24" fill="none" stroke="#adb5bd" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <rect width="24" height="24" fill="#f1f3f5" stroke="none"/>
            <path d="M3 21h18M5 21V9l5 3V9l5 3V5h4v16"/>
        </svg>`
    );

const PAGE_SIZES = [5, 10, 20, 50];

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

// TODO: gọi API duyệt / hủy hồ sơ
const handleApprove = (code: string) => {
    console.log("approve", code);
};

const handleCancel = (code: string) => {
    console.log("cancel", code);
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

const columnHelper = createColumnHelper<typeof features, Workshop>();
const columns = columnHelper.columns([
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
            const src = row.thumbnail?.trim() ? row.thumbnail : DEFAULT_THUMB;

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
                            {row.code}
                        </span>
                    </div>
                </div>
            );
        },
        sortFn: "alphanumeric",
    }),

    columnHelper.accessor("address", {
        header: "Địa chỉ & công suất",
        cell: info => {
            const row = info.row.original;

            return (
                <>
                    <div className="mb-1">
                        <FontAwesomeIcon icon={faLocationDot} className="text-secondary me-2" />
                        {row.address}
                    </div>

                    <span className="badge bg-info-subtle text-info-emphasis fw-normal">
                        <FontAwesomeIcon icon={faFlask} className="me-1" />
                        {row.capacity}
                    </span>
                </>
            );
        },
        sortFn: "alphanumeric",
    }),

    columnHelper.accessor("docs", {
        header: "Hồ sơ & giấy phép",
        cell: info => (
            <div className="d-flex flex-column gap-1">
                {info.getValue().map((doc) => (
                    <a
                        key={doc.name}
                        href={`https://${doc.url}`}
                        target="_blank"
                        rel="noreferrer"
                        className="doc-chip text-decoration-none"
                    >
                        {getFileIcon(doc.name)}
                        <span className="text-truncate">{doc.name}</span>
                    </a>
                ))}
            </div>
        ),
        enableSorting: false,
        enableGlobalFilter: false,
    }),

    columnHelper.display({
        id: "actions",
        header: "Thao tác",
        cell: info => {
            const workshop = info.row.original;

            return (
                <div className="d-flex gap-2 justify-content-center">
                    {/* Duyệt */}
                    <button
                        type="button"
                        className="btn btn-sm btn-success px-3"
                        onClick={() => handleApprove(workshop.code)}
                    >
                        <FontAwesomeIcon icon={faCheck} className="me-1" />
                        Duyệt
                    </button>

                    {/* Hủy */}
                    <button
                        type="button"
                        className="btn btn-sm btn-outline-danger px-3"
                        onClick={() => handleCancel(workshop.code)}
                    >
                        <FontAwesomeIcon icon={faXmark} className="me-1" />
                        Hủy
                    </button>
                </div>
            );
        },
        enableSorting: false,
    }),
]);

export function DataTableApprove() {
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
                        <h5 className="fw-bold mb-1">
                            Danh sách xưởng chờ duyệt
                        </h5>

                        <p className="text-secondary small mb-0">
                            Xem xét hồ sơ, giấy phép và công suất trước khi duyệt xưởng.
                        </p>
                    </div>

                    <span className="badge rounded-pill bg-light text-dark border px-3 py-2">
                        {table.getFilteredRowModel().rows.length} hồ sơ
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
                            placeholder="Tìm theo tên xưởng..."
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
                    <table className="table table-hover align-middle mb-0 workshop-table">
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