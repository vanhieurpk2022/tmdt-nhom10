import { useState, useEffect, useCallback, useMemo } from "react";
import {
    createColumnHelper,
    useTable,
    type SortingState,
} from "@tanstack/react-table";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faMagnifyingGlass,
    faPenToSquare,
    faTrash,
    faEye,
    faBagShopping,
    faClock,
    faSpinner,
    faCircleCheck,
    faDownload,
    faRotate,
    faBoxesPacking,
    faEnvelope,
    faPhone,
    faCircleXmark,
    faFilter,
    faSort,
    faArrowDownAZ,
    faArrowUpAZ,
} from "@fortawesome/free-solid-svg-icons";

import SideBarFactory from "../components/admin/factory/SideBarFactory";
import StatCard from "../components/admin/dashboard/StartCard";
import CustomBadge from "../components/admin/badge/CustomBadge";
import { OrderStatus } from "../enums/OrderStatus";
import { ProductType } from "../enums/ProductType";
import { FactoryServiceManager } from "../api/factory/FactoryService";
import type {
    AdminOrderListItem,
    AdminOrderStats,
    AdminOrderDetail,
} from "../api/AdminOrderService";
import AdminOrderDetailModal from "../components/admin/order/AdminOrderDetailModal";
import AdminUpdateOrderStatusModal from "../components/admin/order/AdminUpdateOrderStatusModal";
import { useToastContext } from "../components/toasts/ToastContext";
import { OrderStatusBadge } from "./AdminOrder";
import { features } from "../components/table/features";
import "../css/pages/dashboard/admin.css";
import "../css/pages/dashboard/dashboard.css";

const columnHelper = createColumnHelper<typeof features, AdminOrderListItem>();

