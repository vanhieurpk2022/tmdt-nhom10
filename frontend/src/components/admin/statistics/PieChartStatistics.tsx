import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleQuestion } from '@fortawesome/free-solid-svg-icons';

export interface CancelDetail {
    name: string;
    value: number;
    count: number;
    color: string;
}

export interface CancelDataPeriod {
    rate: string;
    limit: string;
    details: CancelDetail[];
}

// Khai báo kiểu cho dữ liệu đầu vào theo thời gian
export interface CancelDataByTime {
    [key: string]: CancelDataPeriod;
}

interface CancelRatePieChartProps {
    dataByTime?: CancelDataByTime;
}

// Dữ liệu mặc định nếu không truyền props
const defaultDataByTime: CancelDataByTime = {
    this_week: {
        rate: '2.4%',
        limit: '< 4.0%',
        details: [
            { name: 'Khách đổi ý / Thay đổi yêu cầu mùi hương', value: 45, count: 4, color: '#0d6efd' },
            { name: 'Không thống nhất được thời gian giao hàng', value: 15, count: 1, color: '#ffc107' },
            { name: 'Xưởng xác nhận trễ hạn (Quá 24h)', value: 10, count: 1, color: '#6c757d' },
        ],
    },
    '30_days': {
        rate: '3.1%',
        limit: '< 4.0%',
        details: [
            { name: 'Khách đổi ý / Thay đổi yêu cầu mùi hương', value: 40, count: 12, color: '#0d6efd' },
            { name: 'Không thống nhất được thời gian giao hàng', value: 15, count: 4, color: '#ffc107' },
            { name: 'Xưởng xác nhận trễ hạn (Quá 24h)', value: 10, count: 3, color: '#6c757d' },
        ],
    },
};

export const PieChartStatistics: React.FC<CancelRatePieChartProps> = ({
    dataByTime = defaultDataByTime,
}) => {
    const [timeRange, setTimeRange] = useState<string>('this_week');
    const currentData = dataByTime[timeRange] || dataByTime['this_week'];

    return (
        <div className="card h-100 shadow-sm border-0 rounded-4 p-4">
            <div className="card-body p-0 d-flex flex-column justify-content-between">
                <div>
                    {/* Header & Bộ lọc thời gian */}
                    <div className="d-flex justify-content-between align-items-start mb-3">
                        <div>
                            <h5 className="card-title fw-bold text-dark mb-1">Tỷ lệ đơn hủy của Shop</h5>
                            <p className="card-subtitle text-muted small">
                                Giới hạn cho phép của sàn: {currentData.limit}
                            </p>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                            <select
                                value={timeRange}
                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setTimeRange(e.target.value)}
                                className="form-select form-select-sm bg-light border-secondary-subtle text-dark"
                                style={{ width: 'auto', fontSize: '0.85rem' }}
                            >
                                <option value="this_week">Tuần này</option>
                                <option value="30_days">30 ngày qua</option>
                            </select>
                            <span className="badge bg-secondary-subtle text-secondary rounded-pill px-3 py-2">
                                {currentData.rate}
                            </span>
                        </div>
                    </div>

                    <div className="text-muted mb-3">
                        <FontAwesomeIcon icon={faCircleQuestion} style={{ fontSize: '18px' }} />
                    </div>

                    {/* Biểu đồ tròn + Chú thích */}
                    <div className="row align-items-center my-3">
                        {/* Pie Chart */}
                        <div className="col-12 col-md-5 d-flex justify-content-center mb-3 mb-md-0">
                            <div className="position-relative" style={{ width: '160px', height: '160px' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={currentData.details}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={48}
                                            outerRadius={68}
                                            paddingAngle={2}
                                            dataKey="value"
                                        >
                                            {currentData.details.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                                {/* Nhãn trung tâm */}
                                <div className="position-absolute top-50 start-50 translate-middle text-center pointer-events-none">
                                    <div className="fw-bold fs-4 text-dark">{currentData.rate}</div>
                                    <div className="text-muted text-uppercase" style={{ fontSize: '0.65rem' }}>
                                        Tỷ lệ hủy
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Chú thích */}
                        <div className="col-12 col-md-7">
                            <div className="d-flex flex-column gap-2">
                                {currentData.details.map((item, index) => (
                                    <div key={index} className="d-flex align-items-center justify-content-between small">
                                        <div className="d-flex align-items-center text-truncate me-2">
                                            <span
                                                className="rounded-circle flex-shrink-0 me-2"
                                                style={{ width: '10px', height: '10px', backgroundColor: item.color }}
                                            />
                                            <span className="text-secondary text-truncate">{item.name}</span>
                                        </div>
                                        <span className="fw-semibold text-dark text-nowrap">
                                            {item.value}% ({item.count})
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