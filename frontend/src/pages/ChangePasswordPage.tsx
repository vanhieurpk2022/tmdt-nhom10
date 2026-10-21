import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash, faShieldHalved, faSpinner, faCheckCircle, faExclamationCircle } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import AccountLayout from "../components/layout/AccountLayout";
import { profileService } from "../api/ProfileService";

// Trang Đổi mật khẩu - Cho phép người dùng cập nhật mật khẩu đăng nhập
export default function ChangePasswordPage() {
    // Trạng thái ẩn/hiện mật khẩu
    const [showCurrent, setShowCurrent] = useState<boolean>(false);
    const [showNew, setShowNew] = useState<boolean>(false);
    const [showConfirm, setShowConfirm] = useState<boolean>(false);

    // Dữ liệu form nhập mật khẩu
    const [currentPassword, setCurrentPassword] = useState<string>("");
    const [newPassword, setNewPassword] = useState<string>("");
    const [confirmPassword, setConfirmPassword] = useState<string>("");

    // Trạng thái thực thi và thông báo
    const [loading, setLoading] = useState<boolean>(false);
    const [message, setMessage] = useState<{ text: string; type: "success" | "danger" } | null>(null);

    // Xử lý nộp form đổi mật khẩu
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        // Kiểm tra hợp lệ dữ liệu nhập
        if (!currentPassword) {
            setMessage({ text: "Vui lòng nhập mật khẩu hiện tại.", type: "danger" });
            return;
        }

        if (newPassword.length < 8) {
            setMessage({ text: "Mật khẩu mới phải có ít nhất 8 ký tự.", type: "danger" });
            return;
        }

        // Kiểm tra chứa chữ và số
        const hasLetter = /[a-zA-Z]/.test(newPassword);
        const hasNumber = /[0-9]/.test(newPassword);
        if (!hasLetter || !hasNumber) {
            setMessage({ text: "Mật khẩu mới phải bao gồm cả chữ và số.", type: "danger" });
            return;
        }

        if (newPassword === currentPassword) {
            setMessage({ text: "Mật khẩu mới không được trùng với mật khẩu hiện tại.", type: "danger" });
            return;
        }

        if (newPassword !== confirmPassword) {
            setMessage({ text: "Mật khẩu xác nhận không khớp với mật khẩu mới.", type: "danger" });
            return;
        }

        setLoading(true);
        try {
            await profileService.changePassword({
                currentPassword,
                newPassword,
                confirmPassword,
            });

            setMessage({
                text: "Đổi mật khẩu thành công! Hãy dùng mật khẩu mới cho các lần đăng nhập tiếp theo.",
                type: "success",
            });

            // Xóa trắng form sau khi đổi thành công
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (error: any) {
            console.error("Lỗi khi đổi mật khẩu:", error);
            const serverMessage = error.response?.data?.message || "Đổi mật khẩu thất bại. Vui lòng kiểm tra lại mật khẩu hiện tại.";
            setMessage({ text: serverMessage, type: "danger" });
        } finally {
            setLoading(false);
        }
    };

    // Đặt lại dữ liệu form
    const handleReset = () => {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setMessage(null);
    };

    return (
        <AccountLayout breadcrumbCurrent="Đổi mật khẩu">
            <div className="bg-white rounded-4 shadow-sm p-4 px-lg-5 pb-lg-5 pt-lg-4">
                <h2 className="h4 fw-bold text-dark mb-2">Đổi mật khẩu</h2>
                <p className="text-muted fs-7 mb-4">Cập nhật mật khẩu định kỳ để tăng mức độ an toàn cho tài khoản Oilia của bạn.</p>

                {/* Thông báo bảo mật */}
                <div className="d-flex align-items-center p-3 rounded-4 border bg-light bg-opacity-50 mb-4 gap-3">
                    <div className="text-success fs-3 px-2">
                        <FontAwesomeIcon icon={faShieldHalved} />
                    </div>
                    <div>
                        <div className="fw-bold text-dark mb-1">Bảo mật tài khoản</div>
                        <div className="text-muted fs-8">Hãy sử dụng mật khẩu mạnh và không dùng lại mật khẩu từ các dịch vụ khác.</div>
                    </div>
                </div>

                {/* Thông báo kết quả thực hiện */}
                {message && (
                    <div
                        className={`alert alert-${message.type} alert-dismissible fade show rounded-3 fs-7 mb-4 d-flex align-items-center gap-2`}
                        role="alert"
                    >
                        <FontAwesomeIcon icon={message.type === "success" ? faCheckCircle : faExclamationCircle} />
                        <div>{message.text}</div>
                        <button type="button" className="btn-close ms-auto" onClick={() => setMessage(null)} aria-label="Close"></button>
                    </div>
                )}

                {/* Biểu mẫu đổi mật khẩu */}
                <form onSubmit={handleSubmit}>
                    {/* Mật khẩu hiện tại */}
                    <div className="mb-4">
                        <label className="form-label fw-bold text-dark fs-7">Mật khẩu hiện tại</label>
                        <div className="position-relative">
                            <input
                                type={showCurrent ? "text" : "password"}
                                className="form-control rounded-3 py-2 text-dark pe-5"
                                placeholder="Nhập mật khẩu hiện tại"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                className="btn position-absolute top-50 end-0 translate-middle-y text-muted border-0"
                                onClick={() => setShowCurrent(!showCurrent)}
                                tabIndex={-1}
                            >
                                <FontAwesomeIcon icon={showCurrent ? faEyeSlash : faEye} />
                            </button>
                        </div>
                    </div>

                    {/* Mật khẩu mới */}
                    <div className="mb-4">
                        <label className="form-label fw-bold text-dark fs-7">Mật khẩu mới</label>
                        <div className="position-relative">
                            <input
                                type={showNew ? "text" : "password"}
                                className="form-control rounded-3 py-2 text-dark pe-5"
                                placeholder="Nhập mật khẩu mới"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                className="btn position-absolute top-50 end-0 translate-middle-y text-muted border-0"
                                onClick={() => setShowNew(!showNew)}
                                tabIndex={-1}
                            >
                                <FontAwesomeIcon icon={showNew ? faEyeSlash : faEye} />
                            </button>
                        </div>
                    </div>

                    {/* Xác nhận mật khẩu mới */}
                    <div className="mb-4">
                        <label className="form-label fw-bold text-dark fs-7">Xác nhận mật khẩu mới</label>
                        <div className="position-relative">
                            <input
                                type={showConfirm ? "text" : "password"}
                                className="form-control rounded-3 py-2 text-dark pe-5"
                                placeholder="Nhập lại mật khẩu mới"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                className="btn position-absolute top-50 end-0 translate-middle-y text-muted border-0"
                                onClick={() => setShowConfirm(!showConfirm)}
                                tabIndex={-1}
                            >
                                <FontAwesomeIcon icon={showConfirm ? faEyeSlash : faEye} />
                            </button>
                        </div>
                    </div>

                    {/* Gợi ý tiêu chuẩn mật khẩu */}
                    <div className="bg-light rounded-4 p-4 mb-2 mt-4">
                        <div className="fw-bold text-dark mb-2 fs-7">Mật khẩu mới nên đáp ứng</div>
                        <ul className="text-muted fs-7 mb-0 list-unstyled">
                            <li className="mb-1"><span className="text-danger me-2">*</span>Ít nhất 8 ký tự</li>
                            <li className="mb-1"><span className="text-danger me-2">*</span>Bao gồm cả chữ và số</li>
                            <li className="mb-1"><span className="text-danger me-2">*</span>Nên có chữ hoa và ký tự đặc biệt</li>
                            <li className="mb-0"><span className="text-danger me-2">*</span>Không trùng với mật khẩu cũ</li>
                        </ul>
                    </div>
                    <div className="text-muted fs-8 mb-4 px-2">
                        Sau khi đổi mật khẩu thành công, hãy sử dụng mật khẩu mới cho những lần đăng nhập tiếp theo.
                    </div>

                    {/* Nút hành động */}
                    <div className="d-flex justify-content-end gap-3 mt-4">
                        <button
                            type="button"
                            className="btn btn-white border fw-bold px-4 py-2 rounded-3 text-dark"
                            onClick={handleReset}
                            disabled={loading}
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary fw-bold px-4 py-2 rounded-3 d-flex align-items-center gap-2"
                            disabled={loading}
                        >
                            {loading && <FontAwesomeIcon icon={faSpinner} spin />}
                            CẬP NHẬT
                        </button>
                    </div>
                </form>
            </div>
        </AccountLayout>
    );
}
