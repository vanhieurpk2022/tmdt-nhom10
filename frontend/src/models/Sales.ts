import type { SaleStatus } from "../enums/SaleStatus";

export class Sales {
  id?: number;
  name?: string;
  description?: string;
  discountRate: number = 0;
  startDate?: string;
  endDate?: string;
  status?: SaleStatus;
  /** Java đặt tên là "product" (List<Product>) */

  constructor(init?: Partial<Sales>) {
    Object.assign(this, init);
  }
}
