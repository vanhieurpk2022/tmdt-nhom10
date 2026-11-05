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
            {cancelled && <dl className="mb-3">
                <dt>Lý do hủy</dt>
                <dd>{order.cancelReason ? cancelReasonLabels[order.cancelReason] : "Đơn hàng đã được hủy hoặc hết thời gian thanh toán."}</dd>
                {order.cancelledAt && <><dt>Thời gian hủy</dt><dd>{new Date(order.cancelledAt).toLocaleString("vi-VN")}</dd></>}
                {order.cancellationNote && <><dt>Ghi chú</dt><dd className="text-break">{order.cancellationNote}</dd></>}
            </dl>}
            {awaitingRefund && <p className="alert alert-warning">Cửa hàng đang xử lý yêu cầu hoàn tiền. Kết quả sẽ được cập nhật tại đây.</p>}
            {refunded && <p className="alert alert-success">Cửa hàng đã xác nhận hoàn tiền cho đơn hàng.</p>}
            {result?.error && <p className="alert alert-warning" role="alert">{result.error}</p>}
            {order.paymentMethod === "VNPAY" && !result && <p role="status">Đang tải thông tin hoàn tiền…</p>}
            {refunds.length > 0 && <div className="table-responsive">
                <table className="table align-middle mb-0">
                    <thead><tr><th>Yêu cầu</th><th>Số tiền</th><th>Trạng thái</th><th>Thời gian</th></tr></thead>
                    <tbody>{refunds.map(refund => <tr key={refund.id}>
                        <td>#{refund.id}<span className="d-block small text-secondary text-break">{refund.reason}</span></td>
                        <td className="text-nowrap">{refund.amountVnd.toLocaleString("vi-VN")} ₫</td>
                        <td><span className={`badge text-bg-${refund.status === "SUCCEEDED" ? "success" : ["FAILED", "REJECTED"].includes(refund.status) ? "danger" : "warning"}`}>{refundStatusLabels[refund.status]}</span></td>
                        <td>{new Date(refund.createdAt).toLocaleString("vi-VN")}
                            {refund.processedAt && <span className="d-block small text-secondary">Kết quả: {new Date(refund.processedAt).toLocaleString("vi-VN")}</span>}
                        </td>
                    </tr>)}</tbody>
                </table>
            </div>}
            {cancelled && !awaitingRefund && !refunded && !refunds.length && <p className="mb-0 text-secondary">
                {order.paymentMethod === "COD" ? "Đơn thanh toán khi nhận hàng đã hủy, không phát sinh hoàn tiền trực tuyến."
                    : "Chưa ghi nhận khoản thanh toán cần hoàn. Nếu đã bị trừ tiền, vui lòng cập nhật trạng thái hoặc liên hệ cửa hàng để được hỗ trợ."}
            </p>}
        </section>
    );
}
