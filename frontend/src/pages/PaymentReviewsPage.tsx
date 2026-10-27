import { useEffect, useState } from "react";
import { Link } from "react-router";
import api from "../api/api";
import { ROUTES } from "../routes/routes";

interface Review {
    id: number; orderId: number; attemptId: number; type: string; createdAt: string;
}
interface Attempt {
    id: number; txnRef: string; amountVnd: number; status: string;
    responseCode: string | null; providerTransactionStatus: string | null; transactionNo: string | null;
}
const headers = { "X-Requested-With": "XMLHttpRequest" };

export default function PaymentReviewsPage() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [selected, setSelected] = useState<Review | null>(null);
    const [attempts, setAttempts] = useState<Attempt[]>([]);
    const [page, setPage] = useState(0);
    const [evidence, setEvidence] = useState("");
    const [transactionNo, setTransactionNo] = useState("");
    const [bank, setBank] = useState("");
    const [payDate, setPayDate] = useState("");
    const [responseCode, setResponseCode] = useState("");
    const [transactionStatus, setTransactionStatus] = useState("");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    async function load(currentPage: number) {
        const response = await api.get<Review[]>("/admin/payments/reviews", { params: { page: currentPage } });
        setReviews(response.data);
    }
    useEffect(() => {
        let active = true;
        api.get<Review[]>("/admin/payments/reviews", { params: { page } })
            .then(response => { if (active) setReviews(response.data); })
            .catch(() => { if (active) setError("Không tải được hàng đợi. Tài khoản cần quyền ADMIN."); });
        return () => { active = false; };
    }, [page]);

    async function select(review: Review) {
        setSelected(review); setEvidence(""); setError(""); setMessage("");
        try {
            const result = await api.get<Attempt[]>(`/admin/payments/orders/${review.orderId}/attempts`);
            setAttempts(result.data);
        } catch { setError("Không tải được chi tiết giao dịch."); }
    }

    async function act(reconcile: boolean) {
        if (!selected || evidence.trim().length < 20 || busy) return;
        setBusy(true); setError(""); setMessage("");
        try {
            if (reconcile) {
                await api.post(`/admin/payments/attempts/${selected.attemptId}/reconcile`, {
                    responseCode, transactionStatus, transactionNo, bankCode: bank, payDate, evidence,
                }, { headers });
                await select(selected);
                setMessage("Đã lưu kết quả đối soát và bằng chứng. Hãy kiểm tra trạng thái đơn trước khi đóng yêu cầu.");
            } else {
                await api.post(`/admin/payments/reviews/${selected.id}/resolve`, { evidence }, { headers });
                setSelected(null); setMessage("Đã đóng yêu cầu và lưu bằng chứng xử lý.");
            }
            await load(page);
        } catch (cause) {
            const failure = cause as { response?: { data?: { message?: string } } };
            setError(failure.response?.data?.message || "Không lưu được kết quả xử lý.");
        } finally { setBusy(false); }
    }

    return <main className="container py-5">
        <Link to={ROUTES.ADMIN_ORDER}>Quản lý đơn hàng</Link>
        <Link className="ms-3" to={ROUTES.REFUNDS}>Quản lý hoàn tiền</Link>
        <h1 className="h3 my-3">Đối soát thanh toán VNPay</h1>
        <p>Tra cứu giao dịch trên cổng merchant VNPay trước khi xác nhận. Theo dõi và xử lý tiền về muộn, thu dư hoặc đơn đã hủy tại mục quản lý hoàn tiền.</p>
        {error && <p className="alert alert-danger" role="alert">{error}</p>}
        {message && <p className="alert alert-success" role="status">{message}</p>}
        <div className="table-responsive"><table className="table table-striped">
            <thead><tr><th>Yêu cầu</th><th>Đơn</th><th>Lần thanh toán</th><th>Lý do</th><th>Thời gian</th><th /></tr></thead>
            <tbody>{reviews.map(row => <tr key={row.id}><td>{row.id}</td><td>{row.orderId}</td><td>{row.attemptId}</td><td>{row.type}</td><td>{new Date(row.createdAt).toLocaleString("vi-VN")}</td><td><button className="btn btn-sm btn-outline-primary" onClick={() => { void select(row); }}>Xử lý</button></td></tr>)}</tbody>
        </table></div>
        {!reviews.length && <p>Không có yêu cầu trong trang này.</p>}
        <div className="d-flex gap-2"><button className="btn btn-outline-secondary" disabled={page === 0} onClick={() => setPage(page - 1)}>Trang trước</button><button className="btn btn-outline-secondary" disabled={reviews.length < 50} onClick={() => setPage(page + 1)}>Trang sau</button></div>
        {selected && <section className="card p-4 mt-4">
            <h2 className="h5">Yêu cầu #{selected.id} — đơn #{selected.orderId}</h2>
            <Link className="align-self-start mb-3" to={`${ROUTES.REFUNDS}?orderId=${selected.orderId}&attemptId=${selected.attemptId}`}>Xem / tạo yêu cầu hoàn tiền cho giao dịch này</Link>
            {attempts.map(attempt => <p key={attempt.id}><strong>#{attempt.id}</strong> · <code>{attempt.txnRef}</code> · {attempt.amountVnd.toLocaleString("vi-VN")} ₫ · {attempt.status} · mã {attempt.responseCode ?? "—"}/{attempt.providerTransactionStatus ?? "—"} · giao dịch {attempt.transactionNo ?? "—"}</p>)}
            <label className="form-label">Bằng chứng tra soát / hoàn tiền thực tế (20–500 ký tự)
                <textarea className="form-control" rows={3} minLength={20} maxLength={500} value={evidence} onChange={event => setEvidence(event.target.value)} />
            </label>
            <div className="row g-3 mb-3">
                <label className="col-md-2">ResponseCode<input className="form-control" maxLength={2} value={responseCode} onChange={event => setResponseCode(event.target.value)} /></label>
                <label className="col-md-2">TransactionStatus<input className="form-control" maxLength={2} value={transactionStatus} onChange={event => setTransactionStatus(event.target.value)} /></label>
                <label className="col-md-3">Mã giao dịch VNPay<input className="form-control" value={transactionNo} onChange={event => setTransactionNo(event.target.value)} /></label>
                <label className="col-md-2">Mã ngân hàng<input className="form-control" value={bank} onChange={event => setBank(event.target.value)} /></label>
                <label className="col-md-4">Ngày giao dịch (yyyyMMddHHmmss)<input className="form-control" value={payDate} onChange={event => setPayDate(event.target.value)} /></label>
            </div>
            <div className="d-flex gap-2 flex-wrap">
                <button className="btn btn-primary" disabled={busy || evidence.trim().length < 20 || !/^\d{2}$/.test(responseCode) || !/^\d{2}$/.test(transactionStatus) || !transactionNo || !bank || !payDate} onClick={() => { void act(true); }}>Ghi nhận kết quả từ cổng merchant</button>
                <button className="btn btn-outline-secondary" disabled={busy || evidence.trim().length < 20} onClick={() => { void act(false); }}>Đóng yêu cầu với bằng chứng</button>
            </div>
            <small className="mt-2">Đóng yêu cầu chỉ lưu kết quả xử lý; thao tác này không gọi API hoàn tiền và không đổi trạng thái đã thu tiền.</small>
        </section>}
    </main>;
}
