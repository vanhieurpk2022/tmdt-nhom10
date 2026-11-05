import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react";
import { useCart } from "../api/CartContext";
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
    const price = item.price ?? 0;
    const inStock = item.stockQuantity > 0 && item.stockStatus !== "Hết hàng";

    return {
        id: item.id,
        productId: item.productId,
        name: item.productName,
        variant: item.mil ? `Dung tích: ${item.mil}ml` : "Sản phẩm tinh dầu",
        origin: `Tồn kho: ${item.stockQuantity}`,
        description: item.description ?? undefined,
        factoryName: item.factoryName || "Oilia Essential",
        factoryCode: `SP-${item.productId}`,
        price,
        quantity: item.quantity,
        selected,
        image: item.thumbnailUrl || fallbackCartImages[index % fallbackCartImages.length] || fallbackCartImage,
        inStock,
        stockQuantity: item.stockQuantity,
        stockStatus: item.stockStatus,
    };
}

export default function CartPage() {
    const { applyCart: applyCartSummary } = useCart();
    const [items, setItems] = useState<CartItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [updatingItemIds, setUpdatingItemIds] = useState<number[]>([]);

    useLayoutEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }, []);

    const applyCart = useCallback((cart: CartResponse) => {
        applyCartSummary(cart);
        setItems((currentItems) => {
            const selectedById = new Map(currentItems.map((item) => [item.id, item.selected]));

            return cart.items.map((item, index) => toCartItem(item, selectedById.get(item.id) ?? true, index));
        });
    }, [applyCartSummary]);

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
        <main className="cart-page py-3 py-md-4" style={{ minHeight: "85vh", backgroundColor: "#f8fafc" }}>
            <div className="container-fluid px-3 px-md-4 px-xl-5" style={{ maxWidth: "1280px" }}>
                <CartBreadcrumb />

                {/* Tiêu đề trang */}
                <div className="mb-4">
                    <h1 className="h5 fw-bold text-dark mb-1">Giỏ hàng của bạn</h1>
                    <p className="text-muted mb-0" style={{ fontSize: "13.5px" }}>
                        Hệ thống đã tự động cập nhật giá và tồn kho mới nhất cho các sản phẩm đã chọn
                    </p>
                </div>

                <div className="row g-4 align-items-start">
                    <div className="col-12 col-xl-8">
                        <section className="bg-white rounded-4 border shadow-sm p-4 mb-4">
                            <div className="d-flex flex-wrap align-items-center justify-content-between pb-3 mb-3 border-bottom gap-2">
                                <div>
                                    <h2 className="h6 fw-bold text-dark mb-0">Danh sách sản phẩm trong giỏ</h2>
                                    <span className="text-muted" style={{ fontSize: "12.5px" }}>Chọn sản phẩm bạn muốn đặt mua</span>
                                </div>
                                <span className="badge bg-light text-dark border rounded-pill px-3 py-1.5 fw-semibold" style={{ fontSize: "12.5px" }}>
                                    {items.length} mặt hàng
                                </span>
                            </div>

                            {errorMessage && (
                                <div className="alert alert-danger rounded-3 p-3 mb-3 border-0 shadow-sm" role="alert" style={{ fontSize: "13px" }}>
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

                    <div className="col-12 col-xl-4 position-xl-sticky" style={{ top: "85px" }}>
                        <CartSummary selectedItems={selectedItems} subtotal={subtotal} />
                    </div>
                </div>
            </div>
        </main>
    );
}
