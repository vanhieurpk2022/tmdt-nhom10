import OperationsOverview from "../components/admin/OperationOverview";
import SidebarAdmin from "../components/admin/SideBarAdmin";
import "../css/pages/admin.css";

export function Admin() {

    return (
        <div className="d-flex">
            {/* Sidebar: rộng cố định, đứng yên khi cuộn trang */}
            <aside style={{ width: 350, flexShrink: 0 }} className="position-sticky top-0 vh-100">
                <SidebarAdmin />
            </aside>

            {/* Nội dung: chiếm hết phần còn lại */}
            <div className="flex-grow-1" style={{ minWidth: 0 }}>
                <OperationsOverview />
            </div>


        </div>
    );
}