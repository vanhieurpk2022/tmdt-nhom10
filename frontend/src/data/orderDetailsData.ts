import { isAxiosError } from "axios";
import type { CancelReason } from "../api/OrderService";
import type { RefundStatus } from "../enums/RefundStatus";

export const cancelReasonLabels: Record<CancelReason, string> = {
    CUSTOMER_CHANGED_MIND: "Thay đổi nhu cầu mua hàng",
    OUT_OF_STOCK: "Sản phẩm hết hàng",
    DELIVERY_TIME_CONFLICT: "Thời gian giao hàng không phù hợp",
    FACTORY_CONFIRM_LATE: "Cửa hàng xác nhận chậm",
};

export const refundStatusLabels: Record<RefundStatus, string> = {
    REQUESTED: "Chờ duyệt",
    APPROVED: "Đã duyệt, chờ gửi hoàn tiền",
    REJECTED: "Đã từ chối",
    PROCESSING: "Đang hoàn tiền",
    SUCCEEDED: "Hoàn tiền thành công",
    FAILED: "Hoàn tiền thất bại",
    NEEDS_REVIEW: "Cần đối soát",
};

export function getOrderError(error: unknown, fallback: string) {
    if (isAxiosError<{ message?: string }>(error)) {
        return error.response?.data?.message || fallback;
    }
    return fallback;
}
