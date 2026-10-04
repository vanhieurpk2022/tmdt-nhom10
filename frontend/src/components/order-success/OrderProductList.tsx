import type { CartItem } from "../../data/cartData";

interface OrderProductListProps {
    items: CartItem[];
}

const currencyFormatter = new Intl.NumberFormat("vi-VN");

function formatPrice(price: number) {
    return `${currencyFormatter.format(price)}đ`;
}

export default function OrderProductList({ items }: OrderProductListProps) {
    return (
        <section className="order-success-card">
            <div className="order-success-section-heading">
                <h2>Sản phẩm đã đặt</h2>
                <span>{items.length} sản phẩm</span>
            </div>

            <div className="order-success-product-list">
                {items.map((item) => (
                    <article className="order-success-product-row" key={item.id}>
                        <img src={item.image} alt={item.name} />
                        <div>
                            <h3>{item.name}</h3>
                            <p>{item.variant} / {item.origin}</p>
                            <p>Xưởng: {item.factoryName} • #{item.factoryCode}</p>
                        </div>
                        <strong>{formatPrice(item.price * item.quantity)}</strong>
                    </article>
                ))}
            </div>
        </section>
    );
}
