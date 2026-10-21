import { ROUTES } from "../routes/routes";

export const checkoutCartItemIdsKey = "oilia_checkout_cart_item_ids";

export interface BuyNowSelection {
    productId: number;
    productMilId?: number;
    quantity: number;
}

export function getBuyNowUrl(selection: BuyNowSelection) {
    const params = new URLSearchParams({
        productId: String(selection.productId),
        quantity: String(selection.quantity),
    });
    if (selection.productMilId != null) params.set("productMilId", String(selection.productMilId));
    return `${ROUTES.CHECKOUT}?${params}`;
}

export function getBuyNowSelection(params: URLSearchParams): BuyNowSelection | null {
    if (!params.has("productId")) return null;
    const productId = Number(params.get("productId"));
    const quantity = Number(params.get("quantity") ?? "1");
    const productMilId = params.has("productMilId") ? Number(params.get("productMilId")) : undefined;
    if (!Number.isSafeInteger(productId) || productId <= 0
        || !Number.isSafeInteger(quantity) || quantity <= 0
        || (productMilId != null && (!Number.isSafeInteger(productMilId) || productMilId <= 0))) {
        throw new Error("Thông tin sản phẩm mua ngay không hợp lệ. Vui lòng chọn lại sản phẩm.");
    }
    return { productId, productMilId, quantity };
}

export function getPurchaseErrorMessage(error: unknown, fallback: string) {
    const apiError = error as { response?: { data?: { message?: string; detail?: string } } };
    return apiError.response?.data?.message || apiError.response?.data?.detail || fallback;
}