export default function FactoryOrder() {
    const { showToast } = useToastContext();

    // Data states
    const [orders, setOrders] = useState<AdminOrderListItem[]>([]);
    const [stats, setStats] = useState<AdminOrderStats | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    // Sorting & Pagination states
    const [sorting, setSorting] = useState<SortingState>([]);
    const [search, setSearch] = useState<string>("");
    const [debouncedSearch, setDebouncedSearch] = useState<string>("");
    const [page, setPage] = useState<number>(0);
    const [pageSize, setPageSize] = useState<number>(10);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [totalElements, setTotalElements] = useState<number>(0);

    // Modals
    const [detailOrder, setDetailOrder] = useState<AdminOrderDetail | null>(null);
    const [loadingDetail, setLoadingDetail] = useState<boolean>(false);
    const [editingOrder, setEditingOrder] = useState<AdminOrderListItem | AdminOrderDetail | null>(null);
    const [showUpdateModal, setShowUpdateModal] = useState<boolean>(false);

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(0);
        }, 350);
        return () => clearTimeout(timer);
    }, [search]);

    // Fetch order list from backend
    const fetchOrders = useCallback(async () => {
        setLoading(true);
        try {
            const res = await FactoryServiceManager.getOrders({
                page,
                size: pageSize,
                search: debouncedSearch.trim() || undefined,
                sortBy: "createdAt",
                sortDir: "desc",
            });
            if (res.data) {
                setOrders(res.data.content || []);
                setTotalPages(res.data.totalPages || 1);
                setTotalElements(res.data.totalElements || 0);
            }
        } catch (err: any) {
            console.error("Lỗi khi tải danh sách đơn hàng xưởng:", err);
            showToast("Lỗi", err?.response?.data?.message || "Không thể tải danh sách đơn hàng xưởng.", "danger");
        } finally {
            setLoading(false);
        }
    }, [page, pageSize, debouncedSearch, showToast]);

    // Fetch stats
    const fetchStats = useCallback(async () => {
        try {
            const res = await FactoryServiceManager.getOrderStats();
            if (res.data) {
                setStats(res.data);
            }
        } catch (err: any) {
            console.error("Lỗi khi tải thống kê đơn hàng:", err);
        }
    }, []);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    // View detail
    const handleViewDetail = async (id: number) => {
        setLoadingDetail(true);
        try {
            const res = await FactoryServiceManager.getOrderDetail(id);
            if (res.data) {
                setDetailOrder(res.data);
            }
        } catch (err: any) {
            console.error("Lỗi khi lấy chi tiết đơn hàng:", err);
            showToast("Lỗi", err?.response?.data?.message || "Không thể lấy chi tiết đơn hàng.", "danger");
        } finally {
            setLoadingDetail(false);
        }
    };

    // Open update modal
    const handleOpenUpdate = (order: AdminOrderListItem | AdminOrderDetail) => {
        setEditingOrder(order);
        setShowUpdateModal(true);
    };

    // Save status update
    const handleSaveStatus = async (id: number, status: OrderStatus, note?: string, cancelReason?: string) => {
        try {
            await FactoryServiceManager.updateOrderStatus(id, {
                status,
                note,
                cancelReason,
            });
            showToast("Thành công", `Đã cập nhật trạng thái đơn #${id} thành ${OrderStatusBadge[status]?.label || status}.`, "success");
            fetchOrders();
            fetchStats();
            if (detailOrder && detailOrder.id === id) {
                handleViewDetail(id);
            }
        } catch (err: any) {
            console.error("Lỗi khi cập nhật trạng thái:", err);
            showToast("Lỗi", err?.response?.data?.message || "Không thể cập nhật trạng thái đơn hàng.", "danger");
            throw err;
        }
    };

    // Cancel order
    const handleCancelOrder = async (order: AdminOrderListItem) => {
        if (!window.confirm(`Bạn có chắc chắn muốn hủy đơn hàng ${order.code || `#ORD-${order.id}`} không?`)) {
            return;
        }
        try {
            await FactoryServiceManager.deleteOrder(order.id);
            showToast("Thành công", `Đã chuyển đơn hàng #${order.id} sang trạng thái Đã hủy.`, "success");
            fetchOrders();
            fetchStats();
        } catch (err: any) {
            console.error("Lỗi khi hủy đơn hàng:", err);
            showToast("Lỗi", err?.response?.data?.message || "Không thể hủy đơn hàng.", "danger");
        }
    };

    // Export CSV
    const handleExportCsv = () => {
        if (orders.length === 0) {
            showToast("Thông báo", "Không có đơn hàng nào để xuất file.", "info");
            return;
        }

        const headers = ["Mã đơn", "Khách hàng", "SĐT", "Địa chỉ", "Sản phẩm", "Tổng tiền (VNĐ)", "Trạng thái", "Ngày tạo"];
        const rows = orders.map((o) => [
            `"${o.code || `#ORD-${o.id}`}"`,
            `"${o.recipientName || o.customerName || ""}"`,
            `"${o.phoneNumber || o.customerPhone || ""}"`,
            `"${(o.shippingAddress || "").replace(/"/g, '""')}"`,
            `"${(o.productSummary || "").replace(/"/g, '""')}"`,
            o.totalPrice || 0,
            `"${OrderStatusBadge[o.status]?.label || o.status}"`,
            `"${o.createdAt ? new Date(o.createdAt).toLocaleString("vi-VN") : ""}"`,
        ]);

        const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `don_hang_xuong_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast("Thành công", "Đã xuất file danh sách đơn hàng thành công.", "success");
    };

    // Columns config for TanStack Table
    const columns = useMemo(
        () =>
            columnHelper.columns([
                columnHelper.accessor("code", {
                    header: "Mã đơn",
                    cell: (info) => (
                        <span className="fw-bold text-dark text-nowrap">
                            {info.getValue() || `#ORD-${info.row.original.id}`}
                        </span>
                    ),
                    sortFn: "alphanumeric",
                }),

                columnHelper.accessor("customerName", {
                    header: "Khách hàng",
                    cell: (info) => {
                        const row = info.row.original;
                        return (
                            <div className="d-flex flex-column gap-1">
                                <span className="fw-semibold text-dark">
                                    {row.customerName || row.recipientName || "Khách vãng lai"}
                                </span>
                                {row.customerEmail && (
                                    <span className="small text-muted">
                                        <FontAwesomeIcon icon={faEnvelope} className="me-1" />
                                        {row.customerEmail}
                                    </span>
                                )}
                                {row.customerPhone && (
                                    <span className="small text-secondary">
                                        <FontAwesomeIcon icon={faPhone} className="me-1" />
                                        {row.customerPhone}
                                    </span>
                                )}
                            </div>
                        );
                    },
                    sortFn: "basic",
                }),

                columnHelper.accessor("productSummary", {
                    header: "Sản phẩm",
                    cell: (info) => {
                        const row = info.row.original;
                        const isCustom = row.productType === ProductType.CUSTOM;

                        return (
                            <div className="d-flex flex-column gap-1" style={{ maxWidth: "260px" }}>
                                <div className="d-flex align-items-center gap-2">
                                    <span className="fw-medium text-dark text-truncate" title={row.productSummary}>
                                        {row.productSummary || "Sản phẩm"}
                                    </span>
                                    {isCustom && (
                                        <span className="badge bg-purple-subtle text-purple-emphasis small px-2 py-0">
                                            Custom
                                        </span>
                                    )}
                                </div>
                                <span className="small text-muted">
                                    Số lượng: {row.itemCount} món
                                </span>
                            </div>
                        );
                    },
                    sortFn: "basic",
                }),

                columnHelper.accessor("totalPrice", {
                    header: "Tổng tiền",
                    cell: (info) => (
                        <span className="fw-bold text-danger">
                            {(info.getValue() || 0).toLocaleString("vi-VN")}đ
                        </span>
                    ),
                    sortFn: "basic",
                }),

                columnHelper.accessor("paymentMethod", {
                    header: "Thanh toán",
                    cell: (info) => {
                        const row = info.row.original;
                        return (
                            <div className="d-flex flex-column gap-1">
                                <span className="small fw-semibold text-dark">
                                    {row.paymentMethod || "COD"}
                                </span>
                                <span
                                    className={`badge small ${
                                        row.paymentStatus === "PAID"
                                            ? "bg-success-subtle text-success"
                                            : "bg-warning-subtle text-warning-emphasis"
                                    }`}
                                >
                                    {row.paymentStatus === "PAID" ? "Đã thanh toán" : "Chưa thanh toán"}
                                </span>
                            </div>
                        );
                    },
                    sortFn: "basic",
                }),

                columnHelper.accessor("status", {
                    header: "Trạng thái",
                    cell: (info) => {
                        const status = info.getValue();
                        const statusConf = OrderStatusBadge[status] || {
                            label: status,
                            badge: "bg-secondary-subtle text-secondary",
                        };
                        return <CustomBadge label={statusConf.label} badge={statusConf.badge} />;
                    },
                    sortFn: "basic",
                }),

                columnHelper.accessor("createdAt", {
                    header: "Ngày đặt",
                    cell: (info) => {
                        const dateStr = info.getValue();
                        return (
                            <span className="small text-secondary text-nowrap">
                                {dateStr
                                    ? new Date(dateStr).toLocaleDateString("vi-VN", {
                                          day: "2-digit",
                                          month: "2-digit",
                                          year: "numeric",
                                      })
                                    : "Chưa có"}
                            </span>
                        );
                    },
                    sortFn: "basic",
                }),

                columnHelper.display({
                    id: "actions",
                    header: "Hành động",
                    cell: (info) => {
                        const order = info.row.original;
                        return (
                            <div className="d-flex align-items-center justify-content-center gap-2">
                                <button
                                    type="button"
                                    className="btn btn-sm btn-outline-primary"
                                    title="Xem chi tiết đơn"
                                    onClick={() => handleViewDetail(order.id)}
                                >
                                    <FontAwesomeIcon icon={faEye} />
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-sm btn-outline-success"
                                    title="Cập nhật trạng thái"
                                    onClick={() => handleOpenUpdate(order)}
                                >
                                    <FontAwesomeIcon icon={faPenToSquare} />
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-sm btn-outline-danger"
                                    title="Hủy đơn hàng"
                                    disabled={
                                        order.status === OrderStatus.DELIVERED ||
                                        order.status === OrderStatus.CANCELLED
                                    }
                                    onClick={() => handleCancelOrder(order)}
                                >
                                    <FontAwesomeIcon icon={faTrash} />
                                </button>
                            </div>
                        );
                    },
                    enableSorting: false,
                }),
            ]),
        []
    );

    // Initialize TanStack Table instance
    const table = useTable({
        data: orders,
        columns,
        features,
        state: { sorting },
        onSortingChange: setSorting,
    });

    return (
        <div className="row g-0 min-vh-100 bg-light">
            <aside
                className="col-12 col-xl-2 flex-shrink-0 position-sticky top-0 align-self-start"
                style={{ height: "100vh", zIndex: 100 }}
            >
                <SideBarFactory isOrder={true} />
            </aside>

            <main className="col-12 col-xl-10 p-3 p-lg-4 admin-content overflow-x-auto">
                {/* Header */}
                <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-4">
                    <div>
                        <div className="text-danger fw-semibold small mb-2 text-uppercase letter-spacing">
                            QUẢN LÝ ĐƠN HÀNG XƯỞNG
                        </div>
                        <h2 className="fw-bold text-dark mb-1">
                            Đơn hàng của gian hàng
                        </h2>
                        <p className="text-secondary mb-0">
                            Theo dõi, cập nhật tiến độ gia công và giao hàng đến tay người mua.
                        </p>
                    </div>

                    <div className="d-flex gap-2">
                        <button
                            type="button"
                            className="btn btn-white border fw-semibold shadow-sm"
                            onClick={() => {
                                fetchOrders();
                                fetchStats();
                            }}
                            title="Làm mới dữ liệu"
                        >
                            <FontAwesomeIcon icon={faRotate} className={`me-2 ${loading ? "fa-spin" : ""}`} />
                            Làm mới
                        </button>
                        <button
                            type="button"
                            className="btn btn-outline-danger fw-semibold shadow-sm"
                            onClick={handleExportCsv}
                        >
                            <FontAwesomeIcon icon={faDownload} className="me-2" />
                            Xuất danh sách
                        </button>
                    </div>
                </div>

                {/* Statistic cards */}
                <section className="row g-3 mb-4">
                    <div className="col-12 col-sm-6 col-xxl-3">
                        <StatCard
                            label="TỔNG ĐƠN HÀNG"
                            value={String(stats?.totalOrders ?? totalElements)}
                            icon={faBagShopping}
                            tone="danger"
                            note="Tất cả đơn hàng của xưởng"
                        />
                    </div>
                    <div className="col-12 col-sm-6 col-xxl-3">
                        <StatCard
                            label="CHỜ XÁC NHẬN"
                            value={String(stats?.pendingCount ?? 0)}
                            icon={faClock}
                            tone="warning"
                            note="Cần tiếp nhận & xác nhận"
                        />
                    </div>
                    <div className="col-12 col-sm-6 col-xxl-3">
                        <StatCard
                            label="ĐANG XỬ LÝ"
                            value={String((stats?.processingCount ?? 0) + (stats?.deliveringCount ?? 0))}
                            icon={faBoxesPacking}
                            tone="info"
                            note="Đang gia công & vận chuyển"
                        />
                    </div>
                    <div className="col-12 col-sm-6 col-xxl-3">
                        <StatCard
                            label="ĐÃ GIAO"
                            value={String(stats?.deliveredCount ?? 0)}
                            icon={faCircleCheck}
                            tone="success"
                            note="Hoàn tất đơn hàng"
                        />
                    </div>
                </section>

                {/* Order Table Card */}
                <section className="card border-0 shadow-sm rounded-4 overflow-hidden">
                    <div className="card-body p-0">
                        {/* Search & Actions Bar (Không còn tab filter ở trên) */}
                        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 p-3 p-lg-4 bg-white border-bottom">
                            <div className="input-group" style={{ maxWidth: "380px" }}>
                                <span className="input-group-text bg-white border-end-0">
                                    <FontAwesomeIcon icon={faMagnifyingGlass} className="text-secondary" />
                                </span>
                                <input
                                    type="text"
                                    className="form-control border-start-0 ps-0"
                                    placeholder="Tìm mã đơn (#ORD-101), tên khách, SĐT..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                                {search && (
                                    <button
                                        className="btn btn-outline-secondary border-start-0 border"
                                        type="button"
                                        onClick={() => setSearch("")}
                                    >
                                        <FontAwesomeIcon icon={faCircleXmark} />
                                    </button>
                                )}
                            </div>

                            <div className="d-flex align-items-center gap-3">
                                <div className="d-flex align-items-center gap-2">
                                    <span className="small text-secondary text-nowrap">Hiển thị:</span>
                                    <select
                                        className="form-select form-select-sm"
                                        style={{ width: "80px" }}
                                        value={pageSize}
                                        onChange={(e) => {
                                            setPageSize(Number(e.target.value));
                                            setPage(0);
                                        }}
                                    >
                                        <option value={10}>10</option>
                                        <option value={20}>20</option>
                                        <option value={50}>50</option>
                                    </select>
                                </div>

                                <span className="badge rounded-pill bg-light text-dark border px-3 py-2">
                                    {totalElements} đơn hàng
                                </span>
                            </div>
                        </div>

                        {/* Table using TanStack Table & Sorting */}
                        <div className="table-responsive admin-table-scroll">
                            <table className="table table-hover align-middle mb-0">
                                <thead className="table-light text-secondary small text-uppercase">
                                    {table.getHeaderGroups().map((headerGroup) => (
                                        <tr key={headerGroup.id}>
                                            {headerGroup.headers.map((header) => {
                                                const sorted = header.column.getIsSorted();
                                                const canSort = header.column.getCanSort();

                                                return (
                                                    <th key={header.id} className="text-nowrap py-3">
                                                        {header.isPlaceholder ? null : (
                                                            <div
                                                                className={`d-flex align-items-center gap-2 ${
                                                                    header.id === "actions" ? "justify-content-center" : ""
                                                                }`}
                                                                onClick={header.column.getToggleSortingHandler()}
                                                                style={{
                                                                    cursor: canSort ? "pointer" : "default",
                                                                    userSelect: "none",
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
                                                                        className={sorted ? "text-danger" : "text-secondary opacity-50"}
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
                                    {loading ? (
                                        <tr>
                                            <td colSpan={table.getHeaderGroups()[0]?.headers.length ?? 8} className="text-center py-5 text-secondary">
                                                <FontAwesomeIcon icon={faSpinner} spin size="2x" className="mb-2 text-danger" />
                                                <div>Đang tải danh sách đơn hàng...</div>
                                            </td>
                                        </tr>
                                    ) : table.getRowModel().rows.length === 0 ? (
                                        <tr>
                                            <td colSpan={table.getHeaderGroups()[0]?.headers.length ?? 8} className="text-center py-5 text-secondary">
                                                <FontAwesomeIcon icon={faFilter} size="2x" className="mb-2 text-muted" />
                                                <div>Không tìm thấy đơn hàng nào phù hợp.</div>
                                            </td>
                                        </tr>
                                    ) : (
                                        table.getRowModel().rows.map((row) => (
                                            <tr key={row.id}>
                                                {row.getAllCells().map((cell) => (
                                                    <td key={cell.id}>
                                                        <table.FlexRender cell={cell} />
                                                    </td>
                                                ))}
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Footer */}
                        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 px-3 px-lg-4 py-3 border-top bg-white">
                            <span className="text-secondary small">
                                Hiển thị {orders.length} / {totalElements} đơn hàng (Trang {page + 1}/{totalPages})
                            </span>

                            {totalPages > 1 && (
                                <nav>
                                    <ul className="pagination pagination-sm mb-0">
                                        <li className={`page-item ${page === 0 ? "disabled" : ""}`}>
                                            <button
                                                className="page-link"
                                                onClick={() => setPage((prev) => Math.max(0, prev - 1))}
                                            >
                                                Trước
                                            </button>
                                        </li>
                                        {Array.from({ length: totalPages }).map((_, idx) => (
                                            <li key={idx} className={`page-item ${idx === page ? "active" : ""}`}>
                                                <button className="page-link" onClick={() => setPage(idx)}>
                                                    {idx + 1}
                                                </button>
                                            </li>
                                        ))}
                                        <li className={`page-item ${page >= totalPages - 1 ? "disabled" : ""}`}>
                                            <button
                                                className="page-link"
                                                onClick={() => setPage((prev) => Math.min(totalPages - 1, prev + 1))}
                                            >
                                                Sau
                                            </button>
                                        </li>
                                    </ul>
                                </nav>
                            )}
                        </div>
                    </div>
                </section>
            </main>

            {/* Modal Chi tiết đơn hàng */}
            {detailOrder && (
                <AdminOrderDetailModal
                    order={detailOrder}
                    loading={loadingDetail}
                    onClose={() => setDetailOrder(null)}
                    onOpenStatusUpdate={(o) => {
                        setDetailOrder(null);
                        handleOpenUpdate(o);
                    }}
                />
            )}

            {/* Modal Cập nhật trạng thái */}
            {editingOrder && (
                <AdminUpdateOrderStatusModal
                    order={editingOrder}
                    show={showUpdateModal}
                    onClose={() => {
                        setShowUpdateModal(false);
                        setEditingOrder(null);
                    }}
                    onSave={handleSaveStatus}
                />
            )}
        </div>
    );
}
