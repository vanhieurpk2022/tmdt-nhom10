import type { User } from "./User";

// Giá trị phải khớp với enum OrderStatus ở backend (Java enum thường viết HOA, ví dụ "PENDING")
export type OrderStatus = "pending" | "picking" | "shipping" | "cancelled" | "delivered";

export interface Order {
  id: number;                 // Long
  user: User;                 // user_id: User
  voucherId: number | null;   // Long (nullable)
  subtotalPrice: number;      // double: tổng tiền hàng trước giảm giá
  status: OrderStatus;
  totalPrice: number;         // double: số tiền cuối cùng
  discountAmount: number;     // double
  createdAt: string;          // LocalDateTime → chuỗi ISO, ví dụ "2026-10-02T09:30:00"
}