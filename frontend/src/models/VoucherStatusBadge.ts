import type { VourcherStatusAdmin } from "../enums/VourcherStatusAdmin";

export const VoucherStatusBadge: Record<VourcherStatusAdmin, { label: string; badge: string }> = {
    RUNNING: {
        label: "Đang diễn ra",
        badge: "bg-success-subtle text-success-emphasis",
    },
    SCHEDULED: {
        label: "Sắp diễn ra",
        badge: "bg-warning-subtle text-warning-emphasis",
    },
    PAUSED: {
        label: "Tạm dừng",
        badge: "bg-secondary-subtle text-secondary-emphasis",
    },
    EXPIRED: {
        label: "Đã kết thúc",
        badge: "bg-dark-subtle text-dark-emphasis",
    },
};
