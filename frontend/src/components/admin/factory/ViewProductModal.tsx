import { Modal } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faEye,
    faPenToSquare,
    faBoxOpen,
    faBoxesStacked,
    faCartShopping,
} from "@fortawesome/free-solid-svg-icons";
import type { FactoryProductItem } from "../../../dto/factory/FactoryProductRes";
import { formatVnd } from "../../../components/format/FormatMoney";
import { ProductStatusBadge } from "../../../pages/FactoryProduct";

interface ViewProductModalProps {
    show: boolean;
    onHide: () => void;
    product: FactoryProductItem | null;
    onEdit?: (product: FactoryProductItem) => void;
}

export default function ViewProductModal({
    show,
    onHide,
    product,
    onEdit,
}: ViewProductModalProps) {
    if (!product) return null;

    const statusConfig = product.status
        ? ProductStatusBadge[product.status] || { label: product.status, badge: "bg-secondary-subtle text-secondary" }
        : { label: "Đang bán", badge: "bg-success-subtle text-success-emphasis" };

    return (
        <Modal show={show} onHide={onHide} size="lg" centered>
            <Modal.Header closeButton className="border-bottom-0 pb-0">
                <div className="d-flex align-items-center gap-3">
                    <div
                        className="d-flex align-items-center justify-content-center bg-primary-subtle text-primary rounded-3 p-3"
                        style={{ width: 46, height: 46 }}
                    >
                        <FontAwesomeIcon icon={faEye} size="lg" />
                    </div>
                    <div>
                        <div className="d-flex align-items-center gap-2">
                            <Modal.Title as="h5" className="fw-bold mb-0">
                                Chi tiết sản phẩm #{product.id}
                            </Modal.Title>
                            <span className={`badge rounded-pill small ${statusConfig.badge}`}>
                                {statusConfig.label}
                            </span>
                        </div>
                        <small className="text-muted">Thông tin tổng quan của sản phẩm trong xưởng</small>
                    </div>
                </div>
            </Modal.Header>

            <Modal.Body className="py-3 px-4">
                <div className="row g-4">
                    {/* Ảnh sản phẩm nếu có */}
                    {product.imageUrl && (
                        <div className="col-12 text-center mb-2">
                            <img
                                src={product.imageUrl}
                                alt={product.name}
                                className="img-fluid rounded-3 border shadow-sm"
                                style={{ maxHeight: 220, objectFit: "cover" }}
                                onError={(e) => {
                                    (e.currentTarget as HTMLImageElement).src =
                                        "https://placehold.co/400x250?text=Sản+Phẩm";
                                }}
                            />
                        </div>
                    )}

                    <div className="col-12 col-md-7">
                        <div className="p-3 bg-light rounded-3 h-100">
                            <h6 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                                <FontAwesomeIcon icon={faBoxOpen} className="text-danger" />
                                {product.name}
                            </h6>

                            <div className="d-flex flex-column gap-2 small">
                                <div className="d-flex justify-content-between border-bottom pb-2">
                                    <span className="text-secondary">Mã sản phẩm:</span>
                                    <span className="fw-semibold">#{product.id}</span>
                                </div>

                                <div className="d-flex justify-content-between border-bottom pb-2">
                                    <span className="text-secondary">Danh mục:</span>
                                    <span className="badge bg-primary text-white">{product.category || "Khác"}</span>
                                </div>

                                <div className="d-flex justify-content-between border-bottom pb-2">
                                    <span className="text-secondary">Loại sản phẩm:</span>
                                    <span className="fw-semibold">{product.type || "Thường (Bán sẵn)"}</span>
                                </div>

                                <div className="d-flex justify-content-between border-bottom pb-2">
                                    <span className="text-secondary">Ngày đăng:</span>
                                    <span className="fw-semibold">
                                        {product.createdAt
                                            ? new Date(product.createdAt).toLocaleDateString("vi-VN")
                                            : "-"}
                                    </span>
                                </div>

                                <div className="d-flex justify-content-between">
                                    <span className="text-secondary">Trạng thái:</span>
                                    <span className={`badge ${statusConfig.badge}`}>{statusConfig.label}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-12 col-md-5">
                        <div className="d-flex flex-column gap-3 h-100">
                            <div className="p-3 bg-success-subtle rounded-3 text-success-emphasis">
                                <small className="text-uppercase fw-semibold d-block mb-1">Giá bán hiện tại</small>
                                <h4 className="fw-bold mb-0">
                                    {product.price ? formatVnd(product.price) : "Liên hệ"}
                                </h4>
                            </div>

                            <div className="p-3 bg-light rounded-3 d-flex justify-content-between align-items-center">
                                <div>
                                    <small className="text-muted d-block">Tồn kho</small>
                                    <h5 className="fw-bold mb-0 text-dark">{product.stock ?? 0} chiếc</h5>
                                </div>
                                <div
                                    className="d-flex align-items-center justify-content-center bg-white rounded-circle shadow-sm"
                                    style={{ width: 40, height: 40 }}
                                >
                                    <FontAwesomeIcon icon={faBoxesStacked} className="text-primary" />
                                </div>
                            </div>

                            <div className="p-3 bg-light rounded-3 d-flex justify-content-between align-items-center">
                                <div>
                                    <small className="text-muted d-block">Đã bán</small>
                                    <h5 className="fw-bold mb-0 text-dark">{product.sold ?? 0} chiếc</h5>
                                </div>
                                <div
                                    className="d-flex align-items-center justify-content-center bg-white rounded-circle shadow-sm"
                                    style={{ width: 40, height: 40 }}
                                >
                                    <FontAwesomeIcon icon={faCartShopping} className="text-success" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {product.description && (
                        <div className="col-12">
                            <div className="p-3 bg-light rounded-3">
                                <h6 className="fw-semibold mb-2">Mô tả chi tiết</h6>
                                <p className="text-secondary small mb-0" style={{ whiteSpace: "pre-line" }}>
                                    {product.description}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </Modal.Body>

            <Modal.Footer className="border-top-0 pt-0 px-4 pb-3">
                <button
                    type="button"
                    id="btn-close-view-product"
                    className="btn btn-light border px-4"
                    onClick={onHide}
                >
                    Đóng
                </button>
                {onEdit && (
                    <button
                        type="button"
                        id="btn-edit-from-view-product"
                        className="btn btn-warning px-4 fw-semibold"
                        onClick={() => {
                            onHide();
                            onEdit(product);
                        }}
                    >
                        <FontAwesomeIcon icon={faPenToSquare} className="me-2" />
                        Chỉnh sửa
                    </button>
                )}
            </Modal.Footer>
        </Modal>
    );
}
