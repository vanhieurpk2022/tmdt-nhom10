import { useState, useEffect, useCallback } from "react";
import {
    faBagShopping,
    faTruckFast,
    faStar,
    faTriangleExclamation,
    faCoins,
    faShop,
    faRotate,
    faUsers,
    faBoxesStacked,
    faArrowTrendUp,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import PageHeader from "./PageHeader";
import StatCard from "./StartCard";
import { ModalApprove } from "./ModalApprove";
import AdminBarChartOverTime from "./AdminBarChartOverTime";
import AdminPieChartsSection from "./AdminPieChartsSection";
import {
    AdminDashboardService,
    type AdminDashboardOverview,
    type AdminPieChartData,
} from "../../../api/admin/AdminDashboardService";
import type { FactoryRegisterResponse } from "../../../dto/factory/FactoryRegister";
import { formatVnd } from "../../format/FormatMoney";
import "../../../css/pages/dashboard/dashboard.css";

interface OperationsOverviewAdminProps {
    data?: FactoryRegisterResponse[];
    onChanged?: () => void;
}

function OperationsOverviewAdmin({
    data = [],
    onChanged,
}: OperationsOverviewAdminProps) {
    const [showApprove, setShowApprove] = useState(false);
    const [loadingOverview, setLoadingOverview] = useState(false);
    const [overview, setOverview] = useState<AdminDashboardOverview | null>(null);
    const [pieData, setPieData] = useState<AdminPieChartData | null>(null);
    const [loadingPie, setLoadingPie] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const fetchDashboardData = useCallback(async () => {
        setLoadingOverview(true);
        setLoadingPie(true);
        setErrorMsg(null);

        try {
            const [overviewRes, pieRes] = await Promise.allSettled([
                AdminDashboardService.getOverview(),
                AdminDashboardService.getPieCharts(),
            ]);

            let hasError = false;

            if (overviewRes.status === "fulfilled") {
                setOverview(overviewRes.value);
            } else {
                hasError = true;
                console.error("Lỗi khi tải KPI Overview:", overviewRes.reason);
            }

            if (pieRes.status === "fulfilled") {
                setPieData(pieRes.value);
            } else {
                hasError = true;
                console.error("Lỗi khi tải Pie Charts:", pieRes.reason);
            }

            if (hasError) {
                setErrorMsg("Chưa kết nối được API thống kê Backend. Nếu bạn vừa cập nhật mã nguồn mới, vui lòng Khởi động lại (Restart) ứng dụng Spring Boot backend để hệ thống nạp các Controller và Query mới.");
            }
        } finally {
            setLoadingOverview(false);
            setLoadingPie(false);
        }
    }, []);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    const totalRev = overview?.totalRevenue ?? 0;
    const settledRev = overview?.settledRevenue ?? 0;
    const totalOrders = overview?.totalOrders ?? 0;
    const pendingOrders = overview?.pendingOrders ?? 0;
    const processingOrders = overview?.processingOrders ?? 0;
    const deliveryRate = overview?.deliverySuccessRate ?? 0;
    const cancelRate = overview?.cancellationRate ?? 0;
    const activeWorkshops = overview?.activeWorkshops ?? 0;
    const pendingWorkshops = overview?.pendingWorkshops ?? data.length;
    const totalCustomers = overview?.totalCustomers ?? 0;
    const totalProducts = overview?.totalProducts ?? 0;
    const avgRating = overview?.averageRating ?? 5.0;
    const totalReviews = overview?.totalReviews ?? 0;
    const openDisputes = overview?.openDisputes ?? 0;

    return (
        <main
            className="p-3 p-lg-4 d-flex flex-column gap-4"
            style={{ backgroundColor: "var(--color-bg-page)", minHeight: "100vh" }}
        >
            {/* Header  */}
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
                <PageHeader
                    title="Trung Tâm Điều Hành Toàn Sàn Oilia"
                    pendingCount={pendingWorkshops}
                    onApprove={() => setShowApprove(true)}
                />

                <div className="d-flex align-items-center gap-2">
                    <button
                        className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-2 rounded-pill px-3 shadow-sm bg-white"
                        onClick={fetchDashboardData}
                        disabled={loadingOverview}
                        title="Tải lại dữ liệu hệ thống mới nhất"
                    >
                        <FontAwesomeIcon icon={faRotate} spin={loadingOverview} />
                        <span className="small fw-semibold">
                            {loadingOverview ? "Đang đồng bộ..." : "Làm mới số liệu"}
                        </span>
                    </button>
                </div>
            </div>


            {/* Modal phê duyệt đăng ký mở xưởng */}
            <ModalApprove
                list={data}
                show={showApprove}
                onClose={() => setShowApprove(false)}
                onChanged={() => {
                    if (onChanged) onChanged();
                    fetchDashboardData();
                }}
            />

            {/* 2. Dải Thống Kê Nhanh */}
            <section className="bg-white rounded-4 p-3 shadow-sm border border-light-subtle d-flex flex-wrap align-items-center justify-content-between gap-3">
                <div className="d-flex align-items-center gap-3">
                    <span className="badge rounded-circle p-2 bg-primary-subtle text-primary">
                        <FontAwesomeIcon icon={faArrowTrendUp} />
                    </span>
                    <div>
                        <div className="small text-secondary">Quy mô khách hàng</div>
                        <div className="fw-bold text-dark d-flex align-items-center gap-1">
                            <FontAwesomeIcon icon={faUsers} className="text-secondary small" />
                            <span>{totalCustomers.toLocaleString("vi-VN")} tài khoản</span>
                        </div>
                    </div>
                </div>

                <div className="vr d-none d-md-block opacity-25" style={{ height: "35px" }} />

                <div className="d-flex align-items-center gap-3">
                    <span className="badge rounded-circle p-2 bg-success-subtle text-success">
                        <FontAwesomeIcon icon={faBoxesStacked} />
                    </span>
                    <div>
                        <div className="small text-secondary">Sản phẩm trên kệ sàn</div>
                        <div className="fw-bold text-dark">
                            {totalProducts.toLocaleString("vi-VN")} mùi hương
                        </div>
                    </div>
                </div>

                <div className="vr d-none d-md-block opacity-25" style={{ height: "35px" }} />

                <div className="d-flex align-items-center gap-3">
                    <span className="badge rounded-circle p-2 bg-warning-subtle text-warning">
                        <FontAwesomeIcon icon={faStar} />
                    </span>
                    <div>
                        <div className="small text-secondary">Độ uy tín & Đánh giá</div>
                        <div className="fw-bold text-dark">
                            {avgRating.toFixed(1)} / 5.0 ⭐
                            <span className="small text-secondary fw-normal ms-1">
                                ({totalReviews} lượt)
                            </span>
                        </div>
                    </div>
                </div>

                <div className="vr d-none d-md-block opacity-25" style={{ height: "35px" }} />

                <div className="d-flex align-items-center gap-3">
                    <span className="badge rounded-circle p-2 bg-danger-subtle text-danger">
                        <FontAwesomeIcon icon={faTriangleExclamation} />
                    </span>
                    <div>
                        <div className="small text-secondary">Khiếu nại / Hoàn tiền</div>
                        <div className="fw-bold text-danger">
                            {openDisputes > 0 ? `${openDisputes} trường hợp cần xử lý` : "0 (Ổn định)"}
                        </div>
                    </div>
                </div>
            </section>

            <section className="row g-3">
                {/* Thẻ 1: Doanh thu toàn sàn  */}
                <div className="col-12 col-md-6 col-xl-3">
                    <StatCard
                        label="Doanh thu Toàn sàn "
                        value={formatVnd(totalRev)}
                        icon={faCoins}
                        tone="danger"
                        note={`Đã giải ngân: ${formatVnd(settledRev)}`}
                    />
                </div>

                {/* Thẻ 2: Tổng đơn đặt hàng */}
                <div className="col-12 col-md-6 col-xl-3">
                    <StatCard
                        label="Tổng đơn đặt hàng"
                        value={`${totalOrders} đơn`}
                        icon={faBagShopping}
                        tone="info"
                        note={`${pendingOrders} chờ xác nhận, ${processingOrders} đang pha chế`}
                    />
                </div>

                {/* Thẻ 3: Tỷ lệ giao hàng thành công */}
                <div className="col-12 col-md-6 col-xl-3">
                    <StatCard
                        label="Tỷ lệ giao hàng thành công"
                        value={`${deliveryRate}%`}
                        icon={faTruckFast}
                        tone="success"
                        note={`Tỷ lệ đơn hủy toàn sàn: ${cancelRate}%`}
                    />
                </div>

                {/* Thẻ 4: Đối tác Xưởng chế tác */}
                <div className="col-12 col-md-6 col-xl-3">
                    <StatCard
                        label="Đối tác Xưởng chế tác"
                        value={`${activeWorkshops} xưởng`}
                        icon={faShop}
                        tone="warning"
                        note={
                            pendingWorkshops > 0
                                ? `${pendingWorkshops} hồ sơ chờ xét duyệt`
                                : "Tất cả hồ sơ đã phê duyệt"
                        }
                        actionText={pendingWorkshops > 0 ? "Xem danh sách duyệt" : undefined}
                        onAction={() => setShowApprove(true)}
                    />
                </div>
            </section>
            <section>
                <AdminBarChartOverTime />
            </section>
            <section>
                <AdminPieChartsSection data={pieData} loading={loadingPie} />
            </section>
        </main>
    );
}

export default OperationsOverviewAdmin;
