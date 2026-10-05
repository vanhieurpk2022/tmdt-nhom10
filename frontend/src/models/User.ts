import type { UserStatus } from "../enums/UserStatus";
import type { Address } from "./Address";
import type { Role } from "./Role";

export class User {
  id?: number;
  username?: string;
  // password cố ý bỏ, backend không nên trả về, frontend không nên giữ.
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
