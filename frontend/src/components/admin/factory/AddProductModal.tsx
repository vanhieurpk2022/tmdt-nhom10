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
import { FactoryServiceManager } from "../../../api/factory/FactoryService";
import type {
    FactoryProductCreateRequest,
    FactoryProductEditRes,
    FactoryProductItem,
} from "../../../dto/factory/FactoryProductRes";
import type { Category } from "../../../models/Category";
import { CategoryService } from "../../../api/category/CategoryDto";
import { cloudinaryService } from "../../../api/UploadApi";
import { useToastContext } from "../../toasts/ToastContext";

interface AddProductModalProps {
    show: boolean;
    onSuccess?: () => void;
    product: FactoryProductCreateRequest | FactoryProductEditRes | null;
    availableProducts?: FactoryProductItem[];
    onHide: () => void;
}

const INITIAL_FORM: FactoryProductCreateRequest = {
    id: null,
    name: "",
    category: "",
    type: ProductType.NORMAL,
    description: "",
    imageUrls: [],
};

type FormErrors = Partial<Record<keyof FactoryProductCreateRequest, string>>;

/* ---------- Thẻ ảnh dùng chung (ảnh cũ và ảnh mới) ---------- */
function ImageCard({
    src,
    name,
    size,
    badge,
    onRemove,
}: {
    src: string;
    name: string;
    size?: string;
    badge?: string;
    onRemove: () => void;
}) {
    return (
        <div className="position-relative border rounded-3 overflow-hidden bg-white">
            <img src={src} alt={name} className="w-100" style={{ height: 120, objectFit: "cover" }} />

            {badge && (
                <span className="badge bg-dark-subtle text-dark-emphasis position-absolute bottom-0 start-0 m-1">
                    {badge}
                </span>
            )}

            <button
                type="button"
                className="btn btn-sm btn-dark position-absolute top-0 end-0 m-1 rounded-circle"
                style={{ width: 28, height: 28, padding: 0 }}
                onClick={onRemove}
                aria-label="Xóa ảnh"
            >
                ×
            </button>

            {(name || size) && (
                <div className="p-2">
                    <div className="small text-truncate" title={name}>{name}</div>
                    {size && <div className="text-secondary small">{size}</div>}
                </div>
            )}
        </div>
    );
}

/* ---------- Ảnh mới: tạo / hủy object URL đúng lúc ---------- */
function NewImagePreview({ file, onRemove }: { file: File; onRemove: () => void }) {
    const url = useMemo(() => URL.createObjectURL(file), [file]);
    useEffect(() => () => URL.revokeObjectURL(url), [url]);

    return (
        <ImageCard
            src={url}
            name={file.name}
            size={`${(file.size / 1024 / 1024).toFixed(2)} MB`}
            onRemove={onRemove}
        />
    );
}

