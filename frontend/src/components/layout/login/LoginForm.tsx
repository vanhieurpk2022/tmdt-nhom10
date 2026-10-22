import React, { useState } from 'react';
import { Eye, EyeSlash, BoxArrowInRight } from 'react-bootstrap-icons';
import { Link, useLocation, useNavigate } from 'react-router';
import { authService } from '../../../api/AuthService';
import { ROUTES } from '../../../routes/routes';
import { useAuth } from "../../../api/AuthContext";
import { useGoogleLogin } from '@react-oauth/google';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebook } from '@fortawesome/free-brands-svg-icons';
import { loginWithFacebookPopup } from '../../../utils/facebookAuth';
import axios from 'axios';

export function LoginForm() {
    const navigate = useNavigate();
    const location = useLocation();
    const { setUser, loading, setLoading, user } = useAuth();
    const [enable, setEnable] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPasssword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [successMessage, setSuccessMessage] = useState<string>(location.state?.message || '');
    const [googleLoading, setGoogleLoading] = useState(false);
    const [facebookLoading, setFacebookLoading] = useState(false);

    const redirectAfterLogin = (loggedInUser: any) => {
        const roles = Array.isArray(loggedInUser?.role)
            ? loggedInUser.role
            : (loggedInUser?.role ? [loggedInUser.role] : []);
        const isAdmin = roles.some((r: any) =>
            typeof r === "string" && (r === "ADMIN" || r === "ROLE_ADMIN" || r.toUpperCase().includes("ADMIN"))
        );
        const isFactory = roles.some((r: any) =>
            typeof r === "string" && (r === "FACTORY" || r === "ROLE_FACTORY" || r.toUpperCase().includes("FACTORY"))
        );

        const fromPath = (location.state as any)?.from?.pathname || (location.state as any)?.from;

        if (isAdmin) {
            if (fromPath && typeof fromPath === "string" && fromPath.startsWith("/admin")) {
                navigate(fromPath, { replace: true });
            } else {
                navigate(ROUTES.ADMIN_DASHBOARD, { replace: true });
            }
        } else if (isFactory) {
            if (fromPath && typeof fromPath === "string" && fromPath.startsWith("/factory")) {
                navigate(fromPath, { replace: true });
            } else {
                navigate(ROUTES.FACTORY_DASHBOARD, { replace: true });
            }
        } else {
            navigate(fromPath && typeof fromPath === "string" && !fromPath.startsWith("/admin") ? fromPath : ROUTES.HOME, { replace: true });
        }
    };

    React.useEffect(() => {
        if (user && !loading) {
            redirectAfterLogin(user);
        }
    }, [user, loading]);

    const handleGoogleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            setGoogleLoading(true);
            try {
                const res = await authService.loginWithGoogle(tokenResponse.access_token, rememberMe);
                if (res?.status === 200) {
                    setUser(res.data.user);
                    const from = location.state?.from;
                    const destination = typeof from === "string" ? from
                        : from?.pathname ? `${from.pathname}${from.search || ""}${from.hash || ""}` : ROUTES.HOME;
                    navigate(destination.startsWith("/") && !destination.startsWith("//") ? destination : ROUTES.HOME, { replace: true });
                    redirectAfterLogin(res.data.user);
                }
            } catch (error) {
                if (axios.isAxiosError(error)) {
                    setErrorMessage(error.response?.data?.message || "Đăng nhập Google thất bại");
                } else {
                    setErrorMessage("Đăng nhập Google thất bại, vui lòng thử lại");
                }
            } finally {
                setGoogleLoading(false);
            }
        },
        onError: () => setErrorMessage("Đăng nhập Google thất bại, vui lòng thử lại"),
        flow: 'implicit',
    });

    const handleFacebookLogin = async () => {
        setFacebookLoading(true);
        setErrorMessage('');
        try {
            const accessToken = await loginWithFacebookPopup();
            const res = await authService.loginWithFacebook(accessToken, rememberMe);
            if (res?.status === 200) {
                setUser(res.data.user);
                const from = location.state?.from;
                const destination = typeof from === "string" ? from
                    : from?.pathname ? `${from.pathname}${from.search || ""}${from.hash || ""}` : ROUTES.HOME;
                navigate(destination.startsWith("/") && !destination.startsWith("//") ? destination : ROUTES.HOME, { replace: true });
            }
        } catch (error: any) {
            console.error("Facebook login error:", error);
            if (axios.isAxiosError(error)) {
                setErrorMessage(error.response?.data?.message || "Đăng nhập Facebook thất bại");
            } else if (error?.message) {
                setErrorMessage(error.message);
            } else {
                setErrorMessage("Đăng nhập Facebook thất bại, vui lòng thử lại");
            }
        } finally {
            setFacebookLoading(false);
        }
    };

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
                redirectAfterLogin(response.data.user);
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
        <div className="col-lg-6 bg-white p-4 px-md-5 py-md-4 d-flex flex-column justify-content-center position-relative">
            <div className="login-form-container mx-auto" style={{ width: '100%', maxWidth: '400px' }}>
                <div className="d-inline-block px-3 py-1 rounded-pill mb-2" style={{ backgroundColor: '#fff1f2', color: 'var(--color-primary)', fontSize: '11px', fontWeight: '800', letterSpacing: '0.5px' }}>
                    TÀI KHOẢN KHÁCH HÀNG
                </div>

                <h2 className="fw-bolder mb-1" style={{ color: '#111827', fontSize: '24px' }}>Chào mừng bạn trở lại</h2>
                <p className="text-secondary mb-3" style={{ fontSize: '13px' }}>Đăng nhập để tiếp tục mua sắm và quản lý đơn hàng tinh dầu của bạn.</p>

                {successMessage && (
                    <div className="alert alert-success py-2 px-3 small rounded-3 mb-2 text-center" style={{ fontSize: '13px' }}>
                        {successMessage}
                    </div>
                )}

                {errorMessage && (
                    <div className="alert alert-danger py-2 px-3 small rounded-3 mb-2 text-center" style={{ fontSize: '13px' }}>
                        {errorMessage}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-2">
                        <label className="form-label fw-bold mb-1" style={{ fontSize: '13px', color: '#111827' }}>Email</label>
                        <input
                            type="email"
                            value={email}
                            className="form-control bg-transparent"
                            onChange={(e) => { setEmail(e.target.value) }}
                            placeholder="Nhập email"
                            style={{ fontSize: '14px', borderRadius: '8px', padding: '10px 14px' }}
                            required
                        />
                    </div>
                    <div className="mb-2">
                        <label className="form-label fw-bold mb-1" style={{ fontSize: '13px', color: '#111827' }}>Mật khẩu</label>
                        <div className="position-relative">
                            <input
                                type={enable ? "text" : "password"}
                                value={password}
                                onChange={(e) => { setPasssword(e.target.value) }}
                                className="form-control bg-transparent"
                                placeholder="Nhập mật khẩu"
                                style={{ fontSize: '14px', borderRadius: '8px', padding: '10px 14px', paddingRight: '42px' }}
                                required
                            />
                            <div className='position-absolute top-50 end-0 translate-middle-y pe-3 text-secondary' style={{ cursor: "pointer" }} onClick={() => { setEnable(!enable) }} >
                                {enable ? <EyeSlash size={18} /> : <Eye size={18} />}
                            </div>
                        </div>
                    </div>

                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <div className="form-check">
                            <input className="form-check-input" type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} id="rememberMe" />
                            <label className="form-check-label text-secondary user-select-none" htmlFor="rememberMe" style={{ fontSize: '13px' }}>
                                Ghi nhớ đăng nhập
                            </label>
                        </div>
                        <Link to={ROUTES.FORGOT_PASSWORD} className="text-decoration-none fw-bold" style={{ fontSize: '13px', color: 'var(--color-primary)' }}>Quên mật khẩu?</Link>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary w-100 py-2 fw-bold rounded-3 mb-3 d-flex align-items-center justify-content-center gap-2"
                        style={{ backgroundColor: 'var(--color-primary)', borderColor: 'var(--color-primary)', fontSize: '15px' }}
                    >
                        {loading ? (
                            <>
                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                Đang xử lý...
                            </>
                        ) : (
                            'Đăng nhập'
                        )}
                    </button>

                    <div className="position-relative mb-3 text-center">
                        <hr className="text-secondary opacity-25 my-0" />
                        <span className="position-absolute top-50 start-50 translate-middle bg-white px-2 text-secondary" style={{ fontSize: '12px' }}>hoặc</span>
                    </div>

                    <div className="row g-2 mb-3">
                        <div className="col-6">
                            <button
                                type="button"
                                onClick={() => handleGoogleLogin()}
                                disabled={googleLoading || facebookLoading || loading}
                                className="btn w-100 py-2 d-flex align-items-center justify-content-center gap-2 border bg-white text-nowrap"
                                style={{
                                    borderRadius: '8px',
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    color: '#374151',
                                    borderColor: '#d1d5db',
                                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                                    transition: 'all 0.15s ease-in-out',
                                }}
                                onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.12)')}
                                onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)')}
                            >
                                {googleLoading ? (
                                    <span className="spinner-border spinner-border-sm" role="status" />
                                ) : (
                                    <svg width="16" height="16" viewBox="0 0 48 48">
                                        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                                        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                                        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.28-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                                        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                                    </svg>
                                )}
                                Google
                            </button>
                        </div>

                        <div className="col-6">
                            <button
                                type="button"
                                onClick={handleFacebookLogin}
                                disabled={googleLoading || facebookLoading || loading}
                                className="btn w-100 py-2 d-flex align-items-center justify-content-center gap-2 border text-nowrap"
                                style={{
                                    borderRadius: '8px',
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    color: '#fff',
                                    backgroundColor: '#1877F2',
                                    borderColor: '#1877F2',
                                    boxShadow: '0 1px 2px rgba(24,119,242,0.25)',
                                    transition: 'all 0.15s ease-in-out',
                                }}
                                onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#166fe5')}
                                onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#1877F2')}
                            >
                                {facebookLoading ? (
                                    <span className="spinner-border spinner-border-sm" role="status" />
                                ) : (
                                    <FontAwesomeIcon icon={faFacebook} style={{ fontSize: '16px' }} />
                                )}
                                Facebook
                            </button>
                        </div>
                    </div>

                    <div className="text-center" style={{ fontSize: '13px' }}>
                        <span className="text-secondary">Bạn chưa có tài khoản? </span>
                        <Link to="/register" className="text-decoration-none fw-bold" style={{ color: 'var(--color-primary)' }}>Đăng ký ngay</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}