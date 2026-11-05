import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faHouse,
    faBuilding,
    faUsers,
    faReceipt,
    faBoxesStacked,
    faTag,
    faHeadset,
    faArrowRightFromBracket,
    faDroplet,
} from "@fortawesome/free-solid-svg-icons";
import type { IconProp } from "@fortawesome/fontawesome-svg-core";
import { Link, useNavigate } from "react-router";
import { ROUTES } from "../../../routes/routes";
import { useAuth } from "../../../api/AuthContext";
import { authService } from "../../../api/AuthService";

interface SidebarFactoryProps {
    isDashboard?: boolean;
    isProduct?: boolean;
    isOrder?: boolean;
    isStaff?: boolean;
    isVoucher?: boolean;
    isSupport?: boolean;
    isProfile?: boolean;
}

interface NavItemProps {
    to: string;
    icon: IconProp;
    label: string;
    isActive: boolean;
    badge?: string | number;
}

function NavItem({ to, icon, label, isActive, badge }: NavItemProps) {
    return (
        <Link
            to={to}
            className="d-flex align-items-center gap-3 px-3 py-2 my-1 text-decoration-none position-relative"
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
            <span className="text-truncate">{label}</span>

            {/* Chấm tròn báo hiệu mục đang active */}
            {isActive && (
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

            {/* Badge nếu có */}
            {!isActive && badge !== undefined && (
                <span
                    className="badge rounded-pill ms-auto px-2 py-1"
                    style={{
                        fontSize: "11px",
                        fontWeight: 600,
                        backgroundColor: "rgba(255, 255, 255, 0.1)",
                        color: "#e2e8f0",
                    }}
                >
                    {badge}
                </span>
            )}
        </Link>
    );
}

export function SideBarFactory({
    isDashboard = false,
    isProduct = false,
    isOrder = false,
    isStaff = false,
    isVoucher = false,
    isSupport = false,
    isProfile = false,
}: SidebarFactoryProps) {
    const { user, setUser } = useAuth();
    const navigate = useNavigate();

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
        if (!name?.trim()) return "FC";
        const parts = name.trim().split(/\s+/);
        if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    };

    return (
        <div
            className="d-flex flex-column h-100 p-3 select-none"
            style={{
                fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                backgroundColor: "#111827",
                borderRight: "1px solid rgba(255, 255, 255, 0.08)",
                width: "100%",
                transition: "all 0.25s ease",
            }}
        >
            {/* Header / Brand giống Admin - Bấm logo chuyển về trang chủ */}
            <Link
                to={ROUTES.HOME}
                className="d-flex align-items-center gap-3 pb-3 mb-2 border-bottom text-decoration-none"
                style={{
                    borderColor: "rgba(255, 255, 255, 0.08)",
                    minHeight: "53px",
                    cursor: "pointer",
                    transition: "opacity 0.2s ease",
                }}
                title="Về trang chủ Oilia"
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
                            OILIA FACTORY
                        </span>
                        <span
                            className="badge rounded-pill"
                            style={{
                                fontSize: "10px",
                                backgroundColor: "rgba(225, 29, 72, 0.2)",
                                color: "#fb7185",
                                border: "1px solid rgba(225, 29, 72, 0.3)",
                            }}
                        >
                            Đối tác xưởng
                        </span>
                    </div>
                    <span className="text-secondary text-truncate" style={{ fontSize: "11px" }}>
                        Cổng quản lý chế tác &amp; đơn hàng
                    </span>
                </div>
            </Link>

            {/* Navigation Body */}
            <div className="flex-grow-1 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
                <div className="px-2 pt-2 pb-1">
                    <span
                        className="text-uppercase fw-bold"
                        style={{
                            fontSize: "10px",
                            color: "#64748b",
                            letterSpacing: "0.6px",
                        }}
                    >
                        VẬN HÀNH XƯỞNG
                    </span>
                </div>

                <NavItem
                    to={ROUTES.FACTORY_DASHBOARD}
                    icon={faHouse}
                    label="Tổng quan vận hành"
                    isActive={isDashboard}
                />
                <NavItem
                    to={ROUTES.FACTORY_PRODUCT}
                    icon={faBoxesStacked}
                    label="Quản lý Sản phẩm"
                    isActive={isProduct}
                />
                <NavItem
                    to={ROUTES.FACTORY_ORDER}
                    icon={faReceipt}
                    label="Quản lý Đơn hàng"
                    isActive={isOrder}
                />
                <NavItem
                    to={ROUTES.FACTORY_STAFF}
                    icon={faUsers}
                    label="Đội ngũ Nhân viên"
                    isActive={isStaff}
                />

                <div className="px-2 pt-3 pb-1">
                    <span
                        className="text-uppercase fw-bold"
                        style={{
                            fontSize: "10px",
                            color: "#64748b",
                            letterSpacing: "0.6px",
                        }}
                    >
                        HỖ TRỢ &amp; HỒ SƠ
                    </span>
                </div>

                <NavItem
                    to={ROUTES.FACTORY_SALE}
                    icon={faTag}
                    label="Khuyến mãi &amp; Voucher"
                    isActive={isVoucher}
                />
                <NavItem
                    to={ROUTES.FACTORY_SUPPORT}
                    icon={faHeadset}
                    label="Hỗ trợ &amp; Phản hồi"
                    isActive={isSupport}
                />
                <NavItem
                    to={ROUTES.FACTORY_PROFILE}
                    icon={faBuilding}
                    label="Hồ sơ Xưởng chế tác"
                    isActive={isProfile}
                />
            </div>

            {/* User Profile Card giống Admin */}
            <div
                className="pt-3 mt-auto border-top"
                style={{ borderColor: "rgba(255, 255, 255, 0.08)" }}
            >
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
                                {user?.fullName || "Chủ Xưởng Oilia"}
                            </span>
                            <span className="text-truncate" style={{ fontSize: "11px", color: "#94a3b8" }}>
                                {user?.email || "factory@oilia.vn"}
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="btn btn-link p-1 text-secondary ms-1 flex-shrink-0"
                        title="Đăng xuất khỏi hệ thống"
                        style={{ color: "#94a3b8", textDecoration: "none" }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "#e11d48")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "#94a3b8")}
                    >
                        <FontAwesomeIcon icon={faArrowRightFromBracket} style={{ fontSize: "15px" }} />
                    </button>
                </div>
            </div>
        </div>
    );
}

export default SideBarFactory;
