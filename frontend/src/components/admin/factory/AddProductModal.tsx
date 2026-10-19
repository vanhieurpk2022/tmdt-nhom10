import { useEffect, useMemo, useState } from "react";
import { Modal } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faBoxOpen,
    faTag,
    faFloppyDisk,
    faCloudArrowUp,
} from "@fortawesome/free-solid-svg-icons";

import { ProductType } from "../../../enums/ProductType";
import { ProductStatus } from "../../../enums/ProductStatus";
import { FactoryServiceManager } from "../../../api/factory/FactoryService";
import type { FactoryProductCreateRequest } from "../../../dto/factory/FactoryProductRes";
import type { Category } from "../../../models/Category";
import { CategoryService } from "../../../api/category/CategoryDto";
import { cloudinaryService } from "../../../api/UploadApi";

interface AddProductModalProps {
    show: boolean;
    onClose: () => void;
    onSuccess?: () => void; // gọi lại để cha tải lại danh sách sau khi lưu
}

const INITIAL_FORM: FactoryProductCreateRequest = {
    name: "",
    category: "",
    type: ProductType.NORMAL,
    status: ProductStatus.ACTIVE,
    description: "",
    imageUrls: [],
};

type FormErrors = Partial<Record<keyof FactoryProductCreateRequest, string>>;

/* ---------- Ảnh xem trước: tạo / hủy object URL đúng lúc ---------- */
function ImagePreview({ file, onRemove }: { file: File; onRemove: () => void }) {
    const url = useMemo(() => URL.createObjectURL(file), [file]);

    // Hủy URL khi file đổi hoặc component bị gỡ, tránh rò bộ nhớ
    useEffect(() => () => URL.revokeObjectURL(url), [url]);

    return (
        <div className="position-relative border rounded-3 overflow-hidden bg-white">
            <img
                src={url}
                alt={file.name}
                className="w-100"
                style={{ height: 120, objectFit: "cover" }}
            />

            <button
                type="button"
                className="btn btn-sm btn-dark position-absolute top-0 end-0 m-1 rounded-circle"
                style={{ width: 28, height: 28, padding: 0 }}
                onClick={onRemove}
                aria-label="Xóa ảnh"
            >
                ×
            </button>

            <div className="p-2">
                <div className="small text-truncate" title={file.name}>
                    {file.name}
                </div>
                <div className="text-secondary small">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                </div>
            </div>
        </div>
    );
}

