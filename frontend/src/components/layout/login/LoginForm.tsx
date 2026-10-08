import React, { useState } from 'react';
import { Eye, EyeSlash } from 'react-bootstrap-icons';
import { Link, useNavigate } from 'react-router';
import { authService } from '../../../api/AuthService';
import { ROUTES } from '../../../routes/routes';
import { useAuth } from "../../../api/AuthContext";
import axios from 'axios';

export function LoginForm() {
    const [enable, setEnable] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPasssword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const navigate = useNavigate();
    const { setUser, loading, setLoading } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true)
        try {
            const response = await authService.login({
                email,
                password,
                rememberMe
            });

            if (response.status === 200) {
                setUser(response.data.user);
                navigate(ROUTES.HOME, { replace: true });
            }

        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.log(error.response);
                if (!error.response) {
                    setErrorMessage("Không kết nối được máy chủ, vui lòng thử lại");
                } else if (error.response.data?.status == 410) {
                    sessionStorage.setItem("pendingVerifyEmail", email);
                    sessionStorage.setItem("pendingVerifySource", "login");
                    navigate(ROUTES.VERIFY_ACCOUNT, {
                        replace: true,
                        state: { email, fromLogin: true },
                    });
                    return;
                } else {
                    setErrorMessage(error.response.data?.message);
                }
            } else {
                setErrorMessage("Đã có lỗi xảy ra");
            }
        } finally {

            setLoading(false)
        }
    };

    return (
        <div className="col-lg-6 bg-white p-4 p-md-5 d-flex flex-column justify-content-center position-relative">
            <div className="login-form-container mx-auto" style={{ width: '100%', maxWidth: '400px' }}>
                <div className="d-inline-block px-3 py-1 rounded-pill mb-4" style={{ backgroundColor: '#fff1f2', color: 'var(--color-primary)', fontSize: '11px', fontWeight: '800', letterSpacing: '0.5px' }}>
                    TÀI KHOẢN KHÁCH HÀNG
                </div>

                <h2 className="fw-bolder mb-2" style={{ color: '#111827' }}>Chào mừng bạn trở lại</h2>
                <p className="text-secondary mb-4 pb-2" style={{ fontSize: '14px' }}>Đăng nhập để tiếp tục mua sắm và quản lý đơn hàng tinh dầu của bạn.</p>

                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label fw-bold" style={{ fontSize: '13px', color: '#111827' }}>Email</label>
                        <input type="email" value={email} className="form-control form-control-lg bg-transparent" onChange={(e) => { setEmail(e.target.value) }} placeholder="Nhập email" style={{ fontSize: '14px', borderRadius: '8px' }} />
                    </div>
                    <div className="">
                        <label className="form-label fw-bold" style={{ fontSize: '13px', color: '#111827' }}>Mật khẩu</label>
                        <div className="position-relative">
                            <input type={enable ? "text" : "password"} value={password} onChange={(e) => { setPasssword(e.target.value) }} className="form-control form-control-lg bg-transparent" placeholder="Nhập mật khẩu" style={{ fontSize: '14px', borderRadius: '8px', paddingRight: '40px' }} />
                            <div className='position-absolute top-50 end-0 translate-middle-y pe-3' style={{ cursor: "pointer" }} onClick={() => { setEnable(!enable) }} >
                                {enable ? <EyeSlash /> : <Eye />}
                            </div>

                        </div>
                    </div>
                    <div className='text-center mb-4 mt-2 text-danger' style={{ fontSize: "12px" }}>{errorMessage}</div>

                    <div className="d-flex justify-content-between align-items-center mb-4 pb-2">
                        <div className="form-check">
                            <input className="form-check-input" type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} id="rememberMe" />
                            <label className="form-check-label text-secondary user-select-none" htmlFor="rememberMe" style={{ fontSize: '13px' }}>
                                Ghi nhớ đăng nhập
                            </label>
                        </div>
                        <a href="/forgot-password" className="text-decoration-none fw-bold" style={{ fontSize: '13px', color: 'var(--color-primary)' }}>Quên mật khẩu?</a>
                    </div>

                    <button type="submit" disabled={loading} className="btn btn-primary w-100 py-3 fw-bold rounded-3 mb-4" style={{ backgroundColor: 'var(--color-primary)', borderColor: 'var(--color-primary)', fontSize: '15px' }}>
                        {loading ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                Đang xử lý...
                            </>
                        ) : (
                            'Đăng nhập'
                        )}
                    </button>

                    <div className="position-relative mb-4 text-center">
                        <hr className="text-secondary opacity-25" />
                        <span className="position-absolute top-50 start-50 translate-middle bg-white px-3 text-secondary" style={{ fontSize: '12px' }}>hoặc</span>
                    </div>

                    <div className="text-center" style={{ fontSize: '14px' }}>
                        <span className="text-secondary">Bạn chưa có tài khoản? </span>
                        <Link to="/register" className="text-decoration-none fw-bold" style={{ color: 'var(--color-primary)' }}>Đăng ký ngay</Link>
                    </div>
                </form>
            </div >
        </div >
    );
}