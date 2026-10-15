import { Link } from "react-router";
import type { CartItem } from "../../data/cartData";
import { checkoutCartItemIdsKey } from "../../api/CheckoutSelection";

interface CartSummaryProps {
    selectedItems: CartItem[];
    subtotal: number;
}

const currencyFormatter = new Intl.NumberFormat("vi-VN");

function formatPrice(price: number) {
    return `${currencyFormatter.format(price)}đ`;
}

function saveCheckoutSelection(selectedItems: CartItem[]) {
    window.sessionStorage.setItem(
        checkoutCartItemIdsKey,
        JSON.stringify(selectedItems.map((item) => item.id)),
    );
}

export default function CartSummary({ selectedItems, subtotal }: CartSummaryProps) {
    const originalSubtotal = selectedItems.reduce(
        (total, item) => total + (item.basePrice ?? item.price) * item.quantity,
        0,
    );
    const discount = Math.max(originalSubtotal - subtotal, 0);
    const total = subtotal;

    return (
        <aside className="cart-summary-card">
            <div className="cart-summary-heading d-flex align-items-center justify-content-between">
                <h2>Xác nhận</h2>
                <span>{selectedItems.length} sản phẩm</span>
            </div>

            <div className="cart-summary-products">
                <span>Sản phẩm</span>
                {selectedItems.length > 0 ? (
                    selectedItems.map((item) => (
                        <div className="cart-summary-line" key={item.id}>
                            <p>{item.name}</p>
                            <strong>{formatPrice(item.price * item.quantity)}</strong>
                        </div>
                    ))
                ) : (
                    <p className="cart-summary-empty">Chọn sản phẩm để tiếp tục đặt hàng.</p>
                )}
            </div>

            {selectedItems.length > 0 && (
                <div className="cart-summary-adjustments">
                    <div>
                        <span>Tạm tính</span>
                        <strong>{formatPrice(originalSubtotal)}</strong>
                    </div>
                    {discount > 0 && (
                        <div>
                            <span>Ưu đãi</span>
                            <strong>-{formatPrice(discount)}</strong>
                        </div>
                    )}
                </div>
            )}

            <div className="cart-summary-total">
                <span>Tổng tiền</span>
                <strong>{formatPrice(total)}</strong>
            </div>

            <Link
                to="/checkout"
                onClick={() => saveCheckoutSelection(selectedItems)}
                className={`btn cart-continue-btn d-flex align-items-center justify-content-center fw-bold w-100 ${selectedItems.length === 0 ? "disabled" : ""}`}
            >
                Tiếp tục
            </Link>
        </aside>
    );
}
