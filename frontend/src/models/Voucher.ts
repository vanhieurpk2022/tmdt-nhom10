import type { DiscountTypeAdmin } from "../enums/DiscountTypeAdmin";
import type { VourcherStatusAdmin } from "../enums/VourcherStatusAdmin";

// types/voucher.ts

/** Dữ liệu backend trả về */
export interface Voucher {
  id: number;
  code: string;
  discountType: DiscountTypeAdmin;
  discountValue: number;
  maxDiscountAmount: number | null;
  minOrderValue: number;
  usageLimit: number;
  usedCount: number;
  startDate: string; // ISO
  endDate: string;   // ISO
  status: VourcherStatusAdmin;
}

export type VoucherCreateRequest = Omit<Voucher, "id" | "usedCount" | "status">;
export type VoucherUpdateRequest = Partial<VoucherCreateRequest>;