
import SideBarFactory from "../SideBarFactory";
import { VariantHeader } from "./VariantHeader";
import { useParams } from "react-router";
import { useCallback, useEffect, useState } from "react";
import { createColumnHelper, useTable, type PaginationState } from "@tanstack/react-table";
import { features } from "../../../table/features";
import type { EditableVariant, FactoryProductEditRes, FactoryProductVariantItem } from "../../../../dto/factory/FactoryProductRes";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare, faToggleOff, faToggleOn, faTrash } from "@fortawesome/free-solid-svg-icons";
import CustomBadge from "../../badge/CustomBadge";
import { VariantTable } from "./VariantTable";
import { FactoryServiceManager } from "../../../../api/factory/FactoryService";
import { formatVnd } from "../../../format/FormatMoney";
import { ModalAddVariant } from "./ModalAddVariant";
import { ProductType } from "../../../../enums/ProductType";
import { CustomProductRecipeConfig } from "./CustomProductRecipeConfig";
import { ProductStatus } from "../../../../enums/ProductStatus";
import { useToastContext } from "../../../toasts/ToastContext";
import axios from "axios";


const columnHelper = createColumnHelper<typeof features, FactoryProductVariantItem>();


export function FactoryProductDetails() {
    const { id } = useParams<{ id: string }>();
    const productId = Number(id);

    const [showAddModal, setShowAddModal] = useState(false);
    const [editingVariant, setEditingVariant] = useState<EditableVariant | null>(null);
    const [publishing, setPublishing] = useState(false);
    const { showToast } = useToastContext();

    const [productInfo, setProductInfo] = useState<FactoryProductEditRes | null>(null);
    const [, setLoadingInfo] = useState(false);

    const fetchProductInfo = useCallback(async () => {
        try {
            setLoadingInfo(true);
            const res = await FactoryServiceManager.getProductEdit(productId);
            if (res.status === 200 && res.data) {
                setProductInfo(res.data);
            }
        } catch (error) {
            console.error("Lỗi lấy thông tin sản phẩm", error);
        } finally {
            setLoadingInfo(false);
        }
    }, [productId]);

    const openAdd = () => {
        setEditingVariant(null);
        setShowAddModal(true);
    };

    const openEdit = (v: EditableVariant) => {
        setEditingVariant(v);
        setShowAddModal(true);
    };

    const [variant, setVariant] = useState<FactoryProductVariantItem[]>([]);
    const configuredVariants = variant.filter(v => v.isActive && v.mil > 0 && v.stockQuantity >= 0
        && Number.isFinite(v.basePrice ?? v.price) && (v.basePrice ?? v.price) > 0);
    const readyToPublish = configuredVariants.some(v => v.stockQuantity > 0);
    const isPublished = productInfo?.status === ProductStatus.ACTIVE && configuredVariants.length > 0;
    const publishProduct = async () => {
        if (publishing || !readyToPublish) return;
        try {
            setPublishing(true);
            await FactoryServiceManager.changeStatusOfProduct(productId, ProductStatus.ACTIVE);
            await fetchProductInfo();
            showToast("Đã mở bán", "Sản phẩm đã có thể hiển thị trên trang chủ và danh sách sản phẩm.", "success");
        } catch (error) {
            showToast("Chưa thể mở bán", axios.isAxiosError(error)
                ? error.response?.data?.message ?? "Vui lòng thử lại."
                : "Vui lòng thử lại.", "danger");
        } finally {
            setPublishing(false);
        }
    };
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });

    const getVariant = useCallback(async () => {
        try {
            const res = await FactoryServiceManager.getProductMils(productId);
            if (res.status === 200) {
                setVariant(res.data);
            }
        } catch {
            console.log("Lỗi getVariant");
        }
    }, [productId]);

    const handleActive = useCallback(async (id: number) => {
        const target = variant.find(v => v.id === id);
        if (!target) return;
        try {
            await FactoryServiceManager.toggleStatusProductMil(productId, id, !target.isActive);
            await getVariant();
        } catch {
            showToast("Lỗi", "Không đổi được trạng thái biến thể. Vui lòng thử lại.", "danger");
        }
    }, [variant, productId, getVariant, showToast]);

    const handleDelete = useCallback(async (id: number) => {
        try {
            await FactoryServiceManager.deleteProductMil(id);
            setVariant(prev => prev.filter(v => v.id !== id));
        } catch {
            console.log("Lỗi Xóa Variant");
        }
    }, []);

    useEffect(() => {
        getVariant();
        fetchProductInfo();
    }, [getVariant, fetchProductInfo]);
    const columns = columnHelper.columns([
                columnHelper.accessor("id", {
                    header: "Mã SP",
                    cell: info => <b>#{info.getValue()}</b>,
                    sortFn: "alphanumeric",
                }),

                columnHelper.accessor("mil", {
                    header: "Sản phẩm",
                    cell: info => {
                        const row = info.row.original;

                        return (
                            <div className="d-flex flex-column gap-1">
                                <span className="fw-semibold text-dark">{row.productName} - {row.mil} mil</span>
                            </div>
                        );
                    },
                    sortFn: "alphanumeric",
                }),

                columnHelper.accessor("basePrice", {
                    header: "Giá niêm yết",
                    cell: info => {
                        const value = info.getValue();
                        if (!value) return <span>Không xác định</span>
                        return (
                            <span >
                                {formatVnd(value)}
                            </span>
                        );
                    },
                    sortFn: "basic",
                }),

                columnHelper.accessor("price", {
                    header: "Giá bán",
                    cell: info => {
                        const value = info.getValue();
                        if (!value) return <span>Không xác định</span>
                        return (
                            <span >
                                {formatVnd(value)}
                            </span>
                        );
                    },
                    sortFn: "basic",
                }),
                columnHelper.accessor("stockQuantity", {
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

                columnHelper.accessor("isActive", {
                    header: "Trạng thái",
                    cell: info => {
                        const { stockQuantity, isActive } = info.row.original;

                        if (!isActive) {
                            return <CustomBadge label="Ngừng bán" badge="bg-danger" />
                        }

                        if (stockQuantity <= 0) {
                            return <CustomBadge label="Hết hàng" badge="bg-warning" />
                        }

                        return <CustomBadge label="Đang bán" badge="bg-success" />
                    },
                    sortFn: "basic",
                }),

                columnHelper.display({
                    id: "actions",
                    header: "Hành động",
                    cell: info => {
                        const product = info.row.original;
                        const isActive = product.isActive === true;

                        return (
                            <div className="d-flex align-items-center gap-2">
                                <button type="button" className="btn btn-sm btn-outline-success" title="Chỉnh sửa"
                                    onClick={() => {
                                        openEdit({
                                            id: product.id,
                                            mil: product.mil,
                                            basePrice: product.basePrice ?? 0,
                                            price: product.price,
                                            stockQuantity: product.stockQuantity,
                                        })
                                    }}>
                                    <FontAwesomeIcon icon={faPenToSquare} />
                                </button>
                                <button
                                    type="button"
                                    className={`btn btn-sm ${isActive ? "btn-outline-warning" : "btn-outline-info"}`}
                                    title={isActive ? "Ẩn sản phẩm" : "Hiện sản phẩm"}
                                    onClick={() => { handleActive(product.id) }}
                                >
                                    <FontAwesomeIcon icon={isActive ? faToggleOff : faToggleOn} />
                                </button>
                                <button type="button" className="btn btn-sm btn-outline-danger" title="Xóa"
                                    onClick={() => { handleDelete(product.id) }}
                                >
                                    <FontAwesomeIcon icon={faTrash} />

                                </button>
                            </div>
                        );
                    },
                }),
            ]);


    const table = useTable({
        data: variant,
        columns,
        features,
        state: { pagination },
        onPaginationChange: setPagination,
    });

    return (
        <div className="row g-0 min-vh-100 bg-light">

            {/* SIDEBAR */}
            <aside
                className="col-12 col-xl-2 flex-shrink-0 position-sticky top-0 align-self-start"
                style={{ height: "100vh" }}
            >
                <SideBarFactory isProduct={true} />
            </aside>
            <ModalAddVariant variant={editingVariant} onSuccess={getVariant} productId={productId} show={showAddModal} onHide={() => setShowAddModal(false)} />

            {/* CONTENT */}
            <main className="col-12 col-xl-10 p-3 p-lg-4">

                <VariantHeader
                    onVariants={openAdd}
                    productId={productId}
                    isCustom={productInfo?.type === ProductType.CUSTOM}
                    productName={productInfo?.name}
                />

                {productInfo && productInfo.type !== ProductType.CUSTOM && (
                    <div className="border rounded-3 bg-white p-3 mb-4 d-flex flex-wrap align-items-center justify-content-between gap-3">
                        <div>
                            <div className="fw-semibold mb-1">
                                {isPublished ? "Sản phẩm đang mở bán" : "Sản phẩm chưa công khai"}
                            </div>
                            <div className="small text-secondary">
                                {isPublished
                                    ? "Giữ ít nhất một biến thể đang bật với dung tích và giá hợp lệ để sản phẩm được hiển thị."
                                    : "Thêm biến thể, giá và số lượng lớn hơn 0, sau đó bấm Mở bán để hiển thị sản phẩm cho khách hàng."}
                            </div>
                        </div>
                        {!isPublished && (
                            <button className="btn btn-success fw-semibold" type="button"
                                disabled={!readyToPublish || publishing} onClick={publishProduct}>
                                {publishing ? "Đang mở bán..." : "Mở bán sản phẩm"}
                            </button>
                        )}
                    </div>
                )}

                {productInfo?.type === ProductType.CUSTOM && (
                    <CustomProductRecipeConfig
                        productId={productId}
                        productInfo={productInfo}
                        onUpdated={fetchProductInfo}
                    />
                )}

                {productInfo?.type !== ProductType.CUSTOM && (
                    <VariantTable table={table} pageIndex={pagination.pageIndex} />
                )}

            </main>

        </div>
    );
}
