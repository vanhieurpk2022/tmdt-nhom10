import { faCartShopping, faLeaf } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router";
import type { ProductCard } from "../../api/ProductService";
import { ROUTES } from "../../routes/routes";
import CatalogProductCard from "./CatalogProductCard";

interface ProductRecommendationsProps {
    kind: "similar" | "bought-together";
    products: ProductCard[];
    loading: boolean;
}

export default function ProductRecommendations({ kind, products, loading }: ProductRecommendationsProps) {
    if (!loading && products.length === 0) return null;

    const isSimilar = kind === "similar";
    const title = isSimilar ? "Sản phẩm tương tự" : "Thường mua kèm";

    return (
        <section className="product-recommendations" aria-labelledby={`recommendations-${kind}`}>
            <header className="recommendations-heading">
                <h2 id={`recommendations-${kind}`}>
                    <FontAwesomeIcon icon={isSimilar ? faLeaf : faCartShopping} />
                    {title}
                </h2>
                {isSimilar && <Link to={ROUTES.PRODUCTS}>Xem tất cả <span aria-hidden="true">→</span></Link>}
            </header>

            {loading ? (
                <p className="recommendations-loading" role="status">Đang tải gợi ý...</p>
            ) : (
                <div className="recommendations-grid">
                    {products.map((product) => (
                        <CatalogProductCard key={product.id} product={product} />
                    ))}
                </div>
            )}
        </section>
    );
}
