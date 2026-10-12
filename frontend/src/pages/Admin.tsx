import OperationsOverview from "../components/admin/dashboard/OperationOverview";
import SidebarAdmin from "../components/admin/dashboard/SideBarAdmin";
import "../css/pages/dashboard/admin.css";

export function Admin() {

    return (
        <div className="d-flex">
            {/* Sidebar: rộng cố định, đứng yên khi cuộn trang */}
            <aside style={{ width: 350, flexShrink: 0 }} className="position-sticky top-0 vh-100">
                <SidebarAdmin isDashboard={true} />
            </aside>

            {/* Nội dung: chiếm hết phần còn lại */}
            <div className="flex-grow-1" style={{ minWidth: 0 }}>
                <OperationsOverview />
            </div>


        </div>
    );
}