import Modal from "react-bootstrap/Modal";

interface CodConfirmationModalProps {
    show: boolean;
    total: number;
    isSubmitting: boolean;
    errorMessage: string;
    onCancel: () => void;
    onConfirm: () => void;
}

export default function CodConfirmationModal({
    show, total, isSubmitting, errorMessage, onCancel, onConfirm,
}: CodConfirmationModalProps) {
    return (
        <Modal
            show={show}
            onHide={onCancel}
            centered
            backdrop={isSubmitting ? "static" : true}
            keyboard={!isSubmitting}
            className="cod-confirmation-modal"
            aria-labelledby="cod-confirmation-title"
            aria-describedby="cod-confirmation-description"
        >
            <Modal.Header>
                <Modal.Title as="h2" id="cod-confirmation-title">Xác nhận đặt hàng</Modal.Title>
            </Modal.Header>
            <Modal.Body aria-busy={isSubmitting}>
                <p id="cod-confirmation-description" className="text-muted">
                    Bạn có chắc muốn đặt đơn hàng này? Bạn sẽ thanh toán cho nhân viên giao hàng khi nhận hàng.
                </p>
                <div className="cod-confirmation-total">
                    <span>Tổng thanh toán khi nhận hàng</span>
                    <strong>{total.toLocaleString("vi-VN")}đ</strong>
                </div>
                {errorMessage && <p className="alert alert-danger mt-3 mb-0" role="alert">{errorMessage}</p>}
            </Modal.Body>
            <Modal.Footer>
                <button type="button" className="btn btn-outline-secondary" disabled={isSubmitting} onClick={onCancel} autoFocus>
                    Hủy
                </button>
                <button type="button" className="btn checkout-continue-btn fw-bold" disabled={isSubmitting} onClick={onConfirm}>
                    {isSubmitting ? "Đang tạo đơn…" : "Xác nhận"}
                </button>
            </Modal.Footer>
        </Modal>
    );
}
