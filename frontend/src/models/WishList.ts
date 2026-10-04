import type { Product } from "./Product";

export class WishList {
  id?: number;
  updateAt?: string;
  product?: Product;

  constructor(init?: Partial<WishList>) {
    Object.assign(this, init);
  }
}
