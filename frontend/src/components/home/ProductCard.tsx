import { faCartShopping, faHeart, faStar } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router";
import type { HomeProduct } from "../../data/homeData";
import { ROUTES } from "../../routes/routes";

interface ProductCardProps {
    product: HomeProduct;
    isAdding?: boolean;
    onAddToCart?: (product: HomeProduct) => void;
}

const currencyFormatter = new Intl.NumberFormat("vi-VN");
const fallbackImage = "/images/home/lavender-france.png";

function formatPrice(price: number) {
    return `${currencyFormatter.format(price)}đ`;
}

export default function ProductCard({ product, isAdding = false, onAddToCart }: ProductCardProps) {
    const productDetailUrl = `${ROUTES.PRODUCT_DETAIL}/${product.id}`;

    return (
        <article className="home-product-card">
            <div className="home-product-image-box">
                {product.tag && <span className="home-product-tag">{product.tag}</span>}
                <Link to={productDetailUrl} className="d-block w-100 h-100">
                    <img
                        src={product.image}
                        alt={product.name}
                        onError={(event) => {
                            event.currentTarget.src = fallbackImage;
                        }}
                    />
                </Link>
            </div>

            <div className="home-product-body d-flex flex-column">
                <span className="home-product-category">{product.category}</span>
                <h3>
                    <Link to={productDetailUrl} className="text-decoration-none text-dark hover-primary">
                        {product.name}
                    </Link>
                </h3>
                <p>{product.description}</p>

                <div className="home-product-rating d-flex align-items-center flex-wrap">
                    <FontAwesomeIcon icon={faStar} />
                    <span>{product.rating.toFixed(1)}</span>
                    <span>({product.metricLabel ?? `${product.reviews} đánh giá`})</span>
                </div>

                {product.soldPercent && (
                    <div className="home-sale-progress" aria-label={`Đã bán ${product.soldPercent}%`}>
                        <div style={{ width: `${product.soldPercent}%` }} />
                    </div>
                )}

                <div className="home-product-footer d-flex align-items-center justify-content-between">
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
                        <button
                            className="btn home-buy-btn d-inline-flex align-items-center gap-2 fw-bold"
                            type="button"
                            onClick={() => onAddToCart?.(product)}
                            disabled={isAdding}
                        >
                            <FontAwesomeIcon icon={faCartShopping} />
                            {isAdding ? "Đang thêm" : "Chọn mua"}
                        </button>
                    </div>
                </div>
            </div>
        </article>
    );
}
