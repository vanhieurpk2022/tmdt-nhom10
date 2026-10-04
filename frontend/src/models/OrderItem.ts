import type { Product } from './Product';

export class OrderItem {
  id?: number;
  quantity: number = 0;
  unitPrice: number = 0;
  product?: Product;

  constructor(init?: Partial<OrderItem>) {
    Object.assign(this, init);
  }
}
