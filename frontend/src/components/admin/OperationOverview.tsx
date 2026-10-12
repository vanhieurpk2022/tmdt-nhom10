import {
    faBagShopping, faChartColumn, faShieldHalved, faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";
import PageHeader from "./PageHeader";
import StatCard from "./StartCard";
import RevenueCard, { type RevenueItem } from "./RevenueCard";
import "../../css/pages/dashboard.css";
import type { CancelReason } from "./CancelRateCard";
import CancelRateCard from "./CancelRateCard";
import { TableView, type OrderTable } from "./TableView";
import type { DataTableProps } from "datatables.net-react";

const cancelReasons: CancelReason[] = [
    { label: "Chờ nguyên liệu & tinh dầu nhập khẩu", percent: 38, count: 7, color: "var(--color-primary)" },
    { label: "Xưởng quá tải công suất sản xuất", percent: 29, count: 5, color: "var(--color-warning)" },
    { label: "Khách đổi công thức / Nốt hương điều chỉnh", percent: 21, count: 4, color: "var(--color-info)" },
    { label: "Lý do khác (Thỏa thuận song phương)", percent: 12, count: 2, color: "var(--color-neutral)" },
];

const revenueItems: RevenueItem[] = [
    { label: "Đã giải ngân xưởng", amount: 913300000, percent: 49.4, color: "var(--color-info)" },
    { label: "Chờ giải ngân (Pending)", amount: 542800000, percent: 29.3, color: "var(--color-warning)" },
    { label: "Phí sàn thu được (Take-rate)", amount: 268500000, percent: 14.5, color: "var(--color-success)" },
    { label: "Tạm giữ Escrow (Tranh chấp)", amount: 125400000, percent: 6.8, color: "var(--color-primary)", highlight: true },
];
const orders: OrderTable[] = [
    {
        code: 'DH-2026-1024',
        time: '10 phút trước',
        customer: 'Nguyễn Hoàng Nam',
        shop: 'Maison De Saigon',
        product: 'Amber Oud EDP 50ml',
        notes: 'Trầm hương Lào & hổ phách',
        lab: 'Mộc Perfume Lab',
        workshop: 'WS-102 (GMP ASEAN)',
        status: 'Chờ xác nhận',
    },
    {
        code: 'DH-2026-1024',
        time: '10 phút trước',
        customer: 'Nguyễn Hoàng Nam',
        shop: 'Maison De Saigon',
        product: 'Amber Oud EDP 50ml',
        notes: 'Trầm hương Lào & hổ phách',
        lab: 'Mộc Perfume Lab',
        workshop: 'WS-102 (GMP ASEAN)',
        status: 'Chờ xác nhận',
    },
    {
        code: 'DH-2026-1024',
        time: '10 phút trước',
        customer: 'Nguyễn Hoàng Nam',
        shop: 'Maison De Saigon',
        product: 'Amber Oud EDP 50ml',
        notes: 'Trầm hương Lào & hổ phách',
        lab: 'Mộc Perfume Lab',
        workshop: 'WS-102 (GMP ASEAN)',
        status: 'Chờ xác nhận',
    },
];

const columns: DataTableProps['columns'] = [
    { title: 'Mã đơn / tên khách hàng', data: 'code' },
    { title: 'Sản phẩm', data: 'product' },
    { title: 'Trạng thái', data: 'status', orderable: false },
];


function OperationsOverview() {


    return (
        <main className="p-4 d-flex flex-column gap-4" style={{ backgroundColor: "var(--color-bg-page)", minHeight: "100vh" }}>
            <PageHeader
                title="Trung tâm Điều phối & Quản trị Sàn B2B - Olla ScentOS"
                pendingCount={5}
            />

            <section className="row g-3">
                <div className="col-12 col-md-6 col-xl-3">
                    <StatCard label="Tổng đơn khách đặt (GMV sàn)" value="142" icon={faBagShopping} tone="danger" note="840 đơn/tháng" />
                </div>
                <div className="col-12 col-md-6 col-xl-3">
                    <StatCard label="Hiệu suất khớp lệnh & xưởng" value="94.6%" icon={faChartColumn} tone="success" note="18 xưởng gia công đối tác" />
                </div>
                <div className="col-12 col-md-6 col-xl-3">
                    <StatCard label="Chuẩn hóa sàn (IFRA / GMP)" value="99.2%" icon={faShieldHalved} tone="info" actionText="Giám định sản" />
                </div>
                <div className="col-12 col-md-6 col-xl-3">
                    <StatCard label="Tranh chấp & khiếu nại (Escrow)" value="04" icon={faTriangleExclamation} tone="warning" actionText="Xử lý ngay" />
                </div>
            </section>

            <section className="row g-3">
                <div className="col-12 col-xl-5">
                    <CancelRateCard rate="3.2%" reasons={cancelReasons} slaTarget="< 4.0%" />
                </div>
                <div className="col-12 col-xl-7">
                    <RevenueCard
                        total={1850000000}
                        items={revenueItems}
                        centerLabel="GIẢI NGÂN"
                        centerValue="49.4%"
                        source="Bảo chứng bởi Olla Escrow System"
                    />
                </div>
            </section>
            <div className="w-100">
                <TableView orders={orders} columns={columns} />
            </div>
        </main>
    );
}

export default OperationsOverview;