import { faArrowRight, faChevronLeft, faChevronRight, faPause, faPlay, faSeedling } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import Carousel from "react-bootstrap/Carousel";
import { Link } from "react-router";
import { ROUTES } from "../../routes/routes";

const HERO_INTERVAL = 5000;
const heroSlides = [
    {
        id: "aromatherapy",
        badge: "Khám phá thế giới hương thơm",
        title: "Liệu Pháp Hương Thơm & Nghệ Thuật Pha Chế Tinh Dầu",
        description: "Tìm hương thơm yêu thích và khám phá các sản phẩm tinh dầu cho không gian sống của bạn.",
        image: "/images/home/aromatherapy-workshop.png",
        imageAlt: "Workshop pha chế tinh dầu",
        actionLabel: "Khám phá sản phẩm",
        actionTo: ROUTES.PRODUCTS,
        secondaryLabel: "Sản phẩm mới về",
        secondaryTo: `${ROUTES.PRODUCTS}?sort=newest`,
    },
    {
        id: "newest",
        badge: "Bộ sưu tập mới nhất",
        title: "Làm Mới Không Gian Với Những Hương Thơm Mới",
        description: "Khám phá tinh dầu và các sản phẩm mới về từ những xưởng cung cấp trên Oilia.",
        image: "/images/home/diffuser-combo.png",
        imageAlt: "Máy khuếch tán và tinh dầu",
        actionLabel: "Xem sản phẩm mới",
        actionTo: `${ROUTES.PRODUCTS}?sort=newest`,
        secondaryLabel: "Tất cả sản phẩm",
        secondaryTo: ROUTES.PRODUCTS,
    },
    {
        id: "bestsellers",
        badge: "Được khách hàng yêu thích",
        title: "Chọn Hương Thơm Cho Bạn & Người Thương",
        description: "Tham khảo các sản phẩm bán chạy để tìm hương thơm phù hợp cho bản thân và người thân yêu.",
        image: "/images/home/relax-gift-box.png",
        imageAlt: "Hộp quà tinh dầu và sản phẩm hương thơm",
        actionLabel: "Xem sản phẩm bán chạy",
        actionTo: `${ROUTES.PRODUCTS}?sort=bestseller`,
        secondaryLabel: "Khám phá sản phẩm",
        secondaryTo: ROUTES.PRODUCTS,
    },
];

export default function HeroBanner() {
    const [isPaused, setIsPaused] = useState(false);

    return (
        <section className="home-hero" aria-label="Banner nổi bật" aria-roledescription="carousel">
            <Carousel
                interval={isPaused ? null : HERO_INTERVAL}
                pause="hover"
                keyboard
                touch
                wrap
                prevLabel="Banner trước"
                nextLabel="Banner tiếp theo"
                prevIcon={<FontAwesomeIcon icon={faChevronLeft} />}
                nextIcon={<FontAwesomeIcon icon={faChevronRight} />}
                indicatorLabels={heroSlides.map((_, index) => `Chuyển đến banner ${index + 1}`)}
            >
                {heroSlides.map((slide, index) => (
                    <Carousel.Item key={slide.id} aria-label={`Banner ${index + 1} / ${heroSlides.length}`}>
                        <div className="home-hero-content d-flex flex-column flex-xl-row align-items-start align-items-xl-center justify-content-between">
                            <div className="home-hero-copy">
                                <span className="home-hero-badge d-inline-flex align-items-center">
                                    <FontAwesomeIcon icon={faSeedling} />
                                    {slide.badge}
                                </span>
                                <h1>{slide.title}</h1>
                                <p>{slide.description}</p>
                                <div className="d-flex align-items-center gap-3 flex-wrap">
                                    <Link className="btn home-primary-btn d-inline-flex align-items-center gap-2 fw-bold" to={slide.actionTo}>
                                        {slide.actionLabel}
                                        <FontAwesomeIcon icon={faArrowRight} />
                                    </Link>
                                    <Link className="home-hero-link d-inline-flex align-items-center" to={slide.secondaryTo}>
                                        {slide.secondaryLabel}
                                        <FontAwesomeIcon icon={faArrowRight} />
                                    </Link>
                                </div>
                            </div>
                            <div className="home-hero-image-wrap">
                                <img className="home-hero-image" src={slide.image} alt={slide.imageAlt} />
                            </div>
                        </div>
                    </Carousel.Item>
                ))}
            </Carousel>
            <button
                className="home-hero-playback"
                type="button"
                aria-label={isPaused ? "Bật tự chuyển banner" : "Tạm dừng tự chuyển banner"}
                aria-pressed={isPaused}
                onClick={() => setIsPaused((paused) => !paused)}
            >
                <FontAwesomeIcon icon={isPaused ? faPlay : faPause} />
            </button>
        </section>
    );
}
