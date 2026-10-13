interface QuantityControlProps {
    quantity: number;
    onDecrease: () => void;
    onIncrease: () => void;
    disabled?: boolean;
}

export default function QuantityControl({ quantity, onDecrease, onIncrease, disabled = false }: QuantityControlProps) {
    return (
        <div className="cart-quantity-control" aria-label="Điều chỉnh số lượng">
            <button type="button" onClick={onIncrease} aria-label="Tăng số lượng" disabled={disabled}>
                +
            </button>
            <span>{quantity}</span>
            <button type="button" onClick={onDecrease} aria-label="Giảm số lượng" disabled={disabled || quantity <= 1}>
                -
            </button>
        </div>
    );
}
