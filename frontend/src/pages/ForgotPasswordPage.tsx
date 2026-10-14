import { Link } from "react-router";
import LoginSideBar from "../components/layout/login/LoginSideBar"
import { ROUTES } from "../routes/routes";

export default function ForgotPasswordPage() {
    return (
        <div className="login-page d-flex align-items-center justify-content-center bg-light" style={{ minHeight: 'calc(100vh - 100px)' }}>
            <div className="container py-5">
                <div className="row g-0 rounded-4 overflow-hidden shadow-lg login-container bg-white mx-auto" style={{ maxWidth: '1100px' }}>

                    <LoginSideBar />


                    <div className="col-lg-6 bg-white p-4 p-md-5 d-flex flex-column justify-content-center position-relative">
                        <div className="login-form-container mx-auto" style={{ width: '100%', maxWidth: '440px' }}>
                            <div className="d-inline-block px-3 py-1 rounded-pill mb-4" style={{ backgroundColor: '#fff1f2', color: 'var(--color-primary)', fontSize: '11px', fontWeight: '800', letterSpacing: '0.5px' }}>
                                QUÊN MẬT KHẨU
                            </div>

                            <h2 className="fw-bolder mb-2" style={{ color: '#111827' }}>Khôi phục mật khẩu</h2>
                            <p className="text-secondary mb-4 pb-4" style={{ fontSize: '14px' }}>Nhập email đã đăng ký để nhận mã xác thực và đặt lại mật khẩu.</p>

                            <form>
                                <div className="mb-4">
                                    <label className="form-label fw-bold mb-2" style={{ fontSize: '13px', color: '#111827' }}>Email</label>
                                    <input type="email" placeholder="Nhập email" className="form-control form-control-lg bg-transparent" style={{ fontSize: '14px', borderRadius: '8px' }} />
                                </div>

                                <button type="submit" className="btn btn-primary w-100 py-3 fw-bold rounded-3 mb-4" style={{ backgroundColor: 'var(--color-primary)', borderColor: 'var(--color-primary)', fontSize: '15px' }}>
                                    GỬI MÃ XÁC THỰC
                                </button>

                                <div className="d-flex align-items-center" style={{ fontSize: '14px' }}>
                                    <span className="text-secondary me-2">Bạn đã nhớ lại mật khẩu?</span>
                                    <Link to={ROUTES.LOGIN} className="text-decoration-none fw-bold" style={{ color: 'var(--color-primary)' }}>Đăng nhập</Link>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
