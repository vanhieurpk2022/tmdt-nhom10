import { Link } from "react-router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleCheck } from "@fortawesome/free-solid-svg-icons";
import "../css/pages/profile.css";

export default function ProfilePage() {
    return (
        <main className="profile-page bg-light py-4">
            <div className="container-fluid px-4 px-lg-5">
                {/* Breadcrumb */}
                <nav aria-label="breadcrumb" className="mb-4">
                    <ol className="breadcrumb mb-0 fs-7">
                        <li className="breadcrumb-item"><Link to="/" className="text-muted text-decoration-none">Trang chủ</Link></li>
                        <li className="breadcrumb-item"><Link to="/profile" className="text-muted text-decoration-none">Tài khoản khách hàng</Link></li>
                        <li className="breadcrumb-item active fw-bold text-dark" aria-current="page">Hồ sơ cá nhân</li>
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
                                    <Link to="/profile" className="text-decoration-none d-block px-3 py-2 rounded-3 active fw-bold text-primary bg-primary bg-opacity-10 mb-2">
                                        Hồ sơ cá nhân
                                    </Link>
                                </li>
                                <li>
                                    <Link to="#" className="text-decoration-none d-block px-3 py-2 rounded-3 text-muted fw-bold hover-bg-light mb-2">
                                        Sổ địa chỉ
                                    </Link>
                                </li>
                                <li>
                                    <Link to="#" className="text-decoration-none d-block px-3 py-2 rounded-3 text-muted fw-bold hover-bg-light mb-2">
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
                        <div className="bg-white rounded-4 shadow-sm p-4 p-lg-5">
                            <h2 className="h4 fw-bold text-dark mb-2">Thông tin cá nhân</h2>
                            <p className="text-muted fs-7 mb-4">Cập nhật hồ sơ để mua sắm, giao nhận và chăm sóc khách hàng thuận tiện hơn.</p>

                            {/* Main Profile Card */}
                            <div className="d-flex flex-column flex-md-row align-items-center justify-content-between p-3 rounded-4 border bg-light bg-opacity-50 mb-4 gap-3">
                                <div className="d-flex align-items-center gap-3">
                                    <div className="profile-avatar-xl bg-primary bg-opacity-10 text-primary fw-bold rounded-circle d-flex align-items-center justify-content-center flex-shrink-0">
                                        H
                                    </div>
                                    <div>
                                        <div className="fw-bold text-dark fs-5 mb-1">Trần Bảo Hoàng</div>
                                        <div className="text-muted fs-8">Email đã xác thực • Tài khoản khách hàng đang hoạt động</div>
                                    </div>
                                </div>
                                <button className="btn btn-dark fw-bold px-4 py-2 rounded-3 fs-7 text-nowrap">
                                    Thay ảnh đại diện
                                </button>
                            </div>

                            {/* Form */}
                            <form>
                                <div className="row g-4 mb-4">
                                    <div className="col-12 col-md-6">
                                        <label className="form-label fw-bold text-dark fs-7">Họ và tên</label>
                                        <input type="text" className="form-control rounded-3 py-2 text-muted" defaultValue="Trần Bảo Hoàng" />
                                    </div>
                                    <div className="col-12 col-md-6">
                                        <label className="form-label fw-bold text-dark fs-7">Số điện thoại</label>
                                        <input type="text" className="form-control rounded-3 py-2 text-muted" defaultValue="09xxxxxxxx" />
                                    </div>
                                    <div className="col-12 col-md-6">
                                        <label className="form-label fw-bold text-dark fs-7">Email</label>
                                        <div className="position-relative">
                                            <input type="email" className="form-control rounded-3 py-2 text-muted pe-5" defaultValue="name@email.com" readOnly />
                                            <span className="position-absolute top-50 end-0 translate-middle-y me-3 badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 rounded-pill px-2 py-1 fs-8 d-flex align-items-center gap-1">
                                                <FontAwesomeIcon icon={faCircleCheck} /> Đã xác thực
                                            </span>
                                        </div>
                                    </div>
                                    <div className="col-12 col-md-6">
                                        <label className="form-label fw-bold text-dark fs-7">Ngày sinh</label>
                                        <input type="text" className="form-control rounded-3 py-2 text-muted" defaultValue="01/01/2003" />
                                    </div>
                                    <div className="col-12 col-md-6">
                                        <label className="form-label fw-bold text-dark fs-7">Giới tính</label>
                                        <input type="text" className="form-control rounded-3 py-2 text-muted" defaultValue="Nam" />
                                    </div>
                                    <div className="col-12 col-md-6">
                                        <label className="form-label fw-bold text-dark fs-7">Khu vực nhận hàng ưu tiên</label>
                                        <input type="text" className="form-control rounded-3 py-2 text-muted" defaultValue="Thành phố Hồ Chí Minh" />
                                    </div>
                                </div>

                                {/* Note */}
                                <div className="bg-light rounded-4 p-4 mb-4">
                                    <div className="fw-bold text-dark mb-1 fs-7">Lưu ý</div>
                                    <p className="text-muted fs-7 mb-0">
                                        Thông tin hồ sơ được dùng để hỗ trợ đặt hàng, giao nhận và chăm sóc khách hàng trên Oilia.<br />
                                        Bạn có thể cập nhật sổ địa chỉ và đổi mật khẩu ở menu bên trái khi cần.
                                    </p>
                                </div>

                                {/* Actions */}
                                <div className="d-flex justify-content-end gap-3">
                                    <button type="button" className="btn btn-white border fw-bold px-4 py-2 rounded-3 text-dark">
                                        Hủy
                                    </button>
                                    <button type="submit" className="btn btn-primary fw-bold px-4 py-2 rounded-3">
                                        Lưu
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
