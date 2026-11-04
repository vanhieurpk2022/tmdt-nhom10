import { useCallback, useEffect, useMemo, useState } from "react";
import { createColumnHelper, useTable, type PaginationState } from "@tanstack/react-table";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faTag,
    faEye,
    faPenToSquare,
    faTrash,
    faFlask,
    faBoxOpen,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router";

import SideBarFactory from "../components/admin/factory/SideBarFactory";
import ProductOverview, { type FactoryProductTab } from "../components/admin/factory/ProductOverview";
import { ProductHeader } from "../components/admin/factory/ProductHeader";
import { BOTTLE_DESIGN_OPTIONS } from "../data/customScentData";
import AddProductModal from "../components/admin/factory/AddProductModal";
import { useToastContext } from "../components/toasts/ToastContext";
import { features } from "../components/table/features";
import { ProductType } from "../enums/ProductType";
import { ProductStatus } from "../enums/ProductStatus";
import { FactoryServiceManager } from "../api/factory/FactoryService";
import { ROUTES } from "../routes/routes";
import type {
    FactoryProductCreateRequest,
    FactoryProductEditRes,
    FactoryProductItem,
    FactoryProductStats,
} from "../dto/factory/FactoryProductRes";
import ConfirmDeleteModal from "../components/toasts/Confirmdeletemodal";

const PLACEHOLDER_IMG = "https://placehold.co/80x80";

export const ProductStatusBadge: Record<ProductStatus, { label: string; badge: string }> = {
    [ProductStatus.DRAFT]: { label: "Bản nháp", badge: "bg-warning-subtle text-warning-emphasis" },
    [ProductStatus.ACTIVE]: { label: "Đang bán", badge: "bg-success-subtle text-success-emphasis" },
    [ProductStatus.OUT_OF_STOCK]: { label: "Hết hàng", badge: "bg-danger-subtle text-danger-emphasis" },
    [ProductStatus.INACTIVE]: { label: "Ngừng bán", badge: "bg-secondary-subtle text-secondary-emphasis" },
    [ProductStatus.ARCHIVED]: { label: "Đã lưu trữ", badge: "bg-dark-subtle text-dark-emphasis" },
};

export const ProductTypeBadge: Record<ProductType, { label: string; badge: string }> = {
    [ProductType.CUSTOM]: { label: "Tùy chỉnh", badge: "bg-purple-subtle text-purple-emphasis border border-purple-subtle" },
    [ProductType.NORMAL]: { label: "Thường", badge: "bg-primary-subtle text-primary-emphasis" },
};

const columnHelper = createColumnHelper<typeof features, FactoryProductItem>();

