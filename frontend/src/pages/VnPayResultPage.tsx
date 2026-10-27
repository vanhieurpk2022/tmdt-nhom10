import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faArrowRight, faArrowRotateRight, faBagShopping, faCheck, faChevronRight,
    faCircleExclamation, faClock, faCreditCard, faReceipt,
} from "@fortawesome/free-solid-svg-icons";
import { orderService, formatOrderCode, type OrderResponse, type PaymentStatusResponse } from "../api/OrderService";
import { useCart } from "../api/CartContext";
import { ROUTES } from "../routes/routes";

const resultViews = {
    invalid: {
        title: "Không thể xác minh thanh toán",
        label: "Chưa thể xác minh",
        description: "Đường dẫn thanh toán không hợp lệ. Vui lòng kiểm tra giao dịch trong lịch sử đơn hàng.",
        tone: "danger",
        icon: faCircleExclamation,
    },
    review: {
        title: "Giao dịch cần được đối soát",
        label: "Cần đối soát",
        description: "Oilia đang kiểm tra giao dịch với VNPay. Nếu đã bị trừ tiền, vui lòng giữ mã giao dịch và liên hệ cửa hàng. Trạng thái này chưa xác nhận hoàn tiền.",
        tone: "warning",
        icon: faCircleExclamation,
    },
    expired: {
        title: "Đơn hàng đã hủy hoặc hết hạn",
        label: "Đã hủy / hết hạn",
        description: "Đơn hàng không còn tiếp nhận thanh toán. Nếu đã bị trừ tiền, cửa hàng sẽ đối soát khoản thanh toán của bạn.",
        tone: "danger",
        icon: faCircleExclamation,
    },
    refunded: {
        title: "Giao dịch đã hoàn tiền",
        label: "Đã hoàn tiền",
        description: "Khoản thanh toán đã được ghi nhận hoàn tiền. Bạn có thể kiểm tra chi tiết trong lịch sử đơn hàng.",
        tone: "success",
        icon: faCheck,
    },
    failed: {
        title: "Thanh toán chưa thành công",
        label: "Chưa thành công",
        description: "Giao dịch chưa hoàn tất. Bạn có thể thanh toán lại khi đơn hàng vẫn còn thời gian giữ hàng.",
        tone: "danger",
        icon: faCircleExclamation,
    },
    pending: {
        title: "Đang xác nhận thanh toán",
        label: "Chờ xác nhận",
        description: "Vui lòng chờ trong khi Oilia kiểm tra kết quả từ VNPay. Nếu đã bị trừ tiền, hãy chờ xác nhận trước khi thử lại.",
        tone: "primary",
        icon: faClock,
    },
};

export default function VnPayResultPage() {
    const [params] = useSearchParams();
    return <PaymentResult key={params.toString()} params={params} />;
}

