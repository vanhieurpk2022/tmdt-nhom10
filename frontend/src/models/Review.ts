import type { ReviewImage } from './ReviewImage';

export class Review {
  id?: number;
  rating: number = 0;
  comment?: string;
  createdAt?: string;
  updatedAt?: string;
  reviewImageList?: ReviewImage[];

  constructor(init?: Partial<Review>) {
    Object.assign(this, init);
  }
}
