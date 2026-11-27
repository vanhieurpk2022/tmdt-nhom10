import React, { useMemo, useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClipboardList } from '@fortawesome/free-solid-svg-icons';
import { OrderStatus } from '../../../enums/OrderStatus';
import type { FactoryOrderDashBoard, FactoryOrderStatusCount } from '../../../dto/factory/FactoryDashBoard';
import { FactoryServiceManager } from '../../../api/factory/FactoryService';
import {
    DateRangeFilter,
    formatDisplayDate,
    resolvePresetRange,
    type DateRangeValue,
} from './DateRangeFilter';

/* ---------- Cấu hình màu & nhãn cho từng trạng thái ---------- */
const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
    [OrderStatus.PENDING_PAYMENT]: { label: 'Chờ thanh toán', color: '#adb5bd' },
    [OrderStatus.PENDING]: { label: 'Chờ xác nhận', color: '#ffc107' },
    [OrderStatus.CONFIRMED]: { label: 'Đã xác nhận', color: '#0dcaf0' },
    [OrderStatus.PROCESSING]: { label: 'Đang gia công', color: '#0d6efd' },
    [OrderStatus.SHIPPED]: { label: 'Đã giao vận chuyển', color: '#6f42c1' },
    [OrderStatus.DELIVERING]: { label: 'Đang giao', color: '#fd7e14' },
    [OrderStatus.DELIVERED]: { label: 'Hoàn thành', color: '#198754' },
    [OrderStatus.CANCELLED]: { label: 'Đã hủy', color: '#dc3545' },
    [OrderStatus.RETURNED]: { label: 'Trả hàng', color: '#6c757d' },
    [OrderStatus.REFUNDED]: { label: 'Hoàn tiền', color: '#adb5bd' },
};

interface PieChartStatisticsProps {
    orders?: FactoryOrderDashBoard[];
}

