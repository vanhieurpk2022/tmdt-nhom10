import { useState, useEffect, useRef } from 'react';
import { Envelope, ClockHistory, ArrowLeft } from 'react-bootstrap-icons';
import { useLocation, useNavigate, Link } from 'react-router';
import LoginSideBar from '../components/layout/login/LoginSideBar';
import { ROUTES } from '../routes/routes';
import { authService } from '../api/AuthService';
import axios from 'axios';

export default function VerifyRecoveryCodePage() {
    const location = useLocation();
    const navigate = useNavigate();

    const [email, setEmail] = useState<string>('');
    const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
    const [countdown, setCountdown] = useState<number>(300); // 5 minutes
    const [loading, setLoading] = useState<boolean>(false);
    const [resendLoading, setResendLoading] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [successMessage, setSuccessMessage] = useState<string>('');

    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        const stateEmail = location.state?.email || sessionStorage.getItem('recoveryEmail');
        if (!stateEmail) {
            navigate(ROUTES.FORGOT_PASSWORD, { replace: true });
        } else {
            setEmail(stateEmail);
            sessionStorage.setItem('recoveryEmail', stateEmail);
        }
    }, [location.state, navigate]);

    // Countdown timer
    useEffect(() => {
        if (countdown <= 0) return;
        const interval = setInterval(() => {
            setCountdown((prev) => prev - 1);
        }, 1000);
        return () => clearInterval(interval);
    }, [countdown]);

    const formatTime = (secs: number) => {
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const handleDigitChange = (index: number, value: string) => {
        const lastChar = value.slice(-1);
        if (value && !/^\d$/.test(lastChar)) {
            return;
        }

        const newDigits = [...digits];
        newDigits[index] = lastChar;
        setDigits(newDigits);
        setErrorMessage('');

        if (lastChar && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !digits[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (!pasted) return;

        const newDigits = [...digits];
        for (let i = 0; i < 6; i++) {
            newDigits[i] = pasted[i] || '';
        }
        setDigits(newDigits);

        const nextFocusIndex = Math.min(pasted.length, 5);
        inputRefs.current[nextFocusIndex]?.focus();
    };

    const handleResend = async () => {
        if (resendLoading || !email) return;
        setResendLoading(true);
        setErrorMessage('');
        setSuccessMessage('');

        try {
            await authService.forgotPassword(email);
            setCountdown(300);
            setDigits(['', '', '', '', '', '']);
            setSuccessMessage('Mã xác thực mới đã được gửi đến email của bạn!');
            inputRefs.current[0]?.focus();
        } catch (error) {
            if (axios.isAxiosError(error)) {
                setErrorMessage(error.response?.data?.message || 'Không thể gửi lại mã, vui lòng thử lại');
            } else {
                setErrorMessage('Lỗi gửi lại mã');
            }
        } finally {
            setResendLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage('');
        setSuccessMessage('');

        const code = digits.join('');
        if (code.length < 6) {
            setErrorMessage('Vui lòng nhập đầy đủ 6 chữ số mã xác thực');
            return;
        }

        if (countdown <= 0) {
            setErrorMessage('Mã xác thực đã hết hạn. Vui lòng bấm "Gửi lại mã"');
            return;
        }

        setLoading(true);
        try {
            const res = await authService.verifyRecoveryCode(email, code);
            if (res.status === 200) {
                setSuccessMessage('Xác thực thành công! Đang chuyển tiếp...');
                sessionStorage.setItem('recoveryCode', code);
                setTimeout(() => {
                    navigate(ROUTES.RESET_PASSWORD, { state: { email, code } });
                }, 600);
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                setErrorMessage(error.response?.data?.message || 'Mã xác thực không hợp lệ hoặc đã hết hạn');
            } else {
                setErrorMessage('Lỗi xác thực mã');
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
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <div className="d-inline-block px-3 py-1 rounded-pill" style={{ backgroundColor: '#fff1f2', color: 'var(--color-primary)', fontSize: '11px', fontWeight: '800', letterSpacing: '0.5px' }}>
                                    XÁC THỰC KHÔI PHỤC
                                </div>
                                <Link to={ROUTES.FORGOT_PASSWORD} className="text-decoration-none text-secondary small d-flex align-items-center gap-1">
                                    <ArrowLeft /> Đổi email
                                </Link>
                            </div>

                            <div className="d-flex align-items-center mb-4" style={{ width: '100px' }}>
                                <div className="rounded-circle" style={{ width: '10px', height: '10px', backgroundColor: 'var(--color-primary)' }}></div>
                                <div style={{ flex: 1, height: '2px', backgroundColor: 'var(--color-primary)', margin: '0 4px' }}></div>
                                <div className="rounded-circle" style={{ width: '10px', height: '10px', backgroundColor: 'var(--color-primary)' }}></div>
                                <div style={{ flex: 1, height: '2px', backgroundColor: '#e2e8f0', margin: '0 4px' }}></div>
                                <div className="rounded-circle border" style={{ width: '10px', height: '10px', backgroundColor: '#f8fafc', borderColor: '#cbd5e1' }}></div>
                            </div>

                            <h2 className="fw-bolder mb-2" style={{ color: '#111827' }}>Nhập mã xác thực</h2>
                            <p className="text-secondary mb-4 pb-2" style={{ fontSize: '14px' }}>Nhập mã đã được gửi đến email để tiếp tục đặt lại mật khẩu.</p>

                            <div className="d-flex align-items-center p-3 rounded-3 mb-4" style={{ backgroundColor: '#f8fafc' }}>
                                <div className="rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '40px', height: '40px', backgroundColor: '#eff6ff', color: '#3b82f6', flexShrink: 0 }}>
                                    <Envelope size={20} />
                                </div>
                                <div>
                                    <h6 className="mb-0 fw-bold" style={{ fontSize: '14px', color: '#111827' }}>Email nhận mã</h6>
                                    <p className="mb-0 text-secondary" style={{ fontSize: '13px' }}>{email || 'Đang tải...'}</p>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div className="mb-4">
                                    <label className="form-label fw-bold mb-1" style={{ fontSize: '13px', color: '#111827' }}>Nhập mã xác thực</label>
                                    <p className="text-secondary mb-3" style={{ fontSize: '12px' }}>Mã gồm 6 chữ số</p>

                                    <div className="d-flex justify-content-between gap-2 mb-3" onPaste={handlePaste}>
                                        {[0, 1, 2, 3, 4, 5].map((idx) => (
                                            <input
                                                key={idx}
                                                ref={(el) => { inputRefs.current[idx] = el; }}
                                                type="text"
                                                inputMode="numeric"
                                                maxLength={1}
                                                value={digits[idx]}
                                                onChange={(e) => handleDigitChange(idx, e.target.value)}
                                                onKeyDown={(e) => handleKeyDown(idx, e)}
                                                className="form-control text-center fw-bold"
                                                style={{
                                                    width: '52px',
                                                    height: '60px',
                                                    fontSize: '24px',
                                                    borderRadius: '12px',
                                                    borderColor: digits[idx] ? 'var(--color-primary)' : '#e2e8f0',
                                                    color: '#111827',
                                                    backgroundColor: digits[idx] ? '#fff1f2' : '#ffffff',
                                                    padding: '0',
                                                    transition: 'all 0.15s ease-in-out'
                                                }}
                                                autoFocus={idx === 0}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div className="d-flex align-items-center justify-content-center p-3 rounded-3 mb-4" style={{ backgroundColor: countdown > 0 ? '#fff7ed' : '#fee2e2', border: `1px solid ${countdown > 0 ? '#ffedd5' : '#fecaca'}` }}>
                                    <div className="me-2 d-flex align-items-center" style={{ color: countdown > 0 ? '#ea580c' : '#dc2626' }}>
                                        <ClockHistory size={18} />
                                    </div>
                                    <div className="d-flex align-items-center gap-2">
                                        <span className="fw-bold" style={{ fontSize: '13px', color: countdown > 0 ? '#ea580c' : '#dc2626' }}>
                                            {countdown > 0 ? 'Mã có hiệu lực trong' : 'Mã đã hết hạn'}
                                        </span>
                                        <span className="fw-bold fs-6 font-monospace" style={{ color: countdown > 0 ? '#ea580c' : '#dc2626', lineHeight: '1' }}>
                                            {formatTime(countdown)}
                                        </span>
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
                                    disabled={loading || digits.join('').length < 6 || countdown <= 0}
                                    className="btn btn-primary w-100 py-3 fw-bold rounded-3 mb-4 d-flex align-items-center justify-content-center gap-2"
                                    style={{ backgroundColor: 'var(--color-primary)', borderColor: 'var(--color-primary)', fontSize: '15px' }}
                                >
                                    {loading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                            ĐANG XÁC THỰC...
                                        </>
                                    ) : (
                                        'TIẾP TỤC'
                                    )}
                                </button>

                                <div className="text-center" style={{ fontSize: '14px' }}>
                                    <span className="text-secondary">Không nhận được mã? </span>
                                    <button
                                        type="button"
                                        onClick={handleResend}
                                        disabled={resendLoading}
                                        className="btn btn-link p-0 text-decoration-none fw-bold"
                                        style={{ color: 'var(--color-primary)', fontSize: '14px' }}
                                    >
                                        {resendLoading ? 'Đang gửi lại...' : 'Gửi lại mã'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
