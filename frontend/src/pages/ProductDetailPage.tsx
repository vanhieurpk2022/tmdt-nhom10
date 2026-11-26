import { faHeart } from "@fortawesome/free-regular-svg-icons";
import {
    faStar,
    faLeaf,
    faShieldHalved,
    faTruckFast,
    faMinus,
    faPlus,
    faCartShopping,
    faBolt,
    faChevronLeft,
    faChevronRight,
    faSpinner,
    faComments,
    faCheck,
    faMagnifyingGlassPlus,
    faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useParams, useSearchParams } from "react-router";
import { useAuth } from "../api/AuthContext";
import { getBuyNowUrl, getPurchaseErrorMessage } from "../api/CheckoutSelection";
import { useCart } from "../api/CartContext";
import { cartService } from "../api/CartService";
import {
    productService,
    type ProductCard,
    type ProductDetail,
    type ProductMilItem,
} from "../api/ProductService";
import { ROUTES } from "../routes/routes";
import Breadcrumb from "../components/layout/Breadcrumb";
import ProductRecommendations from "../components/product/ProductRecommendations";
import "../css/pages/product-detail.css";

const FALLBACK_IMAGE = "/images/home/grapefruit-cold-pressed.png";

export default function ProductDetailPage() {
    const { id: paramId } = useParams<{ id: string }>();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { user, loading: authLoading } = useAuth();
    const { applyCart, showCartNotice } = useCart();

    const productId = paramId || searchParams.get("id") || "1";

    const [product, setProduct] = useState<ProductDetail | null>(null);
    const [relatedProducts, setRelatedProducts] = useState<ProductCard[]>([]);
    const [boughtTogetherProducts, setBoughtTogetherProducts] = useState<ProductCard[]>([]);
    const [loading, setLoading] = useState(true);
    const [recommendationsLoading, setRecommendationsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [quantity, setQuantity] = useState(1);
    const [selectedVariant, setSelectedVariant] = useState<ProductMilItem | null>(null);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const imageDialogRef = useRef<HTMLDialogElement>(null);
    const [isAddingToCart, setIsAddingToCart] = useState(false);

    const [expandedAccordion, setExpandedAccordion] = useState<Record<string, boolean>>({
        ingredients: true,
        origin: true,
        usage: true,
        reviews: true,
    });

    const toggleAccordion = (id: string) => {
        setExpandedAccordion((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    // Đưa trang lên đầu trước khi hiển thị sản phẩm vừa mở.
    useLayoutEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }, [productId]);

    // Tải thông tin chi tiết trước; sản phẩm gợi ý được tải nền để không chặn nội dung chính.
    useEffect(() => {
        let isMounted = true;
        setLoading(true);
        setError(null);
        setRelatedProducts([]);
        setBoughtTogetherProducts([]);
        setRecommendationsLoading(true);

        const loadProduct = async () => {
            try {
                const detailData = await productService.getProductDetail(productId);
                if (!isMounted) return;

                setProduct(detailData);
                if (detailData.variants && detailData.variants.length > 0) {
                    setSelectedVariant(detailData.variants.find((v) => v.isActive && v.stockQuantity > 0) ?? detailData.variants[0]);
                } else {
                    setSelectedVariant(null);
                }
                setQuantity(1);
                setSelectedImageIndex(0);
                setLoading(false);

                // Hai nguồn độc lập; không dùng sản phẩm mới nhất để thay cho kết quả thuật toán.
                const [similarResult, boughtResult] = await Promise.allSettled([
                    productService.getSimilarProducts(productId, 4),
                    productService.getBoughtTogetherProducts(productId, 4),
                ]);
                if (!isMounted) return;

                setRelatedProducts(similarResult.status === "fulfilled"
                    ? similarResult.value.filter((item) => item.id !== Number(productId)).slice(0, 4)
                    : []);
                setBoughtTogetherProducts(boughtResult.status === "fulfilled"
                    ? boughtResult.value.filter((item) => item.id !== Number(productId)).slice(0, 4)
                    : []);
                setRecommendationsLoading(false);
            } catch (err) {
                if (!isMounted) return;
                console.error("Lỗi khi tải chi tiết sản phẩm:", err);
                setError("Không thể tải thông tin sản phẩm. Vui lòng thử lại sau.");
                setLoading(false);
            }
        };

        void loadProduct();

        return () => {
            isMounted = false;
        };
    }, [productId]);

    const handleAddToCart = async () => {
        if (!product) return;
        if (!user) {
            navigate(ROUTES.LOGIN, { state: { from: location } });
            return;
        }
        try {
            setIsAddingToCart(true);
            const updatedCart = await cartService.addItem({
                productId: product.id,
                productMilId: selectedVariant?.id,
                quantity,
            });
            applyCart(updatedCart);
            showCartNotice(`Đã thêm ${quantity} x ${product.name} vào giỏ hàng.`);
        } catch (err) {
            console.error(err);
            showCartNotice(getPurchaseErrorMessage(err, "Chưa thêm được sản phẩm vào giỏ hàng."), "error");
        } finally {
            setIsAddingToCart(false);
        }
    };

    const handleBuyNow = () => {
        if (!product) return;
        const checkoutUrl = getBuyNowUrl({ productId: product.id, productMilId: selectedVariant?.id, quantity });
        if (!user) {
            navigate(ROUTES.LOGIN, { state: { from: checkoutUrl } });
            return;
        }
        navigate(checkoutUrl);
    };

    if (loading) {
        return (
            <main className="product-detail-page bg-light py-5">
                <div className="container py-5 text-center">
                    <FontAwesomeIcon icon={faSpinner} spin className="fs-1 text-primary mb-3" />
                    <p className="text-muted fw-bold">Đang tải thông tin sản phẩm...</p>
                </div>
            </main>
        );
    }

    if (error || !product) {
        return (
            <main className="product-detail-page bg-light py-5">
                <div className="container py-5 text-center">
                    <div className="bg-white rounded-4 shadow-sm p-5 max-w-md mx-auto" style={{ maxWidth: "500px" }}>
                        <h4 className="fw-bold text-danger mb-3">Thông báo</h4>
                        <p className="text-muted mb-4">{error || "Không tìm thấy sản phẩm yêu cầu."}</p>
                        <Link to={ROUTES.PRODUCTS} className="btn btn-primary px-4 py-2 fw-bold">
                            Quay lại danh sách sản phẩm
                        </Link>
                    </div>
                </div>
            </main>
        );
    }

    const images = product.imageUrls && product.imageUrls.length > 0
        ? product.imageUrls
        : [FALLBACK_IMAGE];

    const currentImage = images[selectedImageIndex] || images[0] || FALLBACK_IMAGE;

    const currentPrice = selectedVariant?.price ?? 0;

    const currentStock = selectedVariant ? selectedVariant.stockQuantity : product.totalStock;
    const isOutOfStock = currentStock <= 0 || !selectedVariant?.isActive;

    return (
        <main className="product-detail-page">
            <div className="product-detail-container">
                <Breadcrumb items={[
                    { label: "Trang chủ", to: ROUTES.HOME },
                    { label: product.categoryName || "Sản phẩm", onClick: () => {
                        if (window.history.length > 1) navigate(-1);
                        else navigate(ROUTES.PRODUCTS);
                    } },
                    { label: product.name },
                ]} />

                <div className="product-detail-card">
                    <div className="product-detail-main">
                        {/* Thư viện hình ảnh sản phẩm */}
                        <div className="product-detail-gallery">
                            <button
                                type="button"
                                className="product-detail-image-frame"
                                aria-label={`Phóng to ảnh ${product.name}`}
                                aria-haspopup="dialog"
                                onClick={() => imageDialogRef.current?.showModal()}
                            >
                                <img
                                    src={currentImage}
                                    alt={product.name}
                                    className="product-detail-main-image"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
                                    }}
                                />
                                <span className="product-detail-image-zoom">
                                    <FontAwesomeIcon icon={faMagnifyingGlassPlus} /> Xem ảnh lớn
                                </span>
                            </button>

                            <dialog
                                ref={imageDialogRef}
                                className="product-detail-image-dialog"
                                aria-label={`Ảnh phóng to: ${product.name}`}
                                onClick={(event) => {
                                    if (event.target === event.currentTarget) event.currentTarget.close();
                                }}
                            >
                                <button
                                    type="button"
                                    className="product-detail-image-close"
                                    aria-label="Đóng ảnh phóng to"
                                    onClick={() => imageDialogRef.current?.close()}
                                >
                                    <FontAwesomeIcon icon={faXmark} />
                                </button>
                                <img
                                    src={currentImage}
                                    alt={product.name}
                                    onError={(event) => {
                                        if (!event.currentTarget.src.endsWith(FALLBACK_IMAGE)) {
                                            event.currentTarget.src = FALLBACK_IMAGE;
                                        }
                                    }}
                                />
                            </dialog>

                            {images.length > 1 && (
                                <div className="product-detail-gallery-controls">
                                    <button
                                        type="button"
                                        className="product-detail-gallery-arrow"
                                        aria-label="Ảnh trước"
                                        onClick={() =>
                                            setSelectedImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))
                                        }
                                    >
                                        <FontAwesomeIcon icon={faChevronLeft} className="text-muted" />
                                    </button>

                                    <div className="gallery-thumbnails">
                                        {images.map((img, idx) => (
                                            <button
                                                key={idx}
                                                type="button"
                                                className={`product-detail-thumbnail${selectedImageIndex === idx ? " is-selected" : ""}`}
                                                aria-label={`Xem ảnh ${idx + 1} của ${product.name}`}
                                                aria-pressed={selectedImageIndex === idx}
                                                onClick={() => setSelectedImageIndex(idx)}
                                            >
                                                <img
                                                    src={img}
                                                    className="w-100 h-100 object-fit-cover"
                                                    alt={`Thumbnail ${idx + 1}`}
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
                                                    }}
                                                />
                                            </button>
                                        ))}
                                    </div>

                                    <button
                                        type="button"
                                        className="product-detail-gallery-arrow"
                                        aria-label="Ảnh tiếp theo"
                                        onClick={() =>
                                            setSelectedImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))
                                        }
                                    >
                                        <FontAwesomeIcon icon={faChevronRight} className="text-muted" />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Thông tin chi tiết sản phẩm */}
                        <div className="product-detail-information">
                            <div className="product-detail-heading">
                                <h1 className="product-detail-title fw-bold text-dark mb-0">{product.name}</h1>
                                <button
                                    className="btn product-detail-favorite rounded-circle d-flex align-items-center justify-content-center text-muted flex-shrink-0"
                                    title="Thêm vào yêu thích"
                                    aria-label="Thêm vào yêu thích"
                                >
                                    <FontAwesomeIcon icon={faHeart} />
                                </button>
                            </div>

                            <div className="product-detail-rating">
                                <div className="d-flex text-warning gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <FontAwesomeIcon
                                            key={star}
                                            icon={faStar}
                                            className={star <= Math.round(product.avgRating) ? "text-warning" : "text-muted opacity-25"}
                                        />
                                    ))}
                                </div>
                                <span className="fw-bold text-dark">{product.avgRating.toFixed(1)}</span>
                                <span className="text-muted">
                                    · {product.reviewCount} đánh giá · {(product.views ?? 0).toLocaleString("vi-VN")} lượt xem
                                </span>
                            </div>

                            <p className="product-detail-description">
                                {product.description || "Sản phẩm tinh dầu thiên nhiên cao cấp, chiết xuất nguyên chất đem lại hương thơm dịu mát và thư giãn tối đa."}
                            </p>

                            {product.factoryName && (
                                <div className="product-detail-factory">
                                    <FontAwesomeIcon icon={faLeaf} />
                                    <span>{product.factoryName}</span>
                                </div>
                            )}

                            {/* Khung hiển thị giá và tình trạng tồn kho */}
                            <div className="product-detail-price-row">
                                <div className="product-detail-current-price">
                                    <strong>
                                        {currentPrice.toLocaleString("vi-VN")}đ
                                    </strong>
                                    {selectedVariant && (
                                        <span>/ {selectedVariant.mil}ml</span>
                                    )}
                                </div>
                                <span className={`product-detail-stock ${
                                    isOutOfStock
                                        ? "is-unavailable"
                                        : "is-available"
                                }`}>
                                    {isOutOfStock ? "Hết hàng" : currentStock <= 10 ? "Sắp hết" : "Còn hàng"}
                                </span>
                            </div>

                            {/* Bộ chọn dung tích (variants) */}
                            {product.variants && product.variants.length > 0 && (
                                <div className="product-detail-variants">
                                    <div className="product-detail-variant-heading">
                                        <span>Dung tích</span>
                                        {selectedVariant && (
                                            <small>{selectedVariant.stockQuantity > 0 ? `Còn ${selectedVariant.stockQuantity} sản phẩm` : "Hết hàng"}</small>
                                        )}
                                    </div>
                                    <div className="product-detail-variant-options">
                                        {product.variants.map((v) => {
                                            const isSelected = selectedVariant?.id === v.id;

                                            return (
                                                <button
                                                    key={v.id}
                                                    type="button"
                                                    className={`variant-box${isSelected ? " is-selected" : ""}`}
                                                    aria-pressed={isSelected}
                                                    onClick={() => { setSelectedVariant(v); setQuantity(1); }}
                                                    disabled={!v.isActive || v.stockQuantity <= 0}
                                                >
                                                    <strong>
                                                        {v.mil}ml
                                                    </strong>
                                                    <span>
                                                        {(v.price ?? 0).toLocaleString("vi-VN")}đ
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Bộ chọn số lượng và nút thao tác thêm giỏ / mua ngay */}
                            <div className="product-detail-actions">
                                <div className="product-detail-quantity" role="group" aria-label="Số lượng sản phẩm">
                                    <button
                                        type="button"
                                        aria-label="Giảm số lượng"
                                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                                        disabled={quantity <= 1 || isOutOfStock}
                                    >
                                        <FontAwesomeIcon icon={faMinus} />
                                    </button>
                                    <span className="fw-bold">{quantity}</span>
                                    <button
                                        type="button"
                                        aria-label="Tăng số lượng"
                                        onClick={() => setQuantity((q) => q + 1)}
                                        disabled={isOutOfStock || quantity >= currentStock}
                                    >
                                        <FontAwesomeIcon icon={faPlus} />
                                    </button>
                                </div>
                                <button
                                    type="button"
                                    className="btn btn-outline-primary"
                                    onClick={handleAddToCart}
                                    disabled={authLoading || isAddingToCart || isOutOfStock || quantity > currentStock}
                                >
                                    {isAddingToCart ? (
                                        <FontAwesomeIcon icon={faSpinner} spin />
                                    ) : (
                                        <FontAwesomeIcon icon={faCartShopping} />
                                    )}
                                    Thêm vào giỏ
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={handleBuyNow}
                                    disabled={authLoading || isAddingToCart || isOutOfStock || quantity > currentStock}
                                >
                                    <FontAwesomeIcon icon={faBolt} />
                                    Mua ngay
                                </button>
                            </div>

                            <div className="product-detail-benefits">
                                <div>
                                    <FontAwesomeIcon icon={faLeaf} /> 100% Tự nhiên
                                </div>
                                <div>
                                    <FontAwesomeIcon icon={faShieldHalved} /> Đổi trả 15 ngày
                                </div>
                                <div>
                                    <FontAwesomeIcon icon={faTruckFast} /> Giao hỏa tốc 2H
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Các khối thông tin mở rộng (Accordion) */}
                    <div className="product-detail-sections">
                        <div className="accordion custom-accordion" id="productAccordion">
                            <div className="accordion-item border-0 border-bottom mb-2">
                                <h2 className="accordion-header">
                                    <button
                                        className={`accordion-button fw-bold bg-transparent px-0 ${
                                            !expandedAccordion["ingredients"] ? "collapsed" : ""
                                        }`}
                                        type="button"
                                        onClick={() => toggleAccordion("ingredients")}
                                    >
                                        <FontAwesomeIcon icon={faLeaf} className="text-primary me-2" /> Mô tả & Đặc tính sản phẩm
                                    </button>
                                </h2>
                                <div className={`accordion-collapse collapse ${expandedAccordion["ingredients"] ? "show" : ""}`}>
                                    <div className="accordion-body px-0 pt-2 pb-4 text-muted fs-7">
                                        <p className="mb-2">{product.description}</p>
                                        <div className="d-flex align-items-center gap-2 text-dark">
                                            <FontAwesomeIcon icon={faCheck} className="text-success" />
                                            <span>Danh mục: {product.categoryName || "Tinh dầu thiên nhiên"}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="accordion-item border-0 border-bottom mb-2">
                                <h2 className="accordion-header">
                                    <button
                                        className={`accordion-button fw-bold bg-transparent px-0 ${
                                            !expandedAccordion["origin"] ? "collapsed" : ""
                                        }`}
                                        type="button"
                                        onClick={() => toggleAccordion("origin")}
                                    >
                                        <FontAwesomeIcon icon={faLeaf} className="text-success me-2" /> Nhà sản xuất & Nguồn gốc
                                    </button>
                                </h2>
                                <div className={`accordion-collapse collapse ${expandedAccordion["origin"] ? "show" : ""}`}>
                                    <div className="accordion-body px-0 pt-2 pb-4 text-muted fs-7">
                                        <div className="mb-1">
                                            <strong className="text-dark">Nhà xưởng:</strong> {product.factoryName || "Xưởng thảo mộc hữu cơ"}
                                        </div>
                                        {product.factoryAddress && (
                                            <div>
                                                <strong className="text-dark">Địa chỉ:</strong> {product.factoryAddress}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="accordion-item border-0 border-bottom mb-2">
                                <h2 className="accordion-header">
                                    <button
                                        className={`accordion-button fw-bold bg-transparent px-0 ${
                                            !expandedAccordion["usage"] ? "collapsed" : ""
                                        }`}
                                        type="button"
                                        onClick={() => toggleAccordion("usage")}
                                    >
                                        <FontAwesomeIcon icon={faStar} className="text-warning me-2" /> Hướng dẫn sử dụng & Bảo quản
                                    </button>
                                </h2>
                                <div className={`accordion-collapse collapse ${expandedAccordion["usage"] ? "show" : ""}`}>
                                    <div className="accordion-body px-0 pt-2 pb-4 text-muted fs-7">
                                        Khuếch tán bằng máy xông (3-5 giọt), nhỏ 2 giọt vào bồn tắm nước ấm, hoặc pha loãng với dầu nền massage thư giãn. Bảo quản nơi khô ráo, tránh ánh nắng trực tiếp.
                                    </div>
                                </div>
                            </div>

                            {/* Khối đánh giá từ người mua */}
                            <div className="accordion-item border-0">
                                <h2 className="accordion-header">
                                    <button
                                        className={`accordion-button fw-bold bg-transparent px-0 ${
                                            !expandedAccordion["reviews"] ? "collapsed" : ""
                                        }`}
                                        type="button"
                                        onClick={() => toggleAccordion("reviews")}
                                    >
                                        <FontAwesomeIcon icon={faComments} className="text-primary me-2" /> Đánh giá từ khách hàng ({product.reviews.length})
                                    </button>
                                </h2>
                                <div className={`accordion-collapse collapse ${expandedAccordion["reviews"] ? "show" : ""}`}>
                                    <div className="accordion-body px-0 pt-2 pb-4">
                                        {product.reviews.length === 0 ? (
                                            <p className="text-muted fs-7 mb-0">Chưa có đánh giá nào cho sản phẩm này. Hãy là người đầu tiên trải nghiệm và chia sẻ cảm nhận!</p>
                                        ) : (
                                            <div className="d-flex flex-column gap-3">
                                                {product.reviews.map((rev) => (
                                                    <div key={rev.id} className="p-3 rounded-3 bg-light border">
                                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                                            <span className="fw-bold text-dark">{rev.reviewerName}</span>
                                                            <div className="d-flex text-warning fs-8 gap-1">
                                                                {[1, 2, 3, 4, 5].map((s) => (
                                                                    <FontAwesomeIcon
                                                                        key={s}
                                                                        icon={faStar}
                                                                        className={s <= rev.rating ? "text-warning" : "text-muted opacity-25"}
                                                                    />
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <p className="text-muted fs-7 mb-1">{rev.comment}</p>
                                                        {rev.createdAt && (
                                                            <small className="text-muted" style={{ fontSize: "0.75rem" }}>
                                                                {new Date(rev.createdAt).toLocaleDateString("vi-VN")}
                                                            </small>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <ProductRecommendations
                    kind="bought-together"
                    products={boughtTogetherProducts}
                    loading={recommendationsLoading}
                />
                <ProductRecommendations
                    kind="similar"
                    products={relatedProducts}
                    loading={recommendationsLoading}
                />
            </div>
        </main>
    );
}
