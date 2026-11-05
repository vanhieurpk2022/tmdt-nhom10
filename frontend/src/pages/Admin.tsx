import { useCallback, useEffect, useState } from "react";
import OperationsOverviewAdmin from "../components/admin/dashboard/OperationOverviewAdmin";
import SidebarAdmin from "../components/admin/dashboard/SideBarAdmin";
import { useAdminSidebar } from "../api/AdminSidebarContext";
import "../css/pages/user-admin.css";
import "../css/pages/dashboard/admin.css";
import type { FactoryRegisterResponse } from "../dto/factory/FactoryRegister";
import { AdminService } from "../api/admin/AdminApi";
import axios from "axios";

export function Admin() {
    const { isCollapsed } = useAdminSidebar();
    const [factoryResponse, setFactoryResponse] = useState<FactoryRegisterResponse[]>([]);
    const [, setErrorMessage] = useState("");

    // lấy nhà máy đang đợi duyệt
    const fetchFactory = useCallback(async () => {
        try {
            const res = await AdminService.getFactoryRegis();
            if (res.status == 200) {
                setFactoryResponse(res.data ?? []);
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (!error.response) {
                    setErrorMessage("Không kết nối được máy chủ, vui lòng thử lại");
                } else {
                    setErrorMessage(error.response.data?.message);
                }
            }
        }
    }, []);

    useEffect(() => {
        fetchFactory();
    }, [fetchFactory]);

    return (
        <div className="d-flex min-vh-100 w-100 admin-customer-page">
            {/* Sidebar */}
            <aside
                className="flex-shrink-0 position-sticky top-0 align-self-start"
                style={{
                    width: isCollapsed ? "72px" : "250px",
                    minWidth: isCollapsed ? "72px" : "250px",
                    height: "100vh",
                    zIndex: 1000,
                    backgroundColor: "var(--color-bg-dark, #111827)",
                    transition: "width 0.25s cubic-bezier(0.4, 0, 0.2, 1), min-width 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
            >
                <SidebarAdmin isDashboard={true} />
            </aside>

            {/* Main content */}
            <main className="flex-grow-1 p-3 p-lg-4 admin-content overflow-x-auto" style={{ minWidth: 0 }}>
                <OperationsOverviewAdmin data={factoryResponse} onChanged={fetchFactory} />
            </main>
        </div>
    );
}
