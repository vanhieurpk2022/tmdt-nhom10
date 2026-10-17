import { faHouse, faBuilding, faUsers, faBoxArchive, faTag, faHeadset } from "@fortawesome/free-solid-svg-icons";
import { ROUTES } from "../../../routes/routes";
import { LogoBranch } from "../dashboard/LogoBranch";
import SideBarItem from "../dashboard/SideBarItem";
import { BadgeAccount } from "../dashboard/BadgeAccount";
import { useAuth } from "../../../api/AuthContext";

interface SidebarAdminProps {
    isDashboard?: boolean;
    isProduct?: boolean;
    isStaff?: boolean;
    isOrder?: boolean;
    isVoucher?: boolean;
    isSupport?: boolean;
    isProfile?: boolean;
}

function SideBarFactory({ isProfile = false, isDashboard = false, isProduct = false, isStaff = false, isOrder = false, isSupport = false, isVoucher = false }: SidebarAdminProps) {
    const { user, loading } = useAuth();
    return (
        <>
            <div className="d-flex flex-column h-100" style={{ backgroundColor: "var(--color-bg-dark)" }}>
                <div className="d-flex flex-row align-items-center justify-content-start gap-3">
                    <div className="ms-3">
                        <LogoBranch />
                    </div>

                    <div className="d-flex flex-column">
                        <span className="fs-2 text-start ms-2" style={{ color: "var(--color-text-light)" }}>Oilia</span>
                        <span className="fs-6 p-2 px-3 rounded-5 badge" style={{ color: "var(--color-text-light)", backgroundColor: "var(--color-primary)" }}>Quản lí Xưởng</span>
                    </div>
                </div>
                <div className="mt-3">
                    <SideBarItem to={ROUTES.FACTORY_DASHBOARD} place={faHouse} content="Tổng quan" isActive={isDashboard} />
                    <SideBarItem to={ROUTES.FACTORY_PRODUCT} place={faBuilding} content="Sản phẩm" isActive={isProduct} />
                    <SideBarItem to={ROUTES.FACTORY_ORDER} place={faBoxArchive} content="Đơn hàng" isActive={isOrder} />
                    <SideBarItem to={ROUTES.FACTORY_STAFF} place={faUsers} content="Nhân viên" isActive={isStaff} />
                    <SideBarItem to={ROUTES.FACTORY_SALE} place={faHeadset} content="Khuyến mãi" isActive={isVoucher} />
                    <SideBarItem to={ROUTES.FACTORY_SUPPORT} place={faHeadset} content="Phản hồi" isActive={isSupport} />
                    <SideBarItem to={ROUTES.FACTORY_PROFILE} place={faTag} content="Hồ sơ" isActive={isProfile} />
                </div>
                <div className="mt-auto">
                    {user && (
                        <BadgeAccount
                            name={user.fullName}
                            role={user.role.find(r => r === "FACTORY") ?? ""}
                            src={user.avatar ?? "/assets/default-avatar.png"}
                        />
                    )}
                </div>

            </div >
        </>
    );
}

export default SideBarFactory;