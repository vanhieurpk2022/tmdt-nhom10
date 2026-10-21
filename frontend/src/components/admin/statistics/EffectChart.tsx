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

export function EffectChart() {
    const max = 180;
    const xs = WEEKS.map((_, i) => 40 + i * ((W - 80) / (WEEKS.length - 1)));
    const y = (v: number) => H - (v / max) * H;

    const line: [number, number][] = [
        [0, y(WEEKS[0].revenue - 15)],
        ...WEEKS.map((w, i): [number, number] => [xs[i], y(w.revenue)]),
        [W, y(WEEKS[WEEKS.length - 1].revenue + 5)],
    ];
    const linePath = smoothPath(line);
    const areaPath = `${linePath} L${W},${H} L0,${H} Z`;

    return (
        <div className="card border-0 shadow-sm rounded-3 mb-4">
            <div className="card-body p-4">
                <div className="d-flex flex-wrap justify-content-between gap-3 mb-3">
                    <div>
                        <div className="text-body-secondary text-uppercase fw-semibold" style={{ fontSize: 10 }}>
                            Phân tích hiệu ứng khuyến mãi
                        </div>
                        <h2 className="h6 fw-bold mb-0 mt-1" style={{ maxWidth: 260 }}>
                            Tương quan Chi phí trợ giá và Tốc độ chốt đơn xưởng
                        </h2>
                    </div>
                    <div className="small text-body-secondary">
                        <div className="d-flex align-items-center gap-2">
                            <span className="rounded-circle d-inline-block" style={{ width: 8, height: 8, background: PRIMARY }} />
                            Doanh thu kích cầu (triệu đ)
                        </div>
                        <div className="d-flex align-items-center gap-2">
                            <span className="rounded-circle d-inline-block" style={{ width: 8, height: 8, background: "#cfdaf7" }} />
                            Ngân sách trợ giá sàn
                        </div>
                    </div>
                </div>

                <svg viewBox={`0 0 ${W} ${H + 4}`} className="w-100" role="img" aria-label="Biểu đồ doanh thu kích cầu và ngân sách trợ giá theo tuần">
                    <defs>
                        <linearGradient id="promoArea" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={PRIMARY} stopOpacity="0.28" />
                            <stop offset="100%" stopColor={PRIMARY} stopOpacity="0.02" />
                        </linearGradient>
                    </defs>
                    {WEEKS.map((w, i) => (
                        <rect key={w.label} x={xs[i] - 7} y={y(w.budget)} width={14} height={H - y(w.budget)} rx={7} fill="#cfdaf7" opacity={0.8} />
                    ))}
                    <path d={areaPath} fill="url(#promoArea)" />
                    <path d={linePath} fill="none" stroke={PRIMARY} strokeWidth={2.5} />
                </svg>

                <div className="position-relative" style={{ height: 20 }}>
                    {WEEKS.map((w, i) => (
                        <span
                            key={w.label}
                            className={`position-absolute small fw-semibold text-nowrap ${w.forecast ? "text-danger" : "text-body-secondary"}`}
                            style={{ left: `${(xs[i] / W) * 100}%`, transform: "translateX(-50%)", fontSize: 11 }}
                        >
                            {w.label}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}
