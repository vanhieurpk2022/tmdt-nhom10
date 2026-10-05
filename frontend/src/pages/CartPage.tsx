import { useMemo, useState } from "react";
import CartBreadcrumb from "../components/cart/CartBreadcrumb";
import CartSummary from "../components/cart/CartSummary";
import CartTable from "../components/cart/CartTable";
import { cartItems as initialCartItems } from "../data/cartData";

export default function CartPage() {
    const [items, setItems] = useState(initialCartItems);

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

    const increaseQuantity = (id: number) => {
        setItems((currentItems) =>
            currentItems.map((item) => (item.id === id ? { ...item, quantity: item.quantity + 1 } : item)),
        );
    };

    const decreaseQuantity = (id: number) => {
        setItems((currentItems) =>
            currentItems.map((item) =>
                item.id === id ? { ...item, quantity: Math.max(1, item.quantity - 1) } : item,
            ),
        );
    };

    const removeItem = (id: number) => {
        setItems((currentItems) => currentItems.filter((item) => item.id !== id));
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

                            <CartTable
                                items={items}
                                allSelected={allSelected}
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
