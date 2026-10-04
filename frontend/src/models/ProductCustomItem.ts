import type { Product } from "./Product";

export class ProductCustomItem {
  id?: number;
  /** Giữ nguyên tên "volumeM1" như bên Java (có thể là typo của volumeMl) */
  volumeM1: number = 0;
  percentage: number = 0;
  product?: Product;

  constructor(init?: Partial<ProductCustomItem>) {
    Object.assign(this, init);
  }
}
