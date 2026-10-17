export const ProductStatus = {
    DRAFT: 'DRAFT',           // Bản nháp
    ACTIVE: 'ACTIVE',         // Đang hoạt động / Mở bán
    OUT_OF_STOCK: 'OUT_OF_STOCK', // Hết hàng
    ARCHIVED: 'ARCHIVED',     // Đã lưu trữ / Ẩn
} as const
export type ProductStatus = (typeof ProductStatus)[keyof typeof ProductStatus];