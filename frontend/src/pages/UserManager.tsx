import { useMemo, useState } from "react";
import type { ChangeEvent } from "react";
import "../css/pages/user-admin.css";
import SidebarAdmin from "../components/admin/dashboard/SideBarAdmin";

type Tier = "VIP Diamond" | "Gold (Vàng)" | "Silver (Bạc)" | "Thành viên mới" | "Vãng lai";
type CustomerStatus = "Hoạt động" | "Mới kích hoạt" | "Tạm khóa";

interface Customer {
    id: string;
    name: string;
    email: string;
    phone: string;
    tier: Tier;
    formulas: number;
    formulaNote: string;
    ltv: number;
    orders: number;
    recent: string;
    recentNote: string;
    status: CustomerStatus;
    initials: string;
    avatarTone: string;
    risk?: boolean;
}

const initialCustomers: Customer[] = [
    { id: "CUST-882", name: "Nguyễn Lan Anh", email: "lananh.scent@gmail.com", phone: "+84 912 345 882", tier: "VIP Diamond", formulas: 15, formulaNote: "4 lô đang re-order Lab", ltv: 42500000, orders: 24, recent: "2 giờ trước", recentNote: "Xem lịch sử hương", status: "Hoạt động", initials: "LA", avatarTone: "pink" },
    { id: "CUST-1044", name: "Trần Hoàng Long", email: "long.tran@scentcraft.vn", phone: "+84 908 119 220", tier: "Gold (Vàng)", formulas: 6, formulaNote: "1 re-order nước hoa ô tô", ltv: 18200000, orders: 9, recent: "Hôm qua, 18:30", recentNote: "Yêu cầu RFQ mẫu mới", status: "Hoạt động", initials: "TH", avatarTone: "blue" },
    { id: "CUST-1492", name: "Phạm Minh Đức", email: "duc.pm@atelier.com", phone: "+84 977 443 192", tier: "Silver (Bạc)", formulas: 2, formulaNote: "Chưa re-order lô", ltv: 4150000, orders: 2, recent: "3 ngày trước", recentNote: "Thanh toán Escrow", status: "Hoạt động", initials: "PM", avatarTone: "slate" },
    { id: "CUST-2103", name: "Vũ Thùy Tiên", email: "thuytien.vu@boutique.com", phone: "+84 934 888 120", tier: "Thành viên mới", formulas: 0, formulaNote: "Đang thử nghiệm Lab AI", ltv: 0, orders: 0, recent: "10 phút trước", recentNote: "Đăng ký tài khoản", status: "Mới kích hoạt", initials: "VT", avatarTone: "mint" },
    { id: "CUST-0911", name: "Hoàng Quốc Huy", email: "huy.hq@scandominz.fake", phone: "+84 901 600 999", tier: "Vãng lai", formulas: 1, formulaNote: "Bị khiếu nại bản quyền hương", ltv: 8200000, orders: 3, recent: "12 ngày trước", recentNote: "Admin tạm khóa", status: "Tạm khóa", initials: "HQ", avatarTone: "pink", risk: true },
];

const formatVnd = (value: number) =>
    value.toLocaleString("vi-VN") + "đ";

