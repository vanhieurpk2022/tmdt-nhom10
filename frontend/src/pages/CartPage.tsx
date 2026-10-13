import { useCallback, useEffect, useMemo, useState } from "react";
import { cartService, type CartResponse, type CartItemResponse } from "../api/CartService";
import CartBreadcrumb from "../components/cart/CartBreadcrumb";
import CartSummary from "../components/cart/CartSummary";
import CartTable from "../components/cart/CartTable";
import { fallbackCartImage, type CartItem } from "../data/cartData";

const fallbackCartImages = [
    "/images/home/lavender-france.png",
    "/images/home/tea-tree-australia.png",
    "/images/home/grapefruit-cold-pressed.png",
    "/images/home/jasmine-sambac.png",
];

function toCartItem(item: CartItemResponse, selected: boolean, index: number): CartItem {
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
        selected,
        image: item.thumbnailUrl || fallbackCartImages[index % fallbackCartImages.length] || fallbackCartImage,
        inStock,
        stockQuantity: item.stockQuantity,
        stockStatus: item.stockStatus,
    };
}

export default function CartPage() {
    const [items, setItems] = useState<CartItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [updatingItemIds, setUpdatingItemIds] = useState<number[]>([]);

    const applyCart = useCallback((cart: CartResponse) => {
        setItems((currentItems) => {
            const selectedById = new Map(currentItems.map((item) => [item.id, item.selected]));

            return cart.items.map((item, index) => toCartItem(item, selectedById.get(item.id) ?? true, index));
        });
    }, []);

    const loadCart = useCallback(async () => {
        try {
            setIsLoading(true);
            setErrorMessage("");
            applyCart(await cartService.getCart());
        } catch (error) {
            console.error(error);
            setItems([]);
            setErrorMessage("Chưa tải được giỏ hàng. Vui lòng đăng nhập hoặc thử lại sau.");
        } finally {
            setIsLoading(false);
        }
    }, [applyCart]);

    useEffect(() => {
        loadCart();
    }, [loadCart]);

    const selectedItems = useMemo(() => items.filter((item) => item.selected), [items]);
    const subtotal = useMemo(
        () => selectedItems.reduce((total, item) => total + item.price * item.quantity, 0),
        [selectedItems],
    );
    const allSelected = items.length > 0 && items.every((item) => item.selected);

    const toggleAll = () => {
        setItems((currentItems) => currentItems.map((item) => ({ ...item, selected: !allSelected })));
    };

    const toggleItem = (id: number) => {
        setItems((currentItems) =>
            currentItems.map((item) => (item.id === id ? { ...item, selected: !item.selected } : item)),
        );
    };

    const markUpdating = (id: number) => {
        setUpdatingItemIds((currentIds) => (currentIds.includes(id) ? currentIds : [...currentIds, id]));
    };

    const unmarkUpdating = (id: number) => {
        setUpdatingItemIds((currentIds) => currentIds.filter((currentId) => currentId !== id));
    };

    const updateQuantity = async (id: number, nextQuantity: number) => {
        if (nextQuantity < 1) return;

        try {
            markUpdating(id);
            setErrorMessage("");
            applyCart(await cartService.updateItem(id, { quantity: nextQuantity }));
        } catch (error) {
            console.error(error);
            setErrorMessage("Chưa cập nhật được số lượng. Vui lòng thử lại.");
        } finally {
            unmarkUpdating(id);
        }
    };

    const increaseQuantity = (id: number) => {
        const item = items.find((cartItem) => cartItem.id === id);
        if (!item) return;
        updateQuantity(id, item.quantity + 1);
    };

    const decreaseQuantity = (id: number) => {
        const item = items.find((cartItem) => cartItem.id === id);
        if (!item) return;
        updateQuantity(id, item.quantity - 1);
    };

    const removeItem = async (id: number) => {
        try {
            markUpdating(id);
            setErrorMessage("");
            applyCart(await cartService.removeItem(id));
        } catch (error) {
            console.error(error);
            setErrorMessage("Chưa xóa được sản phẩm khỏi giỏ hàng. Vui lòng thử lại.");
        } finally {
            unmarkUpdating(id);
        }
    };

    return (
        <main className="cart-page">
            <div className="container-fluid px-4 px-lg-5">
                <CartBreadcrumb />

                <div className="row g-4 align-items-start">
                    <div className="col-12 col-xl-8">
                        <section className="cart-card">
                            <div className="cart-card-heading d-flex align-items-start justify-content-between">
                                <div>
                                    <h1>Giỏ hàng</h1>
                                    <p>Hệ thống đã tự động cập nhật giá mới nhất cho các sản phẩm đã mua của bạn.</p>
                                </div>
                                <span>{items.length} sản phẩm</span>
                            </div>

                            {errorMessage && (
                                <div className="alert alert-light border cart-alert" role="alert">
                                    {errorMessage}
                                </div>
                            )}

                            <CartTable
                                items={items}
                                allSelected={allSelected}
                                isLoading={isLoading}
                                updatingItemIds={updatingItemIds}
                                onToggleAll={toggleAll}
                                onToggleItem={toggleItem}
                                onIncrease={increaseQuantity}
                                onDecrease={decreaseQuantity}
                                onRemove={removeItem}
                            />
                        </section>
                    </div>

                    <div className="col-12 col-xl-4">
                        <CartSummary selectedItems={selectedItems} subtotal={subtotal} />
                    </div>
                </div>
            </div>
        </main>
    );
}
