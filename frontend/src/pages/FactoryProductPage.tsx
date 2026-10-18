import { useCallback, useEffect, useMemo, useState } from "react";
import { createColumnHelper, useTable, type PaginationState } from "@tanstack/react-table";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faTag,
    faEye,
    faPenToSquare,
    faTrash,
    faToggleOn,
    faToggleOff,
} from "@fortawesome/free-solid-svg-icons";

import SideBarFactory from "../components/admin/factory/SideBarFactory";
import CustomBadge from "../components/admin/badge/CustomBadge";
import { features } from "../components/table/features";
import { ProductType } from "../enums/ProductType";
import type { FactoryProductItem, FactoryProductStats } from "../dto/factory/FactoryProductRes";
import { FactoryServiceManager } from "../api/factory/FactoryService";
import ProductOverview from "../components/admin/factory/ProductOverview";
import { ProductStatus } from "../enums/ProductStatus";
import { useNavigate } from "react-router";
import { ROUTES } from "../routes/routes";

const ProductStatusBadge: Record<ProductStatus, { label: string; badge: string }> = {
    [ProductStatus.ACTIVE]: {
        label: "Đang bán",
        badge: "bg-success-subtle text-success-emphasis",
    },
    [ProductStatus.INACTIVE]: {
        label: "Ngừng bán",
        badge: "bg-secondary-subtle text-secondary-emphasis",
    },
    [ProductStatus.OUT_OF_STOCK]: {
        label: "Hết Hàng",
        badge: "bg-success-subtle text-success-emphasis",
    },
    [ProductStatus.ARCHIVED]: {
        label: "Đã lưu trữ",
        badge: "bg-secondary-subtle text-secondary-emphasis",
    },
    [ProductStatus.DRAFT]: {
        label: "Thử nghiệm",
        badge: "bg-secondary-subtle text-secondary-emphasis",
    },
};

const ProductTypeBadge: Record<ProductType, { label: string; badge: string }> = {
    [ProductType.CUSTOM]: {
        label: "Tùy chỉnh",
        badge: "bg-purple-subtle text-purple-emphasis",
    },
    [ProductType.NORMAL]: {
        label: "Thường",
        badge: "bg-primary-subtle text-primary-emphasis",
    },
};

// Đặt NGOÀI component vì không phụ thuộc state
const columnHelper = createColumnHelper<typeof features, FactoryProductItem>();


export default function FactoryProductPage() {
    const [products, setProducts] = useState<FactoryProductItem[]>([]);
    const navigate = useNavigate();
    const handleView = useCallback((id: number) => {
        navigate(`${ROUTES.FACTORY_PRODUCT_DETAILS}/${id}`);
    }, [navigate]);

    // columns phải khai báo TRƯỚC useTable
    const columns = useMemo(
        () =>
            columnHelper.columns([
                columnHelper.accessor("id", {
                    header: "Mã SP",
                    cell: info => <b>#{info.getValue()}</b>,
                    sortFn: "alphanumeric",
                }),

                columnHelper.accessor("name", {
                    header: "Sản phẩm",
                    cell: info => {
                        const row = info.row.original;
                        const conf = row.type ? ProductTypeBadge[row.type] : undefined;

                        return (
                            <div className="d-flex flex-column gap-1">
                                <span className="fw-semibold text-dark">{row.name}</span>

                                <div className="d-flex align-items-center gap-2">
                                    <span className="small text-muted">
                                        <FontAwesomeIcon icon={faTag} className="me-1" />
                                        {row.category}
                                    </span>
                                    {conf && <CustomBadge label={conf.label} badge={conf.badge} />}
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
                        return (
                            <span className={value === 0 ? "fw-bold text-danger" : ""}>
                                {value === 0 ? "Hết hàng" : value}
                            </span>
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
                        if (!value) return <CustomBadge label="Không xác định" badge="bg-danger" />;

                        const conf = ProductStatusBadge[value];
                        return (
                            <CustomBadge
                                label={conf.label}
                                badge={conf.badge}
                            />
                        );
                    },
                    enableSorting: false,
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
                        const isActive = product.status === "ACTIVE";

                        return (
                            <div className="d-flex align-items-center gap-2">
                                <button type="button" className="btn btn-sm btn-outline-primary" title="Xem chi tiết" onClick={() => handleView(product.id)} >
                                    <FontAwesomeIcon icon={faEye} />
                                </button>
                                <button type="button" className="btn btn-sm btn-outline-success" title="Chỉnh sửa">
                                    <FontAwesomeIcon icon={faPenToSquare} />
                                </button>
                                <button
                                    type="button"
                                    className={`btn btn-sm ${isActive ? "btn-outline-warning" : "btn-outline-info"}`}
                                    title={isActive ? "Ẩn sản phẩm" : "Hiện sản phẩm"}
                                >
                                    <FontAwesomeIcon icon={isActive ? faToggleOff : faToggleOn} />
                                </button>
                                <button type="button" className="btn btn-sm btn-outline-danger" title="Xóa">
                                    <FontAwesomeIcon icon={faTrash} />
                                </button>
                            </div>
                        );
                    },
                }),
            ]),
        []
    );
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });
    const [stats, setStats] = useState<FactoryProductStats>({
        totalProducts: 0,
        forSale: 0,
        outOfStock: 0,
        totalSold: 0,
    });

    const getProducts = useCallback(async () => {
        try {
            // TODO: đổi tên hàm cho đúng với service của bạn
            const res = await FactoryServiceManager.getProducts();
            if (res.status === 200) {
                setStats(res.data.stats);
                setProducts(res.data.products);
            }
        } catch (error) {
            console.log("Lỗi không tải được dữ liệu", error);
        }
    }, []);

    useEffect(() => {
        getProducts();
    }, [getProducts]);


    const table = useTable({
        data: products,
        columns,
        features,
        state: { pagination },
        onPaginationChange: setPagination,
    });

    return (
        <div className="row g-0 min-vh-100 bg-light">
            {/* Sidebar Xưởng */}
            <aside
                className="col-12 col-xl-2 flex-shrink-0 position-sticky top-0 align-self-start"
                style={{ height: "100vh" }}
            >
                <SideBarFactory isProduct={true} />
            </aside>

            {/* Nội dung chính */}
            <div className="col-12 col-xl-10 admin-content overflow-x-auto">
                <ProductOverview
                    pageIndex={pagination.pageIndex}
                    table={table}
                    stats={stats}
                    onReload={getProducts}
                />
            </div>
        </div>
    );
}