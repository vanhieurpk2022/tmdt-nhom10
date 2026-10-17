import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleQuestion, faShieldHalved } from '@fortawesome/free-solid-svg-icons';
import { formatVnd } from '../../format/FormatMoney';

export interface RevenueBarItem {
    name: string;
    amount: number;
    fill: string;
}

export interface RevenueDetailItem {
    label: string;
    value: string;
    badgeBg: string;
    isAlert?: boolean;
}

interface RevenueBarChartProps {
    totalRevenue?: string;
    netRate?: string;
    chartData?: RevenueBarItem[];
    detailsData?: RevenueDetailItem[];
}

const defaultChartData: RevenueBarItem[] = [
    { name: 'Đã đối soát', amount: 285000000, fill: '#198754' },
    { name: 'Chờ đối soát', amount: 112500000, fill: '#ffc107' },
    { name: 'Phí cố định & Sàn', amount: 36000000, fill: '#0d6efd' },
    { name: 'Tạm giữ / Khiếu nại', amount: 16500000, fill: '#dc3545' },
];

const defaultDetailsData: RevenueDetailItem[] = [
    { label: 'Đã đối soát (Có thể rút về ngân hàng)', value: '285.000.000 đ', badgeBg: 'bg-success' },
    { label: 'Chờ đối soát (Đơn đang xử lý / chờ khách nhận)', value: '112.500.000 đ', badgeBg: 'bg-warning' },
    { label: 'Phí cố định & Hoa hồng sàn (Commission Fee)', value: '36.000.000 đ', badgeBg: 'bg-primary' },
    { label: 'Đang tạm giữ do Khiếu nại / Trả hàng', value: '16.500.000 đ', badgeBg: 'bg-danger', isAlert: true },
];

export const BarChartStatistic: React.FC<RevenueBarChartProps> = ({
    totalRevenue = '450.000.000 đ',
    netRate = '63.3%',
    chartData = defaultChartData,
    detailsData = defaultDetailsData,
}) => {
    return (
        <div className="card h-100 shadow-sm border-0 rounded-4 p-4">
            <div className="card-body p-0 d-flex flex-column justify-content-between">
                <div>
                    {/* Header */}
                    <div className="mb-3">
                        <h5 className="card-title fw-bold text-dark mb-1">Doanh thu & Ví Người Bán</h5>
                        <p className="card-subtitle text-muted small">
                            Tổng doanh thu đơn hàng tháng này: {totalRevenue}
                        </p>
                    </div>

                    <div className="text-muted mb-3">
                        <FontAwesomeIcon icon={faCircleQuestion} style={{ fontSize: '18px' }} />
                    </div>

                    {/* Chi tiết phần trăm thực nhận & danh sách */}
                    <div className="row align-items-center g-3 my-2">
                        {/* Ô phần trăm thực nhận */}
                        <div className="col-12 col-md-4">
                            <div className="bg-light p-3 rounded-3 text-center border">
                                <div className="fw-bold fs-3 text-dark">{netRate}</div>
                                <div className="text-muted text-uppercase fw-semibold" style={{ fontSize: '0.65rem' }}>
                                    THỰC NHẬN
                                </div>
                            </div>
                        </div>

                        {/* Chi tiết các khoản */}
                        <div className="col-12 col-md-8">
                            <div className="d-flex flex-column gap-2">
                                {detailsData.map((item, index) => (
                                    <div key={index} className="d-flex align-items-center justify-content-between small">
                                        <div className="d-flex align-items-center text-truncate me-2">
                                            <span
                                                className={`rounded-circle flex-shrink-0 me-2 ${item.badgeBg}`}
                                                style={{ width: '10px', height: '10px' }}
                                            />
                                            <span className={`text-truncate ${item.isAlert ? 'text-danger fw-bold' : 'text-secondary'}`}>
                                                {item.label}
                                            </span>
                                        </div>
                                        <span className={`fw-semibold text-nowrap ${item.isAlert ? 'text-danger' : 'text-dark'}`}>
                                            {item.value}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Bar Chart */}
                    <div className="mt-4 pt-2 border-top" style={{ width: '100%', height: '120px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e9ecef" />
                                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#6c757d' }} axisLine={false} tickLine={false} />
                                <YAxis hide />
                                <Tooltip
                                    formatter={(value: any) => [formatVnd(Number(value ?? 0)), 'Số tiền']}
                                    contentStyle={{ fontSize: '12px', borderRadius: '8px' }}
                                />
                                <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-3 pt-3 border-top d-flex align-items-center text-muted small">
                    <FontAwesomeIcon icon={faShieldHalved} className="me-2 flex-shrink-0" style={{ fontSize: '16px' }} />
                    <span style={{ fontSize: '0.8rem' }}>
                        Sàn tự động giải ngân vào Ví Người Bán sau khi khách xác nhận đã nhận hàng
                    </span>
                </div>
            </div>
        </div>
    );
};