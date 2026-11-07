import { useEffect, useState } from "react";
import { orderService, type OrderResponse } from "../../api/OrderService";
import type { CustomerRefund } from "../../api/RefundService";
import { cancelReasonLabels, refundStatusLabels } from "../../data/orderDetailsData";

export default function OrderRefunds({ order }: { order: OrderResponse }) {
    const [result, setResult] = useState<{ refunds: CustomerRefund[]; error: string } | null>(null);

    useEffect(() => {
        let active = true;
        if (order.paymentMethod !== "VNPAY") return;
        orderService.getRefunds(order.id)
            .then(refunds => { if (active) setResult({ refunds, error: "" }); })
            .catch(() => { if (active) setResult({ refunds: [], error: "Chưa tải được thông tin hoàn tiền. Vui lòng cập nhật lại trạng thái." }); });
        return () => { active = false; };
    }, [order.id, order.status, order.paymentMethod, order.paymentStatus]);

    const cancelled = order.status === "CANCELLED";
    const refunds = result?.refunds ?? [];
    const awaitingRefund = order.paymentStatus === "REFUND_PENDING";
    const refunded = order.paymentStatus === "REFUNDED";
    if (!cancelled && !awaitingRefund && !refunded && !refunds.length && !result?.error) return null;

    return (
        <section className="order-success-card" aria-labelledby="order-refunds-title">
            <div className="order-success-section-heading">
                <h2 id="order-refunds-title">{cancelled ? "Thông tin hủy đơn và hoàn tiền" : "Thông tin hoàn tiền"}</h2>
            </div>
            {cancelled && <dl className="order-refund-meta">
                <div>
                    <dt>Lý do hủy</dt>
                    <dd>{order.cancelReason ? cancelReasonLabels[order.cancelReason] : "Đơn hàng đã được hủy hoặc hết thời gian thanh toán."}</dd>
                </div>
                {order.cancelledAt && <div><dt>Thời gian hủy</dt><dd>{new Date(order.cancelledAt).toLocaleString("vi-VN")}</dd></div>}
                {order.cancellationNote && <div><dt>Ghi chú</dt><dd className="text-break">{order.cancellationNote}</dd></div>}
            </dl>}
            {awaitingRefund && <p className="alert alert-warning">Cửa hàng đang xử lý yêu cầu hoàn tiền. Kết quả sẽ được cập nhật tại đây.</p>}
            {refunded && <p className="alert alert-success">Cửa hàng đã xác nhận hoàn tiền cho đơn hàng.</p>}
            {result?.error && <p className="alert alert-warning" role="alert">{result.error}</p>}
            {order.paymentMethod === "VNPAY" && !result && <p role="status">Đang tải thông tin hoàn tiền…</p>}
            {refunds.length > 0 && <div className="d-grid gap-3">
                {refunds.map(refund => <article className="order-refund-item border rounded-3 p-3" key={refund.id}>
                    <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
                        <strong className="fw-semibold">Yêu cầu #{refund.id}</strong>
                        <span className={`badge rounded-pill text-bg-${refund.status === "SUCCEEDED" ? "success" : ["FAILED", "REJECTED"].includes(refund.status) ? "danger" : "warning"}`}>{refundStatusLabels[refund.status]}</span>
                    </div>
                    <p className="small text-secondary text-break my-2">{refund.reason}</p>
                    <div className="d-flex flex-wrap justify-content-between gap-2">
                        <strong className="text-nowrap fw-semibold">{refund.amountVnd.toLocaleString("vi-VN")} ₫</strong>
                        <div className="small text-secondary">
                            <span className="d-block">Ngày tạo: {new Date(refund.createdAt).toLocaleString("vi-VN")}</span>
                            {refund.processedAt && <span className="d-block">Kết quả: {new Date(refund.processedAt).toLocaleString("vi-VN")}</span>}
                        </div>
                    </div>
                </article>)}
            </div>}
            {cancelled && !awaitingRefund && !refunded && !refunds.length && <p className="mb-0 text-secondary">
                {order.paymentMethod === "COD" ? "Đơn thanh toán khi nhận hàng đã hủy, không phát sinh hoàn tiền trực tuyến."
                    : "Chưa ghi nhận khoản thanh toán cần hoàn. Nếu đã bị trừ tiền, vui lòng cập nhật trạng thái hoặc liên hệ cửa hàng để được hỗ trợ."}
            </p>}
        </section>
    );
}
