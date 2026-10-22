import { useEffect, useMemo, useRef, useState } from "react";
import {
    Building,
    FileEarmarkCheck,
    Clock,
    Lightning,
    Search,
    ArrowClockwise,
    Download,
    Plus,
    ShieldCheck,
    StarFill,
    ChevronRight,
    X,
    Percent,
} from "react-bootstrap-icons";
import "../css/pages/factory/workshop-manager.css";
import SidebarAdmin from "../components/admin/dashboard/SideBarAdmin";

/* ------------------------------ Types & data ------------------------------ */

type Status = "active" | "pending" | "paused";
type Kyc = "verified" | "reviewing";
type Tone = "red" | "green" | "blue" | "amber" | "gray";

interface Workshop {
    code: string;
    name: string;
    tag?: { text: string; tone: Exclude<Tone, "gray"> };
    tone: Tone;
    owner: string;
    phone: string;
    email: string;
    region: string;
    rating?: number;
    orders?: number;
    sla?: number; // %
    takeRate: number; // %
    kyc: Kyc;
    status: Status;
}

const INITIAL_DATA: Workshop[] = [
    {
        code: "WS-102", name: "Mộc Perfume Lab", tag: { text: "Top 1 Nước hoa", tone: "red" }, tone: "red",
        owner: "Trần Đình Mộc", phone: "0918.423.869", email: "moclab@perfume.vn",
        region: "TP. Hồ Chí Minh", rating: 4.9, orders: 320, sla: 99.1, takeRate: 12.0, kyc: "verified", status: "active",
    },
    {
        code: "WS-108", name: "Scentora Essential VN", tag: { text: "Tinh dầu & Nến", tone: "green" }, tone: "green",
        owner: "Lê Thuý Trang", phone: "0903.112.449", email: "trang@scentora.vn",
        region: "Đồng Nai", rating: 4.8, orders: 185, sla: 97.8, takeRate: 14.5, kyc: "verified", status: "active",
    },
    {
        code: "WS-095", name: "Hestia Aroma Lab", tag: { text: "CGMP ASEAN", tone: "blue" }, tone: "blue",
        owner: "Vũ Hoàng Nam", phone: "0988.921.002", email: "namvh@hestia.vn",
        region: "Hà Nội", rating: 4.9, orders: 280, sla: 98.9, takeRate: 13.0, kyc: "verified", status: "active",
    },
    {
        code: "WS-118", name: "Aurasphere Studio", tag: { text: "Hồ sơ mới", tone: "amber" }, tone: "amber",
        owner: "Nguyễn Bảo Châu", phone: "0934.778.121", email: "aura@studio.com",
        region: "Bình Dương", takeRate: 14.5, kyc: "reviewing", status: "pending",
    },
    {
        code: "WS-082", name: "Saigon Scent Factory", tone: "gray",
        owner: "Đặng Minh Quân", phone: "0909.554.210", email: "minhquan@sgscent.com",
        region: "TP. Hồ Chí Minh", rating: 4.2, orders: 84, sla: 92.0, takeRate: 14.5, kyc: "verified", status: "paused",
    },
];

const STATUS_META: Record<Status, { label: string; cls: string }> = {
    active: { label: "Đang hoạt động", cls: "st-active" },
    pending: { label: "Chờ duyệt", cls: "st-pending" },
    paused: { label: "Tạm dừng", cls: "st-paused" },
};

const KPI = [
    {
        label: "TỔNG XƯỞNG GIA CÔNG", icon: Building, tone: "gray", value: "48", unit: "cơ sở đối tác",
        footer: (
            <div className="d-flex gap-2 flex-wrap">
                <span className="pill pill-green">42 Hoạt động</span>
                <span className="pill pill-gray">2 Tạm dừng</span>
                <span className="pill pill-amber">4 Chờ duyệt</span>
            </div>
        ),
    },
    {
        label: "CHỜ DUYỆT KYC & PHÁP LÝ", icon: FileEarmarkCheck, tone: "red", value: "6", unit: "hồ sơ gửi thẩm định",
        footer: (
            <div className="d-flex justify-content-between align-items-center">
                <span className="pill pill-red"><span className="dot" />2 ưu tiên trong 24h</span>
                <small className="text-secondary">CGMP ASEAN / ĐKKD</small>
            </div>
        ),
    },
    {
        label: "GIAO HÀNG ĐÚNG HẸN (SLA)", icon: Clock, tone: "green", value: "98.5%", valueCls: "text-success", unit: "",
        extra: <span className="pill pill-green ms-2">↑ +1.2%</span>,
        footer: (
            <div className="d-flex justify-content-between align-items-center">
                <small className="text-secondary">Chuẩn bảo chứng ký quỹ Escrow</small>
                <small className="fw-bold text-success">Tối ưu</small>
            </div>
        ),
    },
    {
        label: "TỶ LỆ THẮNG THẦU & BÁO GIÁ", icon: Lightning, tone: "purple", value: "34.2%", unit: "trung bình / xưởng",
        footer: (
            <div className="d-flex justify-content-between align-items-center">
                <small className="text-secondary">Tham gia qua Scent Lab RFQ</small>
                <small className="fw-bold text-purple">+4.5% q/q</small>
            </div>
        ),
    },
];

