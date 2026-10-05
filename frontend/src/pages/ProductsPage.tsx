import { faHeart } from "@fortawesome/free-regular-svg-icons";
import { faStar, faFire, faLeaf } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import "../css/pages/products.css";

const MOCK_PRODUCTS = [
    {
        id: 1,
        name: "Tinh Dầu Sả Chanh Lemongrass Ấn Độ",
        desc: "Thanh lọc không khí, khử mùi phòng hiệu quả",
        origin: "Xưởng Thảo Dược Mysore (Ấn Độ)",
        price: 145000,
        oldPrice: 180000,
        discount: "-19%",
        rating: 4.9,
        sold: "2.8k+",
        stock: "Còn hàng",
        image: "/images/home/lavender-france.png",
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
        sold: "2.4k+",
        stock: "Còn hàng",
        image: "/images/home/grapefruit-cold-pressed.png",
    },
    {
        id: 3,
        name: "Tinh Dầu Trầm Hương Khánh Hoà",
        desc: "Hương trầm ấm tĩnh tại, thư giãn thiền định",
        origin: "Xưởng Trầm Hương Cố Đô Huế",
        price: 380000,
        oldPrice: 450000,
        discount: "-15%",
        rating: 4.9,
        sold: "860+",
        stock: "Sắp hết",
        image: "/images/home/tea-tree-australia.png",
    },
    {
        id: 4,
        name: "Tinh Dầu Tràm Gió Huế Nguyên Chất",
        desc: "Giữ ấm cơ thể, bảo vệ đường hô hấp cho bé",
        origin: "Lò Nấu Tràm Lộc Thủy (Thừa Thiên Huế)",
        price: 125000,
        oldPrice: 150000,
        discount: "-16%",
        rating: 4.9,
        sold: "3.1k+",
        stock: "Còn hàng",
        image: "/images/home/ylang-ylang.png",
    },
    {
        id: 5,
        name: "Tinh Dầu Vỏ Quế Ấm Nồng Yên Bái",
        desc: "Khử mùi không gian ẩm mốc, sưởi ấm căn phòng",
        origin: "Xưởng Quế Rừng Văn Yên (Yên Bái)",
        price: 155000,
        oldPrice: 190000,
        discount: "-18%",
        rating: 4.8,
        sold: "920+",
        stock: "Hết hàng",
        image: "/images/home/deep-sleep-blend.png",
    },
    {
        id: 6,
        name: "Hoàng Đàn Tuyết Hà Giang No. 05",
        desc: "Hương gỗ tuyết vương vấn, tinh khiết núi rừng",
        origin: "Nông Trại Dược Liệu Đồng Văn",
        price: 290000,
        oldPrice: 350000,
        discount: "-17%",
        rating: 4.9,
        sold: "640+",
        stock: "Sắp hết",
        image: "/images/home/natural-wax-candle.png",
    },
    {
        id: 7,
        name: "Tinh Dầu Lavender Oải Hương Pháp",
        desc: "Xoa dịu căng thẳng, hỗ trợ giấc ngủ sâu êm",
        origin: "Hợp Tác Xã Thảo Mộc Provence (Pháp)",
        price: 240000,
        oldPrice: 300000,
        discount: "-20%",
        rating: 4.9,
        sold: "1.6k+",
        stock: "Còn hàng",
        image: "/images/home/jasmine-sambac.png",
    },
    {
        id: 8,
        name: "Tinh Dầu Hương Thảo Rosemary",
        desc: "Kích thích trí nhớ, tăng độ tập trung làm việc",
        origin: "Vườn Dược Liệu Mộc Châu",
        price: 175000,
        oldPrice: 210000,
        discount: "-16%",
        rating: 4.8,
        sold: "780+",
        stock: "Còn hàng",
        image: "/images/home/lavender-france.png",
    },
    {
        id: 9,
        name: "Hoa Hồng Cổ Sa Pa Độc Bản No. 09",
        desc: "Hương hoa hồng thuần khiết, quý phái dưỡng nhan",
        origin: "Vườn Hồng Cổ Fansipan (Sa Pa)",
        price: 365000,
        oldPrice: 430000,
        discount: "-15%",
        rating: 5.0,
        sold: "490+",
        stock: "Hết hàng",
        image: "/images/home/jasmine-sambac.png",
    }
];

