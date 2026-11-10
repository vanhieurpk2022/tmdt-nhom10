import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { isAxiosError } from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleExclamation } from "@fortawesome/free-solid-svg-icons";
import { orderService, formatOrderCode, getPaymentMethodLabel, type CancelReason, type OrderResponse } from "../api/OrderService";
import type { RefundBankAccount } from "../api/RefundService";
import Breadcrumb from "../components/layout/Breadcrumb";
import RefundAccountForm from "../components/order-success/RefundAccountForm";
import { formatVnd } from "../components/format/FormatMoney";
import { useToastContext } from "../components/toasts/ToastContext";
import { fallbackCartImage } from "../data/cartData";
import { canCancelOrder, cancelReasonLabels, customerCancelReasons, getOrderError } from "../data/orderDetailsData";
import { getOrderStatusView } from "../data/orderSuccessData";
import { isRefundAccountValid } from "../data/refundData";
import { ROUTES } from "../routes/routes";

export default function OrderCancellationPage() {
    const { id } = useParams();
    return <OrderCancellation key={id} id={Number(id)} />;
}

function OrderCancellation({ id }: { id: number }) {
    const navigate = useNavigate();
    const { showToast } = useToastContext();
    const [result, setResult] = useState<{ order: OrderResponse | null; error: string } | null>(null);
    const [version, setVersion] = useState(0);
    const [reason, setReason] = useState<CancelReason | "">("");
    const [note, setNote] = useState("");
    const [refundAccount, setRefundAccount] = useState<RefundBankAccount>({ bankName: "", accountNumber: "", accountHolder: "", confirmed: false });
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);
    const submitting = useRef(false);
    const mounted = useRef(false);
    const validId = Number.isSafeInteger(id) && id > 0;
    const order = result?.order;
    const needsRefundAccount = order?.paymentMethod === "VNPAY" && order.paymentStatus === "PAID";
    const detailUrl = ROUTES.ORDER_DETAIL.replace(":id", String(id));

    useEffect(() => {
        let active = true;
        mounted.current = true;
        window.scrollTo({ top: 0, behavior: "instant" });
        if (validId) {
            orderService.getOrder(id)
                .then(order => { if (active) setResult({ order, error: "" }); })
                .catch(cause => { if (active) setResult({ order: null, error: getOrderError(cause, "Chưa tải được đơn hàng. Vui lòng thử lại.") }); });
        }
        return () => { active = false; mounted.current = false; };
    }, [id, validId, version]);

    async function cancel(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!order || !canCancelOrder(order) || !reason || submitting.current || (reason === "OTHER" && !note.trim())) return;
        if (needsRefundAccount && !isRefundAccountValid(refundAccount)) return;
        submitting.current = true;
        setBusy(true);
        setError("");
        try {
            const updated = await orderService.cancelOrder(id, { reason, note: note.trim() || undefined,
                ...(needsRefundAccount ? { refundAccount } : {}),
            });
            if (!mounted.current) return;
            showToast("Đã hủy đơn hàng", updated.paymentStatus === "REFUND_PENDING"
                ? "Yêu cầu hoàn tiền VNPay đã được ghi nhận. Bạn có thể theo dõi tại chi tiết đơn hàng."
                : "Đơn hàng đã ngừng xử lý.");
            navigate(detailUrl, { replace: true });
        } catch (cause) {
            if (!mounted.current) return;
            setError(getOrderError(cause, "Chưa thể hủy đơn hàng. Vui lòng kiểm tra lại trạng thái và thử lại."));
            if (isAxiosError(cause) && [400, 409].includes(cause.response?.status ?? 0)) {
                const refreshed = await orderService.getOrder(id).catch(() => null);
                if (refreshed && mounted.current) setResult({ order: refreshed, error: "" });
            }
        } finally {
            submitting.current = false;
            if (mounted.current) setBusy(false);
        }
    }

    return (
        <main className="order-success-page profile-page">
            <div className="container-fluid px-4 px-lg-5">
                <div className="order-success-content">
                    <Breadcrumb items={[
                        { label: "Trang chủ", to: ROUTES.HOME },
                        { label: "Đơn hàng của tôi", to: ROUTES.ORDERS },
                        ...(order ? [{ label: formatOrderCode(order.id), to: detailUrl }] : []),
                        { label: "Hủy đơn hàng" },
                    ]} />
                    <header className="account-heading mb-4">
                        <h1>Hủy đơn hàng</h1>
                        <p className="small">Vui lòng kiểm tra đúng đơn hàng và chọn lý do bạn muốn hủy.</p>
                    </header>
                    {!order ? <section className="account-panel">
                        <p role={result?.error || !validId ? "alert" : "status"}>
                            {!validId ? "Mã đơn hàng không hợp lệ." : result?.error || "Đang tải đơn hàng…"}
                        </p>
                        {result?.error && <button type="button" className="btn btn-outline-secondary account-button me-2"
                            onClick={() => { setResult(null); setVersion(value => value + 1); }}>Thử lại</button>}
                        <Link className="btn btn-light border account-button" to={ROUTES.ORDERS}>Về đơn hàng của tôi</Link>
                    </section> : <div className="row g-4 align-items-start">
                        <form className="col-12 col-lg-7 order-2 order-lg-1 account-form" onSubmit={event => { void cancel(event); }} aria-busy={busy}>
                            {error && <p className="alert alert-danger" role="alert">{error}</p>}
                            {canCancelOrder(order) ? <>
                                <section className="account-panel">
                                    <fieldset disabled={busy}>
                                        <legend className="h6 fw-semibold mb-2">Vì sao bạn muốn hủy đơn?</legend>
                                        <p className="small text-secondary border-bottom pb-3 mb-3">Chọn một lý do để Oilia phục vụ bạn tốt hơn.</p>
                                        <div className="d-grid gap-2 mb-4">
                                            {customerCancelReasons.map(value => <label key={value} className="account-choice border rounded-3 px-3 py-2 d-flex align-items-center gap-3">
                                                <input className="form-check-input m-0 flex-shrink-0" type="radio" name="cancel-reason" value={value}
                                                    checked={reason === value} required onChange={() => { setReason(value); setError(""); }} />
                                                <span>{cancelReasonLabels[value]}</span>
                                            </label>)}
                                        </div>
                                        <label className="form-label" htmlFor="cancel-note">
                                            {reason === "OTHER" ? "Lý do khác / Ghi chú (bắt buộc)" : "Ghi chú (không bắt buộc)"}
                                        </label>
                                        <textarea id="cancel-note" className="form-control" rows={4} maxLength={500} required={reason === "OTHER"}
                                            aria-describedby="cancel-note-help cancel-note-count" value={note} onChange={event => setNote(event.target.value)} />
                                        <div className="d-flex justify-content-between gap-3 small text-secondary mt-2">
                                            <span id="cancel-note-help">Vui lòng ghi rõ lý do khi chọn “Lý do khác”.</span>
                                            <span id="cancel-note-count" className="text-nowrap">{note.length}/500</span>
                                        </div>
                                    </fieldset>
                                    {needsRefundAccount && <p className="small text-secondary mt-3 mb-0">
                                        Sau khi hủy, hệ thống sẽ tạo yêu cầu hoàn tiền VNPay để cửa hàng xử lý. Kết quả được cập nhật tại chi tiết đơn hàng.
                                    </p>}
                                </section>
                                {needsRefundAccount && <RefundAccountForm value={refundAccount} disabled={busy} recipientName={order.recipientName}
                                    phoneNumber={order.phoneNumber} onChange={value => { setRefundAccount(value); setError(""); }} />}
                                <div className="alert alert-warning d-flex align-items-start gap-2 my-3">
                                    <FontAwesomeIcon icon={faCircleExclamation} className="mt-1 flex-shrink-0" aria-hidden="true" />
                                    <div className="small"><strong className="d-block mb-1">Đơn hàng sẽ ngừng xử lý sau khi hủy</strong>
                                        Nếu muốn mua lại, bạn cần đặt đơn mới theo giá và tồn kho tại thời điểm đặt.
                                    </div>
                                </div>
                            </> : <p className="alert alert-warning" role="status">Đơn hàng không còn đủ điều kiện để hủy. Bạn chỉ có thể hủy trước khi bàn giao cho đơn vị vận chuyển.</p>}
                            <div className="d-flex flex-wrap justify-content-end gap-2">
                                <button type="button" className="btn btn-light border account-button" disabled={busy} onClick={() => navigate(detailUrl)}>Quay lại, giữ đơn hàng</button>
                                {canCancelOrder(order) && <button type="submit" className="btn btn-primary account-button"
                                    disabled={busy || !reason || (reason === "OTHER" && !note.trim()) || (needsRefundAccount && !isRefundAccountValid(refundAccount))}>
                                    {busy ? "Đang hủy đơn…" : "Xác nhận hủy đơn"}
                                </button>}
                            </div>
                        </form>
                        <div className="col-12 col-lg-5 order-1 order-lg-2">
                            <CancellationSummary order={order} />
                        </div>
                    </div>}
                </div>
            </div>
        </main>
    );
}

