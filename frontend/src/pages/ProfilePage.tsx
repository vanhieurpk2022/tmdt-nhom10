import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleCheck, faSpinner, faCheckCircle, faExclamationCircle } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";
import AccountLayout from "../components/layout/AccountLayout";
import { profileService, type UserProfile } from "../api/ProfileService";
import { useAuth } from "../api/AuthContext";

export default function ProfilePage() {
    const { setUser } = useAuth();

    // Trạng thái hồ sơ người dùng
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    // Form inputs
    const [fullname, setFullname] = useState("");
    const [phone, setPhone] = useState("");
    const [birthday, setBirthday] = useState("");
    const [gender, setGender] = useState("");
    const [preferredArea, setPreferredArea] = useState("");

    // Tải dữ liệu hồ sơ từ API khi mở trang
    useEffect(() => {
        let isMounted = true;
        setLoading(true);

        profileService.getProfile()
            .then((data) => {
                if (!isMounted) return;
                setProfile(data);
                setFullname(data.fullname || "");
                setPhone(data.phone || "");
                setBirthday(data.birthday || "");
                setGender(data.gender || "Nam");
                setPreferredArea(data.preferredArea || "");
            })
            .catch((err) => {
                console.error("Lỗi khi tải hồ sơ:", err);
                if (isMounted) {
                    setMessage({ type: "error", text: "Không thể tải thông tin hồ sơ. Vui lòng thử lại!" });
                }
            })
            .finally(() => {
                if (isMounted) setLoading(false);
            });

        return () => {
            isMounted = false;
        };
    }, []);

    // Xử lý gửi biểu mẫu cập nhật hồ sơ
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);

        try {
            const updated = await profileService.updateProfile({
                fullname,
                phone,
                birthday,
                gender,
                preferredArea,
            });

            setProfile(updated);
            setMessage({ type: "success", text: "Cập nhật hồ sơ cá nhân thành công!" });

            // Đồng bộ lại tên hiển thị trong AuthContext
            setUser((prev) => (prev ? { ...prev, fullName: updated.fullname } : null));
        } catch (err) {
            console.error("Lỗi khi lưu hồ sơ:", err);
            setMessage({ type: "error", text: "Cập nhật hồ sơ thất bại. Vui lòng thử lại!" });
        } finally {
            setSaving(false);
        }
    };

    // Đặt lại các trường theo dữ liệu hiện tại
    const handleReset = () => {
        if (!profile) return;
        setFullname(profile.fullname || "");
        setPhone(profile.phone || "");
        setBirthday(profile.birthday || "");
        setGender(profile.gender || "Nam");
        setPreferredArea(profile.preferredArea || "");
        setMessage(null);
    };

    const initial = (fullname || profile?.fullname || "U").charAt(0).toUpperCase();

    return (
        <AccountLayout breadcrumbCurrent="Hồ sơ cá nhân">
            <div className="bg-white rounded-4 shadow-sm p-4 px-lg-5 pb-lg-5 pt-lg-4">
                <h2 className="h4 fw-bold text-dark mb-2">Thông tin cá nhân</h2>
                <p className="text-muted fs-7 mb-4">Cập nhật hồ sơ để mua sắm, giao nhận và chăm sóc khách hàng thuận tiện hơn.</p>

                {loading ? (
                    <div className="text-center py-5">
                        <FontAwesomeIcon icon={faSpinner} spin className="fs-2 text-primary mb-2" />
                        <div className="text-muted fw-bold">Đang tải thông tin hồ sơ...</div>
                    </div>
                ) : (
                    <>
                        {/* Thông báo cập nhật */}
                        {message && (
                            <div className={`alert d-flex align-items-center gap-2 rounded-3 mb-4 ${
                                message.type === "success" ? "alert-success text-success" : "alert-danger text-danger"
                            }`}>
                                <FontAwesomeIcon icon={message.type === "success" ? faCheckCircle : faExclamationCircle} />
                                <span>{message.text}</span>
                            </div>
                        )}

                        {/* Thẻ hiển thị avatar và trạng thái tài khoản */}
                        <div className="d-flex flex-column flex-md-row align-items-center justify-content-between p-3 rounded-4 border bg-light bg-opacity-50 mb-4 gap-3">
                            <div className="d-flex align-items-center gap-3">
                                <div className="profile-avatar-xl bg-primary bg-opacity-10 text-primary fw-bold rounded-circle d-flex align-items-center justify-content-center flex-shrink-0">
                                    {initial}
                                </div>
                                <div>
                                    <div className="fw-bold text-dark fs-5 mb-1">{fullname || profile?.fullname}</div>
                                    <div className="text-muted fs-8">
                                        {profile?.isVerify ? "Email đã xác thực" : "Chưa xác thực email"} • Tài khoản khách hàng đang hoạt động
                                    </div>
                                </div>
                            </div>
                            <button type="button" className="btn btn-dark fw-bold px-4 py-2 rounded-3 fs-7 text-nowrap">
                                Thay ảnh đại diện
                            </button>
                        </div>

                        {/* Biểu mẫu chỉnh sửa thông tin */}
                        <form onSubmit={handleSubmit}>
                            <div className="row g-4 mb-4">
                                <div className="col-12 col-md-6">
                                    <label className="form-label fw-bold text-dark fs-7">Họ và tên</label>
                                    <input
                                        type="text"
                                        className="form-control rounded-3 py-2 text-dark"
                                        value={fullname}
                                        onChange={(e) => setFullname(e.target.value)}
                                        placeholder="Nhập họ và tên"
                                        required
                                    />
                                </div>
                                <div className="col-12 col-md-6">
                                    <label className="form-label fw-bold text-dark fs-7">Số điện thoại</label>
                                    <input
                                        type="text"
                                        className="form-control rounded-3 py-2 text-dark"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="Nhập số điện thoại"
                                    />
                                </div>
                                <div className="col-12 col-md-6">
                                    <label className="form-label fw-bold text-dark fs-7">Email</label>
                                    <div className="position-relative">
                                        <input
                                            type="email"
                                            className="form-control rounded-3 py-2 text-muted pe-5"
                                            value={profile?.email || ""}
                                            readOnly
                                        />
                                        <span className="position-absolute top-50 end-0 translate-middle-y me-3 badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 rounded-pill px-2 py-1 fs-8 d-flex align-items-center gap-1">
                                            <FontAwesomeIcon icon={faCircleCheck} /> Đã xác thực
                                        </span>
                                    </div>
                                </div>
                                <div className="col-12 col-md-6">
                                    <label className="form-label fw-bold text-dark fs-7">Ngày sinh</label>
                                    <input
                                        type="text"
                                        className="form-control rounded-3 py-2 text-dark"
                                        value={birthday}
                                        onChange={(e) => setBirthday(e.target.value)}
                                        placeholder="VD: 01/01/2000"
                                    />
                                </div>
                                <div className="col-12 col-md-6">
                                    <label className="form-label fw-bold text-dark fs-7">Giới tính</label>
                                    <select
                                        className="form-select rounded-3 py-2 text-dark"
                                        value={gender}
                                        onChange={(e) => setGender(e.target.value)}
                                    >
                                        <option value="Nam">Nam</option>
                                        <option value="Nữ">Nữ</option>
                                        <option value="Khác">Khác</option>
                                    </select>
                                </div>
                                <div className="col-12 col-md-6">
                                    <label className="form-label fw-bold text-dark fs-7">Khu vực nhận hàng ưu tiên</label>
                                    <input
                                        type="text"
                                        className="form-control rounded-3 py-2 text-dark"
                                        value={preferredArea}
                                        onChange={(e) => setPreferredArea(e.target.value)}
                                        placeholder="VD: Thành phố Hồ Chí Minh"
                                    />
                                </div>
                            </div>

                            {/* Lưu ý bảo mật */}
                            <div className="bg-light rounded-4 p-4 mb-4">
                                <div className="fw-bold text-dark mb-1 fs-7">Lưu ý</div>
                                <p className="text-muted fs-7 mb-0">
                                    Thông tin hồ sơ được dùng để hỗ trợ đặt hàng, giao nhận và chăm sóc khách hàng trên Oilia.<br />
                                    Bạn có thể cập nhật sổ địa chỉ và đổi mật khẩu ở menu bên trái khi cần.
                                </p>
                            </div>

                            {/* Nút hành động */}
                            <div className="d-flex justify-content-end gap-3">
                                <button
                                    type="button"
                                    className="btn btn-white border fw-bold px-4 py-2 rounded-3 text-dark"
                                    onClick={handleReset}
                                    disabled={saving}
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary fw-bold px-4 py-2 rounded-3 d-flex align-items-center gap-2"
                                    disabled={saving}
                                >
                                    {saving && <FontAwesomeIcon icon={faSpinner} spin />}
                                    Lưu
                                </button>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </AccountLayout>
    );
}
