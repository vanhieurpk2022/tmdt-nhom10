import OperationsOverview from "../components/admin/dashboard/OperationOverview";
import SidebarAdmin from "../components/admin/dashboard/SideBarAdmin";
import { useAdminSidebar } from "../api/AdminSidebarContext";
import "../css/pages/dashboard/admin.css";

export function Admin() {
    const { isCollapsed } = useAdminSidebar();

    return (
        <div className="d-flex min-vh-100 bg-light">
            {/* Sidebar */}
            <aside
                className="flex-shrink-0 position-sticky top-0 align-self-start"
                style={{
                    height: "100vh",
                    width: isCollapsed ? "72px" : "250px",
                    transition: "width 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
            >
                <SidebarAdmin isDashboard={true} />
            </aside>

            {/* Main content */}
            <main className="flex-grow-1 p-3 p-lg-4 admin-content overflow-x-auto" style={{ minWidth: 0 }}>
                <OperationsOverview />
            </main>
        </div>
    );
}