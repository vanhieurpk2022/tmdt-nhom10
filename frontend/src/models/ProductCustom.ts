import type { ProductCustomItem } from './ProductCustomItem';

export class ProductCustom {
  id?: number;
  bottleType?: string;
  labelDesign?: string;
  totalVolumeMl?: number;
  price: number = 0;
  createdAt?: string;
  updatedAt?: string;
  items?: ProductCustomItem[];

  constructor(init?: Partial<ProductCustom>) {
    Object.assign(this, init);
  }
}
