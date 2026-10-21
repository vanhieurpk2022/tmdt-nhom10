import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useAuth } from "../api/AuthContext";
import { beginCheckout, clearPendingCheckout, getPendingCheckout, isDefinitiveCheckoutFailure, type PendingCheckout } from "../api/CheckoutSession";
import { checkoutCartItemIdsKey, getBuyNowSelection, getPurchaseErrorMessage } from "../api/CheckoutSelection";
import { addressService, type AddressItem } from "../api/AddressService";
import { useCart } from "../api/CartContext";
import { cartService, type CartItemResponse, type CartResponse } from "../api/CartService";
import { orderService, saveLastOrder, type CheckoutResult, type PaymentMethod, type PaymentAvailability } from "../api/OrderService";
import { shippingService } from "../api/ShippingService";
import CheckoutBreadcrumb from "../components/checkout/CheckoutBreadcrumb";
import CheckoutProductList from "../components/checkout/CheckoutProductList";
import CheckoutSummary from "../components/checkout/CheckoutSummary";
import CodConfirmationModal from "../components/checkout/CodConfirmationModal";
import PaymentMethodList from "../components/checkout/PaymentMethodList";
import ShippingInfo from "../components/checkout/ShippingInfo";
import { fallbackCartImage, type CartItem } from "../data/cartData";
import { paymentMethods } from "../data/checkoutData";
import { ROUTES } from "../routes/routes";

const paymentMethodMap: Record<string, PaymentMethod> = {
    cod: "COD",
    vnpay: "VNPAY",
};

const defaultDeliveryNote = "Giao trong giờ hành chính, gọi trước khi đến.";

function getStoredCheckoutItemIds() {
    const rawValue = window.sessionStorage.getItem(checkoutCartItemIdsKey);
    if (!rawValue) return null;

    try {
        const parsedValue = JSON.parse(rawValue);
        return Array.isArray(parsedValue)
            ? parsedValue.filter((id): id is number => Number.isSafeInteger(id) && id > 0)
            : [];
    } catch {
        return [];
    }
}

function getCheckoutErrorMessage(error: unknown) {
    const apiError = error as { response?: { data?: { message?: string } } };
    return apiError.response?.data?.message || "Chưa thể tạo đơn hàng. Vui lòng kiểm tra lại thông tin và thử lại.";
}

function getShippingFeeErrorMessage(error: unknown) {
    const apiError = error as { response?: { data?: { message?: string } } };
    return apiError.response?.data?.message || "Chưa tính được phí vận chuyển. Vui lòng kiểm tra lại địa chỉ giao hàng.";
}

function toCartItem(item: CartItemResponse): CartItem {
    const price = item.price ?? 0;
    const inStock = item.stockQuantity > 0 && item.stockStatus !== "Hết hàng";

    return {
        id: item.id,
        productId: item.productId,
        productMilId: item.productMilId,
        name: item.productName,
        variant: item.mil ? `Dung tích: ${item.mil}ml` : "Sản phẩm tinh dầu",
        origin: `Tồn kho: ${item.stockQuantity}`,
        description: item.description ?? undefined,
        factoryName: item.factoryName || "Oilia Essential",
        factoryCode: `SP-${item.productId}`,
        price,
        quantity: item.quantity,
        selected: true,
        image: item.thumbnailUrl || fallbackCartImage,
        inStock,
        stockQuantity: item.stockQuantity,
        stockStatus: item.stockStatus,
    };
}

function getDefaultAddress(addresses: AddressItem[]) {
    return addresses.find((address) => address.isDefault) ?? addresses[0] ?? null;
}