function PaymentResult({ params }: { params: URLSearchParams }) {
    const navigate = useNavigate();
    const ref = params.get("ref");
    const orderId = Number(params.get("orderId"));
    const hasReference = Boolean(ref) || (Number.isSafeInteger(orderId) && orderId > 0);
    const invalid = params.has("invalid");
    const [status, setStatus] = useState<PaymentStatusResponse | null>(null);
    const [order, setOrder] = useState<OrderResponse | null>(null);
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);
    const [checking, setChecking] = useState(false);
    const [pollingEnded, setPollingEnded] = useState(false);
    const retrying = useRef(false);
    const requestState = useRef({ version: 0, loadedOrderId: 0 });
    const { refreshCart } = useCart();

    const load = useCallback(async () => {
        if (!hasReference || invalid) return;
        const version = ++requestState.current.version;
        const result = ref ? await orderService.vnpayStatus(ref) : await orderService.paymentStatus(orderId);
        if (version !== requestState.current.version) return;
        if (result.paymentStatus === "PAID") {
            navigate(`${ROUTES.ORDER_SUCCESS}?orderId=${result.orderId}`, { replace: true });
            return result;
        }
        setStatus(result);
        if (requestState.current.loadedOrderId !== result.orderId) {
            const details = await orderService.getOrder(result.orderId);
            if (version !== requestState.current.version) return;
            requestState.current.loadedOrderId = details.id;
            setOrder(details);
        }
        setError("");
        return result;
    }, [ref, orderId, hasReference, invalid, navigate]);

    useEffect(() => {
        let active = true;
        const requests = requestState.current;
        let timer: ReturnType<typeof setTimeout>;
        const deadline = Date.now() + 180_000;
        async function poll() {
            if (!active || !hasReference || invalid) return;
            try {
                const result = await load();
                if (!active) return;
                if (result && (["PAID", "FAILED", "REFUND_PENDING", "REFUNDED"].includes(result.paymentStatus)
                    || ["CANCELLED", "RETURNED", "REFUNDED"].includes(result.orderStatus))) {
                    return;
                }
            } catch {
                if (active) setError("Kết nối xác nhận đang gián đoạn. Hệ thống sẽ tự kiểm tra lại, bạn chưa cần thanh toán lại.");
            }
            if (!active) return;
            if (Date.now() < deadline) timer = setTimeout(() => { void poll(); }, 3000);
            else setPollingEnded(true);
        }
        void poll();
        void refreshCart().catch(() => undefined);
        return () => { active = false; requests.version++; clearTimeout(timer); };
    }, [load, hasReference, invalid, refreshCart]);

    async function retry() {
        if (!status || retrying.current) return;
        retrying.current = true;
        setBusy(true);
        try {
            const keyName = `oilia_vnpay_retry_${status.orderId}`;
            const key = sessionStorage.getItem(keyName) || crypto.randomUUID();
            sessionStorage.setItem(keyName, key);
            const payment = await orderService.retryVnpay(status.orderId, key);
            sessionStorage.removeItem(keyName);
            if (payment.paymentUrl) window.location.assign(payment.paymentUrl);
            else await load();
        } catch (cause) {
            const failure = cause as { response?: { data?: { message?: string } } };
            setError(failure.response?.data?.message || "Chưa thể thanh toán lại. Vui lòng thử lại sau.");
        } finally { setBusy(false); retrying.current = false; }
    }

    const review = status?.needsReview;
    const failed = status?.attemptStatus === "FAILED";
    const cancelled = status && ["CANCELLED", "RETURNED", "REFUNDED"].includes(status.orderStatus);
    const invalidLink = invalid || !hasReference;
    const resultState = invalidLink ? "invalid" : status?.paymentStatus === "REFUNDED" ? "refunded" : review ? "review"
        : cancelled ? "expired" : failed ? "failed" : "pending";
    const view = resultViews[resultState];
    const description = resultState === "pending" && pollingEnded
        ? "Chưa nhận được xác nhận cuối cùng. Bạn có thể kiểm tra lại sau. Nếu đã bị trừ tiền, hãy giữ mã giao dịch và liên hệ cửa hàng."
        : view.description;

    async function checkAgain() {
        if (checking) return;
        setChecking(true);
        try { await load(); }
        catch { setError("Chưa tải được trạng thái, vui lòng thử lại."); }
        finally { setChecking(false); }
    }

    return (
        <main className="order-success-page">
            <div className="container-fluid px-4 px-lg-5">
                <div className="order-success-content">
                    <nav className="order-success-breadcrumb d-flex flex-wrap align-items-center gap-2 mb-4" aria-label="Đường dẫn trang">
                        <Link to={ROUTES.HOME}>Trang chủ</Link>
                        <FontAwesomeIcon icon={faChevronRight} aria-hidden="true" />
                        <Link to={ROUTES.ORDERS}>Đơn hàng</Link>
                        <FontAwesomeIcon icon={faChevronRight} aria-hidden="true" />
                        <span aria-current="page">Kết quả thanh toán</span>
                    </nav>

                    <section className="order-success-card" aria-labelledby="vnpay-result-title">
                        <header className="text-center d-flex flex-column align-items-center mb-4" aria-live="polite">
                            <div className={`d-inline-flex align-items-center justify-content-center rounded-circle p-3 fs-2 mb-3 text-${view.tone} bg-${view.tone}-subtle`} aria-hidden="true">
                                <FontAwesomeIcon icon={view.icon} />
                            </div>
                            <span className={`badge rounded-pill px-3 py-2 mb-3 text-${view.tone}-emphasis bg-${view.tone}-subtle`}>{view.label}</span>
                            <h1 className="h2 fw-bold mb-3" id="vnpay-result-title">{view.title}</h1>
                            <p className="text-secondary mb-0">{description}</p>
                        </header>

                        {error && <div className="alert alert-warning d-flex align-items-center gap-2" role="alert">
                            <FontAwesomeIcon className="flex-shrink-0" icon={faCircleExclamation} aria-hidden="true" />
                            <span>{error}</span>
                        </div>}

                        {!invalidLink && <section className="border rounded-3 overflow-hidden mb-4" aria-labelledby="vnpay-receipt-title">
                            <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 p-3 border-bottom bg-body-tertiary">
                                <h2 className="h6 fw-bold mb-0" id="vnpay-receipt-title"><FontAwesomeIcon icon={faReceipt} aria-hidden="true" /> Thông tin giao dịch</h2>
                                <span className="small text-secondary"><FontAwesomeIcon icon={faCreditCard} aria-hidden="true" /> VNPay</span>
                            </div>
                            <div className="row g-0">
                                <dl className="col-12 col-md-7 p-3 p-lg-4 mb-0">
                                    <div className="mb-3">
                                        <dt className="small text-secondary fw-normal mb-1">Mã đơn hàng</dt>
                                        <dd className="fw-bold mb-0">{order ? formatOrderCode(order.id) : "Đang tải…"}</dd>
                                    </div>
                                    <div className="mb-3">
                                        <dt className="small text-secondary fw-normal mb-1">Người nhận</dt>
                                        <dd className="fw-bold text-break mb-0">{order?.recipientName || "Đang tải…"}</dd>
                                    </div>
                                    <div>
                                        <dt className="small text-secondary fw-normal mb-1">Mã giao dịch</dt>
                                        <dd className="text-break mb-0"><code className="text-secondary">{ref || status?.txnRef || "Đang tải…"}</code></dd>
                                    </div>
                                </dl>
                                <div className={`col-12 col-md-5 d-flex flex-column justify-content-center align-items-center gap-2 p-4 bg-${view.tone}-subtle`}>
                                    <span className="text-secondary">Tổng thanh toán</span>
                                    <strong className="fs-2 text-center text-break">{order ? <>{order.totalPrice.toLocaleString("vi-VN")} <small>₫</small></> : "Đang tải…"}</strong>
                                    <span className={`badge rounded-pill px-3 py-2 text-${view.tone}-emphasis bg-body`}><FontAwesomeIcon icon={view.icon} aria-hidden="true" /> {view.label}</span>
                                </div>
                            </div>
                        </section>}

                        <div className="order-success-actions d-grid gap-2 mx-auto">
                            {!invalidLink && status?.canRetry && <button className="btn order-success-primary-btn d-flex align-items-center justify-content-center gap-2" disabled={busy} onClick={() => { void retry(); }}>
                                {busy ? "Đang xử lý…" : status.attemptStatus === "INITIATED" ? "Tiếp tục thanh toán" : "Thanh toán lại"}
                                <FontAwesomeIcon icon={faArrowRight} aria-hidden="true" />
                            </button>}
                            {invalidLink || status?.paymentStatus === "REFUNDED" ? <Link className="btn order-success-secondary-btn d-flex align-items-center justify-content-center gap-2" to={ROUTES.PRODUCTS}>
                                <FontAwesomeIcon icon={faBagShopping} aria-hidden="true" /> Tiếp tục mua sắm
                            </Link> : <button className="btn order-success-secondary-btn d-flex align-items-center justify-content-center gap-2" disabled={checking || busy} onClick={() => { void checkAgain(); }}>
                                <FontAwesomeIcon icon={faArrowRotateRight} spin={checking} aria-hidden="true" /> {checking ? "Đang kiểm tra…" : "Kiểm tra lại"}
                            </button>}
                        </div>
                        <Link className="d-flex align-items-center justify-content-center gap-2 mt-3 text-secondary text-decoration-none" to={ROUTES.ORDERS}>Xem lịch sử đơn hàng <FontAwesomeIcon icon={faChevronRight} aria-hidden="true" /></Link>
                        {status && <Link className="d-block text-center mt-3" to={ROUTES.ORDER_DETAIL.replace(":id", String(status.orderId))}>Xem chi tiết đơn hàng</Link>}
                    </section>
                </div>
            </div>
        </main>
    );
}
