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

type Granularity = 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year';

interface BarChartStatisticProps {
    orders?: (FactoryOrderDashBoard | FactoryChartOrder)[];
    totalRevenue?: string;
}

const DAY_MS = 24 * 60 * 60 * 1000;

/* ---------- Helpers ---------- */

/** Format Date → YYYY-MM-DD cho input[type=date] */
function toInputDate(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

/** Đầu ngày (00:00:00.000) */
function startOfDay(d: Date): Date {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
}

/** Số ngày của khoảng chọn, tính cả hai đầu (from = to → 1 ngày) */
function inclusiveDays(startDate: Date, endDate: Date): number {
    const start = startOfDay(startDate).getTime();
    const end = startOfDay(endDate).getTime();
    return Math.max(1, Math.floor((end - start) / DAY_MS) + 1);
}

/**
 * Chọn đơn vị gom nhóm theo độ dài khoảng chọn:
 * - 1 ngày      → giờ   (24 cột)
 * - ≤ 31 ngày   → ngày  (≤ 31 cột)
 * - ≤ ~6 tháng  → tuần  (≤ 26 cột)
 * - ≤ ~2 năm    → tháng (≤ 24 cột)
 * - ≤ ~5 năm    → quý   (≤ 20 cột)
 * - trên 5 năm  → năm
 */
function pickGranularity(days: number): Granularity {
    if (days <= 1) return 'hour';
    if (days <= 31) return 'day';
    if (days <= 182) return 'week';
    if (days <= 730) return 'month';
    if (days <= 1826) return 'quarter';
    return 'year';
}

const pad2 = (n: number) => String(n).padStart(2, '0');

/** Chuẩn hóa một thời điểm về khóa + nhãn của đơn vị gom nhóm */
function bucketOf(date: Date, granularity: Granularity): { key: number; label: string } {
    const d = new Date(date);
    switch (granularity) {
        case 'hour': {
            d.setMinutes(0, 0, 0);
            return { key: d.getTime(), label: `${pad2(d.getHours())}:00` };
        }
        case 'day': {
            d.setHours(0, 0, 0, 0);
            return { key: d.getTime(), label: `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}` };
        }
        case 'week': {
            d.setHours(0, 0, 0, 0);
            const offset = (d.getDay() + 6) % 7; // Thứ 2 là đầu tuần
            d.setDate(d.getDate() - offset);
            return { key: d.getTime(), label: `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}` };
        }
        case 'quarter': {
            const quarter = Math.floor(d.getMonth() / 3);
            d.setMonth(quarter * 3, 1);
            d.setHours(0, 0, 0, 0);
            return { key: d.getTime(), label: `Q${quarter + 1}/${d.getFullYear()}` };
        }
        case 'year': {
            d.setMonth(0, 1);
            d.setHours(0, 0, 0, 0);
            return { key: d.getTime(), label: String(d.getFullYear()) };
        }
        case 'month':
        default: {
            d.setDate(1);
            d.setHours(0, 0, 0, 0);
            return { key: d.getTime(), label: `${pad2(d.getMonth() + 1)}/${d.getFullYear()}` };
        }
    }
}

/** Tạo sẵn đủ các cột (kể cả cột trống) cho khoảng đã chọn */
function seedBuckets(granularity: Granularity, startDate: Date, endDate: Date): Map<number, BarDataItem> {
    const map = new Map<number, BarDataItem>();
    const add = (d: Date) => {
        const bucket = bucketOf(d, granularity);
        if (!map.has(bucket.key)) {
            map.set(bucket.key, { label: bucket.label, soLuong: 0, doanhThu: 0, sanLuong: 0 });
        }
    };

    // 1 ngày → luôn đủ 24 giờ
    if (granularity === 'hour') {
        const day = startOfDay(startDate);
        for (let h = 0; h < 24; h += 1) {
            add(new Date(day.getTime() + h * 60 * 60 * 1000));
        }
        return map;
    }

    const endTime = startOfDay(endDate).getTime();
    const cursor = new Date(bucketOf(startDate, granularity).key);

    while (cursor.getTime() <= endTime) {
        add(cursor);

        if (granularity === 'day') cursor.setDate(cursor.getDate() + 1);
        else if (granularity === 'week') cursor.setDate(cursor.getDate() + 7);
        else if (granularity === 'month') cursor.setMonth(cursor.getMonth() + 1);
        else if (granularity === 'quarter') cursor.setMonth(cursor.getMonth() + 3);
        else cursor.setFullYear(cursor.getFullYear() + 1);
    }

    return map;
}

/**
 * Nhóm orders trong khoảng [startDate, endDate] theo đơn vị phù hợp
 * với độ dài khoảng chọn (giờ/ngày/tuần/tháng/quý/năm).
 */
function buildChartData(
    orders: (FactoryOrderDashBoard | FactoryChartOrder)[],
    startDate: Date,
    endDate: Date,
): BarDataItem[] {
    const granularity = pickGranularity(inclusiveDays(startDate, endDate));
    const map = seedBuckets(granularity, startDate, endDate);

    const rangeStart = startOfDay(startDate).getTime();
    const rangeEnd = new Date(endDate);
    rangeEnd.setHours(23, 59, 59, 999);

    orders.forEach((o) => {
        const time = new Date(o.time);
        const timeValue = time.getTime();

        if (Number.isNaN(timeValue)) return;
        if (timeValue < rangeStart || timeValue > rangeEnd.getTime()) return;

        const entry = map.get(bucketOf(time, granularity).key);
        if (!entry) return;

        entry.soLuong += 1;
        entry.doanhThu += o.price || 0;
        entry.sanLuong += o.totalQuantity || 0;
    });

    return Array.from(map.values());
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
const CustomTooltip = ({ active, payload, label }: {
    active?: boolean; payload?: Array<{ dataKey?: string; value: number; color?: string; name?: string }>; label?: string;
}) => {
    if (!active || !payload?.length) return null;

    return (
        <div
            className="bg-white shadow-sm border rounded-3 p-2"
            style={{ fontSize: '12px', minWidth: '160px' }}
        >
            <div className="fw-bold mb-1 text-dark">{label}</div>
            {payload.map((entry, i) => (
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

    /* ---------- Nhãn tự động: đơn vị gom nhóm theo độ dài khoảng chọn ---------- */
    const rangeLabel = useMemo(() => {
        const granularity = pickGranularity(inclusiveDays(new Date(fromDate), new Date(toDate)));
        const labels: Record<Granularity, string> = {
            hour: 'theo giờ',
            day: 'theo ngày',
            week: 'theo tuần',
            month: 'theo tháng',
            quarter: 'theo quý',
            year: 'theo năm',
        };
        return labels[granularity];
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
