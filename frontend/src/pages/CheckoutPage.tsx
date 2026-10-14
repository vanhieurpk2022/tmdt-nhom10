import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { addressService, type AddressItem } from "../api/AddressService";
import { useCart } from "../api/CartContext";
import { cartService, type CartItemResponse, type CartResponse } from "../api/CartService";
import { orderService, saveLastOrder, type PaymentMethod } from "../api/OrderService";
import { shippingService } from "../api/ShippingService";
import CheckoutBreadcrumb from "../components/checkout/CheckoutBreadcrumb";
import CheckoutProductList from "../components/checkout/CheckoutProductList";
import CheckoutSummary from "../components/checkout/CheckoutSummary";
import PaymentMethodList from "../components/checkout/PaymentMethodList";
import ShippingInfo from "../components/checkout/ShippingInfo";
import { fallbackCartImage, type CartItem } from "../data/cartData";
import { paymentMethods } from "../data/checkoutData";
import { ROUTES } from "../routes/routes";

const fallbackCheckoutImages = [
    "/images/home/lavender-france.png",
    "/images/home/tea-tree-australia.png",
    "/images/home/grapefruit-cold-pressed.png",
    "/images/home/lemongrass.png",
];

const checkoutCartItemIdsKey = "oilia_checkout_cart_item_ids";

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
            ? parsedValue.filter((id): id is number => typeof id === "number")
            : null;
    } catch {
        return null;
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

function toCartItem(item: CartItemResponse, index: number): CartItem {
    const price = item.price ?? item.basePrice ?? 0;
    const inStock = item.stockQuantity > 0 && item.stockStatus !== "Hết hàng";

    return {
        id: item.id,
        productId: item.productId,
        name: item.productName,
        variant: item.description || "Sản phẩm tinh dầu",
        origin: `Tồn kho: ${item.stockQuantity}`,
        description: item.description ?? undefined,
        factoryName: item.factoryName || "Oilia Essential",
        factoryCode: `SP-${item.productId}`,
        price,
        basePrice: item.basePrice ?? price,
        quantity: item.quantity,
        selected: true,
        image: item.thumbnailUrl || fallbackCheckoutImages[index % fallbackCheckoutImages.length] || fallbackCartImage,
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
    const [errorMessage, setErrorMessage] = useState("");

    const selectedAddress = useMemo(() => getDefaultAddress(addresses), [addresses]);
    const checkoutItemsSignature = useMemo(
        () => checkoutItems.map((item) => `${item.id}:${item.quantity}`).join("|"),
        [checkoutItems]
    );

    const applyCheckoutCart = useCallback((cart: CartResponse) => {
        applyCart(cart);
        const selectedIds = getStoredCheckoutItemIds();
        const selectedItems = selectedIds
            ? cart.items.filter((item) => selectedIds.includes(item.id))
            : cart.items;

        setCheckoutItems((selectedItems.length > 0 ? selectedItems : cart.items).map(toCartItem));
    }, [applyCart]);

    const loadCheckoutData = useCallback(async () => {
        try {
            setIsLoading(true);
            setErrorMessage("");

            const [cart, userAddresses] = await Promise.all([
                cartService.getCart(),
                addressService.getAddresses(),
            ]);

            applyCheckoutCart(cart);
            setAddresses(userAddresses);
        } catch (error) {
            console.error(error);
            setCheckoutItems([]);
            setAddresses([]);
            setErrorMessage("Chưa tải được thông tin thanh toán. Vui lòng đăng nhập hoặc thử lại sau.");
        } finally {
            setIsLoading(false);
        }
    }, [applyCheckoutCart]);

    const handleCreateOrder = useCallback(async () => {
        if (!selectedAddress) {
            setErrorMessage("Vui lòng thêm địa chỉ giao hàng trước khi đặt hàng.");
            return;
        }
        if (checkoutItems.length === 0) {
            setErrorMessage("Vui lòng chọn sản phẩm trong giỏ hàng trước khi đặt hàng.");
            return;
        }

        if (isShippingFeeLoading) {
            setErrorMessage("Vui lòng chờ hệ thống tính phí vận chuyển.");
            return;
        }
        if (shippingFeeError) {
            setErrorMessage(shippingFeeError);
            return;
        }

        const paymentMethod = paymentMethodMap[selectedPaymentMethod] ?? "COD";

        try {
            setIsSubmitting(true);
            setErrorMessage("");

            const order = await orderService.createOrder({
                addressId: selectedAddress.id,
                cartItemIds: checkoutItems.map((item) => item.id),
                paymentMethod,
                note: deliveryNote.trim() || undefined,
            });

            saveLastOrder(order);
            window.sessionStorage.removeItem(checkoutCartItemIdsKey);
            await refreshCart();

            navigate(ROUTES.ORDER_SUCCESS, {
                state: { order },
            });
        } catch (error) {
            console.error(error);
            setErrorMessage(getCheckoutErrorMessage(error));
        } finally {
            setIsSubmitting(false);
        }
    }, [
        checkoutItems,
        deliveryNote,
        isShippingFeeLoading,
        navigate,
        refreshCart,
        selectedAddress,
        selectedPaymentMethod,
        shippingFeeError,
    ]);

    useEffect(() => {
        loadCheckoutData();
    }, [loadCheckoutData]);

    useEffect(() => {
        if (!selectedAddress || checkoutItems.length === 0) {
            setShippingFee(0);
            setShippingFeeError("");
            setIsShippingFeeLoading(false);
            return;
        }

        let isActive = true;

        async function calculateShippingFee() {
            try {
                setIsShippingFeeLoading(true);
                setShippingFeeError("");

                const quote = await shippingService.calculateFee({
                    addressId: selectedAddress.id,
                    cartItemIds: checkoutItems.map((item) => item.id),
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
    }, [checkoutItems, checkoutItemsSignature, selectedAddress]);

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
                            />
                        </section>
                    </div>

                    <div className="col-12 col-xl-4">
                        <CheckoutSummary
                            items={checkoutItems}
                            shippingFee={shippingFee}
                            isLoading={isLoading}
                            isShippingFeeLoading={isShippingFeeLoading}
                            shippingFeeError={shippingFeeError}
                            isSubmitting={isSubmitting}
                            hasAddress={Boolean(selectedAddress)}
                            onContinue={handleCreateOrder}
                        />
                    </div>
                </div>
            </div>
        </main>
    );
}
