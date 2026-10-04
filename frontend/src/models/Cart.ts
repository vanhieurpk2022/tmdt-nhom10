import type { CartItem } from './CartItem';

export class Cart {
  id?: number;
  cartItem?: CartItem[];

  constructor(init?: Partial<Cart>) {
    Object.assign(this, init);
  }
}
