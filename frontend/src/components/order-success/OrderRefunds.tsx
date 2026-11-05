import { useEffect, useState } from "react";
import {
    faCircleCheck,
    faClock,
    faExclamationTriangle,
    faInfoCircle,
    faMoneyBillTransfer,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
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
        <section className="bg-white rounded-4 border shadow-sm p-4 mb-4" aria-labelledby="order-refunds-title">
            <div className="d-flex flex-wrap align-items-center justify-content-between pb-3 mb-3 border-bottom gap-2">
                <div className="d-flex align-items-center gap-2">
                    <div className="rounded-circle d-flex align-items-center justify-content-center bg-danger bg-opacity-10 text-danger" style={{ width: "36px", height: "36px" }}>
                        <FontAwesomeIcon icon={faMoneyBillTransfer} className="fs-7" />
                    </div>
                    <div>
                        <h2 id="order-refunds-title" className="fs-6 fw-bold text-dark mb-0">
                            {cancelled ? "Thông tin hủy đơn & hoàn tiền" : "Thông tin hoàn tiền"}
                        </h2>
                        <span className="text-muted fs-8">
                            {cancelled ? "Lý do hủy đơn và trạng thái đối soát hoàn tiền" : "Tiến độ xử lý hoàn tiền từ cửa hàng"}
                        </span>
                    </div>
                </div>

                {awaitingRefund && (
                    <span className="badge bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25 rounded-pill px-3 py-1 fs-8 fw-bold">
                        Đang chờ hoàn tiền
                    </span>
                )}
                {refunded && (
                    <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 rounded-pill px-3 py-1 fs-8 fw-bold">
                        Đã hoàn tiền
                    </span>
                )}
            </div>

            {/* Chi tiết thông tin hủy đơn */}
            {cancelled && (
                <div className="p-3 rounded-3 bg-light bg-opacity-75 border mb-3">
                    <div className="row g-2 fs-7">
                        <div className="col-12 col-md-5">
                            <span className="d-block fs-8 text-muted fw-bold text-uppercase mb-1">Lý do hủy đơn:</span>
                            <span className="fw-bold text-danger">
                                {order.cancelReason ? cancelReasonLabels[order.cancelReason] : "Đơn hàng đã được hủy hoặc hết thời gian thanh toán."}
                            </span>
                        </div>
                        {order.cancelledAt && (
                            <div className="col-12 col-md-4">
                                <span className="d-block fs-8 text-muted fw-bold text-uppercase mb-1">Thời gian hủy:</span>
                                <span className="text-dark fw-medium">
                                    {new Date(order.cancelledAt).toLocaleString("vi-VN")}
                                </span>
                            </div>
                        )}
                        {order.cancellationNote && (
                            <div className="col-12 col-md-3">
                                <span className="d-block fs-8 text-muted fw-bold text-uppercase mb-1">Ghi chú hủy:</span>
                                <span className="text-muted text-break">
                                    {order.cancellationNote}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Thông báo tiến độ hoàn tiền */}
            {awaitingRefund && (
                <div className="p-3 rounded-3 bg-warning bg-opacity-10 border border-warning border-opacity-25 d-flex align-items-center gap-3 mb-3 text-warning-emphasis">
                    <FontAwesomeIcon icon={faClock} className="text-warning fs-5 flex-shrink-0" />
                    <p className="fs-7 mb-0">
                        Cửa hàng đang xử lý yêu cầu hoàn tiền của bạn. Khoản tiền sẽ được chuyển về tài khoản thanh toán ban đầu theo thời gian quy định của cổng thanh toán / ngân hàng.
                    </p>
                </div>
            )}

            {refunded && (
                <div className="p-3 rounded-3 bg-success bg-opacity-10 border border-success border-opacity-25 d-flex align-items-center gap-3 mb-3 text-success">
                    <FontAwesomeIcon icon={faCircleCheck} className="fs-5 flex-shrink-0" />
                    <p className="fs-7 mb-0">
                        Cửa hàng đã xác nhận hoàn tiền thành công cho đơn hàng này.
                    </p>
                </div>
            )}

            {result?.error && (
                <div className="p-3 rounded-3 bg-danger bg-opacity-10 border border-danger border-opacity-25 d-flex align-items-center gap-3 mb-3 text-danger" role="alert">
                    <FontAwesomeIcon icon={faExclamationTriangle} className="fs-5 flex-shrink-0" />
                    <p className="fs-7 mb-0">{result.error}</p>
                </div>
            )}

            {order.paymentMethod === "VNPAY" && !result && (
                <div className="text-center py-3 text-muted fs-7">
                    <span className="spinner-border spinner-border-sm me-2" role="status" />
                    Đang tải thông tin hoàn tiền…
                </div>
            )}

            {/* Bảng danh sách yêu cầu hoàn tiền */}
            {refunds.length > 0 && (
                <div className="table-responsive rounded-3 border mb-3">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="table-light">
                            <tr className="fs-8 text-muted text-uppercase">
                                <th className="ps-3 py-2">Mã yêu cầu</th>
                                <th className="py-2">Số tiền hoàn</th>
                                <th className="py-2">Trạng thái</th>
                                <th className="pe-3 py-2">Thời gian</th>
                            </tr>
                        </thead>
                        <tbody className="fs-7">
                            {refunds.map(refund => (
                                <tr key={refund.id}>
                                    <td className="ps-3">
                                        <strong className="text-dark">#{refund.id}</strong>
                                        <span className="d-block fs-8 text-muted text-break">{refund.reason}</span>
                                    </td>
                                    <td className="text-nowrap fw-bold text-danger">
                                        {refund.amountVnd.toLocaleString("vi-VN")} ₫
                                    </td>
                                    <td>
                                        <span className={`badge rounded-pill px-2 py-1 fs-8 fw-bold ${
                                            refund.status === "SUCCEEDED"
                                                ? "bg-success bg-opacity-10 text-success border border-success border-opacity-25"
                                                : ["FAILED", "REJECTED"].includes(refund.status)
                                                ? "bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25"
                                                : "bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25"
                                        }`}>
                                            {refundStatusLabels[refund.status]}
                                        </span>
                                    </td>
                                    <td className="pe-3">
                                        <span className="text-dark">{new Date(refund.createdAt).toLocaleString("vi-VN")}</span>
                                        {refund.processedAt && (
                                            <span className="d-block fs-8 text-muted">
                                                Xử lý: {new Date(refund.processedAt).toLocaleString("vi-VN")}
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {cancelled && !awaitingRefund && !refunded && !refunds.length && (
                <div className="d-flex align-items-center gap-2 text-muted fs-8">
                    <FontAwesomeIcon icon={faInfoCircle} />
                    <span>
                        {order.paymentMethod === "COD"
                            ? "Đơn thanh toán khi nhận hàng (COD) đã hủy, không phát sinh giao dịch hoàn tiền trực tuyến."
                            : "Chưa ghi nhận khoản thanh toán cần hoàn. Nếu bạn đã thanh toán, vui lòng cập nhật trạng thái hoặc liên hệ hỗ trợ."}
                    </span>
                </div>
            )}
        </section>
    );
}