export default function UserManager() {
    const [customers, setCustomers] = useState(initialCustomers);
    const [selected, setSelected] = useState<string[]>(["CUST-882", "CUST-1044", "CUST-1492"]);
    const [search, setSearch] = useState("");
    const [tierFilter, setTierFilter] = useState("Tất cả");
    const [behaviorFilter, setBehaviorFilter] = useState("Tất cả");
    const [detailFilter, setDetailFilter] = useState("Tất cả");
    const [statusFilter, setStatusFilter] = useState("Hoạt động");
    const [page, setPage] = useState(1);

    const filteredCustomers = useMemo(() => customers.filter((customer) => {
        const q = search.trim().toLowerCase();
        const matchesSearch = !q || [customer.name, customer.email, customer.phone, customer.id].some((v) => v.toLowerCase().includes(q));
        const matchesTier = tierFilter === "Tất cả" || customer.tier === tierFilter;
        const matchesStatus = statusFilter === "Tất cả" || customer.status === statusFilter;
        const matchesBehavior = behaviorFilter === "Tất cả" ||
            (behaviorFilter === "Có re-order" ? customer.formulaNote.toLowerCase().includes("re-order") : customer.formulas === 0);
        const matchesDetail = detailFilter === "Tất cả" ||
            (detailFilter === "Có công thức" ? customer.formulas > 0 : customer.formulas === 0);
        return matchesSearch && matchesTier && matchesStatus && matchesBehavior && matchesDetail;
    }), [customers, search, tierFilter, behaviorFilter, detailFilter, statusFilter]);

    const allVisibleSelected = filteredCustomers.length > 0 && filteredCustomers.every((c) => selected.includes(c.id));

    const toggleCustomer = (id: string) => {
        setSelected((current) => current.includes(id) ? current.filter((x) => x !== id) : [...current, id]);
    };

    const toggleAllVisible = () => {
        setSelected((current) => allVisibleSelected
            ? current.filter((id) => !filteredCustomers.some((c) => c.id === id))
            : [...new Set([...current, ...filteredCustomers.map((c) => c.id)])]);
    };

    const handleExport = () => {
        const rows = [["Mã khách hàng", "Họ tên", "Email", "Điện thoại", "Phân hạng", "Trạng thái", "LTV"]];
        filteredCustomers.forEach((c) => rows.push([c.id, c.name, c.email, c.phone, c.tier, c.status, String(c.ltv)]));
        const csv = "\uFEFF" + rows.map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(",")).join("\r\n");
        const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
        const a = document.createElement("a");
        a.href = url;
        a.download = "danh-sach-khach-hang.csv";
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleBulkAction = (action: string) => {
        if (!selected.length) {
            window.alert("Vui lòng chọn ít nhất một khách hàng.");
            return;
        }
        if (action === "lock") {
            setCustomers((current) => current.map((c) => selected.includes(c.id) ? { ...c, status: "Tạm khóa" } : c));
        }
        window.alert(`${action} — ${selected.length} khách hàng đã chọn.`);
    };

    const handleStatusChange = (event: ChangeEvent<HTMLSelectElement>) => {
        setStatusFilter(event.target.value);
        setPage(1);
    };

    return (
        <div className="row">
            <aside
                className="col-12 col-xl-2 flex-shrink-0 position-sticky top-0 align-self-start"
                style={{ height: "100vh" }}
            >
                <SidebarAdmin isCustomer={true} />

            </aside>
            <div className="col">

                <main className="csv-page">
                    <header className="csv-header">
                        <div>
                            <h1>Quản trị Khách hàng &amp; Scent Vault</h1>
                        </div>
                        <div className="csv-header-actions">
                            <button className="btn csv-btn csv-btn-outline" onClick={handleExport}><i className="fa-regular fa-file-lines" /> Xuất dữ liệu (GDPR/Excel)</button>
                            <button className="btn csv-btn csv-btn-purple" onClick={() => handleBulkAction("Tặng voucher")}><i className="fa-solid fa-gift" /> Tặng Voucher hàng loạt</button>
                            <button className="btn csv-btn csv-btn-primary" onClick={() => window.alert("Mở form thêm khách hàng")}><i className="fa-solid fa-plus" /> Thêm khách hàng thủ công</button>
                        </div>
                    </header>

                    <section className="csv-metrics">
                        <article className="csv-metric">
                            <div className="csv-metric-top"><span>TỔNG KHÁCH HÀNG</span><span className="csv-metric-icon blue"><i className="fa-solid fa-users" /></span></div>
                            <div className="csv-metric-number">12.450</div>
                            <div className="csv-metric-footer"><span className="csv-chip green">11.890 Hoạt động</span><span className="csv-chip blue-chip">+420 Mới</span><span className="csv-chip red-chip">140 Khóa</span></div>
                        </article>
                        <article className="csv-metric">
                            <div className="csv-metric-top"><span>GIÁ TRỊ VÒNG ĐỜI TB (LTV)</span><span className="csv-metric-icon green"><i className="fa-solid fa-circle-dollar-to-slot" /></span></div>
                            <div className="csv-metric-number">4.850.000đ <small>/ khách</small></div>
                            <div className="csv-metric-footer csv-growth"><span><i className="fa-solid fa-arrow-trend-up" /> +18.4% so kỳ trước</span><svg viewBox="0 0 100 28" aria-hidden="true"><polyline points="2,23 22,15 39,19 57,8 75,12 98,2" /></svg></div>
                        </article>
                        <article className="csv-metric">
                            <div className="csv-metric-top"><span>TỶ LỆ RE-ORDER CÔNG THỨC HƯƠNG</span><span className="csv-metric-icon purple"><i className="fa-solid fa-arrows-rotate" /></span></div>
                            <div className="csv-metric-number">42.8% <span className="csv-growth-pill">+5.2%</span></div>
                            <div className="csv-metric-note">Đặt lại công thức riêng từ xưởng Lab Olla</div>
                        </article>
                        <article className="csv-metric">
                            <div className="csv-metric-top"><span>TÀI KHOẢN VIP &amp; TIER CAO</span><span className="csv-metric-icon orange"><i className="fa-regular fa-star" /></span></div>
                            <div className="csv-metric-number">1.820 <small>VIP</small></div>
                            <div className="csv-metric-note csv-vip-note"><span>Hạng Vàng &amp; Kim Cương</span><span>&gt; 15tr/tháng</span></div>
                        </article>
                    </section>

                    <section className="csv-filter-card">
                        <div className="csv-filter-row">
                            <label className="csv-search"><i className="fa-solid fa-magnifying-glass" /><input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Tìm theo Họ tên, Email, SĐT, hoặc Mã CUST-XXX..." /></label>
                            <select className="form-select" value={tierFilter} onChange={(e) => { setTierFilter(e.target.value); setPage(1); }} aria-label="Phân hạng">
                                <option value="Tất cả">Phân hạng: Tất cả</option><option>VIP Diamond</option><option>Gold (Vàng)</option><option>Silver (Bạc)</option><option>Thành viên mới</option><option>Vãng lai</option>
                            </select>
                            <select className="form-select" value={behaviorFilter} onChange={(e) => { setBehaviorFilter(e.target.value); setPage(1); }} aria-label="Hành vi">
                                <option value="Tất cả">Hành vi: Tất cả</option><option value="Có re-order">Có re-order</option><option value="Chưa có công thức">Chưa có công thức</option>
                            </select>
                            <select className="form-select" value={detailFilter} onChange={(e) => { setDetailFilter(e.target.value); setPage(1); }} aria-label="Chi tiết">
                                <option value="Tất cả">Chi tiết: Tất cả</option><option value="Có công thức">Có công thức</option><option value="Chưa có công thức">Chưa có công thức</option>
                            </select>
                            <select className="form-select" value={statusFilter} onChange={handleStatusChange} aria-label="Trạng thái">
                                <option>Hoạt động</option><option>Tất cả</option><option>Mới kích hoạt</option><option>Tạm khóa</option>
                            </select>
                        </div>
                        {selected.length > 0 && <div className="csv-bulk-bar">
                            <div className="csv-selected-info"><span className="csv-selected-count">{selected.length}</span><strong>Đã chọn {selected.length} khách hàng từ danh sách</strong><span className="csv-bulk-divider" /><button className="csv-text-btn" onClick={() => setSelected([])}>Bỏ chọn</button></div>
                            <div className="csv-bulk-actions">
                                <button className="btn csv-btn csv-btn-outline" onClick={() => handleBulkAction("Gửi Voucher ưu đãi")}>Gửi Voucher ưu đãi</button>
                                <button className="btn csv-btn csv-btn-outline" onClick={handleExport}>Xuất GDPR Zip</button>
                                <button className="btn csv-btn csv-btn-warning" onClick={() => handleBulkAction("Gắn nhãn rủi ro")}>Gắn nhãn rủi ro</button>
                                <button className="btn csv-btn csv-btn-primary csv-btn-small" onClick={() => handleBulkAction("lock")}><i className="fa-solid fa-lock" /> Khóa tài khoản</button>
                            </div>
                        </div>}
                    </section>

                    <section className="csv-table-card">
                        <div className="table-responsive">
                            <table className="table csv-table align-middle mb-0">
                                <thead><tr>
                                    <th className="csv-check-col"><input className="form-check-input" type="checkbox" checked={allVisibleSelected} onChange={toggleAllVisible} aria-label="Chọn tất cả khách hàng" /></th>
                                    <th>Khách hàng (ID &amp; Họ tên)</th><th>Liên hệ</th><th>Phân hạng</th><th>Công thức hương tạo (USP)</th><th>Đơn hàng &amp; LTV</th><th>Hoạt động gần nhất</th><th>Trạng thái</th><th className="text-center">Thao tác</th>
                                </tr></thead>
                                <tbody>
                                    {filteredCustomers.map((customer) => {
                                        const isSelected = selected.includes(customer.id);
                                        return <tr key={customer.id} className={isSelected ? "csv-row-selected" : ""}>
                                            <td className="csv-check-col"><input className="form-check-input" type="checkbox" checked={isSelected} onChange={() => toggleCustomer(customer.id)} aria-label={`Chọn ${customer.name}`} /></td>
                                            <td><div className="csv-customer"><span className={`csv-avatar ${customer.avatarTone}`}>{customer.initials}</span><div className="csv-customer-info"><strong>{customer.name}</strong><span>Mã: {customer.id}</span></div>{customer.tier === "VIP Diamond" && <span className="csv-vip-mini"><i className="fa-solid fa-star" /> VIP</span>}</div></td>
                                            <td><div className="csv-contact">{customer.email}<span>{customer.phone}</span></div></td>
                                            <td><span className={`csv-tier ${customer.tier === "VIP Diamond" ? "tier-vip" : customer.tier === "Gold (Vàng)" ? "tier-gold" : customer.tier === "Silver (Bạc)" ? "tier-silver" : customer.tier === "Thành viên mới" ? "tier-new" : "tier-casual"}`}>{customer.tier}</span></td>
                                            <td><div className="csv-formula"><strong><i className="fa-solid fa-flask" /> {customer.formulas} công thức</strong><span className={customer.risk ? "text-danger" : ""}>{customer.formulaNote}</span></div></td>
                                            <td><div className="csv-ltv"><strong>{formatVnd(customer.ltv)}</strong><span className={customer.risk ? "text-danger" : ""}>{customer.orders} {customer.orders === 1 ? "đơn hàng" : "đơn hàng"}</span></div></td>
                                            <td><div className="csv-recent">{customer.recent}<span>{customer.recentNote}</span></div></td>
                                            <td><span className={`csv-status ${customer.status === "Hoạt động" ? "status-active" : customer.status === "Mới kích hoạt" ? "status-new" : "status-locked"}`}><span />{customer.status}</span></td>
                                            <td className="text-center"><button className={`btn csv-row-action ${customer.tier === "VIP Diamond" ? "csv-row-action-primary" : ""}`} onClick={() => window.alert(`Hồ sơ khách hàng: ${customer.name} (${customer.id})`)}>{customer.tier === "VIP Diamond" ? "Xem hồ sơ" : "Chi tiết"}</button></td>
                                        </tr>;
                                    })}
                                    {filteredCustomers.length === 0 && <tr><td colSpan={9} className="csv-empty">Không tìm thấy khách hàng phù hợp.</td></tr>}
                                </tbody>
                                <tfoot><tr><td colSpan={9}><div className="csv-pagination"><span>Hiển thị <strong>{filteredCustomers.length ? 1 : 0} - {filteredCustomers.length}</strong> trên tổng số <strong>12.450</strong> khách hàng</span><div className="csv-page-buttons"><button className="btn" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Trang trước</button><button className={`btn ${page === 1 ? "active" : ""}`} onClick={() => setPage(1)}>1</button><button className={`btn ${page === 2 ? "active" : ""}`} onClick={() => setPage(2)}>2</button><button className={`btn ${page === 3 ? "active" : ""}`} onClick={() => setPage(3)}>3</button><span>…</span><button className={`btn ${page === 249 ? "active" : ""}`} onClick={() => setPage(249)}>249</button><button className="btn" onClick={() => setPage((p) => Math.min(249, p + 1))}>Trang sau</button></div></div></td></tr></tfoot>
                            </table>
                        </div>
                    </section>
                </main>
            </div>
        </div>
    );
}
