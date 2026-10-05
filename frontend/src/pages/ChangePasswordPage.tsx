import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faShieldHalved } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import AccountLayout from "../components/layout/AccountLayout";

export default function ChangePasswordPage() {
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    return (
                <AccountLayout breadcrumbCurrent="Đổi mật khẩu">
                        <div className="bg-white rounded-4 shadow-sm p-4 px-lg-5 pb-lg-5 pt-lg-4">
                            <h2 className="h4 fw-bold text-dark mb-2">Đổi mật khẩu</h2>
                            <p className="text-muted fs-7 mb-4">Cập nhật mật khẩu định kỳ để tăng mức độ an toàn cho tài khoản Oilia của bạn.</p>

                            {/* Security Alert */}
                            <div className="d-flex align-items-center p-3 rounded-4 border bg-light bg-opacity-50 mb-4 gap-3">
                                <div className="text-success fs-3 px-2">
                                    <FontAwesomeIcon icon={faShieldHalved} />
                                </div>
                                <div>
                                    <div className="fw-bold text-dark mb-1">Bảo mật tài khoản</div>
                                    <div className="text-muted fs-8">Hãy sử dụng mật khẩu mạnh và không dùng lại mật khẩu từ các dịch vụ khác.</div>
                                </div>
                            </div>

                            {/* Form */}
                            <form>
                                <div className="mb-4">
                                    <label className="form-label fw-bold text-dark fs-7">Mật khẩu hiện tại</label>
                                    <div className="position-relative">
                                        <input type={showCurrent ? "text" : "password"} className="form-control rounded-3 py-2 text-muted pe-5" placeholder="Nhập mật khẩu hiện tại" />
                                        <button type="button" className="btn position-absolute top-50 end-0 translate-middle-y text-muted border-0" onClick={() => setShowCurrent(!showCurrent)}>
                                            <FontAwesomeIcon icon={faEye} />
                                        </button>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label className="form-label fw-bold text-dark fs-7">Mật khẩu mới</label>
                                    <div className="position-relative">
                                        <input type={showNew ? "text" : "password"} className="form-control rounded-3 py-2 text-muted pe-5" placeholder="Nhập mật khẩu mới" />
                                        <button type="button" className="btn position-absolute top-50 end-0 translate-middle-y text-muted border-0" onClick={() => setShowNew(!showNew)}>
                                            <FontAwesomeIcon icon={faEye} />
                                        </button>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label className="form-label fw-bold text-dark fs-7">Xác nhận mật khẩu mới</label>
                                    <div className="position-relative">
                                        <input type={showConfirm ? "text" : "password"} className="form-control rounded-3 py-2 text-muted pe-5" placeholder="Nhập lại mật khẩu mới" />
                                        <button type="button" className="btn position-absolute top-50 end-0 translate-middle-y text-muted border-0" onClick={() => setShowConfirm(!showConfirm)}>
                                            <FontAwesomeIcon icon={faEye} />
                                        </button>
                                    </div>
                                </div>

                                {/* Password Rules Note */}
                                <div className="bg-light rounded-4 p-4 mb-2 mt-4">
                                    <div className="fw-bold text-dark mb-2 fs-7">Mật khẩu mới nên đáp ứng</div>
                                    <ul className="text-muted fs-7 mb-0 list-unstyled">
                                        <li className="mb-1"><span className="text-danger me-2">*</span>Ít nhất 8 ký tự</li>
                                        <li className="mb-1"><span className="text-danger me-2">*</span>Bao gồm chữ và số</li>
                                        <li className="mb-1"><span className="text-danger me-2">*</span>Nên có chữ hoa và ký tự đặc biệt</li>
                                        <li className="mb-0"><span className="text-danger me-2">*</span>Không trùng mật khẩu cũ</li>
                                    </ul>
                                </div>
                                <div className="text-muted fs-8 mb-4 px-2">
                                    Sau khi đổi mật khẩu thành công, hãy sử dụng mật khẩu mới cho những lần đăng nhập tiếp theo.
                                </div>

                                {/* Actions */}
                                <div className="d-flex justify-content-end gap-3 mt-4">
                                    <button type="button" className="btn btn-white border fw-bold px-4 py-2 rounded-3 text-dark">
                                        Hủy
                                    </button>
                                    <button type="submit" className="btn btn-primary fw-bold px-4 py-2 rounded-3">
                                        CẬP NHẬT
                                    </button>
                                </div>
                            </form>
                        </div>
                            </AccountLayout>
    );
}
