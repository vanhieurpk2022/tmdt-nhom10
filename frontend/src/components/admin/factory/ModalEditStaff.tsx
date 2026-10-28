import { useEffect, useState } from "react";
import { Modal, Form, Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faPenToSquare,
    faEnvelope,
    faUser,
    faPhone,
    faBriefcase,
} from "@fortawesome/free-solid-svg-icons";
import {
    FactoryServiceManager,
    type FactoryStaffItem,
    type FactoryStaffUpdateRequest,
} from "../../../api/factory/FactoryService";
import { useToastContext } from "../../toasts/ToastContext";

interface ModalEditStaffProps {
    show: boolean;
    staff: FactoryStaffItem | null;
    onHide: () => void;
    onSuccess: () => void;
}

const COMMON_POSITIONS = [
    "Quản lý",
    "Nhân viên bán hàng",
    "Nhân viên kho",
    "Nhân viên giao hàng",
    "Nhân viên kỹ thuật / pha chế",
    "Khác",
];

export default function ModalEditStaff({ show, staff, onHide, onSuccess }: ModalEditStaffProps) {
    const { showToast } = useToastContext();

    const [fullname, setFullname] = useState("");
    const [phone, setPhone] = useState("");
    const [selectedPosition, setSelectedPosition] = useState(COMMON_POSITIONS[0]);
    const [customPosition, setCustomPosition] = useState("");
    const [status, setStatus] = useState<"ACTIVE" | "INACTIVE" | "ON_LEAVE">("ACTIVE");

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (staff) {
            setFullname(staff.fullname || "");
            setPhone(staff.phone || "");
            setStatus(
                staff.status === "ACTIVE" || staff.status === "ON_LEAVE" || staff.status === "INACTIVE"
                    ? staff.status
                    : "ACTIVE"
            );

            const pos = staff.factoryPosition || "";
            if (COMMON_POSITIONS.includes(pos)) {
                setSelectedPosition(pos);
                setCustomPosition("");
            } else if (pos) {
                setSelectedPosition("Khác");
                setCustomPosition(pos);
            } else {
                setSelectedPosition(COMMON_POSITIONS[0]);
                setCustomPosition("");
            }
            setErrors({});
        }
    }, [staff]);

    const validate = (): boolean => {
        const errs: Record<string, string> = {};
        if (!fullname.trim()) {
            errs.fullname = "Họ và tên không được để trống.";
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
        if (!staff || !validate()) return;

        setLoading(true);
        try {
            const finalPosition = selectedPosition === "Khác" ? customPosition.trim() : selectedPosition;
            const payload: FactoryStaffUpdateRequest = {
                fullname: fullname.trim(),
                phone: phone.trim() || undefined,
                factoryPosition: finalPosition,
                status,
            };

            await FactoryServiceManager.updateStaff(staff.id, payload);
            showToast("Thành công", `Đã cập nhật thông tin nhân viên ${fullname.trim()}`, "success");
            onSuccess();
            onHide();
        } catch (err: any) {
            const msg = err?.response?.data?.message || "Không thể cập nhật nhân viên. Vui lòng thử lại.";
            showToast("Lỗi cập nhật", msg, "danger");
        } finally {
            setLoading(false);
        }
    };

    if (!staff) return null;

    return (
        <Modal show={show} onHide={onHide} centered size="lg" backdrop="static">
            <Modal.Header closeButton className="border-0 pb-0">
                <div className="d-flex align-items-center gap-3">
                    <div
                        className="rounded-circle d-flex align-items-center justify-content-center bg-primary-subtle text-primary"
                        style={{ width: 48, height: 48, fontSize: "1.25rem" }}
                    >
                        <FontAwesomeIcon icon={faPenToSquare} />
                    </div>
                    <div>
                        <Modal.Title as="h5" className="fw-bold mb-0">
                            Chỉnh sửa thông tin nhân viên
                        </Modal.Title>
                        <small className="text-muted">
                            Mã nhân viên: NV-{String(staff.id).padStart(3, "0")} ({staff.email})
                        </small>
                    </div>
                </div>
            </Modal.Header>

            <Form onSubmit={handleSubmit}>
                <Modal.Body className="pt-4">
                    <div className="row g-3">
                        {/* Email - Readonly */}
                        <div className="col-12 col-md-6">
                            <Form.Group controlId="editStaffEmail">
                                <Form.Label className="fw-semibold small">Email đăng nhập</Form.Label>
                                <div className="input-group">
                                    <span className="input-group-text bg-light">
                                        <FontAwesomeIcon icon={faEnvelope} className="text-muted" />
                                    </span>
                                    <Form.Control type="email" value={staff.email} disabled className="bg-light" />
                                </div>
                                <small className="text-muted" style={{ fontSize: "0.75rem" }}>
                                    Email là định danh tài khoản, không thể thay đổi.
                                </small>
                            </Form.Group>
                        </div>

                        {/* Họ và tên */}
                        <div className="col-12 col-md-6">
                            <Form.Group controlId="editStaffFullname">
                                <Form.Label className="fw-semibold small">
                                    Họ và tên <span className="text-danger">*</span>
                                </Form.Label>
                                <div className="input-group">
                                    <span className="input-group-text bg-white">
                                        <FontAwesomeIcon icon={faUser} className="text-secondary" />
                                    </span>
                                    <Form.Control
                                        type="text"
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

                        {/* Số điện thoại */}
                        <div className="col-12 col-md-6">
                            <Form.Group controlId="editStaffPhone">
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
                            <Form.Group controlId="editStaffPosition">
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
                                        placeholder="Nhập tên vị trí..."
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
                            <Form.Group controlId="editStaffStatus">
                                <Form.Label className="fw-semibold small">Trạng thái làm việc</Form.Label>
                                <Form.Select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value as any)}
                                >
                                    <option value="ACTIVE">Đang làm việc (ACTIVE)</option>
                                    <option value="ON_LEAVE">Nghỉ phép (ON_LEAVE)</option>
                                    <option value="INACTIVE">Đã nghỉ / Tạm ngưng (INACTIVE)</option>
                                </Form.Select>
                            </Form.Group>
                        </div>
                    </div>
                </Modal.Body>

                <Modal.Footer className="border-0 pt-0">
                    <Button variant="light" className="border px-4" onClick={onHide} disabled={loading}>
                        Hủy
                    </Button>
                    <Button variant="primary" type="submit" className="px-4 fw-semibold" disabled={loading}>
                        {loading ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" />
                                Đang lưu...
                            </>
                        ) : (
                            "Lưu thay đổi"
                        )}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}
