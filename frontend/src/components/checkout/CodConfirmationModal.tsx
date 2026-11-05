import Modal from "react-bootstrap/Modal";
import { faBoxCheck, faHandHoldingDollar, faShieldCheck, faTruckFast } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

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
            aria-labelledby="cod-confirmation-title"
        >
            <Modal.Header closeButton={!isSubmitting} className="border-bottom pb-3">
                <div className="d-flex align-items-center gap-2.5">
                    <div className="rounded-circle d-flex align-items-center justify-content-center bg-primary bg-opacity-10 text-primary" style={{ width: "36px", height: "36px" }}>
                        <FontAwesomeIcon icon={faTruckFast} className="fs-7" />
                    </div>
                    <Modal.Title as="h2" id="cod-confirmation-title" className="h6 fw-bold text-dark mb-0">
                        Xác nhận đặt hàng (COD)
                    </Modal.Title>
                </div>
            </Modal.Header>
            <Modal.Body aria-busy={isSubmitting} className="py-3">
                <p className="text-secondary mb-3" style={{ fontSize: "13.5px", lineHeight: "1.5" }}>
                    Bạn sẽ thanh toán bằng tiền mặt trực tiếp cho nhân viên bưu tá khi nhận và kiểm tra kiện hàng tinh dầu.
                </p>

                <div className="p-3 rounded-3 bg-light border d-flex align-items-center justify-content-between mb-2">
                    <span className="text-muted fw-semibold" style={{ fontSize: "13.5px" }}>Tổng thanh toán khi nhận hàng:</span>
                    <strong className="fs-5 fw-bold text-danger">
                        {total.toLocaleString("vi-VN")}₫
                    </strong>
                </div>

                {errorMessage && (
                    <div className="p-2.5 rounded-3 bg-danger bg-opacity-10 border border-danger border-opacity-25 text-danger mt-3" style={{ fontSize: "12.5px" }} role="alert">
                        {errorMessage}
                    </div>
                )}
            </Modal.Body>
            <Modal.Footer className="border-top pt-2">
                <button
                    type="button"
                    className="btn btn-outline-secondary rounded-pill px-4 fw-semibold"
                    style={{ fontSize: "13px" }}
                    disabled={isSubmitting}
                    onClick={onCancel}
                >
                    Quay lại
                </button>
                <button
                    type="button"
                    className="btn rounded-pill px-4 fw-bold text-white shadow-xs"
                    style={{
                        backgroundColor: "var(--color-primary, #e11d48)",
                        borderColor: "var(--color-primary, #e11d48)",
                        fontSize: "13px",
                    }}
                    disabled={isSubmitting}
                    onClick={onConfirm}
                >
                    {isSubmitting ? "Đang tạo đơn…" : "Xác nhận đặt đơn"}
                </button>
            </Modal.Footer>
        </Modal>
    );
}
