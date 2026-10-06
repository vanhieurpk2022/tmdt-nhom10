import { Eye } from 'react-bootstrap-icons';

export default function LoginPage() {
    return (
        <div className="login-page d-flex align-items-center justify-content-center bg-light" style={{ minHeight: 'calc(100vh - 100px)' }}>
            <div className="container py-5">
                <div className="row g-0 rounded-4 overflow-hidden shadow-lg login-container bg-white mx-auto" style={{ maxWidth: '1100px' }}>
                    
                    {/* Left Panel */}
                    <div className="col-lg-6 login-left-panel p-4 p-md-5 text-white d-flex flex-column justify-content-center position-relative" style={{ backgroundColor: '#111827' }}>
                        {/* Background Decor */}
                        <div className="position-absolute top-0 end-0 translate-middle-y" style={{ width: '300px', height: '300px', backgroundColor: 'rgba(225, 29, 72, 0.1)', borderRadius: '50%', filter: 'blur(50px)' }}></div>
                        <div className="position-absolute bottom-0 start-0 translate-middle-y" style={{ width: '200px', height: '200px', backgroundColor: 'rgba(52, 82, 55, 0.2)', borderRadius: '50%', filter: 'blur(50px)' }}></div>
                        
                        <div className="position-relative z-1">
                            <h6 className="text-primary fw-bold mb-3 text-uppercase" style={{ fontSize: '12px', letterSpacing: '1px' }}>Oilia • SÀN KẾT NỐI TINH DẦU</h6>
                            <h1 className="fw-bolder mb-3 display-6" style={{ lineHeight: '1.3' }}>Kết nối khách hàng<br/>với các xưởng tinh dầu</h1>
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

                    {/* Right Panel - Login Form */}
                    <div className="col-lg-6 bg-white p-4 p-md-5 d-flex flex-column justify-content-center position-relative">
                        <div className="login-form-container mx-auto" style={{ width: '100%', maxWidth: '400px' }}>
                            <div className="d-inline-block px-3 py-1 rounded-pill mb-4" style={{ backgroundColor: '#fff1f2', color: 'var(--color-primary)', fontSize: '11px', fontWeight: '800', letterSpacing: '0.5px' }}>
                                TÀI KHOẢN KHÁCH HÀNG
                            </div>
                            
                            <h2 className="fw-bolder mb-2" style={{ color: '#111827' }}>Chào mừng bạn trở lại</h2>
                            <p className="text-secondary mb-4 pb-2" style={{ fontSize: '14px' }}>Đăng nhập để tiếp tục mua sắm và quản lý đơn hàng tinh dầu của bạn.</p>
                            
                            <form>
                                <div className="mb-3">
                                    <label className="form-label fw-bold" style={{ fontSize: '13px', color: '#111827' }}>Email</label>
                                    <input type="email" className="form-control form-control-lg bg-transparent" placeholder="name@email.com" style={{ fontSize: '14px', borderRadius: '8px' }} />
                                </div>
                                <div className="mb-4">
                                    <label className="form-label fw-bold" style={{ fontSize: '13px', color: '#111827' }}>Mật khẩu</label>
                                    <div className="position-relative">
                                        <input type="password" className="form-control form-control-lg bg-transparent" placeholder="Nhập mật khẩu" style={{ fontSize: '14px', borderRadius: '8px', paddingRight: '40px' }} />
                                        <button type="button" className="btn position-absolute top-50 end-0 translate-middle-y border-0 bg-transparent text-secondary">
                                            <Eye />
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="d-flex justify-content-between align-items-center mb-4 pb-2">
                                    <div className="form-check">
                                        <input className="form-check-input" type="checkbox" id="rememberMe" />
                                        <label className="form-check-label text-secondary" htmlFor="rememberMe" style={{ fontSize: '13px' }}>
                                            Ghi nhớ đăng nhập
                                        </label>
                                    </div>
                                    <a href="#" className="text-decoration-none fw-bold" style={{ fontSize: '13px', color: 'var(--color-primary)' }}>Quên mật khẩu?</a>
                                </div>
                                
                                <button type="submit" className="btn btn-primary w-100 py-3 fw-bold rounded-3 mb-4" style={{ backgroundColor: 'var(--color-primary)', borderColor: 'var(--color-primary)', fontSize: '15px' }}>
                                    ĐĂNG NHẬP
                                </button>
                                
                                <div className="position-relative mb-4 text-center">
                                    <hr className="text-secondary opacity-25" />
                                    <span className="position-absolute top-50 start-50 translate-middle bg-white px-3 text-secondary" style={{ fontSize: '12px' }}>hoặc</span>
                                </div>
                                
                                <div className="text-center" style={{ fontSize: '14px' }}>
                                    <span className="text-secondary">Bạn chưa có tài khoản? </span>
                                    <a href="#" className="text-decoration-none fw-bold" style={{ color: 'var(--color-primary)' }}>Đăng ký ngay</a>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
                
                <div className="text-center mt-4">
                    <p className="text-secondary mx-auto" style={{ fontSize: '12px', maxWidth: '700px' }}>
                        NORDIC là nền tảng trung gian giúp khách hàng tiếp cận sản phẩm tinh dầu từ nhiều xưởng cung cấp trong một hệ thống thống nhất.
                    </p>
                </div>
            </div>
        </div>
    );
}
