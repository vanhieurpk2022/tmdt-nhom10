import React, { useMemo, useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClipboardList } from '@fortawesome/free-solid-svg-icons';
import { OrderStatus } from '../../../enums/OrderStatus';
import type { FactoryOrderDashBoard, FactoryOrderStatusCount } from '../../../dto/factory/FactoryDashBoard';
import { FactoryServiceManager } from '../../../api/factory/FactoryService';

/* ---------- Cấu hình màu & nhãn cho từng trạng thái ---------- */
const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
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
    const [statusStats, setStatusStats] = useState<FactoryOrderStatusCount[]>([]);

    useEffect(() => {
        let isMounted = true;
        const fetchPie = async () => {
            try {
                const res = await FactoryServiceManager.getPieData();
                if (isMounted && res.status === 200 && Array.isArray(res.data) && res.data.length > 0) {
                    setStatusStats(res.data);
                }
            } catch (err) {
                console.error("Lỗi khi tải dữ liệu biểu đồ tròn:", err);
            }
        };
        fetchPie();
        return () => {
            isMounted = false;
        };
    }, []);

    /* ---------- Tính toán dữ liệu từ API hoặc fallback orders ---------- */
    const { chartData, totalOrders } = useMemo(() => {
        if (statusStats.length > 0) {
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
    }, [statusStats, orders]);

    /* ---------- Dữ liệu mặc định khi chưa có đơn nào ---------- */
    const defaultData = [
        { name: 'Chờ xác nhận', value: 12, color: '#ffc107' },
        { name: 'Đang gia công', value: 18, color: '#0d6efd' },
        { name: 'Hoàn thành', value: 45, color: '#198754' },
        { name: 'Đã hủy', value: 3, color: '#dc3545' },
        { name: 'Đang giao', value: 8, color: '#fd7e14' },
    ];

    const displayData = chartData.length > 0 ? chartData : defaultData;
    const displayTotal = totalOrders > 0 ? totalOrders : defaultData.reduce((s, d) => s + d.value, 0);

    return (
        <div className="card h-100 shadow-sm border-0 rounded-4 p-4">
            <div className="card-body p-0 d-flex flex-column justify-content-between">
                <div>
                    {/* Header – Không còn bộ lọc thời gian */}
                    <div className="d-flex justify-content-between align-items-start mb-3">
                        <div>
                            <h5 className="card-title fw-bold text-dark mb-1">
                                <FontAwesomeIcon icon={faClipboardList} className="me-2 text-primary" />
                                Phân bổ trạng thái đơn hàng
                            </h5>
                            <p className="card-subtitle text-muted small">
                                Tổng quan tình trạng các đơn gia công của xưởng
                            </p>
                        </div>
                        <span className="badge rounded-pill bg-primary-subtle text-primary px-3 py-2">
                            {displayTotal} đơn
                        </span>
                    </div>

                    {/* Biểu đồ tròn + Chú thích */}
                    <div className="row align-items-center my-3">
                        {/* Pie Chart */}
                        <div className="col-12 col-md-5 d-flex justify-content-center mb-3 mb-md-0">
                            <div className="position-relative" style={{ width: '170px', height: '170px' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={displayData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={50}
                                            outerRadius={72}
                                            paddingAngle={2}
                                            dataKey="value"
                                            strokeWidth={0}
                                            isAnimationActive={false}
                                        >
                                            {displayData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            formatter={(value: number, name: string) => [
                                                `${value} đơn (${((value / displayTotal) * 100).toFixed(1)}%)`,
                                                name,
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
                                    <div className="fw-bold fs-4 text-dark">{displayTotal}</div>
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
                                {displayData.map((item, index) => (
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
                                            {item.value} đơn ({((item.value / displayTotal) * 100).toFixed(1)}%)
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};