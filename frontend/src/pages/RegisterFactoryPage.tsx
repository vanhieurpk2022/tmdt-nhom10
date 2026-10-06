import { Eye } from 'react-bootstrap-icons';

export default function RegisterFactoryPage() {
    return (
        <div className="login-page d-flex align-items-center justify-content-center bg-light" style={{ minHeight: 'calc(100vh - 100px)' }}>
            <div className="container py-5">

                <div className="row g-0 rounded-4 overflow-hidden shadow-lg login-container bg-white mx-auto" style={{ maxWidth: '1100px' }}>


                    <div className="col-lg-5 login-left-panel p-4 p-md-5 text-white d-flex flex-column justify-content-center position-relative" style={{ backgroundColor: '#111827' }}>
                        <div className="position-absolute top-0 end-0 translate-middle-y" style={{ width: '300px', height: '300px', backgroundColor: 'rgba(225, 29, 72, 0.1)', borderRadius: '50%', filter: 'blur(50px)' }}></div>
                        <div className="position-absolute bottom-0 start-0 translate-middle-y" style={{ width: '200px', height: '200px', backgroundColor: 'rgba(52, 82, 55, 0.2)', borderRadius: '50%', filter: 'blur(50px)' }}></div>

                        <div className="position-relative z-1">
                            <h6 className="text-primary fw-bold mb-3 text-uppercase" style={{ fontSize: '12px', letterSpacing: '1px' }}>Oilia • SÀN KẾT NỐI TINH DẦU</h6>
                            <h1 className="fw-bolder mb-3 display-6" style={{ lineHeight: '1.3' }}>Kết nối khách hàng<br />với các xưởng tinh dầu</h1>
                            <p className="text-light mb-5 opacity-75" style={{ fontSize: '15px', lineHeight: '1.6' }}>
                                Khám phá sản phẩm từ nhiều xưởng cung cấp, theo dõi thông tin nguồn gốc và quản lý đơn hàng tập trung trên NORDIC.
                            </p>

                            <div className="bg-dark bg-opacity-50 p-4 rounded-4 mb-4 border border-secondary border-opacity-25 shadow-sm">
                                <h6 className="fw-bold mb-4 text-white" style={{ fontSize: '14px' }}>Hành trình trên NORDIC</h6>
                                <div className="d-flex flex-column gap-3 position-relative journey-steps">
                                    <div className="d-flex align-items-center bg-dark rounded-3 p-3 border border-secondary border-opacity-25 position-relative z-1">
                                        <div className="rounded-circle bg-white d-flex align-items-center justify-content-center me-3" style={{ width: '24px', height: '24px', flexShrink: 0 }}>
                                            <div className="rounded-circle bg-success" style={{ width: '10px', height: '10px' }}></div>
                                        </div>
                                        <div>
                                            <h6 className="mb-1 text-white fw-bold" style={{ fontSize: '14px' }}>Xưởng tinh dầu</h6>
                                            <p className="mb-0 text-white opacity-50" style={{ fontSize: '12px' }}>Đăng sản phẩm và cung cấp thông tin nguồn gốc</p>
                                        </div>
                                    </div>
                                    <div className="d-flex align-items-center bg-dark rounded-3 p-3 border border-secondary border-opacity-25 position-relative z-1">
                                        <div className="rounded-circle bg-white d-flex align-items-center justify-content-center me-3" style={{ width: '24px', height: '24px', flexShrink: 0 }}>
                                            <div className="rounded-circle bg-danger" style={{ width: '10px', height: '10px' }}></div>
                                        </div>
                                        <div>
                                            <h6 className="mb-1 text-white fw-bold" style={{ fontSize: '14px' }}>Oilia</h6>
                                            <p className="mb-0 text-white opacity-50" style={{ fontSize: '12px' }}>Kết nối, hỗ trợ giao dịch và quản lý đơn hàng</p>
                                        </div>
                                    </div>
                                    <div className="d-flex align-items-center bg-dark rounded-3 p-3 border border-secondary border-opacity-25 position-relative z-1">
                                        <div className="rounded-circle bg-white d-flex align-items-center justify-content-center me-3" style={{ width: '24px', height: '24px', flexShrink: 0 }}>
                                            <div className="rounded-circle bg-warning" style={{ width: '10px', height: '10px' }}></div>
                                        </div>
                                        <div>
                                            <h6 className="mb-1 text-white fw-bold" style={{ fontSize: '14px' }}>Khách hàng</h6>
                                            <p className="mb-0 text-white opacity-50" style={{ fontSize: '12px' }}>Tìm kiếm, lựa chọn và mua sản phẩm phù hợp</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="d-flex flex-wrap gap-2 mb-4">
                                <span className="badge rounded-pill bg-dark border border-secondary border-opacity-25 px-3 py-2 fw-normal d-flex align-items-center gap-2" style={{ fontSize: '12px' }}><div className="rounded-circle bg-success" style={{ width: '6px', height: '6px' }}></div> Nhiều xưởng cung cấp</span>
                                <span className="badge rounded-pill bg-dark border border-secondary border-opacity-25 px-3 py-2 fw-normal d-flex align-items-center gap-2" style={{ fontSize: '12px' }}><div className="rounded-circle bg-warning" style={{ width: '6px', height: '6px' }}></div> Thông tin nguồn gốc</span>
                                <span className="badge rounded-pill bg-dark border border-secondary border-opacity-25 px-3 py-2 fw-normal d-flex align-items-center gap-2" style={{ fontSize: '12px' }}><div className="rounded-circle bg-danger" style={{ width: '6px', height: '6px' }}></div> Quản lý đơn hàng tập trung</span>
                            </div>

                            <p className="text-white opacity-50 mb-0" style={{ fontSize: '13px' }}>
                                Mua sắm tinh dầu thuận tiện hơn, trong một trải nghiệm thống nhất.
                            </p>
                        </div>
                    </div>


                    <div className="col-lg-7 bg-white p-4 p-md-5 d-flex flex-column justify-content-center position-relative">
                        <div className="login-form-container mx-auto" style={{ width: '100%', maxWidth: '550px' }}>
                            <div className="d-inline-block px-3 py-1 rounded-pill mb-3" style={{ backgroundColor: '#fff1f2', color: 'var(--color-primary)', fontSize: '11px', fontWeight: '800', letterSpacing: '0.5px' }}>
                                ĐĂNG KÝ XƯỞNG SẢN XUẤT
                            </div>

                            <h2 className="fw-bolder mb-2" style={{ color: '#111827' }}>Đăng ký trở thành đối tác xưởng</h2>
                            <p className="text-secondary mb-4 pb-2" style={{ fontSize: '14px' }}>Đăng ký thông tin xưởng chưng cất để bắt đầu kết nối chuỗi cung ứng và nhận đơn gia công trên Oilia.</p>

                            <form>
                                <div className="mb-3">
                                    <label className="form-label fw-bold text-uppercase" style={{ fontSize: '12px', color: '#111827', letterSpacing: '0.5px' }}>Tên xưởng <span className="text-danger">*</span></label>
                                    <input type="text" className="form-control bg-transparent" placeholder="Xưởng Chưng Cất Đà..." style={{ fontSize: '14px', borderRadius: '8px', padding: '10px 15px' }} />
                                </div>

                                <div className="row mb-3">
                                    <div className="col-md-6 mb-3 mb-md-0">
                                        <label className="form-label fw-bold text-uppercase" style={{ fontSize: '12px', color: '#111827', letterSpacing: '0.5px' }}>Họ và tên người đại diện <span className="text-danger">*</span></label>
                                        <input type="text" className="form-control bg-transparent" placeholder="Nguyễn Văn A" style={{ fontSize: '14px', borderRadius: '8px', padding: '10px 15px' }} />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fw-bold text-uppercase" style={{ fontSize: '12px', color: '#111827', letterSpacing: '0.5px' }}>Email liên hệ công việc <span className="text-danger">*</span></label>
                                        <input type="email" className="form-control bg-transparent" placeholder="xuong@dalatorganic.vn" style={{ fontSize: '14px', borderRadius: '8px', padding: '10px 15px' }} />
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label fw-bold text-uppercase" style={{ fontSize: '12px', color: '#111827', letterSpacing: '0.5px' }}>Số điện thoại liên hệ <span className="text-danger">*</span></label>
                                    <input type="text" className="form-control bg-transparent" placeholder="09xxxxxxxx" style={{ fontSize: '14px', borderRadius: '8px', padding: '10px 15px' }} />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label fw-bold text-uppercase" style={{ fontSize: '12px', color: '#111827', letterSpacing: '0.5px' }}>Địa chỉ xưởng <span className="text-danger">*</span></label>
                                    <input type="text" className="form-control bg-transparent" placeholder="Thung lũng Mộc Châu, Sơn La hoặc Lâm Viên, Đà Lạt" style={{ fontSize: '14px', borderRadius: '8px', padding: '10px 15px' }} />
                                </div>

                                <div className="row mb-4">
                                    <div className="col-md-6 mb-3 mb-md-0">
                                        <label className="form-label fw-bold text-uppercase" style={{ fontSize: '12px', color: '#111827', letterSpacing: '0.5px' }}>Mật khẩu <span className="text-danger">*</span></label>
                                        <div className="position-relative">
                                            <input type="password" className="form-control bg-transparent" placeholder="Nhập mật khẩu" style={{ fontSize: '14px', borderRadius: '8px', padding: '10px 15px', paddingRight: '40px' }} />
                                            <button type="button" className="btn position-absolute top-50 end-0 translate-middle-y border-0 bg-transparent text-secondary py-0">
                                                <Eye />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fw-bold text-uppercase" style={{ fontSize: '12px', color: '#111827', letterSpacing: '0.5px' }}>Xác nhận mật khẩu <span className="text-danger">*</span></label>
                                        <div className="position-relative">
                                            <input type="password" className="form-control bg-transparent" placeholder="Nhập lại mật khẩu" style={{ fontSize: '14px', borderRadius: '8px', padding: '10px 15px', paddingRight: '40px' }} />
                                            <button type="button" className="btn position-absolute top-50 end-0 translate-middle-y border-0 bg-transparent text-secondary py-0">
                                                <Eye />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="form-check mb-4">
                                    <input className="form-check-input mt-1" type="checkbox" id="agreeTermsFactory" />
                                    <label className="form-check-label text-secondary" htmlFor="agreeTermsFactory" style={{ fontSize: '12px' }}>
                                        Tôi đồng ý với <a href="#" className="text-decoration-none fw-bold" style={{ color: 'var(--color-primary)' }}>Điều khoản hợp tác xưởng</a> và <a href="#" className="text-decoration-none fw-bold" style={{ color: 'var(--color-primary)' }}>Quy chuẩn kiểm định chất lượng GC/MS</a> của NORDIC & Oilia.
                                    </label>
                                </div>

                                <button type="submit" className="btn btn-primary w-100 py-3 fw-bold rounded-3 mb-4" style={{ backgroundColor: 'var(--color-primary)', borderColor: 'var(--color-primary)', fontSize: '15px' }}>
                                    ĐĂNG KÝ HỢP TÁC XƯỞNG
                                </button>

                                <div className="text-center" style={{ fontSize: '14px' }}>
                                    <span className="text-secondary">Đã có tài khoản? </span>
                                    <a href="/login" className="text-decoration-none fw-bold" style={{ color: 'var(--color-primary)' }}>Đăng nhập</a>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
