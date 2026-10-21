
import VariantToolbar from "./VariantToolbar";
import SideBarFactory from "../SideBarFactory";
import { VariantHeader } from "./VariantHeader";
import { useNavigate, useParams } from "react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { createColumnHelper, useTable, type PaginationState } from "@tanstack/react-table";
import { features } from "../../../table/features";
import type { EditableVariant, FactoryProductMil, FactoryProductVariantItem } from "../../../../dto/factory/FactoryProductRes";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faPenToSquare, faTag, faToggleOff, faToggleOn, faTrash } from "@fortawesome/free-solid-svg-icons";
import CustomBadge from "../../badge/CustomBadge";
import { VariantTable } from "./VariantTable";
import { FactoryServiceManager } from "../../../../api/factory/FactoryService";
import { formatVnd } from "../../../format/FormatMoney";
import { ModalAddVariant } from "./ModalAddVariant";


const columnHelper = createColumnHelper<typeof features, FactoryProductVariantItem>();


export function FactoryProductDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const productId = Number(id);

    const [showAddModal, setShowAddModal] = useState(false);
    const [editingVariant, setEditingVariant] = useState<EditableVariant | null>(null);

    const openAdd = () => {
        setEditingVariant(null);
        setShowAddModal(true);
    };

    const openEdit = (v: EditableVariant) => {
        setEditingVariant(v);
        setShowAddModal(true);
    };

    const [variant, setVariant] = useState<FactoryProductVariantItem[]>([]);
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
        } catch (error) {
            console.log("Lỗi getVariant")

        }
    }, [productId])

    const handleActive = useCallback(async (id: number) => {
        try {
            await FactoryServiceManager.changeStatusProductMils(id);
            setVariant(prev =>
                prev.map(v => (v.id === id ? { ...v, isActive: !v.isActive } : v))
            );
        } catch (error) {
            console.log("Lỗi active Variant")
        }
    }, [])

    const handleDelete = useCallback(async (id: number) => {
        try {
            await FactoryServiceManager.deleteProductMil(id);
            setVariant(prev => prev.filter(v => v.id !== id));
        } catch (error) {
            console.log("Lỗi Xóa Variant")
        }
    }, [])

    useEffect(() => {
        getVariant();
    }, [getVariant])
    const columns = useMemo(
        () =>
            columnHelper.columns([
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
            ]),
        []
    );


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

                <VariantHeader onVariants={openAdd} productId={productId} />

                <VariantTable table={table} pageIndex={pagination.pageIndex} />

            </main>

        </div>
    );
}