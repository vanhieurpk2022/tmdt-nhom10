import type { VoucherStatus } from "../enums/VoucherStatus";

export class Voucher {
  id?: number;
  code?: string;
  discountType?: string;
  discountValue?: number;
  maxDiscountAmount?: number;
  minOrderValue?: number;
  usageLimit: number = 0;
  usedCount: number = 0;
  startDate?: string;
  endDate?: string;
  status?: VoucherStatus;

  constructor(init?: Partial<Voucher>) {
    Object.assign(this, init);
  }
}
