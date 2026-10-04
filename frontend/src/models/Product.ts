import type { ProductCustomItem } from './ProductCustomItem';
import type { Category } from './Category';
import type { Factory } from './Factory';
import type { ProductImage } from './ProductImage';
import type { WishList } from './WishList';
import type { Sales } from './Sales';
import type { ProductMil } from './ProductMil';
import type { Review } from './Review';
import type { ProductType } from '../enums/ProductType';

export class Product {
  id?: number;
  name?: string;
  description?: string;
  /** Cột DB là "min_price" nhưng field Java/JSON là "price" */
  price?: number;
  minBasePrice?: number;
  createdAt?: string;
  updatedAt?: string;
  productType?: ProductType;
  category?: Category;
  factory?: Factory;
  productImages?: ProductImage[];
  sale?: Sales;
  productMils?: ProductMil[];

  constructor(init?: Partial<Product>) {
    Object.assign(this, init);
  }
}
