import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router";
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
    faCirclePlus,
    faRotate,
    faBoxesPacking,
    faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";

import SidebarAdmin from "../components/admin/dashboard/SideBarAdmin";
import { useAdminSidebar } from "../api/AdminSidebarContext";
import { ROUTES } from "../routes/routes";
import { OrderStatus } from "../enums/OrderStatus";
import { getPaymentStatusLabel } from "../api/OrderService";
import { ProductType } from "../enums/ProductType";
import {
    AdminOrderService,
    type AdminOrderListItem,
    type AdminOrderStats,
    type AdminOrderDetail,
} from "../api/AdminOrderService";
import AdminOrderDetailModal from "../components/admin/order/AdminOrderDetailModal";
import AdminUpdateOrderStatusModal from "../components/admin/order/AdminUpdateOrderStatusModal";
import "../css/pages/user-admin.css";

export const OrderStatusBadge: Record<OrderStatus, { label: string; badge: string }> = {
    [OrderStatus.PENDING_PAYMENT]: {
        label: "Chờ thanh toán",
        badge: "bg-warning-subtle text-warning-emphasis",
    },
    [OrderStatus.PENDING]: {
        label: "Chờ xác nhận",
        badge: "bg-warning-subtle text-warning-emphasis",
    },
    [OrderStatus.CONFIRMED]: {
        label: "Đã xác nhận",
        badge: "bg-primary-subtle text-primary-emphasis",
    },
    [OrderStatus.PROCESSING]: {
        label: "Đang gia công",
        badge: "bg-info-subtle text-info-emphasis",
    },
    [OrderStatus.DELIVERING]: {
        label: "Đang giao",
        badge: "bg-primary-subtle text-primary-emphasis",
    },
    [OrderStatus.SHIPPED]: {
        label: "Đã gửi hàng",
        badge: "bg-info-subtle text-info-emphasis",
    },
    [OrderStatus.DELIVERED]: {
        label: "Đã giao",
        badge: "bg-success-subtle text-success-emphasis",
    },
    [OrderStatus.CANCELLED]: {
        label: "Đã hủy",
        badge: "bg-danger-subtle text-danger-emphasis",
    },
    [OrderStatus.RETURNED]: {
        label: "Đã trả hàng",
        badge: "bg-secondary-subtle text-secondary-emphasis",
    },
    [OrderStatus.REFUNDED]: {
        label: "Đã hoàn tiền",
        badge: "bg-dark-subtle text-dark-emphasis",
    },
};

export const ProductTypeBadge: Record<ProductType, { label: string; badge: string }> = {
    [ProductType.CUSTOM]: {
        label: "Tùy chỉnh",
        badge: "bg-purple-subtle text-purple-emphasis",
    },
    [ProductType.NORMAL]: {
        label: "Thường",
        badge: "bg-primary-subtle text-primary-emphasis",
    },
};

