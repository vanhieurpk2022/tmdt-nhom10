import { Modal } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";

interface ConfirmDeleteModalProps {
    show: boolean;
    title?: string;
    /** Tên mục sắp xóa, hiển thị đậm trong nội dung */
    itemName?: string;
    loading?: boolean;
    onConfirm: () => void;
    onHide: () => void;
}

export default function ConfirmDeleteModal({
    show,
    title = "Xác nhận xóa",
    itemName,
    loading = false,
    onConfirm,
    onHide,
}: ConfirmDeleteModalProps) {
    return (
        <Modal
            show={show}
            onHide={loading ? undefined : onHide}
            centered
            backdrop="static"
            contentClassName="border-0 shadow rounded-4 overflow-hidden"
        >
            <Modal.Body className="p-4 text-center">
                <span
                    className="d-inline-flex align-items-center justify-content-center rounded-circle bg-danger-subtle text-danger mb-3"
                    style={{ width: 56, height: 56 }}
                >
                    <FontAwesomeIcon icon={faTriangleExclamation} size="lg" />
                </span>

                <h5 className="fw-bold mb-2">{title}</h5>
                <p className="text-secondary mb-0">
                    Bạn có chắc muốn xóa
                    {itemName ? <> <strong className="text-dark">{itemName}</strong></> : " mục này"}?
                    Hành động này không thể hoàn tác.
                </p>
            </Modal.Body>

            <Modal.Footer className="border-0 justify-content-center gap-2 pt-0 pb-4">
                <button
                    type="button"
                    className="btn btn-light border fw-semibold px-4"
                    onClick={onHide}
                    disabled={loading}
                >
                    Hủy
                </button>
                <button
                    type="button"
                    className="btn btn-danger fw-semibold px-4"
                    onClick={onConfirm}
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />
                            Đang xóa...
                        </>
                    ) : (
                        <>
                            <FontAwesomeIcon icon={faTrash} className="me-2" />
                            Xóa
                        </>
                    )}
                </button>
            </Modal.Footer>
        </Modal>
    );
}