import { faHeart } from "@fortawesome/free-regular-svg-icons";
import { faBagShopping, faLeaf, faSpinner, faStar } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useAuth } from "../../api/AuthContext";
import { useFavorites } from "../../api/FavoriteContext";
import { useCart } from "../../api/CartContext";
import { cartService } from "../../api/CartService";
import { getBuyNowUrl, getPurchaseErrorMessage } from "../../api/CheckoutSelection";
import type { ProductCard } from "../../api/ProductService";
import { ROUTES } from "../../routes/routes";
import "../../css/components/catalog-product-card.css";

const FALLBACK_IMAGE = "/images/home/lavender-france.png";

export default function CatalogProductCard({ product }: { product: ProductCard }) {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, loading: authLoading } = useAuth();
    const { applyCart, showCartNotice } = useCart();
    const [adding, setAdding] = useState(false);
    const favorites = useFavorites();
    const isFavorite = favorites.products.some(p => p.id === product.id);

    const detailUrl = `${ROUTES.PRODUCT_DETAIL}/${product.id}`;
    const unavailable = authLoading || adding || product.stockStatus === "Hết hàng";
    const stockClass = product.stockStatus === "Còn hàng" ? "stock-green"
        : product.stockStatus === "Sắp hết" ? "stock-yellow" : "stock-red";

    const addToCart = async () => {
        if (!user) {
            navigate(ROUTES.LOGIN, { state: { from: location } });
            return;
        }
        if (adding) return;
        setAdding(true);
        try {
            const cart = await cartService.addItem({ productId: product.id, quantity: 1 });
            applyCart(cart);
            showCartNotice(`Đã thêm ${product.name} vào giỏ hàng.`);
        } catch (error) {
            showCartNotice(getPurchaseErrorMessage(error, "Chưa thêm được sản phẩm vào giỏ hàng."), "error");
        } finally {
            setAdding(false);
        }
    };

    const buyNow = () => {
        const checkoutUrl = getBuyNowUrl({ productId: product.id, quantity: 1 });
        if (!user) {
            navigate(ROUTES.LOGIN, { state: { from: checkoutUrl } });
            return;
        }
        navigate(checkoutUrl);
    };

    return (
        <article className="catalog-product-card">
            <div className="product-image-wrap">
                <Link to={detailUrl}>
                    <img
                        src={product.thumbnailUrl || FALLBACK_IMAGE}
                        className="product-img"
                        alt={product.name}
                        loading="lazy"
                        decoding="async"
                        onError={(event) => {
                            if (!event.currentTarget.src.endsWith(FALLBACK_IMAGE)) {
                                event.currentTarget.src = FALLBACK_IMAGE;
                            }
                        }}
                    />
                </Link>
                <button type="button" className={`fav-btn ${isFavorite ? 'text-danger' : ''}`} aria-pressed={isFavorite}
                    onClick={() => { void favorites.toggle(product.id); }} aria-label={`Yêu thích ${product.name}`}>
                    <FontAwesomeIcon icon={faHeart} />
                </button>
            </div>
            <div className="product-card-body">
                {favorites.error && <small role="alert" className="text-danger">{favorites.error}</small>}
                <h3 className="product-title"><Link to={detailUrl}>{product.name}</Link></h3>
                {product.factoryName && (
                    <div className="product-factory">
                        <FontAwesomeIcon icon={faLeaf} className="text-success" />
                        <span>{product.factoryName}</span>
                    </div>
                )}
                <div className="product-rating">
                    <FontAwesomeIcon icon={faStar} className="text-warning" />
                    <strong>{product.avgRating.toFixed(1)}</strong>
                    <span>· Đã bán {product.totalSold.toLocaleString("vi-VN")}</span>
                </div>
                <div className="product-card-bottom">
                    <div className="product-price-row">
                        <span className="product-price">{product.price > 0 ? `${product.price.toLocaleString("vi-VN")}đ` : "Liên hệ"}</span>
                        <span className={`product-stock ${stockClass}`}>{product.stockStatus}</span>
                    </div>
                    <div className="product-card-actions">
                        <button
                            type="button"
                            className="btn btn-outline-primary btn-add-cart"
                            aria-label={`Thêm ${product.name} vào giỏ hàng`}
                            onClick={addToCart}
                            disabled={unavailable}
                        >
                            <FontAwesomeIcon icon={adding ? faSpinner : faBagShopping} spin={adding} />
                            <span>Thêm giỏ</span>
                        </button>
                        <button type="button" className="btn btn-primary btn-buy-now" onClick={buyNow} disabled={unavailable}>
                            Mua ngay
                        </button>
                    </div>
                </div>
            </div>
        </article>
    );
}
