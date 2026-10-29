import React, { useState, useMemo } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
    Legend,
} from 'recharts';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartColumn, faCalendarDays } from '@fortawesome/free-solid-svg-icons';
import { formatVnd } from '../../format/FormatMoney';
import type { FactoryOrderDashBoard, FactoryChartOrder } from '../../../dto/factory/FactoryDashBoard';
import { FactoryServiceManager } from '../../../api/factory/FactoryService';

/* ---------- Kiểu dữ liệu nội bộ ---------- */
interface BarDataItem {
    label: string;
    soLuong: number;  // Số đơn
    doanhThu: number; // Tổng tiền
    sanLuong: number; // Tổng số chai
}

interface BarChartStatisticProps {
    orders?: (FactoryOrderDashBoard | FactoryChartOrder)[];
    totalRevenue?: string;
}

/* ---------- Helpers ---------- */

/** Tính số ngày chênh lệch giữa 2 Date */
function diffDays(a: Date, b: Date): number {
    return Math.round(Math.abs(b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

/** Format Date → YYYY-MM-DD cho input[type=date] */
function toInputDate(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

/**
 * Nhóm orders trong khoảng [startDate, endDate].
 * - Nếu khoảng ≤ 60 ngày → nhóm theo ngày (DD/MM)
 * - Nếu khoảng > 60 ngày → nhóm theo tháng (MM/YYYY)
 */
function buildChartData(
    orders: (FactoryOrderDashBoard | FactoryChartOrder)[],
    startDate: Date,
    endDate: Date,
): BarDataItem[] {
    const days = diffDays(startDate, endDate);
    const groupByMonth = days > 60;

    // Chuẩn hóa endDate → cuối ngày
    const endOfDay = new Date(endDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Lọc orders trong khoảng thời gian
    const filtered = orders.filter((o) => {
        const d = new Date(o.time);
        return d >= startDate && d <= endOfDay;
    });

    const map = new Map<string, BarDataItem>();

    filtered.forEach((o) => {
        const d = new Date(o.time);
        const key = groupByMonth
            ? `${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
            : `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;

        if (!map.has(key)) {
            map.set(key, { label: key, soLuong: 0, doanhThu: 0, sanLuong: 0 });
        }

        const entry = map.get(key)!;
        entry.soLuong += 1;
        entry.doanhThu += o.price || 0;
        entry.sanLuong += o.totalQuantity || 0;
    });

    // Sắp xếp theo thời gian
    return Array.from(map.values()).sort((a, b) => {
        const aParts = a.label.split('/').map(Number);
        const bParts = b.label.split('/').map(Number);
        if (groupByMonth) {
            // MM/YYYY
            return aParts[1] !== bParts[1] ? aParts[1] - bParts[1] : aParts[0] - bParts[0];
        }
        // DD/MM
        return aParts[1] !== bParts[1] ? aParts[1] - bParts[1] : aParts[0] - bParts[0];
    });
}

/* ---------- Dữ liệu mặc định khi chưa có orders ---------- */
const DEFAULT_DATA: BarDataItem[] = [
    { label: '20/10', soLuong: 5, doanhThu: 12500000, sanLuong: 250 },
    { label: '21/10', soLuong: 8, doanhThu: 22000000, sanLuong: 400 },
    { label: '22/10', soLuong: 3, doanhThu: 8500000, sanLuong: 150 },
    { label: '23/10', soLuong: 10, doanhThu: 28000000, sanLuong: 520 },
    { label: '24/10', soLuong: 6, doanhThu: 16000000, sanLuong: 300 },
    { label: '25/10', soLuong: 12, doanhThu: 35000000, sanLuong: 680 },
    { label: '26/10', soLuong: 4, doanhThu: 11000000, sanLuong: 200 },
];

/* ---------- Custom Tooltip ---------- */
const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;

    return (
        <div
            className="bg-white shadow-sm border rounded-3 p-2"
            style={{ fontSize: '12px', minWidth: '160px' }}
        >
            <div className="fw-bold mb-1 text-dark">{label}</div>
            {payload.map((entry: any, i: number) => (
                <div key={i} className="d-flex justify-content-between gap-3">
                    <span style={{ color: entry.color }}>{entry.name}:</span>
                    <span className="fw-semibold text-dark">
                        {entry.dataKey === 'doanhThu'
                            ? formatVnd(entry.value)
                            : entry.dataKey === 'sanLuong'
                                ? `${entry.value} chai`
                                : `${entry.value} đơn`}
                    </span>
                </div>
            ))}
        </div>
    );
};

/* ================================================================
 *  COMPONENT CHÍNH
 * ================================================================ */
export const BarChartStatistic: React.FC<BarChartStatisticProps> = ({
    orders = [],
}) => {
    // Mặc định: 7 ngày gần nhất
    const today = new Date();
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [fromDate, setFromDate] = useState<string>(toInputDate(sevenDaysAgo));
    const [toDate, setToDate] = useState<string>(toInputDate(today));
    const [chartOrders, setChartOrders] = useState<FactoryChartOrder[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    /* ---------- Gọi API lấy dữ liệu biểu đồ theo khoảng ngày ---------- */
    React.useEffect(() => {
        let isMounted = true;
        const fetchChart = async () => {
            if (!fromDate || !toDate) return;
            if (new Date(fromDate) > new Date(toDate)) return;
            setIsLoading(true);
            try {
                const res = await FactoryServiceManager.getChartData(fromDate, toDate);
                if (isMounted && res.status === 200 && Array.isArray(res.data)) {
                    setChartOrders(res.data);
                }
            } catch (error) {
                console.error("Lỗi khi tải dữ liệu biểu đồ:", error);
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        fetchChart();
        return () => {
            isMounted = false;
        };
    }, [fromDate, toDate]);

    /* ---------- Tính dữ liệu biểu đồ ---------- */
    const chartData = useMemo(() => {
        const start = new Date(fromDate);
        const end = new Date(toDate);

        // Đảm bảo fromDate <= toDate
        if (start > end) return DEFAULT_DATA;

        // Ưu tiên dữ liệu lấy từ API, nếu không có thì dùng orders truyền vào, cuối cùng fallback DEFAULT_DATA
        const sourceOrders = chartOrders.length > 0 ? chartOrders : orders;
        const computed = buildChartData(sourceOrders, start, end);
        return computed.length > 0 ? computed : DEFAULT_DATA;
    }, [chartOrders, orders, fromDate, toDate]);

    /* ---------- Tổng hợp ---------- */
    const summary = useMemo(() => {
        const tongDon = chartData.reduce((s, d) => s + d.soLuong, 0);
        const tongDoanhThu = chartData.reduce((s, d) => s + d.doanhThu, 0);
        const tongSanLuong = chartData.reduce((s, d) => s + d.sanLuong, 0);
        return { tongDon, tongDoanhThu, tongSanLuong };
    }, [chartData]);

    /* ---------- Nhãn tự động: nhóm theo ngày hay tháng ---------- */
    const rangeLabel = useMemo(() => {
        const days = diffDays(new Date(fromDate), new Date(toDate));
        return days > 60 ? 'theo tháng' : 'theo ngày';
    }, [fromDate, toDate]);

    return (
        <div className="card h-100 shadow-sm border-0 rounded-4 p-4">
            <div className="card-body p-0 d-flex flex-column justify-content-between">
                <div>
                    {/* Header */}
                    <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-3">
                        <div>
                            <h5 className="card-title fw-bold text-dark mb-1">
                                <FontAwesomeIcon icon={faChartColumn} className="me-2 text-success" />
                                Sản lượng &amp; Doanh thu gia công
                            </h5>
                            <p className="card-subtitle text-muted small mb-0">
                                Thống kê hoạt động sản xuất của xưởng ({rangeLabel})
                            </p>
                        </div>
                    </div>

                    {/* Bộ lọc ngày: Từ ngày → Đến ngày */}
                    <div className="d-flex align-items-center flex-wrap gap-2 mb-3">
                        <FontAwesomeIcon icon={faCalendarDays} className="text-muted" />
                        <div className="d-flex align-items-center gap-1">
                            <label htmlFor="bar-from-date" className="text-muted small mb-0 text-nowrap">
                                Từ:
                            </label>
                            <input
                                id="bar-from-date"
                                type="date"
                                className="form-control form-control-sm bg-light border-secondary-subtle"
                                style={{ width: 'auto', fontSize: '0.85rem' }}
                                value={fromDate}
                                max={toDate}
                                onChange={(e) => setFromDate(e.target.value)}
                            />
                        </div>
                        <div className="d-flex align-items-center gap-1">
                            <label htmlFor="bar-to-date" className="text-muted small mb-0 text-nowrap">
                                Đến:
                            </label>
                            <input
                                id="bar-to-date"
                                type="date"
                                className="form-control form-control-sm bg-light border-secondary-subtle"
                                style={{ width: 'auto', fontSize: '0.85rem' }}
                                value={toDate}
                                min={fromDate}
                                onChange={(e) => setToDate(e.target.value)}
                            />
                        </div>
                        {isLoading && (
                            <div className="spinner-border spinner-border-sm text-success ms-1" role="status">
                                <span className="visually-hidden">Đang tải...</span>
                            </div>
                        )}
                    </div>

                    {/* Tổng hợp nhanh */}
                    <div className="row g-2 mb-3">
                        <div className="col-4">
                            <div className="bg-success bg-opacity-10 rounded-3 p-2 text-center border border-success border-opacity-25">
                                <div className="fw-bold fs-6 text-success">{summary.tongDon}</div>
                                <div className="text-muted" style={{ fontSize: '0.7rem' }}>
                                    Tổng đơn
                                </div>
                            </div>
                        </div>
                        <div className="col-4">
                            <div className="bg-primary bg-opacity-10 rounded-3 p-2 text-center border border-primary border-opacity-25">
                                <div className="fw-bold fs-6 text-primary">
                                    {summary.tongSanLuong.toLocaleString('vi-VN')}
                                </div>
                                <div className="text-muted" style={{ fontSize: '0.7rem' }}>
                                    Tổng chai SX
                                </div>
                            </div>
                        </div>
                        <div className="col-4">
                            <div className="bg-warning bg-opacity-10 rounded-3 p-2 text-center border border-warning border-opacity-25">
                                <div className="fw-bold text-dark" style={{ fontSize: '0.85rem' }}>
                                    {formatVnd(summary.tongDoanhThu)}
                                </div>
                                <div className="text-muted" style={{ fontSize: '0.7rem' }}>
                                    Doanh thu
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Biểu đồ cột */}
                    <div className="mt-2 pt-2 border-top" style={{ width: '100%', height: '220px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={chartData}
                                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e9ecef" />
                                <XAxis
                                    dataKey="label"
                                    tick={{ fontSize: 10, fill: '#6c757d' }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    yAxisId="left"
                                    tick={{ fontSize: 10, fill: '#6c757d' }}
                                    axisLine={false}
                                    tickLine={false}
                                    width={45}
                                />
                                <YAxis
                                    yAxisId="right"
                                    orientation="right"
                                    tick={{ fontSize: 10, fill: '#6c757d' }}
                                    axisLine={false}
                                    tickLine={false}
                                    width={40}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend
                                    wrapperStyle={{ fontSize: '11px' }}
                                    iconType="circle"
                                    iconSize={8}
                                />
                                <Bar
                                    yAxisId="left"
                                    dataKey="sanLuong"
                                    name="Sản lượng (chai)"
                                    fill="#0d6efd"
                                    radius={[4, 4, 0, 0]}
                                    barSize={18}
                                    isAnimationActive={false}
                                />
                                <Bar
                                    yAxisId="right"
                                    dataKey="soLuong"
                                    name="Số đơn"
                                    fill="#198754"
                                    radius={[4, 4, 0, 0]}
                                    barSize={18}
                                    isAnimationActive={false}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};