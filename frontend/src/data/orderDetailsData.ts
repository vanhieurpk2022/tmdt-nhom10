import { isAxiosError } from "axios";
import type { CancelReason, OrderResponse } from "../api/OrderService";
import type { RefundStatus } from "../enums/RefundStatus";

export const cancelReasonLabels: Record<CancelReason, string> = {
    CUSTOMER_CHANGED_MIND: "Thay đổi nhu cầu mua hàng",
    OUT_OF_STOCK: "Sản phẩm hết hàng",
    DELIVERY_TIME_CONFLICT: "Thời gian giao hàng không phù hợp",
    FACTORY_CONFIRM_LATE: "Cửa hàng xác nhận chậm",
    CHANGE_ITEMS: "Thay đổi sản phẩm hoặc số lượng",
    CHANGE_ADDRESS: "Thay đổi địa chỉ nhận hàng",
    CHANGE_PAYMENT_METHOD: "Thay đổi phương thức thanh toán",
    DUPLICATE_ORDER: "Đặt trùng đơn hàng",
    OTHER: "Lý do khác",
};

export const customerCancelReasons: CancelReason[] = [
    "CHANGE_ITEMS", "CHANGE_ADDRESS", "CHANGE_PAYMENT_METHOD", "DUPLICATE_ORDER", "CUSTOMER_CHANGED_MIND", "OTHER",
];

export function canCancelOrder(order: Pick<OrderResponse, "status" | "paymentStatus">) {
    return ["PENDING_PAYMENT", "PENDING", "CONFIRMED", "PROCESSING"].includes(order.status)
        && !["REFUND_PENDING", "REFUNDED"].includes(order.paymentStatus ?? "");
}

export const refundStatusLabels: Record<RefundStatus, string> = {
    REQUESTED: "Chờ duyệt",
    APPROVED: "Chờ xác nhận hoàn tiền",
    REJECTED: "Đã từ chối",
    PROCESSING: "Chờ xác nhận hoàn tiền",
    SUCCEEDED: "Hoàn tiền thành công",
    FAILED: "Hoàn tiền thất bại",
    NEEDS_REVIEW: "Chờ xác nhận hoàn tiền",
};

export function getOrderError(error: unknown, fallback: string) {
    if (isAxiosError<{ message?: string }>(error)) {
        return error.response?.data?.message || fallback;
    }
    return fallback;
}
