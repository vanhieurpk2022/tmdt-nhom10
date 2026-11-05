import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import api from "../api/api";
import { formatOrderCode } from "../api/OrderService";
import { ROUTES } from "../routes/routes";

interface Review {
    id: number; orderId: number; attemptId: number; type: string; createdAt: string;
}
interface Attempt {
    id: number; txnRef: string; amountVnd: number; status: string;
    responseCode: string | null; providerTransactionStatus: string | null; transactionNo: string | null;
}
const headers = { "X-Requested-With": "XMLHttpRequest" };
const reviewLabels: Record<string, string> = {
    MISSING_IPN: "Chưa nhận được xác nhận thanh toán",
    LATE_PAYMENT: "Nhận tiền sau khi đơn đã hủy hoặc hết hạn",
    ORDER_CANCELLED: "Khách đã hủy đơn đã thanh toán",
    OVERPAYMENT: "Đơn được thanh toán nhiều lần",
    AMOUNT_MISMATCH: "Số tiền thanh toán không khớp",
    CONFLICTING_CALLBACK: "Các thông báo thanh toán không khớp",
    DUPLICATE_RECEIPT_NUMBER: "Mã giao dịch bị trùng",
    UNKNOWN_RESULT: "Kết quả thanh toán cần kiểm tra",
    REFUND_FAILED: "Hoàn tiền chưa thành công",
    REFUND_NEEDS_REVIEW: "Chưa xác minh được kết quả hoàn tiền",
};
const attemptLabels: Record<string, string> = {
    INITIATED: "Chờ xác nhận", SUCCESS: "Đã thanh toán", FAILED: "Thanh toán thất bại",
    EXPIRED: "Hết thời gian thanh toán", NEEDS_REVIEW: "Cần kiểm tra",
};

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
    const [listError, setListError] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [version, setVersion] = useState(0);
    const selectionVersion = useRef(0);

    async function load(currentPage: number) {
        const response = await api.get<Review[]>("/admin/payments/reviews", { params: { page: currentPage } });
        setReviews(response.data);
    }
    useEffect(() => {
        let active = true;
        let request = 0;
        async function refresh() {
            const current = ++request;
            try {
                const response = await api.get<Review[]>("/admin/payments/reviews", { params: { page } });
                if (active && current === request) { setReviews(response.data); setListError(""); }
            } catch {
                if (active && current === request) setListError("Không tải được danh sách giao dịch. Vui lòng thử lại.");
            } finally { if (active && current === request) setLoading(false); }
        }
        void refresh();
        const timer = window.setInterval(() => { if (!document.hidden) void refresh(); }, 15_000);
        return () => { active = false; window.clearInterval(timer); };
    }, [page, version]);

    async function select(review: Review) {
        const current = ++selectionVersion.current;
        setSelected(review); setEvidence(""); setError(""); setMessage("");
        setAttempts([]); setTransactionNo(""); setBank(""); setPayDate(""); setResponseCode(""); setTransactionStatus("");
        try {
            const result = await api.get<Attempt[]>(`/admin/payments/orders/${review.orderId}/attempts`);
            if (current === selectionVersion.current) setAttempts(result.data);
        } catch { if (current === selectionVersion.current) setError("Không tải được chi tiết giao dịch."); }
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
        <h1 className="h3 my-3">Giao dịch thanh toán cần kiểm tra</h1>
        <p>Danh sách các giao dịch chưa rõ kết quả hoặc phát sinh vấn đề khi thanh toán.</p>
        <div className="alert alert-info">
            <strong>Hoàn tiền cho đơn khách đã hủy</strong>
            <p className="mt-1 mb-2">Hệ thống tự tạo yêu cầu hoàn tiền. Vào danh sách hoàn tiền, duyệt yêu cầu và xác nhận sau khi đã hoàn tiền cho khách.</p>
            <Link className="btn btn-primary" to={ROUTES.REFUNDS}>Xem các đơn chờ hoàn tiền</Link>
        </div>
        {listError && <p className="alert alert-danger" role="alert">{listError}</p>}
        {error && <p className="alert alert-danger" role="alert">{error}</p>}
        {message && <p className="alert alert-success" role="status">{message}</p>}
        <div className="table-responsive"><table className="table table-striped">
            <thead><tr><th>Mã đơn hàng</th><th>Vấn đề cần kiểm tra</th><th>Ngày ghi nhận</th><th>Thao tác</th></tr></thead>
            <tbody>{reviews.map(row => <tr key={row.id}>
                <td>{formatOrderCode(row.orderId)}</td>
                <td>{reviewLabels[row.type] ?? "Giao dịch cần kiểm tra"}</td>
                <td>{new Date(row.createdAt).toLocaleString("vi-VN")}</td>
                <td><div className="d-flex flex-wrap gap-2">
                    {["ORDER_CANCELLED", "LATE_PAYMENT", "OVERPAYMENT", "REFUND_FAILED", "REFUND_NEEDS_REVIEW"].includes(row.type)
                        && <Link className="btn btn-sm btn-primary" to={`${ROUTES.REFUNDS}?orderId=${row.orderId}`}>Xem hoàn tiền</Link>}
                    <button type="button" className="btn btn-sm btn-outline-secondary" disabled={busy} onClick={() => { void select(row); }}>Xem giao dịch</button>
                </div></td>
            </tr>)}</tbody>
        </table></div>
        {loading && <p role="status">Đang tải giao dịch…</p>}
        {!loading && !listError && !reviews.length && <p>Không có giao dịch cần kiểm tra trong trang này.</p>}
        <div className="d-flex flex-wrap gap-2">
            <button type="button" className="btn btn-outline-secondary" disabled={page === 0 || loading || busy} onClick={() => { setPage(page - 1); setLoading(true); }}>Trang trước</button>
            <button type="button" className="btn btn-outline-secondary" disabled={reviews.length < 50 || loading || busy} onClick={() => { setPage(page + 1); setLoading(true); }}>Trang sau</button>
            <button type="button" className="btn btn-outline-primary" disabled={loading || busy} onClick={() => { setVersion(current => current + 1); setLoading(true); }}>Cập nhật danh sách</button>
        </div>
        {selected && <section className="card p-4 mt-4">
            <h2 className="h5">Giao dịch của đơn {formatOrderCode(selected.orderId)}</h2>
            <p>{reviewLabels[selected.type] ?? "Giao dịch cần kiểm tra"}</p>
            <Link className="btn btn-outline-primary align-self-start mb-3" to={`${ROUTES.REFUNDS}?orderId=${selected.orderId}`}>Xem yêu cầu hoàn tiền của đơn này</Link>
            {attempts.map(attempt => <p key={attempt.id}><strong>Lần thanh toán #{attempt.id}</strong> · {attempt.amountVnd.toLocaleString("vi-VN")} ₫ · {attemptLabels[attempt.status] ?? "Đang cập nhật"}
                {attempt.transactionNo && <span className="d-block small text-secondary">Mã giao dịch VNPay: {attempt.transactionNo}</span>}
            </p>)}
            <details key={selected.id} className="border-top pt-3">
                <summary className="fw-semibold">Xử lý thủ công sau khi kiểm tra trên VNPay</summary>
                <p className="small text-secondary mt-3">Dùng khi cần đối chiếu giao dịch chưa rõ kết quả với cổng quản trị VNPay. Để hoàn tiền cho đơn đã hủy, mở yêu cầu hoàn tiền ở nút phía trên.</p>
                <label className="form-label">Bằng chứng kiểm tra giao dịch (20–500 ký tự)
                    <textarea className="form-control" rows={3} minLength={20} maxLength={500} value={evidence} onChange={event => setEvidence(event.target.value)} />
                </label>
                <div className="row g-3 mb-3">
                    <label className="col-md-2">Mã phản hồi VNPay<input className="form-control" maxLength={2} value={responseCode} onChange={event => setResponseCode(event.target.value)} /></label>
                    <label className="col-md-2">Mã trạng thái giao dịch<input className="form-control" maxLength={2} value={transactionStatus} onChange={event => setTransactionStatus(event.target.value)} /></label>
                    <label className="col-md-3">Mã giao dịch VNPay<input className="form-control" value={transactionNo} onChange={event => setTransactionNo(event.target.value)} /></label>
                    <label className="col-md-2">Mã ngân hàng<input className="form-control" value={bank} onChange={event => setBank(event.target.value)} /></label>
                    <label className="col-md-4">Ngày giao dịch (yyyyMMddHHmmss)<input className="form-control" value={payDate} onChange={event => setPayDate(event.target.value)} /></label>
                </div>
                <div className="d-flex gap-2 flex-wrap">
                    <button className="btn btn-primary" disabled={busy || evidence.trim().length < 20 || !/^\d{2}$/.test(responseCode) || !/^\d{2}$/.test(transactionStatus) || !transactionNo || !bank || !payDate} onClick={() => { void act(true); }}>Lưu kết quả đã kiểm tra trên VNPay</button>
                    <button className="btn btn-outline-secondary" disabled={busy || evidence.trim().length < 20} onClick={() => { void act(false); }}>Đánh dấu đã xử lý sự việc</button>
                </div>
                <p className="small text-secondary mt-2 mb-0">Đánh dấu đã xử lý sự việc chỉ lưu kết quả kiểm tra. Để hoàn tiền cho khách, dùng trang quản lý hoàn tiền.</p>
            </details>
        </section>}
    </main>;
}
