import { useState, useEffect, type FormEvent } from "react";
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

interface AddProductModalProps {
    show: boolean;
    onHide: () => void;
    onSubmit: (productData: Partial<FactoryProductItem>) => Promise<boolean | void> | boolean | void;
    initialData?: FactoryProductItem | null;
    isEdit?: boolean;
}

export default function AddProductModal({
    show,
    onHide,
    onSubmit,
    initialData,
    isEdit = false,
}: AddProductModalProps) {
    const [name, setName] = useState("");
    const [DEFAULT_CATEGORIES, setDEFAULT_CATEGORIES] = useState<string[]>([]);
    const [category, setCategory] = useState<string>("");
    const [type, setType] = useState<ProductType>(ProductType.NORMAL);
    const [price, setPrice] = useState<number | "">(0);
    const [stock, setStock] = useState<number | "">(100);
    const [status, setStatus] = useState<"ACTIVE" | "INACTIVE">("ACTIVE");
    const [imageUrl, setImageUrl] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    // Lấy danh mục từ API mỗi khi mở modal
    useEffect(() => {
        if (!show) return;

        const getCategory = async () => {
            try {
                const res = await CategoryService.getCategory();
                const names = (res._embedded?.categories ?? [])
                    .map((c) => c.name)
                    .filter((n): n is string => !!n);

                setDEFAULT_CATEGORIES(names);

                // Chọn sẵn danh mục: ưu tiên danh mục của sản phẩm đang sửa,
                // nếu chưa có thì lấy danh mục đầu tiên
                setCategory((prev) => {
                    if (prev) return prev;
                    if (isEdit && initialData?.category) return initialData.category;
                    return names[0] ?? "";
                });
            } catch (error) {
                console.error("Failed to load categories", error);
            }
        };

        getCategory();
    }, [show, isEdit, initialData]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setErrorMsg("");

        if (!name.trim()) {
            setErrorMsg("Vui lòng nhập tên sản phẩm!");
            return;
        }

        if (!category) {
            setErrorMsg("Vui lòng chọn danh mục sản phẩm!");
            return;
        }

        const numericPrice = Number(price);
        if (numericPrice < 0) {
            setErrorMsg("Giá sản phẩm không được nhỏ hơn 0!");
            return;
        }

        const numericStock = Number(stock);
        if (numericStock < 0) {
            setErrorMsg("Số lượng tồn kho không được âm!");
            return;
        }

        try {
            setLoading(true);
            const productPayload: Partial<FactoryProductItem> = {
                id: initialData?.id,
                name: name.trim(),
                category,
                type,
                price: numericPrice,
                stock: numericStock,
                status,
                imageUrl: imageUrl.trim() || undefined,
                description: description.trim() || undefined,
            };

            await onSubmit(productPayload);
            onHide();
        } catch (err: any) {
            setErrorMsg(err?.message || "Có lỗi xảy ra khi lưu sản phẩm. Vui lòng thử lại!");
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
                                    disabled={loading}
                                >
                                    {DEFAULT_CATEGORIES.length === 0 && (
                                        <option value="" disabled>
                                            Đang tải danh mục...
                                        </option>
                                    )}
                                    {DEFAULT_CATEGORIES.map((cat) => (
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
                                onChange={(e) => setStatus(e.target.value as "ACTIVE" | "INACTIVE")}
                                disabled={loading}
                            >
                                <option value="ACTIVE">Đang bán</option>
                                <option value="INACTIVE">Ngừng bán</option>
                            </select>
                        </div>

                        {/* Link ảnh sản phẩm */}
                        <div className="col-12">
                            <label htmlFor="input-product-image" className="form-label fw-semibold small text-secondary">
                                Đường dẫn hình ảnh (URL)
                            </label>
                            <div className="input-group">
                                <span className="input-group-text bg-light text-muted">
                                    <FontAwesomeIcon icon={faImage} />
                                </span>
                                <input
                                    type="url"
                                    id="input-product-image"
                                    className="form-control"
                                    placeholder="https://images.unsplash.com/photo-..."
                                    value={imageUrl}
                                    onChange={(e) => setImageUrl(e.target.value)}
                                    disabled={loading}
                                />
                            </div>
                            {imageUrl && (
                                <div className="mt-2 d-flex align-items-center gap-2">
                                    <img
                                        src={imageUrl}
                                        alt="Ảnh xem trước"
                                        className="rounded border object-fit-cover"
                                        style={{ width: 64, height: 64 }}
                                        onError={(e) => {
                                            (e.currentTarget as HTMLImageElement).src =
                                                "https://placehold.co/100x100?text=Loi+Anh";
                                        }}
                                    />
                                    <span className="small text-muted">Xem trước ảnh đại diện</span>
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
                        {isEdit ? "Cập nhật sản phẩm" : "Thêm sản phẩm"}
                    </button>
                </Modal.Footer>
            </form>
        </Modal>
    );
}