export default function AddProductModal({
    show,
    onSuccess,
    product,
    availableProducts = [],
    onHide,
}: AddProductModalProps) {
    const [categoryOption, setCategoryOption] = useState<Category[]>([]);
    const [form, setForm] = useState<FactoryProductCreateRequest>(INITIAL_FORM);
    const [errors, setErrors] = useState<FormErrors>({});
    const [submitting, setSubmitting] = useState(false);
    const { showToast } = useToastContext();

    const [images, setImages] = useState<File[]>([]);
    const [isDragging, setIsDragging] = useState(false);

    const isEdit = !!product;

    // Tải danh mục khi mở modal
    useEffect(() => {
        if (!show) return;
        const getCategory = async () => {
            try {
                const res = await CategoryService.getCategory();
                setCategoryOption(res._embedded.categories);
            } catch (error) {
                console.log("Lỗi không tải được danh mục", error);
            }
        };
        getCategory();
    }, [show]);

    // Nạp dữ liệu vào form mỗi khi mở modal
    useEffect(() => {
        if (!show) return;
        setErrors({});
        setImages([]);
        setIsDragging(false);

        if (product) {
            setForm({
                id: product.id,
                name: product.name,
                category: product.category ?? "",
                type: product.type ?? ProductType.NORMAL,
                description: product.description ?? "",
                imageUrls: ("imageUrls" in product && Array.isArray((product as any).imageUrls)) ? (product as any).imageUrls : [],
            });
        } else {
            setForm(INITIAL_FORM);
        }
    }, [show, product]);

    const handleChange = <K extends keyof FactoryProductCreateRequest>(
        key: K,
        value: FactoryProductCreateRequest[K]
    ) => {
        setForm(prev => ({ ...prev, [key]: value }));
        setErrors(prev => ({ ...prev, [key]: undefined }));
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

            // Chỉ upload ảnh nếu không phải là sản phẩm CUSTOM
            let imageUrls: string[] = [];
            if (form.type !== ProductType.CUSTOM) {
                const uploaded = await Promise.all(images.map((file) => cloudinaryService.upload(file)));
                imageUrls = [...form.imageUrls, ...uploaded.map((res) => res.url)];
            }

            const { category, ...rest } = form;
            const selected = categoryOption.find((c) => c.name === category);
            if (!selected) {
                setErrors((prev) => ({ ...prev, category: "Danh mục không hợp lệ" }));
                return;
            }

            const payload = {
                ...rest,
                description: form.description || "",
                categoryId: selected.id,
                imageUrls,
            };

            if (isEdit && form.id != null) {
                await FactoryServiceManager.updateProduct(form.id, payload);
                showToast("Thành công", "Cập nhật sản phẩm thành công", "success");
            } else {
                await FactoryServiceManager.createProduct(payload);
                showToast("Thành công", "Thêm sản phẩm thành công", "success");
            }

            onSuccess?.();
            onHide();
        } catch (error) {
            console.log(isEdit ? "Lỗi không cập nhật được sản phẩm" : "Lỗi không thêm được sản phẩm", error);
            showToast("Lỗi", "Không thể lưu sản phẩm. Vui lòng thử lại.", "danger");
        } finally {
            setSubmitting(false);
        }
    };

    /* ---------- Kéo thả ảnh ---------- */
    const addImages = (files: File[]) => {
        const imageFiles = files.filter((file) => file.type.startsWith("image/"));
        setImages((prev) => [...prev, ...imageFiles]);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) addImages(Array.from(e.target.files));
        e.target.value = "";
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

    const removeNewImage = (index: number) => {
        setImages((prev) => prev.filter((_, i) => i !== index));
    };

    const removeExistingImage = (index: number) => {
        setForm((prev) => ({ ...prev, imageUrls: prev.imageUrls.filter((_, i) => i !== index) }));
    };

    const hasAnyImage = form.imageUrls.length > 0 || images.length > 0;

    return (
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
                            {isEdit ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm"}
                        </Modal.Title>
                        <div className="small text-secondary">
                            {isEdit
                                ? `Cập nhật thông tin sản phẩm #${form.id}.`
                                : "Nhập thông tin để đăng sản phẩm mới lên gian hàng."}
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
                                onChange={(e) => handleChange("name", e.target.value)}
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
                                onChange={(e) => handleChange("category", e.target.value)}
                            >
                                <option value="">-- Chọn danh mục --</option>
                                {categoryOption.map((item) => (
                                    <option key={item.id} value={item.name}>
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
                            value={form.type ?? ProductType.NORMAL}
                            onChange={(e) => handleChange("type", e.target.value as ProductType)}
                        >
                            <option value={ProductType.NORMAL}>Thường (Sản phẩm đơn / bán lẻ)</option>
                            <option value={ProductType.CUSTOM}>Tùy chỉnh (Phối từ các sản phẩm có sẵn)</option>
                        </select>
                    </div>

                    {/* Thông báo gợi ý cho sản phẩm tùy chỉnh (CUSTOM) */}
                    {form.type === ProductType.CUSTOM && (
                        <div className="col-12">
                            <div className="alert alert-info border-0 rounded-3 d-flex align-items-start gap-3 py-3 mb-0">
                                <span className="fs-4 lh-1">💡</span>
                                <div className="small">
                                    <div className="fw-bold mb-1">Quy trình tạo sản phẩm Tùy chỉnh (Custom):</div>
                                    <div className="text-secondary">
                                        Sản phẩm Tùy chỉnh không cần tải ảnh và chọn thành phần ở bước này. Bạn chỉ cần điền <b>Tên sản phẩm</b>, <b>Danh mục</b>, <b>Loại sản phẩm</b> và <b>Mô tả</b>.
                                        Sau khi bấm Lưu, hãy vào danh sách sản phẩm và nhấn nút <b>Xem chi tiết (icon mắt)</b> để chọn các sản phẩm có sẵn của xưởng phối vào công thức.
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Hình ảnh sản phẩm (chỉ áp dụng cho sản phẩm NORMAL, sản phẩm CUSTOM không thêm ảnh) */}
                    {form.type !== ProductType.CUSTOM && (
                        <div className="col-12">
                            <label className="form-label fw-semibold">Hình ảnh sản phẩm</label>

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
                                        className={`d-inline-flex align-items-center justify-content-center rounded-circle ${isDragging ? "bg-danger text-white" : "bg-danger-subtle text-danger"}`}
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

                            {/* Ảnh hiện có + ảnh mới */}
                            {hasAnyImage && (
                                <div className="row g-3 mt-2">
                                    {form.imageUrls.map((url, index) => (
                                        <div key={`old-${url}-${index}`} className="col-6 col-sm-4 col-md-3 col-lg-2">
                                            <ImageCard
                                                src={url}
                                                name=""
                                                badge="Hiện có"
                                                onRemove={() => removeExistingImage(index)}
                                            />
                                        </div>
                                    ))}
                                    {images.map((file, index) => (
                                        <div
                                            key={`new-${file.name}-${file.lastModified}-${index}`}
                                            className="col-6 col-sm-4 col-md-3 col-lg-2"
                                        >
                                            <NewImagePreview file={file} onRemove={() => removeNewImage(index)} />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Mô tả */}
                    <div className="col-12">
                        <label className="form-label fw-semibold">Mô tả sản phẩm</label>
                        <textarea
                            className="form-control"
                            rows={3}
                            placeholder="Mô tả ngắn về sản phẩm, hướng dẫn sử dụng, lưu ý..."
                            value={form.description}
                            onChange={(e) => handleChange("description", e.target.value)}
                        />
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
                            {isEdit ? "Cập nhật" : "Lưu sản phẩm"}
                        </>
                    )}
                </button>
            </Modal.Footer>
        </Modal>
    );
}