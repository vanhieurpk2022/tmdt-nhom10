import type { FactoryStatus } from '../enums/FactoryStatus';
import type { FactoryImage } from './FactoryImage';

export class Factory {
  id?: number;
  name?: string;
  address?: string;
  description?: string;
  factoryStatus?: FactoryStatus;
  createdAt?: string;
  updatedAt?: string;
  /** Java field tên "User" (List<User>) => JSON là "user" */
  factoryImages?: FactoryImage[];

  constructor(init?: Partial<Factory>) {
    Object.assign(this, init);
  }
}
