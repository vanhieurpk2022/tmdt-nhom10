import BrandCommitment from "../components/home/BrandCommitment";
import HeroBanner from "../components/home/HeroBanner";
import ProductSection from "../components/home/ProductSection";
import PromoBanners from "../components/home/PromoBanners";
import SearchSuggestions from "../components/home/SearchSuggestions";
import { bestSellerProducts, flashSaleProducts, newestProducts } from "../data/homeData";

export default function HomePage() {
    return (
        <main className="home-page">
            <SearchSuggestions />
            <div className="container-fluid px-4 px-lg-5 home-page-content d-flex flex-column">
                <HeroBanner />
                <ProductSection
                    title="Flash Sale"
                    products={flashSaleProducts}
                    actionLabel="Xem tất cả ưu đãi"
                    flashSale
                />
                <ProductSection
                    eyebrow="Bộ sưu tập mới nhất"
                    title="Sản Phẩm Mới Về"
                    products={newestProducts}
                    actionLabel="Xem tất cả sản phẩm mới"
                    compactCards
                />
                <ProductSection
                    eyebrow="Được yêu thích nhất"
                    title="Top Sản Phẩm Bán Chạy"
                    products={bestSellerProducts}
                    actionLabel="Xem bảng xếp hạng"
                    tabs={["Thư giãn", "Kháng khuẩn", "Tập trung"]}
                />
                <PromoBanners />
                <BrandCommitment />
            </div>
        </main>
    );
}
