import { useState, useEffect } from 'react';
import { InfoCircleFill, Eye, EyeSlash, CheckCircleFill } from 'react-bootstrap-icons';
import { useLocation, useNavigate, Link } from 'react-router';
import LoginSideBar from '../components/layout/login/LoginSideBar';
import { ROUTES } from '../routes/routes';
import { authService } from '../api/AuthService';
import axios from 'axios';

export default function ResetPasswordPage() {
    const location = useLocation();
    const navigate = useNavigate();

    const [email, setEmail] = useState<string>('');
    const [code, setCode] = useState<string>('');
    const [newPassword, setNewPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

    const [loading, setLoading] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [successMessage, setSuccessMessage] = useState<string>('');

    useEffect(() => {
        const stateEmail = location.state?.email || sessionStorage.getItem('recoveryEmail');
        const stateCode = location.state?.code || sessionStorage.getItem('recoveryCode');

        if (!stateEmail || !stateCode) {
            navigate(ROUTES.FORGOT_PASSWORD, { replace: true });
        } else {
            setEmail(stateEmail);
            setCode(stateCode);
        }
    }, [location.state, navigate]);

    // Password validations
    const hasMinLength = newPassword.length >= 6;
    const hasMatch = newPassword.length > 0 && newPassword === confirmPassword;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage('');
        setSuccessMessage('');

        if (!newPassword) {
            setErrorMessage('Vui lòng nhập mật khẩu mới');
            return;
        }

        if (newPassword.length < 6) {
            setErrorMessage('Mật khẩu mới phải có ít nhất 6 ký tự');
            return;
        }

        if (newPassword !== confirmPassword) {
            setErrorMessage('Xác nhận mật khẩu không khớp');
            return;
        }

        setLoading(true);
        try {
            const res = await authService.resetPassword({
                email,
                code,
                newPassword,
                confirmPassword,
            });

            if (res.status === 200) {
                setSuccessMessage('Đặt lại mật khẩu thành công! Đang chuyển đến trang đăng nhập...');
                sessionStorage.removeItem('recoveryEmail');
                sessionStorage.removeItem('recoveryCode');
                setTimeout(() => {
                    navigate(ROUTES.LOGIN, {
                        replace: true,
                        state: { message: 'Đặt lại mật khẩu thành công! Vui lòng đăng nhập với mật khẩu mới.' }
                    });
                }, 1200);
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                setErrorMessage(error.response?.data?.message || 'Không thể đặt lại mật khẩu, vui lòng thử lại');
            } else {
                setErrorMessage('Đã xảy ra lỗi khi đặt lại mật khẩu');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page d-flex align-items-center justify-content-center bg-light" style={{ minHeight: 'calc(100vh - 100px)' }}>
            <div className="container py-5">
                <div className="row g-0 rounded-4 overflow-hidden shadow-lg login-container bg-white mx-auto" style={{ maxWidth: '1100px' }}>
                    <LoginSideBar />

                    <div className="col-lg-6 bg-white p-4 p-md-5 d-flex flex-column justify-content-center position-relative">
                        <div className="login-form-container mx-auto" style={{ width: '100%', maxWidth: '440px' }}>
                            <div className="d-inline-block px-3 py-1 rounded-pill mb-4" style={{ backgroundColor: '#fff1f2', color: 'var(--color-primary)', fontSize: '11px', fontWeight: '800', letterSpacing: '0.5px' }}>
                                ĐẶT LẠI MẬT KHẨU
                            </div>

                            <div className="d-flex align-items-center mb-4" style={{ width: '100px' }}>
                                <div className="rounded-circle" style={{ width: '10px', height: '10px', backgroundColor: 'var(--color-primary)' }}></div>
                                <div style={{ flex: 1, height: '2px', backgroundColor: 'var(--color-primary)', margin: '0 4px' }}></div>
                                <div className="rounded-circle" style={{ width: '10px', height: '10px', backgroundColor: 'var(--color-primary)' }}></div>
                                <div style={{ flex: 1, height: '2px', backgroundColor: 'var(--color-primary)', margin: '0 4px' }}></div>
                                <div className="rounded-circle" style={{ width: '10px', height: '10px', backgroundColor: 'var(--color-primary)' }}></div>
                            </div>

                            <h2 className="fw-bolder mb-2" style={{ color: '#111827' }}>Tạo mật khẩu mới</h2>
                            <p className="text-secondary mb-4 pb-2" style={{ fontSize: '14px' }}>
                                Đặt mật khẩu mới cho tài khoản <strong className="text-dark">{email}</strong>.
                            </p>

                            <div className="d-flex p-3 rounded-3 mb-4" style={{ backgroundColor: '#f8fafc', border: '1px solid #f1f5f9' }}>
                                <div className="me-3 mt-1" style={{ color: '#3b82f6' }}>
                                    <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: '20px', height: '20px', backgroundColor: '#eff6ff' }}>
                                        <InfoCircleFill size={12} />
                                    </div>
                                </div>
                                <div>
                                    <h6 className="mb-1 fw-bold" style={{ fontSize: '13px', color: '#111827' }}>Gợi ý mật khẩu</h6>
                                    <p className="mb-0 text-secondary" style={{ fontSize: '12px' }}>Mật khẩu nên có tối thiểu 6 ký tự kết hợp chữ và số để đảm bảo an toàn.</p>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label className="form-label fw-bold mb-2" style={{ fontSize: '13px', color: '#111827' }}>Mật khẩu mới</label>
                                    <div className="position-relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="Nhập mật khẩu mới"
                                            className="form-control form-control-lg bg-transparent"
                                            style={{ fontSize: '14px', borderRadius: '8px', paddingRight: '42px' }}
                                            required
                                            autoFocus
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="btn position-absolute top-50 end-0 translate-middle-y border-0 bg-transparent text-secondary pe-3"
                                            style={{ zIndex: 5 }}
                                        >
                                            {showPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label fw-bold mb-2" style={{ fontSize: '13px', color: '#111827' }}>Xác nhận mật khẩu mới</label>
                                    <div className="position-relative">
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="Nhập lại mật khẩu mới"
                                            className="form-control form-control-lg bg-transparent"
                                            style={{ fontSize: '14px', borderRadius: '8px', paddingRight: '42px' }}
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="btn position-absolute top-50 end-0 translate-middle-y border-0 bg-transparent text-secondary pe-3"
                                            style={{ zIndex: 5 }}
                                        >
                                            {showConfirmPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <div className="d-flex align-items-center mb-1" style={{ fontSize: '12px', color: hasMinLength ? '#16a34a' : '#64748b' }}>
                                        {hasMinLength ? (
                                            <CheckCircleFill className="me-2 text-success" />
                                        ) : (
                                            <span style={{ color: 'var(--color-primary)', marginRight: '6px', fontWeight: 'bold' }}>*</span>
                                        )}
                                        Ít nhất 6 ký tự
                                    </div>
                                    <div className="d-flex align-items-center" style={{ fontSize: '12px', color: hasMatch ? '#16a34a' : '#64748b' }}>
                                        {hasMatch ? (
                                            <CheckCircleFill className="me-2 text-success" />
                                        ) : (
                                            <span style={{ color: 'var(--color-primary)', marginRight: '6px', fontWeight: 'bold' }}>*</span>
                                        )}
                                        Mật khẩu xác nhận trùng khớp
                                    </div>
                                </div>

                                {errorMessage && (
                                    <div className="alert alert-danger py-2 px-3 small rounded-3 mb-3">
                                        {errorMessage}
                                    </div>
                                )}

                                {successMessage && (
                                    <div className="alert alert-success py-2 px-3 small rounded-3 mb-3">
                                        {successMessage}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading || !hasMinLength || !hasMatch}
                                    className="btn btn-primary w-100 py-3 fw-bold rounded-3 mb-3 d-flex align-items-center justify-content-center gap-2"
                                    style={{ backgroundColor: 'var(--color-primary)', borderColor: 'var(--color-primary)', fontSize: '15px' }}
                                >
                                    {loading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                            ĐANG CẬP NHẬT...
                                        </>
                                    ) : (
                                        'CẬP NHẬT MẬT KHẨU'
                                    )}
                                </button>

                                <div className="text-center" style={{ fontSize: '14px' }}>
                                    <Link to={ROUTES.LOGIN} className="text-decoration-none fw-bold" style={{ color: 'var(--color-primary)' }}>
                                        Quay lại đăng nhập
                                    </Link>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
