import '../assets/footer.css';

export default function Footer() {
  return (
    <footer className="bg-light border-top">
      {/* Main Content */}
      <div className="container-fluid px-lg-5 px-4 py-5">
        <div className="row g-5">
          {/* Logo & Giới thiệu */}
          <div className="col-12 col-lg-3">
            <a href="/" className="d-flex align-items-center gap-2 text-decoration-none mb-3">
              <div className="footer-brand-icon d-flex align-items-center justify-content-center">
                <i className="bi bi-box2-heart-fill text-white fs-5" />
              </div>
              <span className="fs-4 fw-bold text-dark">Oilia</span>
            </a>
            <p className="text-secondary small lh-lg mb-3">
              Chào mừng đến với Oilia - nơi thiên nhiên gặp gỡ tinh hoa. Chúng tôi cung cấp các dòng tinh dầu thuần khiết,
              được chưng cất tự nhiên, mang lại không gian sống thư thái cho bạn.
            </p>
          </div>

          {/* Danh mục */}
          <div className="col-6 col-lg-2">
            <p className="footer-col-title mb-3">Danh mục</p>
            <ul className="footer-link-list list-unstyled">
              <li><a href="#natural">Tinh dầu thiên nhiên</a></li>
              <li><a href="#aroma">Tinh dầu xông phòng</a></li>
              <li><a href="#massage">Tinh dầu massage</a></li>
              <li><a href="#diffuser">Máy khuếch tán</a></li>
              <li><a href="#gift">Combo quà tặng</a></li>
              <li><a href="#organic">Hữu cơ &amp; Thuần chay</a></li>
            </ul>
          </div>

          {/* Mua hàng */}
          <div className="col-6 col-lg-2">
            <p className="footer-col-title mb-3">Mua hàng</p>
            <ul className="footer-link-list list-unstyled">
              <li><a href="#payment">Phương thức thanh toán</a></li>
              <li><a href="#shipping">Tùy chọn giao hàng</a></li>
              <li><a href="#protection">Bảo vệ người mua</a></li>
              <li><a href="#wholesale">Mua sỉ</a></li>
              <li><a href="#affiliate">Chương trình CTV</a></li>
            </ul>
          </div>

          {/* Hỗ trợ */}
          <div className="col-6 col-lg-2">
            <p className="footer-col-title mb-3">Hỗ trợ</p>
            <ul className="footer-link-list list-unstyled">
              <li><a href="#faq">Câu hỏi thường gặp</a></li>
              <li><a href="#contact">Liên hệ chúng tôi</a></li>
              <li><a href="#privacy">Chính sách bảo mật</a></li>
              <li><a href="#terms">Điều khoản sử dụng</a></li>
              <li><a href="#warranty">Chính sách đổi trả</a></li>
            </ul>
          </div>

          {/* Kết nối & Bản tin */}
          <div className="col-12 col-lg-3">
            <p className="footer-col-title mb-3">Đăng ký nhận tin</p>
            <p className="text-secondary small mb-3">
              Nhận voucher 10% cho đơn hàng đầu tiên và cập nhật ưu đãi mới nhất.
            </p>
            <div className="input-group mb-3">
              <input
                type="email"
                className="form-control form-control-sm"
                placeholder="Email của bạn..."
                aria-label="Email của bạn"
              />
              <button className="btn btn-dark btn-sm" type="button">
                Đăng ký
              </button>
            </div>
            <div className="d-flex gap-3 text-secondary fs-5 mt-2">
              <a href="#facebook" className="text-secondary"><i className="bi bi-facebook" /></a>
              <a href="#instagram" className="text-secondary"><i className="bi bi-instagram" /></a>
              <a href="#tiktok" className="text-secondary"><i className="bi bi-tiktok" /></a>
              <a href="#youtube" className="text-secondary"><i className="bi bi-youtube" /></a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Copyright */}
      <div className="border-top py-3 text-center text-secondary small">
        <div className="container-fluid px-lg-5">
          &copy; {new Date().getFullYear()} Oilia Inc. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
