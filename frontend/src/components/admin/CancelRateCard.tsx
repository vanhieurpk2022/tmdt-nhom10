import { useState } from "react";

export interface CancelReason {
    label: string;
    percent: number;
    count: number;
    color: string;
}

type Range = "7d" | "30d" | "quarter";

const RANGES: { key: Range; label: string }[] = [
    { key: "7d", label: "7 ngày" },
    { key: "30d", label: "30 ngày" },
    { key: "quarter", label: "Quý này" },
];

interface CancelRateCardProps {
    rate: string;
    reasons: CancelReason[];
    slaTarget: string;
    onRangeChange?: (range: Range) => void;
}

function CancelRateCard({ rate, reasons, slaTarget, onRangeChange }: CancelRateCardProps) {
    const [range, setRange] = useState<Range>("30d");

    const handleRange = (r: Range) => {
        setRange(r);
        onRangeChange?.(r);
    };

    return (
        <div className="dash-card d-flex flex-column">
            <div className="d-flex justify-content-between align-items-start gap-2">
                <span className="dash-label">Tỉ lệ & xu hướng hủy đơn hàng</span>
                <div className="range-tabs">
                    {RANGES.map((r) => (
                        <button key={r.key} className={range === r.key ? "active" : ""} onClick={() => handleRange(r.key)}>
                            {r.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="fs-3 fw-bold mt-2">{rate}</div>

            <div className="mt-3 flex-grow-1">
                <div className="fw-semibold small mb-3">Phân loại lý do hủy đơn chính</div>
                <div className="d-flex flex-column gap-3">
                    {reasons.map((r) => (
                        <div key={r.label}>
                            <div className="d-flex justify-content-between align-items-center small mb-1">
                                <span className="d-flex align-items-center gap-2">
                                    <span className="dot" style={{ backgroundColor: r.color }} />
                                    {r.label}
                                </span>
                                <span>
                                    <strong>{r.percent}%</strong> <span className="dash-muted">({r.count} đơn)</span>
                                </span>
                            </div>
                            <div className="reason-bar">
                                <span style={{ width: `${r.percent}%`, backgroundColor: r.color }} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="d-flex justify-content-between align-items-center mt-4 pt-3" style={{ borderTop: "1px solid var(--color-border)" }}>
                <span className="dash-muted">Mục tiêu SLA sàn: {slaTarget}</span>
                <a href="#" className="dash-link">Báo cáo chi tiết nốt hương hủy →</a>
            </div>
        </div>
    );
}

export default CancelRateCard;