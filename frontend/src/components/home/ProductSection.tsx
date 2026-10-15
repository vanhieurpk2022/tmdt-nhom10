import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router";
import type { HomeProduct } from "../../data/homeData";
import ProductCard from "./ProductCard";

interface ProductSectionProps {
    eyebrow?: string;
    title: string;
    products: HomeProduct[];
    actionLabel: string;
    actionTo: string;
    tabs?: string[];
    isLoading?: boolean;
    errorMessage?: string;
    addingProductIds?: number[];
    onAddToCart?: (product: HomeProduct) => void;
}

export default function ProductSection({
    eyebrow,
    title,
    products,
    actionLabel,
    actionTo,
    tabs,
    isLoading = false,
    errorMessage,
    addingProductIds = [],
    onAddToCart,
}: ProductSectionProps) {
    return (
        <section className="home-section">
            <div className="home-section-heading d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between">
                <div>
                    {eyebrow && <span className="home-eyebrow">{eyebrow}</span>}
                    <h2>{title}</h2>
                </div>

                <div className="d-flex align-items-center gap-3 flex-wrap justify-content-end">
                    {tabs && (
                        <div className="home-section-tabs d-flex">
                            {tabs.map((tab, index) => (
                                <button className={index === 0 ? "active" : ""} type="button" key={tab}>
                                    {tab}
                                </button>
                            ))}
                        </div>
                    )}
                    <Link className="home-section-action d-inline-flex align-items-center" to={actionTo}>
                        {actionLabel}
                        <FontAwesomeIcon icon={faArrowRight} />
                    </Link>
                </div>
            </div>

            {errorMessage && <div className="alert alert-light border home-section-alert mb-3">{errorMessage}</div>}

            <div className="row g-3">
                {isLoading
                    ? Array.from({ length: 4 }).map((_, index) => (
                          <div className="col-12 col-sm-6 col-lg-3" key={`home-product-loading-${index}`}>
                              <div className="home-product-card home-product-card-placeholder">
                                  <div className="placeholder-glow">
                                      <div className="home-product-image-box placeholder w-100" />
                                      <div className="home-product-body d-flex flex-column">
                                          <span className="placeholder col-5" />
                                          <span className="placeholder col-9" />
                                          <span className="placeholder col-12" />
                                          <span className="placeholder col-7" />
                                      </div>
                                  </div>
                              </div>
                          </div>
                      ))
                    : products.map((product) => (
                          <div className="col-12 col-sm-6 col-lg-3" key={product.id}>
                              <ProductCard
                                  product={product}
                                  isAdding={addingProductIds.includes(product.id)}
                                  onAddToCart={onAddToCart}
                              />
                          </div>
                      ))}
            </div>
        </section>
    );
}
