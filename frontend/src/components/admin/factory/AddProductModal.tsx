import {
    useState,
    useEffect,
    useRef,
    type FormEvent,
    type DragEvent,
    type ChangeEvent,
} from "react";
import { Modal } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faCirclePlus,
    faPenToSquare,
    faBoxOpen,
    faImage,
    faTag,
    faCoins,
    faBoxesStacked,
    faCheck,
    faTimes,
} from "@fortawesome/free-solid-svg-icons";
import type { FactoryProductItem } from "../../../dto/factory/FactoryProductRes";
import { ProductType } from "../../../enums/ProductType";
import { CategoryService } from "../../../api/category/CategoryDto";
import { ProductStatus } from "../../../enums/ProductStatus";
import { cloudinaryService } from "../../../api/UploadApi";

interface AddProductModalProps {
    show: boolean;
    onHide: () => void;
    onSubmit: (productData: Partial<FactoryProductItem>) => Promise<boolean | void> | boolean | void;
    initialData?: FactoryProductItem | null;
    isEdit?: boolean;
}

interface ImageItem {
    id: string;
    preview: string; // blob URL (ảnh mới) hoặc link cloudinary (ảnh cũ)
    file?: File; // có file = chưa upload
}

const MAX_IMAGES = 10;
const MAX_SIZE = 5 * 1024 * 1024; // 5MB / ảnh

