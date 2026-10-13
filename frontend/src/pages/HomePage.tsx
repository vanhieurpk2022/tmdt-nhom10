import { useEffect, useState } from "react";
import { productService } from "../api/ProductService";
import type { ProductCard as ApiProductCard } from "../api/ProductService";
import BrandCommitment from "../components/home/BrandCommitment";
import HeroBanner from "../components/home/HeroBanner";
import ProductSection from "../components/home/ProductSection";
import PromoBanners from "../components/home/PromoBanners";
import SearchSuggestions from "../components/home/SearchSuggestions";
import type { HomeProduct } from "../data/homeData";
import { bestSellerProducts, flashSaleProducts, newestProducts } from "../data/homeData";

const HOME_PRODUCT_LIMIT = 4;
const fallbackProductImages = [
    "/images/home/lavender-france.png",
    "/images/home/tea-tree-australia.png",
    "/images/home/grapefruit-cold-pressed.png",
    "/images/home/jasmine-sambac.png",
];

function toHomeProduct(product: ApiProductCard, index: number, tag: string): HomeProduct {
    const price = product.price ?? product.basePrice ?? 0;
    const oldPrice = product.basePrice && product.basePrice > price ? product.basePrice : undefined;
    const totalSold = Math.max(product.totalSold ?? 0, 0);

    return {
        id: product.id,
        name: product.name,
        category: product.factoryName || "Oilia Essential",
        description: product.description || "Sản phẩm tinh dầu được tuyển chọn cho không gian sống thư giãn.",
        image: product.thumbnailUrl || fallbackProductImages[index % fallbackProductImages.length],
        price,
        oldPrice,
        unit: "chai",
        rating: product.avgRating || 4.8,
        reviews: totalSold,
        metricLabel: totalSold > 0 ? `${totalSold}+ đã bán` : "Đang cập nhật",
        tag,
    };
}

export default function HomePage() {
    const [homeNewestProducts, setHomeNewestProducts] = useState<HomeProduct[]>(newestProducts);
    const [homeBestSellerProducts, setHomeBestSellerProducts] = useState<HomeProduct[]>(bestSellerProducts);
    const [isLoadingHomeProducts, setIsLoadingHomeProducts] = useState(true);
    const [homeProductError, setHomeProductError] = useState("");

    useEffect(() => {
        let isMounted = true;

        async function loadHomeProducts() {
            try {
                setIsLoadingHomeProducts(true);
                setHomeProductError("");

                const [newestResult, bestSellerResult] = await Promise.all([
                    productService.getNewestProducts(HOME_PRODUCT_LIMIT),
                    productService.getBestSellerProducts(HOME_PRODUCT_LIMIT),
                ]);

                if (!isMounted) return;

                setHomeNewestProducts(
                    newestResult.length > 0
                        ? newestResult.map((product, index) => toHomeProduct(product, index, "Mới"))
                        : newestProducts
                );
                setHomeBestSellerProducts(
                    bestSellerResult.length > 0
                        ? bestSellerResult.map((product, index) => toHomeProduct(product, index, "Bán chạy"))
                        : bestSellerProducts
                );
            } catch (error) {
                console.error(error);
                if (!isMounted) return;

                setHomeNewestProducts(newestProducts);
                setHomeBestSellerProducts(bestSellerProducts);
                setHomeProductError("Chưa tải được dữ liệu mới từ backend, đang hiển thị dữ liệu mẫu.");
            } finally {
                if (isMounted) {
                    setIsLoadingHomeProducts(false);
                }
            }
        }

        loadHomeProducts();

        return () => {
            isMounted = false;
        };
    }, []);

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
                    products={homeNewestProducts}
                    actionLabel="Xem tất cả sản phẩm mới"
                    compactCards
                    isLoading={isLoadingHomeProducts}
                    errorMessage={homeProductError}
                />
                <ProductSection
                    eyebrow="Được yêu thích nhất"
                    title="Top Sản Phẩm Bán Chạy"
                    products={homeBestSellerProducts}
                    actionLabel="Xem bảng xếp hạng"
                    tabs={["Thư giãn", "Kháng khuẩn", "Tập trung"]}
                    isLoading={isLoadingHomeProducts}
                />
                <PromoBanners />
                <BrandCommitment />
            </div>
        </main>
    );
}
