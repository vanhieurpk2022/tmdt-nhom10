import { useMemo, useState } from "react";
import DataTable, { type Column, type RowKey } from "../components/admin/datatable/DataTable";
import SidebarAdmin from "../components/admin/dashboard/SideBarAdmin";

/* ================== Kiểu dữ liệu ================== */
type OrderStatus = "pending" | "processing" | "shipping" | "delivered" | "cancelling";
type ProductType = "pha trộn" | "có sẵn";

interface Order {
    id: string;
    customer: { name: string; phone: string; address: string };
    product: { name: string; type: ProductType };
    workshop: string;
    orderedAt: string; // ISO
    total: number;
    status: OrderStatus;
}

const STATUS: Record<OrderStatus, { label: string; color: string }> = {
    pending: { label: "Chờ xác nhận", color: "warning" },
    processing: { label: "Đang gia công", color: "info" },
    shipping: { label: "Đang giao", color: "primary" },
    delivered: { label: "Đã giao", color: "success" },
    cancelling: { label: "Đang hủy", color: "danger" },
};

/* ================== Dữ liệu mẫu (142 đơn) ================== */
const CUSTOMERS = [
    { name: "Nguyễn Văn A", phone: "090 123 4567", address: "Đống Đa, Hà Nội" },
    { name: "Trần Thị B", phone: "091 555 8899", address: "Quận 3, TP.HCM" },
    { name: "Lê Minh C", phone: "098 222 3344", address: "Biên Hòa, Đồng Nai" },
];
const PRODUCTS: Order["product"][] = [
    { name: "Tinh dầu Lavender Pháp (10ml) + Tràm Trà", type: "pha trộn" },
    { name: "Nến thơm Sả Chanh (200g)", type: "có sẵn" },
    { name: "Nước hoa Oud Gỗ (30ml)", type: "pha trộn" },
];
const WORKSHOPS = ["Nordic Lab TP.HCM", "Mộc Perfume Lab Hà Nội", "Scentora Đồng Nai", "Hestia Aroma Hà Nội"];
const STATUSES = Object.keys(STATUS) as OrderStatus[];

const DATA: Order[] = Array.from({ length: 142 }, (_, i) => ({
    id: `#ND-${84210 - i}`,
    customer: CUSTOMERS[i % CUSTOMERS.length],
    product: PRODUCTS[i % PRODUCTS.length],
    workshop: WORKSHOPS[i % WORKSHOPS.length],
    orderedAt: new Date(Date.now() - i * 86_400_000).toISOString(),
    total: 800_000 + (i % 5) * 150_000,
    status: STATUSES[(i * 2) % STATUSES.length],
}));

const formatMoney = (n: number) => `${n.toLocaleString("vi-VN")}đ`;
const formatDate = (iso: string) => new Date(iso).toLocaleDateString("vi-VN");

/* ================== Cột của bảng ================== */
const columns: Column<Order>[] = [
    {
        key: "id",
        title: "Mã đơn",
        sortable: true,
        render: (v: string) => <span className="fw-bold text-danger">{v}</span>,
    },
    {
        key: "customer",
        title: "Khách hàng",
        sortable: true,
        sorter: (a, b) => a.customer.name.localeCompare(b.customer.name, "vi"),
        render: (_, r) => (
            <div style={{ lineHeight: 1.35 }}>
                <div className="fw-bold">{r.customer.name}</div>
                <div className="small">{r.customer.phone}</div>
                <div className="small text-body-secondary">{r.customer.address}</div>
            </div>
        ),
    },
    {
        key: "product",
        title: "Sản phẩm",
        width: 280,
        render: (_, r) => (
            <div className="d-flex align-items-center gap-2">
                <div
                    className="rounded-2 border bg-light d-flex align-items-center justify-content-center flex-shrink-0 fs-5"
                    style={{ width: 36, height: 44 }}
                >
                    🧴
                </div>
                <div className="small" style={{ lineHeight: 1.35 }}>
                    <div className="fw-semibold">{r.product.name}</div>
                    <div className="text-danger" style={{ fontSize: 11 }}>
                        Loại: {r.product.type}
                    </div>
                </div>
            </div>
        ),
    },
    {
        key: "workshop",
        title: "Xưởng chế tác",
        sortable: true,
        render: (v: string) => <span className="small">{v}</span>,
    },
    {
        key: "orderedAt",
        title: "Ngày đặt",
        sortable: true,
        render: (v: string) => <span className="small">{formatDate(v)}</span>,
    },
    {
        key: "total",
        title: "Tổng tiền",
        sortable: true,
        render: (v: number) => <span className="fw-bold text-danger">{formatMoney(v)}</span>,
    },
    {
        key: "status",
        title: "Trạng thái",
        sortable: true,
        render: (v: OrderStatus) => (
            <span className={`badge bg-${STATUS[v].color}-subtle text-${STATUS[v].color}-emphasis fw-semibold`}>
                {STATUS[v].label}
            </span>
        ),
    },
    {
        key: "actions",
        title: "Thao tác",
        align: "center",
        render: (_, r) => (
            <button
                type="button"
                className="btn btn-sm btn-link text-dark"
                aria-label={`Xem đơn ${r.id}`}
                onClick={() => console.log("Xem chi tiết", r)}
            >
                <i className="bi bi-eye fs-6" />
            </button>
        ),
    },
];

