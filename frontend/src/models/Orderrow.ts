import type { OrderStatus } from "./Orders";

// Dữ liệu một dòng trong OrdersTable (đã chuyển từ Order sang dạng hiển thị)
export interface OrderRow {
  id: string;            // "#DH-2026-1042"
  minutesAgo: number;
  customer: string;
  brand?: string;
  product?: string;
  notes?: string;
  workshop?: string;
  workshopCode?: string;
  workshopNote?: string;
  status: OrderStatus;
}