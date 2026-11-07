import Modal from "react-bootstrap/Modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBagShopping } from "@fortawesome/free-solid-svg-icons";

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
                <span className="cod-confirmation-icon" aria-hidden="true">
                    <FontAwesomeIcon icon={faBagShopping} />
                </span>
                <div>
                    <Modal.Title as="h2" id="cod-confirmation-title">Xác nhận đặt hàng</Modal.Title>
                    <p className="cod-confirmation-subtitle">Thanh toán khi nhận hàng (COD)</p>
                </div>
            </Modal.Header>
            <Modal.Body aria-busy={isSubmitting}>
                <p id="cod-confirmation-description">
                    Bạn sẽ thanh toán bằng tiền mặt cho nhân viên giao hàng khi nhận hàng.
                </p>
                <div className="cod-confirmation-total">
                    <span>Tổng thanh toán</span>
                    <strong>{total.toLocaleString("vi-VN")} ₫</strong>
                </div>
                {errorMessage && <p className="alert alert-danger mt-3 mb-0" role="alert">{errorMessage}</p>}
            </Modal.Body>
            <Modal.Footer>
                <button type="button" className="btn cod-confirmation-back" disabled={isSubmitting} onClick={onCancel} autoFocus>
                    Quay lại
                </button>
                <button type="button" className="btn checkout-continue-btn" disabled={isSubmitting} onClick={onConfirm}>
                    {isSubmitting ? "Đang tạo đơn…" : "Xác nhận đặt hàng"}
                </button>
            </Modal.Footer>
        </Modal>
    );
}
