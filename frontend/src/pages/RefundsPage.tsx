import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router";
import Modal from "react-bootstrap/Modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faRotate } from "@fortawesome/free-solid-svg-icons";
import SidebarAdmin from "../components/admin/dashboard/SideBarAdmin";
import { useAdminSidebar } from "../api/AdminSidebarContext";
import { formatOrderCode } from "../api/OrderService";
import { refundService, type RefundAction, type RefundSummary } from "../api/RefundService";
import { getOrderError, refundStatusLabels } from "../data/orderDetailsData";
import type { RefundStatus } from "../enums/RefundStatus";
import { ROUTES } from "../routes/routes";
import "../css/pages/user-admin.css";

const filters: RefundStatus[] = ["REQUESTED", "APPROVED", "SUCCEEDED", "FAILED", "REJECTED"];
const money = (amount: number) => amount.toLocaleString("vi-VN") + " ₫";
const date = (value: string) => new Date(value).toLocaleString("vi-VN");
const tone = (status: RefundStatus) => status === "SUCCEEDED" ? "success" : ["FAILED", "REJECTED"].includes(status) ? "danger" : "warning";
const actionLabels: Record<RefundAction, string> = {
    approve: "Duyệt hoàn tiền", reject: "Từ chối yêu cầu", succeed: "Xác nhận đã hoàn tiền", fail: "Chưa hoàn được",
};

export default function RefundsPage() {
    const [params] = useSearchParams();
    return <RefundQueue key={params.toString()} params={params} />;
}

