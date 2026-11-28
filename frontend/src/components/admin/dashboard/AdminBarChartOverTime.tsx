import { useState, useEffect } from "react";
import axios from "axios";
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
import { DateRangeFilter, formatDisplayDate, parseLocalDate, resolvePresetRange,
    type DateRangeValue } from "../statistics/DateRangeFilter";

type ChartMetric = "revenue" | "orders" | "quantity" | "productType";

export default function AdminBarChartOverTime() {
    const [dateRange, setDateRange] = useState<DateRangeValue>(() => resolvePresetRange("30days"));
    const [refreshVersion, setRefreshVersion] = useState(0);
    const [metric, setMetric] = useState<ChartMetric>("revenue");
    const [requestLoading, setLoading] = useState<boolean>(false);
    const [chartResponse, setChartData] = useState<AdminBarChartResponse | null>(null);
    const [requestError, setErrorMessage] = useState("");
    const from = parseLocalDate(dateRange.fromDate);
    const to = parseLocalDate(dateRange.toDate);
    const validRange = dateRange.preset === "all" || !!(from && to && from <= to);
    const chartData = validRange ? chartResponse : null;
    const loading = validRange && requestLoading;
    const errorMessage = validRange ? requestError
        : "Vui lòng chọn khoảng ngày hợp lệ: ngày bắt đầu không sau ngày kết thúc.";

    useEffect(() => {
        const { preset, fromDate, toDate } = dateRange;
        if (!validRange) return;
        const controller = new AbortController();
        const fetchChart = async () => {
            setLoading(true);
            setErrorMessage("");
            try {
                const params: BarChartQueryParams = preset === "all"
                    ? { period: "all" }
                    : { from: fromDate, to: toDate };
                const data = await AdminDashboardService.getBarChart(params, controller.signal);
                if (!controller.signal.aborted) setChartData(data);
            } catch (error) {
                if (controller.signal.aborted) return;
                setChartData(null);
                setErrorMessage(axios.isAxiosError(error)
                    ? error.response?.data?.message ?? "Không tải được biểu đồ. Vui lòng thử lại."
                    : "Không tải được biểu đồ. Vui lòng thử lại.");
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        };
        void fetchChart();
        return () => controller.abort();
    }, [dateRange, refreshVersion, validRange]);

    const items = chartData?.items || [];
    const groupingLabel = chartData ? { HOUR: "giờ", DAY: "ngày", MONTH: "tháng", YEAR: "năm" }[chartData.groupBy] : "";

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

                    <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => setRefreshVersion(value => value + 1)}
                        disabled={loading || !validRange}
                        title="Làm mới biểu đồ"
                    >
                        <FontAwesomeIcon icon={faRotate} className={loading ? "fa-spin" : ""} />
                    </button>
                </div>

                <DateRangeFilter idPrefix="admin-bar" value={dateRange} onChange={setDateRange}
                    isLoading={loading} />
                {chartData && (
                    <div className="small text-secondary mb-3">
                        {formatDisplayDate(chartData.fromDate)} – {formatDisplayDate(chartData.toDate)}
                        {" · "}Mỗi cột tương ứng một {groupingLabel}
                    </div>
                )}
                {errorMessage && (
                    <div className="alert alert-warning py-2 small" role="alert">{errorMessage}</div>
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
                                    interval="preserveStartEnd"
                                    minTickGap={18}
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
                                    formatter={(value, name) => {
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
