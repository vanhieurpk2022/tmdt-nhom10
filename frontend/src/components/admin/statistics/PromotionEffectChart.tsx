
import {
    Area,
    Bar,
    CartesianGrid,
    ComposedChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
} from "recharts";

interface PromotionData {
    week: string;
    revenue: number;
    budget: number | null;
    forecast?: number | null;
}

const data: PromotionData[] = [
    { week: "Tuần 01", revenue: 12, budget: 4 },
    { week: "Tuần 02", revenue: 17, budget: 8 },
    { week: "Tuần 03", revenue: 16, budget: 12 },
    { week: "Tuần 04 (Hiện tại)", revenue: 25, budget: 16, forecast: 25 },
    { week: "Dự phóng tuần tới", revenue: null as unknown as number, budget: null, forecast: 31 },
];

const formatBillion = (value: number) =>
    `${value.toLocaleString("vi-VN")} tỷ đ`;

function CustomTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null;

    const revenue = payload.find(
        (item: any) => item.dataKey === "revenue"
    )?.value;

    const forecast = payload.find(
        (item: any) => item.dataKey === "forecast"
    )?.value;

    const budget = payload.find(
        (item: any) => item.dataKey === "budget"
    )?.value;

    return (
        <div className="bg-white border rounded-3 shadow-sm p-3">
            <div className="fw-semibold mb-2">{label}</div>

            {revenue != null && (
                <div className="small mb-1">
                    <span className="text-danger">● </span>
                    Doanh thu: {formatBillion(revenue)}
                </div>
            )}

            {forecast != null && (
                <div className="small mb-1">
                    <span className="text-danger">● </span>
                    Dự phóng: {formatBillion(forecast)}
                </div>
            )}

            {budget != null && (
                <div className="small">
                    <span style={{ color: "#DCE8FF" }}>● </span>
                    Ngân sách: {formatBillion(budget)}
                </div>
            )}
        </div>
    );
}

export default function PromotionEffectChart() {
    return (
        <div className="card border shadow-sm rounded-3">
            <div className="card-body p-4">
                {/* Tiêu đề và chú thích */}
                <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-4">
                    <div>
                        <div
                            className="text-primary fw-semibold mb-1"
                            style={{ fontSize: "11px" }}
                        >
                            PHÂN TÍCH HIỆU ỨNG KHUYẾN MÃI
                        </div>

                        <h6 className="fw-bold mb-0">
                            Tương quan Chi phí trợ giá và Tốc độ chốt
                            <br />
                            đơn xuống hàng
                        </h6>
                    </div>

                    <div className="d-flex flex-wrap gap-3 small">
                        <div className="d-flex align-items-start gap-2">
                            <span
                                className="rounded-circle mt-1"
                                style={{
                                    width: 8,
                                    height: 8,
                                    backgroundColor: "#C9003D",
                                }}
                            />
                            <span className="text-secondary">
                                Doanh thu kích cầu
                                <br />
                                (triệu đ)
                            </span>
                        </div>

                        <div className="d-flex align-items-start gap-2">
                            <span
                                className="rounded-1 mt-1"
                                style={{
                                    width: 8,
                                    height: 8,
                                    backgroundColor: "#DCE8FF",
                                }}
                            />
                            <span className="text-secondary">
                                Ngân sách trợ
                                <br />
                                giá sẵn sàng
                            </span>
                        </div>
                    </div>
                </div>

                {/* Biểu đồ */}
                <div style={{ width: "100%", height: 260 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart
                            data={data}
                            margin={{
                                top: 8,
                                right: 8,
                                left: 0,
                                bottom: 0,
                            }}
                        >
                            <defs>
                                <linearGradient
                                    id="revenueGradient"
                                    x1="0"
                                    y1="0"
                                    x2="0"
                                    y2="1"
                                >
                                    <stop
                                        offset="0%"
                                        stopColor="#C9003D"
                                        stopOpacity={0.22}
                                    />
                                    <stop
                                        offset="100%"
                                        stopColor="#C9003D"
                                        stopOpacity={0}
                                    />
                                </linearGradient>
                            </defs>

                            <CartesianGrid
                                vertical={false}
                                stroke="#EDF1F7"
                            />

                            <XAxis
                                dataKey="week"
                                axisLine={false}
                                tickLine={false}
                                interval={0}
                                tick={({ x, y, payload }) => {
                                    const isForecast =
                                        payload.value === "Dự phóng tuần tới";

                                    return (
                                        <text
                                            x={Number(x)}
                                            y={Number(y) + 18}
                                            textAnchor="middle"
                                            fontSize={10}
                                            fill={isForecast ? "#C9003D" : "#526078"}
                                            fontWeight={isForecast ? 600 : 400}
                                        >
                                            {payload.value}
                                        </text>
                                    );
                                }}
                            />

                            <Tooltip
                                content={<CustomTooltip />}
                                cursor={{
                                    fill: "#F6F8FC",
                                }}
                            />

                            <Bar
                                dataKey="budget"
                                fill="#DCE8FF"
                                barSize={10}
                                radius={[5, 5, 5, 5]}
                            />

                            <Area
                                type="monotone"
                                dataKey="revenue"
                                stroke="#C9003D"
                                strokeWidth={2.5}
                                fill="url(#revenueGradient)"
                                connectNulls={false}
                                dot={false}
                                activeDot={{
                                    r: 4,
                                    fill: "#C9003D",
                                    stroke: "#FFFFFF",
                                    strokeWidth: 2,
                                }}
                            />

                            <Area
                                type="monotone"
                                dataKey="forecast"
                                stroke="#C9003D"
                                strokeWidth={2}
                                strokeDasharray="5 4"
                                fill="none"
                                dot={false}
                                connectNulls
                                activeDot={{
                                    r: 4,
                                    fill: "#C9003D",
                                }}
                            />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
