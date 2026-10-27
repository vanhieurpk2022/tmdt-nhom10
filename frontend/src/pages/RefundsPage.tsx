import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router";
import Modal from "react-bootstrap/Modal";
import { formatOrderCode } from "../api/OrderService";
import { refundService, type RefundAction, type RefundSummary } from "../api/RefundService";
import { getOrderError, refundStatusLabels } from "../data/orderDetailsData";
import type { RefundStatus } from "../enums/RefundStatus";
import { ROUTES } from "../routes/routes";

const actionLabels: Record<Exclude<RefundAction, "refresh">, string> = {
    approve: "Duyệt yêu cầu",
    reject: "Từ chối yêu cầu",
    process: "Gửi hoàn tiền qua VNPay",
    reconcile: "Ghi nhận kết quả đối soát",
};

export default function RefundsPage() {
    const [params] = useSearchParams();
    return <RefundQueue key={params.toString()} params={params} />;
}

function RefundQueue({ params }: { params: URLSearchParams }) {
    const [, setParams] = useSearchParams();
    const rawOrderId = params.get("orderId");
    const orderId = rawOrderId ? Number(rawOrderId) : undefined;
    const invalidOrderId = orderId !== undefined && (!Number.isSafeInteger(orderId) || orderId <= 0);
    const [search, setSearch] = useState(rawOrderId ?? "");
    const [status, setStatus] = useState<RefundStatus>("REQUESTED");
    const [page, setPage] = useState(0);
    const [version, setVersion] = useState(0);
    const [rows, setRows] = useState<RefundSummary[]>([]);
    const [selected, setSelected] = useState<RefundSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [showRequest, setShowRequest] = useState(params.has("attemptId"));

    useEffect(() => {
        let active = true;
        if (invalidOrderId) return;
        refundService.list(status, page, orderId)
            .then(result => { if (active) { setRows(result); setError(""); } })
            .catch(cause => { if (active) setError(getOrderError(cause, "Không tải được danh sách hoàn tiền.")); })
            .finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, [status, page, orderId, invalidOrderId, version]);

    function reload() {
        setLoading(true);
        setVersion(current => current + 1);
    }

    function changed(refund: RefundSummary) {
        setSelected(refund);
        setMessage(`Yêu cầu #${refund.id}: ${refundStatusLabels[refund.status]}.`);
        reload();
    }

    return <main className="container py-4 py-lg-5">
        <nav className="d-flex flex-wrap gap-3 mb-3" aria-label="Quản trị thanh toán">
            <Link to={ROUTES.ADMIN_ORDER}>Quản lý đơn hàng</Link>
            <Link to={ROUTES.PAYMENT_REVIEWS}>Đối soát thanh toán</Link>
        </nav>
        <h1 className="h3">Quản lý hoàn tiền VNPay</h1>
        <p className="text-secondary">Duyệt yêu cầu, gửi hoàn tiền và theo dõi kết quả VNPay. Chỉ ghi nhận hoàn thành khi đã có kết quả xác nhận.</p>
        <div className="card p-3 mb-4">
            <form className="d-flex flex-wrap align-items-end gap-3" onSubmit={event => {
                event.preventDefault();
                const value = search.trim();
                setParams(value ? { orderId: value } : {});
            }}>
                <div>
                    <label className="form-label" htmlFor="refund-order-search">Mã đơn hàng</label>
                    <input id="refund-order-search" className="form-control" type="number" min={1} step={1} value={search}
                        placeholder="Nhập số đơn hàng" onChange={event => setSearch(event.target.value)} />
                </div>
                <button type="submit" className="btn btn-outline-primary">Tra cứu đơn</button>
                {orderId === undefined && <div>
                    <label className="form-label" htmlFor="refund-status-filter">Trạng thái</label>
                    <select id="refund-status-filter" className="form-select" value={status} onChange={event => {
                        setStatus(event.target.value as RefundStatus); setPage(0); setSelected(null); setLoading(true); setMessage("");
                    }}>
                        {Object.entries(refundStatusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                    </select>
                </div>}
                {orderId !== undefined && <Link className="btn btn-outline-secondary" to={ROUTES.REFUNDS}>Xem hàng đợi</Link>}
                <button type="button" className="btn btn-outline-secondary" disabled={loading || invalidOrderId} onClick={reload}>Cập nhật</button>
                <button type="button" className="btn btn-primary" onClick={() => setShowRequest(current => !current)}>Tạo yêu cầu hoàn tiền</button>
            </form>
        </div>
        {invalidOrderId && <p className="alert alert-danger" role="alert">Mã đơn hàng không hợp lệ.</p>}
        {error && <p className="alert alert-danger" role="alert">{error}</p>}
        {message && <p className="alert alert-success" role="status">{message}</p>}
        {showRequest && <RefundRequestForm initialAttemptId={params.get("attemptId") ?? ""} onCreated={changed} />}
        {loading && !invalidOrderId && <p role="status">Đang tải yêu cầu hoàn tiền…</p>}
        {!loading && !error && !invalidOrderId && <div className="table-responsive">
            <table className="table table-striped align-middle">
                <thead><tr><th>Yêu cầu</th><th>Đơn hàng</th><th>Số tiền</th><th>Trạng thái</th><th>Ngày tạo</th><th /></tr></thead>
                <tbody>{rows.map(refund => <tr key={refund.id}>
                    <td>#{refund.id}</td><td>{formatOrderCode(refund.orderId)}</td>
                    <td className="text-nowrap">{refund.amountVnd.toLocaleString("vi-VN")} ₫</td>
                    <td>{refundStatusLabels[refund.status]}</td><td>{new Date(refund.createdAt).toLocaleString("vi-VN")}</td>
                    <td><button type="button" className="btn btn-sm btn-outline-primary" onClick={() => setSelected(refund)}>Chi tiết</button></td>
                </tr>)}</tbody>
            </table>
            {rows.length === 0 && <p>Không có yêu cầu hoàn tiền phù hợp.</p>}
        </div>}
        {orderId === undefined && <div className="d-flex align-items-center gap-3 mb-4">
            <button type="button" className="btn btn-outline-secondary" disabled={page === 0 || loading} onClick={() => { setPage(current => current - 1); setLoading(true); }}>Trang trước</button>
            <span>Trang {page + 1}</span>
            <button type="button" className="btn btn-outline-secondary" disabled={rows.length < 50 || loading || Boolean(error)} onClick={() => { setPage(current => current + 1); setLoading(true); }}>Trang sau</button>
        </div>}
        {selected && <RefundDetails key={`${selected.id}-${selected.status}`} refund={selected} onChanged={changed} />}
    </main>;
}

function RefundRequestForm({ initialAttemptId, onCreated }: { initialAttemptId: string; onCreated: (refund: RefundSummary) => void }) {
    const [attemptId, setAttemptId] = useState(initialAttemptId);
    const [reason, setReason] = useState("");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const pending = useRef<{ signature: string; key: string } | null>(null);
    const submitting = useRef(false);

    async function submit() {
        const id = Number(attemptId);
        if (submitting.current || !Number.isSafeInteger(id) || id <= 0 || !reason.trim()) return;
        const signature = JSON.stringify([id, reason.trim()]);
        if (pending.current?.signature !== signature) pending.current = { signature, key: crypto.randomUUID() };
        submitting.current = true;
        setBusy(true);
        setError("");
        try {
            const refund = await refundService.request(id, reason.trim(), pending.current.key);
            pending.current = null;
            setReason("");
            onCreated(refund);
        } catch (cause) {
            setError(getOrderError(cause, "Chưa tạo được yêu cầu hoàn tiền. Vui lòng thử lại với cùng nội dung."));
        } finally { submitting.current = false; setBusy(false); }
    }

    return <form className="card p-4 mb-4" onSubmit={event => { event.preventDefault(); void submit(); }}>
        <h2 className="h5">Tạo yêu cầu hoàn tiền</h2>
        <p className="text-secondary small">Dùng mã lần thanh toán đã thu tiền cần hoàn. Hệ thống kiểm tra giao dịch và số tiền trước khi ghi nhận yêu cầu.</p>
        <label className="form-label" htmlFor="refund-attempt">Mã lần thanh toán</label>
        <input id="refund-attempt" className="form-control mb-3" type="number" min={1} step={1} required disabled={busy}
            value={attemptId} onChange={event => setAttemptId(event.target.value)} />
        <label className="form-label" htmlFor="refund-reason">Lý do hoàn tiền</label>
        <textarea id="refund-reason" className="form-control mb-3" rows={2} maxLength={255} required disabled={busy}
            value={reason} onChange={event => setReason(event.target.value)} />
        {error && <p className="alert alert-danger" role="alert">{error}</p>}
        <button type="submit" className="btn btn-primary align-self-start" disabled={busy || !reason.trim()}>{busy ? "Đang ghi nhận…" : "Ghi nhận yêu cầu"}</button>
    </form>;
}

function RefundDetails({ refund, onChanged }: { refund: RefundSummary; onChanged: (refund: RefundSummary) => void }) {
    const [action, setAction] = useState<Exclude<RefundAction, "refresh"> | null>(null);
    const [evidence, setEvidence] = useState("");
    const [transactionNo, setTransactionNo] = useState("");
    const [outcome, setOutcome] = useState<"SUCCEEDED" | "FAILED">("SUCCEEDED");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const submitting = useRef(false);
    const pending = ["PROCESSING", "NEEDS_REVIEW"].includes(refund.status);
    const validEvidence = evidence.trim().length >= 20 && evidence.trim().length <= 500;
    const canSubmit = action === "process" || (validEvidence && (action !== "reconcile"
        || (/^(?!0+$)[0-9]{1,15}$/.test(transactionNo.trim()) && Boolean(refund.providerRequestId))));

    async function submit(next: RefundAction) {
        if (submitting.current || (next !== "refresh" && !canSubmit)) return;
        submitting.current = true;
        setBusy(true);
        setError("");
        try {
            const body = next === "reconcile" ? {
                evidence: evidence.trim(), transactionNo: transactionNo.trim(), status: outcome,
                providerRequestId: refund.providerRequestId!,
            } : { evidence: evidence.trim() };
            const updated = await refundService.act(refund.id, next, body);
            setAction(null);
            onChanged(updated);
        } catch (cause) {
            setError(getOrderError(cause, "Chưa nhận được kết quả xử lý. Hãy cập nhật trạng thái trước khi thực hiện tiếp."));
        } finally { submitting.current = false; setBusy(false); }
    }

    function open(next: Exclude<RefundAction, "refresh">) {
        setError(""); setEvidence(""); setTransactionNo(""); setAction(next);
    }

    return <section className="card p-4 mt-4" aria-labelledby="refund-details-title">
        <h2 className="h5" id="refund-details-title">Yêu cầu #{refund.id} · {formatOrderCode(refund.orderId)}</h2>
        <dl className="row mb-2">
            <dt className="col-sm-4">Trạng thái</dt><dd className="col-sm-8">{refundStatusLabels[refund.status]}</dd>
            <dt className="col-sm-4">Số tiền</dt><dd className="col-sm-8">{refund.amountVnd.toLocaleString("vi-VN")} ₫</dd>
            <dt className="col-sm-4">Lý do</dt><dd className="col-sm-8 text-break">{refund.reason}</dd>
            <dt className="col-sm-4">Lần thanh toán</dt><dd className="col-sm-8">{refund.paymentAttemptId ?? "Chưa xác định"}</dd>
            <dt className="col-sm-4">Mã yêu cầu VNPay</dt><dd className="col-sm-8 text-break">{refund.providerRequestId ?? "Chưa gửi"}</dd>
            <dt className="col-sm-4">Mã giao dịch hoàn tiền</dt><dd className="col-sm-8 text-break">{refund.providerTransactionNo ?? "Chưa có"}</dd>
            <dt className="col-sm-4">Mã phản hồi / trạng thái VNPay</dt><dd className="col-sm-8">{refund.providerResponseCode ?? "—"} / {refund.providerTransactionStatus ?? "—"}</dd>
        </dl>
        {refund.lastError && <p className="alert alert-warning">{refund.lastError}</p>}
        {error && action === null && <p className="alert alert-danger" role="alert">{error}</p>}
        <div className="d-flex flex-wrap gap-2">
            {refund.status === "REQUESTED" && <>
                <button type="button" className="btn btn-primary" disabled={busy} onClick={() => open("approve")}>Duyệt yêu cầu</button>
                <button type="button" className="btn btn-outline-danger" disabled={busy} onClick={() => open("reject")}>Từ chối</button>
            </>}
            {refund.status === "APPROVED" && <button type="button" className="btn btn-primary" disabled={busy} onClick={() => open("process")}>Gửi hoàn tiền qua VNPay</button>}
            {pending && <>
                <button type="button" className="btn btn-outline-primary" disabled={busy} onClick={() => { void submit("refresh"); }}>{busy ? "Đang cập nhật…" : "Kiểm tra kết quả VNPay"}</button>
                {refund.providerRequestId && <button type="button" className="btn btn-outline-secondary" disabled={busy} onClick={() => open("reconcile")}>Đối soát với bằng chứng</button>}
            </>}
        </div>
        <Modal show={action !== null} onHide={() => { if (!busy) setAction(null); }} centered
            backdrop={busy ? "static" : true} keyboard={!busy} aria-labelledby="refund-action-title">
            <Modal.Header closeButton={!busy}><Modal.Title as="h2" id="refund-action-title">{action ? actionLabels[action] : "Xử lý hoàn tiền"}</Modal.Title></Modal.Header>
            <Modal.Body aria-busy={busy}>
                <p>Yêu cầu #{refund.id} · {refund.amountVnd.toLocaleString("vi-VN")} ₫</p>
                {action === "process" ? <p className="mb-0">Xác nhận gửi yêu cầu hoàn tiền tới VNPay. Nếu chưa nhận được kết quả, hãy kiểm tra và đối soát yêu cầu này trước khi xử lý tiếp.</p> : <>
                    {action === "reconcile" && <>
                        <p className="small text-secondary">Kiểm tra kết quả trên cổng merchant VNPay và đối chiếu mã yêu cầu: <code>{refund.providerRequestId}</code>.</p>
                        <label className="form-label" htmlFor="refund-outcome">Kết quả xác nhận</label>
                        <select id="refund-outcome" className="form-select mb-3" disabled={busy} value={outcome}
                            onChange={event => setOutcome(event.target.value as "SUCCEEDED" | "FAILED")}>
                            <option value="SUCCEEDED">Hoàn tiền thành công</option><option value="FAILED">Hoàn tiền thất bại</option>
                        </select>
                        <label className="form-label" htmlFor="refund-transaction">Mã giao dịch VNPay</label>
                        <input id="refund-transaction" className="form-control mb-3" inputMode="numeric" maxLength={15} disabled={busy}
                            value={transactionNo} onChange={event => setTransactionNo(event.target.value)} />
                    </>}
                    <label className="form-label" htmlFor="refund-evidence">Bằng chứng / lý do xử lý (20–500 ký tự)</label>
                    <textarea id="refund-evidence" className="form-control" rows={4} minLength={20} maxLength={500} disabled={busy}
                        value={evidence} onChange={event => setEvidence(event.target.value)} />
                </>}
                {error && <p className="alert alert-danger mt-3 mb-0" role="alert">{error}</p>}
            </Modal.Body>
            <Modal.Footer>
                <button type="button" className="btn btn-outline-secondary" disabled={busy} onClick={() => setAction(null)}>Quay lại</button>
                <button type="button" className={`btn ${action === "reject" ? "btn-danger" : "btn-primary"}`} disabled={busy || !canSubmit} onClick={() => { if (action) void submit(action); }}>
                    {busy ? "Đang xử lý…" : "Xác nhận"}
                </button>
            </Modal.Footer>
        </Modal>
    </section>;
}
