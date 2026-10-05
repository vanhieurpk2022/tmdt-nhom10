import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { promoBanners } from "../../data/homeData";

export default function PromoBanners() {
    return (
        <section className="home-promo-grid" aria-label="Ưu đãi nổi bật">
            {promoBanners.map((banner) => (
                <article className="home-promo-card" key={banner.title}>
                    <img src={banner.image} alt={banner.title} />
                    <div className="home-promo-overlay d-flex flex-column justify-content-end">
                        <span className={`home-promo-eyebrow ${banner.accent}`}>{banner.eyebrow}</span>
                        <h3>{banner.title}</h3>
                        <p>{banner.description}</p>
                        <button className="btn home-promo-btn d-inline-flex align-items-center gap-2 fw-bold" type="button">
                            {banner.actionLabel}
                            <FontAwesomeIcon icon={faArrowRight} />
                        </button>
                    </div>
                </article>
            ))}
        </section>
    );
}
