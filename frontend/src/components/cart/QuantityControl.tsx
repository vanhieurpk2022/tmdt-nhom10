interface QuantityControlProps {
    quantity: number;
    onDecrease: () => void;
    onIncrease: () => void;
}

export default function QuantityControl({ quantity, onDecrease, onIncrease }: QuantityControlProps) {
    return (
        <div className="cart-quantity-control" aria-label="Điều chỉnh số lượng">
            <button type="button" onClick={onIncrease} aria-label="Tăng số lượng">
                +
            </button>
            <span>{quantity}</span>
            <button type="button" onClick={onDecrease} aria-label="Giảm số lượng">
                -
            </button>
        </div>
    );
}
