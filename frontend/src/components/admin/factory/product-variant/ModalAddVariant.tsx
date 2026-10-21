import { faBoxesStacked, faBoxOpen, faCloudArrowUp, faDroplet, faFlask, faFloppyDisk, faMoneyBillWave, faTag } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { FactoryServiceManager } from "../../../../api/factory/FactoryService";
import type { EditableVariant, FactoryProductMil, FactoryProductVariantItem } from "../../../../dto/factory/FactoryProductRes";
import { NumericFormat } from "react-number-format";
import { useToastContext } from "../../../toasts/ToastContext";



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
        if (!form.mil || !form.basePrice || !form.price || !form.stockQuantity) {
            showToast("Lỗi", "Vui lòng nhập đủ form", "danger");
            return;
        }
        if (isEdit) {
            await FactoryServiceManager.updateProductMil(variant?.id, form);
            showToast("Thành công", "Cập nhật thành công", "success");

        } else {
            await FactoryServiceManager.createProductMil(productId, form);
            showToast("Thành công", "Thêm thành công", "success");

        }
        setForm(initialForm);
        onSuccess?.();
        onHide();
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
                            Thêm loại sản phẩm
                        </Modal.Title>
                        <div className="small text-secondary">
                            Nhập thông tin để đăng sản phẩm mới lên gian hàng.
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
                >
                    Hủy
                </button>
                <button
                    type="button"
                    onClick={handleAddVariant}
                    className="btn btn-danger fw-semibold"
                >

                    <FontAwesomeIcon icon={faFloppyDisk} className="me-2" />
                    Lưu sản phẩm
                </button>
            </Modal.Footer>
        </Modal>
    </>
    )
}