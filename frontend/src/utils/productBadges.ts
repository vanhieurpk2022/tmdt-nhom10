import { ProductStatus } from "../enums/ProductStatus";

export const ProductStatusBadge: Record<ProductStatus, { label: string; badge: string }> = {
    [ProductStatus.DRAFT]: { label: "Bản nháp", badge: "bg-warning-subtle text-warning-emphasis" },
    [ProductStatus.ACTIVE]: { label: "Đang bán", badge: "bg-success-subtle text-success-emphasis" },
    [ProductStatus.OUT_OF_STOCK]: { label: "Hết hàng", badge: "bg-danger-subtle text-danger-emphasis" },
    [ProductStatus.INACTIVE]: { label: "Ngừng bán", badge: "bg-secondary-subtle text-secondary-emphasis" },
    [ProductStatus.ARCHIVED]: { label: "Đã lưu trữ", badge: "bg-dark-subtle text-dark-emphasis" },
};
