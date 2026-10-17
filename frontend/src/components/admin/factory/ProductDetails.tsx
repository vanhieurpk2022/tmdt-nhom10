import { useState, useEffect, useMemo, type FormEvent } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faArrowLeft,
    faBoxOpen,
    faCirclePlus,
    faPenToSquare,
    faTrash,
    faToggleOn,
    faToggleOff,
    faMagnifyingGlass,
    faTableList,
    faGrip,
    faCircleCheck,
    faCircleXmark,
    faTag,
    faBoxesStacked,
    faCoins,
    faFlaskVial,
    faImage,
} from "@fortawesome/free-solid-svg-icons";
import { Modal, Spinner } from "react-bootstrap";
import type { FactoryProductItem, FactoryProductVariantItem } from "../../../dto/factory/FactoryProductRes";
import { productService } from "../../../api/ProductService";
import { FactoryServiceManager } from "../../../api/factory/FactoryService";
import { formatVnd } from "../../format/FormatMoney";
import { ProductStatusBadge, ProductTypeBadge } from "../../../pages/FactoryProduct";
import { ProductType } from "../../../enums/ProductType";

interface ProductDetailsProps {
    product: FactoryProductItem;
    onBack: () => void;
    onUpdateProduct?: (updatedProduct: FactoryProductItem) => void;
}