function RefundQueue({ params }: { params: URLSearchParams }) {
    const [, setParams] = useSearchParams();
    const { isCollapsed } = useAdminSidebar();
    const rawOrderId = params.get("orderId");
    const orderId = rawOrderId ? Number(rawOrderId) : undefined;
    const invalidOrderId = orderId !== undefined && (!Number.isSafeInteger(orderId) || orderId <= 0);
    const [search, setSearch] = useState(rawOrderId ?? "");
    const [status, setStatus] = useState<RefundStatus | "">("");
    const [page, setPage] = useState(0);
    const [version, setVersion] = useState(0);
    const [rows, setRows] = useState<RefundSummary[]>([]);
    const [selected, setSelected] = useState<RefundSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [opening, setOpening] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState<{ text: string; tone: string } | null>(null);

    useEffect(() => {
        let active = true;
        let request = 0;
        if (invalidOrderId) { setLoading(false); setError("Mã đơn hàng không hợp lệ."); return; }
        async function refresh() {
            const current = ++request;
            try {
                const result = await refundService.list(status || undefined, page, orderId);
                if (active && current === request) { setRows(result); setError(""); }
            } catch (cause) {
                if (active && current === request) setError(getOrderError(cause, "Không tải được yêu cầu hoàn tiền. Vui lòng thử lại."));
            } finally { if (active && current === request) setLoading(false); }
        }
        void refresh();
        const timer = window.setInterval(() => { if (!document.hidden) void refresh(); }, 15_000);
        return () => { active = false; window.clearInterval(timer); };
    }, [orderId, invalidOrderId, status, page, version]);

    async function select(id: number) {
        setOpening(true);
        try { setSelected(await refundService.get(id)); }
        catch (cause) { setError(getOrderError(cause, "Không tải được chi tiết yêu cầu.")); }
        finally { setOpening(false); }
    }

    function changed(refund: RefundSummary) {
        setSelected(refund);
        setMessage({ text: `Yêu cầu #${refund.id}: ${refundStatusLabels[refund.status]}.`, tone: tone(refund.status) });
        if (!orderId && status) setStatus(filters.includes(refund.status) ? refund.status : "APPROVED");
        setPage(0);
        setVersion(current => current + 1);
    }

    return <div className="d-flex min-vh-100 w-100 admin-customer-page">
        <aside className="flex-shrink-0 position-sticky top-0 align-self-start" style={{ width: isCollapsed ? 72 : 250, height: "100vh" }}>
            <SidebarAdmin isRefund />
        </aside>
        <main className="flex-grow-1 p-3 p-lg-4" style={{ minWidth: 0 }}>
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
                <div>
                    <nav className="admin-breadcrumb" aria-label="Đường dẫn">
                        <Link className="text-secondary text-decoration-none" to={ROUTES.ADMIN_ORDER}>Quản lý đơn hàng</Link>
                        <span className="crumb-sep">›</span><span className="active-crumb">Hoàn tiền VNPay</span>
                    </nav>
                    <h1 className="h4 fw-bold text-dark mb-1">Quản lý hoàn tiền VNPay</h1>
                    <p className="text-secondary mb-0">Xử lý các khoản VNPay cần hoàn khi khách hủy đơn hoặc phát sinh thanh toán thừa, đến muộn.</p>
                </div>
                <button type="button" className="btn-action-secondary" disabled={loading} onClick={() => { setLoading(true); setVersion(current => current + 1); }}>
                    <FontAwesomeIcon icon={faRotate} className={loading ? "fa-spin" : ""} /> Làm mới
                </button>
            </div>
            <div className="filter-card">
                <div className="fw-semibold mb-2">1. Kiểm tra yêu cầu <span className="text-secondary mx-2">→</span> 2. Duyệt hoàn tiền <span className="text-secondary mx-2">→</span> 3. Xác nhận đã hoàn tiền</div>
                <p className="text-secondary mb-0">Yêu cầu được tạo tự động từ khoản đã thanh toán. Admin thực hiện hoàn tiền cho khách, sau đó xác nhận kết quả tại đây.</p>
            </div>
            <form className="filter-card row g-3 align-items-end mx-0" onSubmit={event => {
                event.preventDefault();
                const value = search.trim().replace(/^OLIA-0*/i, "");
                if (value && (!/^[0-9]+$/.test(value) || !Number.isSafeInteger(Number(value)) || Number(value) <= 0)) {
                    setError("Nhập số đơn hàng hoặc mã dạng OLIA-00000021."); return;
                }
                setParams(value ? { orderId: String(Number(value)) } : {});
            }}>
                <div className="col-12 col-md-5">
                    <label className="form-label" htmlFor="refund-search">Mã đơn hàng</label>
                    <div className="search-input-wrapper">
                        <FontAwesomeIcon icon={faMagnifyingGlass} />
                        <input id="refund-search" value={search} placeholder="Nhập mã hoặc số đơn hàng" onChange={event => setSearch(event.target.value)} />
                    </div>
                </div>
                <div className="col-12 col-md-4">
                    <label className="form-label" htmlFor="refund-status">Trạng thái</label>
                    <select id="refund-status" className="filter-select" value={status} disabled={Boolean(orderId)} onChange={event => {
                        setStatus(event.target.value as RefundStatus | ""); setPage(0); setLoading(true);
                    }}>
                        <option value="">Tất cả trạng thái</option>
                        {filters.map(item => <option key={item} value={item}>{refundStatusLabels[item]}</option>)}
                    </select>
                </div>
                <div className="col-12 col-md-3 d-flex gap-2">
                    <button className="btn-header-primary" type="submit">Tra cứu</button>
                    {orderId && <button className="btn-action-secondary" type="button" onClick={() => setParams({})}>Xem tất cả</button>}
                </div>
            </form>
            {error && <p className="alert alert-danger" role="alert">{error}</p>}
            {message && <p className={`alert alert-${message.tone}`} role="status">{message.text}</p>}
            <div className="table-card">
                <div className="table-responsive">
                    <table className="admin-table">
                        <thead><tr><th>Yêu cầu / Đơn hàng</th><th>Khách hàng</th><th>Số tiền hoàn</th><th>Trạng thái</th><th>Ngày tạo</th><th>Thao tác</th></tr></thead>
                        <tbody>
                            {loading ? <tr><td colSpan={6} className="text-center py-5" role="status">Đang tải yêu cầu hoàn tiền…</td></tr>
                                : rows.map(refund => <tr key={refund.id}>
                                    <td><span className="fw-semibold">{formatOrderCode(refund.orderId)}</span><span className="d-block text-secondary mt-1">Yêu cầu #{refund.id}</span></td>
                                    <td><span className="customer-name">{refund.recipientName}</span><span className="d-block text-secondary mt-1">{refund.phoneNumber}</span></td>
                                    <td className="fw-semibold text-nowrap">{money(refund.amountVnd)}</td>
                                    <td><span className={`badge rounded-pill bg-${tone(refund.status)}-subtle text-${tone(refund.status)}-emphasis`}>{refundStatusLabels[refund.status]}</span></td>
                                    <td className="text-nowrap">{date(refund.createdAt)}</td>
                                    <td><button type="button" className="btn-action-secondary" disabled={opening} onClick={() => { void select(refund.id); }}>
                                        {["SUCCEEDED", "REJECTED"].includes(refund.status) ? "Xem chi tiết" : "Xử lý"}
                                    </button></td>
                                </tr>)}
                            {!loading && !error && !rows.length && <tr><td colSpan={6} className="text-center text-secondary py-5">Không có yêu cầu hoàn tiền phù hợp.</td></tr>}
                        </tbody>
                    </table>
                </div>
                {!orderId && <div className="d-flex justify-content-end align-items-center gap-2 p-3">
                    <button type="button" className="pagination-btn" disabled={!page || loading} onClick={() => { setPage(current => current - 1); setLoading(true); }}>Trang trước</button>
                    <span className="mx-2">Trang {page + 1}</span>
                    <button type="button" className="pagination-btn" disabled={rows.length < 50 || loading || Boolean(error)} onClick={() => { setPage(current => current + 1); setLoading(true); }}>Trang sau</button>
                </div>}
            </div>
        </main>
        {selected && <RefundDetails key={`${selected.id}-${selected.status}`} refund={selected} onClose={() => setSelected(null)} onChanged={changed} />}
    </div>;
}

