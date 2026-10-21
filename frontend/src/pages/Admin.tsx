import { useCallback, useEffect, useState } from "react";
import OperationsOverviewAdmin from "../components/admin/dashboard/OperationOverviewAdmin";
import SidebarAdmin from "../components/admin/dashboard/SideBarAdmin";
import "../css/pages/dashboard/admin.css";
import type { FactoryRegisterResponse } from "../dto/factory/FactoryRegister";
import { AdminService } from "../api/admin/AdminApi";
import axios from "axios";



export function Admin() {
    const [factoryResponse, setFactoryResponse] = useState<FactoryRegisterResponse[]>([]);
    const [errorMessage, setErrorMessage] = useState("");

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
                <OperationsOverviewAdmin data={factoryResponse} onChanged={fetchFactory} />
            </main>
        </div>
    );
}