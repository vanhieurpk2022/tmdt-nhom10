import { Link, NavLink } from "react-router";
import type { ReactNode } from "react";
import "../../css/pages/profile.css";

interface AccountLayoutProps {
    children: ReactNode;
    breadcrumbCurrent: string;
}

export default function AccountLayout({ children, breadcrumbCurrent }: AccountLayoutProps) {
    return (
        <main className="profile-page bg-light py-4">
            <div className="container-fluid px-4 px-lg-5">
                {/* Breadcrumb */}
                <nav aria-label="breadcrumb" className="mb-4">
                    <ol className="breadcrumb mb-0 fs-7">
                        <li className="breadcrumb-item"><Link to="/" className="text-muted text-decoration-none">Trang chủ</Link></li>
                        <li className="breadcrumb-item"><Link to="/profile" className="text-muted text-decoration-none">Tài khoản khách hàng</Link></li>
                        <li className="breadcrumb-item active fw-bold text-dark" aria-current="page">{breadcrumbCurrent}</li>
                    </ol>
                </nav>

                {/* Header */}
                <div className="mb-4">
                    <h1 className="h2 fw-bold text-dark mb-2">Tài khoản của tôi</h1>
                    <p className="text-muted fs-7 mb-0">Quản lý thông tin cá nhân, bảo mật và các cài đặt tài khoản của bạn.</p>
                </div>

                <div className="row g-4">
                    {/* Sidebar */}
                    <div className="col-12 col-lg-3">
                        <div className="bg-white rounded-4 shadow-sm p-4 sticky-lg-top" style={{ top: "2rem", zIndex: 10 }}>
                            {/* Profile Info */}
                            <div className="d-flex align-items-center gap-3 mb-4">
                                <div className="profile-avatar-lg bg-primary bg-opacity-10 text-primary fw-bold rounded-circle d-flex align-items-center justify-content-center flex-shrink-0">
                                    H
                                </div>
                                <div>
                                    <div className="fw-bold text-dark">Trần Bảo Hoàng</div>
                                    <div className="text-muted fs-8">Khách hàng NORDIC</div>
                                </div>
                            </div>

                            {/* Menu */}
                            <ul className="list-unstyled profile-menu mb-4">
                                <li>
                                    <NavLink to="/profile" className={({ isActive }) => `text-decoration-none d-block px-3 py-2 rounded-3 fw-bold mb-2 ${isActive ? 'active text-primary bg-primary bg-opacity-10' : 'text-muted hover-bg-light'}`}>
                                        Hồ sơ cá nhân
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink to="/addresses" className={({ isActive }) => `text-decoration-none d-block px-3 py-2 rounded-3 fw-bold mb-2 ${isActive ? 'active text-primary bg-primary bg-opacity-10' : 'text-muted hover-bg-light'}`}>
                                        Sổ địa chỉ
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink to="/change-password" className={({ isActive }) => `text-decoration-none d-block px-3 py-2 rounded-3 fw-bold mb-2 ${isActive ? 'active text-primary bg-primary bg-opacity-10' : 'text-muted hover-bg-light'}`}>
                                        Đổi mật khẩu
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink to="/orders" className={({ isActive }) => `text-decoration-none d-block px-3 py-2 rounded-3 fw-bold mb-2 ${isActive ? 'active text-primary bg-primary bg-opacity-10' : 'text-muted hover-bg-light'}`}>
                                        Đơn hàng của tôi
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink to="/favorites" className={({ isActive }) => `text-decoration-none d-block px-3 py-2 rounded-3 fw-bold mb-2 ${isActive ? 'active text-primary bg-primary bg-opacity-10' : 'text-muted hover-bg-light'}`}>
                                        Sản phẩm yêu thích
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink to="/notifications" className={({ isActive }) => `text-decoration-none d-block px-3 py-2 rounded-3 fw-bold mb-2 ${isActive ? 'active text-primary bg-primary bg-opacity-10' : 'text-muted hover-bg-light'}`}>
                                        Thông báo
                                    </NavLink>
                                </li>
                            </ul>
                            
                            <hr className="text-muted opacity-25" />

                            <button className="btn btn-link text-primary text-decoration-none fw-bold px-3 w-100 text-start mt-2 p-0 logout-btn">
                                Đăng xuất
                            </button>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="col-12 col-lg-9">
                        {children}
                    </div>
                </div>
            </div>
        </main>
    );
}
