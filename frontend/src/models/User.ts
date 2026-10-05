
import type { UserStatus } from '../enums/UserStatus';
import type { Address } from './Address';
import type { Cart } from './Cart';
import type { Factory } from './Factory';
import type { Order } from './Order';
import type { Review } from './Review';
import type { Role } from './Role';
import type { WishList } from './WishList';

export class User {
  id?: number;
  username?: string;
  // password: cố ý bỏ — backend không nên trả về, frontend không nên giữ
  email?: string;
  phone?: string;
  status?: UserStatus;
  createdAt?: string;
  address?: Address[];
  roles?: Role[];

  constructor(init?: Partial<User>) {
    Object.assign(this, init);
  }
}