/* --------------------------------- Helpers -------------------------------- */

const slaInfo = (v: number) =>
    v >= 98 ? { label: "Xuất sắc", cls: "good" } : v >= 95 ? { label: "Tốt", cls: "good" } : { label: "Cần cải thiện", cls: "warn" };

const isVip = (rate: number) => rate < 14.5;

function pageList(current: number, total: number): (number | "…")[] {
    if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
    const set = new Set([1, 2, 3, total, current]);
    const sorted = [...set].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b);
    const out: (number | "…")[] = [];
    sorted.forEach((n, i) => {
        if (i > 0 && n - sorted[i - 1] > 1) out.push("…");
        out.push(n);
    });
    return out;
}

/* -------------------------------- Component ------------------------------- */

export function WorkshopManagement() {
    const [rows, setRows] = useState<Workshop[]>(INITIAL_DATA);
    const [selected, setSelected] = useState<Set<string>>(new Set(["WS-102", "WS-108", "WS-095"]));
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // filters
    const [q, setQ] = useState("");
    const [fStatus, setFStatus] = useState("all");
    const [fKyc, setFKyc] = useState("all");
    const [fRegion, setFRegion] = useState("all");
    const [fRate, setFRate] = useState("all");

    // popover chiết khấu
    const [showRate, setShowRate] = useState(false);
    const [rateValue, setRateValue] = useState("12.0");
    const [rateReason, setRateReason] = useState("Đối tác chiến lược sản lượng > 1000 đơn/quý");

    const regions = useMemo(() => [...new Set(rows.map((r) => r.region))], [rows]);

    const filtered = useMemo(() => {
        const kw = q.trim().toLowerCase();
        return rows.filter((r) => {
            if (kw && ![r.code, r.name, r.owner, r.phone, r.email].some((s) => s.toLowerCase().includes(kw))) return false;
            if (fStatus !== "all" && r.status !== fStatus) return false;
            if (fKyc !== "all" && r.kyc !== fKyc) return false;
            if (fRegion !== "all" && r.region !== fRegion) return false;
            if (fRate === "vip" && !isVip(r.takeRate)) return false;
            if (fRate === "standard" && isVip(r.takeRate)) return false;
            return true;
        });
    }, [rows, q, fStatus, fKyc, fRegion, fRate]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    const currentPage = Math.min(page, totalPages);
    const pageRows = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    // checkbox "chọn tất cả" (trang hiện tại) có trạng thái indeterminate
    const allRef = useRef<HTMLInputElement>(null);
    const selectedOnPage = pageRows.filter((r) => selected.has(r.code)).length;
    useEffect(() => {
        if (allRef.current) {
            allRef.current.indeterminate = selectedOnPage > 0 && selectedOnPage < pageRows.length;
        }
    }, [selectedOnPage, pageRows.length]);

    const toggleOne = (code: string) =>
        setSelected((prev) => {
            const next = new Set(prev);
            next.has(code) ? next.delete(code) : next.add(code);
            return next;
        });

    const toggleAll = () =>
        setSelected((prev) => {
            const next = new Set(prev);
            const allOn = pageRows.length > 0 && pageRows.every((r) => next.has(r.code));
            pageRows.forEach((r) => (allOn ? next.delete(r.code) : next.add(r.code)));
            return next;
        });

    const resetFilters = () => {
        setQ(""); setFStatus("all"); setFKyc("all"); setFRegion("all"); setFRate("all"); setPage(1);
    };

    /* ---- hành động hàng loạt ---- */
    const bulkApprove = () => {
        setRows((prev) =>
            prev.map((r) => (selected.has(r.code) && r.status === "pending" ? { ...r, status: "active", kyc: "verified" } : r))
        );
    };
    const bulkPause = () => {
        setRows((prev) => prev.map((r) => (selected.has(r.code) ? { ...r, status: "paused" } : r)));
    };
    const applyRate = () => {
        const v = parseFloat(rateValue);
        if (Number.isNaN(v) || v < 0 || v > 100) return;
        setRows((prev) => prev.map((r) => (selected.has(r.code) ? { ...r, takeRate: v } : r)));
        console.log("Lý do điều chỉnh:", rateReason);
        setShowRate(false);
    };

    const selectedList = rows.filter((r) => selected.has(r.code));
    const rateTitle =
        selectedList.length === 1 ? selectedList[0].code : `${selectedList.length} xưởng`;
    const rateDesc =
        selectedList.length === 1
            ? `${selectedList[0].name} đang áp dụng tỷ lệ chiết khấu đặc quyền đối tác VIP.`
            : `Áp dụng tỷ lệ chiết khấu mới cho ${selectedList.length} xưởng đã chọn.`;

    return (
        <div className="row g-0 min-vh-100 bg-light">
            <aside
                className="col-12 col-xl-2 flex-shrink-0 position-sticky top-0 align-self-start"
                style={{ height: "100vh" }}
            >
                <SidebarAdmin isWorkshopManagement={true} />
            </aside>
            <div className="col">
                <div className="wm-page">

                    {/* ------------------------------ Header ------------------------------ */}
                    <header className="wm-header d-flex flex-wrap justify-content-between align-items-end gap-3">
                        <div>
                            <h1 className="fs-4 fw-bold m-0">Quản trị xưởng gia công &amp; Đối tác sản xuất</h1>
                        </div>
                        <div className="d-flex gap-2">
                            <button className="btn btn-sm btn-white border d-flex align-items-center gap-2">
                                <Download size={14} /> Xuất dữ liệu Excel
                            </button>

                        </div>
                    </header>

                    <div className="wm-body">
                        {/* ------------------------------- KPI -------------------------------- */}
                        <div className="row g-3 mb-3">
                            {KPI.map((k) => {
                                const Icon = k.icon;
                                return (
                                    <div className="col-12 col-md-6 col-xl-3" key={k.label}>
                                        <div className="wm-card h-100 p-3">
                                            <div className="d-flex justify-content-between align-items-start mb-2">
                                                <span className="kpi-label">{k.label}</span>
                                                <span className={`kpi-icon tone-${k.tone}`}><Icon size={16} /></span>
                                            </div>
                                            <div className="d-flex align-items-baseline gap-2 mb-3">
                                                <span className={`kpi-value ${k.valueCls ?? ""}`}>{k.value}</span>
                                                {k.extra}
                                                {k.unit && <small className="text-secondary">{k.unit}</small>}
                                            </div>
                                            <div className="kpi-footer pt-2">{k.footer}</div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* ------------------------------ Filters ----------------------------- */}
                        <div className="wm-card p-3 mb-3">
                            <div className="d-flex flex-wrap gap-2 align-items-center">
                                <div className="wm-search flex-grow-1">
                                    <Search size={14} className="text-secondary" />
                                    <input
                                        value={q}
                                        onChange={(e) => { setQ(e.target.value); setPage(1); }}
                                        placeholder="Tìm kiếm theo mã WS, tên xưởng, chủ cơ sở, số điện thoại, email..."
                                    />
                                </div>
                                <select className="form-select form-select-sm wm-select" value={fStatus}
                                    onChange={(e) => { setFStatus(e.target.value); setPage(1); }}>
                                    <option value="all">Trạng thái: Tất cả</option>
                                    <option value="active">Đang hoạt động</option>
                                    <option value="pending">Chờ duyệt</option>
                                    <option value="paused">Tạm dừng</option>
                                </select>
                                <select className="form-select form-select-sm wm-select" value={fKyc}
                                    onChange={(e) => { setFKyc(e.target.value); setPage(1); }}>
                                    <option value="all">KYC: Tất cả</option>
                                    <option value="verified">Đã xác thực KYC</option>
                                    <option value="reviewing">Chờ thẩm định</option>
                                </select>
                                <select className="form-select form-select-sm wm-select" value={fRegion}
                                    onChange={(e) => { setFRegion(e.target.value); setPage(1); }}>
                                    <option value="all">Khu vực: Toàn quốc</option>
                                    {regions.map((r) => <option key={r} value={r}>{r}</option>)}
                                </select>
                                <select className="form-select form-select-sm wm-select" value={fRate}
                                    onChange={(e) => { setFRate(e.target.value); setPage(1); }}>
                                    <option value="all">Chiết khấu Take-rate: Tất cả</option>
                                    <option value="vip">VIP (&lt; 14.5%)</option>
                                    <option value="standard">Chuẩn (14.5%)</option>
                                </select>
                                <button className="btn btn-sm btn-white border d-flex align-items-center gap-2" onClick={resetFilters}>
                                    <ArrowClockwise size={13} /> Đặt lại
                                </button>
                            </div>

                            {selected.size > 0 && (
                                <div className="d-flex flex-wrap gap-2 align-items-center mt-3">
                                    <span className="chip chip-rose">Đã chọn {selected.size} xưởng gia công</span>
                                    <span className="vr mx-1" />
                                    <button className="btn btn-sm btn-success" onClick={bulkApprove}>Duyệt hàng loạt</button>
                                    <button className="btn btn-sm btn-primary" onClick={bulkApprove}>Xem chi tiết</button>

                                    <button className="btn btn-sm btn-secondary" onClick={() => setShowRate(true)}>Điều chỉnh chiết khấu</button>
                                    <button className="btn btn-sm btn-danger" onClick={bulkPause}>Tạm khóa xưởng</button>
                                    <button className="chip chip-plain" onClick={() => console.log("Export", [...selected])}>
                                        Xuất danh sách đã chọn
                                    </button>
                                    <small className="ms-auto text-secondary">
                                        Hiển thị {filtered.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} -{" "}
                                        {Math.min(currentPage * pageSize, filtered.length)} của tổng số {rows.length} xưởng đăng ký
                                    </small>
                                </div>
                            )}
                        </div>

                        {/* -------------------------------- Table ----------------------------- */}
                        <div className="wm-card">
                            <div className="table-responsive">
                                <table className="table table-hover align-middle mb-0 wm-table">
                                    <thead>
                                        <tr>
                                            <th style={{ width: 44 }}>
                                                <input ref={allRef} type="checkbox" className="form-check-input"
                                                    checked={pageRows.length > 0 && selectedOnPage === pageRows.length}
                                                    onChange={toggleAll} />
                                            </th>
                                            <th>MÃ &amp; TÊN XƯỞNG GIA CÔNG</th>
                                            <th>CHỦ XƯỞNG &amp; LIÊN HỆ</th>
                                            <th>KHU VỰC / LOẠI HÌNH</th>
                                            <th>ĐÁNH GIÁ &amp; SẢN LƯỢNG</th>
                                            <th style={{ minWidth: 150 }}>SLA GIAO HÀNG</th>
                                            <th>CHIẾT KHẤU SÀN (TAKE-RATE)</th>
                                            <th>KYC PHÁP LÝ</th>
                                            <th>TRẠNG THÁI</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pageRows.length === 0 && (
                                            <tr><td colSpan={9} className="text-center text-secondary py-5">Không tìm thấy kết quả phù hợp</td></tr>
                                        )}
                                        {pageRows.map((r) => {
                                            const on = selected.has(r.code);
                                            const sla = r.sla !== undefined ? slaInfo(r.sla) : null;
                                            return (
                                                <tr key={r.code} className={on ? "row-selected" : ""}>
                                                    <td>
                                                        <input type="checkbox" className="form-check-input" checked={on} onChange={() => toggleOne(r.code)} />
                                                    </td>
                                                    <td>
                                                        <div className="d-flex align-items-center gap-3">
                                                            <div className={`ws-avatar tone-${r.tone}`}>{r.name.charAt(0)}</div>
                                                            <div>
                                                                <div className="d-flex align-items-center gap-2">
                                                                    <span className="fw-bold">{r.name}</span>
                                                                    {r.tag && <span className={`tag tone-${r.tag.tone}`}>{r.tag.text}</span>}
                                                                </div>
                                                                <small className="text-secondary">{r.code}</small>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className="fw-semibold">{r.owner}</div>
                                                        <small className="text-secondary">{r.phone} • {r.email}</small>
                                                    </td>
                                                    <td><span className="region">{r.region}</span></td>
                                                    <td>
                                                        {r.rating !== undefined ? (
                                                            <>
                                                                <StarFill size={11} className="text-warning me-1" />
                                                                <span className="fw-bold text-warning">{r.rating.toFixed(1)}</span>{" "}
                                                                <small className="text-secondary">({r.orders} đơn xong)</small>
                                                            </>
                                                        ) : (
                                                            <small className="text-secondary">Chưa phát sinh đơn</small>
                                                        )}
                                                    </td>
                                                    <td>
                                                        {sla && r.sla !== undefined ? (
                                                            <>
                                                                <div className="d-flex justify-content-between small">
                                                                    <span className="fw-semibold">{r.sla.toFixed(1)}%</span>
                                                                    <span className={`sla-text ${sla.cls}`}>{sla.label}</span>
                                                                </div>
                                                                <div className="sla-bar"><div className={`sla-fill ${sla.cls}`} style={{ width: `${r.sla}%` }} /></div>
                                                            </>
                                                        ) : (
                                                            <small className="text-secondary">Chưa ghi nhận SLA</small>
                                                        )}
                                                    </td>
                                                    <td>
                                                        <span className={`rate ${isVip(r.takeRate) ? "rate-vip" : ""}`}>
                                                            {r.takeRate.toFixed(1)}% ({isVip(r.takeRate) ? "VIP" : "Chuẩn"})
                                                        </span>
                                                    </td>
                                                    <td>
                                                        {r.kyc === "verified" ? (
                                                            <span className="kyc kyc-ok"><ShieldCheck size={12} /> Đã xác thực</span>
                                                        ) : (
                                                            <span className="kyc kyc-wait"><Clock size={12} /> Chờ thẩm định</span>
                                                        )}
                                                    </td>
                                                    <td><span className={`status ${STATUS_META[r.status].cls}`}>{STATUS_META[r.status].label}</span></td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* ------------------------------ Footer ------------------------------ */}
                            <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 p-3 border-top">
                                <div className="d-flex align-items-center gap-3 small text-secondary">
                                    <span>Dòng hiển thị:</span>
                                    <select className="form-select form-select-sm w-auto" value={pageSize}
                                        onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}>
                                        {[5, 10, 20, 50].map((n) => <option key={n} value={n}>{n} dòng</option>)}
                                    </select>
                                    <span>Tổng cộng: {filtered.length} đối tác</span>
                                </div>
                                <div className="d-flex align-items-center gap-3 small text-secondary">
                                    <span>Trang {currentPage} trên {totalPages}</span>
                                    <div className="d-flex gap-1">
                                        <button className="pg" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>Trước</button>
                                        {pageList(currentPage, totalPages).map((p, i) =>
                                            p === "…" ? (
                                                <span key={`e${i}`} className="px-1">…</span>
                                            ) : (
                                                <button key={p} className={`pg ${p === currentPage ? "active" : ""}`} onClick={() => setPage(p)}>{p}</button>
                                            )
                                        )}
                                        <button className="pg" disabled={currentPage === totalPages} onClick={() => setPage(currentPage + 1)}>Tiếp theo</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ----------------------- Popover điều chỉnh chiết khấu ----------------------- */}
                    {showRate && selected.size > 0 && (
                        <div className="rate-pop">
                            <div className="d-flex align-items-center gap-2 mb-2">
                                <span className="rate-pop-icon"><Percent size={12} /></span>
                                <span className="fw-bold small">Điều chỉnh chiết khấu {rateTitle}</span>
                                <button className="btn-close ms-auto" style={{ fontSize: 9 }} aria-label="Đóng" onClick={() => setShowRate(false)} />
                            </div>
                            <p className="small text-secondary mb-3">{rateDesc}</p>

                            <label className="form-label small fw-semibold mb-1">Tỷ lệ phí sàn Take-rate (%)</label>
                            <div className="input-group input-group-sm mb-3">
                                <input type="number" step="0.1" min={0} max={100} className="form-control"
                                    value={rateValue} onChange={(e) => setRateValue(e.target.value)} />
                                <span className="input-group-text">%</span>
                            </div>

                            <label className="form-label small fw-semibold mb-1">Lý do điều chỉnh</label>
                            <select className="form-select form-select-sm mb-3" value={rateReason} onChange={(e) => setRateReason(e.target.value)}>
                                <option>Đối tác chiến lược sản lượng &gt; 1000 đơn/quý</option>
                                <option>Chương trình khuyến mãi theo mùa</option>
                                <option>Thỏa thuận hợp đồng mới</option>
                                <option>Khác</option>
                            </select>

                            <div className="d-flex justify-content-end align-items-center gap-3">
                                <button className="btn btn-link btn-sm text-secondary text-decoration-none p-0" onClick={() => setShowRate(false)}>Hủy bỏ</button>
                                <button className="btn btn-sm btn-purple px-3" onClick={applyRate}>Cập nhật</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>

    );
}

export default WorkshopManagement;