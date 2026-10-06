import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart } from "@fortawesome/free-solid-svg-icons"; 
import { faStar, faLeaf, faBagShopping, faWandMagicSparkles, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import AccountLayout from "../components/layout/AccountLayout";

const FAVORITE_PRODUCTS = [
    {
        id: 1,
        name: "Tinh Dầu Sả Chanh Lemongrass Ấn Độ",
        desc: "Thanh lọc không khí, xua đuổi côn trùng và...",
        origin: "Xưởng Thảo Dược Mysore (Ấn Độ)",
        price: 145000,
        oldPrice: 180000,
        discount: "-19%",
        rating: 4.9,
        sold: "1.8k+",
        stock: "Còn hàng",
        image: "/images/home/tea-tree-australia.png",
    },
    {
        id: 2,
        name: "Tinh Dầu Bạc Hà Tươi Peppermint",
        desc: "Giúp tập trung tinh thần, sảng khoái tức thì",
        origin: "Xưởng Thảo Mộc Hưng Yên",
        price: 160000,
        oldPrice: 200000,
        discount: "-20%",
        rating: 5.0,
        sold: "920+",
        stock: "Còn hàng",
        image: "/images/home/deep-sleep-blend.png",
    },
    {
        id: 3,
        name: "Tinh Dầu Tràm Gió Huế Nguyên Chất",
        desc: "Giữ ấm cơ thể, bảo vệ hô hấp an toàn cho mẹ",
        origin: "Xưởng Chưng Cất Cố Đô Huế",
        price: 125000,
        oldPrice: 150000,
        discount: "-16%",
        rating: 4.9,
        sold: "2.4k+",
        stock: "Sắp hết",
        image: "/images/home/grapefruit-cold-pressed.png",
    },
    {
        id: 4,
        name: "Tinh Dầu Vỏ Quế Ấm Nồng Yên Bái",
        desc: "Khử mùi không gian ẩm mốc, tạo hơi ấm thư...",
        origin: "Xưởng Quế Rừng Văn Yên (Yên Bái)",
        price: 155000,
        oldPrice: 195000,
        discount: "-20%",
        rating: 4.8,
        sold: "1.1k+",
        stock: "Còn hàng",
        image: "/images/home/natural-wax-candle.png",
    },
    {
        id: 5,
        name: "Tinh Dầu Lavender Oải Hương",
        desc: "Vỗ về giấc ngủ sâu, xua tan căng thẳng mệt...",
        origin: "Hợp Tác Xã Thảo Mộc Provence (Pháp)",
        price: 220000,
        oldPrice: 260000,
        discount: "-15%",
        rating: 5.0,
        sold: "3.2k+",
        stock: "Còn hàng",
        image: "/images/home/lavender-france.png",
    },
    {
        id: 6,
        name: "Tinh Dầu Trầm Hương Khánh Hoà",
        desc: "Nốt hương thiền định, tĩnh tâm và trừ tà khí",
        origin: "Xưởng Kỳ Nam Vạn Giã (Khánh Hoà)",
        price: 480000,
        oldPrice: 550000,
        discount: "-13%",
        rating: 5.0,
        sold: "450+",
        stock: "Hết hàng",
        image: "/images/home/jasmine-sambac.png",
    },
    {
        id: 7,
        name: "Tinh Dầu Cam Ngọt Organic Hoà Bình",
        desc: "Hương thơm thanh ngọt, đánh thức năng...",
        origin: "Nông Trại Hữu Cơ Cao Phong (Hoà Bình)",
        price: 135000,
        oldPrice: 170000,
        discount: "-21%",
        rating: 4.9,
        sold: "1.5k+",
        stock: "Còn hàng",
        image: "/images/home/ylang-ylang.png",
    },
    {
        id: 8,
        name: "Tinh Dầu Gỗ Hồng Dalbergia Kontum",
        desc: "Hương gỗ nồng ấm quyện hoa hồng, cân...",
        origin: "Vùng Dược Liệu Rừng Gỗ Kon Tum",
        price: 320000,
        oldPrice: 390000,
        discount: "-18%",
        rating: 5.0,
        sold: "680+",
        stock: "Còn hàng",
        image: "/images/home/relax-gift-box.png",
    }
];

export default function FavoriteProductsPage() {
    return (
        <AccountLayout breadcrumbCurrent="Sản phẩm yêu thích">
            <div className="bg-white rounded-4 shadow-sm p-4 px-lg-5 pb-lg-5 pt-lg-4">
                <div className="mb-4">
                    <div className="d-flex align-items-center mb-2 gap-3 flex-wrap">
                        <h1 className="h3 fw-bold text-dark mb-0">Danh Sách Sản Phẩm Yêu Thích</h1>
                        <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 px-3 py-2 rounded-pill fw-bold">8 sản phẩm</span>
                    </div>
                    <p className="text-muted fs-7 mb-0">Lưu trữ các nốt hương và tinh dầu thủ công bạn quan tâm</p>
                </div>

                {FAVORITE_PRODUCTS.length > 0 ? (
                    <>
                        <div className="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-4 mb-5">
                            {FAVORITE_PRODUCTS.map((product) => (
                                <div className="col" key={product.id}>
                                    <div className="card h-100 product-card border shadow-sm rounded-4 overflow-hidden position-relative hover-shadow-lg transition-all bg-white">
                                        <div className="position-relative">
                                            <img src={product.image} className="card-img-top product-img" alt={product.name} style={{ height: "200px", objectFit: "cover" }} />
                                            <button className="btn btn-light bg-white rounded-circle position-absolute top-0 end-0 m-3 p-2 shadow-sm d-flex align-items-center justify-content-center text-danger fav-btn" style={{ width: "36px", height: "36px", zIndex: 2 }} title="Bỏ yêu thích">
                                                <FontAwesomeIcon icon={faHeart} />
                                            </button>
                                            
                                            {product.stock === 'Hết hàng' && (
                                                <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-flex align-items-center justify-content-center z-1">
                                                    <span className="badge bg-white text-dark rounded-pill px-4 py-2 fs-6 fw-bold shadow-sm">Tạm hết hàng</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="card-body p-3 p-xl-4 d-flex flex-column">
                                            <div className="d-flex align-items-center gap-1 mb-2">
                                                <FontAwesomeIcon icon={faStar} className="text-warning fs-7" />
                                                <span className="fw-bold fs-7">{product.rating.toFixed(1)}</span>
                                                <span className="text-muted fs-7">({product.sold} đã bán)</span>
                                            </div>
                                            <h5 className="card-title fs-6 fw-bold mb-1 product-title text-truncate">{product.name}</h5>
                                            <p className="card-text text-muted fs-7 mb-3 product-desc text-truncate">{product.desc}</p>

                                            <div className="mt-auto">
                                                <div className="d-flex align-items-center gap-2 mb-3 text-muted fs-7 text-truncate">
                                                    <FontAwesomeIcon icon={faLeaf} className="text-success" />
                                                    <span>{product.origin}</span>
                                                </div>

                                                <div className="d-flex justify-content-between align-items-end mb-1">
                                                    <span className="fs-5 fw-bold text-dark">{product.price.toLocaleString("vi-VN")}đ</span>
                                                    <span className={`badge rounded-pill fw-normal px-2 py-1 d-flex align-items-center gap-1 ${product.stock === 'Còn hàng' ? 'bg-success bg-opacity-10 text-success' : product.stock === 'Sắp hết' ? 'bg-warning bg-opacity-10 text-warning' : 'bg-danger bg-opacity-10 text-danger'}`}>
                                                        <span className={`rounded-circle ${product.stock === 'Còn hàng' ? 'bg-success' : product.stock === 'Sắp hết' ? 'bg-warning' : 'bg-danger'}`} style={{width: '6px', height: '6px'}}></span>
                                                        {product.stock}
                                                    </span>
                                                </div>
                                                <div className="d-flex align-items-center gap-2 mb-4">
                                                    <span className="text-muted text-decoration-line-through fs-7">{product.oldPrice.toLocaleString("vi-VN")}đ</span>
                                                    <span className="badge bg-danger bg-opacity-10 text-danger fs-8 fw-bold">{product.discount}</span>
                                                </div>

                                                <div className="row g-2">
                                                    <div className="col-12 col-xl-6">
                                                        <button className="btn btn-light w-100 fw-bold d-flex align-items-center justify-content-center gap-2 text-nowrap" style={{ backgroundColor: "#f0f4f8", color: "#2b4c65", padding: "0.5rem" }} disabled={product.stock === 'Hết hàng'}>
                                                            <FontAwesomeIcon icon={faBagShopping} />
                                                            <span className="d-xl-none d-xxl-inline">Thêm giỏ</span>
                                                        </button>
                                                    </div>
                                                    <div className="col-12 col-xl-6">
                                                        <button className="btn btn-danger w-100 fw-bold text-nowrap" style={{ backgroundColor: "#ea2b4f", borderColor: "#ea2b4f", padding: "0.5rem" }} disabled={product.stock === 'Hết hàng'}>
                                                            Mua ngay
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Bottom Banner */}
                        <div className="rounded-4 p-4 mb-2 d-flex flex-column flex-xxl-row align-items-xxl-center justify-content-between gap-4" style={{ backgroundColor: "#f8f9fa" }}>
                            <div className="d-flex align-items-center gap-3 gap-xl-4">
                                <div className="bg-danger text-white rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 shadow-sm" style={{ width: "50px", height: "50px", backgroundColor: "#ea2b4f" }}>
                                    <FontAwesomeIcon icon={faWandMagicSparkles} className="fs-4" />
                                </div>
                                <div>
                                    <h4 className="fw-bold text-dark mb-1 fs-5">Chưa tìm thấy nốt hương hoàn hảo cho riêng bạn?</h4>
                                    <p className="text-muted fs-7 mb-0">Khởi tạo trắc nghiệm khứu giác cá nhân hoá AI Fragrance Quiz chỉ trong 60 giây để định hình mùi hương phù hợp thể trạng.</p>
                                </div>
                            </div>
                            <button className="btn btn-dark fw-bold px-4 py-2 rounded-3 text-nowrap d-flex align-items-center gap-2 flex-shrink-0" style={{ backgroundColor: "#0f172a" }}>
                                Khám phá ngay <FontAwesomeIcon icon={faArrowRight} />
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="text-center py-5">
                        <div className="mb-3">
                            <FontAwesomeIcon icon={faHeart} className="text-muted opacity-25" style={{ fontSize: "4rem" }} />
                        </div>
                        <h5 className="fw-bold text-dark mb-2">Chưa có sản phẩm nào</h5>
                        <p className="text-muted fs-7 mb-4">Bạn chưa lưu sản phẩm nào vào danh sách yêu thích.</p>
                        <button className="btn btn-primary fw-bold px-4 py-2 rounded-3">Khám phá sản phẩm</button>
                    </div>
                )}
            </div>
        </AccountLayout>
    );
}
