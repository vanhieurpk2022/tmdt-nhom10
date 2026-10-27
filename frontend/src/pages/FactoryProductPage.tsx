import { useCallback, useEffect, useMemo, useState } from "react";
import { createColumnHelper, useTable, type PaginationState } from "@tanstack/react-table";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTag, faEye, faPenToSquare, faTrash } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router";

import SideBarFactory from "../components/admin/factory/SideBarFactory";
import CustomBadge from "../components/admin/badge/CustomBadge";
import ProductOverview from "../components/admin/factory/ProductOverview";
import { ProductHeader } from "../components/admin/factory/ProductHeader";
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

// Đặt NGOÀI component vì không phụ thuộc state
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

    // Modal thêm / sửa
    const [stateModal, setStateModal] = useState(false);
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

    /* ---------- Hành động ---------- */
    const handleView = useCallback(
        (id: number) => navigate(`${ROUTES.FACTORY_PRODUCT_DETAILS}/${id}`),
        [navigate]
    );

    const openAdd = () => {
        setEditing(null);
        setStateModal(true);
    };

    const handleEdit = useCallback(async (id: number) => {
        try {
            const res = await FactoryServiceManager.getProductEdit(id);
            // Nếu service đã bóc `.data` (return res.data.data) thì đổi thành setEditing(res)
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
            showToast("Thành công", "Đã cập nhật trạng thái", "success");
        } catch (error) {
            console.log("Lỗi đổi trạng thái", error);
            showToast("Lỗi", "Không đổi được trạng thái", "danger");
        } finally {
            getProducts(); // luôn tải lại: thành công thì cập nhật, lỗi thì select trở về giá trị cũ
        }
    }, [getProducts, showToast]);

    const confirmDelete = async () => {
        if (!deleteTarget) return;
        try {
            setDeleting(true);
            await FactoryServiceManager.deleteProduct(deleteTarget.id);
            showToast("Thành công", "Xóa sản phẩm thành công", "success");
            setDeleteTarget(null);
            getProducts(); // cập nhật cả bảng lẫn thẻ thống kê
        } catch (error) {
            console.log("Lỗi không xóa được sản phẩm", error);
            showToast("Lỗi", "Không xóa được sản phẩm", "danger");
        } finally {
            setDeleting(false);
        }
    };

    /* ---------- Cột bảng ---------- */
    const columns = useMemo(
        () =>
            columnHelper.columns([
                columnHelper.accessor("id", {
                    header: "Mã SP",
                    cell: info => <span className="fw-semibold text-secondary">#{info.getValue()}</span>,
                    sortFn: "basic",
                }),

                columnHelper.accessor("name", {
                    header: "Sản phẩm",
                    cell: info => {
                        const row = info.row.original;
                        const conf = row.type ? ProductTypeBadge[row.type] : undefined;

                        return (
                            <div className="d-flex align-items-center gap-3">
                                <img
                                    src={row.thumbnailUrl || PLACEHOLDER_IMG}
                                    alt={row.name}
                                    width={48}
                                    height={48}
                                    className="rounded border flex-shrink-0"
                                    style={{ objectFit: "cover" }}
                                />
                                <div style={{ minWidth: 0 }}>
                                    <div className="fw-semibold text-dark text-truncate" style={{ maxWidth: 280 }}>
                                        {row.name}
                                    </div>
                                    <div className="d-flex align-items-center gap-2 mt-1">
                                        <span className="small text-muted">
                                            <FontAwesomeIcon icon={faTag} className="me-1" />
                                            {row.category}
                                        </span>
                                        {conf && <CustomBadge label={conf.label} badge={conf.badge} />}
                                    </div>
                                </div>
                            </div>
                        );
                    },
                    sortFn: "alphanumeric",
                }),

                columnHelper.accessor("stock", {
                    header: "Tồn kho",
                    cell: info => {
                        const value = info.getValue();
                        return value === 0 ? (
                            <span className="fw-semibold text-danger">Hết hàng</span>
                        ) : (
                            <span>{value}</span>
                        );
                    },
                    sortFn: "basic",
                }),

                columnHelper.accessor("sold", {
                    header: "Đã bán",
                    cell: info => info.getValue(),
                    sortFn: "basic",
                }),

                columnHelper.accessor("status", {
                    header: "Trạng thái",
                    cell: info => {
                        const value = info.getValue();
                        const product = info.row.original;
                        const conf = value ? ProductStatusBadge[value] : undefined;

                        // OUT_OF_STOCK do hệ thống tự đặt: chỉ hiện khi sản phẩm đang ở trạng thái đó
                        const options = Object.values(ProductStatus).filter(
                            s => s !== ProductStatus.OUT_OF_STOCK || s === value
                        );

                        return (
                            <select
                                className={`form-select form-select-sm fw-semibold border-0 ${conf?.badge ?? ""}`}
                                style={{ minWidth: 130 }}
                                value={value ?? ""}
                                onChange={e => handleChangeStatus(product.id, e.target.value as ProductStatus)}
                                aria-label={`Trạng thái sản phẩm #${product.id}`}
                            >
                                {!value && <option value="" disabled>Không xác định</option>}
                                {options.map(status => (
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
                    cell: info => new Date(info.getValue()).toLocaleDateString("vi-VN"),
                    sortFn: "basic",
                }),

                columnHelper.display({
                    id: "actions",
                    header: "Hành động",
                    cell: info => {
                        const product = info.row.original;

                        return (
                            <div className="d-flex align-items-center gap-1">
                                <button
                                    type="button"
                                    className="btn btn-sm btn-outline-primary"
                                    title="Xem chi tiết"
                                    onClick={() => handleView(product.id)}
                                >
                                    <FontAwesomeIcon icon={faEye} />
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-sm btn-outline-success"
                                    title="Chỉnh sửa"
                                    onClick={() => handleEdit(product.id)}
                                >
                                    <FontAwesomeIcon icon={faPenToSquare} />
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-sm btn-outline-danger"
                                    title="Xóa"
                                    onClick={() => setDeleteTarget(product)}
                                >
                                    <FontAwesomeIcon icon={faTrash} />
                                </button>
                            </div>
                        );
                    },
                }),
            ]),
        [handleView, handleEdit, handleChangeStatus]
    );

    const table = useTable({
        data: products,
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
                    <ProductHeader onProduct={openAdd} stats={stats} />
                    <ProductOverview pageIndex={pagination.pageIndex} table={table} />
                </div>
            </main>

            <AddProductModal
                product={editing}
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