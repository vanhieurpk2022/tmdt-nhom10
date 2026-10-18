export class ProductImage {
  id?: number;
  imageUrl?: string;
  uploadedAt?: string;
  isThumbnail?: boolean;

  constructor(init?: Partial<ProductImage>) {
    Object.assign(this, init);
  }
}