export default function CheckoutPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { user } = useAuth();
    const { buyNow, selectionError } = useMemo(() => {
        try {
            return { buyNow: getBuyNowSelection(searchParams), selectionError: "" };
        } catch (error) {
            return { buyNow: null, selectionError: (error as Error).message };
        }
    }, [searchParams]);
    const { applyCart, refreshCart } = useCart();
    const [checkoutItems, setCheckoutItems] = useState<CartItem[]>([]);
    const [addresses, setAddresses] = useState<AddressItem[]>([]);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(paymentMethods[0]?.id ?? "cod");
    const [deliveryNote, setDeliveryNote] = useState(defaultDeliveryNote);
    const [shippingFee, setShippingFee] = useState(0);
    const [isShippingFeeLoading, setIsShippingFeeLoading] = useState(false);
    const [shippingFeeError, setShippingFeeError] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showCodConfirmation, setShowCodConfirmation] = useState(false);
    const submitting = useRef(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [recoveryRequired, setRecoveryRequired] = useState(false);
    const [recoveryVersion, setRecoveryVersion] = useState(0);
    const [vnpayAvailability, setVnpayAvailability] = useState<PaymentAvailability>({
        available: false, message: "Đang kiểm tra phương thức thanh toán…",
    });

    useEffect(() => {
        let active = true;
        orderService.vnpayAvailability().then(result => { if (active) setVnpayAvailability(result); })
            .catch(() => { if (active) setVnpayAvailability({ available: false,
                message: "Chưa kiểm tra được VNPay. Vui lòng tải lại trang hoặc chọn COD.",
            }); });
        return () => { active = false; };
    }, []);

    const selectedAddress = useMemo(() => getDefaultAddress(addresses), [addresses]);

    const completeCheckout = useCallback((pending: PendingCheckout, result: CheckoutResult) => {
        if (!user) return;
        clearPendingCheckout(user.id, pending.key);
        saveLastOrder(result.order);
        if (!pending.request.buyNow) sessionStorage.removeItem(checkoutCartItemIdsKey);
        void refreshCart().catch(() => undefined);
        if (result.payment?.paymentUrl) {
            window.location.assign(result.payment.paymentUrl);
        } else if (result.order.paymentMethod === "VNPAY") {
            navigate(`${ROUTES.VNPAY_RESULT}?orderId=${result.order.id}`, { replace: true });
        } else {
            navigate(`${ROUTES.ORDER_SUCCESS}?orderId=${result.order.id}`, { replace: true });
        }
    }, [navigate, refreshCart, user]);

    const applyCheckoutCart = useCallback((cart: CartResponse) => {
        applyCart(cart);
        const selectedIds = getStoredCheckoutItemIds();
        const selectedItems = selectedIds
            ? cart.items.filter((item) => selectedIds.includes(item.id))
            : cart.items;

        if (selectedIds && selectedItems.length !== selectedIds.length) {
            throw new Error("Sản phẩm đã chọn không còn trong giỏ hàng. Vui lòng quay lại giỏ hàng và chọn lại.");
        }
        setCheckoutItems(selectedItems.map(toCartItem));
    }, [applyCart]);

    const purchaseSelection = useMemo(() => buyNow ? {
        buyNow: { ...buyNow, productMilId: checkoutItems[0]?.productMilId ?? buyNow.productMilId },
    } : { cartItemIds: checkoutItems.map((item) => item.id) }, [buyNow, checkoutItems]);

    useLayoutEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }, [searchParams]);

    const handleCreateOrder = useCallback(async () => {
        if (!user || recoveryRequired) return;
        if (!selectedAddress) {
            setErrorMessage("Vui lòng thêm địa chỉ giao hàng trước khi đặt hàng.");
            return;
        }
        if (checkoutItems.length === 0) {
            setErrorMessage("Vui lòng chọn sản phẩm trong giỏ hàng trước khi đặt hàng.");
            return;
        }

        if (isLoading || isSubmitting || isShippingFeeLoading || (!shippingFeeError && shippingFee <= 0)) {
            setErrorMessage("Vui lòng chờ hệ thống tính phí vận chuyển.");
            return;
        }
        if (shippingFeeError) {
            setErrorMessage(shippingFeeError);
            return;
        }

        const paymentMethod = paymentMethodMap[selectedPaymentMethod] ?? "COD";
        if (paymentMethod === "VNPAY" && !vnpayAvailability.available) {
            setErrorMessage(vnpayAvailability.message);
            return;
        }
        if (submitting.current) return;
        submitting.current = true;

        let pending: PendingCheckout | null = null;
        try {
            setIsSubmitting(true);
            setErrorMessage("");

            const request = {
                addressId: selectedAddress.id,
                ...purchaseSelection,
                paymentMethod,
                note: deliveryNote.trim() || undefined,
            };
            pending = beginCheckout(user.id, request);
            const result = await orderService.submitCheckout(pending);
            completeCheckout(pending, result);
        } catch (error) {
            if (pending && isDefinitiveCheckoutFailure(error)) clearPendingCheckout(user.id, pending.key);
            const needsRecovery = Boolean(getPendingCheckout(user.id));
            setRecoveryRequired(needsRecovery);
            if (needsRecovery) setShowCodConfirmation(false);
            setErrorMessage(error instanceof Error && !("response" in error)
                ? error.message : getCheckoutErrorMessage(error));
            if ((error as { response?: { status?: number } }).response?.status === 503 && paymentMethod === "VNPAY") {
                orderService.vnpayAvailability().then(setVnpayAvailability).catch(() => undefined);
            }
        } finally {
            submitting.current = false;
            setIsSubmitting(false);
        }
    }, [
        checkoutItems,
        completeCheckout,
        purchaseSelection,
        deliveryNote,
        isLoading,
        isSubmitting,
        shippingFee,
        isShippingFeeLoading,
        recoveryRequired,
        selectedAddress,
        selectedPaymentMethod,
        shippingFeeError,
        vnpayAvailability,
        user,
    ]);

    function handleContinue() {
        if (submitting.current) return;
        setErrorMessage("");
        if ((paymentMethodMap[selectedPaymentMethod] ?? "COD") === "COD") {
            setShowCodConfirmation(true);
            return;
        }
        void handleCreateOrder();
    }

    function handleCancelConfirmation() {
        if (submitting.current) return;
        setShowCodConfirmation(false);
        setErrorMessage("");
    }

    useEffect(() => {
        let active = true;
        async function loadCheckoutData() {
            setIsLoading(true);
            setErrorMessage("");
            setCheckoutItems([]);
            setShippingFee(0);
            try {
                if (!user) return;
                const pending = getPendingCheckout(user.id);
                setRecoveryRequired(Boolean(pending));
                if (pending) {
                    try {
                        const result = await orderService.resumeCheckout(pending);
                        if (active) completeCheckout(pending, result);
                        return;
                    } catch (error) {
                        if (!active) return;
                        if (!isDefinitiveCheckoutFailure(error)) throw error;
                        clearPendingCheckout(user.id, pending.key);
                        setRecoveryRequired(false);
                        setErrorMessage(getCheckoutErrorMessage(error));
                    }
                }
                if (selectionError) throw new Error(selectionError);
                if (buyNow) {
                    const [item, userAddresses] = await Promise.all([
                        orderService.previewBuyNow(buyNow), addressService.getAddresses(),
                    ]);
                    if (!active) return;
                    setCheckoutItems([toCartItem(item)]);
                    setAddresses(userAddresses);
                } else {
                    const [cart, userAddresses] = await Promise.all([
                        cartService.getCart(), addressService.getAddresses(),
                    ]);
                    if (!active) return;
                    applyCheckoutCart(cart);
                    setAddresses(userAddresses);
                }
            } catch (error) {
                if (!active) return;
                setCheckoutItems([]);
                setAddresses([]);
                setErrorMessage(getPurchaseErrorMessage(error,
                    error instanceof Error && !('response' in error) ? error.message
                        : "Chưa tải được thông tin thanh toán. Vui lòng đăng nhập hoặc thử lại sau."));
            } finally {
                if (active) setIsLoading(false);
            }
        }
        loadCheckoutData();
        return () => { active = false; };
    }, [applyCheckoutCart, buyNow, selectionError, completeCheckout, recoveryVersion, user]);

    useEffect(() => {
        if (!selectedAddress || checkoutItems.length === 0) {
            return;
        }

        let isActive = true;

        async function calculateShippingFee() {
            try {
                setIsShippingFeeLoading(true);
                setShippingFee(0);
                setShippingFeeError("");

                const quote = await shippingService.calculateFee({
                    addressId: selectedAddress.id,
                    ...purchaseSelection,
                });

                if (isActive) {
                    setShippingFee(quote.shippingFee);
                }
            } catch (error) {
                console.error(error);
                if (isActive) {
                    setShippingFee(0);
                    setShippingFeeError(getShippingFeeErrorMessage(error));
                }
            } finally {
                if (isActive) {
                    setIsShippingFeeLoading(false);
                }
            }
        }

        calculateShippingFee();

        return () => {
            isActive = false;
        };
    }, [checkoutItems, purchaseSelection, selectedAddress]);

    return (
        <main className="checkout-page">
            <div className="container-fluid px-4 px-lg-5">
                <CheckoutBreadcrumb />

                <div className="row g-4 align-items-start">
                    <div className="col-12 col-xl-8">
                        <section className="checkout-panel">
                            <div className="checkout-heading">
                                <h1>Thông tin thanh toán & Giao hàng</h1>
                                <p>Vui lòng kiểm tra kỹ danh sách sản phẩm, địa chỉ nhận hàng và phương thức thanh toán.</p>
                            </div>

                            {errorMessage && (
                                <div className="alert alert-light border checkout-alert" role="alert">
                                    {errorMessage}
                                </div>
                            )}
                            {recoveryRequired && <div className="alert alert-info" role="status">
                                <p>Đang xác nhận yêu cầu đặt hàng trước. Vui lòng khôi phục để tránh tạo đơn trùng.</p>
                                <button className="btn btn-outline-primary" disabled={isLoading || isSubmitting}
                                    onClick={() => { setRecoveryVersion(version => version + 1); }}>
                                    {isLoading ? "Đang khôi phục…" : "Khôi phục yêu cầu đặt hàng"}
                                </button>
                            </div>}

                            <CheckoutProductList items={checkoutItems} isLoading={isLoading} />
                            <ShippingInfo
                                address={selectedAddress}
                                deliveryNote={deliveryNote}
                                isLoading={isLoading}
                                onDeliveryNoteChange={setDeliveryNote}
                            />
                            <PaymentMethodList
                                methods={paymentMethods}
                                selectedMethodId={selectedPaymentMethod}
                                onSelectMethod={setSelectedPaymentMethod}
                                vnpayAvailable={vnpayAvailability.available}
                                vnpayMessage={vnpayAvailability.message}
                            />
                        </section>
                    </div>

                    <div className="col-12 col-xl-4">
                        <CheckoutSummary
                            items={checkoutItems}
                            shippingFee={selectedAddress && checkoutItems.length > 0 ? shippingFee : 0}
                            isLoading={isLoading}
                            isShippingFeeLoading={Boolean(selectedAddress) && checkoutItems.length > 0 && (isShippingFeeLoading || (shippingFee <= 0 && !shippingFeeError))}
                            shippingFeeError={selectedAddress && checkoutItems.length > 0 ? shippingFeeError : ""}
                            isSubmitting={isSubmitting || recoveryRequired}
                            hasAddress={Boolean(selectedAddress)}
                            paymentUnavailable={selectedPaymentMethod === "vnpay" && !vnpayAvailability.available}
                            onContinue={handleContinue}
                        />
                    </div>
                </div>
            </div>
            <CodConfirmationModal
                show={showCodConfirmation}
                total={checkoutItems.reduce((total, item) => total + item.price * item.quantity, 0) + shippingFee}
                isSubmitting={isSubmitting}
                errorMessage={errorMessage}
                onCancel={handleCancelConfirmation}
                onConfirm={() => { void handleCreateOrder(); }}
            />
        </main>
    );
}
