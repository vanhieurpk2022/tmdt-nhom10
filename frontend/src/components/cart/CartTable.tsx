import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { CartItem } from "../../data/cartData";
import QuantityControl from "./QuantityControl";

interface CartTableProps {
    items: CartItem[];
    allSelected: boolean;
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
    onToggleAll,
    onToggleItem,
    onIncrease,
    onDecrease,
    onRemove,
}: CartTableProps) {
    return (
        <div className="cart-table-wrap">
            <div className="cart-table-header">
                <label className="cart-check">
                    <input type="checkbox" checked={allSelected} onChange={onToggleAll} />
                    <span />
                </label>
                <span>Sản phẩm</span>
                <span>Giá</span>
                <span>Số lượng</span>
            </div>

            <div className="cart-table-body">
                {items.map((item) => (
                    <article className="cart-row" key={item.id}>
                        <label className="cart-check">
                            <input type="checkbox" checked={item.selected} onChange={() => onToggleItem(item.id)} />
                            <span />
                        </label>

                        <div className="cart-product-cell">
                            <div className="cart-product-thumb">
                                <img src={item.image} alt={item.name} />
                            </div>
                            <div className="cart-product-info">
                                <h3>{item.name}</h3>
                                <p>
                                    {item.variant} / {item.origin}
                                </p>
                            </div>
                        </div>

                        <strong className="cart-price">{formatPrice(item.price)}</strong>

                        <div className="cart-row-actions">
                            <QuantityControl
                                quantity={item.quantity}
                                onDecrease={() => onDecrease(item.id)}
                                onIncrease={() => onIncrease(item.id)}
                            />
                            <button className="cart-remove-btn" type="button" onClick={() => onRemove(item.id)} aria-label={`Xóa ${item.name}`}>
                                <FontAwesomeIcon icon={faXmark} />
                            </button>
                        </div>
                    </article>
                ))}
            </div>
        </div>
    );
}
