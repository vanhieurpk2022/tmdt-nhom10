import { Link } from "react-router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faShieldHalved } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import "../css/pages/profile.css";

export default function ChangePasswordPage() {
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    return (
        <main className="profile-page bg-light py-4">
            <div className="container-fluid px-4 px-lg-5">
                {/* Breadcrumb */}
                <nav aria-label="breadcrumb" className="mb-4">
                    <ol className="breadcrumb mb-0 fs-7">
                        <li className="breadcrumb-item"><Link to="/" className="text-muted text-decoration-none">Trang chủ</Link></li>
                        <li className="breadcrumb-item"><Link to="/profile" className="text-muted text-decoration-none">Tài khoản khách hàng</Link></li>
                        <li className="breadcrumb-item active fw-bold text-dark" aria-current="page">Đổi mật khẩu</li>
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
                        <div className="bg-white rounded-4 shadow-sm p-4 h-100">
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
                                    <Link to="/profile" className="text-decoration-none d-block px-3 py-2 rounded-3 text-muted fw-bold hover-bg-light mb-2">
                                        Hồ sơ cá nhân
                                    </Link>
                                </li>
                                <li>
                                    <Link to="#" className="text-decoration-none d-block px-3 py-2 rounded-3 text-muted fw-bold hover-bg-light mb-2">
                                        Sổ địa chỉ
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/change-password" className="text-decoration-none d-block px-3 py-2 rounded-3 active fw-bold text-primary bg-primary bg-opacity-10 mb-2">
                                        Đổi mật khẩu
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/orders" className="text-decoration-none d-block px-3 py-2 rounded-3 text-muted fw-bold hover-bg-light mb-2">
                                        Đơn hàng của tôi
                                    </Link>
                                </li>
                                <li>
                                    <Link to="#" className="text-decoration-none d-block px-3 py-2 rounded-3 text-muted fw-bold hover-bg-light mb-2">
                                        Sản phẩm yêu thích
                                    </Link>
                                </li>
                                <li>
                                    <Link to="#" className="text-decoration-none d-block px-3 py-2 rounded-3 text-muted fw-bold hover-bg-light mb-2">
                                        Thông báo
                                    </Link>
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
                        <div className="bg-white rounded-4 shadow-sm p-4 px-lg-5 pb-lg-5 pt-lg-4 h-100">
                            <h2 className="h4 fw-bold text-dark mb-2">Đổi mật khẩu</h2>
                            <p className="text-muted fs-7 mb-4">Cập nhật mật khẩu định kỳ để tăng mức độ an toàn cho tài khoản Oilia của bạn.</p>

                            {/* Security Alert */}
                            <div className="d-flex align-items-center p-3 rounded-4 border bg-light bg-opacity-50 mb-4 gap-3">
                                <div className="text-success fs-3 px-2">
                                    <FontAwesomeIcon icon={faShieldHalved} />
                                </div>
                                <div>
                                    <div className="fw-bold text-dark mb-1">Bảo mật tài khoản</div>
                                    <div className="text-muted fs-8">Hãy sử dụng mật khẩu mạnh và không dùng lại mật khẩu từ các dịch vụ khác.</div>
                                </div>
                            </div>

                            {/* Form */}
                            <form>
                                <div className="mb-4">
                                    <label className="form-label fw-bold text-dark fs-7">Mật khẩu hiện tại</label>
                                    <div className="position-relative">
                                        <input type={showCurrent ? "text" : "password"} className="form-control rounded-3 py-2 text-muted pe-5" placeholder="Nhập mật khẩu hiện tại" />
                                        <button type="button" className="btn position-absolute top-50 end-0 translate-middle-y text-muted border-0" onClick={() => setShowCurrent(!showCurrent)}>
                                            <FontAwesomeIcon icon={faEye} />
                                        </button>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label className="form-label fw-bold text-dark fs-7">Mật khẩu mới</label>
                                    <div className="position-relative">
                                        <input type={showNew ? "text" : "password"} className="form-control rounded-3 py-2 text-muted pe-5" placeholder="Nhập mật khẩu mới" />
                                        <button type="button" className="btn position-absolute top-50 end-0 translate-middle-y text-muted border-0" onClick={() => setShowNew(!showNew)}>
                                            <FontAwesomeIcon icon={faEye} />
                                        </button>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label className="form-label fw-bold text-dark fs-7">Xác nhận mật khẩu mới</label>
                                    <div className="position-relative">
                                        <input type={showConfirm ? "text" : "password"} className="form-control rounded-3 py-2 text-muted pe-5" placeholder="Nhập lại mật khẩu mới" />
                                        <button type="button" className="btn position-absolute top-50 end-0 translate-middle-y text-muted border-0" onClick={() => setShowConfirm(!showConfirm)}>
                                            <FontAwesomeIcon icon={faEye} />
                                        </button>
                                    </div>
                                </div>

                                {/* Password Rules Note */}
                                <div className="bg-light rounded-4 p-4 mb-2 mt-4">
                                    <div className="fw-bold text-dark mb-2 fs-7">Mật khẩu mới nên đáp ứng</div>
                                    <ul className="text-muted fs-7 mb-0 list-unstyled">
                                        <li className="mb-1"><span className="text-danger me-2">*</span>Ít nhất 8 ký tự</li>
                                        <li className="mb-1"><span className="text-danger me-2">*</span>Bao gồm chữ và số</li>
                                        <li className="mb-1"><span className="text-danger me-2">*</span>Nên có chữ hoa và ký tự đặc biệt</li>
                                        <li className="mb-0"><span className="text-danger me-2">*</span>Không trùng mật khẩu cũ</li>
                                    </ul>
                                </div>
                                <div className="text-muted fs-8 mb-4 px-2">
                                    Sau khi đổi mật khẩu thành công, hãy sử dụng mật khẩu mới cho những lần đăng nhập tiếp theo.
                                </div>

                                {/* Actions */}
                                <div className="d-flex justify-content-end gap-3 mt-4">
                                    <button type="button" className="btn btn-white border fw-bold px-4 py-2 rounded-3 text-dark">
                                        Hủy
                                    </button>
                                    <button type="submit" className="btn btn-primary fw-bold px-4 py-2 rounded-3">
                                        CẬP NHẬT
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
