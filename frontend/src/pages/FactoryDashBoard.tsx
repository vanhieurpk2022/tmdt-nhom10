import { useCallback, useEffect, useMemo, useState } from "react";
import { createColumnHelper, useTable, type PaginationState } from "@tanstack/react-table";
import { addDays, formatDistanceToNow } from "date-fns";
import { tr, vi } from "date-fns/locale";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock, faCalendarCheck } from "@fortawesome/free-solid-svg-icons";

import OperationsOverview from "../components/admin/dashboard/OperationOverview";
import SideBarFactory from "../components/admin/factory/SideBarFactory";
import { features } from "../components/table/features";
import type { FactoryOrderDashBoard } from "../dto/factory/FactoryDashBoard";
import { OrderStatusBadge } from "./AdminOrder";
import CustomBadge from "../components/admin/badge/CustomBadge";
import { formatVnd } from "../components/format/FormatMoney";
import { FactoryServiceManager } from "../api/factory/FactoryService";


// Đặt NGOÀI component vì không phụ thuộc state
const columnHelper = createColumnHelper<typeof features, FactoryOrderDashBoard>();



export function FactoryDashBoard() {
    const [orders, setOrders] = useState<FactoryOrderDashBoard[]>([]); // TODO: fill từ API bằng setOrders
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });

    const getOrders = useCallback(async () => {
        try {
            const res = await FactoryServiceManager.getUserDashBoard();
            console.log(res)
            if (res.status === 200) {
                setOrders(res.data);
            }
        } catch (error) {
            console.log("Lỗi không tải được dữ liệu", error);
        }
    }, []);

    useEffect(() => {
        getOrders();
    }, [getOrders])

    // columns phải khai báo TRƯỚC useTable
    const columns = useMemo(
        () =>
            columnHelper.columns([
                columnHelper.accessor("idOrder", {
                    header: "Mã đơn / Khách đặt hàng",
                    cell: info => {
                        const row = info.row.original;

                        return (
                            <div className="d-flex flex-column gap-1">
                                <div className="d-flex align-items-center flex-wrap gap-2">
                                    <b>{`DH-${String(row.idOrder).padStart(5, "0")}`}</b>

                                    <span className="small text-muted">
                                        <FontAwesomeIcon icon={faClock} className="me-1" />
                                        {formatDistanceToNow(new Date(row.time), {
                                            addSuffix: true,
                                            locale: vi,
                                        })}
                                    </span>
                                </div>

                                <span className="fw-semibold text-dark">{row.userName}</span>
                            </div>
                        );
                    },
                    sortFn: "alphanumeric",
                }),

                columnHelper.accessor("totalQuantity", {
                    header: "Quy mô & Ghi chú đơn",
                    cell: info => {
                        const row = info.row.original;

                        return (
                            <div className="d-flex flex-column gap-1">
                                <span className="fw-semibold">{row.totalQuantity}</span>
                                <span className="small text-secondary">{row.notes}</span>
                            </div>
                        );
                    },
                    sortFn: "basic", // totalQuantity là số
                }),

                columnHelper.accessor("price", {
                    header: "Giá trị đơn / Hạn giao",
                    cell: info => {
                        const row = info.row.original;

                        return (
                            <div className="d-flex flex-column gap-1">
                                <span className="fw-bold text-dark">{formatVnd(row.price)}</span>

                                <span className="badge bg-info-subtle text-info-emphasis fw-normal align-self-start">
                                    <FontAwesomeIcon icon={faCalendarCheck} className="me-1" />
                                    {formatDistanceToNow(addDays(new Date(row.time), 5), {
                                        addSuffix: true,
                                        locale: vi,
                                    })}
                                </span>
                            </div>
                        );
                    },
                    sortFn: "basic",
                }),

                columnHelper.accessor("status", {
                    header: "Trạng thái đơn",
                    cell: info => {
                        const conf = OrderStatusBadge[info.getValue()];
                        return <CustomBadge label={conf.label} badge={conf.badge} />;
                    },
                    enableSorting: false,
                }),
            ]),
        []
    );

    const table = useTable({
        data: orders,
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
                <SideBarFactory isDashboard={true} />
            </aside>

            {/* Nội dung chính */}
            <div className="col-12 col-xl-10 admin-content">
                <OperationsOverview
                    pageIndex={pagination.pageIndex}
                    isShow={true}
                    table={table}
                />
            </div>
        </div>
    );
}