export default function FactoryProductPage() {
    const navigate = useNavigate();
    const { showToast } = useToastContext();

    const [products, setProducts] = useState<FactoryProductItem[]>([]);
    const [stats, setStats] = useState<FactoryProductStats>({
        totalProducts: 0,
        forSale: 0,
        outOfStock: 0,
        totalSold: 0,
    });
    const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });

    // Tab quản lý sản phẩm: "NORMAL" (Tiêu chuẩn), "CUSTOM" (Phối hương) hoặc "DEFAULT_LABEL" (Nhãn chai mặc định)
    const [activeTab, setActiveTab] = useState<FactoryProductTab>("NORMAL");

    // Modal thêm / sửa
    const [stateModal, setStateModal] = useState(false);
    const [modalDefaultType, setModalDefaultType] = useState<ProductType>(ProductType.NORMAL);
    const [editing, setEditing] = useState<FactoryProductCreateRequest | FactoryProductEditRes | null>(null);

    // Modal xác nhận xóa
    const [deleteTarget, setDeleteTarget] = useState<FactoryProductItem | null>(null);
    const [deleting, setDeleting] = useState(false);

    /* ---------- Tải dữ liệu ---------- */
    const getProducts = useCallback(async () => {
        try {
            const res = await FactoryServiceManager.getProducts();
            if (res.status === 200) {
                setStats(res.data.stats);
                setProducts(res.data.products);
            }
        } catch (error) {
            console.log("Lỗi không tải được dữ liệu", error);
            showToast("Lỗi", "Không tải được danh sách sản phẩm", "danger");
        }
    }, [showToast]);

    useEffect(() => {
        getProducts();
    }, [getProducts]);

    /* ---------- Tách 2 danh sách sản phẩm ---------- */
    const normalProducts = useMemo(
        () => products.filter((p) => p.type !== ProductType.CUSTOM),
        [products]
    );

    const customProducts = useMemo(
        () => products.filter((p) => p.type === ProductType.CUSTOM),
        [products]
    );

    const currentProducts = useMemo(
        () => (activeTab === "CUSTOM" ? customProducts : normalProducts),
        [activeTab, normalProducts, customProducts]
    );

    /* ---------- Reset pagination khi đổi tab ---------- */
    const handleTabChange = (tab: FactoryProductTab) => {
        setActiveTab(tab);
        setPagination({ pageIndex: 0, pageSize: 10 });
    };

    /* ---------- Hành động ---------- */
    const handleView = useCallback(
        (id: number) => navigate(`${ROUTES.FACTORY_PRODUCT_DETAILS}/${id}`),
        [navigate]
    );

    const openAdd = (type?: ProductType) => {
        setEditing(null);
        setModalDefaultType(type || (activeTab === "CUSTOM" ? ProductType.CUSTOM : ProductType.NORMAL));
        setStateModal(true);
    };

    const handleEdit = useCallback(async (id: number) => {
        try {
            const res = await FactoryServiceManager.getProductEdit(id);
            setEditing(res.data);
            setStateModal(true);
        } catch (error) {
            console.log("Lỗi không tải được sản phẩm", error);
            showToast("Lỗi", "Không tải được thông tin sản phẩm", "danger");
        }
    }, [showToast]);

    const handleChangeStatus = useCallback(async (id: number, status: ProductStatus) => {
        try {
            await FactoryServiceManager.changeStatusOfProduct(id, status);
            showToast("Thành công", "Đã cập nhật trạng thái sản phẩm.", "success");
        } catch (error) {
            console.log("Lỗi đổi trạng thái", error);
            showToast("Lỗi", "Không đổi được trạng thái sản phẩm", "danger");
        } finally {
            getProducts();
        }
    }, [getProducts, showToast]);

    const confirmDelete = async () => {
        if (!deleteTarget) return;
        try {
            setDeleting(true);
            await FactoryServiceManager.deleteProduct(deleteTarget.id);
            showToast("Thành công", "Đã xóa sản phẩm thành công.", "success");
            setDeleteTarget(null);
            getProducts();
        } catch (error) {
            console.log("Lỗi không xóa được sản phẩm", error);
            showToast("Lỗi", "Không xóa được sản phẩm", "danger");
        } finally {
            setDeleting(false);
        }
    };

    /* ---------- Xuất file CSV danh sách sản phẩm ---------- */
    const handleExportCsv = () => {
        if (activeTab === "DEFAULT_LABEL") {
            const headers = ["ID", "Tên mẫu nhãn", "Mã thiết kế", "Kiểu chai", "Chất liệu vỏ", "Nắp chai", "Phong cách nhãn", "Phụ phí"];
            const rows = BOTTLE_DESIGN_OPTIONS.map((b) => [
                `"${b.id}"`,
                `"${b.title.replace(/"/g, '""')}"`,
                `"${b.styleCode}"`,
                `"${b.bottleShape}"`,
                `"${b.glassStyle}"`,
                `"${b.capStyle}"`,
                `"${b.labelStyle}"`,
                b.extraPrice,
            ]);

            const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
            const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute(
                "download",
                `nhan_chai_mac_dinh_${new Date().toISOString().slice(0, 10)}.csv`
            );
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            showToast("Thành công", "Đã xuất file danh sách nhãn chai mặc định.", "success");
            return;
        }

        const listToExport = currentProducts;
        if (listToExport.length === 0) {
            showToast("Thông báo", "Không có sản phẩm nào để xuất file.", "info");
            return;
        }

        const headers = ["Mã SP", "Tên sản phẩm", "Loại", "Danh mục", "Tồn kho", "Đã bán", "Trạng thái", "Ngày tạo"];
        const rows = listToExport.map((p) => [
            `"${p.id}"`,
            `"${p.name.replace(/"/g, '""')}"`,
            `"${p.type === ProductType.CUSTOM ? "Custom" : "Tiêu chuẩn"}"`,
            `"${p.category || ""}"`,
            p.stock || 0,
            p.sold || 0,
            `"${p.status ? ProductStatusBadge[p.status]?.label : ""}"`,
            `"${p.createdAt ? new Date(p.createdAt).toLocaleDateString("vi-VN") : ""}"`,
        ]);

        const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute(
            "download",
            `san_pham_${activeTab.toLowerCase()}_${new Date().toISOString().slice(0, 10)}.csv`
        );
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast("Thành công", "Đã xuất file danh sách sản phẩm thành công.", "success");
    };

    /* ---------- Cột bảng cấu hình động ---------- */
    const columns = useMemo(
        () =>
            columnHelper.columns([
                columnHelper.accessor("id", {
                    header: "Mã SP",
                    cell: (info) => <span className="fw-semibold text-secondary">#{info.getValue()}</span>,
                    sortFn: "basic",
                }),

                columnHelper.accessor("name", {
                    header: activeTab === "CUSTOM" ? "Sản phẩm Phối Hương" : "Sản phẩm",
                    cell: (info) => {
                        const row = info.row.original;
                        const isCustom = row.type === ProductType.CUSTOM;

                        return (
                            <div className="d-flex align-items-center gap-3">
                                {!isCustom && (
                                    <img
                                        src={row.thumbnailUrl || PLACEHOLDER_IMG}
                                        alt={row.name}
                                        width={48}
                                        height={48}
                                        className="rounded-3 border flex-shrink-0 shadow-sm"
                                        style={{ objectFit: "cover" }}
                                    />
                                )}
                                <div style={{ minWidth: 0 }}>
                                    <div className="fw-bold text-dark text-truncate" style={{ maxWidth: 320 }}>
                                        {row.name}
                                    </div>
                                    <div className="d-flex align-items-center flex-wrap gap-2 mt-1">
                                        <span className="small text-muted">
                                            <FontAwesomeIcon icon={faTag} className="me-1" />
                                            {row.category}
                                        </span>
                                        {isCustom ? (
                                            <span
                                                className="badge rounded-pill bg-purple-subtle text-purple-emphasis border border-purple-subtle fw-semibold"
                                                style={{ fontSize: "11px" }}
                                            >
                                                <FontAwesomeIcon icon={faFlask} className="me-1" />
                                                Phối hương riêng
                                            </span>
                                        ) : (
                                            <span
                                                className="badge rounded-pill bg-primary-subtle text-primary fw-semibold"
                                                style={{ fontSize: "11px" }}
                                            >
                                                <FontAwesomeIcon icon={faBoxOpen} className="me-1" />
                                                Tiêu chuẩn
                                            </span>
                                        )}
                                    </div>

                                    {/* Hiển thị tóm tắt nốt hương công thức nếu là sản phẩm Custom */}
                                    {isCustom && row.components && row.components.length > 0 && (
                                        <div className="d-flex flex-wrap gap-1 mt-2">
                                            {row.components.slice(0, 3).map((comp, cIdx) => (
                                                <span
                                                    key={cIdx}
                                                    className="badge bg-light text-dark border small"
                                                    style={{ fontSize: "10px", fontWeight: 500 }}
                                                >
                                                    {comp.productName}: {comp.percentage}%
                                                </span>
                                            ))}
                                            {row.components.length > 3 && (
                                                <span className="badge bg-light text-muted border small" style={{ fontSize: "10px" }}>
                                                    +{row.components.length - 3} nốt hương
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    },
                    sortFn: "alphanumeric",
                }),

                columnHelper.accessor("stock", {
                    header: "Tồn kho / Khả dụng",
                    cell: (info) => {
                        const value = info.getValue();
                        const isCustom = info.row.original.type === "CUSTOM";
                        return value === 0 ? (
                            <div className="d-flex flex-column align-items-start gap-1">
                                <span className="badge bg-danger-subtle text-danger-emphasis fw-bold">Hết hàng</span>
                                {isCustom && (
                                    <span className="text-secondary small" style={{ fontSize: "0.72rem" }}>
                                        (Min thành phần: 0)
                                    </span>
                                )}
                            </div>
                        ) : (
                            <div className="d-flex flex-column align-items-start">
                                <span className="fw-semibold text-dark">{value} chai</span>
                                {isCustom && (
                                    <span className="text-secondary small" style={{ fontSize: "0.72rem" }}>
                                        (Min thành phần)
                                    </span>
                                )}
                            </div>
                        );
                    },
                    sortFn: "basic",
                }),

                columnHelper.accessor("sold", {
                    header: "Đã bán",
                    cell: (info) => <span className="fw-bold text-dark">{info.getValue() || 0}</span>,
                    sortFn: "basic",
                }),

                columnHelper.accessor("status", {
                    header: "Trạng thái",
                    cell: (info) => {
                        const value = info.getValue();
                        const product = info.row.original;
                        const conf = value ? ProductStatusBadge[value] : undefined;

                        const options = Object.values(ProductStatus).filter(
                            (s) => s !== ProductStatus.OUT_OF_STOCK || s === value
                        );

                        return (
                            <select
                                className={`form-select form-select-sm fw-semibold rounded-3 ${conf?.badge ?? "border"}`}
                                style={{ minWidth: 130 }}
                                value={value ?? ""}
                                onChange={(e) => handleChangeStatus(product.id, e.target.value as ProductStatus)}
                                aria-label={`Trạng thái sản phẩm #${product.id}`}
                            >
                                {!value && <option value="" disabled>Không xác định</option>}
                                {options.map((status) => (
                                    <option key={status} value={status}>
                                        {ProductStatusBadge[status].label}
                                    </option>
                                ))}
                            </select>
                        );
                    },
                    sortFn: "basic",
                }),

                columnHelper.accessor("createdAt", {
                    header: "Ngày tạo",
                    cell: (info) => (
                        <span className="text-secondary small">
                            {new Date(info.getValue()).toLocaleDateString("vi-VN")}
                        </span>
                    ),
                    sortFn: "basic",
                }),

                columnHelper.display({
                    id: "actions",
                    header: "Hành động",
                    cell: (info) => {
                        const product = info.row.original;

                        return (
                            <div className="d-flex align-items-center justify-content-center gap-1">
                                <button
                                    type="button"
                                    className="btn btn-sm btn-outline-primary rounded-2"
                                    title="Xem chi tiết & dung tích"
                                    onClick={() => handleView(product.id)}
                                >
                                    <FontAwesomeIcon icon={faEye} />
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-sm btn-outline-success rounded-2"
                                    title="Chỉnh sửa thông tin"
                                    onClick={() => handleEdit(product.id)}
                                >
                                    <FontAwesomeIcon icon={faPenToSquare} />
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-sm btn-outline-danger rounded-2"
                                    title="Xóa sản phẩm"
                                    onClick={() => setDeleteTarget(product)}
                                >
                                    <FontAwesomeIcon icon={faTrash} />
                                </button>
                            </div>
                        );
                    },
                }),
            ]),
        [activeTab, handleView, handleEdit, handleChangeStatus]
    );

    const table = useTable({
        data: currentProducts,
        columns,
        features,
        state: { pagination },
        onPaginationChange: setPagination,
    });

    return (
        <div className="row g-0 min-vh-100 bg-light">
            {/* Sidebar */}
            <aside
                className="col-12 col-xl-2 flex-shrink-0 position-sticky top-0 align-self-start"
                style={{ height: "100vh" }}
            >
                <SideBarFactory isProduct />
            </aside>

            {/* Nội dung chính */}
            <main className="col-12 col-xl-10 admin-content overflow-x-auto">
                <div className="p-3 p-lg-4 d-flex flex-column gap-4">
                    <ProductHeader
                        stats={stats}
                    />

                    <ProductOverview
                        pageIndex={pagination.pageIndex}
                        table={table}
                        activeTab={activeTab}
                        onTabChange={handleTabChange}
                        normalCount={normalProducts.length}
                        customCount={customProducts.length}
                        defaultLabelCount={BOTTLE_DESIGN_OPTIONS.length}
                        onProduct={openAdd}
                        onExportCsv={handleExportCsv}
                    />
                </div>
            </main>

            <AddProductModal
                product={editing}
                defaultType={modalDefaultType}
                availableProducts={products}
                show={stateModal}
                onHide={() => setStateModal(false)}
                onSuccess={getProducts}
            />

            <ConfirmDeleteModal
                show={deleteTarget !== null}
                itemName={deleteTarget?.name}
                loading={deleting}
                onConfirm={confirmDelete}
                onHide={() => setDeleteTarget(null)}
            />
        </div>
    );
}
