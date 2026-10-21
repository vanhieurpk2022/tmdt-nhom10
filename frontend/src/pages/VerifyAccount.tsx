import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router";
import { EnvelopeCheck, ArrowLeft } from "react-bootstrap-icons";
import { ROUTES } from "../routes/routes";
import { authService } from "../api/AuthService";

const RESEND_SECONDS = 60;

export function VerifyAccount() {
    const location = useLocation();
    const email: string | undefined =
        location.state?.email ?? sessionStorage.getItem("pendingVerifyEmail") ?? undefined;

    const [countdown, setCountdown] = useState(RESEND_SECONDS);
    const [sending, setSending] = useState(false);

    // Đếm ngược mỗi giây cho đến khi về 0
    useEffect(() => {

        if (countdown <= 0) return;
        const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
        return () => clearTimeout(timer);
    }, [countdown]);

    const handleResend = async () => {
        if (!email || countdown > 0 || sending) return;
        setSending(true);
        try {
            await authService.resendEmail(email);
            setCountdown(RESEND_SECONDS);
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="d-flex justify-content-center align-items-center min-vh-100 px-3" style={{ backgroundColor: "#f8f9fa" }}>
            <div className="card border-0 shadow-lg rounded-4 text-center p-4 p-md-5" style={{ maxWidth: "460px", width: "100%" }}>
                <div className="d-flex justify-content-center align-items-center rounded-circle mx-auto mb-4" style={{ width: "110px", height: "110px", backgroundColor: "color-mix(in srgb, var(--color-primary) 12%, white)", color: "var(--color-primary)", }}>
                    <EnvelopeCheck size={52} />
                </div>

                <h3 className="fw-bold mb-2">Kiểm tra email của bạn</h3>

                <p className="text-secondary mb-1"> Chúng tôi đã gửi liên kết xác thực tài khoản đến</p>
                {email && (
                    <p className="fw-bold mb-3" style={{ color: "var(--color-primary)" }}>
                        {email}
                    </p>
                )}

                <p className="text-secondary small mb-4">
                    Bấm vào liên kết trong email để kích hoạt tài khoản. Nếu không thấy
                    thư, hãy kiểm tra mục <strong>Spam</strong> hoặc <strong>Quảng cáo</strong>.
                </p>

                <button type="button" onClick={handleResend} disabled={countdown > 0 || sending} className="btn btn-primary w-100 py-3 fw-bold rounded-3 mb-3" style={{ backgroundColor: "var(--color-primary)", borderColor: "var(--color-primary)", fontSize: "15px", }}>
                    {sending
                        ? "Đang gửi..."
                        : countdown > 0
                            ? `Gửi lại email sau ${countdown}s`
                            : "Gửi lại email xác thực"}
                </button>

                <Link to={ROUTES.LOGIN} className="text-decoration-none small fw-bold d-inline-flex align-items-center justify-content-center gap-2" style={{ color: "var(--color-primary)" }}>
                    <ArrowLeft /> Quay lại đăng nhập
                </Link>
            </div>
        </div>
    );
}