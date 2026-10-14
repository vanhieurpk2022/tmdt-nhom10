import { faHouse, faBuilding, faUsers, faBoxArchive, faTag, faHeadset } from "@fortawesome/free-solid-svg-icons";
import { ROUTES } from "../../../routes/routes";
import { LogoBranch } from "../dashboard/LogoBranch";
import SideBarItem from "../dashboard/SideBarItem";
import { BadgeAccount } from "../dashboard/BadgeAccount";

interface SidebarAdminProps {
    isDashboard?: boolean;
    isWorkshopManagement?: boolean;
    isCustomer?: boolean;
    isOrder?: boolean;
    isVoucher?: boolean;
    isSupport?: boolean;
}

function SideBarFactory({ isDashboard = false, isWorkshopManagement = false, isCustomer = false, isOrder = false, isSupport = false, isVoucher = false }: SidebarAdminProps) {
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
                    <SideBarItem to={ROUTES.FACTORY_PRODUCT} place={faBuilding} content="Sản phẩm" isActive={isWorkshopManagement} />
                    <SideBarItem to={ROUTES.FACTORY_STAFF} place={faBoxArchive} content="Nhân viên" isActive={isOrder} />
                    <SideBarItem to={ROUTES.FACTORY_ORDER} place={faUsers} content="Đơn hàng" isActive={isCustomer} />
                    <SideBarItem to={ROUTES.FACTORY_PROFILE} place={faTag} content="Hồ sơ" isActive={isVoucher} />
                    <SideBarItem to={ROUTES.FACTORY_SALE} place={faHeadset} content="Khuyến mãi" isActive={isSupport} />
                    <SideBarItem to={ROUTES.FACTORY_SUPPORT} place={faHeadset} content="Phản hồi" isActive={isSupport} />
                </div>
                <div className="mt-auto">
                    <BadgeAccount name="Minh Hậu" role="Xưởng " src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRuDGi1_AVK3XUdN5cS9tUBuYhgg9UhK3zN0hA_3b6M-Q&s=10" />
                </div>

            </div >
        </>
    );
}

export default SideBarFactory;