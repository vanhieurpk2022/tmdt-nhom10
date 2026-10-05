export class ProductImage {
  id?: number;
  imageUrl?: string;
  uploadedAt?: string;

  constructor(init?: Partial<ProductImage>) {
    Object.assign(this, init);
  }
}
