export const UserStatus = {
  ACTIVE: 'ACTIVE',       // Tài khoản đang hoạt động
  INACTIVE: 'INACTIVE',   // Tạm ngưng sử dụng
  BANNED: 'BANNED',       // Bị khóa/cấm
} as const;

export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus];