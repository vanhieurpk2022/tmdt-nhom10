import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faHouse,
    faBuilding,
    faUsers,
    faReceipt,
    faChartLine,
    faFlask,
    faGear,
    faDroplet,
    faBoxesStacked,
    faArrowRightFromBracket,
    faBars,
} from "@fortawesome/free-solid-svg-icons";
import type { IconProp } from "@fortawesome/fontawesome-svg-core";
import { Link, useNavigate } from "react-router";
import { ROUTES } from "../../../routes/routes";
import { useAuth } from "../../../api/AuthContext";
import { authService } from "../../../api/AuthService";
import { useAdminSidebar } from "../../../api/AdminSidebarContext";

interface SidebarAdminProps {
    isDashboard?: boolean;
    isWorkshopManagement?: boolean;
    isCustomer?: boolean;
    isOrder?: boolean;
    isProduct?: boolean;
    isRefund?: boolean;
    isVoucher?: boolean;
    isSupport?: boolean;
    collapsed?: boolean;
    onToggleCollapse?: () => void;
}

interface NavItemProps {
    to: string;
    icon: IconProp;
    label: string;
    isActive: boolean;
    badge?: string | number;
    badgeTone?: "dark" | "amber";
    isCollapsed?: boolean;
}

function NavItem({ to, icon, label, isActive, badge, badgeTone = "dark", isCollapsed = false }: NavItemProps) {
    return (
        <Link
            to={to}
            title={isCollapsed ? label : undefined}
            className={`d-flex align-items-center ${isCollapsed ? "justify-content-center px-0" : "gap-3 px-3"} py-2 my-1 text-decoration-none position-relative`}
            style={{
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: isActive ? 600 : 500,
                color: isActive ? "#ffffff" : "#94a3b8",
                backgroundColor: isActive ? "#e11d48" : "transparent",
                transition: "all 0.15s ease",
                height: "38px",
            }}
            onMouseEnter={(e) => {
                if (!isActive) {
                    e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.05)";
                    e.currentTarget.style.color = "#ffffff";
                }
            }}
            onMouseLeave={(e) => {
                if (!isActive) {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = "#94a3b8";
                }
            }}
        >
            <FontAwesomeIcon
                icon={icon}
                style={{
                    width: "16px",
                    color: isActive ? "#ffffff" : "#94a3b8",
                    fontSize: "14px",
                    flexShrink: 0,
                }}
            />
            {!isCollapsed && <span className="text-truncate">{label}</span>}

            {/* Chấm tròn báo hiệu mục đang active khi mở rộng */}
            {!isCollapsed && isActive && (
                <span
                    style={{
                        width: "6px",
                        height: "6px",
                        borderRadius: "50%",
                        backgroundColor: "#ffffff",
                        marginLeft: "auto",
                        flexShrink: 0,
                    }}
                />
            )}

            {/* Badge đếm số lượng khi mở rộng */}
            {!isCollapsed && !isActive && badge !== undefined && (
                <span
                    className="badge rounded-pill fw-bold"
                    style={{
                        marginLeft: "auto",
                        fontSize: "11px",
                        padding: "2px 7px",
                        backgroundColor: badgeTone === "amber" ? "#d97706" : "#1f2937",
                        color: "#ffffff",
                        border: badgeTone === "amber" ? "none" : "1px solid rgba(255, 255, 255, 0.1)",
                    }}
                >
                    {badge}
                </span>
            )}

            {/* Chấm nhỏ thông báo khi sidebar thu gọn */}
            {isCollapsed && !isActive && badge !== undefined && (
                <span
                    style={{
                        position: "absolute",
                        top: "6px",
                        right: "12px",
                        width: "7px",
                        height: "7px",
                        borderRadius: "50%",
                        backgroundColor: badgeTone === "amber" ? "#f59e0b" : "#e11d48",
                    }}
                />
            )}
        </Link>
    );
}

function SidebarAdmin({
    isDashboard = false,
    isWorkshopManagement = false,
    isCustomer = false,
    isOrder = false,
    isProduct = false,
    isRefund = false,
    isVoucher = false,
    isSupport = false,
    collapsed,
    onToggleCollapse,
}: SidebarAdminProps) {
    const { user, setUser } = useAuth();
    const navigate = useNavigate();
    const sidebarContext = useAdminSidebar();

    const isCollapsed = collapsed !== undefined ? collapsed : sidebarContext.isCollapsed;
    const toggleSidebar = onToggleCollapse || sidebarContext.toggleSidebar;

    const handleLogout = async () => {
        try {
            await authService.logout();
        } catch {
            /* ignore */
        } finally {
            setUser(null);
            navigate(ROUTES.LOGIN, { replace: true });
        }
    };

    const getInitials = (name?: string) => {
        if (!name?.trim()) return "AD";
        const parts = name.trim().split(/\s+/);
        if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    };

    return (
        <div
            className={`d-flex flex-column h-100 ${isCollapsed ? "px-2 py-3" : "p-3"} select-none`}
            style={{
                backgroundColor: "#111827",
                borderRight: "1px solid rgba(255, 255, 255, 0.08)",
                width: isCollapsed ? "72px" : "250px",
                transition: "width 0.25s cubic-bezier(0.4, 0, 0.2, 1), padding 0.25s ease",
            }}
        >
            {/* Header / Brand */}
            {isCollapsed ? (
                <div
                    className="d-flex align-items-center justify-content-center pb-3 mb-2 border-bottom"
                    style={{ borderColor: "rgba(255, 255, 255, 0.08)", minHeight: "53px" }}
                >
                    <button
                        type="button"
                        onClick={toggleSidebar}
                        className="btn btn-link p-0 text-white border-0 d-flex align-items-center justify-content-center"
                        title="Mở rộng thanh điều hướng"
                        style={{
                            width: "36px",
                            height: "36px",
                            backgroundColor: "rgba(255, 255, 255, 0.08)",
                            borderRadius: "10px",
                            color: "#ffffff",
                            cursor: "pointer",
                            textDecoration: "none",
                            transition: "all 0.15s ease",
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "#e11d48";
                            e.currentTarget.style.color = "#ffffff";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.08)";
                            e.currentTarget.style.color = "#ffffff";
                        }}
                    >
                        <FontAwesomeIcon icon={faBars} style={{ fontSize: "16px" }} />
                    </button>
                </div>
            ) : (
                <div
                    className="d-flex align-items-center gap-2 pb-3 mb-2 border-bottom"
                    style={{ borderColor: "rgba(255, 255, 255, 0.08)", minHeight: "53px" }}
                >
                    <div
                        className="d-flex align-items-center justify-content-center flex-shrink-0"
                        style={{
                            width: "36px",
                            height: "36px",
                            backgroundColor: "#e11d48",
                            borderRadius: "10px",
                            boxShadow: "0 2px 8px rgba(225, 29, 72, 0.35)",
                        }}
                    >
                        <FontAwesomeIcon icon={faDroplet} style={{ color: "#ffffff", fontSize: "17px" }} />
                    </div>

                    <div className="d-flex flex-column flex-grow-1" style={{ minWidth: 0 }}>
                        <div className="d-flex align-items-center justify-content-between">
                            <span className="fw-bold text-white text-truncate" style={{ fontSize: "14px", letterSpacing: "-0.2px" }}>
                                OILIA ADMIN
                            </span>
                            <button
                                type="button"
                                onClick={toggleSidebar}
                                className="btn btn-link p-1 text-secondary border-0"
                                title="Thu gọn thanh điều hướng"
                                style={{
                                    color: "#94a3b8",
                                    cursor: "pointer",
                                    lineHeight: 1,
                                    textDecoration: "none",
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.color = "#ffffff")}
                                onMouseLeave={(e) => (e.currentTarget.style.color = "#94a3b8")}
                            >
                                <FontAwesomeIcon icon={faBars} style={{ fontSize: "16px" }} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Navigation Body */}
            <div className="flex-grow-1 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
                {!isCollapsed ? (
                    <div className="px-2 pt-2 pb-1">
                        <span
                            className="text-uppercase fw-bold"
                            style={{
                                fontSize: "10px",
                                color: "#64748b",
                                letterSpacing: "0.6px",
                            }}
                        >
                            VẬN HÀNH LÕI
                        </span>
                    </div>
                ) : (
                    <div style={{ height: "8px" }} />
                )}

                <NavItem
                    to={ROUTES.ADMIN_DASHBOARD}
                    icon={faHouse}
                    label="Tổng quan vận hành"
                    isActive={isDashboard}
                    isCollapsed={isCollapsed}
                />
                <NavItem
                    to={ROUTES.ADMIN_WORKSHOP}
                    icon={faBuilding}
                    label="Xưởng & Công thức"
                    isActive={isWorkshopManagement}
                    badge="12"
                    badgeTone="dark"
                    isCollapsed={isCollapsed}
                />
                <NavItem
                    to={ROUTES.ADMIN_CUSTOMER}
                    icon={faUsers}
                    label="Quản lý Khách hàng"
                    isActive={isCustomer}
                    isCollapsed={isCollapsed}
                />
                <NavItem
                    to={ROUTES.ADMIN_ORDER}
                    icon={faReceipt}
                    label="Đơn đặt & Tranh chấp"
                    isActive={isOrder}
                    badge="2"
                    badgeTone="amber"
                    isCollapsed={isCollapsed}
                />
                <NavItem
                    to={ROUTES.ADMIN_PRODUCT}
                    icon={faBoxesStacked}
                    label="Quản lý Sản phẩm"
                    isActive={isProduct}
                    isCollapsed={isCollapsed}
                />
                <NavItem
                    to={ROUTES.REFUNDS}
                    icon={faReceipt}
                    label="Hoàn tiền VNPay"
                    isActive={isRefund}
                    isCollapsed={isCollapsed}
                />
                <NavItem
                    to={ROUTES.AdMIN_SALE}
                    icon={faChartLine}
                    label="Doanh thu & Phí sàn"
                    isActive={isVoucher}
                    isCollapsed={isCollapsed}
                />
                <NavItem
                    to={ROUTES.ADMIN_SUPPORT}
                    icon={faFlask}
                    label="Thư viện nốt hương"
                    isActive={isSupport}
                    isCollapsed={isCollapsed}
                />

                {!isCollapsed ? (
                    <div className="px-2 pt-3 pb-1">
                        <span
                            className="text-uppercase fw-bold"
                            style={{
                                fontSize: "10px",
                                color: "#64748b",
                                letterSpacing: "0.6px",
                            }}
                        >
                            HỆ THỐNG
                        </span>
                    </div>
                ) : (
                    <hr style={{ borderColor: "rgba(255, 255, 255, 0.08)", margin: "12px 4px" }} />
                )}

                <Link
                    to={ROUTES.ADMIN_DASHBOARD}
                    title={isCollapsed ? "Cài đặt hệ thống" : undefined}
                    className={`d-flex align-items-center ${isCollapsed ? "justify-content-center px-0" : "gap-3 px-3"} py-2 my-1 text-decoration-none`}
                    style={{
                        borderRadius: "8px",
                        fontSize: "13px",
                        fontWeight: 500,
                        color: "#94a3b8",
                        transition: "all 0.15s ease",
                        height: "38px",
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.05)";
                        e.currentTarget.style.color = "#ffffff";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                        e.currentTarget.style.color = "#94a3b8";
                    }}
                >
                    <FontAwesomeIcon icon={faGear} style={{ width: "16px", color: "#94a3b8", fontSize: "14px", flexShrink: 0 }} />
                    {!isCollapsed && <span className="text-truncate">Cài đặt hệ thống</span>}
                </Link>
            </div>

            {/* User Profile */}
            <div
                className="pt-3 mt-auto border-top"
                style={{ borderColor: "rgba(255, 255, 255, 0.08)" }}
            >
                {isCollapsed ? (
                    <div className="d-flex flex-column align-items-center gap-2">
                        <div
                            className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold flex-shrink-0"
                            title={`${user?.fullName || "Admin"} (${user?.email || "master@scentos.olla"})`}
                            style={{
                                width: "34px",
                                height: "34px",
                                backgroundColor: "#e11d48",
                                fontSize: "12px",
                                boxShadow: "0 2px 6px rgba(225, 29, 72, 0.3)",
                            }}
                        >
                            {getInitials(user?.fullName)}
                        </div>
                        <button
                            onClick={handleLogout}
                            className="btn btn-link p-1 text-secondary border-0"
                            title="Đăng xuất"
                            style={{ color: "#94a3b8", textDecoration: "none" }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = "#e11d48")}
                            onMouseLeave={(e) => (e.currentTarget.style.color = "#94a3b8")}
                        >
                            <FontAwesomeIcon icon={faArrowRightFromBracket} style={{ fontSize: "14px" }} />
                        </button>
                    </div>
                ) : (
                    <div className="d-flex align-items-center justify-content-between px-1">
                        <div className="d-flex align-items-center gap-2" style={{ minWidth: 0 }}>
                            <div
                                className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold flex-shrink-0"
                                style={{
                                    width: "34px",
                                    height: "34px",
                                    backgroundColor: "#e11d48",
                                    fontSize: "12px",
                                    boxShadow: "0 2px 6px rgba(225, 29, 72, 0.3)",
                                }}
                            >
                                {getInitials(user?.fullName)}
                            </div>

                            <div className="d-flex flex-column text-truncate" style={{ minWidth: 0 }}>
                                <span className="text-white fw-bold text-truncate" style={{ fontSize: "12px", lineHeight: "1.3" }}>
                                    {user?.fullName || "Admin Olla Group"}
                                </span>
                                <span className="text-truncate" style={{ fontSize: "11px", color: "#94a3b8" }}>
                                    {user?.email || "master@scentos.olla"}
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={handleLogout}
                            className="btn btn-link p-1 text-secondary ms-1 flex-shrink-0"
                            title="Đăng xuất"
                            style={{ color: "#94a3b8", textDecoration: "none" }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = "#e11d48")}
                            onMouseLeave={(e) => (e.currentTarget.style.color = "#94a3b8")}
                        >
                            <FontAwesomeIcon icon={faArrowRightFromBracket} style={{ fontSize: "15px" }} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default SidebarAdmin;
