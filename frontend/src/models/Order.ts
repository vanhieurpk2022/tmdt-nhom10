import type { OrderStatus } from '../enums/OrderStatus';
import type { Product } from './Product';
import type { User } from './User';

export interface Order {
  id?: number;
  user?: User;
  product?: Product;
  totalPrice?: number;
  createdAt?: string;
  status?: OrderStatus

}
export type OrderCreateRequest = Omit<Order, "id" | "status">;
