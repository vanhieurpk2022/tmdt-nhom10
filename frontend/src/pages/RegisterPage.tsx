import { Eye, EyeSlash } from 'react-bootstrap-icons';
import LoginSideBar from '../components/layout/login/LoginSideBar';
import { use, useState, type FormEvent } from 'react';
import { Link, Navigate, replace, useNavigate } from 'react-router';
import { authService } from '../api/AuthService';
import { ROUTES } from '../routes/routes';
import axios from 'axios';

export default function RegisterPage() {
    const [fullname, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassowrd] = useState("");
    const [verifyPassword, setVerifyPassowrd] = useState("");
    const [accept, setAccept] = useState(false);
    const [enable, setEnable] = useState(false);
    const [enable2, setEnable2] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [successMessage, setSuccessMessage] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await authService.register({
                fullname,
                email,
                phone,
                password,
                verifyPassword
            });
            if (res.status == 201) {
                setSuccessMessage(res.message);
                sessionStorage.setItem("pendingVerifyEmail", email);
                sessionStorage.setItem("pendingVerifySource", "register");

                setInterval(() => {
                    navigate(ROUTES.VERIFY_ACCOUNT, { replace: true, state: { email } });
                }, 2000);

            }

        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (!error.response) {
                    setErrorMessage("Không kết nối được máy chủ, vui lòng thử lại");
                } else {
                    setErrorMessage(error.response.data?.message);
                }
            }
        }
        setLoading(false);
    }

    return (
        <div className="login-page d-flex align-items-center justify-content-center bg-light" style={{ minHeight: 'calc(100vh - 100px)' }}>
            <div className="container py-5">

                <div className="row g-0 rounded-4 overflow-hidden shadow-lg login-container bg-white mx-auto" style={{ maxWidth: '1100px' }}>

                    <LoginSideBar />


                    <div className="col-lg-6 bg-white p-4 p-md-5 d-flex flex-column justify-content-center position-relative">
                        <div className="login-form-container mx-auto" style={{ width: '100%', maxWidth: '440px' }}>
                            <div className="d-inline-block px-3 py-1 rounded-pill mb-3" style={{ backgroundColor: '#fff1f2', color: 'var(--color-primary)', fontSize: '11px', fontWeight: '800', letterSpacing: '0.5px' }}>
                                ĐĂNG KÝ KHÁCH HÀNG
                            </div>

                            <h2 className="fw-bolder mb-2" style={{ color: '#111827' }}>Tạo tài khoản mới</h2>
                            <p className="text-secondary mb-4 pb-2" style={{ fontSize: '14px' }}>Đăng ký để mua sắm tinh dầu từ nhiều xưởng cung cấp và quản lý đơn hàng của bạn trên Oilia.</p>

                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label className="form-label fw-bold" style={{ fontSize: '13px', color: '#111827' }}>Họ và tên</label>
                                    <input type="text" value={fullname} onChange={(e) => setFullName(e.target.value)} className="form-control form-control-lg bg-transparent" placeholder="Nguyễn Văn A" style={{ fontSize: '14px', borderRadius: '8px' }} />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label fw-bold" style={{ fontSize: '13px', color: '#111827' }}>Email</label>
                                    <input type="email" className="form-control form-control-lg bg-transparent" placeholder="name@email.com" value={email} onChange={(e) => setEmail(e.target.value)} style={{ fontSize: '14px', borderRadius: '8px' }} />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label fw-bold" style={{ fontSize: '13px', color: '#111827' }}>Số điện thoại</label>
                                    <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className="form-control form-control-lg bg-transparent" placeholder="09xxxxxxxx" style={{ fontSize: '14px', borderRadius: '8px' }} />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label fw-bold" style={{ fontSize: '13px', color: '#111827' }}>Mật khẩu</label>
                                    <div className="position-relative">
                                        <input value={password} onChange={(e) => setPassowrd(e.target.value)} type={enable ? "text" : "password"} className="form-control form-control-lg bg-transparent" placeholder="Nhập mật khẩu" style={{ fontSize: '14px', borderRadius: '8px', paddingRight: '40px' }} />
                                        <button type="button" className="btn position-absolute top-50 end-0 translate-middle-y border-0 bg-transparent text-secondary">
                                            <div className='position-absolute top-50 end-0 translate-middle-y pe-3' style={{ cursor: "pointer" }} onClick={() => { setEnable(!enable) }} >
                                                {enable ? <EyeSlash /> : <Eye />}
                                            </div>
                                        </button>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label className="form-label fw-bold" style={{ fontSize: '13px', color: '#111827' }}>Xác nhận mật khẩu</label>
                                    <div className="position-relative">
                                        <input value={verifyPassword} onChange={(e) => setVerifyPassowrd(e.target.value)} type={enable2 ? "text" : "password"} className="form-control form-control-lg bg-transparent" placeholder="Nhập lại mật khẩu" style={{ fontSize: '14px', borderRadius: '8px', paddingRight: '40px' }} />
                                        <button type="button" className="btn position-absolute top-50 end-0 translate-middle-y border-0 bg-transparent text-secondary">
                                            <div className='position-absolute top-50 end-0 translate-middle-y pe-3' style={{ cursor: "pointer" }} onClick={() => { setEnable2(!enable2) }} >
                                                {enable2 ? <EyeSlash /> : <Eye />}
                                            </div>
                                        </button>
                                    </div>
                                </div>

                                <div className="form-check mb-4">
                                    <label className="form-check-label text-secondary text-select-none user-select-none" htmlFor="agreeTerms" style={{ fontSize: '12px' }}>
                                        <input className="form-check-input" type="checkbox" id="agreeTerms" checked={accept} onChange={(e) => setAccept(e.target.checked)} />
                                        Tôi đồng ý với {" "}
                                        <Link to={"#"} target="_blank" rel="noopener noreferrer" className="text-decoration-none fw-bold" style={{ color: "var(--color-primary)" }} onClick={(e) => e.stopPropagation()}>
                                            Điều khoản sử dụng
                                        </Link>{" "}
                                        và{" "}
                                        <Link to={"#"} target="_blank" rel="noopener noreferrer" className="text-decoration-none fw-bold" style={{ color: "var(--color-primary)" }} onClick={(e) => e.stopPropagation()}>
                                            Chính sách bảo mật
                                        </Link>
                                    </label>
                                </div>
                                <div className='text-center mb-4 mt-2 text-danger' style={{ fontSize: "12px" }}>{errorMessage}</div>
                                <div className='text-center mb-4 mt-2 text-success' style={{ fontSize: "12px" }}>{successMessage}</div>


                                <button type="submit" className={`btn btn-primary w-100 py-3 fw-bold rounded-3 mb-4 `} disabled={!accept || loading} style={{ backgroundColor: 'var(--color-primary)', borderColor: 'var(--color-primary)', fontSize: '15px' }}>
                                    {
                                        loading ?
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                Đang xử lý...
                                            </>
                                            : "ĐĂNG KÝ"
                                    }

                                </button>

                                <div className="text-center" style={{ fontSize: '14px' }}>
                                    <span className="text-secondary">Đã có tài khoản? </span>
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
