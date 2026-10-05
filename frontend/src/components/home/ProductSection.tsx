import { faArrowRight, faBolt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { HomeProduct } from "../../data/homeData";
import ProductCard from "./ProductCard";

interface ProductSectionProps {
    eyebrow?: string;
    title: string;
    products: HomeProduct[];
    actionLabel: string;
    flashSale?: boolean;
    tabs?: string[];
    compactCards?: boolean;
}

export default function ProductSection({
    eyebrow,
    title,
    products,
    actionLabel,
    flashSale = false,
    tabs,
    compactCards = false,
}: ProductSectionProps) {
    return (
        <section className={`home-section ${flashSale ? "home-flash-section" : ""}`}>
            <div className="home-section-heading d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between">
                <div>
                    {flashSale ? (
                        <div className="home-flash-title d-flex align-items-center flex-wrap">
                            <span className="d-inline-flex align-items-center">
                                <FontAwesomeIcon icon={faBolt} />
                                Flash Sale
                            </span>
                            <div className="home-countdown d-inline-flex align-items-center" aria-label="Thời gian còn lại">
                                <b>02</b>
                                <em>:</em>
                                <b>45</b>
                                <em>:</em>
                                <b className="accent">18</b>
                            </div>
                            <small>| Kết thúc trong hôm nay</small>
                        </div>
                    ) : (
                        <>
                            {eyebrow && <span className="home-eyebrow">{eyebrow}</span>}
                            <h2>{title}</h2>
                        </>
                    )}
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
                    <a className="home-section-action d-inline-flex align-items-center" href="#products">
                        {actionLabel}
                        <FontAwesomeIcon icon={faArrowRight} />
                    </a>
                </div>
            </div>

            <div className="row g-3">
                {products.map((product) => (
                    <div className="col-12 col-sm-6 col-lg-3" key={product.id}>
                        <ProductCard product={product} compact={compactCards} />
                    </div>
                ))}
            </div>
        </section>
    );
}
