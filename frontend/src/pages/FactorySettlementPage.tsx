import { useState, useEffect, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faHandHoldingDollar,
    faCoins,
    faPercent,
    faReceipt,
    faRotate,
    faCreditCard,
    faCheckCircle,
    faClock,
    faLock,
    faSpinner,
    faChevronDown,
    faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import SideBarFactory from "../components/admin/factory/SideBarFactory";
import { FactorySettlementService } from "../api/factory/FactorySettlementService";
import "../css/pages/dashboard/admin.css";
import "../css/pages/dashboard/dashboard.css";
import type {
    FactorySettlementSummary,
    FactoryOrderSettlement,
    SettlementHistoryItem,
} from "../api/admin/AdminSettlementService";

const formatVnd = (val?: number) => (val || 0).toLocaleString("vi-VN") + " đ";

export default function FactorySettlementPage() {
    const [summary, setSummary] = useState<FactorySettlementSummary | null>(null);
    const [orders, setOrders] = useState<FactoryOrderSettlement[]>([]);
    const [history, setHistory] = useState<SettlementHistoryItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [activeTab, setActiveTab] = useState<"orders" | "history">("orders");
    const [orderFilter, setOrderFilter] = useState<"pending" | "settled" | "all">("all");
    const [expandedOrderIds, setExpandedOrderIds] = useState<Set<number>>(new Set());
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(10);

    const toggleOrderCollapse = (orderId: number) => {
        setExpandedOrderIds((prev) => {
            const next = new Set(prev);
            if (next.has(orderId)) {
                next.delete(orderId);
            } else {
                next.add(orderId);
            }
            return next;
        });
    };

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [sumData, ordersData, historyData] = await Promise.all([
                FactorySettlementService.getSummary(0.08),
                FactorySettlementService.getOrders(0.08),
                FactorySettlementService.getHistory(),
            ]);
            setSummary(sumData);
            setOrders(ordersData);
            setHistory(historyData);
            if (sumData && sumData.remainingAmount > 0) {
                setOrderFilter("pending");
            }
        } catch (err) {
            console.error("Lỗi khi tải thông tin đối soát giải ngân của xưởng:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const pendingOrders = orders.filter((o) => !o.isSettled);
    const settledOrders = orders.filter((o) => !!o.isSettled);
    const displayedOrders =
        orderFilter === "pending"
            ? pendingOrders
            : orderFilter === "settled"
            ? settledOrders
            : orders;

    const totalPendingAmount = pendingOrders.reduce((sum, o) => sum + o.netAmount, 0);
    const totalSettledAmount = settledOrders.reduce((sum, o) => sum + o.netAmount, 0);

    const totalPages = Math.ceil(displayedOrders.length / pageSize) || 1;
    const paginatedOrders = displayedOrders.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    return (
        <div className="row g-0 min-vh-100 bg-light">
            {/* Sidebar Xưởng */}
            <aside
                className="col-12 col-xl-2 flex-shrink-0 position-sticky top-0 align-self-start"
                style={{ height: "100vh", zIndex: 100 }}
            >
                <SideBarFactory isSettlement={true} />
            </aside>

            {/* Nội dung chính */}
            <main className="col-12 col-xl-10 p-3 p-lg-4 admin-content overflow-x-auto d-flex flex-column gap-4" style={{ minWidth: 0 }}>
                {/* Header */}
                <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
                    <div>
                        <h4 className="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
                            <span className="badge p-2 rounded-3 bg-danger-subtle text-danger">
                                <FontAwesomeIcon icon={faHandHoldingDollar} />
                            </span>
                            Quản Lý Giải Ngân &amp; Đối Soát Doanh Thu
                            <span className="badge rounded-pill bg-light text-secondary border fw-normal fs-6">
                                <FontAwesomeIcon icon={faLock} className="me-1 small" />
                                Chỉ xem đối soát
                            </span>
                        </h4>
                        <p className="text-secondary small mb-0">
                            Theo dõi doanh thu thực tế, chi phí dịch vụ sàn và lịch sử các đợt giải ngân tiền về tài khoản ngân hàng
                        </p>
                    </div>

                    <div className="d-flex align-items-center gap-2">
                        <button
                            className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-2 rounded-pill px-3 shadow-sm bg-white"
                            onClick={loadData}
                            disabled={loading}
                            title="Làm mới số liệu đối soát"
                        >
                            <FontAwesomeIcon icon={faRotate} spin={loading} />
                            <span className="small fw-semibold">{loading ? "Đang đồng bộ..." : "Làm mới"}</span>
                        </button>
                    </div>
                </div>

                {/* Thẻ Tài Khoản Thụ Hưởng Cố Định (Chỉ xem) */}
                {summary && (
                    <div className="bg-white rounded-4 p-3 shadow-sm border border-light-subtle d-flex flex-wrap justify-content-between align-items-center gap-3">
                        <div className="d-flex align-items-center gap-3">
                            <span className="badge rounded-circle p-3 bg-primary-subtle text-primary fs-5">
                                <FontAwesomeIcon icon={faCreditCard} />
                            </span>
                            <div>
                                <div className="text-secondary small fw-semibold">Tài khoản ngân hàng thụ hưởng nhận giải ngân</div>
                                <div className="d-flex align-items-center gap-2 flex-wrap mt-1">
                                    <span className="fw-bold text-dark">{summary.bankName}</span>
                                    <span className="badge bg-light text-dark font-monospace border px-2 py-1">
                                        STK: {summary.accountNumber}
                                    </span>
                                    <span className="badge bg-light text-secondary border px-2 py-1">
                                        Chủ TK: {summary.accountHolder}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="d-flex align-items-center gap-2">
                            <span className="badge rounded-pill bg-success-subtle text-success border border-success-subtle px-3 py-2 small fw-semibold">
                                <FontAwesomeIcon icon={faCheckCircle} className="me-1" />
                                Tài khoản nhận tiền chính thức
                            </span>
                        </div>
                    </div>
                )}

                {/* 4 Thẻ KPI Tài chính Đối Soát */}
                <div className="row g-3">
                    {/* Thẻ 1: Tổng tiền hàng hoàn tất */}
                    <div className="col-12 col-sm-6 col-xl-3">
                        <div className="card border-0 shadow-sm rounded-4 h-100 bg-white">
                            <div className="card-body p-3 p-lg-4 d-flex flex-column justify-content-between">
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                    <span className="text-secondary small fw-semibold text-uppercase">Tiền hàng hoàn tất (Gross)</span>
                                    <span className="badge rounded-circle p-2 bg-primary-subtle text-primary">
                                        <FontAwesomeIcon icon={faCoins} />
                                    </span>
                                </div>
                                <div>
                                    <h3 className="fw-bold text-dark mb-1">
                                        {formatVnd(summary?.grossSales)}
                                    </h3>
                                    <span className="text-secondary small">
                                        Từ {summary?.deliveredOrdersCount ?? 0} đơn hàng đã giao thành công
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Thẻ 2: Phí dịch vụ sàn */}
                    <div className="col-12 col-sm-6 col-xl-3">
                        <div className="card border-0 shadow-sm rounded-4 h-100 bg-white">
                            <div className="card-body p-3 p-lg-4 d-flex flex-column justify-content-between">
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                    <span className="text-secondary small fw-semibold text-uppercase">Phí dịch vụ sàn (8%)</span>
                                    <span className="badge rounded-circle p-2 bg-danger-subtle text-danger">
                                        <FontAwesomeIcon icon={faPercent} />
                                    </span>
                                </div>
                                <div>
                                    <h3 className="fw-bold text-danger mb-1">
                                        -{formatVnd(summary?.platformFee)}
                                    </h3>
                                    <span className="text-secondary small">
                                        Chiết khấu 8% phí vận hành sàn thương mại
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Thẻ 3: Thực tế xưởng nhận */}
                    <div className="col-12 col-sm-6 col-xl-3">
                        <div className="card border-0 shadow-sm rounded-4 h-100 bg-white">
                            <div className="card-body p-3 p-lg-4 d-flex flex-column justify-content-between">
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                    <span className="text-secondary small fw-semibold text-uppercase">Thực tế nhận được (Net)</span>
                                    <span className="badge rounded-circle p-2 bg-success-subtle text-success">
                                        <FontAwesomeIcon icon={faHandHoldingDollar} />
                                    </span>
                                </div>
                                <div>
                                    <h3 className="fw-bold text-success mb-1">
                                        {formatVnd(summary?.netPayable)}
                                    </h3>
                                    <span className="text-secondary small">
                                        Doanh thu thực tế của xưởng sau trừ phí sàn
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Thẻ 4: Đã nhận / Còn lại */}
                    <div className="col-12 col-sm-6 col-xl-3">
                        <div className="card border-0 shadow-sm rounded-4 h-100 bg-white">
                            <div className="card-body p-3 p-lg-4 d-flex flex-column justify-content-between">
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                    <span className="text-secondary small fw-semibold text-uppercase">Đã nhận / Chờ giải ngân</span>
                                    <span className="badge rounded-circle p-2 bg-info-subtle text-info">
                                        <FontAwesomeIcon icon={faClock} />
                                    </span>
                                </div>
                                <div>
                                    <h3 className="fw-bold text-dark mb-1">
                                        {formatVnd(summary?.disbursedAmount)}
                                    </h3>
                                    <span className="text-danger small fw-semibold">
                                        Còn chờ sàn chuyển: {formatVnd(summary?.remainingAmount)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Danh Sách Chi Tiết: Tabs Đơn Hàng & Lịch Sử Giải Ngân */}
                <div className="card border-0 shadow-sm rounded-4 bg-white overflow-hidden">
                    <div className="card-header bg-white border-bottom p-3 d-flex flex-wrap justify-content-between align-items-center gap-3">
                        <div className="nav nav-pills gap-2">
                            <button
                                className={`nav-link rounded-pill px-4 py-2 small fw-bold d-flex align-items-center gap-2 ${
                                    activeTab === "orders" ? "active bg-danger text-white" : "text-secondary bg-light"
                                }`}
                                onClick={() => setActiveTab("orders")}
                            >
                                <FontAwesomeIcon icon={faReceipt} />
                                Đơn Hàng Đối Soát ({orders.length})
                            </button>
                            <button
                                className={`nav-link rounded-pill px-4 py-2 small fw-bold d-flex align-items-center gap-2 ${
                                    activeTab === "history" ? "active bg-danger text-white" : "text-secondary bg-light"
                                }`}
                                onClick={() => setActiveTab("history")}
                            >
                                <FontAwesomeIcon icon={faCheckCircle} />
                                Lịch Sử Nhận Tiền Từ Sàn ({history.length})
                            </button>
                        </div>
                    </div>

                    <div className="card-body p-3 p-lg-4 d-flex flex-column" style={{ minHeight: "580px" }}>
                        {/* TAB 1: Danh Sách Đơn Hàng Đối Soát */}
                        {activeTab === "orders" && (
                            <div>
                                {/* Sub-tabs lọc trạng thái giải ngân */}
                                <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3 pb-3 border-bottom">
                                    <div className="nav nav-pills gap-2">
                                        <button
                                            type="button"
                                            className={`nav-link rounded-pill px-3 py-1 small fw-bold d-flex align-items-center gap-2 ${
                                                orderFilter === "pending"
                                                    ? "active bg-warning-subtle text-warning-emphasis border border-warning"
                                                    : "bg-light text-secondary border-0"
                                            }`}
                                            onClick={() => {
                                                setOrderFilter("pending");
                                                setCurrentPage(1);
                                            }}
                                        >
                                            <FontAwesomeIcon icon={faClock} />
                                            Chưa giải ngân ({pendingOrders.length})
                                        </button>

                                        <button
                                            type="button"
                                            className={`nav-link rounded-pill px-3 py-1 small fw-bold d-flex align-items-center gap-2 ${
                                                orderFilter === "settled"
                                                    ? "active bg-success text-white shadow-sm"
                                                    : "bg-light text-secondary border-0"
                                            }`}
                                            onClick={() => {
                                                setOrderFilter("settled");
                                                setCurrentPage(1);
                                            }}
                                        >
                                            <FontAwesomeIcon icon={faCheckCircle} />
                                            Đã giải ngân ({settledOrders.length})
                                        </button>

                                        <button
                                            type="button"
                                            className={`nav-link rounded-pill px-3 py-1 small fw-bold d-flex align-items-center gap-2 ${
                                                orderFilter === "all"
                                                    ? "active bg-dark text-white shadow-sm"
                                                    : "bg-light text-secondary border-0"
                                            }`}
                                            onClick={() => {
                                                setOrderFilter("all");
                                                setCurrentPage(1);
                                            }}
                                        >
                                            Tất cả ({orders.length})
                                        </button>
                                    </div>

                                    <div className="d-flex align-items-center gap-2 small">
                                        {displayedOrders.length > 0 && (
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-outline-secondary py-1 px-2 border-0 small text-decoration-none"
                                                style={{ fontSize: "12px" }}
                                                onClick={() => {
                                                    if (expandedOrderIds.size === displayedOrders.length) {
                                                        setExpandedOrderIds(new Set());
                                                    } else {
                                                        setExpandedOrderIds(new Set(displayedOrders.map((o) => o.orderId)));
                                                    }
                                                }}
                                            >
                                                <FontAwesomeIcon
                                                    icon={expandedOrderIds.size === displayedOrders.length ? faChevronDown : faChevronRight}
                                                    className="me-1"
                                                />
                                                {expandedOrderIds.size === displayedOrders.length ? "Thu gọn tất cả" : "Mở rộng tất cả"}
                                            </button>
                                        )}

                                        {orderFilter === "pending" && (
                                            <span className="badge rounded-pill bg-warning-subtle text-warning-emphasis border border-warning-subtle px-3 py-2 fw-bold">
                                                Sàn chờ chuyển: {formatVnd(totalPendingAmount)}
                                            </span>
                                        )}
                                        {orderFilter === "settled" && (
                                            <span className="badge rounded-pill bg-success-subtle text-success border border-success-subtle px-3 py-2 fw-bold">
                                                Đã nhận thanh toán: {formatVnd(totalSettledAmount)}
                                            </span>
                                        )}
                                        {orderFilter === "all" && (
                                            <span className="badge rounded-pill bg-light text-dark border px-3 py-2 fw-semibold">
                                                Tổng thực nhận: {formatVnd(summary?.netPayable)}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {loading ? (
                                    <div className="text-center py-5">
                                        <FontAwesomeIcon icon={faSpinner} spin className="text-danger fs-3 mb-2" />
                                        <div className="text-secondary small">Đang tải danh sách đơn hàng đối soát...</div>
                                    </div>
                                ) : displayedOrders.length === 0 ? (
                                    <div
                                        className="text-center py-5 text-secondary d-flex flex-column justify-content-center align-items-center"
                                        style={{ minHeight: "360px" }}
                                    >
                                        <div className="fs-1 mb-2">🎉</div>
                                        <div className="fw-semibold text-dark fs-6 mb-1">
                                            {orderFilter === "pending"
                                                ? "Tất cả đơn hàng đã được Sàn giải ngân đủ"
                                                : "Không có đơn hàng nào"}
                                        </div>
                                        <div className="small text-muted">
                                            {orderFilter === "pending"
                                                ? "Tuyệt vời! Toàn bộ đơn hàng hoàn tất của xưởng đều đã được Sàn giải ngân đầy đủ."
                                                : "Không có dữ liệu đơn hàng trong danh mục này."}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="d-flex flex-column gap-2">
                                        {paginatedOrders.map((ord) => {
                                            const isExpanded = expandedOrderIds.has(ord.orderId);
                                            return (
                                                <div
                                                    key={ord.orderId}
                                                    className={`card border rounded-3 shadow-none transition-all ${
                                                        isExpanded ? "p-3" : "py-2 px-3"
                                                    } ${
                                                        ord.isSettled ? "bg-light border-light-subtle" : "bg-white border-warning-subtle"
                                                    }`}
                                                    style={{
                                                        borderLeft: ord.isSettled ? "4px solid #10b981" : "4px solid #f59e0b",
                                                    }}
                                                >
                                                    {/* Title Row: Click để mở/thu gọn */}
                                                    <div
                                                        className={`d-flex justify-content-between align-items-center flex-wrap gap-2 ${
                                                            isExpanded ? "mb-2 pb-2 border-bottom" : ""
                                                        }`}
                                                        style={{ cursor: "pointer", userSelect: "none" }}
                                                        onClick={() => toggleOrderCollapse(ord.orderId)}
                                                        role="button"
                                                        title={isExpanded ? "Bấm để thu gọn" : "Bấm để xem chi tiết sản phẩm và tính phí"}
                                                    >
                                                        <div className="d-flex align-items-center gap-2 flex-wrap">
                                                            <FontAwesomeIcon
                                                                icon={isExpanded ? faChevronDown : faChevronRight}
                                                                className="text-secondary"
                                                                style={{ fontSize: "11px", width: "12px" }}
                                                            />
                                                            <span className="fw-bold text-dark">Đơn hàng #{ord.orderId}</span>
                                                            <span className="badge rounded-pill bg-light text-secondary border px-2 py-0" style={{ fontSize: "11px" }}>
                                                                {ord.status}
                                                            </span>

                                                            {ord.isSettled ? (
                                                                <span className="badge rounded-pill bg-success-subtle text-success border border-success-subtle px-2 py-1 fw-semibold" style={{ fontSize: "11px" }}>
                                                                    <FontAwesomeIcon icon={faCheckCircle} className="me-1" />
                                                                    Đã giải ngân
                                                                </span>
                                                            ) : (
                                                                <span className="badge rounded-pill bg-warning-subtle text-warning-emphasis border border-warning-subtle px-2 py-1 fw-semibold" style={{ fontSize: "11px" }}>
                                                                    <FontAwesomeIcon icon={faClock} className="me-1" />
                                                                    Chờ sàn chuyển tiền
                                                                </span>
                                                            )}

                                                            <span className="text-secondary small">
                                                                Khách: {ord.recipientName} ({ord.paymentMethod})
                                                            </span>
                                                        </div>

                                                        <div className="d-flex align-items-center gap-3 text-nowrap flex-shrink-0">
                                                            {!isExpanded && (
                                                                <div className="d-none d-sm-flex align-items-center gap-2 small text-nowrap">
                                                                    <span className="text-muted">{ord.items.length} món</span>
                                                                    <span className="text-muted">•</span>
                                                                    <span className="text-success fw-bold">{formatVnd(ord.netAmount)}</span>
                                                                </div>
                                                            )}
                                                            <span className="text-secondary small">
                                                                {ord.createdAt ? new Date(ord.createdAt).toLocaleDateString("vi-VN") : ""}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Chi tiết đơn hàng khi mở rộng */}
                                                    {isExpanded && (
                                                        <>
                                                            {/* Danh sách sản phẩm của xưởng */}
                                                            <ul className="list-unstyled mb-2 d-flex flex-column gap-1 small mt-2">
                                                                {ord.items.map((it, idx) => (
                                                                    <li key={idx} className="d-flex justify-content-between text-secondary">
                                                                        <span>
                                                                            • {it.productName} {it.mil ? `(${it.mil}ml)` : ""} × <strong>{it.quantity}</strong>
                                                                        </span>
                                                                        <span className="fw-semibold text-dark">
                                                                            {formatVnd(it.lineTotal)}
                                                                        </span>
                                                                    </li>
                                                                ))}
                                                            </ul>

                                                            {/* Tính toán đối soát */}
                                                            <div className="pt-2 border-top d-flex justify-content-between align-items-end flex-wrap gap-2">
                                                                <div className="text-secondary small">
                                                                    <span className="badge bg-light text-secondary border">Thanh toán: {ord.paymentMethod}</span>
                                                                </div>
                                                                <div className="d-flex flex-column gap-1 small" style={{ minWidth: "260px" }}>
                                                                    <div className="d-flex justify-content-between text-secondary">
                                                                        <span>Tổng tiền:</span>
                                                                        <strong className="text-dark">{formatVnd(ord.orderGross)}</strong>
                                                                    </div>
                                                                    <div className="d-flex justify-content-between text-danger">
                                                                        <span>Phí sàn (8%):</span>
                                                                        <strong className="text-danger">-{formatVnd(ord.platformFee)}</strong>
                                                                    </div>
                                                                    <div className="d-flex justify-content-between align-items-center text-success fw-bold pt-1 border-top">
                                                                        <span>Thực nhận:</span>
                                                                        <span className="fs-6 text-success fw-bold">{formatVnd(ord.netAmount)}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* Phân trang đơn hàng */}
                                {!loading && displayedOrders.length > 0 && (
                                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 pt-3 mt-3 border-top">
                                        <div className="d-flex align-items-center gap-2 text-secondary small">
                                            <span>Hiển thị</span>
                                            <select
                                                className="form-select form-select-sm"
                                                style={{ width: "75px" }}
                                                value={pageSize}
                                                onChange={(e) => {
                                                    setPageSize(Number(e.target.value));
                                                    setCurrentPage(1);
                                                }}
                                            >
                                                <option value={10}>10</option>
                                                <option value={20}>20</option>
                                                <option value={30}>30</option>
                                                <option value={50}>50</option>
                                            </select>
                                            <span>
                                                / {displayedOrders.length} đơn (Trang {currentPage}/{totalPages})
                                            </span>
                                        </div>

                                        {totalPages > 1 && (
                                            <nav>
                                                <ul className="pagination pagination-sm mb-0">
                                                    <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                                                        <button
                                                            className="page-link"
                                                            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                                                        >
                                                            Trước
                                                        </button>
                                                    </li>
                                                    {Array.from({ length: totalPages }).map((_, idx) => {
                                                        const p = idx + 1;
                                                        if (
                                                            totalPages <= 7 ||
                                                            p === 1 ||
                                                            p === totalPages ||
                                                            (p >= currentPage - 1 && p <= currentPage + 1)
                                                        ) {
                                                            return (
                                                                <li key={p} className={`page-item ${p === currentPage ? "active" : ""}`}>
                                                                    <button className="page-link" onClick={() => setCurrentPage(p)}>
                                                                        {p}
                                                                    </button>
                                                                </li>
                                                            );
                                                        }
                                                        if (p === currentPage - 2 || p === currentPage + 2) {
                                                            return (
                                                                <li key={p} className="page-item disabled">
                                                                    <span className="page-link">...</span>
                                                                </li>
                                                            );
                                                        }
                                                        return null;
                                                    })}
                                                    <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                                                        <button
                                                            className="page-link"
                                                            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                                                        >
                                                            Sau
                                                        </button>
                                                    </li>
                                                </ul>
                                            </nav>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* TAB 2: Lịch Sử Nhận Tiền Từ Sàn */}
                        {activeTab === "history" && (
                            <div className="table-responsive" style={{ maxHeight: "560px", overflowY: "auto" }}>
                                <table className="table table-hover align-middle mb-0" style={{ minWidth: "900px", fontSize: "0.825rem" }}>
                                    <thead
                                        className="text-secondary text-uppercase fw-semibold position-sticky top-0"
                                        style={{
                                            zIndex: 5,
                                            backgroundColor: "#f8fafc",
                                            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
                                            fontSize: "0.75rem",
                                        }}
                                    >
                                        <tr>
                                            <th className="ps-3 text-nowrap" style={{ backgroundColor: "#f8fafc" }}>Mã Giao Dịch</th>
                                            <th className="text-nowrap" style={{ backgroundColor: "#f8fafc" }}>Thời Gian Nhận</th>
                                            <th className="text-end text-nowrap" style={{ backgroundColor: "#f8fafc" }}>Doanh Số Đợt</th>
                                            <th className="text-end text-danger text-nowrap" style={{ backgroundColor: "#f8fafc" }}>Phí Sàn Khấu Trừ</th>
                                            <th className="text-end text-success fw-bold text-nowrap" style={{ backgroundColor: "#f8fafc" }}>Số Tiền Đã Nhận</th>
                                            <th className="text-nowrap" style={{ backgroundColor: "#f8fafc" }}>Ngân Hàng Nhận</th>
                                            <th className="text-nowrap" style={{ backgroundColor: "#f8fafc" }}>Trạng Thái</th>
                                            <th className="pe-3" style={{ backgroundColor: "#f8fafc" }}>Ghi Chú Từ Sàn</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {history.length === 0 ? (
                                            <tr>
                                                <td colSpan={8} className="text-center py-5 text-secondary">
                                                    Chưa có đợt thanh toán giải ngân nào từ Sàn
                                                </td>
                                            </tr>
                                        ) : (
                                            history.map((h) => (
                                                <tr key={h.id}>
                                                    <td className="ps-3 text-nowrap">
                                                        <span className="font-monospace fw-bold text-dark">{h.transactionCode}</span>
                                                    </td>
                                                    <td className="text-secondary text-nowrap" style={{ fontSize: "11px" }}>
                                                        {h.disbursedAt ? new Date(h.disbursedAt).toLocaleString("vi-VN") : "—"}
                                                    </td>
                                                    <td className="text-end text-secondary text-nowrap">
                                                        {formatVnd(h.grossSales)}
                                                    </td>
                                                    <td className="text-end text-danger text-nowrap">
                                                        -{formatVnd(h.platformFee)} (8%)
                                                    </td>
                                                    <td className="text-end text-success fw-bold text-nowrap">
                                                        {formatVnd(h.amount)}
                                                    </td>
                                                    <td className="text-nowrap">
                                                        <div className="fw-semibold" style={{ fontSize: "12px" }}>{h.bankName}</div>
                                                        <div className="font-monospace text-secondary" style={{ fontSize: "11px" }}>{h.accountNumber}</div>
                                                    </td>
                                                    <td className="text-nowrap">
                                                        <span className="badge rounded-pill bg-success-subtle text-success border border-success-subtle px-2 py-1" style={{ fontSize: "11px" }}>
                                                            <FontAwesomeIcon icon={faCheckCircle} className="me-1" />
                                                            Đã nhận tiền
                                                        </span>
                                                    </td>
                                                    <td className="pe-3 text-secondary" style={{ maxWidth: "220px", fontSize: "12px" }}>
                                                        {h.note || "Giải ngân tiền hàng"}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

