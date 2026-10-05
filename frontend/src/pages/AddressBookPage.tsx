import { Link } from "react-router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faLocationDot, faPhone, faUser } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import "../css/pages/profile.css";

export default function AddressBookPage() {
    const [showModal, setShowModal] = useState(false);

    return (
        <main className="profile-page bg-light py-4">
            <div className="container-fluid px-4 px-lg-5">
                {/* Breadcrumb */}
                <nav aria-label="breadcrumb" className="mb-4">
                    <ol className="breadcrumb mb-0 fs-7">
                        <li className="breadcrumb-item"><Link to="/" className="text-muted text-decoration-none">Trang chủ</Link></li>
                        <li className="breadcrumb-item"><Link to="/profile" className="text-muted text-decoration-none">Tài khoản khách hàng</Link></li>
                        <li className="breadcrumb-item active fw-bold text-dark" aria-current="page">Sổ địa chỉ</li>
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
                        <div className="bg-white rounded-4 shadow-sm p-4">
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
                                    <Link to="/addresses" className="text-decoration-none d-block px-3 py-2 rounded-3 active fw-bold text-primary bg-primary bg-opacity-10 mb-2">
                                        Sổ địa chỉ
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/change-password" className="text-decoration-none d-block px-3 py-2 rounded-3 text-muted fw-bold hover-bg-light mb-2">
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
                        <div className="bg-white rounded-4 shadow-sm p-4 px-lg-5 pb-lg-5 pt-lg-4">
                            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
                                <div>
                                    <h2 className="h4 fw-bold text-dark mb-2">Sổ địa chỉ</h2>
                                    <p className="text-muted fs-7 mb-0">Quản lý địa chỉ giao hàng và thông tin liên hệ của bạn.</p>
                                </div>
                                <button 
                                    className="btn btn-primary fw-bold px-4 py-2 rounded-3 d-flex align-items-center gap-2 text-nowrap"
                                    onClick={() => setShowModal(true)}
                                >
                                    <FontAwesomeIcon icon={faPlus} />
                                    Thêm địa chỉ mới
                                </button>
                            </div>

                            {/* Address List */}
                            <div className="d-flex flex-column gap-3">
                                {/* Default Address */}
                                <div className="border border-primary rounded-4 p-4 bg-primary bg-opacity-10 position-relative">
                                    <span className="badge bg-primary position-absolute top-0 end-0 mt-3 me-3 px-3 py-2 rounded-pill">
                                        Mặc định
                                    </span>
                                    
                                    <div className="d-flex flex-column gap-2 mb-3">
                                        <div className="d-flex align-items-center gap-2">
                                            <FontAwesomeIcon icon={faUser} className="text-muted" style={{ width: "16px" }} />
                                            <span className="fw-bold fs-5 text-dark">Trần Bảo Hoàng</span>
                                        </div>
                                        <div className="d-flex align-items-center gap-2 text-muted">
                                            <FontAwesomeIcon icon={faPhone} style={{ width: "16px" }} />
                                            <span>(+84) 901 234 567</span>
                                        </div>
                                        <div className="d-flex align-items-start gap-2 text-muted">
                                            <FontAwesomeIcon icon={faLocationDot} className="mt-1" style={{ width: "16px" }} />
                                            <span>123 Đường Nguyễn Văn Linh, Phường Tân Phong, Quận 7, Thành phố Hồ Chí Minh</span>
                                        </div>
                                    </div>
                                    
                                    <div className="d-flex gap-2">
                                        <button className="btn btn-sm btn-outline-primary fw-bold px-3">Cập nhật</button>
                                    </div>
                                </div>

                                {/* Address 2 */}
                                <div className="border rounded-4 p-4 bg-light bg-opacity-50">
                                    <div className="d-flex flex-column gap-2 mb-3">
                                        <div className="d-flex align-items-center gap-2">
                                            <FontAwesomeIcon icon={faUser} className="text-muted" style={{ width: "16px" }} />
                                            <span className="fw-bold fs-5 text-dark">Trần Bảo Hoàng</span>
                                        </div>
                                        <div className="d-flex align-items-center gap-2 text-muted">
                                            <FontAwesomeIcon icon={faPhone} style={{ width: "16px" }} />
                                            <span>(+84) 998 765 432</span>
                                        </div>
                                        <div className="d-flex align-items-start gap-2 text-muted">
                                            <FontAwesomeIcon icon={faLocationDot} className="mt-1" style={{ width: "16px" }} />
                                            <span>Tòa nhà AB Tower, 76A Lê Lai, Phường Bến Thành, Quận 1, Thành phố Hồ Chí Minh</span>
                                        </div>
                                    </div>
                                    
                                    <div className="d-flex gap-2">
                                        <button className="btn btn-sm btn-outline-dark fw-bold px-3">Cập nhật</button>
                                        <button className="btn btn-sm btn-outline-danger fw-bold px-3">Xóa</button>
                                        <button className="btn btn-sm btn-link text-muted text-decoration-none fw-bold ms-auto">Đặt làm mặc định</button>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>

            {/* Add Address Modal */}
            {showModal && (
                <>
                    <div className="modal fade show" style={{ display: 'block', zIndex: 1055, backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex={-1} aria-modal="true" role="dialog">
                        <div className="modal-dialog modal-dialog-centered modal-lg">
                            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                                <div className="modal-header border-0 bg-light p-4 pb-3">
                                    <h5 className="modal-title fw-bold text-dark">Thêm địa chỉ mới</h5>
                                    <button type="button" className="btn-close" onClick={() => setShowModal(false)} aria-label="Close"></button>
                                </div>
                                <div className="modal-body p-4 pt-3">
                                    <form onSubmit={(e) => { e.preventDefault(); setShowModal(false); }}>
                                        <div className="row g-3 mb-3">
                                            <div className="col-12 col-md-6">
                                                <label className="form-label fw-bold text-dark fs-7">Họ và tên</label>
                                                <input type="text" className="form-control rounded-3 py-2 text-muted" placeholder="Nhập họ và tên" />
                                            </div>
                                            <div className="col-12 col-md-6">
                                                <label className="form-label fw-bold text-dark fs-7">Số điện thoại</label>
                                                <input type="text" className="form-control rounded-3 py-2 text-muted" placeholder="Nhập số điện thoại" />
                                            </div>
                                        </div>
                                        
                                        <div className="row g-3 mb-3">
                                            <div className="col-12 col-md-4">
                                                <label className="form-label fw-bold text-dark fs-7">Tỉnh/Thành phố</label>
                                                <select className="form-select rounded-3 py-2 text-muted">
                                                    <option value="">Chọn Tỉnh/Thành phố</option>
                                                    <option value="sg">TP Hồ Chí Minh</option>
                                                    <option value="hn">Hà Nội</option>
                                                </select>
                                            </div>
                                            <div className="col-12 col-md-4">
                                                <label className="form-label fw-bold text-dark fs-7">Quận/Huyện</label>
                                                <select className="form-select rounded-3 py-2 text-muted">
                                                    <option value="">Chọn Quận/Huyện</option>
                                                    <option value="q1">Quận 1</option>
                                                    <option value="q7">Quận 7</option>
                                                </select>
                                            </div>
                                            <div className="col-12 col-md-4">
                                                <label className="form-label fw-bold text-dark fs-7">Phường/Xã</label>
                                                <select className="form-select rounded-3 py-2 text-muted">
                                                    <option value="">Chọn Phường/Xã</option>
                                                    <option value="bt">Phường Bến Thành</option>
                                                    <option value="tp">Phường Tân Phong</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label fw-bold text-dark fs-7">Địa chỉ cụ thể</label>
                                            <textarea className="form-control rounded-3 py-2 text-muted" rows={3} placeholder="Số nhà, tên đường..."></textarea>
                                        </div>

                                        <div className="form-check mb-4">
                                            <input className="form-check-input" type="checkbox" id="defaultAddress" />
                                            <label className="form-check-label fs-7 text-dark" htmlFor="defaultAddress">
                                                Đặt làm địa chỉ mặc định
                                            </label>
                                        </div>

                                        <div className="d-flex justify-content-end gap-3">
                                            <button type="button" className="btn btn-white border fw-bold px-4 py-2 rounded-3 text-dark" onClick={() => setShowModal(false)}>
                                                Hủy
                                            </button>
                                            <button type="submit" className="btn btn-primary fw-bold px-4 py-2 rounded-3">
                                                LƯU ĐỊA CHỈ
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </main>
    );
}
