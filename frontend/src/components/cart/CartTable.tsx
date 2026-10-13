import { faIndustry, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { fallbackCartImage, type CartItem } from "../../data/cartData";
import QuantityControl from "./QuantityControl";

interface CartTableProps {
    items: CartItem[];
    allSelected: boolean;
    isLoading?: boolean;
    updatingItemIds?: number[];
    onToggleAll: () => void;
    onToggleItem: (id: number) => void;
    onIncrease: (id: number) => void;
    onDecrease: (id: number) => void;
    onRemove: (id: number) => void;
}

const currencyFormatter = new Intl.NumberFormat("vi-VN");

function formatPrice(price: number) {
    return `${currencyFormatter.format(price)}đ`;
}

export default function CartTable({
    items,
    allSelected,
    isLoading = false,
    updatingItemIds = [],
    onToggleAll,
    onToggleItem,
    onIncrease,
    onDecrease,
    onRemove,
}: CartTableProps) {
    return (
        <div className="cart-table-wrap">
            <div className="cart-table-header">
                <label className="cart-check d-inline-flex align-items-center justify-content-center">
                    <input type="checkbox" checked={allSelected} onChange={onToggleAll} disabled={isLoading || items.length === 0} />
                    <span />
                </label>
                <span>Sản phẩm</span>
                <span>Giá</span>
                <span>Số lượng</span>
            </div>

            <div className="cart-table-body">
                {isLoading && (
                    <div className="cart-empty-state">
                        <div className="spinner-border spinner-border-sm text-danger" role="status" aria-hidden="true" />
                        <span>Đang tải giỏ hàng...</span>
                    </div>
                )}

                {!isLoading && items.length === 0 && (
                    <div className="cart-empty-state">
                        <strong>Giỏ hàng của bạn đang trống</strong>
                        <span>Hãy chọn sản phẩm yêu thích để bắt đầu đặt hàng.</span>
                    </div>
                )}

                {!isLoading && items.map((item) => {
                    const isUpdating = updatingItemIds.includes(item.id);

                    return (
                    <article className={`cart-row ${isUpdating ? "cart-row-updating" : ""}`} key={item.id}>
                        <label className="cart-check d-inline-flex align-items-center justify-content-center">
                            <input type="checkbox" checked={item.selected} onChange={() => onToggleItem(item.id)} disabled={isUpdating} />
                            <span />
                        </label>

                        <div className="cart-product-cell d-flex align-items-center">
                            <div className="cart-product-thumb">
                                <img
                                    src={item.image}
                                    alt={item.name}
                                    onError={(event) => {
                                        event.currentTarget.src = fallbackCartImage;
                                    }}
                                />
                            </div>
                            <div className="cart-product-info">
                                <div className="cart-product-title-line d-flex align-items-center flex-wrap">
                                    <h3>{item.name}</h3>
                                    <span className={`cart-stock-badge ${item.inStock ? "" : "cart-stock-badge-empty"}`}>
                                        {item.stockStatus ?? (item.inStock ? "Còn hàng" : "Hết hàng")}
                                    </span>
                                </div>
                                <p>
                                    {item.variant} / {item.origin}
                                </p>
                                <span className="cart-factory-pill d-inline-flex align-items-center">
                                    <FontAwesomeIcon icon={faIndustry} />
                                    Xưởng: {item.factoryName} • #{item.factoryCode}
                                </span>
                            </div>
                        </div>

                        <strong className="cart-price">{formatPrice(item.price)}</strong>

                        <div className="cart-row-actions d-flex align-items-center">
                            <QuantityControl
                                quantity={item.quantity}
                                onDecrease={() => onDecrease(item.id)}
                                onIncrease={() => onIncrease(item.id)}
                                disabled={isUpdating || !item.inStock}
                            />
                            <button
                                className="cart-remove-btn"
                                type="button"
                                onClick={() => onRemove(item.id)}
                                aria-label={`Xóa ${item.name}`}
                                disabled={isUpdating}
                            >
                                <FontAwesomeIcon icon={faXmark} />
                            </button>
                        </div>
                    </article>
                    );
                })}
            </div>
        </div>
    );
}