function CancellationSummary({ order }: { order: OrderResponse }) {
    return <aside className="account-panel" aria-labelledby="cancel-order-summary-title">
        <h2 className="h6 fw-semibold mb-3" id="cancel-order-summary-title">Đơn hàng cần hủy</h2>
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-2">
            <strong>{formatOrderCode(order.id)}</strong>
            <span className="badge rounded-pill bg-light text-secondary border fw-medium">{getOrderStatusView(order.status).label}</span>
        </div>
        <p className="small text-secondary mb-0">Đặt lúc <time dateTime={order.createdAt}>{new Date(order.createdAt).toLocaleString("vi-VN")}</time></p>
        <div className="order-history-products border-top border-bottom my-3">
            {order.items.map(item => <article className="order-history-product d-flex align-items-start" key={item.id}>
                <img className="flex-shrink-0" src={item.thumbnailUrl || fallbackCartImage} alt="" loading="lazy" />
                <div className="text-break">
                    <h4>{item.productName}</h4>
                    <p>{item.mil ? `${item.mil}ml · ` : ""}Số lượng: {item.quantity}</p>
                    <strong className="d-block mt-1">{formatVnd(item.lineTotal)}</strong>
                </div>
            </article>)}
        </div>
        <dl className="mb-0">
            <div className="d-flex justify-content-between gap-3 mb-2">
                <dt className="text-secondary fw-normal">Tạm tính ({order.items.reduce((sum, item) => sum + item.quantity, 0)} sản phẩm)</dt>
                <dd className="fw-medium text-nowrap mb-0">{formatVnd(order.subtotalPrice)}</dd>
            </div>
            <div className="d-flex justify-content-between gap-3 mb-3">
                <dt className="text-secondary fw-normal">Phí vận chuyển</dt>
                <dd className="fw-medium text-nowrap mb-0">{formatVnd(order.shippingFee)}</dd>
            </div>
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 border-top pt-3">
                <dt className="fw-semibold">Tổng thanh toán</dt>
                <dd className="fw-bold fs-4 text-primary mb-0">{formatVnd(order.totalPrice)}</dd>
            </div>
        </dl>
        <div className="border-top mt-3 pt-3">
            <p className="fw-medium text-break mb-1">{order.recipientName} · {order.phoneNumber}</p>
            <p className="small text-secondary text-break mb-2">{order.shippingAddress}</p>
            <p className="small text-secondary mb-0">{getPaymentMethodLabel(order.paymentMethod)}</p>
        </div>
    </aside>;
}
