
import VariantToolbar from "./VariantToolbar";
import VariantTable from "./VariantTable";
import SideBarFactory from "../SideBarFactory";
import { VariantHeader } from "./VariantHeader";
import { useNavigate, useParams } from "react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FactoryServiceManager } from "../../../../api/factory/FactoryService";
import type { ProductImage } from "../../../../models/ProductImage";
import { createColumnHelper } from "@tanstack/react-table";
import type { features } from "../../../table/features";
import type { FactoryProductVariantItem } from "../../../../dto/factory/FactoryProductRes";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faPenToSquare, faToggleOff, faToggleOn, faTrash } from "@fortawesome/free-solid-svg-icons";


const columnHelper = createColumnHelper<typeof features, FactoryProductVariantItem>();


export function FactoryProductDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const productId = Number(id);

    const columns = useMemo(
        () =>
            columnHelper.columns([
                columnHelper.accessor("id", {
                    header: "Mã SP",
                    cell: info => <b>#{info.getValue()}</b>,
                    sortFn: "alphanumeric",
                }),

                columnHelper.accessor("", {
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
                                <button type="button" className="btn btn-sm btn-outline-primary" title="Xem chi tiết"
                                    onClick={() => handleView(product.id)} >
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

    return (
        <div className="row g-0 min-vh-100 bg-light">

            {/* SIDEBAR */}
            <aside
                className="col-12 col-xl-2 flex-shrink-0 position-sticky top-0 align-self-start"
                style={{ height: "100vh" }}
            >
                <SideBarFactory isProduct={true} />
            </aside>

            {/* CONTENT */}
            <main className="col-12 col-xl-10 p-3 p-lg-4">

                <VariantHeader productId={productId} />

                <VariantToolbar />

                <VariantTable productId={productId} />

            </main>

        </div>
    );
}