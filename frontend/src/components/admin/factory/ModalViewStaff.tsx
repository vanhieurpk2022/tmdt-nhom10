import { Modal, Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faUserCheck,
    faEnvelope,
    faPhone,
    faBriefcase,
    faCalendarDays,
    faPenToSquare,
    faShieldHalved,
} from "@fortawesome/free-solid-svg-icons";
import type { FactoryStaffItem } from "../../../api/factory/FactoryService";
import CustomBadge from "../badge/CustomBadge";

interface ModalViewStaffProps {
    show: boolean;
    staff: FactoryStaffItem | null;
    onHide: () => void;
    onEdit: () => void;
}

const StatusBadgeConfig: Record<string, { label: string; badge: string }> = {
    ACTIVE: { label: "Đang làm việc", badge: "bg-success-subtle text-success-emphasis" },
    ON_LEAVE: { label: "Nghỉ phép", badge: "bg-warning-subtle text-warning-emphasis" },
    INACTIVE: { label: "Đã nghỉ / Tạm ngưng", badge: "bg-secondary-subtle text-secondary-emphasis" },
    BANNED: { label: "Đã bị khóa", badge: "bg-danger-subtle text-danger-emphasis" },
};

export default function ModalViewStaff({ show, staff, onHide, onEdit }: ModalViewStaffProps) {
    if (!staff) return null;

    const statusInfo = StatusBadgeConfig[staff.status] || {
        label: staff.status,
        badge: "bg-light text-dark",
    };

    return (
        <Modal show={show} onHide={onHide} centered size="md">
            <Modal.Header closeButton className="border-0 pb-0">
                <Modal.Title as="h5" className="fw-bold">
                    Chi tiết nhân viên
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="pt-3">
                <div className="text-center mb-4">
                    <div
                        className="rounded-circle d-inline-flex align-items-center justify-content-center text-white fw-bold shadow-sm mb-3"
                        style={{
                            width: 72,
                            height: 72,
                            fontSize: "1.5rem",
                            backgroundColor: "#2563EB",
                        }}
                    >
                        {staff.avatar || "NV"}
                    </div>
                    <h5 className="fw-bold mb-1">{staff.fullname || "Chưa cập nhật tên"}</h5>
                    <div className="d-flex justify-content-center align-items-center gap-2 mb-2">
                        <span className="text-muted small">Mã: NV-{String(staff.id).padStart(3, "0")}</span>
                        <span>•</span>
                        <CustomBadge label={statusInfo.label} badge={statusInfo.badge} />
                    </div>
                    <span className="badge bg-danger-subtle text-danger-emphasis px-3 py-1 rounded-pill">
                        {staff.factoryPosition || (staff.factoryRole === "OWNER" ? "Quản lý" : "Nhân viên")}
                    </span>
                </div>

                <div className="card bg-light border-0 rounded-3 p-3">
                    <div className="d-flex flex-column gap-3 small">
                        <div className="d-flex align-items-center justify-content-between border-bottom pb-2">
                            <span className="text-muted">
                                <FontAwesomeIcon icon={faEnvelope} className="me-2 text-secondary" />
                                Email
                            </span>
                            <span className="fw-semibold text-dark">{staff.email}</span>
                        </div>

                        <div className="d-flex align-items-center justify-content-between border-bottom pb-2">
                            <span className="text-muted">
                                <FontAwesomeIcon icon={faPhone} className="me-2 text-secondary" />
                                Số điện thoại
                            </span>
                            <span className="fw-semibold text-dark">{staff.phone || "Chưa thiết lập"}</span>
                        </div>

                        <div className="d-flex align-items-center justify-content-between border-bottom pb-2">
                            <span className="text-muted">
                                <FontAwesomeIcon icon={faBriefcase} className="me-2 text-secondary" />
                                Vị trí xưởng
                            </span>
                            <span className="fw-semibold text-dark">{staff.factoryPosition}</span>
                        </div>

                        <div className="d-flex align-items-center justify-content-between border-bottom pb-2">
                            <span className="text-muted">
                                <FontAwesomeIcon icon={faShieldHalved} className="me-2 text-secondary" />
                                Quyền hệ thống
                            </span>
                            <span className="fw-semibold text-dark">
                                {staff.factoryRole === "OWNER" ? "Chủ xưởng / Quản trị" : "Nhân viên xưởng"}
                            </span>
                        </div>

                        <div className="d-flex align-items-center justify-content-between">
                            <span className="text-muted">
                                <FontAwesomeIcon icon={faCalendarDays} className="me-2 text-secondary" />
                                Ngày tạo tài khoản
                            </span>
                            <span className="fw-semibold text-dark">
                                {staff.joinedAt ? new Date(staff.joinedAt).toLocaleDateString("vi-VN") : "N/A"}
                            </span>
                        </div>
                    </div>
                </div>
            </Modal.Body>
            <Modal.Footer className="border-0 pt-0">
                <Button variant="light" className="border px-3" onClick={onHide}>
                    Đóng
                </Button>
                <Button
                    variant="primary"
                    className="px-3 fw-semibold"
                    onClick={() => {
                        onHide();
                        onEdit();
                    }}
                >
                    <FontAwesomeIcon icon={faPenToSquare} className="me-2" />
                    Chỉnh sửa
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
