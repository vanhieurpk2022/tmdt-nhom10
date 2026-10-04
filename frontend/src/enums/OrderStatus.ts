export const OrderStatus = {
  PENDING: 'PENDING',         // Chờ xác nhận
  CONFIRMED: 'CONFIRMED',     // Đã xác nhận
  PROCESSING: 'PROCESSING',   // Đang xử lý / đóng gói
  SHIPPED: 'SHIPPED',         // Đã giao cho đơn vị vận chuyển
  DELIVERING: 'DELIVERING',   // Đang giao
  DELIVERED: 'DELIVERED',     // Đã giao thành công
  CANCELLED: 'CANCELLED',     // Đã hủy
  RETURNED: 'RETURNED',       // Đã hoàn trả
  REFUNDED: 'REFUNDED',       // Đã hoàn tiền
} as const;

export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];