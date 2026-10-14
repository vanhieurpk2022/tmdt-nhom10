import OperationsOverview from "../components/admin/dashboard/OperationOverview";
import SideBarFactory from "../components/admin/factory/SideBarFactory";

export function FactoryDashBoard() {
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
                <OperationsOverview isShow={true} />
            </div>
        </div>
    );
}