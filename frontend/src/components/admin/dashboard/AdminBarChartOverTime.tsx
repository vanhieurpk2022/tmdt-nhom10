import { useState, useEffect, useCallback } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
    Legend,
} from "recharts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faChartColumn,
    faCalendarDays,
    faCoins,
    faBagShopping,
    faBoxesStacked,
    faFlask,
    faRotate,
} from "@fortawesome/free-solid-svg-icons";
import { formatVnd } from "../../format/FormatMoney";
import {
    AdminDashboardService,
    type AdminBarChartResponse,
    type BarChartQueryParams,
} from "../../../api/admin/AdminDashboardService";

type ChartMetric = "revenue" | "orders" | "quantity" | "productType";

export default function AdminBarChartOverTime() {
    const [period, setPeriod] = useState<string>("30days");
    const [customFrom, setCustomFrom] = useState<string>("");
    const [customTo, setCustomTo] = useState<string>("");
    const [isCustomDate, setIsCustomDate] = useState<boolean>(false);
    const [metric, setMetric] = useState<ChartMetric>("revenue");
    const [loading, setLoading] = useState<boolean>(false);
    const [chartData, setChartData] = useState<AdminBarChartResponse | null>(null);

    const fetchChart = useCallback(async () => {
        setLoading(true);
        try {
            const params: BarChartQueryParams = {};
            if (isCustomDate && customFrom && customTo) {
                params.from = customFrom;
                params.to = customTo;
            } else {
                params.period = period;
            }

            const data = await AdminDashboardService.getBarChart(params);
            setChartData(data);
        } catch (err) {
            console.error("Lỗi khi tải dữ liệu biểu đồ cột Admin:", err);
        } finally {
            setLoading(false);
        }
    }, [period, isCustomDate, customFrom, customTo]);

    useEffect(() => {
        fetchChart();
    }, [fetchChart]);

    const items = chartData?.items || [];

    // Format giá trị hiển thị trên trục Y và tooltip
    const formatYAxis = (val: number) => {
        if (metric === "revenue" || metric === "productType") {
            if (val >= 1_000_000_000) return `${(val / 1_000_000_000).toFixed(1)}B`;
            if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(0)}M`;
            if (val >= 1_000) return `${(val / 1_000).toFixed(0)}k`;
            return `${val}`;
        }
        return `${val}`;
    };

    return (
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
            <div className="card-body p-3 p-lg-4">
                {/* 1. Header & Bộ lọc thời gian */}
                <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3 pb-3 border-bottom">
                    <div>
                        <div className="d-flex align-items-center gap-2">
                            <span
                                className="rounded-circle d-flex align-items-center justify-content-center text-white"
                                style={{ width: 34, height: 34, backgroundColor: "#e11d48" }}
                            >
                                <FontAwesomeIcon icon={faChartColumn} style={{ fontSize: 15 }} />
                            </span>
                            <div>
                                <h5 className="fw-bold mb-0 text-dark">Thống kê Vận hành & Doanh số theo Thời gian</h5>
                                <span className="text-secondary small">
                                    Theo dõi biến động dòng tiền, đơn hàng và sản lượng toàn sàn
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Bộ lọc khoảng thời gian */}
                    <div className="d-flex flex-wrap align-items-center gap-2">
                        <div className="btn-group btn-group-sm" role="group">
                            {[
                                { key: "7days", label: "7 ngày" },
                                { key: "30days", label: "30 ngày" },
                                { key: "90days", label: "90 ngày" },
                                { key: "year", label: "1 năm" },
                                { key: "all", label: "Toàn bộ" },
                            ].map((p) => (
                                <button
                                    key={p.key}
                                    type="button"
                                    className={`btn ${!isCustomDate && period === p.key
                                            ? "btn-danger fw-bold"
                                            : "btn-outline-secondary"
                                        }`}
                                    onClick={() => {
                                        setIsCustomDate(false);
                                        setPeriod(p.key);
                                    }}
                                >
                                    {p.label}
                                </button>
                            ))}
                            <button
                                type="button"
                                className={`btn ${isCustomDate ? "btn-danger fw-bold" : "btn-outline-secondary"
                                    }`}
                                onClick={() => setIsCustomDate(true)}
                            >
                                <FontAwesomeIcon icon={faCalendarDays} className="me-1" />
                                Tùy chọn
                            </button>
                        </div>

                        <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary"
                            onClick={fetchChart}
                            title="Làm mới biểu đồ"
                        >
                            <FontAwesomeIcon icon={faRotate} className={loading ? "fa-spin" : ""} />
                        </button>
                    </div>
                </div>

                {/* 2. Bộ lọc ngày tùy chọn (nếu bật) */}
                {isCustomDate && (
                    <div className="d-flex flex-wrap align-items-center gap-2 mb-3 p-2 bg-light rounded-3">
                        <span className="small text-secondary fw-semibold">Từ ngày:</span>
                        <input
                            type="date"
                            className="form-control form-control-sm"
                            style={{ width: "auto" }}
                            value={customFrom}
                            onChange={(e) => setCustomFrom(e.target.value)}
                        />
                        <span className="small text-secondary fw-semibold">Đến ngày:</span>
                        <input
                            type="date"
                            className="form-control form-control-sm"
                            style={{ width: "auto" }}
                            value={customTo}
                            onChange={(e) => setCustomTo(e.target.value)}
                        />
                        <button
                            type="button"
                            className="btn btn-sm btn-danger px-3"
                            onClick={fetchChart}
                            disabled={!customFrom || !customTo}
                        >
                            Áp dụng
                        </button>
                    </div>
                )}

                {/*  Tóm tắt số liệu trong kỳ */}
                <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3">
                    {/* Switcher */}
                    <div className="d-flex flex-wrap gap-2">
                        <button
                            type="button"
                            className={`btn btn-sm rounded-pill px-3 py-1 ${metric === "revenue" ? "btn-danger fw-bold shadow-sm" : "btn-light text-secondary border"
                                }`}
                            onClick={() => setMetric("revenue")}
                        >
                            <FontAwesomeIcon icon={faCoins} className="me-1" />
                            Doanh thu toàn sàn
                        </button>

                        <button
                            type="button"
                            className={`btn btn-sm rounded-pill px-3 py-1 ${metric === "orders" ? "btn-danger fw-bold shadow-sm" : "btn-light text-secondary border"
                                }`}
                            onClick={() => setMetric("orders")}
                        >
                            <FontAwesomeIcon icon={faBagShopping} className="me-1" />
                            Số lượng đơn hàng
                        </button>

                        <button
                            type="button"
                            className={`btn btn-sm rounded-pill px-3 py-1 ${metric === "quantity" ? "btn-danger fw-bold shadow-sm" : "btn-light text-secondary border"
                                }`}
                            onClick={() => setMetric("quantity")}
                        >
                            <FontAwesomeIcon icon={faBoxesStacked} className="me-1" />
                            Sản lượng bán (Chai)
                        </button>

                        <button
                            type="button"
                            className={`btn btn-sm rounded-pill px-3 py-1 ${metric === "productType" ? "btn-danger fw-bold shadow-sm" : "btn-light text-secondary border"
                                }`}
                            onClick={() => setMetric("productType")}
                        >
                            <FontAwesomeIcon icon={faFlask} className="me-1" />
                            Tiêu chuẩn vs Phối hương
                        </button>
                    </div>

                    {/* KPI mini trong kỳ đã chọn */}
                    <div className="d-flex align-items-center gap-3 small text-secondary">
                        <div>
                            Tổng doanh thu:{" "}
                            <strong className="text-danger fs-6">
                                {formatVnd(chartData?.totalPeriodRevenue || 0)}
                            </strong>
                        </div>
                        <div>
                            Đơn hàng:{" "}
                            <strong className="text-dark fs-6">
                                {(chartData?.totalPeriodOrders || 0).toLocaleString("vi-VN")}
                            </strong>
                        </div>
                        <div>
                            Số chai bán:{" "}
                            <strong className="text-dark fs-6">
                                {(chartData?.totalPeriodQuantity || 0).toLocaleString("vi-VN")}
                            </strong>
                        </div>
                    </div>
                </div>

                {/* 4. Vùng vẽ biểu đồ Recharts */}
                <div style={{ width: "100%", height: 320 }} className="position-relative">
                    {loading && (
                        <div
                            className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-white bg-opacity-75"
                            style={{ zIndex: 5 }}
                        >
                            <div className="spinner-border text-danger" role="status" />
                        </div>
                    )}

                    {items.length === 0 ? (
                        <div className="h-100 d-flex flex-column align-items-center justify-content-center text-muted">
                            <FontAwesomeIcon icon={faChartColumn} className="fs-1 mb-2 opacity-50" />
                            <span>Không có dữ liệu đơn hàng trong khoảng thời gian này</span>
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={items} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="label"
                                    stroke="#94a3b8"
                                    tick={{ fontSize: 11 }}
                                    tickLine={false}
                                />
                                <YAxis
                                    stroke="#94a3b8"
                                    tick={{ fontSize: 11 }}
                                    tickLine={false}
                                    tickFormatter={formatYAxis}
                                />
                                <Tooltip
                                    formatter={(value: any, name: any) => {
                                        const num = Number(value) || 0;
                                        if (name === "Doanh thu" || name === "Hàng tiêu chuẩn" || name === "Phối hương Bespoke") {
                                            return [formatVnd(num), name];
                                        }
                                        return [`${num.toLocaleString("vi-VN")} đơn/chai`, name];
                                    }}
                                    contentStyle={{
                                        borderRadius: "10px",
                                        border: "none",
                                        boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
                                        fontSize: "12px",
                                    }}
                                />
                                <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />

                                {/* Render các cột tương ứng theo metric đã chọn */}
                                {metric === "revenue" && (
                                    <Bar
                                        dataKey="revenue"
                                        name="Doanh thu"
                                        fill="#e11d48"
                                        radius={[6, 6, 0, 0]}
                                        maxBarSize={45}
                                    />
                                )}

                                {metric === "orders" && (
                                    <>
                                        <Bar
                                            dataKey="completedOrders"
                                            name="Đơn hoàn thành"
                                            fill="#10b981"
                                            radius={[6, 6, 0, 0]}
                                            maxBarSize={30}
                                        />
                                        <Bar
                                            dataKey="cancelledOrders"
                                            name="Đơn hủy"
                                            fill="#ef4444"
                                            radius={[6, 6, 0, 0]}
                                            maxBarSize={30}
                                        />
                                        <Bar
                                            dataKey="orderCount"
                                            name="Tổng đơn phát sinh"
                                            fill="#0284c7"
                                            radius={[6, 6, 0, 0]}
                                            maxBarSize={30}
                                        />
                                    </>
                                )}

                                {metric === "quantity" && (
                                    <Bar
                                        dataKey="totalQuantity"
                                        name="Số chai bán ra"
                                        fill="#3b82f6"
                                        radius={[6, 6, 0, 0]}
                                        maxBarSize={45}
                                    />
                                )}

                                {metric === "productType" && (
                                    <>
                                        <Bar
                                            dataKey="normalRevenue"
                                            name="Hàng tiêu chuẩn"
                                            stackId="a"
                                            fill="#3b82f6"
                                            radius={[0, 0, 0, 0]}
                                            maxBarSize={45}
                                        />
                                        <Bar
                                            dataKey="customRevenue"
                                            name="Phối hương Bespoke"
                                            stackId="a"
                                            fill="#8b5cf6"
                                            radius={[6, 6, 0, 0]}
                                            maxBarSize={45}
                                        />
                                    </>
                                )}
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>
        </div>
    );
}
