import { useState, useRef, useEffect } from 'react';
import '../assets/header.css';

interface User {
  name: string;
  email: string;
  isVip?: boolean;
}

interface HeaderProps {
  user?: User;
  cartCount?: number;
  cartTotal?: number;
  activePage?: string;
  onLogout?: () => void;
}

export default function Header({
  user = {
    name: 'Minh Hậu',
    email: 'minhhau@nordic.vn',
    isVip: true,
  },
  cartCount = 3,
  cartTotal = 189.0,
  activePage,
  onLogout,
}: HeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Tự động nhận diện trang hiện tại nếu không truyền prop
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
  const currentActive = activePage || (currentPath.includes('tat-ca') ? 'tat-ca' : 'home');

  // Đóng dropdown khi click bên ngoài
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Phím tắt Ctrl+K hoặc ⌘+K để focus ô tìm kiếm
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header className="border-bottom bg-white sticky-top">
      {/* 1. Thanh thông báo trên cùng */}
      <div className="header-topbar text-white py-1">
        <div className="container-fluid px-lg-5 px-3">
          <div className="d-flex align-items-center justify-content-between">
            <div className="flex-grow-1 text-center small text-light">
              FREE SHIPPING ON ORDERS OVER $150 &nbsp;•&nbsp; Sử dụng mã:{' '}
              <strong className="text-white">TINHDAU10</strong> giảm 10%
            </div>
            <div>
              <a href="#support" className="text-secondary small text-decoration-none link-light">
                Help &amp; Support
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Navbar chính */}
      <nav className="py-2">
        <div className="container-fluid px-lg-5 px-3">
          <div className="d-flex align-items-center justify-content-between gap-3">
            {/* Logo & Menu bên trái */}
            <div className="d-flex align-items-center gap-4">
              <a href="/" className="d-flex align-items-center gap-2 text-decoration-none text-dark">
                <div className="brand-icon bg-dark text-white d-flex align-items-center justify-content-center shadow-sm">
                  <i className="bi bi-box2-heart-fill fs-5" />
                </div>
                <span className="fs-4 fw-bold">Oilia</span>
              </a>

              {/* Menu liên kết */}
              <ul className="d-none d-lg-flex align-items-center gap-1 list-unstyled mb-0">
                <li>
                  <a
                    href="/"
                    className={`text-decoration-none px-3 py-2 rounded-2 text-nowrap ${
                      currentActive === 'home' ? 'text-danger fw-bold' : 'text-dark fw-medium'
                    }`}
                  >
                    Trang chủ
                  </a>
                </li>
                <li>
                  <a
                    href="/tat-ca"
                    className={`text-decoration-none px-3 py-2 rounded-2 text-nowrap ${
                      currentActive === 'tat-ca' ? 'text-danger fw-bold' : 'text-dark fw-medium'
                    }`}
                  >
                    Tất cả
                  </a>
                </li>
                <li>
                  <a
                    href="#workshop"
                    className={`text-decoration-none px-3 py-2 rounded-2 text-nowrap ${
                      currentActive === 'workshop' ? 'text-danger fw-bold' : 'text-dark fw-medium'
                    }`}
                  >
                    Xưởng
                  </a>
                </li>
                <li>
                  <a
                    href="#sets"
                    className={`text-decoration-none px-3 py-2 rounded-2 text-nowrap ${
                      currentActive === 'sets' ? 'text-danger fw-bold' : 'text-dark fw-medium'
                    }`}
                  >
                    Bộ sản phẩm
                  </a>
                </li>
                <li>
                  <a
                    href="#deals"
                    className={`text-decoration-none px-3 py-2 rounded-2 text-nowrap ${
                      currentActive === 'deals' ? 'text-danger fw-bold' : 'text-dark fw-medium'
                    }`}
                  >
                    Ưu đãi
                  </a>
                </li>
              </ul>
            </div>

            {/* Ô tìm kiếm ở giữa */}
            <div className="search-wrapper position-relative flex-grow-1">
              <i className="bi bi-search search-icon-left position-absolute text-secondary" />
              <input
                ref={searchInputRef}
                type="text"
                className="form-control rounded-pill bg-light border-light-subtle ps-5 pe-5 py-2 fs-7"
                id="headerSearchInput"
                placeholder="Tìm kiếm tinh dầu, thương hiệu..."
                autoComplete="off"
              />
              <kbd className="search-shortcut position-absolute bg-white border rounded text-secondary px-2 py-0">
                ⌘K
              </kbd>
            </div>

            {/* Khu vực bên phải: User Profile & Giỏ hàng */}
            <div className="d-flex align-items-center gap-2">
              {/* User Dropdown */}
              <div className="dropdown position-relative" ref={dropdownRef}>
                <button
                  className="btn border-0 d-flex align-items-center gap-2 p-1 text-start"
                  type="button"
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  aria-expanded={dropdownOpen}
                >
                  {/* Avatar */}
                  <div className="user-avatar-circle rounded-circle bg-danger text-white fw-bold d-flex align-items-center justify-content-center shadow-sm">
                    MH
                  </div>

                  {/* Tên + Email */}
                  <div className="d-none d-md-flex flex-column lh-sm">
                    <div className="d-flex align-items-center gap-1">
                      <span className="fw-semibold text-dark fs-7">{user.name}</span>
                      {user.isVip && (
                        <span
                          className="badge bg-danger-subtle text-danger border border-danger-subtle rounded-1 p-1"
                          style={{ fontSize: '9px' }}
                        >
                          VIP
                        </span>
                      )}
                      <i
                        className={`bi bi-chevron-down text-secondary transition ${
                          dropdownOpen ? 'rotate-180' : ''
                        }`}
                        style={{
                          fontSize: '10px',
                          transform: dropdownOpen ? 'rotate(180deg)' : 'none',
                          transition: 'transform 0.2s',
                        }}
                      />
                    </div>
                    <span className="text-secondary" style={{ fontSize: '11px' }}>
                      {user.email}
                    </span>
                  </div>
                </button>

                {/* Menu xổ xuống */}
                <ul
                  className={`dropdown-menu dropdown-menu-end dropdown-menu-custom rounded-4 p-2 border-0 shadow-lg ${
                    dropdownOpen ? 'show d-block' : ''
                  }`}
                  style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    zIndex: 1050,
                  }}
                >
                  <li>
                    <a
                      className="dropdown-item rounded-3 d-flex align-items-center gap-3 py-2 active bg-danger-subtle text-danger fw-medium"
                      href="#profile"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <i className="bi bi-person fs-5" />
                      <span className="flex-grow-1">Hồ sơ cá nhân</span>
                      <span className="p-1 bg-danger rounded-circle" />
                    </a>
                  </li>
                  <li>
                    <a
                      className="dropdown-item rounded-3 d-flex align-items-center gap-3 py-2 text-dark"
                      href="#orders"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <i className="bi bi-box-seam text-secondary fs-5" />
                      <span className="flex-grow-1">Đơn hàng của tôi</span>
                      <span className="badge-delivery badge rounded-pill px-2 py-1">3 đang giao</span>
                    </a>
                  </li>
                  <li>
                    <a
                      className="dropdown-item rounded-3 d-flex align-items-center gap-3 py-2 text-dark"
                      href="#wishlist"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <i className="bi bi-suit-heart text-secondary fs-5" />
                      <span className="flex-grow-1">Sản phẩm yêu thích</span>
                    </a>
                  </li>
                  <li>
                    <a
                      className="dropdown-item rounded-3 d-flex align-items-center gap-3 py-2 text-dark"
                      href="#community"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <i className="bi bi-chat-left-dots text-secondary fs-5" />
                      <span className="flex-grow-1">Cộng đồng người sành</span>
                      <span className="text-danger fw-semibold small">• Mới</span>
                    </a>
                  </li>
                  <li>
                    <a
                      className="dropdown-item rounded-3 d-flex align-items-center gap-3 py-2 text-dark"
                      href="#settings"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <i className="bi bi-gear text-secondary fs-5" />
                      <span className="flex-grow-1">Cài đặt tài khoản</span>
                    </a>
                  </li>
                  <li>
                    <a
                      className="dropdown-item rounded-3 d-flex align-items-center gap-3 py-2 text-dark"
                      href="#support"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <i className="bi bi-info-circle text-secondary fs-5" />
                      <span className="flex-grow-1">Trung tâm hỗ trợ</span>
                      <span className="text-secondary small">24/7</span>
                    </a>
                  </li>
                  <li>
                    <hr className="dropdown-divider my-2" />
                  </li>
                  <li>
                    <button
                      className="dropdown-item rounded-3 d-flex align-items-center gap-3 py-2 text-danger"
                      type="button"
                      onClick={() => {
                        setDropdownOpen(false);
                        if (onLogout) {
                          onLogout();
                        } else {
                          alert('Đã đăng xuất!');
                        }
                      }}
                    >
                      <i className="bi bi-box-arrow-right fs-5" />
                      <span className="flex-grow-1">Đăng xuất</span>
                    </button>
                  </li>
                </ul>
              </div>

              {/* Giỏ hàng */}
              <a
                href="#cart"
                className="d-flex align-items-center gap-2 text-decoration-none text-dark p-2 rounded-3"
              >
                <div className="position-relative fs-4">
                  <i className="bi bi-bag" />
                  {cartCount > 0 && (
                    <span
                      className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger border border-white"
                      style={{ fontSize: '10px' }}
                    >
                      {cartCount}
                    </span>
                  )}
                </div>
                <div className="d-none d-sm-flex flex-column lh-1">
                  <span
                    className="text-uppercase text-secondary fw-bold"
                    style={{ fontSize: '9px', letterSpacing: '0.5px' }}
                  >
                    Cart
                  </span>
                  <span className="fw-bold fs-6">${cartTotal.toFixed(2)}</span>
                </div>
              </a>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