function RefundDetails({ refund, onClose, onChanged }: { refund: RefundSummary; onClose: () => void; onChanged: (refund: RefundSummary) => void }) {
    const [action, setAction] = useState<RefundAction | null>(null);
    const [note, setNote] = useState("");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const submitting = useRef(false);
    const awaiting = ["APPROVED", "PROCESSING", "NEEDS_REVIEW"].includes(refund.status);

    async function submit(next: RefundAction) {
        if (submitting.current) return;
        submitting.current = true;
        setBusy(true); setError("");
        try { onChanged(await refundService.act(refund.id, next, note.trim())); }
        catch (cause) { setError(getOrderError(cause, "Chưa lưu được kết quả. Vui lòng cập nhật yêu cầu trước khi thử lại.")); }
        finally { submitting.current = false; setBusy(false); }
    }

    return <Modal show onHide={() => { if (!busy) onClose(); }} centered backdrop={busy ? "static" : true} keyboard={!busy} aria-labelledby="refund-details-title">
        <Modal.Header closeButton={!busy}><Modal.Title as="h2" id="refund-details-title" className="h5">Yêu cầu hoàn tiền #{refund.id}</Modal.Title></Modal.Header>
        <Modal.Body aria-busy={busy}>
            <div className="d-flex justify-content-between align-items-center gap-3 mb-3">
                <strong className="fs-5">{formatOrderCode(refund.orderId)}</strong>
                <span className={`badge bg-${tone(refund.status)}-subtle text-${tone(refund.status)}-emphasis`}>{refundStatusLabels[refund.status]}</span>
            </div>
            <dl className="row mb-0">
                <dt className="col-5">Khách hàng</dt><dd className="col-7 text-break">{refund.recipientName}</dd>
                <dt className="col-5">Số điện thoại</dt><dd className="col-7">{refund.phoneNumber}</dd>
                <dt className="col-5">Thanh toán</dt><dd className="col-7">VNPay · Đã thu tiền</dd>
                <dt className="col-5">Đơn hàng</dt><dd className="col-7">{refund.orderStatus === "CANCELLED" ? "Đã hủy" : "Khoản thu thừa / đến muộn"}</dd>
                {refund.cancelledAt && <><dt className="col-5">Ngày hủy</dt><dd className="col-7">{date(refund.cancelledAt)}</dd></>}
                <dt className="col-5">Số tiền hoàn</dt><dd className="col-7 fw-bold text-danger">{money(refund.amountVnd)}</dd>
                <dt className="col-5">Lý do hoàn</dt><dd className="col-7 text-break">{refund.reason}</dd>
            </dl>
            {refund.approvedBy && <p className="small text-secondary text-break mb-2">Người duyệt: {refund.approvedBy}{refund.approvedAt && ` · ${date(refund.approvedAt)}`}</p>}
            {refund.processedBy && refund.processedAt && <p className="small text-secondary text-break mb-2">Người cập nhật: {refund.processedBy} · {date(refund.processedAt)}</p>}
            {refund.note && <p className="bg-light rounded p-3 text-break mb-0">{refund.note}</p>}
            {action && <div className="border-top mt-3 pt-3">
                <p className="fw-semibold">{actionLabels[action]}</p>
                <p>{action === "succeed" ? `Bạn xác nhận đã hoàn ${money(refund.amountVnd)} cho khách. Đơn hàng sẽ được cập nhật kết quả hoàn tiền.`
                    : action === "reject" ? "Yêu cầu sẽ được ghi nhận là từ chối. Khoản tiền chưa được ghi nhận đã hoàn."
                    : "Khoản tiền sẽ tiếp tục được ghi nhận là chưa hoàn cho khách. Bạn có thể xử lý lại sau."}</p>
                {action !== "succeed" && <label className="form-label w-100">Ghi chú (không bắt buộc)
                    <textarea className="form-control mt-2" rows={2} maxLength={500} value={note} disabled={busy} onChange={event => setNote(event.target.value)} />
                </label>}
            </div>}
            {error && <p className="alert alert-danger mt-3 mb-0" role="alert">{error}</p>}
        </Modal.Body>
        <Modal.Footer>
            {action ? <>
                <button type="button" className="btn btn-outline-secondary" disabled={busy} onClick={() => { setAction(null); setError(""); }}>Quay lại</button>
                <button type="button" className={`btn ${action === "succeed" ? "btn-success" : "btn-danger"}`} disabled={busy} onClick={() => { void submit(action); }}>{busy ? "Đang lưu…" : "Xác nhận"}</button>
            </> : <>
                <button type="button" className="btn btn-outline-secondary" disabled={busy} onClick={onClose}>Đóng</button>
                {refund.status === "REQUESTED" && <button type="button" className="btn btn-outline-danger" disabled={busy} onClick={() => setAction("reject")}>Từ chối</button>}
                {["REQUESTED", "FAILED"].includes(refund.status) && <button type="button" className="btn-header-primary" disabled={busy} onClick={() => { void submit("approve"); }}>
                    {busy ? "Đang lưu…" : refund.status === "FAILED" ? "Xử lý lại" : actionLabels.approve}
                </button>}
                {awaiting && <>
                    <button type="button" className="btn btn-outline-danger" disabled={busy} onClick={() => setAction("fail")}>Chưa hoàn được</button>
                    <button type="button" className="btn btn-success" disabled={busy} onClick={() => setAction("succeed")}>Xác nhận đã hoàn tiền</button>
                </>}
            </>}
        </Modal.Footer>
    </Modal>;
}