export default function AddProductModal({ show, onClose, onSuccess }: AddProductModalProps) {
    const [categoryOption, setCategoryOption] = useState<Category[]>([]);
    const [form, setForm] = useState<FactoryProductCreateRequest>(INITIAL_FORM);
    const [errors, setErrors] = useState<FormErrors>({});
    const [submitting, setSubmitting] = useState(false);

    const [images, setImages] = useState<File[]>([]);
    const [isDragging, setIsDragging] = useState(false);

    // Tải danh mục một lần
    useEffect(() => {
        const getCategory = async () => {
            try {
                const res = await CategoryService.getCategory();
                setCategoryOption(res._embedded.categories);
            } catch (error) {
                console.log("Lỗi không tải được danh mục", error);
            }
        };
        getCategory();
    }, []);

    const handleChange = <K extends keyof FactoryProductCreateRequest>(
        key: K,
        value: FactoryProductCreateRequest[K]
    ) => {
        setForm(prev => ({ ...prev, [key]: value }));
        setErrors(prev => ({ ...prev, [key]: undefined }));
    };

    const resetForm = () => {
        setForm(INITIAL_FORM);
        setErrors({});
        setImages([]);
        setIsDragging(false);
    };

    const handleClose = () => {
        if (submitting) return;
        resetForm();
        onClose();
    };

    const validate = (): boolean => {
        const next: FormErrors = {};
        if (!form.name.trim()) next.name = "Vui lòng nhập tên sản phẩm";
        if (!form.category) next.category = "Vui lòng chọn danh mục";
        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;

        try {
            setSubmitting(true);

            const uploaded = await Promise.all(images.map(file => cloudinaryService.upload(file)));
            const imageUrls = uploaded.map(res => res.url);
            const { category, ...rest } = form;
            const payload = {
                ...rest,
                categoryId: Number(category),
                imageUrls,
            };
            // TODO: images chưa được gửi. Muốn gửi ảnh, createProduct cần nhận FormData
            // (phần JSON + các file trong `images`) và backend dùng @RequestPart.
            await FactoryServiceManager.createProduct(payload);

            onSuccess?.();
            resetForm();
            onClose();
        } catch (error) {
            console.log("Lỗi không thêm được sản phẩm", error);
        } finally {
            setSubmitting(false);
        }
    };

    /* ---------- Ảnh ---------- */
    const addImages = (files: File[]) => {
        const imageFiles = files.filter(file => file.type.startsWith("image/"));
        setImages(prev => [...prev, ...imageFiles]);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) addImages(Array.from(e.target.files));
        e.target.value = ""; // cho phép chọn lại đúng file vừa chọn
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        addImages(Array.from(e.dataTransfer.files));
    };

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    return (
        <Modal
            show={show}
            onHide={handleClose}
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
                            Thêm sản phẩm
                        </Modal.Title>
                        <div className="small text-secondary">
                            Nhập thông tin để đăng sản phẩm mới lên gian hàng.
                        </div>
                    </div>
                </div>
            </Modal.Header>

            <Modal.Body className="p-4">
                <div className="row g-3">
                    {/* Tên sản phẩm */}
                    <div className="col-12">
                        <label className="form-label fw-semibold">
                            Tên sản phẩm <span className="text-danger">*</span>
                        </label>
                        <div className="input-group has-validation">
                            <span className="input-group-text bg-white">
                                <FontAwesomeIcon icon={faBoxOpen} className="text-secondary" />
                            </span>
                            <input
                                type="text"
                                className={`form-control ${errors.name ? "is-invalid" : ""}`}
                                placeholder="VD: Mộc Gỗ Đàn Hương"
                                value={form.name}
                                onChange={e => handleChange("name", e.target.value)}
                            />
                            {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                        </div>
                    </div>

                    {/* Danh mục */}
                    <div className="col-12 col-md-6">
                        <label className="form-label fw-semibold">
                            Danh mục <span className="text-danger">*</span>
                        </label>
                        <div className="input-group has-validation">
                            <span className="input-group-text bg-white">
                                <FontAwesomeIcon icon={faTag} className="text-secondary" />
                            </span>
                            <select
                                className={`form-select ${errors.category ? "is-invalid" : ""}`}
                                value={form.category}
                                onChange={e => handleChange("category", e.target.value)}
                            >
                                <option value="">-- Chọn danh mục --</option>
                                {categoryOption.map(item => (
                                    <option key={item.id} value={item.id}>
                                        {item.name}
                                    </option>
                                ))}
                            </select>
                            {errors.category && <div className="invalid-feedback">{errors.category}</div>}
                        </div>
                    </div>

                    {/* Loại sản phẩm */}
                    <div className="col-12 col-md-6">
                        <label className="form-label fw-semibold">Loại sản phẩm</label>
                        <select
                            className="form-select"
                            value={form.type}
                            onChange={e => handleChange("type", e.target.value as ProductType)}
                        >
                            <option value={ProductType.NORMAL}>Thường</option>
                            <option value={ProductType.CUSTOM}>Tùy chỉnh</option>
                        </select>
                    </div>

                    {/* Trạng thái */}
                    <div className="col-12">
                        <label className="form-label fw-semibold">Trạng thái</label>
                        <select
                            className="form-select"
                            value={form.status}
                            onChange={e => handleChange("status", e.target.value as ProductStatus)}
                        >
                            <option value={ProductStatus.ACTIVE}>Đang bán</option>
                            <option value={ProductStatus.INACTIVE}>Ngừng bán</option>
                        </select>
                    </div>

                    {/* Hình ảnh sản phẩm */}
                    <div className="col-12">
                        <label className="form-label fw-semibold">Hình ảnh sản phẩm</label>

                        {/* Drop zone */}
                        <div
                            className={`rounded-3 p-4 text-center ${isDragging ? "border-danger bg-danger-subtle" : "bg-light"}`}
                            style={{
                                border: "2px dashed",
                                borderColor: isDragging ? undefined : "#dee2e6",
                                cursor: "pointer",
                                transition: "all 0.2s ease",
                            }}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={() => document.getElementById("product-images")?.click()}
                        >
                            <input
                                id="product-images"
                                type="file"
                                accept="image/*"
                                multiple
                                className="d-none"
                                onChange={handleFileChange}
                            />

                            <div className="mb-3">
                                <span
                                    className={`d-inline-flex align-items-center justify-content-center rounded-circle ${isDragging ? "bg-danger text-white" : "bg-danger-subtle text-danger"
                                        }`}
                                    style={{ width: 56, height: 56 }}
                                >
                                    <FontAwesomeIcon icon={faCloudArrowUp} size="lg" />
                                </span>
                            </div>

                            <div className="fw-semibold mb-1">
                                {isDragging ? "Thả ảnh vào đây" : "Kéo và thả ảnh vào đây"}
                            </div>

                            <div className="text-secondary small mb-2">
                                hoặc <span className="text-danger fw-semibold">chọn ảnh từ máy</span>
                            </div>

                            <div className="text-secondary small">
                                Có thể chọn nhiều ảnh cùng lúc · PNG, JPG, JPEG, WEBP
                            </div>
                        </div>

                        {/* Preview ảnh */}
                        {images.length > 0 && (
                            <div className="row g-3 mt-2">
                                {images.map((file, index) => (
                                    <div
                                        key={`${file.name}-${file.lastModified}-${index}`}
                                        className="col-6 col-sm-4 col-md-3 col-lg-2"
                                    >
                                        <ImagePreview file={file} onRemove={() => removeImage(index)} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Mô tả */}
                    <div className="col-12">
                        <label className="form-label fw-semibold">Mô tả</label>
                        <textarea
                            className="form-control"
                            rows={3}
                            placeholder="Mô tả ngắn về hương, dung tích, thành phần..."
                            value={form.description}
                            onChange={e => handleChange("description", e.target.value)}
                        />
                    </div>
                </div>
            </Modal.Body>

            <Modal.Footer className="px-4 py-3 bg-light">
                <button
                    type="button"
                    className="btn btn-light border fw-semibold"
                    onClick={handleClose}
                    disabled={submitting}
                >
                    Hủy
                </button>
                <button
                    type="button"
                    className="btn btn-danger fw-semibold"
                    onClick={handleSubmit}
                    disabled={submitting}
                >
                    {submitting ? (
                        <>
                            <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />
                            Đang lưu...
                        </>
                    ) : (
                        <>
                            <FontAwesomeIcon icon={faFloppyDisk} className="me-2" />
                            Lưu sản phẩm
                        </>
                    )}
                </button>
            </Modal.Footer>
        </Modal>
    );
}