import type { Product } from './Product';

export class CartItem {
  id?: number;
  quantity: number = 0;
  product?: Product;

  constructor(init?: Partial<CartItem>) {
    Object.assign(this, init);
  }
}
