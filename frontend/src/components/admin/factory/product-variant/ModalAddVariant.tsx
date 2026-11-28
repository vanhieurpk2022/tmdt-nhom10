import { faBoxesStacked, faBoxOpen, faFlask, faFloppyDisk, faMoneyBillWave, faTag } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import { FactoryServiceManager } from "../../../../api/factory/FactoryService";
import type { EditableVariant, FactoryProductMil } from "../../../../dto/factory/FactoryProductRes";
import { NumericFormat } from "react-number-format";
import { useToastContext } from "../../../toasts/ToastContext";
import axios from "axios";



interface ModalAddVariantProps {
    show: boolean;
    onHide: () => void;
    onSuccess?: () => void;
    productId: number;
    variant: EditableVariant | null;
}

const initialForm: FactoryProductMil = { mil: null, basePrice: null, price: null, stockQuantity: null };

export function ModalAddVariant({ show, onHide, onSuccess, productId, variant }: ModalAddVariantProps) {
    const [form, setForm] = useState<FactoryProductMil>(initialForm);
    const [submitting, setSubmitting] = useState(false);
    const { showToast } = useToastContext();
    const isEdit = !!variant;

    useEffect(() => {

        if (show) {
            setForm(variant ? {
                mil: variant.mil,
                basePrice: variant.basePrice,
                price: variant.price,
                stockQuantity: variant.stockQuantity,
            } : initialForm);
        }
    }, [show, variant])

    const handleAddVariant = async () => {
        if (submitting) return;
        if (form.mil == null || !Number.isInteger(form.mil) || form.mil <= 0
            || form.basePrice == null || !Number.isFinite(form.basePrice) || form.basePrice <= 0
            || form.price == null || !Number.isFinite(form.price) || form.price <= 0
            || form.stockQuantity == null || !Number.isInteger(form.stockQuantity) || form.stockQuantity < 0) {
            showToast("Thông tin chưa hợp lệ", "Nhập dung tích và giá lớn hơn 0, số lượng là số nguyên từ 0 trở lên.", "danger");
            return;
        }
        try {
            setSubmitting(true);
            if (isEdit) {
                await FactoryServiceManager.updateProductMil(variant.id, form);
            } else {
                await FactoryServiceManager.createProductMil(productId, form);
            }
            showToast("Thành công", isEdit ? "Đã cập nhật biến thể" : "Đã thêm biến thể. Kiểm tra thông tin trước khi mở bán.", "success");
            setForm(initialForm);
            onSuccess?.();
            onHide();
        } catch (error) {
            showToast("Không lưu được biến thể", axios.isAxiosError(error)
                ? error.response?.data?.message ?? "Vui lòng thử lại."
                : "Vui lòng thử lại.", "danger");
        } finally {
            setSubmitting(false);
        }
    }

    return (<>

        <Modal
            show={show}
            onHide={onHide}
            size="lg"
            centered
            scrollable
            backdrop="static"
            contentClassName="border-0 shadow rounded-4 overflow-hidden"
        >
            <Modal.Header closeButton className="px-4 py-3 bg-light">
                <div className="d-flex align-items-center gap-3">
                    <span
                        className="d-inline-flex align-items-center justify-content-center rounded-3 bg-danger-subtle text-danger"
                        style={{ width: 42, height: 42 }}
                    >
                        <FontAwesomeIcon icon={faBoxOpen} />
                    </span>
                    <div>
                        <Modal.Title as="h5" className="fw-bold mb-0">
                            {isEdit ? "Chỉnh sửa biến thể" : "Thêm biến thể"}
                        </Modal.Title>
                        <div className="small text-secondary">
                            Thiết lập dung tích, giá và số lượng. Sản phẩm chỉ công khai sau khi mở bán.
                        </div>
                    </div>
                </div>
            </Modal.Header>

            <Modal.Body className="p-4">
                <div className="row g-3">

                    {/* Định lượng Mil */}
                    <div className="col-12">
                        <label className="form-label fw-semibold">
                            Định lượng <span className="text-danger">*</span>
                        </label>
                        <div className="input-group has-validation">
                            <span className="input-group-text bg-white">
                                <FontAwesomeIcon icon={faFlask} className="text-secondary" />
                            </span>
                            <NumericFormat
                                className="form-control"
                                placeholder="VD: 50 mil"
                                suffix=" mil"
                                allowNegative={false}
                                decimalScale={0}
                                value={form.mil ?? ""}
                                onValueChange={(v) =>
                                    setForm((prev) => ({ ...prev, mil: v.floatValue ?? null }))
                                }
                            />
                        </div>
                    </div>

                    {/* Định lượng Mil */}
                    <div className="col-6">
                        <label className="form-label fw-semibold">
                            Giá niêm yết <span className="text-danger">*</span>
                        </label>
                        <div className="input-group has-validation">
                            <span className="input-group-text bg-white">
                                <FontAwesomeIcon icon={faTag} className="text-secondary" />
                            </span>
                            <NumericFormat
                                className="form-control"
                                placeholder="VD: 100.000đ"
                                thousandSeparator="."
                                decimalSeparator=","
                                suffix=" đ"
                                allowNegative={false}
                                decimalScale={0}
                                value={form.basePrice ?? ""}
                                onValueChange={(v) =>
                                    setForm((prev) => ({ ...prev, basePrice: v.floatValue ?? null }))
                                }
                            />
                        </div>
                    </div>
                    {/* Định lượng Mil */}
                    <div className="col-6">
                        <label className="form-label fw-semibold">
                            Giá bán <span className="text-danger">*</span>
                        </label>
                        <div className="input-group has-validation">
                            <span className="input-group-text bg-white">
                                <FontAwesomeIcon icon={faMoneyBillWave} className="text-secondary" />
                            </span>
                            <NumericFormat
                                className="form-control"
                                placeholder="VD: 100.000đ"
                                thousandSeparator="."
                                decimalSeparator=","
                                suffix=" đ"
                                allowNegative={false}
                                decimalScale={0}
                                value={form.price ?? ""}
                                onValueChange={(values) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        price: values.floatValue ?? null,
                                    }))
                                }
                            />
                        </div>
                    </div>
                    {/* Số lượng */}
                    <div className="col-12">
                        <label className="form-label fw-semibold">
                            Số lượng<span className="text-danger">*</span>
                        </label>
                        <div className="input-group has-validation">
                            <span className="input-group-text bg-white">
                                <FontAwesomeIcon icon={faBoxesStacked} className="text-secondary" />
                            </span>
                            <NumericFormat
                                className="form-control"
                                placeholder="VD: 100"
                                allowNegative={false}
                                decimalScale={0}
                                value={form.stockQuantity ?? ""}
                                onValueChange={(v) =>
                                    setForm((prev) => ({ ...prev, stockQuantity: v.floatValue ?? null }))
                                }
                            />
                        </div>
                    </div>
                </div>

            </Modal.Body>

            <Modal.Footer className="px-4 py-3 bg-light">
                <button
                    type="button"
                    className="btn btn-light border fw-semibold"
                    onClick={onHide}
                    disabled={submitting}
                >
                    Hủy
                </button>
                <button
                    type="button"
                    onClick={handleAddVariant}
                    disabled={submitting}
                    className="btn btn-danger fw-semibold"
                >

                    <FontAwesomeIcon icon={faFloppyDisk} className="me-2" />
                    {submitting ? "Đang lưu..." : "Lưu biến thể"}
                </button>
            </Modal.Footer>
        </Modal>
    </>
    )
}
