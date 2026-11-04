import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWandMagicSparkles } from "@fortawesome/free-solid-svg-icons";
import {
    FactoryApiService,
    type CustomScentCardItem,
    type CustomScentShowcaseData,
} from "../api/FactoryService";
import { ROUTES } from "../routes/routes";
import "../css/pages/customScent.css";

export default function CustomScentPage() {
    const navigate = useNavigate();

    // Dữ liệu Showcase từ database
    const [showcaseData, setShowcaseData] = useState<CustomScentShowcaseData>({
        topSelling: [],
        userCreations: [],
    });

    // Tải dữ liệu showcase
    useEffect(() => {
        const fetchShowcase = async () => {
            try {
                const data = await FactoryApiService.getCustomScentShowcase();
                setShowcaseData(data);
            } catch (error) {
                console.error("Lỗi khi tải dữ liệu showcase:", error);
            }
        };

        fetchShowcase();
    }, []);

    // Bấm nút "Tùy chỉnh ngay" -> chuyển sang trang Customizer với FORM TRỐNG
    const handleStartNewCustom = () => {
        navigate(ROUTES.CUSTOM_SCENT_CUSTOMIZER);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // Bấm nút "Xem" trên thẻ -> chuyển sang trang Customizer và NẠP THÔNG SỐ từ product_custom
    const handleViewCustomProduct = (card: CustomScentCardItem) => {
        const targetId = card.productCustomId || card.id;
        navigate(`${ROUTES.CUSTOM_SCENT_CUSTOMIZER}?id=${targetId}&customizerid=${targetId}`);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <div className="custom-scent-page py-4 py-lg-5">
            <div className="container px-3 px-lg-4">
                <div className="custom-scent-showcase-container animate-fade-in">
                    {/* Tiêu đề góc trái trên cùng */}
                    <div className="d-flex align-items-center justify-content-between mb-4">
                        <h1 className="showcase-header-title m-0">
                            Sản phẩm tùy chỉnh
                            <span className="title-badge">Bespoke Atelier</span>
                        </h1>
                    </div>

                    {/* Banner */}
                    <div className="custom-scent-hero-banner">
                        <div className="banner-content">
                            <span className="banner-tag">
                                <FontAwesomeIcon icon={faWandMagicSparkles} className="me-2" />
                                Cá nhân hóa mùi hương độc quyền
                            </span>
                            <h2 className="banner-title">
                                Nghệ Thuật Phối Hương Độc Bản
                            </h2>
                            <p className="banner-desc">
                                Tự do chọn lọc từng nốt hương tinh khiết từ các xưởng chưng cất hàng đầu,
                                thiết kế nhãn chai riêng biệt và lưu giữ dấu ấn phong cách của chính bạn.
                            </p>
                        </div>
                    </div>

                    {/* Nút Tùy Chỉnh bên phải dưới Banner */}
                    <div className="custom-action-bar">
                        <button
                            type="button"
                            className="btn-open-customizer"
                            onClick={handleStartNewCustom}
                        >
                            <FontAwesomeIcon icon={faWandMagicSparkles} />
                            Tùy chỉnh ngay
                        </button>
                    </div>

                    {/* Section 1: Top sản phẩm chạy */}
                    <section className="showcase-section">
                        <div className="section-header-box">
                            <h2 className="section-header-title">Top sản phẩm chạy</h2>
                        </div>

                        <div className="cards-showcase-grid">
                            {showcaseData.topSelling.length > 0 ? (
                                showcaseData.topSelling.map((card, idx) => (
                                    <div key={`top-${card.id}-${idx}`} className="custom-card-item">
                                        <div className="card-img-wrapper">
                                            <img
                                                src={card.imageUrl || "/images/home/relax-gift-box.png"}
                                                alt={card.name}
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = "/images/home/relax-gift-box.png";
                                                }}
                                            />
                                        </div>
                                        <div className="card-body-content">
                                            <div className="card-product-name" title={card.name}>
                                                {card.name}
                                            </div>
                                            <div
                                                className="card-ingredients-text"
                                                title={card.ingredientsText}
                                            >
                                                {card.ingredientsText}
                                            </div>
                                            <div className="card-meta-row">
                                                <strong>Xưởng:</strong>
                                                <span className="card-meta-truncate">{card.factoryName}</span>
                                            </div>
                                            <div className="card-price-row">
                                                <span>Giá:</span>
                                                <span>{card.price.toLocaleString("vi-VN")} đ</span>
                                            </div>
                                            <button
                                                type="button"
                                                className="btn-card-view"
                                                onClick={() => handleViewCustomProduct(card)}
                                            >
                                                Xem
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                [1, 2, 3, 4].map((item) => (
                                    <div key={`sample-top-${item}`} className="custom-card-item">
                                        <div className="card-img-wrapper">
                                            <img src="/images/home/relax-gift-box.png" alt="Thiên nhiên gỗ" />
                                        </div>
                                        <div className="card-body-content">
                                            <div className="card-product-name">Thiên nhiên gỗ {item}</div>
                                            <div className="card-ingredients-text">
                                                Tinh dầu Gỗ Đàn Hương, Oải Hương Pháp, Phong Lữ Bourbon...
                                            </div>
                                            <div className="card-meta-row">
                                                <strong>Xưởng:</strong>
                                                <span className="card-meta-truncate">Xưởng Thảo Dược Hoàng Cung</span>
                                            </div>
                                            <div className="card-price-row">
                                                <span>Giá:</span>
                                                <span>{(220000 + item * 15000).toLocaleString("vi-VN")} đ</span>
                                            </div>
                                            <button
                                                type="button"
                                                className="btn-card-view"
                                                onClick={() => navigate(`${ROUTES.CUSTOM_SCENT_CUSTOMIZER}?id=${item}&customizerid=${item}`)}
                                            >
                                                Xem
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>

                    {/* Section 2: Sản phẩm người dùng họ tự tạo có đánh giá nhiều */}
                    <section className="showcase-section">
                        <div className="section-header-box">
                            <h2 className="section-header-title">
                                Sản phẩm người dùng họ tự tạo có đánh giá nhiều
                            </h2>
                        </div>

                        <div className="cards-showcase-grid">
                            {showcaseData.userCreations.length > 0 ? (
                                showcaseData.userCreations.map((card, idx) => (
                                    <div key={`user-${card.id}-${idx}`} className="custom-card-item">
                                        <div className="card-img-wrapper">
                                            <img
                                                src={card.imageUrl || "/images/home/relax-gift-box.png"}
                                                alt={card.name}
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = "/images/home/relax-gift-box.png";
                                                }}
                                            />
                                        </div>
                                        <div className="card-body-content">
                                            <div className="card-product-name" title={card.name}>
                                                {card.name}
                                            </div>
                                            <div
                                                className="card-ingredients-text"
                                                title={card.ingredientsText}
                                            >
                                                {card.ingredientsText}
                                            </div>
                                            <div className="card-meta-row">
                                                <strong>Người dùng:</strong>
                                                <span className="card-meta-truncate">{card.creatorName}</span>
                                            </div>
                                            <div className="card-price-row">
                                                <span>Giá:</span>
                                                <span>{card.price.toLocaleString("vi-VN")} đ</span>
                                            </div>
                                            <button
                                                type="button"
                                                className="btn-card-view"
                                                onClick={() => handleViewCustomProduct(card)}
                                            >
                                                Xem
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                [1, 2, 3, 4].map((item) => (
                                    <div key={`sample-user-${item}`} className="custom-card-item">
                                        <div className="card-img-wrapper">
                                            <img src="/images/home/relax-gift-box.png" alt="Thiên nhiên gỗ" />
                                        </div>
                                        <div className="card-body-content">
                                            <div className="card-product-name">Giấc Mơ Hoa Đêm {item}</div>
                                            <div className="card-ingredients-text">
                                                Tinh dầu Hoa Nhài Tây Bắc, Bưởi Hồng, Ngọc Lan Tây...
                                            </div>
                                            <div className="card-meta-row">
                                                <strong>Người dùng:</strong>
                                                <span className="card-meta-truncate">Bùi Mai Trang</span>
                                            </div>
                                            <div className="card-price-row">
                                                <span>Giá:</span>
                                                <span>{(195000 + item * 20000).toLocaleString("vi-VN")} đ</span>
                                            </div>
                                            <button
                                                type="button"
                                                className="btn-card-view"
                                                onClick={() => navigate(`${ROUTES.CUSTOM_SCENT_CUSTOMIZER}?id=${item}&customizerid=${item}`)}
                                            >
                                                Xem
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
