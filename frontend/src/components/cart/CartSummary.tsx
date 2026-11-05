import { Link } from "react-router";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { CartItem } from "../../data/cartData";
import { checkoutCartItemIdsKey } from "../../api/CheckoutSelection";
import { ROUTES } from "../../routes/routes";

interface CartSummaryProps {
    selectedItems: CartItem[];
    subtotal: number;
}

const currencyFormatter = new Intl.NumberFormat("vi-VN");

function formatPrice(price: number) {
    return `${currencyFormatter.format(price)}₫`;
}

function saveCheckoutSelection(selectedItems: CartItem[]) {
    const itemIds = selectedItems.map((item) => item.id);
    sessionStorage.setItem(checkoutCartItemIdsKey, JSON.stringify(itemIds));
}

export default function CartSummary({ selectedItems, subtotal }: CartSummaryProps) {
    const total = subtotal;
    const isDisabled = selectedItems.length === 0;

    return (
        <aside className="bg-white rounded-4 border shadow-sm p-4 mb-4" aria-labelledby="cart-summary-title">
            {/* Header sạch sẽ, không icon trang trí thừa */}
            <div className="d-flex align-items-center justify-content-between pb-3 mb-3 border-bottom">
                <div>
                    <h2 id="cart-summary-title" className="h6 fw-bold text-dark mb-0.5">
                        Tóm tắt đơn hàng
                    </h2>
                    <span className="text-muted" style={{ fontSize: "12.5px" }}>Chi tiết giỏ hàng hiện tại</span>
                </div>

                <span className="badge bg-light text-dark border rounded-pill px-2.5 py-1 fw-semibold" style={{ fontSize: "12px" }}>
                    {selectedItems.length} đã chọn
                </span>
            </div>

            {/* Danh sách tóm lược sản phẩm đã chọn */}
            <div className="d-flex flex-column gap-2 mb-3 max-h-48 overflow-y-auto pe-1" style={{ fontSize: "13.5px" }}>
                {selectedItems.length > 0 ? (
                    selectedItems.map((item) => (
                        <div className="d-flex align-items-center justify-content-between text-muted py-1" key={item.id}>
                            <div className="d-flex align-items-center gap-2 text-truncate me-2">
                                <span className="text-muted fw-semibold" style={{ fontSize: "12px" }}>x{item.quantity}</span>
                                <span className="text-dark text-truncate" title={item.name}>{item.name}</span>
                            </div>
                            <strong className="text-dark fw-semibold text-nowrap">{formatPrice(item.price * item.quantity)}</strong>
                        </div>
                    ))
                ) : (
                    <p className="text-muted text-center py-3 mb-0" style={{ fontSize: "13px" }}>
                        Chọn ít nhất 1 sản phẩm để tiến hành đặt hàng.
                    </p>
                )}
            </div>

            <hr className="my-3 opacity-25" />

            {/* Chiết tính */}
            <div className="d-flex flex-column gap-2 mb-3" style={{ fontSize: "13.5px" }}>
                <div className="d-flex align-items-center justify-content-between text-muted">
                    <span>Tạm tính</span>
                    <strong className="text-dark fw-semibold">{formatPrice(subtotal)}</strong>
                </div>
            </div>

            <hr className="my-3 opacity-25" />

            {/* Tổng tiền */}
            <div className="d-flex align-items-baseline justify-content-between mb-4">
                <div>
                    <span className="fw-semibold text-dark d-block" style={{ fontSize: "14px" }}>Tổng thanh toán</span>
                    <span className="text-muted d-block" style={{ fontSize: "11.5px" }}>Chưa bao gồm phí vận chuyển</span>
                </div>
                <strong className="fw-bold" style={{ fontSize: "21px", color: "var(--color-primary, #e11d48)" }}>
                    {formatPrice(total)}
                </strong>
            </div>

            {/* Nút đặt hàng chuẩn màu thương hiệu Oilia */}
            <Link
                to={ROUTES.CHECKOUT}
                onClick={(e) => {
                    if (isDisabled) {
                        e.preventDefault();
                        return;
                    }
                    saveCheckoutSelection(selectedItems);
                }}
                className={`btn w-100 rounded-pill py-3 fw-bold fs-7 d-inline-flex align-items-center justify-content-center gap-2 shadow-sm text-white transition-all ${
                    isDisabled ? "disabled opacity-50" : ""
                }`}
                style={{
                    backgroundColor: "var(--color-primary, #e11d48)",
                    borderColor: "var(--color-primary, #e11d48)",
                }}
            >
                <span>Mua hàng ({selectedItems.length})</span>
                <FontAwesomeIcon icon={faArrowRight} className="fs-8" />
            </Link>

            <p className="text-center text-muted mb-0 mt-3" style={{ fontSize: "12px" }}>
                Cam kết tinh dầu 100% tự nhiên chính hãng
            </p>
        </aside>
    );
}
