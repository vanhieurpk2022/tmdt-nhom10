import { useEffect, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router";
import { EnvelopeCheck, ArrowLeft, CheckCircleFill } from "react-bootstrap-icons";
import { ROUTES } from "../routes/routes";
import { authService } from "../api/AuthService";
import axios from "axios";



export function VerifyEmailSuccess() {
    const [searchParam] = useSearchParams();
    const [success, setSuccess] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const verify = async () => {
            setLoading(true);
            const email = searchParam.get("email");
            const code = searchParam.get("code");

            if (!email || !code) {
                setLoading(false);
                return;
            }
            try {
                const res = await authService.verifyEmail(email, code);
                setSuccess(res.message);
            } catch (error) {
                if (axios.isAxiosError(error)) {
                    if (!error.response) {
                        setError("Lỗi mãy chủ vui lòng thực hiện lại sau");
                    } else {
                        setError(error.message);
                    }
                }
            } finally {
                setLoading(false);
            }

        }
        verify();
    }, [searchParam]);

    return (
        <div className="d-flex justify-content-center align-items-center min-vh-100 px-3" style={{ backgroundColor: "#f8f9fa" }}>
            <div className="card border-0 shadow-lg rounded-4 text-center p-4 p-md-5" style={{ maxWidth: "460px", width: "100%" }}>
                <div className="d-flex justify-content-center align-items-center rounded-circle mx-auto mb-4" style={{ width: "110px", height: "110px", backgroundColor: "color-mix(in srgb, var(--bs-success) 14%, white)", color: "var(--bs-success)" }}>
                    <CheckCircleFill size={56} />
                </div>

                <h3 className="fw-bold mb-2">Xác thực thành công</h3>
                {
                    loading ? (
                        <>
                            <h3 className="fw-bold mb-2">
                                Đang xác thực
                            </h3>

                            <p className="text-secondary mb-4">
                                Đang xác thực tài khoản ...
                            </p>
                        </>
                    ) : success ? (
                        <>
                            <h3 className="fw-bold mb-2">
                                Xác thực thành công
                            </h3>

                            <p className="text-secondary mb-4">
                                Tài khoản của bạn đã được kích hoạt.
                                Bạn có thể đăng nhập ngay bây giờ.
                            </p>
                        </>
                    ) : (
                        <>
                            <h3 className="fw-bold mb-2">
                                Xác thực không thành công
                            </h3>

                            <p className="text-secondary mb-4">
                                Mã xác thực không hợp lệ hoặc đã hết hạn.
                            </p>
                        </>
                    )
                }



                <Link to={ROUTES.LOGIN} replace className="btn btn-primary w-100 py-3 fw-bold rounded-3 mb-3" style={{ backgroundColor: "var(--color-primary)", borderColor: "var(--color-primary)", fontSize: "15px" }}>
                    Đăng nhập ngay
                </Link>

                <p className="text-secondary small mb-0"></p>
            </div>
        </div>
    );
}