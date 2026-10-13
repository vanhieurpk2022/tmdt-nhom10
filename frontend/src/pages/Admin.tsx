import OperationsOverview from "../components/admin/dashboard/OperationOverview";
import SidebarAdmin from "../components/admin/dashboard/SideBarAdmin";
import "../css/pages/dashboard/admin.css";

export function Admin() {

    return (
        <div className="row g-0 min-vh-100 bg-light">
            {/* Sidebar */}
            <aside
                className="col-12 col-xl-2 flex-shrink-0 position-sticky top-0 align-self-start"
                style={{ height: "100vh" }}
            >
                <SidebarAdmin isDashboard={true} />
            </aside>

            {/* Main content */}
            <main className="col-12 col-xl-10 p-3 p-lg-4 admin-content">
                <OperationsOverview />
            </main>
        </div>
    );
}