/* ================== Thẻ thống kê ================== */
interface Stat {
    label: string;
    value: string;
    note?: string;
    noteClass?: string;
    dotClass?: string;
    icon?: string;
}

const STATS: Stat[] = [
    { label: "Tất cả đơn", value: "1,420", note: "+12%", noteClass: "text-success", icon: "bi-clipboard-check" },
    { label: "Chờ xác nhận", value: "28", note: "Cần duyệt", noteClass: "text-body-secondary", dotClass: "bg-dark" },
    { label: "Đang gia công", value: "46", note: "Tại 4 xưởng", noteClass: "text-danger", dotClass: "bg-info-subtle" },
    { label: "Đang giao hàng", value: "814", note: "Đơn hàng", noteClass: "text-primary", dotClass: "bg-primary" },
    { label: "Đã giao hàng", value: "814", note: "Đơn hàng", noteClass: "text-success", dotClass: "bg-success" },
    { label: "Hoàn thành / Trả", value: "493", note: "Hủy: 0.8%", noteClass: "text-danger", icon: "bi-check-circle" },
];

const StatCard = ({ s }: { s: Stat }) => (
    <div className="card border-0 shadow-sm rounded-3 h-100">
        <div className="card-body py-3 px-3">
            <div className="d-flex justify-content-between align-items-center small text-body-secondary mb-1">
                <span>{s.label}</span>
                {s.dotClass && <span className={`rounded-circle d-inline-block ${s.dotClass}`} style={{ width: 8, height: 8 }} />}
                {s.icon && <i className={`bi ${s.icon} text-success`} />}
            </div>
            <div className="d-flex justify-content-between align-items-end">
                <span className="fs-4 fw-bold lh-1">{s.value}</span>
                <span className={`small fw-semibold ${s.noteClass ?? ""}`}>{s.note}</span>
            </div>
        </div>
    </div>
);

/* ================== Trang ================== */
const THEME_CSS = `
.orders-page .form-check-input:checked,
.orders-page .form-check-input:indeterminate{background-color:#e11d48;border-color:#e11d48}
.orders-page .pagination{--bs-pagination-active-bg:#e11d48;--bs-pagination-active-border-color:#e11d48;--bs-pagination-color:#374151}
.orders-page .table thead th{background:#e8eefc}
`;

type RangeFilter = "all" | "7" | "30";