export default function AddProductModal({
    show,
    onHide,
    onSubmit,
    initialData,
    isEdit = false,
}: AddProductModalProps) {
    const [name, setName] = useState("");
    const [categories, setCategories] = useState<string[]>([]);
    const [category, setCategory] = useState("");
    const [type, setType] = useState<ProductType>(ProductType.NORMAL);
    const [price, setPrice] = useState<number | "">(0);
    const [stock, setStock] = useState<number | "">(100);
    const [status, setStatus] = useState<ProductStatus>("ACTIVE");
    const [images, setImages] = useState<ImageItem[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const fileInputRef = useRef<HTMLInputElement>(null);
    const imagesRef = useRef<ImageItem[]>([]);
    imagesRef.current = images;

    // Lấy danh mục từ API mỗi khi mở modal
    useEffect(() => {
        if (!show) return;

        const getCategory = async () => {
            try {
                const res = await CategoryService.getCategory();
                const names = (res._embedded?.categories ?? [])
                    .map((c) => c.name)
                    .filter((n): n is string => !!n);

                setCategories(names);
                setCategory((prev) => prev || names[0] || "");
            } catch (error) {
                console.error("Failed to load categories", error);
            }
        };

        getCategory();
    }, [show]);

    // Nạp dữ liệu khi mở modal (edit) hoặc reset form (thêm mới)
    useEffect(() => {
        if (!show) return;

        setErrorMsg("");

        if (isEdit && initialData) {
            // TODO: đổi tên field cho đúng với FactoryProductItem của bạn
            const d = initialData as any;
            setName(d.name ?? "");
            setCategory(d.category ?? d.categoryName ?? "");
            setType(d.type ?? ProductType.NORMAL);
            setPrice(d.price ?? 0);
            setStock(d.stock ?? 0);
            setStatus(d.status ?? "ACTIVE");
            setDescription(d.description ?? "");

            const urls: string[] = Array.isArray(d.images)
                ? d.images
                : d.image
                    ? [d.image]
                    : [];
            setImages(urls.map((u) => ({ id: crypto.randomUUID(), preview: u })));
        } else {
            setName("");
            setType(ProductType.NORMAL);
            setPrice(0);
            setStock(100);
            setStatus("ACTIVE");
            setDescription("");
            setImages([]);
        }
    }, [show, isEdit, initialData]);

    // Giải phóng blob URL khi unmount
    useEffect(() => {
        return () => {
            imagesRef.current.forEach((i) => {
                if (i.file) URL.revokeObjectURL(i.preview);
            });
        };
    }, []);

    const addFiles = (fileList: FileList | File[]) => {
        const all = Array.from(fileList).filter((f) => f.type.startsWith("image/"));
        const valid = all.filter((f) => f.size <= MAX_SIZE);

        if (valid.length < all.length) {
            setErrorMsg("Một số ảnh vượt quá 5MB nên đã bị bỏ qua.");
        } else {
            setErrorMsg("");
        }

        setImages((prev) => {
            const slots = Math.max(MAX_IMAGES - prev.length, 0);
            if (valid.length > slots) {
                setErrorMsg(`Chỉ được tối đa ${MAX_IMAGES} ảnh.`);
            }
            const added = valid.slice(0, slots).map((file) => ({
                id: crypto.randomUUID(),
                preview: URL.createObjectURL(file),
                file,
            }));
            return [...prev, ...added];
        });
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        if (loading) return;
        addFiles(e.dataTransfer.files);
    };

    const handleSelect = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) addFiles(e.target.files);
        e.target.value = ""; // cho phép chọn lại cùng một file
    };

    const handleRemoveImage = (id: string) => {
        setImages((prev) => {
            const target = prev.find((i) => i.id === id);
            if (target?.file) URL.revokeObjectURL(target.preview);
            return prev.filter((i) => i.id !== id);
        });
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setErrorMsg("");

        if (!name.trim()) {
            setErrorMsg("Vui lòng nhập tên sản phẩm");
            return;
        }
        if (!category) {
            setErrorMsg("Vui lòng chọn danh mục sản phẩm");
            return;
        }

        setLoading(true);
        try {
            // Upload ảnh mới lên Cloudinary, giữ nguyên ảnh đã có link
            const imageUrls = await Promise.all(
                images.map((img) => (img.file ? cloudinaryService.upload(img.file) : img.preview))
            );

            // TODO: đổi tên field cho khớp FactoryProductItem / API backend
            const payload = {
                name: name.trim(),
                category,
                type,
                price: Number(price) || 0,
                stock: Number(stock) || 0,
                status,
                description: description.trim(),
                images: imageUrls,
                image: imageUrls[0] ?? "",
            } as unknown as Partial<FactoryProductItem>;

            const result = await onSubmit(payload);

            if (result !== false) {
                images.forEach((i) => {
                    if (i.file) URL.revokeObjectURL(i.preview);
                });
                onHide();
            }
        } catch (err) {
            console.error(err);
            setErrorMsg("Không thể upload ảnh hoặc lưu sản phẩm. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            show={show}
            onHide={onHide}
            size="lg"
            centered
            backdrop="static"
            keyboard={!loading}
        >
            <form onSubmit={handleSubmit} id="form-product-manage">
                <Modal.Header closeButton={!loading} className="border-bottom-0 pb-0">
                    <div className="d-flex align-items-center gap-3">
                        <div
                            className={`d-flex align-items-center justify-content-center rounded-3 p-3 ${isEdit ? "bg-warning-subtle text-warning-emphasis" : "bg-danger-subtle text-danger"
                                }`}
                            style={{ width: 46, height: 46 }}
                        >
                            <FontAwesomeIcon icon={isEdit ? faPenToSquare : faCirclePlus} size="lg" />
                        </div>
                        <div>
                            <Modal.Title as="h5" className="fw-bold mb-0">
                                {isEdit ? `Chỉnh sửa sản phẩm #${initialData?.id}` : "Thêm sản phẩm mới"}
                            </Modal.Title>
                            <small className="text-muted">
                                {isEdit
                                    ? "Cập nhật thông tin chi tiết của sản phẩm gian hàng"
                                    : "Nhập thông tin sản phẩm mới để đăng bán trên sàn"}
                            </small>
                        </div>
                    </div>
                </Modal.Header>

                <Modal.Body className="py-3 px-4">
                    {errorMsg && (
                        <div className="alert alert-danger d-flex align-items-center gap-2 py-2 px-3 mb-3 small" role="alert">
                            <FontAwesomeIcon icon={faTimes} />
                            <span>{errorMsg}</span>
                        </div>
                    )}

                    <div className="row g-3">
                        {/* Tên sản phẩm */}
                        <div className="col-12">
                            <label htmlFor="input-product-name" className="form-label fw-semibold small text-secondary">
                                Tên sản phẩm <span className="text-danger">*</span>
                            </label>
                            <div className="input-group">
                                <span className="input-group-text bg-light text-muted">
                                    <FontAwesomeIcon icon={faBoxOpen} />
                                </span>
                                <input
                                    type="text"
                                    id="input-product-name"
                                    className="form-control"
                                    placeholder="VD: Tinh dầu vỏ bưởi tự nhiên 50ml"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        {/* Danh mục */}
                        <div className="col-12 col-md-6">
                            <label htmlFor="input-product-category" className="form-label fw-semibold small text-secondary">
                                Danh mục sản phẩm <span className="text-danger">*</span>
                            </label>
                            <div className="input-group">
                                <span className="input-group-text bg-light text-muted">
                                    <FontAwesomeIcon icon={faTag} />
                                </span>
                                <select
                                    id="input-product-category"
                                    className="form-select"
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    required
                                    disabled={loading}
                                >
                                    {categories.length === 0 && (
                                        <option value="" disabled>
                                            Đang tải danh mục...
                                        </option>
                                    )}
                                    {categories.map((cat) => (
                                        <option key={cat} value={cat}>
                                            {cat}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Loại sản phẩm */}
                        <div className="col-12 col-md-6">
                            <label htmlFor="input-product-type" className="form-label fw-semibold small text-secondary">
                                Loại sản phẩm
                            </label>
                            <select
                                id="input-product-type"
                                className="form-select"
                                value={type}
                                onChange={(e) => setType(e.target.value as ProductType)}
                                disabled={loading}
                            >
                                <option value={ProductType.NORMAL}>Thường (Bán sẵn)</option>
                                <option value={ProductType.CUSTOM}>Tùy chỉnh (Gia công thiết kế)</option>
                            </select>
                        </div>

                        {/* Giá bán */}
                        <div className="col-12 col-md-4">
                            <label htmlFor="input-product-price" className="form-label fw-semibold small text-secondary">
                                Giá bán (VNĐ)
                            </label>
                            <div className="input-group">
                                <span className="input-group-text bg-light text-muted">
                                    <FontAwesomeIcon icon={faCoins} />
                                </span>
                                <input
                                    type="number"
                                    id="input-product-price"
                                    className="form-control"
                                    placeholder="0"
                                    min="0"
                                    step="1000"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value === "" ? "" : Number(e.target.value))}
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        {/* Tồn kho */}
                        <div className="col-12 col-md-4">
                            <label htmlFor="input-product-stock" className="form-label fw-semibold small text-secondary">
                                Tồn kho ban đầu
                            </label>
                            <div className="input-group">
                                <span className="input-group-text bg-light text-muted">
                                    <FontAwesomeIcon icon={faBoxesStacked} />
                                </span>
                                <input
                                    type="number"
                                    id="input-product-stock"
                                    className="form-control"
                                    placeholder="100"
                                    min="0"
                                    value={stock}
                                    onChange={(e) => setStock(e.target.value === "" ? "" : Number(e.target.value))}
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        {/* Trạng thái */}
                        <div className="col-12 col-md-4">
                            <label htmlFor="input-product-status" className="form-label fw-semibold small text-secondary">
                                Trạng thái
                            </label>
                            <select
                                id="input-product-status"
                                className="form-select"
                                value={status}
                                onChange={(e) => setStatus(e.target.value as ProductStatus)}
                                disabled={loading}
                            >
                                <option value="ACTIVE">Đang bán</option>
                                <option value="INACTIVE">Ngừng bán</option>
                            </select>
                        </div>

                        {/* Hình ảnh sản phẩm (kéo thả nhiều ảnh) */}
                        <div className="col-12">
                            <label className="form-label fw-semibold small text-secondary">
                                Hình ảnh sản phẩm ({images.length}/{MAX_IMAGES})
                            </label>

                            <div
                                id="dropzone-product-image"
                                role="button"
                                tabIndex={0}
                                className={`border border-2 rounded-3 p-4 text-center ${isDragging ? "border-danger bg-danger-subtle" : "border-secondary-subtle bg-light"
                                    }`}
                                style={{
                                    borderStyle: "dashed",
                                    cursor: loading ? "not-allowed" : "pointer",
                                }}
                                onClick={() => !loading && fileInputRef.current?.click()}
                                onKeyDown={(e) => {
                                    if ((e.key === "Enter" || e.key === " ") && !loading) {
                                        e.preventDefault();
                                        fileInputRef.current?.click();
                                    }
                                }}
                                onDragOver={(e) => {
                                    e.preventDefault();
                                    if (!loading) setIsDragging(true);
                                }}
                                onDragLeave={() => setIsDragging(false)}
                                onDrop={handleDrop}
                            >
                                <FontAwesomeIcon icon={faImage} size="2x" className="text-muted mb-2" />
                                <div className="small text-muted">
                                    Kéo thả nhiều ảnh vào đây hoặc{" "}
                                    <span className="text-danger fw-semibold">bấm để chọn</span>
                                </div>
                                <div className="small text-muted">Tối đa {MAX_IMAGES} ảnh, mỗi ảnh ≤ 5MB</div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    hidden
                                    onChange={handleSelect}
                                />
                            </div>

                            {images.length > 0 && (
                                <div className="mt-2 d-flex flex-wrap gap-2">
                                    {images.map((img, index) => (
                                        <div key={img.id} className="position-relative" style={{ width: 80 }}>
                                            <img
                                                src={img.preview}
                                                alt={`Ảnh ${index + 1}`}
                                                className={`rounded border object-fit-cover ${index === 0 ? "border-danger border-2" : ""
                                                    }`}
                                                style={{ width: 80, height: 80 }}
                                                onError={(e) => {
                                                    (e.currentTarget as HTMLImageElement).src =
                                                        "https://placehold.co/100x100?text=Loi+Anh";
                                                }}
                                            />
                                            {index === 0 && (
                                                <span className="badge text-bg-danger position-absolute bottom-0 start-0 m-1">
                                                    Đại diện
                                                </span>
                                            )}
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-dark position-absolute top-0 end-0 m-1 p-0 d-flex align-items-center justify-content-center rounded-circle"
                                                style={{ width: 20, height: 20 }}
                                                onClick={() => handleRemoveImage(img.id)}
                                                disabled={loading}
                                                aria-label="Xóa ảnh"
                                            >
                                                <FontAwesomeIcon icon={faTimes} size="xs" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Mô tả sản phẩm */}
                        <div className="col-12">
                            <label htmlFor="input-product-desc" className="form-label fw-semibold small text-secondary">
                                Mô tả sản phẩm
                            </label>
                            <textarea
                                id="input-product-desc"
                                className="form-control"
                                rows={3}
                                placeholder="Mô tả thành phần, xuất xứ, công dụng, lưu ý..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                disabled={loading}
                            />
                        </div>
                    </div>
                </Modal.Body>

                <Modal.Footer className="border-top-0 pt-0 px-4 pb-3">
                    <button
                        type="button"
                        id="btn-cancel-product-modal"
                        className="btn btn-light border px-4"
                        onClick={onHide}
                        disabled={loading}
                    >
                        Hủy bỏ
                    </button>
                    <button
                        type="submit"
                        id="btn-submit-product-modal"
                        className={`btn px-4 fw-semibold ${isEdit ? "btn-warning" : "btn-danger"}`}
                        disabled={loading}
                    >
                        {loading ? (
                            <span className="spinner-border spinner-border-sm me-2" role="status" />
                        ) : (
                            <FontAwesomeIcon icon={faCheck} className="me-2" />
                        )}
                        {loading ? "Đang xử lý..." : isEdit ? "Cập nhật sản phẩm" : "Thêm sản phẩm"}
                    </button>
                </Modal.Footer>
            </form>
        </Modal>
    );
}