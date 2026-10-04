
export class ProductMil {
  id?: number;
  mil: number = 0;
  basePrice?: number;
  price?: number;
  stockQuantity: number = 0;
  /**
   * Java: `boolean isActive` + Lombok => getter isActive(),
   * Jackson serialize thành "active" (không phải "isActive").
   */
  active: boolean = true;

  constructor(init?: Partial<ProductMil>) {
    Object.assign(this, init);
  }
}
