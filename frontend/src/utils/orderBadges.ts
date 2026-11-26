import { OrderStatus } from "../enums/OrderStatus";
import { ProductType } from "../enums/ProductType";

export const OrderStatusBadge: Record<OrderStatus, { label: string; badge: string }> = {
    [OrderStatus.PENDING_PAYMENT]: {
        label: "Chờ thanh toán",
        badge: "bg-warning-subtle text-warning-emphasis",
    },
    [OrderStatus.PENDING]: {
        label: "Chờ xác nhận",
        badge: "bg-warning-subtle text-warning-emphasis",
    },
    [OrderStatus.CONFIRMED]: {
        label: "Đã xác nhận",
        badge: "bg-primary-subtle text-primary-emphasis",
    },
    [OrderStatus.PROCESSING]: {
        label: "Đang đóng gói",
        badge: "bg-info-subtle text-info-emphasis",
    },
    [OrderStatus.DELIVERING]: {
        label: "Đang giao hàng",
        badge: "bg-primary-subtle text-primary-emphasis",
    },
    [OrderStatus.SHIPPED]: {
        label: "Đã gửi hàng",
        badge: "bg-info-subtle text-info-emphasis",
    },
    [OrderStatus.DELIVERED]: {
        label: "Đã giao thành công",
        badge: "bg-success-subtle text-success-emphasis",
    },
    [OrderStatus.CANCELLED]: {
        label: "Đã hủy đơn",
        badge: "bg-danger-subtle text-danger-emphasis",
    },
    [OrderStatus.RETURNED]: {
        label: "Đã trả hàng",
        badge: "bg-secondary-subtle text-secondary-emphasis",
    },
    [OrderStatus.REFUNDED]: {
        label: "Đã hoàn tiền",
        badge: "bg-dark-subtle text-dark-emphasis",
    },
};

export const ProductTypeBadge: Record<ProductType, { label: string; badge: string }> = {
    [ProductType.CUSTOM]: {
        label: "Phối hương",
        badge: "bg-purple-subtle text-purple-emphasis",
    },
    [ProductType.NORMAL]: {
        label: "Tiêu chuẩn",
        badge: "bg-primary-subtle text-primary-emphasis",
    },
};
