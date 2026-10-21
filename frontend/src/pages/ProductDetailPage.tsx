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
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useLayoutEffect, useState } from "react";
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
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [quantity, setQuantity] = useState(1);
    const [selectedVariant, setSelectedVariant] = useState<ProductMilItem | null>(null);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
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

    // Tải thông tin chi tiết sản phẩm và danh sách sản phẩm gợi ý
    useEffect(() => {
        let isMounted = true;
        setLoading(true);
        setError(null);

        Promise.all([
            productService.getProductDetail(productId),
            productService.getNewestProducts(4),
        ])
            .then(([detailData, relatedData]) => {
                if (!isMounted) return;
                setProduct(detailData);
                setRelatedProducts(relatedData.filter((p) => p.id !== Number(productId)).slice(0, 4));
                if (detailData.variants && detailData.variants.length > 0) {
                    setSelectedVariant(detailData.variants.find((v) => v.isActive && v.stockQuantity > 0) ?? detailData.variants[0]);
                } else {
                    setSelectedVariant(null);
                }
                setQuantity(1);
                setSelectedImageIndex(0);
            })
            .catch((err) => {
                if (!isMounted) return;
                console.error("Lỗi khi tải chi tiết sản phẩm:", err);
                setError("Không thể tải thông tin sản phẩm. Vui lòng thử lại sau.");
            })
            .finally(() => {
                if (isMounted) setLoading(false);
            });

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
        <main className="product-detail-page bg-light py-4">
            <div className="container-fluid px-4 px-lg-5">
                {/* Thanh điều hướng breadcrumb */}
                <nav aria-label="breadcrumb" className="mb-4">
                    <ol className="breadcrumb mb-0 fs-7">
                        <li className="breadcrumb-item">
                            <Link to={ROUTES.HOME} className="text-muted text-decoration-none">
                                Trang chủ
                            </Link>
                        </li>
                        <li className="breadcrumb-item">
                            <button
                                type="button"
                                onClick={() => {
                                    if (window.history.length > 1) {
                                        navigate(-1);
                                    } else {
                                        navigate(ROUTES.PRODUCTS);
                                    }
                                }}
                                className="btn btn-link text-muted text-decoration-none p-0 border-0 fs-7 align-baseline"
                            >
                                {product.categoryName || "Sản phẩm"}
                            </button>
                        </li>
                        <li className="breadcrumb-item active fw-bold text-dark text-truncate" aria-current="page" style={{ maxWidth: "300px" }}>
                            {product.name}
                        </li>
                    </ol>
                </nav>

                <div className="bg-white rounded-4 shadow-sm p-4 mb-5">
                    <div className="row g-5">
                        {/* Thư viện hình ảnh sản phẩm */}
                        <div className="col-12 col-lg-5">
                            <div className="mb-3 rounded-4 overflow-hidden border bg-light d-flex align-items-center justify-content-center">
                                <img
                                    src={currentImage}
                                    alt={product.name}
                                    className="w-100 object-fit-cover"
                                    style={{ height: "450px" }}
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
                                    }}
                                />
                            </div>

                            {images.length > 1 && (
                                <div className="d-flex align-items-center gap-2">
                                    <button
                                        className="btn btn-sm btn-light border rounded-circle flex-shrink-0 d-flex justify-content-center align-items-center"
                                        style={{ width: "32px", height: "32px" }}
                                        onClick={() =>
                                            setSelectedImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))
                                        }
                                    >
                                        <FontAwesomeIcon icon={faChevronLeft} className="text-muted" />
                                    </button>

                                    <div
                                        className="d-flex gap-3 justify-content-center overflow-auto pb-2 gallery-thumbnails flex-grow-1"
                                        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                                    >
                                        {images.map((img, idx) => (
                                            <div
                                                key={idx}
                                                className={`rounded-3 border overflow-hidden flex-shrink-0 cursor-pointer ${
                                                    selectedImageIndex === idx ? "border-primary border-2 shadow-sm" : "opacity-75 hover-opacity-100"
                                                }`}
                                                style={{ width: "80px", height: "80px" }}
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
                                            </div>
                                        ))}
                                    </div>

                                    <button
                                        className="btn btn-sm btn-light border rounded-circle flex-shrink-0 d-flex justify-content-center align-items-center"
                                        style={{ width: "32px", height: "32px" }}
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
                        <div className="col-12 col-lg-7 d-flex flex-column">
                            <div className="d-flex align-items-center gap-3 mb-2 fs-7 flex-wrap">
                                {product.factoryName && (
                                    <span className="badge text-success bg-success bg-opacity-10 rounded-pill px-3 py-1 fw-bold border border-success border-opacity-25">
                                        <FontAwesomeIcon icon={faLeaf} className="me-1" /> {product.factoryName}
                                    </span>
                                )}
                                <span className="text-muted fw-bold">MÃ SP: #{product.id.toString().padStart(5, "0")}</span>
                                {product.categoryName && (
                                    <span className="badge bg-secondary bg-opacity-10 text-secondary rounded-pill px-3 py-1">
                                        {product.categoryName}
                                    </span>
                                )}
                            </div>

                            <div className="d-flex justify-content-between align-items-start mb-3">
                                <h1 className="h2 fw-bold text-dark mb-0">{product.name}</h1>
                                <button
                                    className="btn btn-light bg-light rounded-circle shadow-sm d-flex align-items-center justify-content-center text-muted fav-btn ms-3 flex-shrink-0 border-0"
                                    style={{ width: "42px", height: "42px" }}
                                    title="Thêm vào yêu thích"
                                >
                                    <FontAwesomeIcon icon={faHeart} className="fs-5" />
                                </button>
                            </div>

                            <div className="d-flex align-items-center gap-2 mb-3">
                                <div className="d-flex text-warning fs-7 gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <FontAwesomeIcon
                                            key={star}
                                            icon={faStar}
                                            className={star <= Math.round(product.avgRating) ? "text-warning" : "text-muted opacity-25"}
                                        />
                                    ))}
                                </div>
                                <span className="fw-bold text-dark fs-7">{product.avgRating.toFixed(1)}</span>
                                <span className="text-muted fs-7">
                                    • ({product.reviewCount} đánh giá • Đã bán {product.totalSold >= 1000 ? `${(product.totalSold / 1000).toFixed(1)}k+` : product.totalSold} • {(product.views ?? 0).toLocaleString("vi-VN")} lượt xem)
                                </span>
                            </div>

                            <p className="text-muted mb-4 fs-6 lh-lg">
                                {product.description || "Sản phẩm tinh dầu thiên nhiên cao cấp, chiết xuất nguyên chất đem lại hương thơm dịu mát và thư giãn tối đa."}
                            </p>

                            {/* Khung hiển thị giá và tình trạng tồn kho */}
                            <div className="bg-light rounded-4 p-4 mb-4 d-flex align-items-center justify-content-between border flex-wrap gap-3">
                                <div className="d-flex align-items-center gap-3 flex-wrap">
                                    <span className="fs-2 fw-black text-dark lh-1">
                                        {currentPrice.toLocaleString("vi-VN")}đ
                                    </span>
                                    {selectedVariant && (
                                        <span className="text-muted fs-6">/ {selectedVariant.mil}ml</span>
                                    )}
                                </div>
                                <span className={`badge rounded-pill px-3 py-2 fw-bold fs-7 ${
                                    isOutOfStock
                                        ? "text-danger bg-danger bg-opacity-10 border border-danger border-opacity-25"
                                        : "text-success bg-success bg-opacity-10 border border-success border-opacity-25"
                                }`}>
                                    <div className="d-flex align-items-center gap-2">
                                        <div className={`stock-dot rounded-circle ${isOutOfStock ? "bg-danger" : "bg-success"}`}></div>
                                        {isOutOfStock ? "Hết hàng" : product.stockStatus}
                                    </div>
                                </span>
                            </div>

                            {/* Bộ chọn dung tích (variants) */}
                            {product.variants && product.variants.length > 0 && (
                                <div className="mb-4">
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <span className="fw-bold text-dark">Dung tích khả dụng</span>
                                        {selectedVariant && (
                                            <span className="text-muted fs-7 fw-bold text-uppercase">
                                                Đã chọn: {selectedVariant.mil}ml ({selectedVariant.stockQuantity > 0 ? `Còn ${selectedVariant.stockQuantity}` : "Hết hàng"})
                                            </span>
                                        )}
                                    </div>
                                    <div className="row g-3">
                                        {product.variants.map((v) => {
                                            const isSelected = selectedVariant?.id === v.id;

                                            return (
                                                <div className="col-4" key={v.id}>
                                                    <div
                                                        className={`variant-box rounded-3 p-3 border cursor-pointer transition-all position-relative ${
                                                            isSelected
                                                                ? "border-primary bg-primary bg-opacity-10 shadow-sm"
                                                                : "bg-white hover-border-primary"
                                                        }`}
                                                        onClick={() => { setSelectedVariant(v); setQuantity(1); }}
                                                    >
                                                        <div className={`fw-bold mb-1 ${isSelected ? "text-primary" : "text-dark"}`}>
                                                            {v.mil}ml
                                                        </div>
                                                        <div className={`fs-7 ${isSelected ? "text-primary fw-bold" : "text-muted"}`}>
                                                            {(v.price ?? 0).toLocaleString("vi-VN")}đ
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Bộ chọn số lượng và nút thao tác thêm giỏ / mua ngay */}
                            <div className="row g-3 mb-4 mt-auto">
                                <div className="col-12 col-xl-3">
                                    <div className="d-flex align-items-center justify-content-between border rounded-3 px-3 py-2 bg-white h-100">
                                        <button
                                            className="btn btn-link text-muted p-0 text-decoration-none"
                                            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                                            disabled={quantity <= 1 || isOutOfStock}
                                        >
                                            <FontAwesomeIcon icon={faMinus} />
                                        </button>
                                        <span className="fw-bold">{quantity}</span>
                                        <button
                                            className="btn btn-link text-muted p-0 text-decoration-none"
                                            onClick={() => setQuantity((q) => q + 1)}
                                            disabled={isOutOfStock || quantity >= currentStock}
                                        >
                                            <FontAwesomeIcon icon={faPlus} />
                                        </button>
                                    </div>
                                </div>
                                <div className="col-6 col-xl-4">
                                    <button
                                        className="btn btn-outline-primary w-100 fw-bold h-100 d-flex align-items-center justify-content-center gap-2 py-3 bg-white"
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
                                </div>
                                <div className="col-6 col-xl-5">
                                    <button
                                        className="btn btn-primary w-100 fw-bold h-100 d-flex align-items-center justify-content-center gap-2 py-3"
                                        onClick={handleBuyNow}
                                        disabled={authLoading || isAddingToCart || isOutOfStock || quantity > currentStock}
                                    >
                                        <FontAwesomeIcon icon={faBolt} />
                                        Mua ngay
                                    </button>
                                </div>
                            </div>

                            <div className="d-flex justify-content-between border-top pt-4 px-2 flex-wrap gap-2">
                                <div className="d-flex align-items-center gap-2 text-success fw-bold fs-7">
                                    <FontAwesomeIcon icon={faLeaf} /> 100% Tự nhiên
                                </div>
                                <div className="d-flex align-items-center gap-2 text-danger fw-bold fs-7">
                                    <FontAwesomeIcon icon={faShieldHalved} /> Đổi trả 15 ngày
                                </div>
                                <div className="d-flex align-items-center gap-2 text-primary fw-bold fs-7">
                                    <FontAwesomeIcon icon={faTruckFast} /> Giao hỏa tốc 2H
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Các khối thông tin mở rộng (Accordion) */}
                    <div className="mt-5 border-top pt-4">
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

                {/* Danh sách sản phẩm gợi ý liên quan */}
                {relatedProducts.length > 0 && (
                    <>
                        <div className="d-flex justify-content-between align-items-end mb-4">
                            <h3 className="fw-black mb-0">Gợi ý sản phẩm nổi bật</h3>
                            <Link to={ROUTES.PRODUCTS} className="text-primary text-decoration-none fw-bold fs-7 hover-underline">
                                Xem tất cả sản phẩm &rarr;
                            </Link>
                        </div>

                        <div className="row row-cols-1 row-cols-md-2 row-cols-xl-4 g-4 mb-4">
                            {relatedProducts.map((relProduct) => (
                                <div className="col" key={relProduct.id}>
                                    <div className="card h-100 product-card border-0 shadow-sm rounded-4 overflow-hidden">
                                        <div className="position-relative">
                                            <Link to={`${ROUTES.PRODUCT_DETAIL}/${relProduct.id}`}>
                                                <img
                                                    src={relProduct.thumbnailUrl || FALLBACK_IMAGE}
                                                    className="card-img-top product-img"
                                                    alt={relProduct.name}
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
                                                    }}
                                                />
                                            </Link>
                                            <button className="btn btn-light bg-white rounded-circle position-absolute top-0 end-0 m-3 p-2 shadow-sm d-flex align-items-center justify-content-center text-muted fav-btn">
                                                <FontAwesomeIcon icon={faHeart} />
                                            </button>
                                        </div>
                                        <div className="card-body p-4 d-flex flex-column">
                                            <div className="d-flex align-items-center gap-1 mb-2">
                                                <FontAwesomeIcon icon={faStar} className="text-warning fs-7" />
                                                <span className="fw-bold fs-7">{relProduct.avgRating.toFixed(1)}</span>
                                                <span className="text-muted fs-7">({relProduct.totalSold}+ đã bán)</span>
                                            </div>
                                            <h5 className="card-title fs-6 fw-bold mb-1 product-title">
                                                <Link to={`${ROUTES.PRODUCT_DETAIL}/${relProduct.id}`} className="text-dark text-decoration-none">
                                                    {relProduct.name}
                                                </Link>
                                            </h5>
                                            <p className="card-text text-muted fs-7 mb-3 product-desc">{relProduct.description}</p>

                                            <div className="mt-auto">
                                                {relProduct.factoryName && (
                                                    <div className="d-flex align-items-center gap-2 mb-3 text-success fs-7 fw-bold">
                                                        <FontAwesomeIcon icon={faLeaf} />
                                                        <span>{relProduct.factoryName}</span>
                                                    </div>
                                                )}

                                                <div className="d-flex justify-content-between align-items-end mb-1">
                                                    <span className="fs-5 fw-bold text-dark">
                                                        {(relProduct.price ?? 0).toLocaleString("vi-VN")}đ
                                                    </span>
                                                    <span className="badge rounded-pill fw-normal px-2 py-1 stock-green">
                                                        {relProduct.stockStatus}
                                                    </span>
                                                </div>

                                                <div className="row g-2 mt-2">
                                                    <div className="col-12">
                                                        <Link
                                                            to={`${ROUTES.PRODUCT_DETAIL}/${relProduct.id}`}
                                                            className="btn btn-outline-primary w-100 fw-bold bg-white text-primary"
                                                        >
                                                            Xem chi tiết
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </main>
    );
}