const getInitials = (name?: string) => {
    if (!name || !name.trim()) return "KH";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const getAvatarTone = (id: number) => {
    const tones = ["pink", "blue", "slate", "mint"];
    return tones[Math.abs(id) % tones.length];
};

const statusPillClass = (status: OrderStatus) => {
    switch (status) {
        case OrderStatus.DELIVERED:
            return "status-pill active";
        case OrderStatus.CANCELLED:
            return "status-pill banned";
        case OrderStatus.PENDING:
            return "status-pill inactive border border-warning text-warning-emphasis bg-warning-subtle";
        case OrderStatus.CONFIRMED:
        case OrderStatus.PROCESSING:
        case OrderStatus.DELIVERING:
        case OrderStatus.SHIPPED:
        default:
            return "status-pill inactive";
    }
};

export default function AdminOrder() {
    const { isCollapsed: isSidebarCollapsed } = useAdminSidebar();

    // Data states
    const [orders, setOrders] = useState<AdminOrderListItem[]>([]);
    const [stats, setStats] = useState<AdminOrderStats | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Filter, Sort & Pagination states
    const [search, setSearch] = useState<string>("");
    const [statusFilter, setStatusFilter] = useState<string>("ALL");
    const [sortBy, setSortBy] = useState<string>("createdAt");
    const [sortDir, setSortDir] = useState<string>("desc");
    const [page, setPage] = useState<number>(0);
    const pageSize = 10;
    const [totalPages, setTotalPages] = useState<number>(1);
    const [totalElements, setTotalElements] = useState<number>(0);

    // Modal states
    const [detailOrder, setDetailOrder] = useState<AdminOrderDetail | null>(null);
    const [loadingDetail, setLoadingDetail] = useState<boolean>(false);
    const [editingOrder, setEditingOrder] = useState<AdminOrderListItem | AdminOrderDetail | null>(null);
    const [showUpdateModal, setShowUpdateModal] = useState<boolean>(false);

    // Toast state
    const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "danger" | "info" } | null>(null);

    const showToast = (text: string, type: "success" | "danger" | "info" = "success") => {
        setToastMessage({ text, type });
        setTimeout(() => setToastMessage(null), 4000);
    };

    // 1. Fetch Orders List
    const fetchOrders = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await AdminOrderService.getOrders(page, pageSize, search, statusFilter, sortBy, sortDir);
            setOrders(res.content || []);
            setTotalPages(res.totalPages || 1);
            setTotalElements(res.totalElements || 0);
        } catch (err: any) {
            console.error("Lỗi khi tải danh sách đơn hàng:", err);
            setError(err?.response?.data?.message || "Không thể tải danh sách đơn hàng từ máy chủ.");
        } finally {
            setLoading(false);
        }
    }, [page, pageSize, search, statusFilter, sortBy, sortDir]);

    // 2. Fetch Stats
    const fetchStats = useCallback(async () => {
        try {
            const res = await AdminOrderService.getOrderStats();
            setStats(res);
        } catch (err) {
            console.error("Lỗi khi tải thống kê đơn hàng:", err);
        }
    }, []);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    // Handle view detail
    const handleViewDetail = async (id: number) => {
        setLoadingDetail(true);
        try {
            const detail = await AdminOrderService.getOrderDetail(id);
            setDetailOrder(detail);
        } catch (err: any) {
            console.error("Lỗi xem chi tiết đơn hàng:", err);
            showToast(err?.response?.data?.message || "Không thể lấy chi tiết đơn hàng.", "danger");
        } finally {
            setLoadingDetail(false);
        }
    };

    // Handle open update status modal
    const handleOpenUpdateModal = (orderItem: AdminOrderListItem | AdminOrderDetail) => {
        setEditingOrder(orderItem);
        setShowUpdateModal(true);
    };

    // Handle save status update
    const handleSaveStatusUpdate = async (id: number, status: OrderStatus, note?: string, cancelReason?: string) => {
        await AdminOrderService.updateOrderStatus(id, status, note, cancelReason);
        showToast(`Đã cập nhật trạng thái đơn #${id} thành ${OrderStatusBadge[status]?.label || status}.`, "success");
        fetchOrders();
        fetchStats();
        if (detailOrder && detailOrder.id === id) {
            handleViewDetail(id);
        }
    };

    // Handle delete / cancel order
    const handleDeleteOrder = async (order: AdminOrderListItem) => {
        if (!window.confirm(`Bạn có chắc chắn muốn hủy / xóa đơn hàng ${order.code || `#ORD-${order.id}`} không?`)) {
            return;
        }
        try {
            await AdminOrderService.deleteOrder(order.id);
            showToast(`Đã chuyển đơn hàng #${order.id} sang trạng thái Đã hủy.`, "success");
            fetchOrders();
            fetchStats();
        } catch (err: any) {
            console.error("Lỗi khi xóa đơn hàng:", err);
            showToast(err?.response?.data?.message || "Không thể hủy đơn hàng.", "danger");
        }
    };

    // Export CSV
    const handleExportCsv = () => {
        if (orders.length === 0) {
            showToast("Không có đơn hàng nào để xuất file.", "info");
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
        link.setAttribute("href", url);
        link.setAttribute("download", `Danh_sach_don_hang_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast(`Đã tải xuống file CSV (${orders.length} đơn hàng)!`, "success");
    };

    // Render pagination matching UserManager.tsx
    const renderPagination = () => {
        const pages: (number | string)[] = [];
        const currentPageNumber = page + 1;

        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            if (currentPageNumber <= 3) {
                pages.push(1, 2, 3, "...", totalPages);
            } else if (currentPageNumber >= totalPages - 2) {
                pages.push(1, "...", totalPages - 2, totalPages - 1, totalPages);
            } else {
                pages.push(1, "...", currentPageNumber - 1, currentPageNumber, currentPageNumber + 1, "...", totalPages);
            }
        }

        const startItem = totalElements === 0 ? (orders.length > 0 ? 1 : 0) : page * pageSize + 1;
        const endItem = totalElements === 0 ? orders.length : Math.min((page + 1) * pageSize, totalElements);

        return (
            <div className="table-footer">
                <div>
                    Hiển thị <strong>{startItem} - {endItem}</strong> trên tổng số{" "}
                    <strong>{totalElements.toLocaleString("vi-VN")}</strong> đơn hàng
                </div>
                <div className="pagination-btns">
                    <button
                        className="pagination-btn"
                        disabled={page === 0 || loading}
                        onClick={() => setPage(page - 1)}
                    >
                        Trang trước
                    </button>
                    {pages.map((p, idx) => {
                        if (p === "...") {
                            return <span key={`ellipsis-${idx}`} className="pagination-ellipsis">…</span>;
                        }
                        const pageNum = Number(p);
                        return (
                            <button
                                key={pageNum}
                                className={`pagination-btn ${page === pageNum - 1 ? "active" : ""}`}
                                disabled={loading}
                                onClick={() => setPage(pageNum - 1)}
                            >
                                {pageNum}
                            </button>
                        );
                    })}
                    <button
                        className="pagination-btn"
                        disabled={page >= totalPages - 1 || loading}
                        onClick={() => setPage(page + 1)}
                    >
                        Trang sau
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="d-flex min-vh-100 w-100 admin-customer-page">
            {/* Sidebar */}
            <aside
                className="flex-shrink-0 position-sticky top-0 align-self-start"
                style={{
                    width: isSidebarCollapsed ? "72px" : "250px",
                    minWidth: isSidebarCollapsed ? "72px" : "250px",
                    height: "100vh",
                    zIndex: 1000,
                    backgroundColor: "var(--color-bg-dark, #111827)",
                    transition: "width 0.25s cubic-bezier(0.4, 0, 0.2, 1), min-width 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
            >
                <SidebarAdmin isOrder={true} />
            </aside>

            {/* Main Content Area */}
            <div className="flex-grow-1 p-3 p-lg-4 overflow-x-auto" style={{ minWidth: 0 }}>
                {/* Toast Notification */}
                {toastMessage && (
                    <div
                        className={`alert alert-${toastMessage.type === "danger" ? "danger" : toastMessage.type === "info" ? "info" : "success"} d-flex align-items-center justify-content-between mb-3 py-2 px-3 shadow-sm rounded-3`}
                        style={{ fontSize: "13px" }}
                    >
                        <div className="d-flex align-items-center gap-2">
                            <FontAwesomeIcon icon={toastMessage.type === "danger" ? faTriangleExclamation : faCircleCheck} />
                            <span>{toastMessage.text}</span>
                        </div>
                        <button
                            type="button"
                            className="btn-close"
                            aria-label="Close"
                            onClick={() => setToastMessage(null)}
                        />
                    </div>
                )}

                {/* Breadcrumb & Header matching UserManager */}
                <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
                    <div>
                        <div className="admin-breadcrumb">
                            <span>Quản trị hệ thống</span>
                            <span className="crumb-sep">›</span>
                            <span>Vận hành lõi</span>
                            <span className="crumb-sep">›</span>
                            <span className="active-crumb">Quản lý đơn đặt hàng</span>
                        </div>
                        <h1 className="h4 fw-bold text-dark mb-0">Quản lý Đơn đặt hàng &amp; Điều phối</h1>
                    </div>

                    <div className="d-flex flex-wrap gap-2">
                        <button
                            type="button"
                            className="btn-action-secondary"
                            onClick={() => {
                                fetchOrders();
                                fetchStats();
                                showToast("Đã đồng bộ dữ liệu mới nhất!", "info");
                            }}
                            title="Làm mới dữ liệu"
                        >
                            <FontAwesomeIcon icon={faRotate} className={loading ? "fa-spin" : ""} />
                            <span>Làm mới</span>
                        </button>

                        <Link to={ROUTES.PAYMENT_REVIEWS} className="btn-action-secondary text-decoration-none">
                            Đối soát VNPay
                        </Link>
                        <Link to={ROUTES.REFUNDS} className="btn-action-secondary text-decoration-none">
                            Hoàn tiền VNPay
                        </Link>

                        <button className="btn-header-export" onClick={handleExportCsv} title="Xuất file vận đơn CSV">
                            <FontAwesomeIcon icon={faDownload} />
                            <span>Xuất file CSV</span>
                        </button>

                        <Link to={ROUTES.ADMIN_ORDER_DISPATCH} className="btn-header-primary text-decoration-none">
                            <FontAwesomeIcon icon={faCirclePlus} />
                            <span>Tạo đơn điều phối</span>
                        </Link>
                    </div>
                </div>

                {/* Error alert if any */}
                {error && (
                    <div className="alert alert-danger d-flex justify-content-between align-items-center mb-4 py-2 rounded-3 shadow-sm" role="alert">
                        <div>
                            <FontAwesomeIcon icon={faTriangleExclamation} className="me-2" />
                            <strong>Lỗi kết nối:</strong> {error}
                        </div>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => fetchOrders()}>
                            Tải lại dữ liệu
                        </button>
                    </div>
                )}

                {/* ── 4 THẺ METRICS (Bố cục chuẩn UserManager) ── */}
                <div className="row g-3 mb-4">
                    {/* Thẻ 1: Tổng đơn hàng */}
                    <div className="col-12 col-sm-6 col-xl-3">
                        <div className="metric-card">
                            <div className="metric-card-top">
                                <span className="metric-card-label">TỔNG ĐƠN HÀNG</span>
                                <span className="metric-card-icon blue">
                                    <FontAwesomeIcon icon={faBagShopping} />
                                </span>
                            </div>
                            <div className="metric-card-value">
                                {stats ? stats.totalOrders.toLocaleString("vi-VN") : "..."}
                            </div>
                            <div className="metric-card-footer d-flex flex-wrap gap-1 align-items-center">
                                <span className="metric-chip blue">Toàn hệ thống</span>
                                <span className="text-secondary ms-2 small">Tất cả đơn đặt hàng</span>
                            </div>
                        </div>
                    </div>

                    {/* Thẻ 2: Chờ xác nhận */}
                    <div className="col-12 col-sm-6 col-xl-3">
                        <div className="metric-card">
                            <div className="metric-card-top">
                                <span className="metric-card-label">CHỜ XÁC NHẬN</span>
                                <span className="metric-card-icon amber">
                                    <FontAwesomeIcon icon={faClock} />
                                </span>
                            </div>
                            <div className="metric-card-value">
                                {stats ? stats.pendingCount.toLocaleString("vi-VN") : "..."}
                            </div>
                            <div className="metric-card-footer d-flex flex-wrap gap-1 align-items-center">
                                <span className="metric-chip red">Cần tiếp nhận</span>
                                <span className="text-secondary ms-2 small">Chờ xưởng điều phối</span>
                            </div>
                        </div>
                    </div>

                    {/* Thẻ 3: Đang gia công & giao */}
                    <div className="col-12 col-sm-6 col-xl-3">
                        <div className="metric-card">
                            <div className="metric-card-top">
                                <span className="metric-card-label">ĐANG GIA CÔNG &amp; GIAO</span>
                                <span className="metric-card-icon purple">
                                    <FontAwesomeIcon icon={faSpinner} />
                                </span>
                            </div>
                            <div className="metric-card-value">
                                {stats ? (stats.processingCount + stats.deliveringCount).toLocaleString("vi-VN") : "..."}
                            </div>
                            <div className="metric-card-footer d-flex flex-wrap gap-1 align-items-center">
                                <span className="metric-chip blue">Vận hành liên xưởng</span>
                                <span className="text-secondary ms-2 small">Gia công &amp; ĐVVC</span>
                            </div>
                        </div>
                    </div>

                    {/* Thẻ 4: Đã giao thành công */}
                    <div className="col-12 col-sm-6 col-xl-3">
                        <div className="metric-card">
                            <div className="metric-card-top">
                                <span className="metric-card-label">ĐÃ GIAO THÀNH CÔNG</span>
                                <span className="metric-card-icon green">
                                    <FontAwesomeIcon icon={faCircleCheck} />
                                </span>
                            </div>
                            <div className="metric-card-value">
                                {stats ? stats.deliveredCount.toLocaleString("vi-VN") : "..."}
                            </div>
                            <div className="metric-card-footer d-flex flex-wrap gap-1 align-items-center">
                                <span className="metric-chip green">Đơn hoàn tất</span>
                                <span className="text-secondary ms-2 small">Quyết toán doanh thu</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── THANH TÌM KIẾM & BỘ LỌC (filter-card) ── */}
                <div className="filter-card">
                    <div className="row g-2 align-items-center">
                        <div className="col-12 col-md-5">
                            <div className="search-input-wrapper">
                                <FontAwesomeIcon icon={faMagnifyingGlass} />
                                <input
                                    type="text"
                                    placeholder="Tìm theo mã đơn (#ORD-...), tên người nhận, SĐT, địa chỉ..."
                                    value={search}
                                    onChange={(e) => {
                                        setSearch(e.target.value);
                                        setPage(0);
                                    }}
                                />
                            </div>
                        </div>

                        <div className="col-6 col-sm-4 col-md-3">
                            <select
                                className="filter-select"
                                value={statusFilter}
                                onChange={(e) => {
                                    setStatusFilter(e.target.value);
                                    setPage(0);
                                }}
                            >
                                <option value="ALL">Trạng thái: Tất cả</option>
                                <option value={OrderStatus.PENDING_PAYMENT}>Chờ thanh toán</option>
                                <option value={OrderStatus.PENDING}>Chờ xác nhận</option>
                                <option value={OrderStatus.CONFIRMED}>Đã xác nhận</option>
                                <option value={OrderStatus.PROCESSING}>Đang gia công</option>
                                <option value={OrderStatus.DELIVERING}>Đang giao</option>
                                <option value={OrderStatus.SHIPPED}>Đã gửi hàng</option>
                                <option value={OrderStatus.DELIVERED}>Đã giao thành công</option>
                                <option value={OrderStatus.CANCELLED}>Đã hủy đơn</option>
                            </select>
                        </div>

                        <div className="col-6 col-sm-4 col-md-2">
                            <select
                                className="filter-select"
                                value={sortBy}
                                onChange={(e) => {
                                    setSortBy(e.target.value);
                                    setPage(0);
                                }}
                            >
                                <option value="createdAt">Sắp xếp: Mới nhất</option>
                                <option value="totalPrice">Sắp xếp: Giá trị đơn</option>
                                <option value="id">Sắp xếp: Mã đơn</option>
                            </select>
                        </div>

                        <div className="col-12 col-sm-4 col-md-2">
                            <button
                                type="button"
                                className="btn-action-secondary w-100 d-flex align-items-center justify-content-center gap-2"
                                onClick={() => {
                                    setSearch("");
                                    setStatusFilter("ALL");
                                    setSortBy("createdAt");
                                    setSortDir("desc");
                                    setPage(0);
                                }}
                                style={{ height: "38px" }}
                            >
                                <FontAwesomeIcon icon={faRotate} className={loading ? "fa-spin" : ""} />
                                <span>Đặt lại</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── BẢNG DỮ LIỆU ĐƠN HÀNG (table-card & admin-table) ── */}
                <div className="table-card">
                    <div className="table-responsive">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th style={{ width: "15%" }}>Mã đơn &amp; Ngày tạo</th>
                                    <th style={{ width: "24%" }}>Khách hàng &amp; Người nhận</th>
                                    <th style={{ width: "24%" }}>Sản phẩm đặt mua</th>
                                    <th style={{ width: "15%" }}>Tổng thanh toán</th>
                                    <th style={{ width: "12%" }}>Trạng thái</th>
                                    <th style={{ width: "10%", textAlign: "center" }}>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-5">
                                            <span className="spinner-border text-danger me-2" role="status" />
                                            Đang tải dữ liệu đơn hàng từ máy chủ...
                                        </td>
                                    </tr>
                                ) : orders.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-5 text-muted">
                                            <FontAwesomeIcon icon={faBagShopping} className="fs-2 mb-2 d-block opacity-50" />
                                            Không tìm thấy đơn hàng nào phù hợp với bộ lọc.
                                        </td>
                                    </tr>
                                ) : (
                                    orders.map((order) => {
                                        const initials = getInitials(order.recipientName || order.customerName);
                                        const avatarTone = getAvatarTone(order.id);

                                        return (
                                            <tr key={order.id}>
                                                {/* Cột 1: Mã đơn & Ngày tạo */}
                                                <td>
                                                    <div className="customer-name-id">
                                                        <span className="customer-name font-monospace">
                                                            {order.code || `#ORD-${order.id}`}
                                                        </span>
                                                        <span className="customer-id">
                                                            {order.createdAt
                                                                ? new Date(order.createdAt).toLocaleDateString("vi-VN", {
                                                                      day: "2-digit",
                                                                      month: "2-digit",
                                                                      year: "numeric",
                                                                      hour: "2-digit",
                                                                      minute: "2-digit",
                                                                  })
                                                                : "Chưa cập nhật"}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Cột 2: Khách hàng & Người nhận (theo mẫu customer-cell) */}
                                                <td>
                                                    <div className="customer-cell">
                                                        <span className={`customer-avatar ${avatarTone}`}>
                                                            {initials}
                                                        </span>
                                                        <div className="customer-name-id">
                                                            <div className="d-flex align-items-center">
                                                                <span className="customer-name">
                                                                    {order.recipientName || order.customerName || "Khách vãng lai"}
                                                                </span>
                                                            </div>
                                                            <span className="contact-phone">
                                                                {order.phoneNumber || order.customerPhone || "Chưa có SĐT"}
                                                            </span>
                                                            {order.customerEmail && (
                                                                <span className="text-secondary" style={{ fontSize: "11px" }}>
                                                                    {order.customerEmail}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Cột 3: Sản phẩm đặt mua */}
                                                <td>
                                                    <div className="d-flex flex-column">
                                                        <span className="customer-name" style={{ fontSize: "12.5px" }}>
                                                            {order.productSummary || `Đơn hàng #${order.id}`}
                                                        </span>
                                                        <div className="d-flex align-items-center gap-2 mt-1">
                                                            <span className="text-secondary" style={{ fontSize: "11px" }}>
                                                                <FontAwesomeIcon icon={faBoxesPacking} className="me-1 text-muted" />
                                                                {order.itemCount} sản phẩm
                                                            </span>
                                                            {order.productType === ProductType.CUSTOM && (
                                                                <span className="badge bg-purple-subtle text-purple-emphasis" style={{ fontSize: "10px" }}>
                                                                    Tùy chỉnh
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Cột 4: Tổng thanh toán */}
                                                <td>
                                                    <div className="ltv-cell">
                                                        <span className="ltv-amount text-danger" style={{ fontSize: "13px" }}>
                                                            {(order.totalPrice || 0).toLocaleString("vi-VN")}đ
                                                        </span>
                                                        <span className="ltv-sub">
                                                            {order.paymentMethod || "COD"} • {getPaymentStatusLabel(order)}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Cột 5: Trạng thái (status-pill chuẩn UserManager) */}
                                                <td>
                                                    <span className={statusPillClass(order.status)}>
                                                        <span className="dot" />
                                                        {OrderStatusBadge[order.status]?.label || order.status}
                                                    </span>
                                                </td>

                                                {/* Cột 6: Thao tác (Icon buttons: Mắt, Bút, Thùng rác) */}
                                                <td style={{ textAlign: "center" }}>
                                                    <div className="d-flex align-items-center justify-content-center gap-2">
                                                        {/* Xem chi tiết (hình con mắt) */}
                                                        <button
                                                            type="button"
                                                            className="btn btn-sm btn-outline-primary d-inline-flex align-items-center justify-content-center rounded-3 shadow-none"
                                                            style={{ width: "32px", height: "32px", padding: 0 }}
                                                            onClick={() => handleViewDetail(order.id)}
                                                            title="Xem chi tiết đơn hàng"
                                                        >
                                                            <FontAwesomeIcon icon={faEye} />
                                                        </button>

                                                        {/* Chuyển trạng thái */}
                                                        <button
                                                            type="button"
                                                            className="btn btn-sm btn-outline-success d-inline-flex align-items-center justify-content-center rounded-3 shadow-none"
                                                            style={{ width: "32px", height: "32px", padding: 0 }}
                                                            onClick={() => handleOpenUpdateModal(order)}
                                                            title="Cập nhật trạng thái"
                                                        >
                                                            <FontAwesomeIcon icon={faPenToSquare} />
                                                        </button>

                                                        {/* Hủy đơn */}
                                                        <button
                                                            type="button"
                                                            className="btn btn-sm btn-outline-danger d-inline-flex align-items-center justify-content-center rounded-3 shadow-none"
                                                            style={{ width: "32px", height: "32px", padding: 0 }}
                                                            onClick={() => handleDeleteOrder(order)}
                                                            title="Hủy đơn hàng"
                                                        >
                                                            <FontAwesomeIcon icon={faTrash} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Phân trang chuẩn UserManager */}
                    {renderPagination()}
                </div>
            </div>

            {/* Modal: Xem chi tiết đơn hàng */}
            <AdminOrderDetailModal
                order={detailOrder}
                loading={loadingDetail}
                onClose={() => setDetailOrder(null)}
                onOpenStatusUpdate={(ord) => {
                    setEditingOrder(ord);
                    setShowUpdateModal(true);
                }}
            />

            {/* Modal: Cập nhật trạng thái đơn hàng */}
            <AdminUpdateOrderStatusModal
                order={editingOrder}
                show={showUpdateModal}
                onClose={() => {
                    setShowUpdateModal(false);
                    setEditingOrder(null);
                }}
                onSave={handleSaveStatusUpdate}
            />
        </div>
    );
}
