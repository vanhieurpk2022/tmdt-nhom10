import { useState } from 'react';
import { Header, Footer } from '../component';
import '../assets/tat-ca.css';

interface Product {
  id: number;
  name: string;
  origin: string;
  price: number;
  oldPrice?: number;
  discount?: number;
  rating: number;
  soldCount: string;
  img: string;
  stockStatus: 'in-stock' | 'low-stock' | 'out-of-stock';
}

const PRODUCTS_DATA: Product[] = [
  {
    id: 1,
    name: 'Tinh Dầu Sả Chanh Lemongrass Ấn Độ',
    origin: 'Xưởng Thảo Dược Mysore (Ấn Độ)',
    price: 145000,
    oldPrice: 180000,
    discount: 19,
    rating: 4.9,
    soldCount: '1.8k+',
    img: 'https://picsum.photos/seed/lemongrass/400/280',
    stockStatus: 'in-stock',
  },
  {
    id: 2,
    name: 'Tinh Dầu Bạc Hà Tươi Peppermint',
    origin: 'Xưởng Thảo Mộc Hưng Yên',
    price: 160000,
    oldPrice: 200000,
    discount: 20,
    rating: 5.0,
    soldCount: '2.4k+',
    img: 'https://picsum.photos/seed/peppermint/400/280',
    stockStatus: 'in-stock',
  },
  {
    id: 3,
    name: 'Tinh Dầu Trầm Hương Khánh Hòa',
    origin: 'Xưởng Trầm Hương Cổ Đô Huế',
    price: 380000,
    oldPrice: 450000,
    discount: 15,
    rating: 4.9,
    soldCount: '860+',
    img: 'https://picsum.photos/seed/agarwood/400/280',
    stockStatus: 'low-stock',
  },
  {
    id: 4,
    name: 'Tinh Dầu Tràm Gió Huế Nguyên Chất',
    origin: 'Lò Nấu Tràm Lộc Thủy (Thừa Thiên Huế)',
    price: 125000,
    oldPrice: 152000,
    discount: 16,
    rating: 4.9,
    soldCount: '3.1k+',
    img: 'https://picsum.photos/seed/cajuput/400/280',
    stockStatus: 'in-stock',
  },
  {
    id: 5,
    name: 'Tinh Dầu Vỏ Quế Ấm Nóng Yên Bái',
    origin: 'Xưởng Quế Rừng Văn Yên (Yên Bái)',
    price: 155000,
    oldPrice: 190000,
    discount: 18,
    rating: 4.8,
    soldCount: '920+',
    img: 'https://picsum.photos/seed/cinnamon/400/280',
    stockStatus: 'out-of-stock',
  },
  {
    id: 6,
    name: 'Hoàng Đàn Tuyết Hà Giang No. 05',
    origin: 'Nông Trại Dược Liệu Đồng Văn',
    price: 290000,
    oldPrice: 340000,
    discount: 17,
    rating: 4.9,
    soldCount: '640+',
    img: 'https://picsum.photos/seed/sandalwood/400/280',
    stockStatus: 'low-stock',
  },
  {
    id: 7,
    name: 'Tinh Dầu Lavender Oải Hương Pháp',
    origin: 'Hợp Tác Xã Thảo Mộc Provence (Pháp)',
    price: 240000,
    oldPrice: 300000,
    discount: 20,
    rating: 4.9,
    soldCount: '1.5k+',
    img: 'https://picsum.photos/seed/lavender/400/280',
    stockStatus: 'in-stock',
  },
  {
    id: 8,
    name: 'Tinh Dầu Hương Thảo Rosemary',
    origin: 'Không Gian Trồng Thảo Mộc Mộc Châu',
    price: 175000,
    oldPrice: 210000,
    discount: 16,
    rating: 4.8,
    soldCount: '780+',
    img: 'https://picsum.photos/seed/rosemary/400/280',
    stockStatus: 'in-stock',
  },
  {
    id: 9,
    name: 'Hoa Hồng Cổ Sa Pa Độc Bản No. 09',
    origin: 'Vườn Hồng Cổ Fansipan (Sa Pa)',
    price: 365000,
    oldPrice: 430000,
    discount: 15,
    rating: 5.0,
    soldCount: '490+',
    img: 'https://picsum.photos/seed/roseflower/400/280',
    stockStatus: 'out-of-stock',
  },
];

