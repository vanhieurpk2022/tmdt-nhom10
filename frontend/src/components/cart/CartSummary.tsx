import { Link } from "react-router";
import type { CartItem } from "../../data/cartData";

interface CartSummaryProps {
    selectedItems: CartItem[];
    subtotal: number;
}

const currencyFormatter = new Intl.NumberFormat("vi-VN");

function formatPrice(price: number) {
    return `${currencyFormatter.format(price)}đ`;
}

export default function CartSummary({ selectedItems, subtotal }: CartSummaryProps) {
    const discount = selectedItems.length > 0 ? 125000 : 0;
    const total = Math.max(0, subtotal - discount);

    return (
        <aside className="cart-summary-card">
            <div className="cart-summary-heading">
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
                        <strong>{formatPrice(subtotal)}</strong>
                    </div>
                    <div>
                        <span>Ưu đãi</span>
                        <strong>-{formatPrice(discount)}</strong>
                    </div>
                </div>
            )}

            <div className="cart-summary-total">
                <span>Tổng tiền</span>
                <strong>{formatPrice(total)}</strong>
            </div>

            <Link to="/checkout" className={`btn cart-continue-btn ${selectedItems.length === 0 ? "disabled" : ""}`}>
                Tiếp tục
            </Link>
        </aside>
    );
}
