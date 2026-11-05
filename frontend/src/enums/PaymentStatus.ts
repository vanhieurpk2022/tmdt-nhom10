export const PaymentStatus = {
    PENDING: "PENDING",
    FAILED: "FAILED",
    PAID: "PAID",
    REFUND_PENDING: "REFUND_PENDING",
    REFUNDED: "REFUNDED",
} as const;

export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];
