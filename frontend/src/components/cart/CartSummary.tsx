import { Link } from "react-router";
import type { CartItem } from "../../data/cartData";
import { checkoutCartItemIdsKey } from "../../api/CheckoutSelection";

interface CartSummaryProps {
    selectedItems: CartItem[];
    subtotal: number;
}

const currencyFormatter = new Intl.NumberFormat("vi-VN");

function formatPrice(price: number) {
    return `${currencyFormatter.format(price)} ₫`;
}

function saveCheckoutSelection(selectedItems: CartItem[]) {
    window.sessionStorage.setItem(
        checkoutCartItemIdsKey,
        JSON.stringify(selectedItems.map((item) => item.id)),
    );
}

export default function CartSummary({ selectedItems, subtotal }: CartSummaryProps) {
    return (
        <aside className="cart-summary-card">
            <div className="cart-summary-heading d-flex align-items-center justify-content-between">
                <h2>Tóm tắt đơn hàng</h2>
                <span>{selectedItems.length} đã chọn</span>
            </div>

            <div className="cart-summary-products">
                {selectedItems.length > 0 ? (
                    selectedItems.map((item) => (
                        <div className="cart-summary-line" key={item.id}>
                            <div>
                                <p>{item.name}</p>
                                <small>{item.variant} · SL: {item.quantity}</small>
                            </div>
                            <strong>{formatPrice(item.price * item.quantity)}</strong>
                        </div>
                    ))
                ) : (
                    <p className="cart-summary-empty">Chọn sản phẩm để tiếp tục đặt hàng.</p>
                )}
            </div>

            <div className="cart-summary-total">
                <span>Tổng tiền hàng</span>
                <strong>{formatPrice(subtotal)}</strong>
            </div>
            <p className="cart-summary-note">Phí vận chuyển được tính ở bước thanh toán.</p>

            <Link
                to="/checkout"
                onClick={() => saveCheckoutSelection(selectedItems)}
                className={`btn cart-continue-btn ${selectedItems.length === 0 ? "disabled" : ""}`}
                aria-disabled={selectedItems.length === 0}
                tabIndex={selectedItems.length === 0 ? -1 : undefined}
            >
                Tiếp tục thanh toán
            </Link>
        </aside>
    );
}
