// Giá trị phải khớp enum Role ở backend (ví dụ "ADMIN" | "CUSTOMER" | "WORKSHOP")
export type Role = string;

export interface User {
  id: number;           // Long
  username: string;
  password?: string;    // không nên có trong response API; chỉ dùng khi gửi form đăng ký/đăng nhập
  email: string;
  phone: string;
  role: Role;
  status: string;
  createdAt: string;    // LocalDateTime → chuỗi ISO
}