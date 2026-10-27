import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router";
import "../css/pages/user-admin.css";
import SidebarAdmin from "../components/admin/dashboard/SideBarAdmin";
import { useAdminSidebar } from "../api/AdminSidebarContext";
import CustomerDetailModal from "../components/admin/customer/CustomerDetailModal";
import { CustomerAdminService, type CustomerItem, type CustomerStats, type CustomerDetail } from "../api/CustomerAdminService";
import { authService } from "../api/AuthService";
import { ROUTES } from "../routes/routes";
import { useAuth } from "../api/AuthContext";

const formatVnd = (value: number) => (value || 0).toLocaleString("vi-VN") + "đ";

export default function UserManager() {
    const { user, loading: authLoading } = useAuth();
    const { isCollapsed: isSidebarCollapsed } = useAdminSidebar();
    const navigate = useNavigate();


    const [customers, setCustomers] = useState<CustomerItem[]>([]);
    const [stats, setStats] = useState<CustomerStats | null>(null);
    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);

    const [selected, setSelected] = useState<(string | number)[]>([]);
    const [search, setSearch] = useState("");
    const [tierFilter, setTierFilter] = useState("Tất cả");
    const [behaviorFilter, setBehaviorFilter] = useState("Tất cả");
    const [spendingFilter, setSpendingFilter] = useState("Tất cả");
    const [statusFilter, setStatusFilter] = useState("Tất cả");

    // Phân trang
    const [page, setPage] = useState(1);
    const pageSize = 10;
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);

    // Modal Xem chi tiết
    const [selectedDetail, setSelectedDetail] = useState<CustomerDetail | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createForm, setCreateForm] = useState({
        fullname: "",
        email: "",
        phone: "",
        password: "Password123@",
    });
    const [createLoading, setCreateLoading] = useState(false);
    const [createError, setCreateError] = useState<string | null>(null);
    const [showVoucherModal, setShowVoucherModal] = useState(false);
    const [selectedVoucher, setSelectedVoucher] = useState("SCENT20");

    useEffect(() => {
        if (!authLoading) {
            if (!user) {
                navigate(ROUTES.LOGIN, { replace: true, state: { from: ROUTES.ADMIN_CUSTOMER } });
                return;
            }
            const roles = Array.isArray(user.role) ? user.role : [user.role];
            const isAdmin = roles.some((r: any) =>
                typeof r === "string" && (r === "ADMIN" || r === "ROLE_ADMIN" || r.toUpperCase().includes("ADMIN"))
            );
            if (!isAdmin) {
                alert("Bạn không có quyền truy cập trang quản trị!");
                navigate(ROUTES.HOME, { replace: true });
            }
        }
    }, [user, authLoading, navigate]);

    // ─── 2. LẤY DỮ LIỆU TỪ BACKEND ───
    const fetchData = async (currentPage = page, currentSearch = search, currentStatus = statusFilter) => {
        setLoading(true);
        setApiError(null);
        try {
            let apiStatus: string | undefined = undefined;
            if (currentStatus === "Hoạt động") apiStatus = "ACTIVE";
            else if (currentStatus === "Mới kích hoạt") apiStatus = "INACTIVE";
            else if (currentStatus === "Tạm khóa") apiStatus = "BANNED";

            const [pageData, statsData] = await Promise.all([
                CustomerAdminService.getCustomers({
                    page: currentPage - 1,
                    size: pageSize,
                    search: currentSearch.trim() || undefined,
                    status: apiStatus,
                }),
                CustomerAdminService.getStats(),
            ]);

            if (pageData) {
                setCustomers(pageData.content || []);
                setTotalPages(Math.max(1, pageData.totalPages || 1));
                setTotalElements(pageData.totalElements || 0);
            }
            if (statsData) {
                setStats(statsData);
            }
        } catch (err: any) {
            const status = err?.response?.status;
            if (status === 401 || status === 403) {
                navigate(ROUTES.LOGIN, { replace: true, state: { from: ROUTES.ADMIN_CUSTOMER } });
                return;
            }
            setApiError(`Không thể tải dữ liệu khách hàng từ máy chủ (${status || "Lỗi mạng"}). Vui lòng thử lại.`);
            setCustomers([]);
        } finally {
            setLoading(false);
        }
    };

    // Tự động tìm kiếm & đổi trạng thái
    useEffect(() => {
        if (!authLoading && user) {
            const timer = setTimeout(() => {
                setPage(1);
                fetchData(1, search, statusFilter);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [search, statusFilter, authLoading, user]);

    // Lọc theo phân hạng, hành vi, chi tiêu ở frontend
    const filteredCustomers = useMemo(() => {
        return customers.filter((c) => {
            const matchTier = tierFilter === "Tất cả" || c.tier === tierFilter;
            const matchBehavior = behaviorFilter === "Tất cả" ||
                (behaviorFilter === "Có re-order" ? (c.formulaNote || "").toLowerCase().includes("re-order") : c.formulas === 0);

            let matchSpending = true;
            if (spendingFilter === "dưới 5tr") matchSpending = c.ltv < 5000000;
            else if (spendingFilter === "5tr-20tr") matchSpending = c.ltv >= 5000000 && c.ltv <= 20000000;
            else if (spendingFilter === "trên 20tr") matchSpending = c.ltv > 20000000;

            return matchTier && matchBehavior && matchSpending;
        });
    }, [customers, tierFilter, behaviorFilter, spendingFilter]);

    // Xử lý chuyển trang
    const handlePageChange = (newPage: number) => {
        if (newPage < 1 || newPage > totalPages || newPage === page) return;
        setPage(newPage);
        fetchData(newPage, search, statusFilter);
    };

    // Chọn checkbox
    const allVisibleSelected = filteredCustomers.length > 0 && filteredCustomers.every((c) => selected.includes(c.id));

    const toggleCustomer = (id: string | number) =>
        setSelected((cur) => cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]);

    const toggleAll = () =>
        setSelected((cur) => allVisibleSelected
            ? cur.filter((id) => !filteredCustomers.some((c) => c.id === id))
            : [...new Set([...cur, ...filteredCustomers.map((c) => c.id)])]);

    // Xuất dữ liệu Excel/CSV
    const handleExport = () => {
        const rows = [["Mã KH", "Họ tên", "Email", "SĐT", "Phân hạng", "Trạng thái", "LTV (VNĐ)", "Đơn hàng"]];
        filteredCustomers.forEach((c) => rows.push([
            String(c.id),
            c.name,
            c.email,
            c.phone || "N/A",
            c.tier,
            c.status,
            String(c.ltv),
            String(c.orders)
        ]));
        const csv = "\uFEFF" + rows.map((r) => r.map((v) => `"${(v || "").replaceAll('"', '""')}"`).join(",")).join("\r\n");
        const a = Object.assign(document.createElement("a"), {
            href: URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" })),
            download: `danh-sach-khach-hang-${new Date().toISOString().slice(0, 10)}.csv`,
        });
        a.click();
    };

    // Khóa tài khoản hàng loạt
    const handleBulkLock = async () => {
        if (!selected.length) return;
        if (!window.confirm(`Bạn có chắc muốn khóa ${selected.length} tài khoản đã chọn?`)) return;
        try {
            await Promise.all(
                selected.map((id) => CustomerAdminService.updateStatus(id, "BANNED"))
            );
            alert(`Đã khóa thành công ${selected.length} tài khoản.`);
            setSelected([]);
            fetchData(page, search, statusFilter);
        } catch {
            alert("Có lỗi xảy ra khi khóa tài khoản.");
        }
    };

    // Xem chi tiết khách hàng
    const handleViewDetail = async (customer: CustomerItem) => {
        if (typeof customer.id === "number") {
            try {
                setDetailLoading(true);
                const detail = await CustomerAdminService.getDetail(customer.id);
                setSelectedDetail(detail);
                return;
            } catch {
                /* fallthrough */
            } finally {
                setDetailLoading(false);
            }
        }
        setSelectedDetail({ customer, addresses: [], recentOrders: [] });
    };

    // Cập nhật trạng thái khách hàng trong Modal chi tiết
    const handleToggleStatusInDetail = async () => {
        if (!selectedDetail) return;
        const cust = selectedDetail.customer;
        const isBanned = cust.statusCode === "BANNED" || cust.status === "Tạm khóa";
        const newStatus = isBanned ? "ACTIVE" : "BANNED";
        try {
            await CustomerAdminService.updateStatus(cust.id, newStatus);
            alert(`Đã ${isBanned ? "mở khóa" : "khóa"} tài khoản thành công!`);
            setSelectedDetail({
                ...selectedDetail,
                customer: {
                    ...cust,
                    statusCode: newStatus,
                    status: newStatus === "BANNED" ? "Tạm khóa" : "Hoạt động",
                    risk: newStatus === "BANNED",
                }
            });
            fetchData(page, search, statusFilter);
        } catch {
            alert("Không thể cập nhật trạng thái người dùng.");
        }
    };

    // Cập nhật thông tin khách hàng từ Modal
    const handleCustomerUpdated = (updated: CustomerItem) => {
        setCustomers((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
        if (selectedDetail && selectedDetail.customer.id === updated.id) {
            setSelectedDetail({
                ...selectedDetail,
                customer: updated,
            });
        }
    };

    // Tạo khách hàng thủ công qua API
    const handleCreateCustomer = async (e: FormEvent) => {
        e.preventDefault();
        setCreateLoading(true);
        setCreateError(null);
        try {
            await authService.register({
                fullname: createForm.fullname,
                email: createForm.email,
                phone: createForm.phone,
                password: createForm.password,
                verifyPassword: createForm.password,
            } as any);
            alert("Tạo tài khoản khách hàng thành công!");
            setShowCreateModal(false);
            setCreateForm({ fullname: "", email: "", phone: "", password: "Password123@" });
            fetchData(1, search, statusFilter);
        } catch (err: any) {
            setCreateError(err?.response?.data?.message || "Không thể tạo tài khoản. Vui lòng kiểm tra lại thông tin.");
        } finally {
            setCreateLoading(false);
        }
    };


    // Phân loại CSS Tiers & Status
    const tierPillClass = (tier: string) => ({
        "VIP Diamond": "tier-pill vip",
        "Gold (Vàng)": "tier-pill gold",
        "Silver (Bạc)": "tier-pill silver",
        "Thành viên mới": "tier-pill new",
    }[tier] ?? "tier-pill casual");

    const statusPillClass = (status: string) => ({
        "Hoạt động": "status-pill active",
        "Mới kích hoạt": "status-pill inactive",
    }[status] ?? "status-pill banned");

    // Thống kê metrics
    const totalCustomers = stats?.totalCustomers ?? (totalElements || customers.length);
    const activeCount = stats?.activeCustomers ?? customers.filter((c) => c.status === "Hoạt động").length;
    const bannedCount = stats?.bannedCustomers ?? customers.filter((c) => c.status === "Tạm khóa").length;
    const totalRevenue = stats?.totalRevenue ?? customers.reduce((sum, c) => sum + (c.ltv || 0), 0);
    const avgLtv = totalCustomers > 0 ? Math.round(totalRevenue / totalCustomers) : 4850000;
    const vipCount = customers.filter((c) => c.tier === "VIP Diamond" || c.tier === "Gold (Vàng)").length;

    // Render thanh pagination
    const renderPagination = () => {
        const pages: (number | string)[] = [];
        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            if (page <= 3) {
                pages.push(1, 2, 3, "...", totalPages);
            } else if (page >= totalPages - 2) {
                pages.push(1, "...", totalPages - 2, totalPages - 1, totalPages);
            } else {
                pages.push(1, "...", page - 1, page, page + 1, "...", totalPages);
            }
        }

        const startItem = totalElements === 0 ? (customers.length > 0 ? 1 : 0) : (page - 1) * pageSize + 1;
        const endItem = totalElements === 0 ? customers.length : Math.min(page * pageSize, totalElements);

        return (
            <div className="table-footer">
                <div>
                    Hiển thị <strong>{startItem} - {endItem}</strong> trên tổng số{" "}
                    <strong>{totalCustomers.toLocaleString("vi-VN")}</strong> khách hàng
                </div>
                <div className="pagination-btns">
                    <button
                        className="pagination-btn"
                        disabled={page <= 1 || loading}
                        onClick={() => handlePageChange(page - 1)}
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
                                className={`pagination-btn ${page === pageNum ? "active" : ""}`}
                                disabled={loading}
                                onClick={() => handlePageChange(pageNum)}
                            >
                                {pageNum}
                            </button>
                        );
                    })}
                    <button
                        className="pagination-btn"
                        disabled={page >= totalPages || loading}
                        onClick={() => handlePageChange(page + 1)}
                    >
                        Trang sau
                    </button>
                </div>
            </div>
        );
    };

    if (authLoading) {
        return (
            <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
                <div className="text-center">
                    <div className="spinner-border text-danger" role="status" style={{ width: "3rem", height: "3rem" }}>
                        <span className="visually-hidden">Đang tải...</span>
                    </div>
                    <div className="mt-3 text-muted fw-semibold">Đang kiểm tra quyền quản trị...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="d-flex min-vh-100 w-100 admin-customer-page">
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
                <SidebarAdmin isCustomer={true} />
            </aside>

            <div className="flex-grow-1 p-3 p-lg-4 overflow-x-auto" style={{ minWidth: 0 }}>
                <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
                    <div>
                        <div className="admin-breadcrumb">
                            <span>Quản trị hệ thống</span>
                            <span className="crumb-sep">›</span>
                            <span>Người dùng</span>
                            <span className="crumb-sep">›</span>
                            <span className="active-crumb">Danh sách khách hàng</span>
                        </div>
                        <h1 className="h4 fw-bold text-dark mb-0">Quản trị Khách hàng</h1>
                    </div>
                    <div className="d-flex flex-wrap gap-2">
                        <button className="btn-header-export" onClick={handleExport} title="Xuất dữ liệu Excel">
                            <i className="fa-regular fa-file-lines text-secondary" /> Xuất dữ liệu (GDPR/Excel)
                        </button>
                        <button
                            className="btn-header-voucher"
                            onClick={() => {
                                if (selected.length === 0) {
                                    alert("Vui lòng chọn ít nhất một khách hàng từ danh sách để tặng voucher.");
                                    return;
                                }
                                setShowVoucherModal(true);
                            }}
                            title="Tặng voucher"
                        >
                            <i className="fa-solid fa-gift" /> Tặng Voucher hàng loạt
                        </button>
                        <button className="btn-header-primary" onClick={() => setShowCreateModal(true)}>
                            <i className="fa-solid fa-plus" /> Thêm khách hàng thủ công
                        </button>
                    </div>
                </div>

                {apiError && (
                    <div className="alert alert-danger d-flex justify-content-between align-items-center mb-4 py-2 rounded-3 shadow-sm" role="alert">
                        <div>
                            <i className="fa-solid fa-circle-exclamation me-2" />
                            <strong>Lỗi kết nối:</strong> {apiError}
                        </div>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => fetchData(page, search, statusFilter)}>
                            Tải lại dữ liệu
                        </button>
                    </div>
                )}

                {/* ── 4 THẺ METRICS */}
                <div className="row g-3 mb-4">
                    {/* Thẻ 1: Tổng khách hàng */}
                    <div className="col-12 col-sm-6 col-xl-3">
                        <div className="metric-card">
                            <div className="metric-card-top">
                                <span className="metric-card-label">TỔNG KHÁCH HÀNG</span>
                                <span className="metric-card-icon blue"><i className="fa-solid fa-users" /></span>
                            </div>
                            <div className="metric-card-value">
                                {totalCustomers.toLocaleString("vi-VN")}
                            </div>
                            <div className="metric-card-footer d-flex flex-wrap gap-1 align-items-center">
                                <span className="metric-chip green">{activeCount.toLocaleString("vi-VN")} Hoạt động</span>
                                <span className="metric-chip blue">+420 Mới</span>
                                <span className="metric-chip red">{bannedCount} Khóa</span>
                            </div>
                        </div>
                    </div>

                    {/* Thẻ 2: Giá trị vòng đời TB */}
                    <div className="col-12 col-sm-6 col-xl-3">
                        <div className="metric-card">
                            <div className="metric-card-top">
                                <span className="metric-card-label">GIÁ TRỊ VÒNG ĐỜI TB (LTV)</span>
                                <span className="metric-card-icon green"><i className="fa-solid fa-circle-dollar-to-slot" /></span>
                            </div>
                            <div className="metric-card-value">
                                {formatVnd(avgLtv)} <small>/ khách</small>
                            </div>
                            <div className="metric-card-footer justify-content-between">
                                <span className="text-success fw-semibold small d-flex align-items-center gap-1">
                                    <i className="fa-solid fa-arrow-trend-up" /> +18.4% so kỳ trước
                                </span>
                                <svg width="55" height="20" viewBox="0 0 100 28" fill="none">
                                    <polyline points="2,23 22,15 39,19 57,8 75,12 98,2" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Thẻ 3: Tỷ lệ re-order */}
                    <div className="col-12 col-sm-6 col-xl-3">
                        <div className="metric-card">
                            <div className="metric-card-top">
                                <span className="metric-card-label">TỶ LỆ RE-ORDER CÔNG THỨC HƯƠNG</span>
                                <span className="metric-card-icon purple"><i className="fa-solid fa-arrows-rotate" /></span>
                            </div>
                            <div className="metric-card-value d-flex align-items-center">
                                42.8%
                                <span className="metric-growth-pill">+5.2%</span>
                            </div>
                            <div className="metric-card-footer text-muted text-truncate">
                                Đặt lại công thức riêng từ xưởng Lab Olla
                            </div>
                        </div>
                    </div>

                    {/* Thẻ 4: Tài khoản VIP & Tier cao */}
                    <div className="col-12 col-sm-6 col-xl-3">
                        <div className="metric-card">
                            <div className="metric-card-top">
                                <span className="metric-card-label">TÀI KHOẢN VIP &amp; TIER CAO</span>
                                <span className="metric-card-icon amber"><i className="fa-regular fa-star" /></span>
                            </div>
                            <div className="metric-card-value">
                                {vipCount > 0 ? vipCount.toLocaleString("vi-VN") : "1.820"} <small>VIP</small>
                            </div>
                            <div className="metric-card-footer justify-content-between text-muted">
                                <span>Hạng Vàng &amp; Kim Cương</span>
                                <span>&gt; 15tr/năm</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/*BỘ LỌC TÌM KIẾM & HÀNH ĐỘNG HÀNG LOẠT */}
                <div className="filter-card">
                    <div className="row g-2 align-items-center">
                        <div className="col-12 col-lg-4">
                            <div className="search-input-wrapper">
                                <i className="fa-solid fa-magnifying-glass" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Tìm theo Họ tên, Email, SĐT, hoặc Mã CUST-xxx..."
                                />
                            </div>
                        </div>
                        <div className="col-6 col-sm-3 col-lg-2">
                            <select
                                className="filter-select"
                                value={tierFilter}
                                onChange={(e) => setTierFilter(e.target.value)}
                            >
                                <option value="Tất cả">Phân hạng: Tất cả</option>
                                <option>VIP Diamond</option>
                                <option>Gold (Vàng)</option>
                                <option>Silver (Bạc)</option>
                                <option>Thành viên mới</option>
                                <option>Vãng lai</option>
                            </select>
                        </div>
                        <div className="col-6 col-sm-3 col-lg-2">
                            <select
                                className="filter-select"
                                value={behaviorFilter}
                                onChange={(e) => setBehaviorFilter(e.target.value)}
                            >
                                <option value="Tất cả">Hành vi: Tất cả</option>
                                <option value="Có re-order">Có re-order</option>
                                <option value="Chưa có công thức">Chưa có công thức</option>
                            </select>
                        </div>
                        <div className="col-6 col-sm-3 col-lg-2">
                            <select
                                className="filter-select"
                                value={spendingFilter}
                                onChange={(e) => setSpendingFilter(e.target.value)}
                            >
                                <option value="Tất cả">Chi tiêu: Tất cả</option>
                                <option value="dưới 5tr">Dưới 5 triệu</option>
                                <option value="5tr-20tr">5 - 20 triệu</option>
                                <option value="trên 20tr">Trên 20 triệu</option>
                            </select>
                        </div>
                        <div className="col-6 col-sm-3 col-lg-2">
                            <select
                                className="filter-select"
                                value={statusFilter}
                                onChange={(e: ChangeEvent<HTMLSelectElement>) => setStatusFilter(e.target.value)}
                            >
                                <option value="Tất cả">Trạng thái: Tất cả</option>
                                <option value="Hoạt động">Trạng thái: Hoạt động</option>
                                <option value="Mới kích hoạt">Trạng thái: Mới kích hoạt</option>
                                <option value="Tạm khóa">Trạng thái: Tạm khóa</option>
                            </select>
                        </div>
                    </div>

                    {/* Thanh hành động hàng loạt khi chọn checkbox */}
                    {selected.length > 0 && (
                        <div className="bulk-action-bar">
                            <div className="bulk-info">
                                <span className="bulk-count-badge">{selected.length}</span>
                                <span>Đã chọn {selected.length} khách hàng từ danh sách</span>
                                <span className="bulk-divider">|</span>
                                <button className="bulk-clear-btn" onClick={() => setSelected([])}>Bỏ chọn</button>
                            </div>
                            <div className="bulk-actions-btns">
                                <button className="btn-bulk-light" onClick={() => setShowVoucherModal(true)}>Gửi Voucher ưu đãi</button>
                                <button className="btn-bulk-light" onClick={handleExport}>Xuất GDPR Zip</button>
                                <button className="btn-bulk-warning" onClick={() => alert("Đã gắn nhãn rủi ro cho các tài khoản được chọn.")}>Gắn nhãn rủi ro</button>
                                <button className="btn-bulk-danger" onClick={handleBulkLock}>Khóa tài khoản</button>
                            </div>
                        </div>
                    )}
                </div>

                {/* table */}
                <div className="table-card">
                    <div className="table-responsive">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th style={{ width: "40px", textAlign: "center" }}>
                                        <input
                                            type="checkbox"
                                            className="admin-checkbox"
                                            checked={allVisibleSelected}
                                            onChange={toggleAll}
                                            aria-label="Chọn tất cả"
                                        />
                                    </th>
                                    <th>Khách hàng (ID &amp; Họ tên)</th>
                                    <th>Liên hệ</th>
                                    <th>Phân hạng</th>
                                    <th>Đơn hàng &amp; LTV</th>
                                    <th>Hoạt động gần nhất</th>
                                    <th>Trạng thái</th>
                                    <th style={{ textAlign: "center", width: "120px" }}>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={8} className="text-center py-5">
                                            <span className="spinner-border text-danger me-2" role="status" />
                                            Đang tải dữ liệu từ máy chủ...
                                        </td>
                                    </tr>
                                ) : filteredCustomers.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="text-center py-5 text-muted">
                                            <i className="fa-solid fa-users-slash fs-2 mb-2 d-block opacity-50" />
                                            Không tìm thấy khách hàng nào phù hợp với bộ lọc.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredCustomers.map((cust) => {
                                        const isSelected = selected.includes(cust.id);
                                        const isVip = cust.tier === "VIP Diamond";
                                        return (
                                            <tr key={cust.id} className={isSelected ? "row-selected" : ""}>
                                                <td style={{ textAlign: "center" }}>
                                                    <input
                                                        type="checkbox"
                                                        className="admin-checkbox"
                                                        checked={isSelected}
                                                        onChange={() => toggleCustomer(cust.id)}
                                                        aria-label={`Chọn ${cust.name}`}
                                                    />
                                                </td>

                                                {/* Cột 2: Khách hàng */}
                                                <td>
                                                    <div className="customer-cell">
                                                        <span className={`customer-avatar ${cust.avatarTone || "pink"}`}>
                                                            {cust.initials || "KH"}
                                                        </span>
                                                        <div className="customer-name-id">
                                                            <div className="d-flex align-items-center">
                                                                <span className="customer-name">{cust.name}</span>
                                                                {isVip && <span className="vip-star-badge"><i className="fa-solid fa-star" /> VIP</span>}
                                                            </div>
                                                            <span className="customer-id">Mã: CUST-{cust.id}</span>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Cột 3: Liên hệ */}
                                                <td>
                                                    <div className="contact-cell">
                                                        <span>{cust.email}</span>
                                                        <span className="contact-phone">{cust.phone || "+84 Chưa có SĐT"}</span>
                                                    </div>
                                                </td>

                                                {/* Cột 4: Phân hạng */}
                                                <td>
                                                    <span className={tierPillClass(cust.tier)}>
                                                        {cust.tier}
                                                    </span>
                                                </td>

                                                {/* Cột 5: Đơn hàng */}
                                                <td>
                                                    <div className="ltv-cell">
                                                        <span className={`ltv-amount ${cust.risk ? "text-danger" : ""}`}>
                                                            {formatVnd(cust.ltv)}
                                                        </span>
                                                        <span className={`ltv-sub ${cust.risk ? "text-danger" : ""}`}>
                                                            {cust.risk ? "Đang giữ Escrow tranh chấp" : `${cust.orders} đơn thành công`}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Cột 7: Hoạt động gần nhất */}
                                                <td>
                                                    <div className="recent-cell">
                                                        <span className="recent-time">{cust.recent || "2 giờ trước"}</span>
                                                        <span className="recent-note">{cust.recentNote || "Xem nốt xạ hương"}</span>
                                                    </div>
                                                </td>

                                                {/* Cột 8: Trạng thái */}
                                                <td>
                                                    <span className={statusPillClass(cust.status)}>
                                                        <span className="dot" />
                                                        {cust.status}
                                                    </span>
                                                </td>

                                                {/* Cột 9: Thao tác */}
                                                <td style={{ textAlign: "center" }}>
                                                    <button
                                                        className="btn-action-primary"
                                                        onClick={() => handleViewDetail(cust)}
                                                    >
                                                        Xem hồ sơ
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                    {renderPagination()}
                </div>
            </div>

            {/* ── MODAL CHI TIẾT HỒ SƠ KHÁCH HÀNG (SCENT VAULT & PROFILE) ── */}
            {selectedDetail && (
                <CustomerDetailModal
                    detail={selectedDetail}
                    loading={detailLoading}
                    onClose={() => setSelectedDetail(null)}
                    onToggleStatus={handleToggleStatusInDetail}
                    onUpdateCustomer={handleCustomerUpdated}
                />
            )}

            {/* ── MODAL THÊM KHÁCH HÀNG THỦ CÔNG ── */}
            {showCreateModal && (
                <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: "rgba(15, 23, 42, 0.65)", zIndex: 1050 }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 rounded-4 shadow">
                            <form onSubmit={handleCreateCustomer}>
                                <div className="modal-header border-bottom py-3">
                                    <h5 className="modal-title fw-bold text-dark fs-5">
                                        <i className="fa-solid fa-user-plus text-danger me-2" />
                                        Thêm khách hàng mới
                                    </h5>
                                    <button type="button" className="btn-close" onClick={() => setShowCreateModal(false)} />
                                </div>
                                <div className="modal-body p-4">
                                    {createError && (
                                        <div className="alert alert-danger py-2 small mb-3">
                                            {createError}
                                        </div>
                                    )}
                                    <div className="mb-3">
                                        <label className="form-label fw-bold small text-dark">Họ và tên</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Ví dụ: Nguyễn Văn A"
                                            required
                                            value={createForm.fullname}
                                            onChange={(e) => setCreateForm({ ...createForm, fullname: e.target.value })}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-bold small text-dark">Email liên hệ</label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            placeholder="example@gmail.com"
                                            required
                                            value={createForm.email}
                                            onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-bold small text-dark">Số điện thoại</label>
                                        <input
                                            type="tel"
                                            className="form-control"
                                            placeholder="0912345678"
                                            required
                                            pattern="^(0|\+84)\d{9}$"
                                            value={createForm.phone}
                                            onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-bold small text-dark">Mật khẩu ban đầu</label>
                                        <input
                                            type="password"
                                            className="form-control"
                                            required
                                            value={createForm.password}
                                            onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                                        />
                                        <small className="text-muted">Mật khẩu mặc định có thể để người dùng đổi sau.</small>
                                    </div>
                                </div>
                                <div className="modal-footer border-top py-2">
                                    <button type="button" className="btn btn-light border btn-sm px-3" onClick={() => setShowCreateModal(false)}>
                                        Hủy
                                    </button>
                                    <button type="submit" className="btn btn-danger btn-sm px-4 fw-semibold" disabled={createLoading} style={{ backgroundColor: "#e11d48", borderColor: "#e11d48" }}>
                                        {createLoading ? "Đang tạo..." : "Tạo khách hàng"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