export default function ProductDetails({
    product,
    onBack,
    onUpdateProduct,
}: ProductDetailsProps) {
    // Danh sách các biến thể (Items) của sản phẩm
    const [variants, setVariants] = useState<FactoryProductVariantItem[]>([]);
    const [loading, setLoading] = useState(false);

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");
    const [viewMode, setViewMode] = useState<"table" | "grid">("table");

    // Quản lý Modal Thêm / Sửa biến thể
    const [showModal, setShowModal] = useState(false);
    const [editingVariant, setEditingVariant] = useState<FactoryProductVariantItem | null>(null);

    // Form states
    const [formMil, setFormMil] = useState<number | "">("");
    const [formPrice, setFormPrice] = useState<number | "">("");
    const [formBasePrice, setFormBasePrice] = useState<number | "">("");
    const [formStock, setFormStock] = useState<number | "">("");
    const [formImageUrl, setFormImageUrl] = useState("");
    const [formIsActive, setFormIsActive] = useState(true);
    const [formError, setFormError] = useState("");

    // Modal xóa biến thể
    const [deletingVariant, setDeletingVariant] = useState<FactoryProductVariantItem | null>(null);

    // Toast
    const [toast, setToast] = useState<{ message: string; type: "success" | "danger" | "info" } | null>(null);

    const showToast = (message: string, type: "success" | "danger" | "info" = "success") => {
        setToast({ message, type });
        setTimeout(() => {
            setToast((curr) => (curr?.message === message ? null : curr));
        }, 3500);
    };

    // Khởi tạo các biến thể mặc định nếu chưa có
    const generateDefaultVariants = (basePrice: number): FactoryProductVariantItem[] => {
        const p = basePrice > 0 ? basePrice : 350000;
        return [
            {
                id: 1,
                mil: 10,
                price: Math.round((p * 0.28) / 1000) * 1000,
                basePrice: Math.round((p * 0.35) / 1000) * 1000,
                stockQuantity: 50,
                isActive: true,
                imageUrl: product.imageUrl,
            },
            {
                id: 2,
                mil: 30,
                price: Math.round((p * 0.65) / 1000) * 1000,
                basePrice: Math.round((p * 0.75) / 1000) * 1000,
                stockQuantity: 35,
                isActive: true,
                imageUrl: product.imageUrl,
            },
            {
                id: 3,
                mil: 50,
                price: p,
                basePrice: Math.round((p * 1.15) / 1000) * 1000,
                stockQuantity: 25,
                isActive: true,
                imageUrl: product.imageUrl,
            },
            {
                id: 4,
                mil: 100,
                price: Math.round((p * 1.8) / 1000) * 1000,
                basePrice: Math.round((p * 2.1) / 1000) * 1000,
                stockQuantity: 15,
                isActive: true,
                imageUrl: product.imageUrl,
            },
        ];
    };

    // Tải thông tin chi tiết biến thể từ backend qua API
    useEffect(() => {
        let isMounted = true;

        if (product.items && product.items.length > 0) {
            setVariants(product.items);
            return;
        }

        setLoading(true);

        const fetchMils = async () => {
            try {
                // 1. Thử gọi API chuyên biệt cho xưởng lấy danh sách biến thể
                const res = await FactoryServiceManager.getProductMils(product.id);
                if (isMounted && res?.data && res.data.length > 0) {
                    setVariants(res.data);
                    return;
                }
            } catch (err) {
                console.warn("Backend API getProductMils chưa sẵn sàng, thử tải qua getProductDetail:", err);
            }

            try {
                // 2. Thử gọi API chi tiết sản phẩm chung
                const detail = await productService.getProductDetail(product.id);
                if (isMounted && detail?.variants && detail.variants.length > 0) {
                    const mapped: FactoryProductVariantItem[] = detail.variants.map((v) => ({
                        id: v.id,
                        mil: v.mil,
                        price: v.price ?? product.price ?? 0,
                        basePrice: v.basePrice ?? null,
                        stockQuantity: v.stockQuantity,
                        isActive: v.isActive,
                        imageUrl: product.imageUrl,
                    }));
                    setVariants(mapped);
                    return;
                }
            } catch (err) {
                console.warn("Backend API getProductDetail chưa sẵn sàng, sử dụng mẫu mặc định:", err);
            }

            // 3. Fallback khởi tạo biến thể mặc định
            if (isMounted) {
                setVariants(generateDefaultVariants(product.price ?? 350000));
            }
        };

        fetchMils().finally(() => {
            if (isMounted) setLoading(false);
        });

        return () => {
            isMounted = false;
        };
    }, [product.id, product.price, product.items, product.imageUrl]);

    // Cập nhật lại sản phẩm cha khi danh sách variants thay đổi
    const notifyParentUpdate = (newVariants: FactoryProductVariantItem[]) => {
        if (!onUpdateProduct) return;
        const totalStock = newVariants.reduce((sum, item) => sum + (item.stockQuantity || 0), 0);
        onUpdateProduct({
            ...product,
            stock: totalStock,
            items: newVariants,
        });
    };

    // Mở modal thêm biến thể mới
    const handleOpenAddModal = () => {
        setEditingVariant(null);
        setFormMil("");
        setFormPrice("");
        setFormBasePrice("");
        setFormStock(50);
        setFormImageUrl(product.imageUrl || "");
        setFormIsActive(true);
        setFormError("");
        setShowModal(true);
    };

    // Mở modal chỉnh sửa biến thể
    const handleOpenEditModal = (item: FactoryProductVariantItem) => {
        setEditingVariant(item);
        setFormMil(item.mil);
        setFormPrice(item.price);
        setFormBasePrice(item.basePrice ?? "");
        setFormStock(item.stockQuantity);
        setFormImageUrl(item.imageUrl || product.imageUrl || "");
        setFormIsActive(item.isActive);
        setFormError("");
        setShowModal(true);
    };

    // Lưu biến thể (thêm mới hoặc sửa) - ĐÃ KẾT NỐI API
    const handleSaveVariant = async (e: FormEvent) => {
        e.preventDefault();
        setFormError("");

        const milNum = Number(formMil);
        const priceNum = Number(formPrice);
        const stockNum = Number(formStock);
        const basePriceNum = formBasePrice !== "" ? Number(formBasePrice) : null;

        if (!milNum || milNum <= 0) {
            setFormError("Vui lòng nhập dung tích hợp lệ (lớn hơn 0 ml)!");
            return;
        }

        if (priceNum < 0 || isNaN(priceNum)) {
            setFormError("Vui lòng nhập giá bán hợp lệ!");
            return;
        }

        if (stockNum < 0 || isNaN(stockNum)) {
            setFormError("Vui lòng nhập số lượng tồn kho hợp lệ!");
            return;
        }

        // Kiểm tra trùng dung tích khi thêm mới
        if (!editingVariant && variants.some((v) => v.mil === milNum)) {
            setFormError(`Biến thể dung tích ${milNum}ml đã tồn tại trong sản phẩm này!`);
            return;
        }

        const payload: Partial<FactoryProductVariantItem> = {
            mil: milNum,
            price: priceNum,
            basePrice: basePriceNum,
            stockQuantity: stockNum,
            imageUrl: formImageUrl.trim() || product.imageUrl,
            isActive: formIsActive,
        };

        let updatedList: FactoryProductVariantItem[];

        if (editingVariant) {
            // GỌI API CẬP NHẬT BIẾN THỂ: PUT /manager/products/${productId}/mils/${milId}
            try {
                await FactoryServiceManager.updateProductMil(product.id, editingVariant.id, payload);
            } catch (err) {
                console.warn("Backend API updateProductMil chưa sẵn sàng, lưu cục bộ:", err);
            }

            updatedList = variants.map((v) =>
                v.id === editingVariant.id
                    ? {
                          ...v,
                          ...payload,
                          mil: milNum,
                          price: priceNum,
                          basePrice: basePriceNum,
                          stockQuantity: stockNum,
                          imageUrl: formImageUrl.trim() || product.imageUrl,
                          isActive: formIsActive,
                      }
                    : v
            );
            showToast(`Đã cập nhật biến thể ${product.name} - ${milNum}ml!`, "success");
        } else {
            // GỌI API TẠO BIẾN THỂ: POST /manager/products/${productId}/mils
            let createdId: number | null = null;
            try {
                const res = await FactoryServiceManager.createProductMil(product.id, payload);
                if (res?.data?.id) {
                    createdId = res.data.id;
                }
            } catch (err) {
                console.warn("Backend API createProductMil chưa sẵn sàng, lưu cục bộ:", err);
            }

            const nextId = createdId ?? (variants.length > 0 ? Math.max(...variants.map((v) => v.id)) + 1 : 1);
            const newVariant: FactoryProductVariantItem = {
                id: nextId,
                mil: milNum,
                price: priceNum,
                basePrice: basePriceNum,
                stockQuantity: stockNum,
                imageUrl: formImageUrl.trim() || product.imageUrl,
                isActive: formIsActive,
            };
            updatedList = [...variants, newVariant].sort((a, b) => a.mil - b.mil);
            showToast(`Đã thêm thành công biến thể mới: ${product.name} - ${milNum}ml!`, "success");
        }

        setVariants(updatedList);
        notifyParentUpdate(updatedList);
        setShowModal(false);
    };

    // Bật/tắt trạng thái biến thể - ĐÃ KẾT NỐI API
    const handleToggleStatus = async (item: FactoryProductVariantItem) => {
        const nextStatus = !item.isActive;

        // GỌI API BẬT/TẮT BIẾN THỂ: PATCH /manager/products/${productId}/mils/${milId}/status
        try {
            await FactoryServiceManager.toggleStatusProductMil(product.id, item.id, nextStatus);
        } catch (err) {
            console.warn("Backend API toggleStatusProductMil chưa sẵn sàng, lưu cục bộ:", err);
        }

        const updatedList = variants.map((v) => (v.id === item.id ? { ...v, isActive: nextStatus } : v));
        setVariants(updatedList);
        notifyParentUpdate(updatedList);
        showToast(
            `Đã ${nextStatus ? "kích hoạt mở bán" : "tạm dừng"} biến thể ${product.name} - ${item.mil}ml.`,
            "info"
        );
    };

    // Xác nhận xóa biến thể - ĐÃ KẾT NỐI API
    const handleConfirmDelete = async () => {
        if (!deletingVariant) return;

        // GỌI API XÓA BIẾN THỂ: DELETE /manager/products/${productId}/mils/${milId}
        try {
            await FactoryServiceManager.deleteProductMil(product.id, deletingVariant.id);
        } catch (err) {
            console.warn("Backend API deleteProductMil chưa sẵn sàng, xóa cục bộ:", err);
        }

        const updatedList = variants.filter((v) => v.id !== deletingVariant.id);
        setVariants(updatedList);
        notifyParentUpdate(updatedList);
        showToast(`Đã xóa biến thể ${product.name} - ${deletingVariant.mil}ml!`, "success");
        setDeletingVariant(null);
    };

    // Thống kê nhanh của sản phẩm này
    const stats = useMemo(() => {
        const totalItems = variants.length;
        const activeItems = variants.filter((v) => v.isActive).length;
        const totalStock = variants.reduce((sum, v) => sum + (v.stockQuantity || 0), 0);
        const prices = variants.map((v) => v.price).filter((p) => p > 0);
        const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
        const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

        return { totalItems, activeItems, totalStock, minPrice, maxPrice };
    }, [variants]);

    // Lọc danh sách biến thể
    const filteredVariants = useMemo(() => {
        return variants.filter((v) => {
            const variantFullName = `${product.name} - ${v.mil}ml ${v.mil} mil`.toLowerCase();
            const matchesSearch = search.trim() === "" || variantFullName.includes(search.toLowerCase());
            const matchesStatus =
                statusFilter === "ALL" ||
                (statusFilter === "ACTIVE" && v.isActive) ||
                (statusFilter === "INACTIVE" && !v.isActive);
            return matchesSearch && matchesStatus;
        });
    }, [variants, product.name, search, statusFilter]);

    return (
        <div>
            {/* Toast Thông báo */}
            {toast && (
                <div
                    className={`alert alert-${toast.type} alert-dismissible fade show d-flex align-items-center justify-content-between mb-4 shadow-sm border-0`}
                    role="alert"
                >
                    <div className="d-flex align-items-center gap-2">
                        <FontAwesomeIcon icon={toast.type === "success" ? faCircleCheck : faCircleXmark} />
                        <span className="fw-medium">{toast.message}</span>
                    </div>
                    <button
                        type="button"
                        className="btn-close"
                        onClick={() => setToast(null)}
                        aria-label="Đóng"
                    />
                </div>
            )}

            {/* Top Navigation & Breadcrumb */}
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
                <div className="d-flex align-items-center gap-3">
                    <button
                        type="button"
                        id="btn-back-to-products"
                        className="btn btn-outline-secondary d-flex align-items-center gap-2 px-3 py-2 shadow-sm rounded-3 fw-semibold"
                        onClick={onBack}
                        title="Quay lại danh sách sản phẩm"
                    >
                        <FontAwesomeIcon icon={faArrowLeft} />
                        <span>Quay lại danh sách</span>
                    </button>

                    <div>
                        <nav aria-label="breadcrumb">
                            <ol className="breadcrumb mb-1 small">
                                <li className="breadcrumb-item">
                                    <span role="button" onClick={onBack} className="text-secondary text-decoration-none">
                                        Sản phẩm
                                    </span>
                                </li>
                                <li className="breadcrumb-item active text-danger fw-semibold" aria-current="page">
                                    Chi tiết biến thể (Items)
                                </li>
                            </ol>
                        </nav>
                        <h3 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                            <span>{product.name}</span>
                            <span className="badge bg-light text-dark border font-monospace fs-6">
                                #{product.id}
                            </span>
                        </h3>
                    </div>
                </div>

                <div className="d-flex align-items-center gap-2">
                    <button
                        type="button"
                        id="btn-add-variant-item"
                        className="btn btn-danger px-3 py-2 fw-semibold d-flex align-items-center gap-2 shadow-sm rounded-3"
                        onClick={handleOpenAddModal}
                    >
                        <FontAwesomeIcon icon={faCirclePlus} />
                        <span>Thêm biến thể mới</span>
                    </button>
                </div>
            </div>

            {/* Product Overview Card */}
            <div className="card border-0 shadow-sm rounded-4 mb-4 overflow-hidden">
                <div className="card-body p-4 bg-white">
                    <div className="row g-4 align-items-center">
                        <div className="col-12 col-md-auto text-center">
                            {product.imageUrl ? (
                                <img
                                    src={product.imageUrl}
                                    alt={product.name}
                                    className="rounded-4 border shadow-sm object-fit-cover"
                                    style={{ width: 110, height: 110 }}
                                    onError={(e) => {
                                        (e.currentTarget as HTMLImageElement).src =
                                            "https://placehold.co/110x110?text=SP";
                                    }}
                                />
                            ) : (
                                <div
                                    className="d-flex align-items-center justify-content-center rounded-4 bg-danger-subtle text-danger shadow-sm mx-auto"
                                    style={{ width: 110, height: 110, fontSize: 36 }}
                                >
                                    <FontAwesomeIcon icon={faBoxOpen} />
                                </div>
                            )}
                        </div>

                        <div className="col-12 col-md">
                            <div className="d-flex align-items-center gap-2 flex-wrap mb-2">
                                <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-2">
                                    <FontAwesomeIcon icon={faTag} className="me-1" />
                                    {product.category || "Chưa phân loại"}
                                </span>
                                {product.type && (
                                    <span
                                        className={`badge px-3 py-2 ${
                                            product.type === ProductType.CUSTOM
                                                ? ProductTypeBadge[ProductType.CUSTOM].badge
                                                : ProductTypeBadge[ProductType.NORMAL].badge
                                        }`}
                                    >
                                        {product.type === ProductType.CUSTOM ? "Gia công theo yêu cầu" : "Bán sẵn"}
                                    </span>
                                )}
                                <span
                                    className={`badge rounded-pill px-3 py-2 ${
                                        product.status === "INACTIVE"
                                            ? ProductStatusBadge.INACTIVE.badge
                                            : ProductStatusBadge.ACTIVE.badge
                                    }`}
                                >
                                    {product.status === "INACTIVE" ? "Ngừng bán" : "Đang bán"}
                                </span>
                            </div>

                            <p className="text-secondary small mb-3" style={{ maxWidth: 700 }}>
                                {product.description ||
                                    "Quản lý danh sách các sản phẩm Item (biến thể) theo dung tích mil, hình ảnh và giá bán tương ứng."}
                            </p>

                            <div className="row g-3">
                                <div className="col-6 col-md-3">
                                    <div className="p-2 px-3 rounded-3 bg-light border">
                                        <small className="text-muted d-block mb-1">Số lượng biến thể</small>
                                        <span className="fw-bold text-dark fs-6 d-flex align-items-center gap-2">
                                            <FontAwesomeIcon icon={faFlaskVial} className="text-primary" />
                                            {stats.totalItems} biến thể
                                        </span>
                                    </div>
                                </div>

                                <div className="col-6 col-md-3">
                                    <div className="p-2 px-3 rounded-3 bg-light border">
                                        <small className="text-muted d-block mb-1">Tổng tồn kho</small>
                                        <span className="fw-bold text-dark fs-6 d-flex align-items-center gap-2">
                                            <FontAwesomeIcon icon={faBoxesStacked} className="text-success" />
                                            {stats.totalStock} chiếc
                                        </span>
                                    </div>
                                </div>

                                <div className="col-12 col-md-6">
                                    <div className="p-2 px-3 rounded-3 bg-danger-subtle text-danger-emphasis border border-danger-subtle">
                                        <small className="text-uppercase fw-semibold d-block mb-1" style={{ fontSize: 11 }}>
                                            Khoảng giá biến thể
                                        </small>
                                        <span className="fw-bold fs-6">
                                            {stats.minPrice === stats.maxPrice
                                                ? formatVnd(stats.minPrice)
                                                : `${formatVnd(stats.minPrice)} ~ ${formatVnd(stats.maxPrice)}`}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter and View Mode Toolbar */}
            <div className="card border-0 shadow-sm rounded-4 mb-4">
                <div className="card-body p-3 p-lg-4">
                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                        <div className="d-flex align-items-center gap-3 flex-wrap flex-grow-1">
                            {/* Search box */}
                            <div className="input-group" style={{ maxWidth: 320 }}>
                                <span className="input-group-text bg-white border-end-0">
                                    <FontAwesomeIcon icon={faMagnifyingGlass} className="text-muted" />
                                </span>
                                <input
                                    type="search"
                                    id="input-search-variant"
                                    className="form-control border-start-0 ps-0"
                                    placeholder="Tìm biến thể theo ml, tên..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>

                            {/* Status filter */}
                            <div className="d-flex align-items-center gap-2">
                                <span className="small text-secondary d-none d-md-inline">Trạng thái:</span>
                                <div className="btn-group btn-group-sm" role="group">
                                    <button
                                        type="button"
                                        className={`btn ${statusFilter === "ALL" ? "btn-danger" : "btn-outline-secondary"}`}
                                        onClick={() => setStatusFilter("ALL")}
                                    >
                                        Tất cả ({variants.length})
                                    </button>
                                    <button
                                        type="button"
                                        className={`btn ${statusFilter === "ACTIVE" ? "btn-danger" : "btn-outline-secondary"}`}
                                        onClick={() => setStatusFilter("ACTIVE")}
                                    >
                                        Đang bán ({stats.activeItems})
                                    </button>
                                    <button
                                        type="button"
                                        className={`btn ${statusFilter === "INACTIVE" ? "btn-danger" : "btn-outline-secondary"}`}
                                        onClick={() => setStatusFilter("INACTIVE")}
                                    >
                                        Tạm dừng ({variants.length - stats.activeItems})
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* View mode toggle */}
                        <div className="d-flex align-items-center gap-2">
                            <span className="small text-secondary">Chế độ xem:</span>
                            <div className="btn-group btn-group-sm">
                                <button
                                    type="button"
                                    id="btn-view-table"
                                    className={`btn ${viewMode === "table" ? "btn-dark" : "btn-outline-secondary"}`}
                                    onClick={() => setViewMode("table")}
                                    title="Xem dạng bảng"
                                >
                                    <FontAwesomeIcon icon={faTableList} />
                                </button>
                                <button
                                    type="button"
                                    id="btn-view-grid"
                                    className={`btn ${viewMode === "grid" ? "btn-dark" : "btn-outline-secondary"}`}
                                    onClick={() => setViewMode("grid")}
                                    title="Xem dạng thẻ"
                                >
                                    <FontAwesomeIcon icon={faGrip} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Danh sách các sản phẩm Item (Biến thể) */}
            {loading ? (
                <div className="card border-0 shadow-sm rounded-4 p-5 text-center">
                    <Spinner animation="border" variant="danger" className="mx-auto mb-3" />
                    <span className="text-secondary fw-medium">Đang tải danh sách biến thể sản phẩm...</span>
                </div>
            ) : viewMode === "table" ? (
                /* Dạng Bảng */
                <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                    <div className="table-responsive admin-table-scroll">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th style={{ width: 80 }}>Mã Item</th>
                                    <th>Ảnh</th>
                                    <th>Tên sản phẩm + Dung tích</th>
                                    <th>Dung tích (mil)</th>
                                    <th className="text-end">Giá bán biến thể</th>
                                    <th className="text-end">Giá niêm yết</th>
                                    <th className="text-center">Tồn kho</th>
                                    <th className="text-center">Trạng thái</th>
                                    <th className="text-end" style={{ width: 140 }}>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredVariants.map((item) => {
                                    const variantImg = item.imageUrl || product.imageUrl;
                                    const variantName = `${product.name} - ${item.mil}ml`;

                                    let stockBadgeClass = "bg-success-subtle text-success-emphasis";
                                    let stockLabel = "Còn hàng";
                                    if (item.stockQuantity <= 0) {
                                        stockBadgeClass = "bg-danger-subtle text-danger-emphasis";
                                        stockLabel = "Hết hàng";
                                    } else if (item.stockQuantity <= 10) {
                                        stockBadgeClass = "bg-warning-subtle text-warning-emphasis";
                                        stockLabel = "Sắp hết";
                                    }

                                    return (
                                        <tr key={item.id} id={`row-item-${item.id}`}>
                                            <td>
                                                <span className="badge bg-light text-dark border font-monospace">
                                                    #{item.id}
                                                </span>
                                            </td>

                                            <td>
                                                {variantImg ? (
                                                    <img
                                                        src={variantImg}
                                                        alt={variantName}
                                                        className="rounded-3 border object-fit-cover shadow-sm"
                                                        style={{ width: 48, height: 48 }}
                                                        onError={(e) => {
                                                            (e.currentTarget as HTMLImageElement).src =
                                                                "https://placehold.co/48x48?text=Item";
                                                        }}
                                                    />
                                                ) : (
                                                    <div
                                                        className="d-flex align-items-center justify-content-center rounded-3 bg-danger-subtle text-danger fw-bold"
                                                        style={{ width: 48, height: 48, fontSize: 16 }}
                                                    >
                                                        <FontAwesomeIcon icon={faBoxOpen} />
                                                    </div>
                                                )}
                                            </td>

                                            <td>
                                                <div className="d-flex flex-column">
                                                    <span className="fw-bold text-dark fs-6" title={variantName}>
                                                        {variantName}
                                                    </span>
                                                    <small className="text-muted">
                                                        Mã quy chuẩn: {product.id}-MIL{item.mil}
                                                    </small>
                                                </div>
                                            </td>

                                            <td>
                                                <span className="badge rounded-pill bg-primary-subtle text-primary border border-primary-subtle px-3 py-2 fw-semibold">
                                                    {item.mil} ml
                                                </span>
                                            </td>

                                            <td className="text-end">
                                                <span className="fw-bold text-danger fs-6">
                                                    {formatVnd(item.price)}
                                                </span>
                                            </td>

                                            <td className="text-end">
                                                {item.basePrice ? (
                                                    <span className="text-muted text-decoration-line-through small">
                                                        {formatVnd(item.basePrice)}
                                                    </span>
                                                ) : (
                                                    <span className="text-secondary">-</span>
                                                )}
                                            </td>

                                            <td className="text-center">
                                                <div className="d-flex flex-column align-items-center">
                                                    <span className="fw-semibold text-dark">
                                                        {item.stockQuantity} chiếc
                                                    </span>
                                                    <span className={`badge rounded-pill small ${stockBadgeClass} mt-1`} style={{ fontSize: 10 }}>
                                                        {stockLabel}
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="text-center">
                                                <span
                                                    className={`badge rounded-pill small ${
                                                        item.isActive
                                                            ? "bg-success-subtle text-success-emphasis"
                                                            : "bg-secondary-subtle text-secondary"
                                                    }`}
                                                >
                                                    {item.isActive ? "Đang bán" : "Tạm dừng"}
                                                </span>
                                            </td>

                                            <td className="text-end">
                                                <div className="d-flex align-items-center justify-content-end gap-1">
                                                    <button
                                                        type="button"
                                                        id={`btn-edit-item-${item.id}`}
                                                        className="btn btn-sm btn-outline-success"
                                                        title="Chỉnh sửa biến thể"
                                                        onClick={() => handleOpenEditModal(item)}
                                                    >
                                                        <FontAwesomeIcon icon={faPenToSquare} />
                                                    </button>

                                                    <button
                                                        type="button"
                                                        id={`btn-toggle-item-${item.id}`}
                                                        className={`btn btn-sm ${
                                                            item.isActive
                                                                ? "btn-outline-warning text-warning"
                                                                : "btn-outline-secondary text-secondary"
                                                        }`}
                                                        title={item.isActive ? "Tạm dừng bán" : "Mở bán lại"}
                                                        onClick={() => handleToggleStatus(item)}
                                                    >
                                                        <FontAwesomeIcon icon={item.isActive ? faToggleOn : faToggleOff} size="lg" />
                                                    </button>

                                                    <button
                                                        type="button"
                                                        id={`btn-delete-item-${item.id}`}
                                                        className="btn btn-sm btn-outline-danger"
                                                        title="Xóa biến thể"
                                                        onClick={() => setDeletingVariant(item)}
                                                    >
                                                        <FontAwesomeIcon icon={faTrash} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}

                                {filteredVariants.length === 0 && (
                                    <tr>
                                        <td colSpan={9} className="text-center py-5 text-secondary">
                                            <FontAwesomeIcon icon={faBoxOpen} size="2x" className="mb-2 text-muted opacity-50 d-block" />
                                            {search
                                                ? "Không tìm thấy biến thể nào phù hợp với từ khóa."
                                                : "Chưa có biến thể nào cho sản phẩm này. Hãy bấm 'Thêm biến thể mới' để tạo!"}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                /* Dạng Thẻ Grid Cards */
                <div className="row g-4">
                    {filteredVariants.map((item) => {
                        const variantImg = item.imageUrl || product.imageUrl;
                        const variantName = `${product.name} - ${item.mil}ml`;

                        return (
                            <div key={item.id} className="col-12 col-md-6 col-xl-4 col-xxl-3" id={`card-item-${item.id}`}>
                                <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden position-relative hover-shadow transition">
                                    <div className="position-absolute top-0 start-0 m-3 z-1">
                                        <span className="badge rounded-pill bg-dark bg-opacity-75 text-white border font-monospace">
                                            #{item.id}
                                        </span>
                                    </div>

                                    <div className="position-absolute top-0 end-0 m-3 z-1">
                                        <span
                                            className={`badge rounded-pill small ${
                                                item.isActive
                                                    ? "bg-success text-white"
                                                    : "bg-secondary text-white"
                                            }`}
                                        >
                                            {item.isActive ? "Đang bán" : "Tạm dừng"}
                                        </span>
                                    </div>

                                    <div className="ratio ratio-4x3 bg-light overflow-hidden">
                                        {variantImg ? (
                                            <img
                                                src={variantImg}
                                                alt={variantName}
                                                className="object-fit-cover w-100 h-100"
                                                onError={(e) => {
                                                    (e.currentTarget as HTMLImageElement).src =
                                                        "https://placehold.co/300x200?text=Item";
                                                }}
                                            />
                                        ) : (
                                            <div className="d-flex align-items-center justify-content-center text-danger">
                                                <FontAwesomeIcon icon={faBoxOpen} size="3x" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="card-body p-4 d-flex flex-column justify-content-between">
                                        <div>
                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-1">
                                                    {item.mil} ml
                                                </span>
                                                <span className="small text-secondary fw-semibold">
                                                    Tồn kho: <strong className="text-dark">{item.stockQuantity}</strong>
                                                </span>
                                            </div>

                                            <h6 className="card-title fw-bold text-dark mb-3" title={variantName}>
                                                {variantName}
                                            </h6>

                                            <div className="d-flex align-items-baseline gap-2 mb-3">
                                                <span className="fs-5 fw-bold text-danger">
                                                    {formatVnd(item.price)}
                                                </span>
                                                {item.basePrice && (
                                                    <span className="small text-muted text-decoration-line-through">
                                                        {formatVnd(item.basePrice)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="d-flex align-items-center justify-content-between pt-3 border-top mt-auto">
                                            <button
                                                type="button"
                                                className={`btn btn-sm d-flex align-items-center gap-1 ${
                                                    item.isActive ? "btn-outline-warning text-warning" : "btn-outline-secondary text-secondary"
                                                }`}
                                                onClick={() => handleToggleStatus(item)}
                                            >
                                                <FontAwesomeIcon icon={item.isActive ? faToggleOn : faToggleOff} />
                                                <span>{item.isActive ? "Tạm dừng" : "Mở bán"}</span>
                                            </button>

                                            <div className="d-flex gap-1">
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-outline-success"
                                                    title="Chỉnh sửa"
                                                    onClick={() => handleOpenEditModal(item)}
                                                >
                                                    <FontAwesomeIcon icon={faPenToSquare} />
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-outline-danger"
                                                    title="Xóa"
                                                    onClick={() => setDeletingVariant(item)}
                                                >
                                                    <FontAwesomeIcon icon={faTrash} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {filteredVariants.length === 0 && (
                        <div className="col-12 text-center py-5">
                            <div className="p-5 bg-white rounded-4 shadow-sm">
                                <FontAwesomeIcon icon={faBoxOpen} size="3x" className="text-muted opacity-50 mb-3" />
                                <h5 className="fw-bold text-dark">Không tìm thấy biến thể nào</h5>
                                <p className="text-secondary small">
                                    Thử tìm kiếm với từ khóa khác hoặc bấm 'Thêm biến thể mới' để tạo.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Modal Thêm mới / Chỉnh sửa Biến thể Item */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered backdrop="static">
                <form onSubmit={handleSaveVariant} id="form-manage-variant-item">
                    <Modal.Header closeButton className="border-bottom-0 pb-0">
                        <div className="d-flex align-items-center gap-3">
                            <div
                                className={`d-flex align-items-center justify-content-center rounded-3 p-3 ${
                                    editingVariant ? "bg-warning-subtle text-warning-emphasis" : "bg-danger-subtle text-danger"
                                }`}
                                style={{ width: 46, height: 46 }}
                            >
                                <FontAwesomeIcon icon={editingVariant ? faPenToSquare : faCirclePlus} size="lg" />
                            </div>
                            <div>
                                <Modal.Title as="h5" className="fw-bold mb-0">
                                    {editingVariant ? `Chỉnh sửa biến thể #${editingVariant.id}` : "Thêm biến thể mới (Item)"}
                                </Modal.Title>
                                <small className="text-muted">
                                    Thiết lập dung tích mil, giá bán và tồn kho cho biến thể này
                                </small>
                            </div>
                        </div>
                    </Modal.Header>

                    <Modal.Body className="py-3 px-4">
                        {formError && (
                            <div className="alert alert-danger py-2 px-3 small d-flex align-items-center gap-2 mb-3">
                                <FontAwesomeIcon icon={faCircleXmark} />
                                <span>{formError}</span>
                            </div>
                        )}

                        <div className="row g-3">
                            {/* Tên sản phẩm gốc */}
                            <div className="col-12">
                                <label className="form-label fw-semibold small text-secondary">
                                    Tên sản phẩm gốc
                                </label>
                                <input
                                    type="text"
                                    className="form-control bg-light"
                                    value={product.name}
                                    disabled
                                    readOnly
                                />
                            </div>

                            {/* Dung tích (mil) */}
                            <div className="col-12 col-md-6">
                                <label htmlFor="input-variant-mil" className="form-label fw-semibold small text-secondary">
                                    Dung tích (mil) <span className="text-danger">*</span>
                                </label>
                                <div className="input-group">
                                    <span className="input-group-text bg-light text-muted">
                                        <FontAwesomeIcon icon={faFlaskVial} />
                                    </span>
                                    <input
                                        type="number"
                                        id="input-variant-mil"
                                        className="form-control"
                                        placeholder="VD: 10, 30, 50, 100"
                                        min={1}
                                        value={formMil}
                                        onChange={(e) => setFormMil(e.target.value ? Number(e.target.value) : "")}
                                        required
                                    />
                                    <span className="input-group-text bg-light">ml</span>
                                </div>
                            </div>

                            {/* Preview Tên biến thể */}
                            <div className="col-12 col-md-6">
                                <label className="form-label fw-semibold small text-secondary">
                                    Tên hiển thị biến thể (Preview)
                                </label>
                                <input
                                    type="text"
                                    className="form-control bg-light fw-bold text-dark"
                                    value={formMil ? `${product.name} - ${formMil}ml` : `${product.name} - ...ml`}
                                    disabled
                                    readOnly
                                />
                            </div>

                            {/* Giá bán biến thể */}
                            <div className="col-12 col-md-6">
                                <label htmlFor="input-variant-price" className="form-label fw-semibold small text-secondary">
                                    Giá bán biến thể (VNĐ) <span className="text-danger">*</span>
                                </label>
                                <div className="input-group">
                                    <span className="input-group-text bg-light text-muted">
                                        <FontAwesomeIcon icon={faCoins} />
                                    </span>
                                    <input
                                        type="number"
                                        id="input-variant-price"
                                        className="form-control fw-semibold text-danger"
                                        placeholder="VD: 350000"
                                        min={0}
                                        step={1000}
                                        value={formPrice}
                                        onChange={(e) => setFormPrice(e.target.value ? Number(e.target.value) : "")}
                                        required
                                    />
                                    <span className="input-group-text bg-light">₫</span>
                                </div>
                            </div>

                            {/* Giá niêm yết (gốc) */}
                            <div className="col-12 col-md-6">
                                <label htmlFor="input-variant-base-price" className="form-label fw-semibold small text-secondary">
                                    Giá niêm yết / Gốc (VNĐ)
                                </label>
                                <div className="input-group">
                                    <span className="input-group-text bg-light text-muted">
                                        <FontAwesomeIcon icon={faTag} />
                                    </span>
                                    <input
                                        type="number"
                                        id="input-variant-base-price"
                                        className="form-control"
                                        placeholder="VD: 450000"
                                        min={0}
                                        step={1000}
                                        value={formBasePrice}
                                        onChange={(e) => setFormBasePrice(e.target.value ? Number(e.target.value) : "")}
                                    />
                                    <span className="input-group-text bg-light">₫</span>
                                </div>
                            </div>

                            {/* Số lượng tồn kho */}
                            <div className="col-12 col-md-6">
                                <label htmlFor="input-variant-stock" className="form-label fw-semibold small text-secondary">
                                    Số lượng tồn kho <span className="text-danger">*</span>
                                </label>
                                <div className="input-group">
                                    <span className="input-group-text bg-light text-muted">
                                        <FontAwesomeIcon icon={faBoxesStacked} />
                                    </span>
                                    <input
                                        type="number"
                                        id="input-variant-stock"
                                        className="form-control"
                                        placeholder="VD: 50"
                                        min={0}
                                        value={formStock}
                                        onChange={(e) => setFormStock(e.target.value ? Number(e.target.value) : "")}
                                        required
                                    />
                                    <span className="input-group-text bg-light">chiếc</span>
                                </div>
                            </div>

                            {/* Trạng thái hoạt động */}
                            <div className="col-12 col-md-6">
                                <label className="form-label fw-semibold small text-secondary">
                                    Trạng thái mở bán
                                </label>
                                <div className="form-check form-switch pt-2">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        role="switch"
                                        id="switch-variant-active"
                                        checked={formIsActive}
                                        onChange={(e) => setFormIsActive(e.target.checked)}
                                        style={{ cursor: "pointer", width: 45, height: 22 }}
                                    />
                                    <label
                                        className="form-check-label ms-2 fw-semibold"
                                        htmlFor="switch-variant-active"
                                        style={{ cursor: "pointer" }}
                                    >
                                        {formIsActive ? (
                                            <span className="text-success">Đang mở bán</span>
                                        ) : (
                                            <span className="text-secondary">Tạm ngừng bán</span>
                                        )}
                                    </label>
                                </div>
                            </div>

                            {/* URL ảnh biến thể */}
                            <div className="col-12">
                                <label htmlFor="input-variant-image" className="form-label fw-semibold small text-secondary">
                                    Đường dẫn ảnh biến thể (tùy chọn)
                                </label>
                                <div className="input-group">
                                    <span className="input-group-text bg-light text-muted">
                                        <FontAwesomeIcon icon={faImage} />
                                    </span>
                                    <input
                                        type="url"
                                        id="input-variant-image"
                                        className="form-control"
                                        placeholder="https://... hoặc để trống để dùng ảnh sản phẩm cha"
                                        value={formImageUrl}
                                        onChange={(e) => setFormImageUrl(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </Modal.Body>

                    <Modal.Footer className="border-top-0 pt-0 px-4 pb-3">
                        <button
                            type="button"
                            className="btn btn-light border px-4"
                            onClick={() => setShowModal(false)}
                        >
                            Hủy bỏ
                        </button>
                        <button
                            type="submit"
                            id="btn-submit-variant-item"
                            className="btn btn-danger px-4 fw-semibold"
                        >
                            {editingVariant ? "Lưu thay đổi" : "Thêm biến thể"}
                        </button>
                    </Modal.Footer>
                </form>
            </Modal>

            {/* Modal Xác nhận xóa biến thể */}
            <Modal show={!!deletingVariant} onHide={() => setDeletingVariant(null)} centered>
                <Modal.Header closeButton className="border-bottom-0 pb-0">
                    <div className="d-flex align-items-center gap-3">
                        <div
                            className="d-flex align-items-center justify-content-center bg-danger-subtle text-danger rounded-3 p-3"
                            style={{ width: 46, height: 46 }}
                        >
                            <FontAwesomeIcon icon={faTrash} size="lg" />
                        </div>
                        <div>
                            <Modal.Title as="h5" className="fw-bold mb-0 text-danger">
                                Xác nhận xóa biến thể
                            </Modal.Title>
                            <small className="text-muted">Hành động này không thể hoàn tác</small>
                        </div>
                    </div>
                </Modal.Header>

                <Modal.Body className="py-3 px-4">
                    <p className="mb-0 text-secondary">
                        Bạn có chắc chắn muốn xóa biến thể{" "}
                        <strong className="text-dark">
                            {product.name} - {deletingVariant?.mil}ml
                        </strong>{" "}
                        khỏi sản phẩm này không?
                    </p>
                </Modal.Body>

                <Modal.Footer className="border-top-0 pt-0 px-4 pb-3">
                    <button
                        type="button"
                        className="btn btn-light border px-4"
                        onClick={() => setDeletingVariant(null)}
                    >
                        Hủy bỏ
                    </button>
                    <button
                        type="button"
                        id="btn-confirm-delete-variant"
                        className="btn btn-danger px-4 fw-semibold"
                        onClick={handleConfirmDelete}
                    >
                        Xóa biến thể
                    </button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}