export const PieChartStatistics: React.FC<PieChartStatisticsProps> = ({ orders = [] }) => {
    const [dateRange, setDateRange] = useState<DateRangeValue>(() => resolvePresetRange('all'));
    const [statusStats, setStatusStats] = useState<FactoryOrderStatusCount[]>([]);
    const [hasLoaded, setHasLoaded] = useState<boolean>(false);
    const [hasError, setHasError] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        let isMounted = true;
        const { preset, fromDate, toDate } = dateRange;

        if (preset !== 'all') {
            if (!fromDate || !toDate || fromDate > toDate) {
                return;
            }
        }

        const fetchPie = async () => {
            setIsLoading(true);
            setHasError(false);
            try {
                const res = await FactoryServiceManager.getPieData(
                    preset === 'all' ? undefined : fromDate,
                    preset === 'all' ? undefined : toDate,
                );
                if (isMounted && res.status === 200 && Array.isArray(res.data)) {
                    setStatusStats(res.data);
                    setHasLoaded(true);
                }
            } catch (err) {
                console.error('Lỗi khi tải dữ liệu biểu đồ tròn:', err);
                if (isMounted) setHasError(true);
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        void fetchPie();
        return () => {
            isMounted = false;
        };
    }, [dateRange]);

    const rangeSubtitle = useMemo(() => {
        switch (dateRange.preset) {
            case 'today':
                return 'Trong ngày hôm nay';
            case '7days':
                return 'Trong 7 ngày gần nhất';
            case '30days':
                return 'Trong 30 ngày gần nhất';
            case '6months':
                return 'Trong 6 tháng gần nhất';
            case '1year':
                return 'Trong 1 năm gần nhất';
            case 'custom':
                return dateRange.fromDate && dateRange.toDate
                    ? `Từ ${formatDisplayDate(dateRange.fromDate)} đến ${formatDisplayDate(dateRange.toDate)}`
                    : 'Chọn khoảng thời gian';
            case 'all':
            default:
                return 'Toàn bộ thời gian';
        }
    }, [dateRange]);

    /* ---------- Tính toán dữ liệu từ API hoặc fallback orders khi chưa tải được API ---------- */
    const { chartData, totalOrders } = useMemo(() => {
        if (hasLoaded && !hasError) {
            const data = statusStats
                .map((item) => ({
                    name: STATUS_CONFIG[item.status]?.label || item.status,
                    value: item.count,
                    color: STATUS_CONFIG[item.status]?.color || '#adb5bd',
                }))
                .filter((d) => d.value > 0)
                .sort((a, b) => b.value - a.value);

            const total = data.reduce((s, d) => s + d.value, 0);
            return { chartData: data, totalOrders: total };
        }

        const countMap: Record<string, number> = {};
        orders.forEach((o) => {
            countMap[o.status] = (countMap[o.status] || 0) + 1;
        });

        const data = Object.entries(countMap)
            .map(([status, count]) => ({
                name: STATUS_CONFIG[status]?.label || status,
                value: count,
                color: STATUS_CONFIG[status]?.color || '#adb5bd',
            }))
            .sort((a, b) => b.value - a.value);

        return { chartData: data, totalOrders: orders.length };
    }, [statusStats, orders, hasLoaded, hasError]);

    const isEmptyRange = hasLoaded && !hasError && totalOrders === 0;

    return (
        <div className="card h-100 shadow-sm border-0 rounded-4 p-4">
            <div className="card-body p-0 d-flex flex-column justify-content-between">
                <div>
                    {/* Header */}
                    <div className="d-flex justify-content-between align-items-start gap-2 mb-3">
                        <div>
                            <h5 className="card-title fw-bold text-dark mb-1">
                                <FontAwesomeIcon icon={faClipboardList} className="me-2 text-primary" />
                                Phân bổ trạng thái đơn hàng
                            </h5>
                            <p className="card-subtitle text-muted small mb-0">
                                Tổng quan tình trạng đơn gia công ({rangeSubtitle})
                            </p>
                        </div>
                        <span className="badge rounded-pill bg-primary-subtle text-primary px-3 py-2 text-nowrap">
                            {totalOrders} đơn
                        </span>
                    </div>

                    {/* Bộ lọc thời gian */}
                    <DateRangeFilter
                        idPrefix="pie"
                        value={dateRange}
                        onChange={setDateRange}
                        tone="primary"
                        isLoading={isLoading}
                    />

                    {/* Biểu đồ tròn + Chú thích */}
                    {isEmptyRange ? (
                        <div className="text-center text-muted py-5 small border-top mt-2">
                            Không có đơn hàng nào trong khoảng thời gian đã chọn.
                        </div>
                    ) : (
                        <div className="row align-items-center my-2">
                            {/* Pie Chart */}
                            <div className="col-12 col-md-5 d-flex justify-content-center mb-3 mb-md-0">
                                <div className="position-relative" style={{ width: '170px', height: '170px' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={chartData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={50}
                                                outerRadius={72}
                                                paddingAngle={2}
                                                dataKey="value"
                                                strokeWidth={0}
                                                isAnimationActive={false}
                                            >
                                                {chartData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                formatter={(value, name) => [
                                                    `${value ?? 0} đơn (${totalOrders > 0 ? ((Number(value ?? 0) / totalOrders) * 100).toFixed(1) : '0.0'}%)`,
                                                    String(name ?? ''),
                                                ]}
                                                contentStyle={{
                                                    fontSize: '12px',
                                                    borderRadius: '8px',
                                                    border: '1px solid #e9ecef',
                                                }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    {/* Nhãn trung tâm */}
                                    <div
                                        className="position-absolute top-50 start-50 translate-middle text-center"
                                        style={{ pointerEvents: 'none' }}
                                    >
                                        <div className="fw-bold fs-4 text-dark">{totalOrders}</div>
                                        <div
                                            className="text-muted text-uppercase fw-semibold"
                                            style={{ fontSize: '0.6rem' }}
                                        >
                                            Tổng đơn
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Chú thích */}
                            <div className="col-12 col-md-7">
                                <div className="d-flex flex-column gap-2">
                                    {chartData.map((item, index) => (
                                        <div
                                            key={index}
                                            className="d-flex align-items-center justify-content-between small"
                                        >
                                            <div className="d-flex align-items-center text-truncate me-2">
                                                <span
                                                    className="rounded-circle flex-shrink-0 me-2"
                                                    style={{
                                                        width: '10px',
                                                        height: '10px',
                                                        backgroundColor: item.color,
                                                    }}
                                                />
                                                <span className="text-secondary text-truncate">{item.name}</span>
                                            </div>
                                            <span className="fw-semibold text-dark text-nowrap">
                                                {item.value} đơn ({totalOrders > 0 ? ((item.value / totalOrders) * 100).toFixed(1) : '0.0'}%)
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
