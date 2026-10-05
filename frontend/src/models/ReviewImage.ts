import type { Review } from "./Review";

export class ReviewImage {
  id?: number;
  imageUrl?: string;
  updatedAt?: string;

  constructor(init?: Partial<ReviewImage>) {
    Object.assign(this, init);
  }
}