const SCENT_TAGS = ['Cam Bergamot', 'Lavender Pháp', 'Hương Tràm', 'Tuyết tùng', 'Trầm trà Sa Pa'];
const SUGGESTION_TAGS = ['Ngủ ngon', 'Đuổi muỗi', 'Trị liệu stress', 'Sả Java', 'Máy khuếch tán gốm', 'Hữu cơ'];

export default function TatCa() {
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [selectedScents, setSelectedScents] = useState<string[]>(['Lavender Pháp']);
  const [selectedSuggestion, setSelectedSuggestion] = useState<string>('Ngủ ngon');
  const [sortBy, setSortBy] = useState<string>('popular');
  const [cartCount, setCartCount] = useState<number>(3);

  const toggleWishlist = (id: number) => {
    setWishlist((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleScent = (scent: string) => {
    setSelectedScents((prev) =>
      prev.includes(scent) ? prev.filter((s) => s !== scent) : [...prev, scent]
    );
  };

  const handleAddToCart = (productName: string) => {
    setCartCount((prev) => prev + 1);
    alert(`Đã thêm "${productName}" vào giỏ hàng!`);
  };

  const handleResetFilters = () => {
    setSelectedScents([]);
  };

  return (
    <div className="bg-light min-vh-100 d-flex flex-column">
      {/* 1. Header dùng chung (highlight Tất cả) */}
      <Header activePage="tat-ca" cartCount={cartCount} />

      {/* 2. Nội dung chính trang Tất cả */}
      <main className="container-fluid px-lg-5 px-3 py-4 flex-grow-1">
        <div className="row g-4">
          {/* Sidebar bộ lọc */}
          <aside className="col-12 col-md-4 col-lg-3 col-xl-2 filter-sidebar">
            <div className="filter-panel bg-white rounded-3 p-3 border">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <span className="fw-bold text-dark" style={{ fontSize: '14px' }}>
                  <i className="bi bi-sliders me-2 text-danger" />
                  Bộ lọc tìm kiếm
                </span>
                <button
                  type="button"
                  className="btn btn-link text-danger p-0 text-decoration-none small fw-semibold"
                  onClick={handleResetFilters}
                >
                  Đặt lại
                </button>
              </div>

              <hr className="my-2" />

              {/* Danh mục */}
              <div className="mb-3">
                <p className="filter-section-title">Danh mục</p>
                <div className="d-flex flex-column gap-2">
                  {[
                    { label: 'Tinh dầu đơn hương', count: 18, defaultChecked: true },
                    { label: 'Tinh dầu phối', count: 12 },
                    { label: 'Tinh dầu giấc ngủ', count: 7 },
                    { label: 'Tinh dầu xông phòng', count: 11 },
                    { label: 'Nước hoa khô thảo mộc', count: 5 },
                  ].map((cat, idx) => (
                    <label
                      key={idx}
                      className="d-flex align-items-center justify-content-between filter-check-label"
                    >
                      <div className="d-flex align-items-center gap-2">
                        <input
                          type="checkbox"
                          className="form-check-input mt-0"
                          defaultChecked={cat.defaultChecked}
                        />
                        {cat.label}
                      </div>
                      <span className="filter-count">({cat.count})</span>
                    </label>
                  ))}
                </div>
              </div>

              <hr className="my-2" />

              {/* Khoảng giá */}
              <div className="mb-3">
                <p className="filter-section-title">Khoảng giá (VNĐ)</p>
                <div className="d-flex flex-column gap-2 mb-2">
                  <label className="filter-check-label">
                    <input type="radio" name="price" className="form-check-input mt-0 me-2" />
                    Dưới 250.000đ
                  </label>
                  <label className="filter-check-label">
                    <input
                      type="radio"
                      name="price"
                      className="form-check-input mt-0 me-2"
                      defaultChecked
                    />
                    250.000đ – 500.000đ
                  </label>
                  <label className="filter-check-label">
                    <input type="radio" name="price" className="form-check-input mt-0 me-2" />
                    Trên 500.000đ
                  </label>
                </div>
                <div className="d-flex gap-2 align-items-center">
                  <input
                    type="number"
                    className="form-control form-control-sm text-center"
                    placeholder="200.000"
                    defaultValue="200000"
                    style={{ fontSize: '12px' }}
                  />
                  <span className="text-secondary small">–</span>
                  <input
                    type="number"
                    className="form-control form-control-sm text-center"
                    placeholder="700.000"
                    defaultValue="700000"
                    style={{ fontSize: '12px' }}
                  />
                </div>
              </div>

              <hr className="my-2" />

              {/* Nhóm mùi hương */}
              <div className="mb-3">
                <p className="filter-section-title">Nhóm mùi hương</p>
                <div className="d-flex flex-wrap gap-2">
                  {SCENT_TAGS.map((tag) => {
                    const active = selectedScents.includes(tag);
                    return (
                      <span
                        key={tag}
                        className={`scent-tag ${active ? 'active' : ''}`}
                        onClick={() => toggleScent(tag)}
                        style={{ cursor: 'pointer' }}
                      >
                        {tag}
                      </span>
                    );
                  })}
                </div>
              </div>

              <hr className="my-2" />

              {/* Đánh giá sao */}
              <div className="mb-3">
                <p className="filter-section-title">Đánh giá sao</p>
                <div className="d-flex flex-column gap-2">
                  <label className="filter-check-label">
                    <input
                      type="radio"
                      name="rating"
                      className="form-check-input mt-0 me-2"
                      defaultChecked
                    />
                    <span className="text-warning me-1">★★★★★</span>
                    <small className="text-secondary">(5 sao)</small>
                  </label>
                  <label className="filter-check-label">
                    <input type="radio" name="rating" className="form-check-input mt-0 me-2" />
                    <span className="text-warning me-1">★★★★</span>
                    <span className="text-muted">☆</span>
                    <small className="text-secondary ms-1">(Từ 4 sao)</small>
                  </label>
                  <label className="filter-check-label">
                    <input type="radio" name="rating" className="form-check-input mt-0 me-2" />
                    <span className="text-warning me-1">★★★</span>
                    <span className="text-muted">☆☆</span>
                    <small className="text-secondary ms-1">(Từ 3 sao)</small>
                  </label>
                </div>
              </div>

              <hr className="my-2" />

              {/* Nông trại & Xuất xứ */}
              <div className="mb-3">
                <p className="filter-section-title">Nông trại &amp; Xuất xứ</p>
                <div className="d-flex flex-column gap-2">
                  {[
                    { label: 'Đà Lạt Organic', count: 14, defaultChecked: true },
                    { label: 'Bảo Lộc Farm', count: 8 },
                    { label: 'Hà Giang Native', count: 5 },
                    { label: 'Nhập khẩu Pháp', count: 10 },
                  ].map((farm, idx) => (
                    <label
                      key={idx}
                      className="d-flex align-items-center justify-content-between filter-check-label"
                    >
                      <div className="d-flex align-items-center gap-2">
                        <input
                          type="checkbox"
                          className="form-check-input mt-0"
                          defaultChecked={farm.defaultChecked}
                        />
                        {farm.label}
                      </div>
                      <span className="filter-count">({farm.count})</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="d-grid gap-2 mt-3">
                <button className="btn btn-danger fw-semibold" style={{ fontSize: '14px' }}>
                  Áp dụng
                </button>
                <button
                  className="btn btn-outline-secondary"
                  style={{ fontSize: '13px' }}
                  onClick={handleResetFilters}
                >
                  Đặt lại
                </button>
              </div>
            </div>
          </aside>

          {/* Khu vực danh sách sản phẩm */}
          <div className="col-12 col-md-8 col-lg-9 col-xl-10 product-area">
            {/* Tags gợi ý */}
            <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
              <span className="text-secondary small fw-medium me-1">Gợi ý:</span>
              {SUGGESTION_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  className={`suggestion-tag ${
                    selectedSuggestion === tag ? 'active' : ''
                  }`}
                  onClick={() => setSelectedSuggestion(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* Số lượng kết quả & sắp xếp */}
            <div className="d-flex align-items-center justify-content-between mb-3">
              <p className="text-secondary small mb-0">
                Hiển thị <strong className="text-dark">{PRODUCTS_DATA.length} sản phẩm</strong> phù
                hợp tiêu chí
              </p>
              <div className="d-flex align-items-center gap-2">
                <span className="text-secondary small">Sắp xếp:</span>
                <select
                  className="form-select form-select-sm"
                  style={{ width: '160px', fontSize: '13px' }}
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="popular">Phổ biến nhất</option>
                  <option value="price-asc">Giá tăng dần</option>
                  <option value="price-desc">Giá giảm dần</option>
                  <option value="newest">Mới nhất</option>
                  <option value="rating">Đánh giá cao</option>
                </select>
              </div>
            </div>

            {/* Lưới sản phẩm */}
            <div className="row row-cols-1 row-cols-sm-2 row-cols-md-2 row-cols-lg-3 row-cols-xl-4 g-3">
              {PRODUCTS_DATA.map((product) => {
                const isWishlisted = wishlist.includes(product.id);
                const isOutOfStock = product.stockStatus === 'out-of-stock';

                return (
                  <div className="col" key={product.id}>
                    <div className="product-card bg-white rounded-3 border overflow-hidden h-100 d-flex flex-column">
                      <div className="product-img-wrap position-relative">
                        <img src={product.img} className="product-img" alt={product.name} />
                        <button
                          type="button"
                          className="btn-wishlist"
                          onClick={() => toggleWishlist(product.id)}
                          aria-label="Thêm vào yêu thích"
                        >
                          <i
                            className={`bi ${
                              isWishlisted ? 'bi-heart-fill text-danger' : 'bi-heart'
                            }`}
                          />
                        </button>
                        {product.stockStatus === 'in-stock' && (
                          <span className="stock-badge bg-success text-white">Còn hàng</span>
                        )}
                        {product.stockStatus === 'low-stock' && (
                          <span className="stock-badge bg-warning text-dark">Sắp hết</span>
                        )}
                        {product.stockStatus === 'out-of-stock' && (
                          <span className="stock-badge bg-secondary text-white">Hết hàng</span>
                        )}
                      </div>

                      <div className="p-3 d-flex flex-column flex-grow-1">
                        <div className="d-flex align-items-center gap-1 mb-1">
                          <span className="text-warning" style={{ fontSize: '12px' }}>
                            {'★'.repeat(Math.floor(product.rating))}
                          </span>
                          <span className="text-secondary" style={{ fontSize: '12px' }}>
                            {product.rating}
                          </span>
                          <span className="text-muted" style={{ fontSize: '11px' }}>
                            ({product.soldCount} đã bán)
                          </span>
                        </div>

                        <h6 className="product-name mb-1">{product.name}</h6>
                        <p className="product-origin mb-2">
                          <i className="bi bi-geo-alt me-1" />
                          {product.origin}
                        </p>

                        <div className="mt-auto">
                          <div className="d-flex align-items-end gap-2 mb-2">
                            <span
                              className={`product-price ${isOutOfStock ? 'text-muted' : ''}`}
                            >
                              {product.price.toLocaleString('vi-VN')}đ
                            </span>
                            <span className="product-unit text-secondary">/10ml</span>
                            {product.oldPrice && (
                              <span className="product-old-price text-decoration-line-through text-muted ms-1">
                                {product.oldPrice.toLocaleString('vi-VN')}đ
                              </span>
                            )}
                            {product.discount && (
                              <span className="discount-badge">-{product.discount}%</span>
                            )}
                          </div>

                          <div className="d-grid grid-2-cols gap-2">
                            <button
                              type="button"
                              className={`btn btn-sm fw-medium ${
                                isOutOfStock
                                  ? 'btn-outline-secondary'
                                  : 'btn-outline-danger'
                              }`}
                              disabled={isOutOfStock}
                              onClick={() => handleAddToCart(product.name)}
                            >
                              <i className="bi bi-cart-plus me-1" />
                              Thêm giỏ
                            </button>
                            <button
                              type="button"
                              className={`btn btn-sm fw-medium ${
                                isOutOfStock ? 'btn-secondary' : 'btn-danger'
                              }`}
                              disabled={isOutOfStock}
                              onClick={() => alert(`Mua ngay sản phẩm: ${product.name}`)}
                            >
                              {isOutOfStock ? (
                                'Hết hàng'
                              ) : (
                                <>
                                  <i className="bi bi-lightning-fill me-1" />
                                  Mua ngay
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      {/* 3. Footer dùng chung */}
      <Footer />
    </div>
  );
}
