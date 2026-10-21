export const VoucherStatusUser = {
  ACTIVE: 'ACTIVE',         // Đang hoạt động
  INACTIVE: 'INACTIVE',     // Tạm ngưng
  EXPIRED: 'EXPIRED',       // Đã hết hạn
  EXHAUSTED: 'EXHAUSTED',   // Đã sử dụng hết lượt
} as const;

export type VoucherStatusUser = (typeof VoucherStatusUser)[keyof typeof VoucherStatusUser];