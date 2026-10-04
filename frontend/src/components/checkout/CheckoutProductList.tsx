import type { CartItem } from "../../data/cartData";
import CheckoutSectionTitle from "./CheckoutSectionTitle";

interface CheckoutProductListProps {
    items: CartItem[];
}

const currencyFormatter = new Intl.NumberFormat("vi-VN");

function formatPrice(price: number) {
    return `${currencyFormatter.format(price)}đ`;
}

export default function CheckoutProductList({ items }: CheckoutProductListProps) {
    return (
        <section className="checkout-block">
            <CheckoutSectionTitle
                index={1}
                title="Danh sách sản phẩm thanh toán"
                action={<span className="checkout-muted-count">{items.length} sản phẩm</span>}
            />

            <div className="checkout-product-list">
                {items.map((item) => (
                    <article className="checkout-product-row" key={item.id}>
                        <div className="checkout-product-thumb">
                            <img src={item.image} alt={item.name} />
                        </div>
                        <div className="checkout-product-main">
                            <div className="d-flex align-items-center gap-2 flex-wrap">
                                <h3>{item.name}</h3>
                                <span>Còn hàng</span>
                            </div>
                            <p>{item.variant} • {item.origin}</p>
                            <p>Xưởng: {item.factoryName} • #{item.factoryCode}</p>
                            <p>Số lượng: {item.quantity}</p>
                        </div>
                        <strong>{formatPrice(item.price * item.quantity)}</strong>
                    </article>
                ))}
            </div>
        </section>
    );
}
