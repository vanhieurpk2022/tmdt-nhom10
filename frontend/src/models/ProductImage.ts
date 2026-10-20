export class ProductImage {
  id?: number;
  imageUrl?: string;
  uploadedAt?: string;
  thumbnail?: boolean;

  constructor(init?: Partial<ProductImage>) {
    Object.assign(this, init);
  }
}
