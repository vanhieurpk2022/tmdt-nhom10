import { faCartShopping, faHeart, faPlus, faStar } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { HomeProduct } from "../../data/homeData";

interface ProductCardProps {
    product: HomeProduct;
    compact?: boolean;
}

const currencyFormatter = new Intl.NumberFormat("vi-VN");

function formatPrice(price: number) {
    return `${currencyFormatter.format(price)}đ`;
}

export default function ProductCard({ product, compact = false }: ProductCardProps) {
    return (
        <article className={`home-product-card ${compact ? "home-product-card-compact" : ""}`}>
            <div className="home-product-image-box">
                {product.tag && <span className="home-product-tag">{product.tag}</span>}
                <img src={product.image} alt={product.name} />
            </div>

            <div className="home-product-body">
                <span className="home-product-category">{product.category}</span>
                <h3>{product.name}</h3>
                <p>{product.description}</p>

                <div className="home-product-rating">
                    <FontAwesomeIcon icon={faStar} />
                    <span>{product.rating.toFixed(1)}</span>
                    <span>({product.reviews} đánh giá)</span>
                </div>

                {product.soldPercent && (
                    <div className="home-sale-progress" aria-label={`Đã bán ${product.soldPercent}%`}>
                        <div style={{ width: `${product.soldPercent}%` }} />
                    </div>
                )}

                <div className="home-product-footer">
                    <div>
                        {product.oldPrice && <span className="home-old-price">{formatPrice(product.oldPrice)}</span>}
                        <div className="home-price">
                            {formatPrice(product.price)}
                            <span>/{product.unit}</span>
                        </div>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                        <button className="btn home-icon-btn d-inline-flex align-items-center justify-content-center" type="button" aria-label="Thêm vào yêu thích">
                            <FontAwesomeIcon icon={faHeart} />
                        </button>
                        <button className="btn home-buy-btn d-inline-flex align-items-center gap-2 fw-bold" type="button">
                            <FontAwesomeIcon icon={compact ? faPlus : faCartShopping} />
                            {!compact && "Chọn mua"}
                        </button>
                    </div>
                </div>
            </div>
        </article>
    );
}
