export const VoucherStatus = {
  ACTIVE: 'ACTIVE',         // Đang hoạt động
  INACTIVE: 'INACTIVE',     // Tạm ngưng
  EXPIRED: 'EXPIRED',       // Đã hết hạn
  EXHAUSTED: 'EXHAUSTED',   // Đã sử dụng hết lượt
} as const;

export type VoucherStatus = (typeof VoucherStatus)[keyof typeof VoucherStatus];