export default function ProductsPage() {
    const [priceRange, setPriceRange] = useState({ min: "", max: "" });

    return (
        <main className="products-page bg-light py-4">
            <div className="container-fluid px-4 px-lg-5">
                <div className="row g-4">
                    {/* Sidebar Filters */}
                    <aside className="col-12 col-lg-3">
                        <div className="bg-white p-4 rounded-3 shadow-sm products-sidebar">
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h5 className="mb-0 fw-bold d-flex align-items-center gap-2">
                                    <svg className="text-primary" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
                                    Bộ lọc tìm kiếm
                                </h5>
                                <button className="btn btn-link text-muted text-decoration-none p-0 fs-7">Đặt lại</button>
                            </div>

                            {/* Danh mục */}
                            <div className="filter-group mb-4">
                                <h6 className="filter-title fs-7 text-uppercase text-muted fw-bold mb-3">Danh mục</h6>
                                <div className="d-flex flex-column gap-2">
                                    <label className="d-flex justify-content-between align-items-center custom-checkbox">
                                        <div><input type="checkbox" className="form-check-input me-2" /> Tinh dầu đơn hương</div>
                                        <span className="text-muted fs-7">(18)</span>
                                    </label>
                                    <label className="d-flex justify-content-between align-items-center custom-checkbox">
                                        <div><input type="checkbox" className="form-check-input me-2" /> Tinh dầu phối trị</div>
                                        <span className="text-muted fs-7">(12)</span>
                                    </label>
                                    <label className="d-flex justify-content-between align-items-center custom-checkbox">
                                        <div><input type="checkbox" className="form-check-input me-2" /> Trị liệu giấc ngủ</div>
                                        <span className="text-muted fs-7">(7)</span>
                                    </label>
                                    <label className="d-flex justify-content-between align-items-center custom-checkbox">
                                        <div><input type="checkbox" className="form-check-input me-2" /> Tinh dầu xông phòng</div>
                                        <span className="text-muted fs-7">(15)</span>
                                    </label>
                                    <label className="d-flex justify-content-between align-items-center custom-checkbox">
                                        <div><input type="checkbox" className="form-check-input me-2" /> Nước hoa khô thảo mộc</div>
                                        <span className="text-muted fs-7">(5)</span>
                                    </label>
                                </div>
                            </div>

                            {/* Khoảng giá */}
                            <div className="filter-group mb-4">
                                <h6 className="filter-title fs-7 text-uppercase text-muted fw-bold mb-3">Khoảng giá (VNĐ)</h6>
                                <div className="d-flex flex-column gap-2 mb-3">
                                    <label className="custom-radio"><input type="radio" name="price" className="form-check-input me-2" /> Dưới 250.000đ</label>
                                    <label className="custom-radio"><input type="radio" name="price" className="form-check-input me-2" /> 250.000đ - 500.000đ</label>
                                    <label className="custom-radio"><input type="radio" name="price" className="form-check-input me-2" /> Trên 500.000đ</label>
                                </div>
                                <div className="d-flex align-items-center gap-2">
                                    <input type="text" className="form-control form-control-sm" placeholder="Từ" value={priceRange.min} onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })} />
                                    <span className="text-muted">-</span>
                                    <input type="text" className="form-control form-control-sm" placeholder="Đến" value={priceRange.max} onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })} />
                                </div>
                            </div>

                            {/* Nhóm nốt hương */}
                            <div className="filter-group mb-4">
                                <h6 className="filter-title fs-7 text-uppercase text-muted fw-bold mb-3">Nhóm nốt hương</h6>
                                <div className="d-flex flex-wrap gap-2">
                                    <span className="badge bg-light text-dark border p-2 px-3 fw-normal">Cam Bergamot</span>
                                    <span className="badge bg-primary text-white p-2 px-3 fw-normal">Lavender Pháp</span>
                                    <span className="badge bg-light text-dark border p-2 px-3 fw-normal">Trầm hương</span>
                                    <span className="badge bg-light text-dark border p-2 px-3 fw-normal">Tuyết tùng</span>
                                    <span className="badge bg-light text-dark border p-2 px-3 fw-normal">Tràm trà Sa Pa</span>
                                </div>
                            </div>

                            {/* Đánh giá sao */}
                            <div className="filter-group mb-4">
                                <h6 className="filter-title fs-7 text-uppercase text-muted fw-bold mb-3">Đánh giá sao</h6>
                                <div className="d-flex flex-column gap-2">
                                    {[5, 4, 3, 2, 1].map((star) => (
                                        <label key={star} className="d-flex align-items-center gap-2 custom-checkbox">
                                            <input type="checkbox" className="form-check-input" />
                                            <div className="text-warning fs-7">
                                                {Array.from({ length: 5 }).map((_, i) => (
                                                    <FontAwesomeIcon key={i} icon={faStar} className={i < star ? "text-warning" : "text-muted opacity-25"} />
                                                ))}
                                            </div>
                                            <span className="text-muted fs-7">({star} sao)</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Nông trại */}
                            <div className="filter-group mb-4">
                                <h6 className="filter-title fs-7 text-uppercase text-muted fw-bold mb-3">Nông trại & Xuất xứ</h6>
                                <div className="d-flex flex-column gap-2">
                                    <label className="d-flex justify-content-between align-items-center custom-checkbox">
                                        <div><input type="checkbox" className="form-check-input me-2" defaultChecked /> Đà Lạt Organic</div>
                                        <span className="text-muted fs-7">(14)</span>
                                    </label>
                                    <label className="d-flex justify-content-between align-items-center custom-checkbox">
                                        <div><input type="checkbox" className="form-check-input me-2" /> Bảo Lộc Farm</div>
                                        <span className="text-muted fs-7">(8)</span>
                                    </label>
                                    <label className="d-flex justify-content-between align-items-center custom-checkbox">
                                        <div><input type="checkbox" className="form-check-input me-2" /> Hà Giang Native</div>
                                        <span className="text-muted fs-7">(6)</span>
                                    </label>
                                    <label className="d-flex justify-content-between align-items-center custom-checkbox">
                                        <div><input type="checkbox" className="form-check-input me-2" /> Nhập khẩu Pháp</div>
                                        <span className="text-muted fs-7">(12)</span>
                                    </label>
                                </div>
                            </div>

                            <div className="d-flex gap-2">
                                <button className="btn btn-primary flex-grow-1 fw-bold">Áp dụng</button>
                                <button className="btn btn-light border fw-bold text-muted">Đặt lại</button>
                            </div>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <section className="col-12 col-lg-9">
                        <div className="d-flex align-items-center gap-2 mb-4 flex-wrap">
                            <span className="text-muted fs-7"><FontAwesomeIcon icon={faFire} className="text-warning me-1" /> Gợi ý tìm kiếm:</span>
                            <div className="d-flex gap-2 flex-wrap search-tags">
                                <span className="badge bg-white text-dark border rounded-pill px-3 py-2 fw-normal">Ngủ ngon</span>
                                <span className="badge bg-white text-dark border rounded-pill px-3 py-2 fw-normal">Đuổi muỗi</span>
                                <span className="badge bg-white text-dark border rounded-pill px-3 py-2 fw-normal">Trị liệu stress</span>
                                <span className="badge bg-white text-dark border rounded-pill px-3 py-2 fw-normal">Sả Java</span>
                                <span className="badge bg-white text-dark border rounded-pill px-3 py-2 fw-normal">Máy khuếch tán gốm</span>
                            </div>
                        </div>

                        <p className="text-muted fs-7 mb-4">Hiển thị <strong>9 sản phẩm</strong> phù hợp tiêu chí</p>

                        <div className="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-4">
                            {MOCK_PRODUCTS.map((product) => (
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
                                                <div className="d-flex align-items-center gap-2 mb-3 text-muted fs-7">
                                                    <FontAwesomeIcon icon={faLeaf} className="text-success" />
                                                    <span>{product.origin}</span>
                                                </div>

                                                <div className="d-flex justify-content-between align-items-end mb-1">
                                                    <span className="fs-5 fw-bold text-dark">{product.price.toLocaleString("vi-VN")}đ <span className="fs-7 fw-normal text-muted">/10ml</span></span>
                                                    <span className={`badge rounded-pill fw-normal px-2 py-1 ${product.stock === 'Còn hàng' ? 'stock-green' : product.stock === 'Sắp hết' ? 'stock-yellow' : 'stock-red'}`}>{product.stock}</span>
                                                </div>
                                                <div className="d-flex align-items-center gap-2 mb-3">
                                                    <span className="text-muted text-decoration-line-through fs-7">{product.oldPrice.toLocaleString("vi-VN")}đ</span>
                                                    <span className="badge bg-danger bg-opacity-10 text-danger fs-8 fw-bold">{product.discount}</span>
                                                </div>

                                                <div className="row g-2">
                                                    <div className="col-6">
                                                        <button className="btn btn-outline-primary w-100 fw-bold bg-white text-primary btn-add-cart" disabled={product.stock === 'Hết hàng'}>
                                                            Thêm giỏ
                                                        </button>
                                                    </div>
                                                    <div className="col-6">
                                                        <button className="btn btn-primary w-100 fw-bold btn-buy-now" disabled={product.stock === 'Hết hàng'}>
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
                    </section>
                </div>
            </div>
        </main>
    );
}
