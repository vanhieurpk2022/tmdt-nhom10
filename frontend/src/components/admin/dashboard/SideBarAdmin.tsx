import { faHouse, faBuilding, faUsers, faBoxArchive, faTag, faHeadset } from "@fortawesome/free-solid-svg-icons";
import { LogoBranch } from "./LogoBranch";
import { BadgeAccount } from "./BadgeAccount";
import SideBarItem from "./SideBarItem";
import { ROUTES } from "../../../routes/routes";

interface SidebarAdminProps {
    isDashboard?: boolean;
    isWorkshopManagement?: boolean;
    isCustomer?: boolean;
    isOrder?: boolean;
    isVoucher?: boolean;
    isSupport?: boolean;
}

function SidebarAdmin({ isDashboard = false, isWorkshopManagement = false, isCustomer = false, isOrder = false, isSupport = false, isVoucher = false }: SidebarAdminProps) {
    return (
        <>
            <div className="d-flex flex-column h-100" style={{ backgroundColor: "var(--color-bg-dark)" }}>
                <div className="d-flex flex-row align-items-center justify-content-start gap-3">
                    <div className="ms-3">
                        <LogoBranch />
                    </div>

                    <div className="d-flex flex-column">
                        <span className="fs-2 text-start ms-2" style={{ color: "var(--color-text-light)" }}>Oilia</span>
                        <span className="fs-6 p-2 px-3 rounded-5 badge" style={{ color: "var(--color-text-light)", backgroundColor: "var(--color-primary)" }}>Quản lí vận hành</span>
                    </div>
                </div>
                <div className="mt-3">
                    <SideBarItem to={ROUTES.ADMIN_DASHBOARD} place={faHouse} content="Tổng quan" isActive={isDashboard} />
                    <SideBarItem to={ROUTES.ADMIN_WORKSHOP} place={faBuilding} content="Xưởng" isActive={isWorkshopManagement} />
                    <SideBarItem to={ROUTES.ADMIN_CUSTOMER} place={faUsers} content="Khách hàng" isActive={isCustomer} />
                    <SideBarItem to={ROUTES.ADMIN_ORDER} place={faBoxArchive} content="Đơn hàng" isActive={isOrder} />
                    <SideBarItem to={ROUTES.AdMIN_SALE} place={faTag} content="Khuyến mãi" isActive={isVoucher} />
                    <SideBarItem to={ROUTES.ADMIN_SUPPORT} place={faHeadset} content="Phản hồi" isActive={isSupport} />
                </div>
                <div className="mt-auto">
                    <BadgeAccount name="Minh Hậu" role="quản trị viên " src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRuDGi1_AVK3XUdN5cS9tUBuYhgg9UhK3zN0hA_3b6M-Q&s=10" />
                </div>

            </div >
        </>
    );
}

export default SidebarAdmin;