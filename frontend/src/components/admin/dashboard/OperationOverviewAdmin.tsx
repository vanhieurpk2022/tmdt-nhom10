import {
    faBagShopping,
    faTruckFast,
    faStar,
    faTriangleExclamation,
    faShieldHalved,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";

import PageHeader from "./PageHeader";
import StatCard from "./StartCard";
import { ModalApprove } from "./ModalApprove";
import "../../../css/pages/dashboard/dashboard.css";
import type { FactoryRegisterResponse } from "../../../dto/factory/FactoryRegister";
import { formatVnd } from "../../format/FormatMoney";
import { DonutChart } from "../statistics/DonutChart";

/* ------------------------------------------------------------------ */
/* Types & dữ liệu mẫu                                                 */
/* ------------------------------------------------------------------ */

interface CancelReason {
    label: string;
    percent: number;
    count: number;
    color: string;
}

interface RevenueItem {
    label: string;
    amount: number;
    percent: number;
    color: string;
    highlight?: boolean;
}

export const cancelReasons: CancelReason[] = [
    { label: "Khách đổi ý / Thay đổi yêu cầu mùi hương", percent: 45, count: 4, color: "var(--color-info)" },
    { label: "Hết nguyên liệu / Tạm ngừng nhận mẫu này", percent: 30, count: 3, color: "var(--color-primary)" },
    { label: "Không thống nhất được thời gian giao hàng", percent: 15, count: 1, color: "var(--color-warning)" },
    { label: "Xưởng xác nhận trễ hạn (Quá 24h)", percent: 10, count: 1, color: "var(--color-neutral)" },
];

export const revenueItems: RevenueItem[] = [
    { label: "Đã đối soát (Có thể rút về ngân hàng)", amount: 285000000, percent: 63.3, color: "var(--color-success)" },
    { label: "Chờ đối soát (Đơn đang xử lý / chờ khách nhận)", amount: 112500000, percent: 25.0, color: "var(--color-warning)" },
    { label: "Phí cố định & Hoa hồng sàn (Commission Fee)", amount: 36000000, percent: 8.0, color: "var(--color-info)" },
    { label: "Đang tạm giữ do Khiếu nại / Trả hàng", amount: 16500000, percent: 3.7, color: "var(--color-primary)", highlight: true },
];

const TOTAL_SELLER_REVENUE = 450000000;

interface OperationsOverviewAdminProps {
    data?: FactoryRegisterResponse[];
    onChanged?: () => void;
}

function OperationsOverviewAdmin({
    data = [],
    onChanged,
}: OperationsOverviewAdminProps) {
    const [showApprove, setShowApprove] = useState(false);

    return (
        <main
            className="p-4 d-flex flex-column gap-4"
            style={{ backgroundColor: "var(--color-bg-page)", minHeight: "100vh" }}
        >
            {/* Header Kênh Người Bán */}
            <PageHeader
                title="Kênh Người Bán & Đối Tác Gia Công - Mộc Perfume Lab"
                pendingCount={data.length}
                onApprove={() => setShowApprove(true)}
            />

            <ModalApprove
                list={data}
                show={showApprove}
                onClose={() => setShowApprove(false)}
                onChanged={onChanged}
            />

            {/* Statistic cards */}
            <section className="row g-3">
                <div className="col-12 col-md-6 col-xl-3">
                    <StatCard
                        label="Đơn đặt hàng của Shop"
                        value="36"
                        icon={faBagShopping}
                        tone="danger"
                        note={`${data.length} đơn mới chờ xác nhận`}
                    />
                </div>

                <div className="col-12 col-md-6 col-xl-3">
                    <StatCard
                        label="Tỷ lệ giao hàng đúng hạn"
                        value="96.8%"
                        icon={faTruckFast}
                        tone="success"
                        note="Đạt chuẩn Shop Uy Tín"
                    />
                </div>

                <div className="col-12 col-md-6 col-xl-3">
                    <StatCard
                        label="Đánh giá Gian hàng & Hồ sơ"
                        value="4.9 / 5"
                        icon={faStar}
                        tone="info"
                        actionText="128 đánh giá từ khách"
                    />
                </div>

                <div className="col-12 col-md-6 col-xl-3">
                    <StatCard
                        label="Trả hàng / Hoàn tiền / Khiếu nại"
                        value="01"
                        icon={faTriangleExclamation}
                        tone="warning"
                        actionText="Phản hồi khiếu nại"
                    />
                </div>
            </section>

            {/* Charts */}
            <section className="row g-3">
                {/* Cancel rate */}
                <div className="col-12 col-xl-5">
                    <div className="card border-0 shadow-sm rounded-4 h-100">
                        <div className="card-body p-3 p-lg-4">
                            <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-3">
                                <div>
                                    <h5 className="fw-bold mb-1">Tỷ lệ đơn hủy của Shop</h5>
                                    <p className="text-secondary small mb-0">
                                        Giới hạn cho phép của sàn: &lt; 4.0%
                                    </p>
                                </div>

                                <span className="badge rounded-pill bg-light text-dark border px-3 py-2">
                                    2.4%
                                </span>
                            </div>

                            <div className="d-flex align-items-center gap-4 flex-wrap">
                                <DonutChart
                                    data={cancelReasons.map((r) => ({
                                        name: r.label,
                                        value: r.percent,
                                        color: r.color,
                                    }))}
                                    centerValue="2.4%"
                                    centerLabel="Tỷ lệ hủy"
                                />

                                <ul className="list-unstyled mb-0 d-flex flex-column gap-2 flex-grow-1">
                                    {cancelReasons.map((reason) => (
                                        <li
                                            key={reason.label}
                                            className="d-flex align-items-start gap-2 small"
                                        >
                                            <span
                                                className="rounded-circle flex-shrink-0 mt-1"
                                                style={{
                                                    width: 10,
                                                    height: 10,
                                                    backgroundColor: reason.color,
                                                }}
                                            />
                                            <span className="flex-grow-1">{reason.label}</span>
                                            <span className="fw-semibold text-nowrap">
                                                {reason.percent}% ({reason.count})
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Revenue */}
                <div className="col-12 col-xl-7">
                    <div className="card border-0 shadow-sm rounded-4 h-100">
                        <div className="card-body p-3 p-lg-4">
                            <div className="mb-3">
                                <h5 className="fw-bold mb-1">Doanh thu & Ví Người Bán</h5>
                                <p className="text-secondary small mb-0">
                                    Tổng doanh thu đơn hàng tháng này: {formatVnd(TOTAL_SELLER_REVENUE)}
                                </p>
                            </div>

                            <div className="d-flex align-items-center gap-4 flex-wrap">
                                <DonutChart
                                    data={revenueItems.map((r) => ({
                                        name: r.label,
                                        value: r.percent,
                                        color: r.color,
                                    }))}
                                    centerValue="63.3%"
                                    centerLabel="THỰC NHẬN"
                                />

                                <ul className="list-unstyled mb-0 d-flex flex-column gap-2 flex-grow-1">
                                    {revenueItems.map((item) => (
                                        <li
                                            key={item.label}
                                            className={`d-flex align-items-center gap-2 small ${item.highlight ? "fw-semibold text-danger" : ""
                                                }`}
                                        >
                                            <span
                                                className="rounded-circle flex-shrink-0"
                                                style={{
                                                    width: 10,
                                                    height: 10,
                                                    backgroundColor: item.color,
                                                }}
                                            />
                                            <span className="flex-grow-1">{item.label}</span>
                                            <span className="fw-semibold text-nowrap">
                                                {formatVnd(item.amount)}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="text-secondary small mt-3">
                                <FontAwesomeIcon icon={faShieldHalved} className="me-2" />
                                Sàn tự động giải ngân vào Ví Người Bán sau khi khách xác nhận đã nhận hàng
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}

export default OperationsOverviewAdmin;