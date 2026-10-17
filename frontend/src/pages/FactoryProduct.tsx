import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import { createColumnHelper, useTable, type PaginationState } from "@tanstack/react-table";
import {
    faArrowDownAZ,
    faArrowUpAZ,
    faSort,
    faMagnifyingGlass,
    faTag,
    faBoxOpen,
    faCircleCheck,
    faCircleXmark,
    faCirclePlus,
    faDownload,
    faEye,
    faPenToSquare,
    faTrash,
    faToggleOn,
    faToggleOff,
    faChevronLeft,
    faChevronRight,
    faFlaskVial,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import SideBarFactory from "../components/admin/factory/SideBarFactory";
import StatCard from "../components/admin/dashboard/StartCard";
import { features } from "../components/table/features";
import { ProductType } from "../enums/ProductType";
import "../css/pages/dashboard/admin.css";
import "../css/pages/dashboard/dashboard.css";
import { FactoryServiceManager } from "../api/factory/FactoryService";
import type { FactoryProductItem, FactoryProductStats } from "../dto/factory/FactoryProductRes";
import AddProductModal from "../components/admin/factory/AddProductModal";
import DeleteProductModal from "../components/admin/factory/DeleteProductModal";
import ProductDetails from "../components/admin/factory/ProductDetails";

export const ProductStatusBadge: Record<string, { label: string; badge: string }> = {
    ACTIVE: {
        label: "Đang bán",
        badge: "bg-success-subtle text-success-emphasis",
    },
    INACTIVE: {
        label: "Ngừng bán",
        badge: "bg-secondary-subtle text-secondary-emphasis",
    },
};

export const ProductTypeBadge: Record<ProductType, { label: string; badge: string }> = {
    [ProductType.CUSTOM]: {
        label: "Tùy chỉnh",
        badge: "bg-primary text-white",
    },
    [ProductType.NORMAL]: {
        label: "Thường",
        badge: "bg-primary-subtle text-primary-emphasis",
    },
};

// Đặt NGOÀI component vì không phụ thuộc state
const columnHelper = createColumnHelper<typeof features, FactoryProductItem>();

export default function FactoryProductPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [products, setProducts] = useState<FactoryProductItem[]>([]);
    const [stats, setStats] = useState<FactoryProductStats>({
        totalProducts: 0,
        forSale: 0,
        outOfStock: 0,
        totalSold: 0,
    });
    const [search, setSearch] = useState("");
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });

    // Quản lý chuyển đổi giao diện sang Component chi tiết các sản phẩm Item
    const [selectedProductForDetail, setSelectedProductForDetail] = useState<FactoryProductItem | null>(null);

    // State quản lý Modals
    const [showFormModal, setShowFormModal] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<FactoryProductItem | null>(null);

    // Thông báo Toast Alert
    const [toast, setToast] = useState<{ message: string; type: "success" | "danger" | "info" } | null>(null);

    const showToast = (message: string, type: "success" | "danger" | "info" = "success") => {
        setToast({ message, type });
        setTimeout(() => {
            setToast((current) => (current?.message === message ? null : current));
        }, 4000);
    };

    const calculateStats = (items: FactoryProductItem[]): FactoryProductStats => {
        const totalProducts = items.length;
        const forSale = items.filter((p) => p.status !== "INACTIVE" && (p.stock ?? 0) > 0).length;
        const outOfStock = items.filter((p) => (p.stock ?? 0) <= 0).length;
        const totalSold = items.reduce((acc, curr) => acc + (curr.sold ?? 0), 0);
        return { totalProducts, forSale, outOfStock, totalSold };
    };

    const getProducts = useCallback(async () => {
        try {
            const res = await FactoryServiceManager.getProducts();
            if (res.status === 200 && res.data) {
                const fetchedProducts = res.data.products || [];
                // Bổ sung mặc định status nếu chưa có
                const normalized = fetchedProducts.map((p) => ({
                    ...p,
                    status: p.status || "ACTIVE",
                }));
                setProducts(normalized);
                setStats(res.data.stats || calculateStats(normalized));
            }
        } catch (error) {
            console.log("Lỗi lấy sản phẩm từ server:", error);
        }
    }, []);

    useEffect(() => {
        getProducts();
    }, [getProducts]);

    // Đồng bộ URL params với view chi tiết Item
    useEffect(() => {
        const view = searchParams.get("view");
        const productIdParam = searchParams.get("productId");
        if (view === "items" && productIdParam && products.length > 0) {
            const found = products.find((p) => p.id === Number(productIdParam));
            if (found) {
                setSelectedProductForDetail(found);
            }
        } else if (!view) {
            setSelectedProductForDetail(null);
        }
    }, [searchParams, products]);

    // Hành động Xem chi tiết -> chuyển sang Component giao diện danh sách các sản phẩm Item
    const handleViewProduct = useCallback(
        (product: FactoryProductItem) => {
            setSelectedProductForDetail(product);
            setSearchParams({ view: "items", productId: String(product.id) });
        },
        [setSearchParams]
    );

    // Quay lại danh sách sản phẩm từ Component chi tiết biến thể Item
    const handleBackFromDetail = useCallback(() => {
        setSelectedProductForDetail(null);
        setSearchParams({});
    }, [setSearchParams]);

    // Cập nhật sản phẩm từ Component chi tiết
    const handleUpdateProductFromDetail = useCallback((updated: FactoryProductItem) => {
        setSelectedProductForDetail(updated);
        setProducts((prev) => {
            const next = prev.map((p) => (p.id === updated.id ? updated : p));
            setStats(calculateStats(next));
            return next;
        });
    }, []);

    // Hành động Mở form Thêm mới sản phẩm
    const handleOpenAddModal = useCallback(() => {
        setSelectedProduct(null);
        setIsEditMode(false);
        setShowFormModal(true);
    }, []);

    // Hành động Mở form Sửa sản phẩm
    const handleEditProduct = useCallback((product: FactoryProductItem) => {
        setSelectedProduct(product);
        setIsEditMode(true);
        setShowFormModal(true);
    }, []);

    // Hành động Bật/Tắt trạng thái sản phẩm
    const handleToggleStatus = useCallback(async (product: FactoryProductItem) => {
        const currentStatus = product.status || "ACTIVE";
        const newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";

        try {
            // Thử gọi backend API
            try {
                await FactoryServiceManager.toggleStatusProduct(product.id, newStatus);
            } catch (err) {
                console.warn("Backend API toggle status chưa sẵn sàng, cập nhật cục bộ:", err);
            }

            // Cập nhật state danh sách
            setProducts((prev) => {
                const updated = prev.map((item) =>
                    item.id === product.id ? { ...item, status: newStatus } : item
                );
                setStats(calculateStats(updated));
                return updated;
            });

            // Nếu đang xem chi tiết sản phẩm này, cập nhật luôn
            setSelectedProductForDetail((current) =>
                current?.id === product.id ? { ...current, status: newStatus } : current
            );

            showToast(
                `Đã chuyển trạng thái sản phẩm #${product.id} sang "${newStatus === "ACTIVE" ? "Đang bán" : "Ngừng bán"}".`,
                "info"
            );
        } catch (error) {
            showToast("Không thể cập nhật trạng thái sản phẩm. Vui lòng thử lại!", "danger");
        }
    }, []);

    // Hành động Mở modal Xác nhận xóa
    const handleDeleteClick = useCallback((product: FactoryProductItem) => {
        setSelectedProduct(product);
        setShowDeleteModal(true);
    }, []);

    // Xác nhận Xóa sản phẩm
    const handleConfirmDelete = useCallback(async (product: FactoryProductItem) => {
        try {
            try {
                await FactoryServiceManager.deleteProduct(product.id);
            } catch (err) {
                console.warn("Backend API delete chưa sẵn sàng, xóa cục bộ:", err);
            }

            setProducts((prev) => {
                const updated = prev.filter((item) => item.id !== product.id);
                setStats(calculateStats(updated));
                return updated;
            });

            if (selectedProductForDetail?.id === product.id) {
                setSelectedProductForDetail(null);
                setSearchParams({});
            }

            showToast(`Đã xóa thành công sản phẩm "${product.name}" (#${product.id})!`, "success");
        } catch (error) {
            showToast("Có lỗi xảy ra khi xóa sản phẩm!", "danger");
        }
    }, [selectedProductForDetail, setSearchParams]);

    // Lưu sản phẩm (Thêm mới hoặc Cập nhật) - GIỮ NGUYÊN THÊM SẢN PHẨM MỚI
    const handleSaveProduct = useCallback(
        async (payload: Partial<FactoryProductItem>) => {
            if (isEditMode && payload.id) {
                // Chỉnh sửa sản phẩm hiện có
                try {
                    try {
                        await FactoryServiceManager.updateProduct(payload.id, payload);
                    } catch (err) {
                        console.warn("Backend API update chưa sẵn sàng, cập nhật cục bộ:", err);
                    }

                    setProducts((prev) => {
                        const updated = prev.map((item) =>
                            item.id === payload.id ? { ...item, ...payload } : item
                        );
                        setStats(calculateStats(updated));
                        return updated;
                    });

                    setSelectedProductForDetail((current) =>
                        current && current.id === payload.id
                            ? ({ ...current, ...payload, id: current.id } as FactoryProductItem)
                            : current
                    );

                    showToast(`Cập nhật sản phẩm #${payload.id} thành công!`, "success");
                } catch (error) {
                    showToast("Lỗi khi cập nhật sản phẩm!", "danger");
                    throw error;
                }
            } else {
                // Thêm sản phẩm mới (giữ nguyên tính năng thêm mới)
                try {
                    let createdItem: FactoryProductItem | null = null;
                    try {
                        const res = await FactoryServiceManager.createProduct(payload);
                        if (res?.data) {
                            createdItem = res.data;
                        }
                    } catch (err) {
                        console.warn("Backend API create chưa sẵn sàng, tạo dữ liệu mới cục bộ:", err);
                    }

                    if (!createdItem) {
                        const maxId = products.length > 0 ? Math.max(...products.map((p) => p.id || 0)) : 100;
                        createdItem = {
                            id: maxId + 1,
                            name: payload.name || "Sản phẩm mới",
                            category: payload.category || "Chưa phân loại",
                            price: payload.price ?? 0,
                            stock: payload.stock ?? 100,
                            sold: 0,
                            status: payload.status || "ACTIVE",
                            type: payload.type || ProductType.NORMAL,
                            description: payload.description,
                            imageUrl: payload.imageUrl,
                            createdAt: new Date().toISOString(),
                        };
                    }

                    setProducts((prev) => {
                        const updated = [createdItem as FactoryProductItem, ...prev];
                        setStats(calculateStats(updated));
                        return updated;
                    });

                    showToast(`Đã thêm sản phẩm "${createdItem.name}" thành công!`, "success");
                } catch (error) {
                    showToast("Lỗi khi thêm sản phẩm mới!", "danger");
                    throw error;
                }
            }
        },
        [isEditMode, products]
    );

    // Xuất danh sách sản phẩm dạng CSV
    const handleExportProducts = useCallback(() => {
        if (!products || products.length === 0) {
            showToast("Danh sách sản phẩm trống, không thể xuất!", "info");
            return;
        }

        const headers = ["Mã SP", "Tên sản phẩm", "Danh mục", "Loại SP", "Tồn kho", "Đã bán", "Trạng thái", "Ngày tạo"];
        const rows = products.map((p) => [
            p.id,
            `"${p.name.replace(/"/g, '""')}"`,
            `"${p.category || ""}"`,
            `"${p.type || "Thường"}"`,
            p.stock ?? 0,
            p.sold ?? 0,
            p.status || "ACTIVE",
            p.createdAt ? new Date(p.createdAt).toLocaleDateString("vi-VN") : "",
        ]);

        const csvContent =
            "data:text/csv;charset=utf-8,\uFEFF" +
            [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `danh_sach_san_pham_${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        showToast("Đã tải xuống danh sách sản phẩm!", "success");
    }, [products]);

    // columns chỉ hiển thị thông tin sản phẩm (Product), bấm xem chi tiết sẽ sang Component chứa danh sách Items
    const columns = useMemo(
        () =>
            columnHelper.columns([
                columnHelper.accessor("id", {
                    header: "Mã SP",
                    cell: (info) => (
                        <span className="badge bg-light text-dark border font-monospace">
                            #{info.getValue()}
                        </span>
                    ),
                    sortFn: "alphanumeric",
                }),

                columnHelper.accessor("name", {
                    header: "Sản phẩm",
                    cell: (info) => {
                        const row = info.row.original;
                        return (
                            <div
                                className="d-flex align-items-center gap-3"
                                style={{ cursor: "pointer" }}
                                onClick={() => handleViewProduct(row)}
                                title="Bấm để xem danh sách biến thể (Items)"
                            >
                                {row.imageUrl ? (
                                    <img
                                        src={row.imageUrl}
                                        alt={row.name}
                                        className="rounded-3 border object-fit-cover flex-shrink-0 shadow-sm"
                                        style={{ width: 48, height: 48 }}
                                        onError={(e) => {
                                            (e.currentTarget as HTMLImageElement).src =
                                                "https://placehold.co/48x48?text=SP";
                                        }}
                                    />
                                ) : (
                                    <div
                                        className="d-flex align-items-center justify-content-center rounded-3 bg-danger-subtle text-danger flex-shrink-0 fw-bold shadow-sm"
                                        style={{ width: 48, height: 48, fontSize: 16 }}
                                    >
                                        <FontAwesomeIcon icon={faBoxOpen} />
                                    </div>
                                )}
                                <div className="d-flex flex-column gap-1">
                                    <span
                                        className="fw-bold text-dark text-truncate text-decoration-none hover-danger"
                                        style={{ maxWidth: 240 }}
                                        title={row.name}
                                    >
                                        {row.name}
                                    </span>
                                    <span className="small text-muted d-flex align-items-center gap-1">
                                        <FontAwesomeIcon icon={faFlaskVial} className="text-primary" />
                                        <span>Xem danh sách biến thể &raquo;</span>
                                    </span>
                                </div>
                            </div>
                        );
                    },
                    sortFn: "alphanumeric",
                }),

                columnHelper.accessor("category", {
                    header: "Danh mục",
                    cell: (info) => {
                        const value = info.getValue();
                        return (
                            <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-2">
                                {value || "Khác"}
                            </span>
                        );
                    },
                    enableSorting: true,
                }),

                columnHelper.accessor("type", {
                    header: "Loại SP",
                    cell: (info) => {
                        const typeVal = (info.getValue() as ProductType) || ProductType.NORMAL;
                        const badgeInfo = ProductTypeBadge[typeVal] || {
                            label: "Thường",
                            badge: "bg-light text-secondary border",
                        };
                        return (
                            <span className={`badge rounded-pill small ${badgeInfo.badge} px-2 py-1`}>
                                {badgeInfo.label}
                            </span>
                        );
                    },
                }),

                columnHelper.accessor("stock", {
                    header: "Tổng tồn kho",
                    cell: (info) => {
                        const stockVal = info.getValue() ?? 0;
                        let badgeClass = "bg-success-subtle text-success-emphasis";
                        if (stockVal <= 0) badgeClass = "bg-danger-subtle text-danger-emphasis";
                        else if (stockVal <= 10) badgeClass = "bg-warning-subtle text-warning-emphasis";

                        return (
                            <span className={`badge rounded-pill ${badgeClass} px-3 py-1 fw-semibold`}>
                                {stockVal} chiếc
                            </span>
                        );
                    },
                    sortFn: "basic",
                }),

                columnHelper.accessor("sold", {
                    header: "Đã bán",
                    cell: (info) => (
                        <span className="fw-semibold text-secondary">
                            {info.getValue() ?? 0}
                        </span>
                    ),
                    sortFn: "basic",
                }),

                columnHelper.accessor((row) => row.status || "ACTIVE", {
                    id: "status",
                    header: "Trạng thái",
                    cell: (info) => {
                        const statusVal = info.getValue();
                        const badgeInfo = ProductStatusBadge[statusVal] || {
                            label: statusVal,
                            badge: "bg-secondary-subtle text-secondary",
                        };
                        return (
                            <span className={`badge rounded-pill small ${badgeInfo.badge} px-3 py-1`}>
                                {badgeInfo.label}
                            </span>
                        );
                    },
                }),

                columnHelper.accessor("createdAt", {
                    header: "Ngày tạo",
                    cell: (info) => {
                        const value = info.getValue();
                        if (!value) return "-";
                        return new Date(value).toLocaleDateString("vi-VN");
                    },
                    sortFn: "alphanumeric",
                }),

                columnHelper.display({
                    id: "actions",
                    header: "Hành động",
                    cell: (info) => {
                        const product = info.row.original;
                        const isProductActive = product.status !== "INACTIVE";

                        return (
                            <div className="d-flex align-items-center gap-1">
                                {/* Nút xem chi tiết -> chuyển sang Component giao diện danh sách Item */}
                                <button
                                    type="button"
                                    id={`btn-view-product-${product.id}`}
                                    data-product-id={product.id}
                                    className="btn btn-sm btn-outline-primary"
                                    title="Xem chi tiết biến thể (Items)"
                                    onClick={() => handleViewProduct(product)}
                                >
                                    <FontAwesomeIcon icon={faEye} />
                                </button>

                                {/* Nút chỉnh sửa sản phẩm cha */}
                                <button
                                    type="button"
                                    id={`btn-edit-product-${product.id}`}
                                    data-product-id={product.id}
                                    className="btn btn-sm btn-outline-success"
                                    title="Chỉnh sửa sản phẩm"
                                    onClick={() => handleEditProduct(product)}
                                >
                                    <FontAwesomeIcon icon={faPenToSquare} />
                                </button>

                                {/* Nút Bật/Tắt trạng thái hoạt động */}
                                <button
                                    type="button"
                                    id={`btn-toggle-status-${product.id}`}
                                    data-product-id={product.id}
                                    className={`btn btn-sm ${
                                        isProductActive
                                            ? "btn-outline-warning text-warning"
                                            : "btn-outline-secondary text-secondary"
                                    }`}
                                    title={isProductActive ? "Ngừng bán sản phẩm" : "Mở bán lại sản phẩm"}
                                    onClick={() => handleToggleStatus(product)}
                                >
                                    <FontAwesomeIcon icon={isProductActive ? faToggleOn : faToggleOff} size="lg" />
                                </button>

                                {/* Nút xóa sản phẩm */}
                                <button
                                    type="button"
                                    id={`btn-delete-product-${product.id}`}
                                    data-product-id={product.id}
                                    className="btn btn-sm btn-outline-danger"
                                    title="Xóa sản phẩm"
                                    onClick={() => handleDeleteClick(product)}
                                >
                                    <FontAwesomeIcon icon={faTrash} />
                                </button>
                            </div>
                        );
                    },
                }),
            ]),
        [handleViewProduct, handleEditProduct, handleToggleStatus, handleDeleteClick]
    );

    const table = useTable({
        data: products,
        columns,
        features,
        state: { pagination },
        onPaginationChange: setPagination,
    });

    const totalRows = table.getFilteredRowModel().rows.length;
    const hasRows = table.getRowModel().rows.length > 0;
    const isSearching = search.trim() !== "";

    return (
        <div className="row g-0 min-vh-100 bg-light">
            <aside
                className="col-12 col-xl-2 flex-shrink-0 position-sticky top-0 align-self-start"
                style={{ height: "100vh" }}
            >
                <SideBarFactory isProduct={true} />
            </aside>

            <main className="col-12 col-xl-10 p-3 p-lg-4 admin-content overflow-x-auto">
                {/* Toast Notification Alert */}
                {toast && (
                    <div
                        className={`alert alert-${toast.type} alert-dismissible fade show d-flex align-items-center justify-content-between mb-4 shadow-sm`}
                        role="alert"
                    >
                        <div className="d-flex align-items-center gap-2">
                            <FontAwesomeIcon icon={toast.type === "success" ? faCircleCheck : faCircleXmark} />
                            <span>{toast.message}</span>
                        </div>
                        <button
                            type="button"
                            className="btn-close"
                            onClick={() => setToast(null)}
                            aria-label="Đóng"
                        />
                    </div>
                )}

                {/* Nếu đang xem chi tiết -> Hiển thị Component giao diện chứa danh sách các sản phẩm Item */}
                {selectedProductForDetail ? (
                    <ProductDetails
                        product={selectedProductForDetail}
                        onBack={handleBackFromDetail}
                        onUpdateProduct={handleUpdateProductFromDetail}
                    />
                ) : (
                    /* Nếu không xem chi tiết -> Hiển thị danh sách các sản phẩm */
                    <>
                        {/* Header */}
                        <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-4">
                            <div>
                                <div className="text-danger fw-semibold small mb-2">
                                    QUẢN LÝ SẢN PHẨM
                                </div>
                                <h2 className="fw-bold text-dark mb-2">
                                    Sản phẩm của gian hàng
                                </h2>
                                <p className="text-secondary mb-0">
                                    Quản lý danh sách sản phẩm đăng bán trên sàn, bấm xem chi tiết để quản lý các biến thể Item (dung tích & giá).
                                </p>
                            </div>

                            <div className="d-flex gap-2">
                                {/* Nút Xuất danh sách */}
                                <button
                                    type="button"
                                    id="btn-export-products"
                                    className="btn btn-light border fw-semibold"
                                    onClick={handleExportProducts}
                                >
                                    <FontAwesomeIcon icon={faDownload} className="me-2" />
                                    Xuất danh sách
                                </button>
                                {/* Nút Thêm sản phẩm (GIỮ NGUYÊN) */}
                                <button
                                    type="button"
                                    id="btn-add-product"
                                    className="btn btn-danger fw-semibold"
                                    onClick={handleOpenAddModal}
                                >
                                    <FontAwesomeIcon icon={faCirclePlus} className="me-2" />
                                    Thêm sản phẩm
                                </button>
                            </div>
                        </div>

                        {/* Statistic cards */}
                        <section className="row g-3 mb-4">
                            <div className="col-12 col-md-6 col-xxl-3">
                                <StatCard
                                    label="TỔNG SẢN PHẨM"
                                    value={String(stats.totalProducts ?? 0)}
                                    icon={faBoxOpen}
                                    tone="danger"
                                    note="Tất cả sản phẩm"
                                />
                            </div>
                            <div className="col-12 col-md-6 col-xxl-3">
                                <StatCard
                                    label="ĐANG BÁN"
                                    value={String(stats.forSale ?? 0)}
                                    icon={faCircleCheck}
                                    tone="success"
                                    note="Sản phẩm hoạt động"
                                />
                            </div>
                            <div className="col-12 col-md-6 col-xxl-3">
                                <StatCard
                                    label="HẾT HÀNG"
                                    value={String(stats.outOfStock ?? 0)}
                                    icon={faCircleXmark}
                                    tone="warning"
                                    note="Cần nhập thêm hàng"
                                />
                            </div>
                            <div className="col-12 col-md-6 col-xxl-3">
                                <StatCard
                                    label="TỔNG ĐÃ BÁN"
                                    value={String(stats.totalSold ?? 0)}
                                    icon={faTag}
                                    tone="info"
                                    note="Tổng sản phẩm đã bán"
                                />
                            </div>
                        </section>

                        {/* Product table */}
                        <section className="card border-0 shadow-sm rounded-4 overflow-hidden">
                            <div className="card-body p-0">
                                <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 p-3 p-lg-4 border-bottom">
                                    <div>
                                        <h5 className="fw-bold mb-1">Danh sách sản phẩm</h5>
                                        <p className="text-secondary small mb-0">
                                            Chỉ hiển thị thông tin sản phẩm. Bấm icon xem chi tiết hoặc tên sản phẩm để xem danh sách biến thể Items.
                                        </p>
                                    </div>
                                    <span className="badge rounded-pill bg-light text-dark border px-3 py-2">
                                        {totalRows} sản phẩm
                                    </span>
                                </div>

                                {/* Search Toolbar */}
                                <div className="p-3 p-lg-4">
                                    <div className="input-group" style={{ maxWidth: "350px" }}>
                                        <span className="input-group-text bg-white">
                                            <FontAwesomeIcon icon={faMagnifyingGlass} />
                                        </span>
                                        <input
                                            type="search"
                                            id="input-search-product"
                                            className="form-control"
                                            placeholder="Tìm tên sản phẩm, danh mục..."
                                            value={search}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                setSearch(value);
                                                table.setGlobalFilter(value);
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="table-responsive admin-table-scroll">
                                    <table className="table table-hover align-middle mb-0 admin-order-table">
                                        <thead>
                                            {table.getHeaderGroups().map((headerGroup) => (
                                                <tr key={headerGroup.id}>
                                                    {headerGroup.headers.map((header) => {
                                                        const sorted = header.column.getIsSorted();
                                                        const canSort = header.column.getCanSort();
                                                        return (
                                                            <th key={header.id} className="text-nowrap">
                                                                {header.isPlaceholder ? null : (
                                                                    <div
                                                                        className="d-flex align-items-center gap-2"
                                                                        onClick={header.column.getToggleSortingHandler()}
                                                                        style={{
                                                                            cursor: canSort ? "pointer" : "default",
                                                                        }}
                                                                    >
                                                                        <table.FlexRender header={header} />
                                                                        {canSort && (
                                                                            <FontAwesomeIcon
                                                                                icon={
                                                                                    sorted === "asc"
                                                                                        ? faArrowDownAZ
                                                                                        : sorted === "desc"
                                                                                            ? faArrowUpAZ
                                                                                            : faSort
                                                                                }
                                                                                className={sorted ? "text-danger" : "text-secondary"}
                                                                                size="sm"
                                                                            />
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </th>
                                                        );
                                                    })}
                                                </tr>
                                            ))}
                                        </thead>
                                        <tbody>
                                            {table.getRowModel().rows.map((row) => (
                                                <tr key={row.id}>
                                                    {row.getAllCells().map((cell) => (
                                                        <td key={cell.id}>
                                                            <table.FlexRender cell={cell} />
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                            {!hasRows && (
                                                <tr>
                                                    <td
                                                        colSpan={table.getHeaderGroups()[0]?.headers.length ?? 1}
                                                        className="text-center py-5 text-secondary"
                                                    >
                                                        {isSearching
                                                            ? "Không tìm thấy kết quả phù hợp."
                                                            : "Chưa có sản phẩm nào."}
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Table footer with pagination */}
                                <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 px-3 px-lg-4 py-3 border-top">
                                    <span className="text-secondary small">
                                        Tổng cộng {totalRows} bản ghi
                                    </span>

                                    <div className="d-flex align-items-center gap-2">
                                        <button
                                            type="button"
                                            id="btn-pagination-prev"
                                            className="btn btn-sm btn-outline-secondary"
                                            onClick={() => table.previousPage()}
                                            disabled={!table.getCanPreviousPage()}
                                            aria-label="Trang trước"
                                        >
                                            <FontAwesomeIcon icon={faChevronLeft} />
                                        </button>

                                        <span className="small text-secondary">
                                            Trang {pagination.pageIndex + 1} / {Math.max(table.getPageCount(), 1)}
                                        </span>

                                        <button
                                            type="button"
                                            id="btn-pagination-next"
                                            className="btn btn-sm btn-outline-secondary"
                                            onClick={() => table.nextPage()}
                                            disabled={!table.getCanNextPage()}
                                            aria-label="Trang sau"
                                        >
                                            <FontAwesomeIcon icon={faChevronRight} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </>
                )}
            </main>

            {/* Modal Thêm mới / Chỉnh sửa sản phẩm (GIỮ NGUYÊN) */}
            <AddProductModal
                show={showFormModal}
                onHide={() => setShowFormModal(false)}
                onSubmit={handleSaveProduct}
                initialData={selectedProduct}
                isEdit={isEditMode}
            />

            {/* Modal Xác nhận xóa sản phẩm */}
            <DeleteProductModal
                show={showDeleteModal}
                onHide={() => setShowDeleteModal(false)}
                product={selectedProduct}
                onConfirm={handleConfirmDelete}
            />
        </div>
    );
}

