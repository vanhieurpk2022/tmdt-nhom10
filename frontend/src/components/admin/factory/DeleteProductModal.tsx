import { useState } from "react";
import { Modal } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";
import type { FactoryProductItem } from "../../../dto/factory/FactoryProductRes";

interface DeleteProductModalProps {
    show: boolean;
    onHide: () => void;
    product: FactoryProductItem | null;
    onConfirm: (product: FactoryProductItem) => Promise<void> | void;
}

export default function DeleteProductModal({
    show,
    onHide,
    product,
    onConfirm,
}: DeleteProductModalProps) {
    const [loading, setLoading] = useState(false);

    if (!product) return null;

    const handleConfirm = async () => {
        try {
            setLoading(true);
            await onConfirm(product);
            onHide();
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            show={show}
            onHide={onHide}
            centered
            backdrop="static"
            keyboard={!loading}
        >
            <Modal.Header closeButton={!loading} className="border-bottom-0 pb-0">
                <div className="d-flex align-items-center gap-3">
                    <div
                        className="d-flex align-items-center justify-content-center bg-danger-subtle text-danger rounded-circle p-3"
                        style={{ width: 48, height: 48 }}
                    >
                        <FontAwesomeIcon icon={faTrash} size="lg" />
                    </div>
                    <div>
                        <Modal.Title as="h5" className="fw-bold mb-0 text-danger">
                            Xóa sản phẩm
                        </Modal.Title>
                        <small className="text-muted">Hành động này không thể hoàn tác</small>
                    </div>
                </div>
            </Modal.Header>

            <Modal.Body className="py-3 px-4">
                <div className="alert alert-warning d-flex align-items-start gap-2 py-2 px-3 mb-3 small">
                    <FontAwesomeIcon icon={faTriangleExclamation} className="mt-1" />
                    <span>
                        Bạn có chắc chắn muốn xóa sản phẩm này khỏi hệ thống gian hàng không?
                    </span>
                </div>

                <div className="p-3 bg-light rounded-3">
                    <div className="small text-muted mb-1">Mã sản phẩm: #{product.id}</div>
                    <div className="fw-bold text-dark fs-6">{product.name}</div>
                    <div className="small text-secondary mt-1">
                        Danh mục: <span className="badge bg-secondary-subtle text-dark">{product.category}</span> | Tồn kho: {product.stock ?? 0}
                    </div>
                </div>
            </Modal.Body>

            <Modal.Footer className="border-top-0 pt-0 px-4 pb-3">
                <button
                    type="button"
                    id="btn-cancel-delete-modal"
                    className="btn btn-light border px-4"
                    onClick={onHide}
                    disabled={loading}
                >
                    Hủy bỏ
                </button>
                <button
                    type="button"
                    id="btn-confirm-delete-modal"
                    className="btn btn-danger px-4 fw-semibold"
                    onClick={handleConfirm}
                    disabled={loading}
                >
                    {loading ? (
                        <span className="spinner-border spinner-border-sm me-2" role="status" />
                    ) : (
                        <FontAwesomeIcon icon={faTrash} className="me-2" />
                    )}
                    Xác nhận xóa
                </button>
            </Modal.Footer>
        </Modal>
    );
}
