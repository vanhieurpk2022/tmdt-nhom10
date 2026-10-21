import type { CreateOrderRequest } from "./OrderService";

export interface PendingCheckout {
    key: string;
    request: CreateOrderRequest;
}

const storageKey = (userId: string) => `oilia_checkout_pending:${userId}`;

export function getPendingCheckout(userId: string): PendingCheckout | null {
    const raw = sessionStorage.getItem(storageKey(userId));
    if (!raw) return null;
    try {
        const pending = JSON.parse(raw) as PendingCheckout;
        if (pending && typeof pending.key === "string" && /^[A-Za-z0-9_-]{16,80}$/.test(pending.key)
            && Number.isSafeInteger(pending.request?.addressId) && pending.request.addressId > 0
            && ["COD", "VNPAY"].includes(pending.request.paymentMethod)) return pending;
    } catch { /* Discard an unreadable local draft. */ }
    sessionStorage.removeItem(storageKey(userId));
    return null;
}

export function beginCheckout(userId: string, request: CreateOrderRequest): PendingCheckout {
    const previous = getPendingCheckout(userId);
    if (previous) {
        if (JSON.stringify(previous.request) !== JSON.stringify(request)) {
            throw new Error("Vui lòng khôi phục yêu cầu đặt hàng trước khi tạo đơn mới.");
        }
        return previous;
    }
    const pending = { key: crypto.randomUUID(), request };
    sessionStorage.setItem(storageKey(userId), JSON.stringify(pending));
    return pending;
}

export function clearPendingCheckout(userId: string, key: string) {
    if (getPendingCheckout(userId)?.key === key) sessionStorage.removeItem(storageKey(userId));
}

export function isDefinitiveCheckoutFailure(error: unknown) {
    const status = (error as { response?: { status?: number } })?.response?.status;
    // Authentication, timeout and server errors can still leave an unresolved order.
    return status === 400 || status === 404 || status === 409 || status === 422;
}
