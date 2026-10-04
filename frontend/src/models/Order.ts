import type { OrderStatus } from '../enums/OrderStatus';
import type { OrderItem } from './OrderItem';

export class Order {
  id?: number;
  orderItems?: OrderItem[];
  subtotalPrice?: number;
  status?: OrderStatus;
  totalPrice?: number;
  discountAmount?: number;
  createdAt?: string;

  constructor(init?: Partial<Order>) {
    Object.assign(this, init);
  }
}