export default function AdminOrder() {
    const [keyword, setKeyword] = useState("");
    const [range, setRange] = useState<RangeFilter>("all");
    const [workshop, setWorkshop] = useState("all");
    const [status, setStatus] = useState<"all" | OrderStatus>("all");
    const [selected, setSelected] = useState<RowKey[]>([]);

    const workshops = useMemo(() => Array.from(new Set(DATA.map((o) => o.workshop))), []);

    const filtered = useMemo(() => {
        const kw = keyword.trim().toLowerCase();
        const minTime = range === "all" ? 0 : Date.now() - Number(range) * 86_400_000;
        return DATA.filter(
            (o) =>
                (!kw ||
                    [o.id, o.customer.name, o.customer.phone, o.product.name].some((t) => t.toLowerCase().includes(kw))) &&
                new Date(o.orderedAt).getTime() >= minTime &&
                (workshop === "all" || o.workshop === workshop) &&
                (status === "all" || o.status === status)
        );
    }, [keyword, range, workshop, status]);

    return (
        <div className="d-flex flex-row">
            <aside
                className="col-12 col-xl-2 flex-shrink-0 position-sticky top-0 align-self-start"
                style={{ height: "100vh" }}
            >
                <SidebarAdmin isOrder={true} />

            </aside>
            <div className="col"><div className="orders-page bg-body-tertiary min-vh-100 p-4">
                <style>{THEME_CSS}</style>

                {/* Tiêu đề trang */}
                <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
                    <div>
                        <h1 className="h3 fw-bold mb-1">Quản lý đơn đặt hàng</h1>
                        <p className="small text-body-secondary mb-0" style={{ maxWidth: 420 }}>
                            Giám sát dây chuyền pha chế hương thủ công, bao gói niêm phong và luồng điều vận liên xưởng B2B2C.
                        </p>
                    </div>
                    <div className="d-flex gap-2">
                        <button type="button" className="btn btn-light border fw-semibold">
                            <i className="bi bi-download me-2" />
                            Xuất file vận đơn
                        </button>
                        <button type="button" className="btn btn-danger fw-semibold">
                            <i className="bi bi-plus-circle me-2" />
                            Tạo đơn điều phối
                        </button>
                    </div>
                </div>

                {/* Thẻ thống kê */}
                <div className="row row-cols-2 row-cols-md-3 row-cols-xl-6 g-3 mb-4">
                    {STATS.map((s) => (
                        <div className="col" key={s.label}>
                            <StatCard s={s} />
                        </div>
                    ))}
                </div>

                {/* Bộ lọc */}
                <div className="card border-0 shadow-sm rounded-3 mb-3">
                    <div className="card-body">
                        <div className="row g-2">
                            <div className="col-12 col-lg-4">
                                <div className="input-group">
                                    <span className="input-group-text bg-light border-0">
                                        <i className="bi bi-search" />
                                    </span>
                                    <input
                                        className="form-control bg-light border-0"
                                        placeholder="Tìm kiếm mã vận đơn, tên khách, SĐT, mẻ hương..."
                                        value={keyword}
                                        onChange={(e) => setKeyword(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="col-12 col-md-4 col-lg-2">
                                <select
                                    className="form-select bg-light border-0"
                                    value={range}
                                    onChange={(e) => setRange(e.target.value as RangeFilter)}
                                >
                                    <option value="all">Thời gian đặt hàng</option>
                                    <option value="7">7 ngày gần đây</option>
                                    <option value="30">30 ngày gần đây</option>
                                </select>
                            </div>
                            <div className="col-12 col-md-4 col-lg-3">
                                <select className="form-select bg-light border-0" value={workshop} onChange={(e) => setWorkshop(e.target.value)}>
                                    <option value="all">Tất cả xưởng gia công ({workshops.length})</option>
                                    {workshops.map((w) => (
                                        <option key={w} value={w}>
                                            {w}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-12 col-md-4 col-lg-3">
                                <select
                                    className="form-select bg-light border-0"
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value as "all" | OrderStatus)}
                                >
                                    <option value="all">Tất cả trạng thái</option>
                                    {STATUSES.map((s) => (
                                        <option key={s} value={s}>
                                            {STATUS[s].label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bảng – tái sử dụng DataTable */}
                <DataTable<Order>
                    data={filtered}
                    columns={columns}
                    rowKey="id"
                    selectable
                    selectedRowKeys={selected}
                    onSelectionChange={(keys) => setSelected(keys)}
                    totalLabel="đơn"
                    emptyText="Không có đơn hàng phù hợp"
                    header={
                        <div className="d-flex justify-content-between align-items-center px-4 py-3 small border-bottom">
                            <span className="text-body-secondary">
                                Tổng số <b className="text-body">{filtered.length}</b> đơn đặt hàng trực tiếp
                            </span>
                            <button
                                type="button"
                                className="btn btn-sm btn-link text-dark text-decoration-none fw-semibold p-0"
                                disabled={selected.length === 0}
                                onClick={() => console.log("In phiếu giao loạt", selected)}
                            >
                                <i className="bi bi-printer me-1" />
                                In phiếu giao loạt{selected.length > 0 && ` (${selected.length})`}
                            </button>
                        </div>
                    }
                />
            </div></div>
        </div >

    );
}