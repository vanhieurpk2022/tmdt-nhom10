export const SaleStatus = {
  UPCOMING: 'UPCOMING',     // Chưa bắt đầu
  ACTIVE: 'ACTIVE',         // Đang diễn ra
  ENDED: 'ENDED',           // Đã kết thúc theo thời gian
  CANCELLED: 'CANCELLED',   // Bị hủy trước khi kết thúc
} as const;

export type SaleStatus = (typeof SaleStatus)[keyof typeof SaleStatus];