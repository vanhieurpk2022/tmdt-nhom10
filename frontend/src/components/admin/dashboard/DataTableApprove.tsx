import DataTable, { Column } from "datatables.net-react";
import DtCore from "datatables.net-bs5";
import "datatables.net-bs5/css";
import Select from "datatables.net-select-bs5";
import { renderToStaticMarkup } from "react-dom/server";
import {
    ShieldCheck,
    FileEarmarkPdf,
    FileEarmarkImage,
    FileEarmark,
    GeoAltFill,
    BoxSeam,
    CheckLg,
    XLg,
    type Icon,
} from "react-bootstrap-icons";
import "../../../css/pages/dashboard/modal.css";
DataTable.use(DtCore);
DataTable.use(Select);

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

const data: Workshop[] = [
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
export function DataTableApprove() {
    const DEFAULT_THUMB =
        "data:image/svg+xml;utf8," +
        encodeURIComponent(
            `<svg xmlns="http://www.w3.org/2000/svg" width="88" height="88" viewBox="0 0 24 24" fill="none" stroke="#adb5bd" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <rect width="24" height="24" fill="#f1f3f5" stroke="none"/>
            <path d="M3 21h18M5 21V9l5 3V9l5 3V5h4v16"/>
        </svg>`
        );

    const escapeHtml = (s: string) =>
        s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));

    const renderAvatar = (w: Workshop) => {
        const src = w.thumbnail?.trim() ? w.thumbnail : DEFAULT_THUMB;
        return `
        <img class="ws-avatar" src="${escapeHtml(src)}" alt="${escapeHtml(w.name)}"
             loading="lazy"
             onerror="this.onerror=null;this.src='${DEFAULT_THUMB}'" />`;
    };
    const svg = (I: Icon, className = "", size = 16) =>
        renderToStaticMarkup(<I size={size} className={className} />);

    const fileIcon = (name: string) => {
        const ext = name.split(".").pop()?.toLowerCase();
        if (ext === "pdf") return svg(FileEarmarkPdf, "text-danger", 18);
        if (["jpg", "jpeg", "png"].includes(ext ?? "")) return svg(FileEarmarkImage, "text-primary", 18);
        return svg(FileEarmark, "text-secondary", 18);
    };
    return (<DataTable
        data={data}
        className="table table-hover align-middle workshop-table"
        options={{
            info: false,
            language: {
                search: "",
                searchPlaceholder: "Tìm theo tên xưởng...",
                lengthMenu: "_MENU_ dòng / trang",
                zeroRecords: "Không tìm thấy kết quả phù hợp",
                paginate: { previous: "‹", next: "›" },
            },
            select: { style: "os", selector: "td:first-child" },
            order: [[1, "asc"]],
            columnDefs: [
                { targets: [0, 4], orderable: false, searchable: false },
                { targets: 0, width: "40px" },
                { targets: 4, width: "170px", className: "text-center" },
            ],
            layout: {
                topStart: "search",
                topEnd: "pageLength",
                bottomEnd: "paging",
            },
        }}
    >
        <Column data={null} title="" render={DtCore.render.select()} />

        <Column
            title="Mã hồ sơ / Tên xưởng"
            data="name"
            render={(_v: string, _t: string, row: Workshop) => `
                        <div class="d-flex align-items-center gap-3">
                            ${renderAvatar(row)}
                            <div>
                                <div class="fw-bold">${row.name}</div>
                                <span class="badge bg-secondary-subtle text-secondary-emphasis fw-normal">${row.code}</span>
                            </div>
                        </div>`}
        />

        <Column
            title="Địa chỉ & công suất"
            data="address"
            render={(_v: string, _t: string, row: Workshop) => `
            <div class="mb-1">
                <i class="fa-solid fa-location-dot text-secondary me-2"></i>${row.address}
            </div>
            <span class="badge bg-info-subtle text-info-emphasis fw-normal">
                <i class="fa-solid fa-flask me-1"></i>${row.capacity}
            </span>`}
        />

        <Column
            title="Hồ sơ & giấy phép"
            data="docs"
            render={(_v: WorkshopDoc[], _t: string, row: Workshop) =>
                `<div class="d-flex flex-column gap-1">` +
                row.docs
                    .map((doc) => `
                                    <a href="https://${doc.url}" target="_blank" rel="noreferrer"
                                    class="doc-chip text-decoration-none">
                                        ${fileIcon(doc.name)}
                                        <span class="text-truncate">${doc.name}</span>
                                    </a>`)
                    .join("")
            }
        />

        <Column
            data={null}
            title="Thao tác"
            render={(_v: any, _t: string, row: Workshop) => `
            <div class="d-flex gap-2 justify-content-center">
                <button class="btn btn-sm btn-success px-3" data-action="approve" data-code="${row.code}">
                    <i class="fa-solid fa-check me-1"></i>Duyệt
                </button>
                <button class="btn btn-sm btn-outline-danger px-3" data-action="cancel" data-code="${row.code}">
                    <i class="fa-solid fa-xmark me-1"></i>Hủy
                </button>
            </div>`}
        />
    </DataTable>
    );
}