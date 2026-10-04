
export class Category {
  id?: number;
  name?: string;
  createdAt?: string;
  updatedAt?: string;

  constructor(init?: Partial<Category>) {
    Object.assign(this, init);
  }
}
