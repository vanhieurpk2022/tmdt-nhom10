import { faHeart } from "@fortawesome/free-regular-svg-icons";
import { faStar, faLeaf, faShieldHalved, faTruckFast, faMinus, faPlus, faCartShopping, faBolt, faChevronDown, faChevronUp, faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import { Link } from "react-router";
import "../css/pages/product-detail.css";

const MOCK_RELATED = [
    {
        id: 1,
        name: "Tinh Dầu Cam Ngọt Sweet Orange",
        desc: "Hương cam tươi mát, xua tan căng thẳng",
        origin: "Nông Trại Hữu Cơ Cao Phong",
        price: 140000,
        oldPrice: 175000,
        discount: "-20%",
        rating: 4.9,
        sold: "1.5k+",
        stock: "Còn hàng",
        image: "/images/home/tea-tree-australia.png",
    },
    {
        id: 2,
        name: "Tinh Dầu Khuynh Diệp Eucalyptus",
        desc: "Thông thoáng đường thở tức thì, mát lạnh dịu",
        origin: "Xưởng Thảo Mộc Hưng Yên",
        price: 175000,
        oldPrice: 205000,
        discount: "-15%",
        rating: 4.8,
        sold: "980+",
        stock: "Còn hàng",
        image: "/images/home/grapefruit-cold-pressed.png",
    },
    {
        id: 3,
        name: "Tinh Dầu Oải Hương True Lavender",
        desc: "Giải tỏa áp lực tâm lý, giấc ngủ sâu dịu êm",
        origin: "Hợp Tác Xã Thảo Mộc Provence",
        price: 220000,
        oldPrice: 260000,
        discount: "-18%",
        rating: 5.0,
        sold: "2.3k+",
        stock: "Còn hàng",
        image: "/images/home/lavender-france.png",
    },
    {
        id: 4,
        name: "Tinh Dầu Sả Chanh Lemongrass",
        desc: "Khử mùi tức thì, xua đuổi côn trùng hiệu quả",
        origin: "Xưởng Thảo Dược Mysore",
        price: 145000,
        oldPrice: 180000,
        discount: "-19%",
        rating: 4.9,
        sold: "1.8k+",
        stock: "Còn hàng",
        image: "/images/home/ylang-ylang.png",
    }
];

export default function ProductDetailPage() {
    const [quantity, setQuantity] = useState(1);
    const [selectedVariant, setSelectedVariant] = useState("10ml");
    const [expandedAccordion, setExpandedAccordion] = useState<Record<string, boolean>>({
        ingredients: true,
        origin: true,
        usage: true
    });

    const toggleAccordion = (id: string) => {
        setExpandedAccordion(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    return (
        <main className="product-detail-page bg-light py-4">
            <div className="container-fluid px-4 px-lg-5">
                {/* Breadcrumb */}
                <nav aria-label="breadcrumb" className="mb-4">
                    <ol className="breadcrumb mb-0 fs-7">
                        <li className="breadcrumb-item"><Link to="/" className="text-muted text-decoration-none">Trang chủ</Link></li>
                        <li className="breadcrumb-item"><Link to="/products" className="text-muted text-decoration-none">Tinh dầu đơn hương</Link></li>
                        <li className="breadcrumb-item active fw-bold text-dark" aria-current="page">Tinh Dầu Bạc Hà Tươi Peppermint</li>
                    </ol>
                </nav>

                <div className="bg-white rounded-4 shadow-sm p-4 mb-5">
                    <div className="row g-5">
                        {/* Image Gallery */}
                        <div className="col-12 col-lg-5">
                            <div className="mb-3 rounded-4 overflow-hidden border">
                                <img src="/images/home/grapefruit-cold-pressed.png" alt="Tinh Dầu Bạc Hà Tươi Peppermint" className="w-100 object-fit-cover" style={{ height: "450px" }} />
                            </div>
                            <div className="d-flex align-items-center gap-2">
                                <button className="btn btn-sm btn-light border rounded-circle flex-shrink-0 d-flex justify-content-center align-items-center" style={{ width: "32px", height: "32px" }}>
                                    <FontAwesomeIcon icon={faChevronLeft} className="text-muted" />
                                </button>
                                
                                <div className="d-flex gap-3 justify-content-center overflow-auto pb-2 gallery-thumbnails flex-grow-1" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
                                    <div className="rounded-3 border border-primary overflow-hidden flex-shrink-0" style={{ width: "80px", height: "80px", cursor: "pointer" }}>
                                        <img src="/images/home/grapefruit-cold-pressed.png" className="w-100 h-100 object-fit-cover" alt="Thumb 1" />
                                    </div>
                                    <div className="rounded-3 border overflow-hidden flex-shrink-0 opacity-75 hover-opacity-100" style={{ width: "80px", height: "80px", cursor: "pointer" }}>
                                        <img src="/images/home/tea-tree-australia.png" className="w-100 h-100 object-fit-cover" alt="Thumb 2" />
                                    </div>
                                    <div className="rounded-3 border overflow-hidden flex-shrink-0 opacity-75 hover-opacity-100" style={{ width: "80px", height: "80px", cursor: "pointer" }}>
                                        <img src="/images/home/lavender-france.png" className="w-100 h-100 object-fit-cover" alt="Thumb 3" />
                                    </div>
                                    <div className="rounded-3 border overflow-hidden flex-shrink-0 opacity-75 hover-opacity-100" style={{ width: "80px", height: "80px", cursor: "pointer" }}>
                                        <img src="/images/home/natural-wax-candle.png" className="w-100 h-100 object-fit-cover" alt="Thumb 4" />
                                    </div>
                                </div>

                                <button className="btn btn-sm btn-light border rounded-circle flex-shrink-0 d-flex justify-content-center align-items-center" style={{ width: "32px", height: "32px" }}>
                                    <FontAwesomeIcon icon={faChevronRight} className="text-muted" />
                                </button>
                            </div>
                        </div>

                        {/* Product Info */}
                        <div className="col-12 col-lg-7 d-flex flex-column">
                            <div className="d-flex align-items-center gap-3 mb-2 fs-7">
                                <span className="badge text-success bg-success bg-opacity-10 rounded-pill px-3 py-1 fw-bold border border-success border-opacity-25">
                                    <FontAwesomeIcon icon={faLeaf} className="me-1" /> Nông trại Hưng Yên
                                </span>
                                <span className="text-muted fw-bold">MÃ SP: PHY-8032</span>
                            </div>

                            <div className="d-flex justify-content-between align-items-start mb-3">
                                <h1 className="h2 fw-bold text-dark mb-0">Tinh Dầu Bạc Hà Tươi Peppermint</h1>
                                <button className="btn btn-light bg-light rounded-circle shadow-sm d-flex align-items-center justify-content-center text-muted fav-btn ms-3 flex-shrink-0 border-0" style={{ width: "42px", height: "42px" }}>
                                    <FontAwesomeIcon icon={faHeart} className="fs-5" />
                                </button>
                            </div>

                            <div className="d-flex align-items-center gap-2 mb-3">
                                <div className="d-flex text-warning fs-7 gap-1">
                                    <FontAwesomeIcon icon={faStar} />
                                    <FontAwesomeIcon icon={faStar} />
                                    <FontAwesomeIcon icon={faStar} />
                                    <FontAwesomeIcon icon={faStar} />
                                    <FontAwesomeIcon icon={faStar} />
                                </div>
                                <span className="fw-bold text-dark fs-7">5.0</span>
                                <span className="text-muted fs-7">• (920 đánh giá • Đã bán 2.4k)</span>
                            </div>

                            <p className="text-muted mb-4 fs-6 lh-lg">
                                Chiết xuất 100% từ lá bạc hà tươi hữu cơ vùng Hưng Yên bằng phương pháp chưng cất lôi cuốn hơi nước truyền thống. Giúp tinh thần tỉnh táo, tập trung và làm mát không gian tức thì.
                            </p>

                            <div className="bg-light rounded-4 p-4 mb-4 d-flex align-items-center justify-content-between border">
                                <div className="d-flex align-items-center gap-3">
                                    <span className="fs-2 fw-black text-dark lh-1">160.000đ</span>
                                    <span className="text-muted fs-6">/ 10ml</span>
                                    <span className="text-muted text-decoration-line-through ms-2 fs-6">195.000đ</span>
                                    <span className="badge bg-danger bg-opacity-10 text-danger fw-bold ms-1 px-2 py-1">-18%</span>
                                </div>
                                <span className="badge text-success bg-success bg-opacity-10 border border-success border-opacity-25 rounded-pill px-3 py-2 fw-bold fs-7">
                                    <div className="d-flex align-items-center gap-2">
                                        <div className="stock-dot bg-success rounded-circle"></div>
                                        Còn hàng
                                    </div>
                                </span>
                            </div>

                            <div className="mb-4">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <span className="fw-bold text-dark">Dung tích</span>
                                    <span className="text-muted fs-7 fw-bold text-uppercase">Đã chọn: {selectedVariant} {selectedVariant === '10ml' && '(Dùng thử)'}</span>
                                </div>
                                <div className="row g-3">
                                    <div className="col-4">
                                        <div 
                                            className={`variant-box rounded-3 p-3 border cursor-pointer transition-all ${selectedVariant === '10ml' ? 'border-primary bg-primary bg-opacity-10' : 'bg-white hover-border-primary'}`}
                                            onClick={() => setSelectedVariant('10ml')}
                                        >
                                            <div className={`fw-bold mb-1 ${selectedVariant === '10ml' ? 'text-primary' : 'text-dark'}`}>10ml</div>
                                            <div className={`fs-7 ${selectedVariant === '10ml' ? 'text-primary fw-bold' : 'text-muted'}`}>160.000đ</div>
                                        </div>
                                    </div>
                                    <div className="col-4">
                                        <div 
                                            className={`variant-box rounded-3 p-3 border cursor-pointer transition-all ${selectedVariant === '30ml' ? 'border-primary bg-primary bg-opacity-10' : 'bg-white hover-border-primary'}`}
                                            onClick={() => setSelectedVariant('30ml')}
                                        >
                                            <div className={`fw-bold mb-1 ${selectedVariant === '30ml' ? 'text-primary' : 'text-dark'}`}>30ml</div>
                                            <div className={`fs-7 ${selectedVariant === '30ml' ? 'text-primary fw-bold' : 'text-muted'}`}>390.000đ</div>
                                        </div>
                                    </div>
                                    <div className="col-4">
                                        <div 
                                            className={`variant-box rounded-3 p-3 border cursor-pointer transition-all position-relative ${selectedVariant === '50ml' ? 'border-primary bg-primary bg-opacity-10' : 'bg-white hover-border-primary'}`}
                                            onClick={() => setSelectedVariant('50ml')}
                                        >
                                            <span className="badge bg-success position-absolute top-0 end-0 translate-middle-y me-2">-30%</span>
                                            <div className={`fw-bold mb-1 ${selectedVariant === '50ml' ? 'text-primary' : 'text-dark'}`}>50ml</div>
                                            <div className={`fs-7 ${selectedVariant === '50ml' ? 'text-primary fw-bold' : 'text-muted'}`}>590.000đ</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="row g-3 mb-4 mt-auto">
                                <div className="col-12 col-xl-3">
                                    <div className="d-flex align-items-center justify-content-between border rounded-3 px-3 py-2 bg-white h-100">
                                        <button className="btn btn-link text-muted p-0 text-decoration-none" onClick={() => setQuantity(Math.max(1, quantity - 1))}><FontAwesomeIcon icon={faMinus} /></button>
                                        <span className="fw-bold">{quantity}</span>
                                        <button className="btn btn-link text-muted p-0 text-decoration-none" onClick={() => setQuantity(quantity + 1)}><FontAwesomeIcon icon={faPlus} /></button>
                                    </div>
                                </div>
                                <div className="col-6 col-xl-4">
                                    <button className="btn btn-outline-primary w-100 fw-bold h-100 d-flex align-items-center justify-content-center gap-2 py-3 bg-white">
                                        <FontAwesomeIcon icon={faCartShopping} /> Thêm vào giỏ
                                    </button>
                                </div>
                                <div className="col-6 col-xl-5">
                                    <button className="btn btn-primary w-100 fw-bold h-100 d-flex align-items-center justify-content-center gap-2 py-3">
                                        <FontAwesomeIcon icon={faBolt} /> Mua ngay
                                    </button>
                                </div>
                            </div>

                            <div className="d-flex justify-content-between border-top pt-4 px-2">
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

                    {/* Accordions */}
                    <div className="mt-5 border-top pt-4">
                        <div className="accordion custom-accordion" id="productAccordion">
                            <div className="accordion-item border-0 border-bottom mb-2">
                                <h2 className="accordion-header">
                                    <button className={`accordion-button fw-bold bg-transparent px-0 ${!expandedAccordion['ingredients'] ? 'collapsed' : ''}`} type="button" onClick={() => toggleAccordion('ingredients')}>
                                        <FontAwesomeIcon icon={faLeaf} className="text-primary me-2" /> Tầng hương & Thành phần
                                    </button>
                                </h2>
                                <div className={`accordion-collapse collapse ${expandedAccordion['ingredients'] ? 'show' : ''}`}>
                                    <div className="accordion-body px-0 pt-2 pb-4 text-muted fs-7">
                                        <div className="mb-2">
                                            <span className="fw-bold text-dark me-2">Hợp chất chính:</span>
                                            <span>Menthol tự nhiên 46.8%, Menthone 24.2%</span>
                                        </div>
                                        <div>
                                            <span className="fw-bold text-dark me-2">Tầng hương:</span>
                                            <span>Hương đầu the mát sảng khoái, hậu ngọt thanh</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="accordion-item border-0 border-bottom mb-2">
                                <h2 className="accordion-header">
                                    <button className={`accordion-button fw-bold bg-transparent px-0 ${!expandedAccordion['origin'] ? 'collapsed' : ''}`} type="button" onClick={() => toggleAccordion('origin')}>
                                        <FontAwesomeIcon icon={faLeaf} className="text-success me-2" /> Nguồn gốc & Phương pháp chưng cất
                                    </button>
                                </h2>
                                <div className={`accordion-collapse collapse ${expandedAccordion['origin'] ? 'show' : ''}`}>
                                    <div className="accordion-body px-0 pt-2 pb-4 text-muted fs-7">
                                        Nguồn dược liệu thu hái thủ công tại Xưởng Thảo Mộc Hưng Yên. Ứng dụng phương pháp chưng cất ngưng tụ chậm 8 giờ để giữ trọn tinh chất.
                                    </div>
                                </div>
                            </div>

                            <div className="accordion-item border-0">
                                <h2 className="accordion-header">
                                    <button className={`accordion-button fw-bold bg-transparent px-0 ${!expandedAccordion['usage'] ? 'collapsed' : ''}`} type="button" onClick={() => toggleAccordion('usage')}>
                                        <FontAwesomeIcon icon={faStar} className="text-warning me-2" /> Hướng dẫn sử dụng
                                    </button>
                                </h2>
                                <div className={`accordion-collapse collapse ${expandedAccordion['usage'] ? 'show' : ''}`}>
                                    <div className="accordion-body px-0 pt-2 pb-4 text-muted fs-7">
                                        Khuếch tán bằng máy xông (3-5 giọt), nhỏ 2 giọt vào bồn tắm nước ấm, hoặc pha loãng với dầu jojoba để massage thư giãn vùng thái dương.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Related Products */}
                <div className="d-flex justify-content-between align-items-end mb-4">
                    <h3 className="fw-black mb-0">Gợi ý phối hương hoàn hảo</h3>
                    <Link to="/products" className="text-primary text-decoration-none fw-bold fs-7 hover-underline">Xem tất cả sản phẩm &rarr;</Link>
                </div>

                <div className="row row-cols-1 row-cols-md-2 row-cols-xl-4 g-4 mb-4">
                    {MOCK_RELATED.map((product) => (
                        <div className="col" key={product.id}>
                            <div className="card h-100 product-card border-0 shadow-sm rounded-4 overflow-hidden">
                                <div className="position-relative">
                                    <img src={product.image} className="card-img-top product-img" alt={product.name} />
                                    <button className="btn btn-light bg-white rounded-circle position-absolute top-0 end-0 m-3 p-2 shadow-sm d-flex align-items-center justify-content-center text-muted fav-btn">
                                        <FontAwesomeIcon icon={faHeart} />
                                    </button>
                                </div>
                                <div className="card-body p-4 d-flex flex-column">
                                    <div className="d-flex align-items-center gap-1 mb-2">
                                        <FontAwesomeIcon icon={faStar} className="text-warning fs-7" />
                                        <span className="fw-bold fs-7">{product.rating.toFixed(1)}</span>
                                        <span className="text-muted fs-7">({product.sold} đã bán)</span>
                                    </div>
                                    <h5 className="card-title fs-6 fw-bold mb-1 product-title">{product.name}</h5>
                                    <p className="card-text text-muted fs-7 mb-3 product-desc">{product.desc}</p>
                                    
                                    <div className="mt-auto">
                                        <div className="d-flex align-items-center gap-2 mb-3 text-success fs-7 fw-bold">
                                            <FontAwesomeIcon icon={faLeaf} />
                                            <span>{product.origin}</span>
                                        </div>
                                        
                                        <div className="d-flex justify-content-between align-items-end mb-1">
                                            <span className="fs-5 fw-bold text-dark">{product.price.toLocaleString("vi-VN")}đ</span>
                                            <span className={`badge rounded-pill fw-normal px-2 py-1 stock-green`}>{product.stock}</span>
                                        </div>
                                        <div className="d-flex align-items-center gap-2 mb-3">
                                            <span className="text-muted text-decoration-line-through fs-7">{product.oldPrice.toLocaleString("vi-VN")}đ</span>
                                            <span className="badge bg-danger bg-opacity-10 text-danger fs-8 fw-bold">{product.discount}</span>
                                        </div>
                                        
                                        <div className="row g-2">
                                            <div className="col-6">
                                                <button className="btn btn-outline-primary w-100 fw-bold bg-white text-primary btn-add-cart">
                                                    Thêm giỏ
                                                </button>
                                            </div>
                                            <div className="col-6">
                                                <button className="btn btn-primary w-100 fw-bold btn-buy-now">
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
            </div>
        </main>
    );
}
