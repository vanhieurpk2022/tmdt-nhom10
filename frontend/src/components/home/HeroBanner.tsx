import { faArrowRight, faCalendarDays, faSeedling } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function HeroBanner() {
    return (
        <section className="home-hero">
            <div className="home-hero-content">
                <div className="home-hero-copy">
                    <span className="home-hero-badge">
                        <FontAwesomeIcon icon={faSeedling} />
                        Workshop miễn phí mỗi tuần
                    </span>
                    <h1>Liệu Pháp Hương Thơm & Nghệ Thuật Pha Chế Tinh Dầu</h1>
                    <p>
                        Khám phá 24 công thức cân bằng cảm xúc từ thảo mộc hữu cơ nguyên chất
                        dưới sự hướng dẫn từ các chuyên gia Aromatherapy hàng đầu.
                    </p>
                    <div className="d-flex align-items-center gap-3 flex-wrap">
                        <button className="btn home-primary-btn" type="button">
                            Tham gia ngay
                            <FontAwesomeIcon icon={faArrowRight} />
                        </button>
                        <a className="home-hero-link" href="#workshop">
                            Xem lịch workshop
                            <FontAwesomeIcon icon={faCalendarDays} />
                        </a>
                    </div>
                </div>
                <div className="home-hero-image-wrap">
                    <img
                        className="home-hero-image"
                        src="/images/home/aromatherapy-workshop.png"
                        alt="Workshop pha chế tinh dầu"
                    />
                </div>
            </div>
            <div className="home-hero-dots" aria-hidden="true">
                <span className="active" />
                <span />
                <span />
            </div>
        </section>
    );
}
