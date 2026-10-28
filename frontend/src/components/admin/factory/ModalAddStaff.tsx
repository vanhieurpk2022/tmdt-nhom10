import { useState } from "react";
import { Modal, Form, Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faUserPlus,
    faEye,
    faEyeSlash,
    faEnvelope,
    faLock,
    faUser,
    faPhone,
    faBriefcase,
} from "@fortawesome/free-solid-svg-icons";
import { FactoryServiceManager, type FactoryStaffCreateRequest } from "../../../api/factory/FactoryService";
import { useToastContext } from "../../toasts/ToastContext";

interface ModalAddStaffProps {
    show: boolean;
    onHide: () => void;
    onSuccess: () => void;
}

const COMMON_POSITIONS = [
    "Nhân viên bán hàng",
    "Nhân viên kho",
    "Nhân viên giao hàng",
    "Nhân viên kỹ thuật / pha chế",
    "Quản lý xưởng",
    "Khác",
];

export default function ModalAddStaff({ show, onHide, onSuccess }: ModalAddStaffProps) {
    const { showToast } = useToastContext();

    const [fullname, setFullname] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [phone, setPhone] = useState("");
    const [selectedPosition, setSelectedPosition] = useState(COMMON_POSITIONS[0]);
    const [customPosition, setCustomPosition] = useState("");
    const [status, setStatus] = useState<"ACTIVE" | "INACTIVE" | "ON_LEAVE">("ACTIVE");

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const resetForm = () => {
        setFullname("");
        setEmail("");
        setPassword("");
        setPhone("");
        setSelectedPosition(COMMON_POSITIONS[0]);
        setCustomPosition("");
        setStatus("ACTIVE");
        setShowPassword(false);
        setErrors({});
    };

    const handleClose = () => {
        resetForm();
        onHide();
    };

    const validate = (): boolean => {
        const errs: Record<string, string> = {};

        if (!fullname.trim()) {
            errs.fullname = "Vui lòng nhập họ và tên nhân viên.";
        }

        if (!email.trim()) {
            errs.email = "Vui lòng nhập email đăng nhập.";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            errs.email = "Email không đúng định dạng.";
        }

        if (!password) {
            errs.password = "Vui lòng nhập mật khẩu khởi tạo.";
        } else if (password.length < 6) {
            errs.password = "Mật khẩu phải có ít nhất 6 ký tự.";
        }

        if (phone.trim() && !/^[0-9+() -]{9,15}$/.test(phone.trim())) {
            errs.phone = "Số điện thoại không hợp lệ.";
        }

        if (selectedPosition === "Khác" && !customPosition.trim()) {
            errs.position = "Vui lòng nhập vị trí công việc.";
        }

        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        try {
            const finalPosition = selectedPosition === "Khác" ? customPosition.trim() : selectedPosition;
            const payload: FactoryStaffCreateRequest = {
                fullname: fullname.trim(),
                email: email.trim(),
                password,
                phone: phone.trim() || undefined,
                factoryPosition: finalPosition,
                status,
            };

            await FactoryServiceManager.createStaff(payload);
            showToast("Thành công", `Đã tạo tài khoản cho nhân viên ${fullname.trim()}`, "success");
            resetForm();
            onSuccess();
            onHide();
        } catch (err: any) {
            const msg = err?.response?.data?.message || "Không thể tạo tài khoản nhân viên. Vui lòng thử lại.";
            showToast("Lỗi tạo nhân viên", msg, "danger");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={show} onHide={handleClose} centered size="lg" backdrop="static">
            <Modal.Header closeButton className="border-0 pb-0">
                <div className="d-flex align-items-center gap-3">
                    <div
                        className="rounded-circle d-flex align-items-center justify-content-center bg-danger-subtle text-danger"
                        style={{ width: 48, height: 48, fontSize: "1.25rem" }}
                    >
                        <FontAwesomeIcon icon={faUserPlus} />
                    </div>
                    <div>
                        <Modal.Title as="h5" className="fw-bold mb-0">
                            Tạo tài khoản nhân viên xưởng
                        </Modal.Title>
                        <small className="text-muted">
                            Cấp tài khoản cho nhân viên để truy cập và tham gia vận hành xưởng
                        </small>
                    </div>
                </div>
            </Modal.Header>

            <Form onSubmit={handleSubmit}>
                <Modal.Body className="pt-4">
                    <div className="row g-3">
                        {/* Họ và tên */}
                        <div className="col-12 col-md-6">
                            <Form.Group controlId="staffFullname">
                                <Form.Label className="fw-semibold small">
                                    Họ và tên <span className="text-danger">*</span>
                                </Form.Label>
                                <div className="input-group">
                                    <span className="input-group-text bg-white">
                                        <FontAwesomeIcon icon={faUser} className="text-secondary" />
                                    </span>
                                    <Form.Control
                                        type="text"
                                        placeholder="Ví dụ: Nguyễn Văn An"
                                        value={fullname}
                                        onChange={(e) => setFullname(e.target.value)}
                                        isInvalid={!!errors.fullname}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.fullname}
                                    </Form.Control.Feedback>
                                </div>
                            </Form.Group>
                        </div>

                        {/* Email */}
                        <div className="col-12 col-md-6">
                            <Form.Group controlId="staffEmail">
                                <Form.Label className="fw-semibold small">
                                    Email đăng nhập <span className="text-danger">*</span>
                                </Form.Label>
                                <div className="input-group">
                                    <span className="input-group-text bg-white">
                                        <FontAwesomeIcon icon={faEnvelope} className="text-secondary" />
                                    </span>
                                    <Form.Control
                                        type="email"
                                        placeholder="nhanvien@gmail.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        isInvalid={!!errors.email}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.email}
                                    </Form.Control.Feedback>
                                </div>
                            </Form.Group>
                        </div>

                        {/* Mật khẩu khởi tạo */}
                        <div className="col-12 col-md-6">
                            <Form.Group controlId="staffPassword">
                                <Form.Label className="fw-semibold small">
                                    Mật khẩu khởi tạo <span className="text-danger">*</span>
                                </Form.Label>
                                <div className="input-group">
                                    <span className="input-group-text bg-white">
                                        <FontAwesomeIcon icon={faLock} className="text-secondary" />
                                    </span>
                                    <Form.Control
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Tối thiểu 6 ký tự"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        isInvalid={!!errors.password}
                                    />
                                    <Button
                                        variant="outline-secondary"
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        tabIndex={-1}
                                    >
                                        <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                                    </Button>
                                    <Form.Control.Feedback type="invalid">
                                        {errors.password}
                                    </Form.Control.Feedback>
                                </div>
                                <small className="text-muted" style={{ fontSize: "0.75rem" }}>
                                    Nhân viên có thể đổi lại mật khẩu sau khi đăng nhập.
                                </small>
                            </Form.Group>
                        </div>

                        {/* Số điện thoại */}
                        <div className="col-12 col-md-6">
                            <Form.Group controlId="staffPhone">
                                <Form.Label className="fw-semibold small">Số điện thoại</Form.Label>
                                <div className="input-group">
                                    <span className="input-group-text bg-white">
                                        <FontAwesomeIcon icon={faPhone} className="text-secondary" />
                                    </span>
                                    <Form.Control
                                        type="tel"
                                        placeholder="0987654321"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        isInvalid={!!errors.phone}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.phone}
                                    </Form.Control.Feedback>
                                </div>
                            </Form.Group>
                        </div>

                        {/* Vị trí / Vai trò */}
                        <div className="col-12 col-md-6">
                            <Form.Group controlId="staffPosition">
                                <Form.Label className="fw-semibold small">
                                    Vị trí công việc <span className="text-danger">*</span>
                                </Form.Label>
                                <div className="input-group">
                                    <span className="input-group-text bg-white">
                                        <FontAwesomeIcon icon={faBriefcase} className="text-secondary" />
                                    </span>
                                    <Form.Select
                                        value={selectedPosition}
                                        onChange={(e) => setSelectedPosition(e.target.value)}
                                    >
                                        {COMMON_POSITIONS.map((pos) => (
                                            <option key={pos} value={pos}>
                                                {pos}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </div>
                            </Form.Group>

                            {selectedPosition === "Khác" && (
                                <div className="mt-2">
                                    <Form.Control
                                        type="text"
                                        placeholder="Nhập tên vị trí công việc..."
                                        value={customPosition}
                                        onChange={(e) => setCustomPosition(e.target.value)}
                                        isInvalid={!!errors.position}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.position}
                                    </Form.Control.Feedback>
                                </div>
                            )}
                        </div>

                        {/* Trạng thái làm việc */}
                        <div className="col-12 col-md-6">
                            <Form.Group controlId="staffStatus">
                                <Form.Label className="fw-semibold small">Trạng thái ban đầu</Form.Label>
                                <Form.Select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value as any)}
                                >
                                    <option value="ACTIVE">Đang làm việc (ACTIVE)</option>
                                    <option value="ON_LEAVE">Nghỉ phép (ON_LEAVE)</option>
                                    <option value="INACTIVE">Tạm ngưng (INACTIVE)</option>
                                </Form.Select>
                            </Form.Group>
                        </div>
                    </div>
                </Modal.Body>

                <Modal.Footer className="border-0 pt-0">
                    <Button variant="light" className="border px-4" onClick={handleClose} disabled={loading}>
                        Hủy
                    </Button>
                    <Button variant="danger" type="submit" className="px-4 fw-semibold" disabled={loading}>
                        {loading ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" />
                                Đang tạo...
                            </>
                        ) : (
                            <>
                                <FontAwesomeIcon icon={faUserPlus} className="me-2" />
                                Tạo tài khoản
                            </>
                        )}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}
