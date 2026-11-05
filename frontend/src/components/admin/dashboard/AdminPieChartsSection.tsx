import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faClipboardList,
    faTags,
    faFlask,
    faTriangleExclamation,
    faCreditCard,
    faIndustry,
} from "@fortawesome/free-solid-svg-icons";
import { DonutChart } from "../statistics/DonutChart";
import { formatVnd } from "../../format/FormatMoney";
import type { AdminPieChartData, AdminPieSlice } from "../../../api/admin/AdminDashboardService";

interface Props {
    data: AdminPieChartData | null;
    loading?: boolean;
}

type ExtraTab = "productType" | "cancelReason" | "paymentMethod" | "workshops";

export default function AdminPieChartsSection({ data, loading }: Props) {
    const [extraTab, setExtraTab] = useState<ExtraTab>("productType");

    const orderStatuses = data?.orderStatusDistribution || [];
    const categories = data?.categoryDistribution || [];
    const productTypes = data?.productTypeDistribution || [];
    const cancelReasons = data?.cancelReasonDistribution || [];
    const paymentMethods = data?.paymentMethodDistribution || [];
    const topWorkshops = data?.topWorkshopsDistribution || [];

    // Tính tỷ lệ hoàn thành đơn
    const deliveredItem = orderStatuses.find((s) => s.key === "DELIVERED");
    const completionRate = deliveredItem ? `${deliveredItem.percentage}%` : "0%";

    // Tổng doanh thu danh mục
    const totalCatRevenue = categories.reduce((sum, c) => sum + (c.amount || 0), 0);

    // Lấy dữ liệu cho Tab phụ
    const getExtraTabData = (): { title: string; slices: AdminPieSlice[]; centerVal: string; centerLbl: string } => {
        switch (extraTab) {
            case "productType":
                return {
                    title: "Cơ cấu: Tiêu chuẩn vs Độc bản Bespoke",
                    slices: productTypes,
                    centerVal: `${productTypes.find((p) => p.key === "CUSTOM")?.percentage || 0}%`,
                    centerLbl: "Độc bản",
                };
            case "cancelReason":
                return {
                    title: "Phân bổ nguyên nhân hủy đơn hàng",
                    slices: cancelReasons,
                    centerVal: `${cancelReasons[0]?.percentage || 0}%`,
                    centerLbl: "Lý do lớn nhất",
                };
            case "paymentMethod":
                return {
                    title: "Cơ cấu Phương thức thanh toán",
                    slices: paymentMethods,
                    centerVal: `${paymentMethods.find((p) => p.key === "VNPAY")?.percentage || 0}%`,
                    centerLbl: "Ví VNPAY",
                };
            case "workshops":
                return {
                    title: "Thị phần Doanh thu theo Xưởng chế tác",
                    slices: topWorkshops,
                    centerVal: `${topWorkshops[0]?.percentage || 0}%`,
                    centerLbl: "Top 1 Xưởng",
                };
        }
    };

    const currentExtra = getExtraTabData();

    return (
        <section
            className="row g-3"
            style={{ opacity: loading ? 0.65 : 1, transition: "opacity 0.25s ease-in-out" }}
        >
            {/* 1. Biểu đồ tròn: Trạng thái đơn hàng */}
            <div className="col-12 col-xl-4">
                <div className="card border-0 shadow-sm rounded-4 h-100">
                    <div className="card-body p-3 p-lg-4 d-flex flex-column justify-content-between">
                        <div>
                            <div className="d-flex justify-content-between align-items-start mb-3">
                                <div>
                                    <h5 className="fw-bold mb-1 text-dark">
                                        <FontAwesomeIcon icon={faClipboardList} className="me-2 text-danger" />
                                        Trạng thái Đơn hàng
                                    </h5>
                                    <p className="text-secondary small mb-0">
                                        Phân bổ toàn bộ quy trình vận hành
                                    </p>
                                </div>
                                <span className="badge rounded-pill bg-success-subtle text-success-emphasis border px-3 py-1">
                                    Hoàn tất: {completionRate}
                                </span>
                            </div>

                            <div className="d-flex align-items-center justify-content-center my-3">
                                <DonutChart
                                    data={orderStatuses.map((s) => ({
                                        name: s.label,
                                        value: s.count > 0 ? s.count : 0.001,
                                        color: s.color,
                                    }))}
                                    centerValue={completionRate}
                                    centerLabel="Thành công"
                                />
                            </div>

                            <ul className="list-unstyled mb-0 d-flex flex-column gap-2 small">
                                {orderStatuses.slice(0, 5).map((s) => (
                                    <li key={s.key} className="d-flex align-items-center justify-content-between">
                                        <div className="d-flex align-items-center gap-2 text-truncate" style={{ maxWidth: "70%" }}>
                                            <span
                                                className="rounded-circle flex-shrink-0"
                                                style={{ width: 10, height: 10, backgroundColor: s.color }}
                                            />
                                            <span className="text-truncate">{s.label}</span>
                                        </div>
                                        <span className="fw-semibold text-secondary">
                                            {s.count.toLocaleString("vi-VN")} đơn ({s.percentage}%)
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. Biểu đồ tròn: Doanh thu theo Danh mục */}
            <div className="col-12 col-xl-4">
                <div className="card border-0 shadow-sm rounded-4 h-100">
                    <div className="card-body p-3 p-lg-4 d-flex flex-column justify-content-between">
                        <div>
                            <div className="d-flex justify-content-between align-items-start mb-3">
                                <div>
                                    <h5 className="fw-bold mb-1 text-dark">
                                        <FontAwesomeIcon icon={faTags} className="me-2 text-primary" />
                                        Doanh thu theo Danh mục
                                    </h5>
                                    <p className="text-secondary small mb-0">
                                        Tổng doanh thu: <span className="fw-semibold text-dark">{formatVnd(totalCatRevenue)}</span>
                                    </p>
                                </div>
                            </div>

                            <div className="d-flex align-items-center justify-content-center my-3">
                                <DonutChart
                                    data={categories.map((c) => ({
                                        name: c.label,
                                        value: c.amount && c.amount > 0 ? c.amount : 0.001,
                                        color: c.color,
                                    }))}
                                    centerValue={`${categories[0]?.percentage || 0}%`}
                                    centerLabel={categories[0]?.label || "Danh mục"}
                                />
                            </div>

                            <ul className="list-unstyled mb-0 d-flex flex-column gap-2 small">
                                {categories.slice(0, 5).map((c) => (
                                    <li key={c.key} className="d-flex align-items-center justify-content-between">
                                        <div className="d-flex align-items-center gap-2 text-truncate" style={{ maxWidth: "60%" }}>
                                            <span
                                                className="rounded-circle flex-shrink-0"
                                                style={{ width: 10, height: 10, backgroundColor: c.color }}
                                            />
                                            <span className="text-truncate">{c.label}</span>
                                        </div>
                                        <div className="text-end">
                                            <span className="fw-semibold text-dark d-block">
                                                {formatVnd(c.amount || 0)}
                                            </span>
                                            <span className="text-secondary" style={{ fontSize: "11px" }}>
                                                {c.percentage}% ({c.count} chai)
                                            </span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. Biểu đồ tròn: Tab chuyển đổi các khía cạnh mở rộng */}
            <div className="col-12 col-xl-4">
                <div className="card border-0 shadow-sm rounded-4 h-100">
                    <div className="card-body p-3 p-lg-4 d-flex flex-column justify-content-between">
                        <div>
                            {/* Tabs Switcher */}
                            <div className="d-flex align-items-center gap-1 mb-3 pb-2 border-bottom overflow-x-auto">
                                {[
                                    { key: "productType", label: "Loại SP", icon: faFlask },
                                    { key: "cancelReason", label: "Hủy đơn", icon: faTriangleExclamation },
                                    { key: "paymentMethod", label: "Thanh toán", icon: faCreditCard },
                                    { key: "workshops", label: "Xưởng chế tác", icon: faIndustry },
                                ].map((t) => (
                                    <button
                                        key={t.key}
                                        type="button"
                                        className={`btn btn-sm text-nowrap rounded-3 px-2 py-1 ${
                                            extraTab === t.key
                                                ? "btn-danger fw-bold"
                                                : "btn-light text-secondary"
                                        }`}
                                        style={{ fontSize: "12px" }}
                                        onClick={() => setExtraTab(t.key as ExtraTab)}
                                    >
                                        <FontAwesomeIcon icon={t.icon} className="me-1" />
                                        {t.label}
                                    </button>
                                ))}
                            </div>

                            <h6 className="fw-bold mb-1 text-dark">{currentExtra.title}</h6>
                            <p className="text-secondary small mb-3">Tỷ lệ đóng góp và phân loại chi tiết</p>

                            <div className="d-flex align-items-center justify-content-center my-3">
                                <DonutChart
                                    data={currentExtra.slices.map((s) => ({
                                        name: s.label,
                                        value: (s.amount && s.amount > 0 ? s.amount : s.count) || 0.001,
                                        color: s.color,
                                    }))}
                                    centerValue={currentExtra.centerVal}
                                    centerLabel={currentExtra.centerLbl}
                                />
                            </div>

                            <ul className="list-unstyled mb-0 d-flex flex-column gap-2 small">
                                {currentExtra.slices.slice(0, 5).map((s) => (
                                    <li key={s.key} className="d-flex align-items-center justify-content-between">
                                        <div className="d-flex align-items-center gap-2 text-truncate" style={{ maxWidth: "65%" }}>
                                            <span
                                                className="rounded-circle flex-shrink-0"
                                                style={{ width: 10, height: 10, backgroundColor: s.color }}
                                            />
                                            <span className="text-truncate">{s.label}</span>
                                        </div>
                                        <span className="fw-semibold text-secondary">
                                            {s.amount && s.amount > 0 ? formatVnd(s.amount) : `${s.count} đơn`} ({s.percentage}%)
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
