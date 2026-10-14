interface Stat {
    label: string;
    value: string;
    unit?: string;
    left?: string;
    right?: string;
    rightClass?: string;
    icon: string;
    tint: string; // class màu Bootstrap
}

const STATS: Stat[] = [
    { label: "Tổng voucher đang chạy", value: "12", unit: "chiến dịch hoạt động", left: "↗ +3 chiến dịch mới trong tuần", icon: "bi-ticket-perforated", tint: "danger" },
    { label: "Ngân sách trợ giá sàn đã chi", value: "145.000.000đ", left: "Hạn mức tháng: 250M", right: "58% định mức", rightClass: "text-danger", icon: "bi-cash-stack", tint: "success" },
    { label: "Doanh thu kích cầu", value: "890.000.000đ", left: "↑ ROI trợ giá x6.14 lần", icon: "bi-graph-up-arrow", tint: "danger" },
    { label: "Tỷ lệ chuyển đổi voucher", value: "28.4%", unit: "Tăng +4.2%", left: "• Độ phản hồi giỏ hàng đạt đỉnh ca sáng", icon: "bi-cart-check", tint: "success" },
];

const StatCard = ({ s }: { s: Stat }) => (
    <div className="card border-0 shadow-sm rounded-3 h-100 position-relative overflow-hidden">
        <div
            className={`position-absolute top-0 end-0 bg-${s.tint}-subtle bg-opacity-50 d-flex align-items-center justify-content-center`}
            style={{ width: 80, height: 80, borderBottomLeftRadius: "100%" }}
        >
            <i className={`bi ${s.icon} text-${s.tint} ms-3 mb-3`} />
        </div>
        <div className="card-body py-3">
            <div className="text-body-secondary text-uppercase fw-semibold" style={{ fontSize: 10, maxWidth: "75%" }}>
                {s.label}
            </div>
            <div className="mt-2">
                <span className="fs-5 fw-bold">{s.value}</span>
                {s.unit && <span className="small text-body-secondary ms-2">{s.unit}</span>}
            </div>
            <div className="d-flex justify-content-between mt-2 small fw-semibold" style={{ fontSize: 11 }}>
                <span className={s.left?.startsWith("↗") || s.left?.startsWith("↑") ? "text-success" : "text-body-secondary"}>
                    {s.left}
                </span>
                {s.right && <span className={s.rightClass}>{s.right}</span>}
            </div>
        </div>
    </div>
);

/* ================== Biểu đồ (SVG thuần, không cần thư viện) ================== */
const W = 800;
const H = 150;
const PRIMARY = "#e11d48";

interface WeekPoint {
    label: string;
    revenue: number; // triệu đ
    budget: number; // triệu đ
    forecast?: boolean;
}

const WEEKS: WeekPoint[] = [
    { label: "Tuần 01", revenue: 70, budget: 25 },
    { label: "Tuần 02", revenue: 90, budget: 45 },
    { label: "Tuần 03", revenue: 120, budget: 30 },
    { label: "Tuần 04 (Hiện tại)", revenue: 150, budget: 60 },
    { label: "Dự phóng tuần tới", revenue: 165, budget: 70, forecast: true },
];

/** Đường cong mượt giữa các điểm */
const smoothPath = (pts: [number, number][]) => {
    let d = `M${pts[0][0]},${pts[0][1]}`;
    for (let i = 0; i < pts.length - 1; i++) {
        const [x0, y0] = pts[i];
        const [x1, y1] = pts[i + 1];
        const cx = (x0 + x1) / 2;
        d += ` C${cx},${y0} ${cx},${y1} ${x1},${y1}`;
    }
    return d;
};