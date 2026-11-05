import { useEffect, useState } from "react";
import {
    faBan,
    faCircleCheck,
    faClock,
    faExclamationTriangle,
    faInfoCircle,
    faRotateLeft,
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
            {/* Header thẻ */}
            <div className="d-flex flex-wrap align-items-center justify-content-between pb-3 mb-3 border-bottom gap-2">
                <div>
                    <h2 id="order-refunds-title" className="h6 fw-bold text-dark mb-0.5">
                        {cancelled ? "Thông tin hủy đơn & Hoàn tiền" : "Thông tin hoàn tiền"}
                    </h2>
                    <span className="text-muted" style={{ fontSize: "12.5px" }}>
                        {cancelled ? "Chi tiết lý do và tiến trình xử lý giao dịch" : "Tiến độ hoàn tiền từ cửa hàng"}
                    </span>
                </div>

                {awaitingRefund && (
                    <span className="badge bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25 rounded-pill px-3 py-1.5 fw-semibold" style={{ fontSize: "12.5px" }}>
                        <FontAwesomeIcon icon={faClock} className="me-1.5" />
                        Đang chờ hoàn tiền
                    </span>
                )}
                {refunded && (
                    <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 rounded-pill px-3 py-1.5 fw-semibold" style={{ fontSize: "12.5px" }}>
                        <FontAwesomeIcon icon={faCircleCheck} className="me-1.5" />
                        Đã hoàn tiền
                    </span>
                )}
            </div>

            {/* Chi tiết thông tin hủy đơn - bố cục thoáng đãng */}
            {cancelled && (
                <div className="mb-4">
                    <div className="row g-3 align-items-center">
                        <div className="col-12 col-md-6">
                            <span className="d-block text-muted fw-semibold text-uppercase mb-1.5" style={{ fontSize: "11px", letterSpacing: "0.5px" }}>
                                Lý do hủy đơn:
                            </span>
                            <span className="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 rounded-pill px-3 py-1.5 fw-semibold" style={{ fontSize: "13px" }}>
                                {order.cancelReason ? cancelReasonLabels[order.cancelReason] : "Đơn hàng đã được hủy hoặc hết hạn thanh toán."}
                            </span>
                        </div>
                        {order.cancelledAt && (
                            <div className="col-12 col-md-6">
                                <span className="d-block text-muted fw-semibold text-uppercase mb-1.5" style={{ fontSize: "11px", letterSpacing: "0.5px" }}>
                                    Thời gian hủy đơn:
                                </span>
                                <span className="text-dark fw-semibold" style={{ fontSize: "13.5px" }}>
                                    {new Date(order.cancelledAt).toLocaleString("vi-VN")}
                                </span>
                            </div>
                        )}
                        {order.cancellationNote && (
                            <div className="col-12 pt-2">
                                <span className="text-muted fw-semibold text-uppercase me-2" style={{ fontSize: "11px" }}>Ghi chú:</span>
                                <span className="text-secondary text-break" style={{ fontSize: "13px" }}>{order.cancellationNote}</span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Thông báo tiến độ hoàn tiền */}
            {awaitingRefund && (
                <div className="p-3.5 rounded-3 bg-warning bg-opacity-10 border border-warning border-opacity-25 d-flex align-items-center gap-3 mb-4 text-warning-emphasis">
                    <FontAwesomeIcon icon={faClock} className="text-warning fs-5 flex-shrink-0" />
                    <p className="mb-0" style={{ fontSize: "13.5px", lineHeight: "1.5" }}>
                        Cửa hàng đang xử lý yêu cầu hoàn tiền cho đơn hàng này. Tiền sẽ được hoàn về tài khoản thanh toán ban đầu theo thời gian quy định của cổng thanh toán / ngân hàng.
                    </p>
                </div>
            )}

            {refunded && (
                <div className="p-3.5 rounded-3 bg-success bg-opacity-10 border border-success border-opacity-25 d-flex align-items-center gap-3 mb-4 text-success">
                    <FontAwesomeIcon icon={faCircleCheck} className="fs-5 flex-shrink-0" />
                    <p className="mb-0" style={{ fontSize: "13.5px", lineHeight: "1.5" }}>
                        Cửa hàng đã xác nhận hoàn tiền thành công cho đơn hàng này.
                    </p>
                </div>
            )}

            {result?.error && (
                <div className="p-3.5 rounded-3 bg-danger bg-opacity-10 border border-danger border-opacity-25 d-flex align-items-center gap-3 mb-4 text-danger" role="alert">
                    <FontAwesomeIcon icon={faExclamationTriangle} className="fs-5 flex-shrink-0" />
                    <p className="mb-0" style={{ fontSize: "13.5px" }}>{result.error}</p>
                </div>
            )}

            {order.paymentMethod === "VNPAY" && !result && (
                <div className="text-center py-4 text-muted" style={{ fontSize: "13px" }}>
                    <span className="spinner-border spinner-border-sm me-2" role="status" />
                    Đang tải thông tin hoàn tiền…
                </div>
            )}

            {/* Bảng danh sách yêu cầu hoàn tiền */}
            {refunds.length > 0 && (
                <div className="table-responsive rounded-3 border">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="table-light">
                            <tr style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }} className="text-muted">
                                <th className="ps-3 py-3">Mã yêu cầu</th>
                                <th className="py-3">Số tiền hoàn</th>
                                <th className="py-3">Trạng thái</th>
                                <th className="pe-3 py-3">Thời gian</th>
                            </tr>
                        </thead>
                        <tbody style={{ fontSize: "13.5px" }}>
                            {refunds.map(refund => (
                                <tr key={refund.id}>
                                    <td className="ps-3 py-3">
                                        <strong className="text-dark">#{refund.id}</strong>
                                        <span className="d-block text-muted text-break mt-0.5" style={{ fontSize: "12.5px" }}>{refund.reason}</span>
                                    </td>
                                    <td className="text-nowrap fw-bold text-danger py-3">
                                        {refund.amountVnd.toLocaleString("vi-VN")}₫
                                    </td>
                                    <td className="py-3">
                                        <span className={`badge rounded-pill px-3 py-1.5 fw-semibold ${
                                            refund.status === "SUCCEEDED"
                                                ? "bg-success bg-opacity-10 text-success border border-success border-opacity-25"
                                                : ["FAILED", "REJECTED"].includes(refund.status)
                                                ? "bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25"
                                                : "bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25"
                                        }`} style={{ fontSize: "12px" }}>
                                            {refundStatusLabels[refund.status]}
                                        </span>
                                    </td>
                                    <td className="pe-3 py-3">
                                        <span className="text-dark">{new Date(refund.createdAt).toLocaleString("vi-VN")}</span>
                                        {refund.processedAt && (
                                            <span className="d-block text-muted mt-0.5" style={{ fontSize: "12px" }}>
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
                <div className="d-flex align-items-center gap-2 text-muted mt-3" style={{ fontSize: "13px" }}>
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
