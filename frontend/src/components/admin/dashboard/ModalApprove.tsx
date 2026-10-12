import { faCircleCheck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { DataTableApprove } from "./DataTableApprove";
import { ShieldCheck } from "react-bootstrap-icons";
import { Modal } from "react-bootstrap";



interface ModalApproveProps {
    show: boolean;
    onClose: () => void;
}

export function ModalApprove({ show, onClose }: ModalApproveProps) {
    return (

        <Modal show={show} onHide={onClose} size="xl" centered scrollable>
            <Modal.Header closeButton>
                <div className="d-flex flex-row align-items-center gap-3">
                    <div
                        className="d-flex align-items-center justify-content-center flex-shrink-0 border border-danger-subtle bg-danger-subtle rounded-3"
                        style={{ width: 44, height: 44 }}
                    >
                        <ShieldCheck size={22} color="#e11d48" />
                    </div>
                    <Modal.Title as="h5" className="m-0">
                        Phê duyệt hồ sơ xưởng gia công mới
                    </Modal.Title>
                    <span
                        className="d-inline-flex align-items-center gap-2 rounded-pill border fw-semibold px-2 py-1"
                        style={{ fontSize: 12, color: "#be123c", background: "#fff1f2", borderColor: "#fecdd3" }}
                    >
                        <span className="rounded-circle" style={{ width: 6, height: 6, background: "#e11d48" }} />
                        5 yêu cầu chờ duyệt
                    </span>
                </div>
            </Modal.Header>

            <Modal.Body>
                <DataTableApprove />
            </Modal.Body>
        </Modal>
    );
}