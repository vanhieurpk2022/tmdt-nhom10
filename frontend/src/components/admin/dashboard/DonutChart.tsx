export interface DonutSegment {
    label: string;
    percent: number;
    color: string;
}

interface DonutChartProps {
    segments: DonutSegment[];
    centerLabel: string;
    centerValue: string;
    size?: number;
}

// Dùng pathLength=100 nên strokeDasharray tính trực tiếp theo %
function DonutChart({ segments, centerLabel, centerValue, size = 160 }: DonutChartProps) {
    let offset = 0;

    return (
        <div className="position-relative" style={{ width: size, height: size }}>
            <svg viewBox="0 0 100 100" width={size} height={size} role="img" aria-label="Cơ cấu doanh thu">
                <g transform="rotate(-90 50 50)">
                    {segments.map((s) => {
                        const circle = (
                            <circle
                                key={s.label}
                                cx="50" cy="50" r="38"
                                fill="none"
                                stroke={s.color}
                                strokeWidth="12"
                                pathLength={100}
                                strokeDasharray={`${s.percent} ${100 - s.percent}`}
                                strokeDashoffset={-offset}
                            />
                        );
                        offset += s.percent;
                        return circle;
                    })}
                </g>
            </svg>

            <div className="position-absolute top-50 start-50 translate-middle text-center">
                <div className="dash-label" style={{ fontSize: "0.6rem" }}>{centerLabel}</div>
                <div className="fw-bold fs-5">{centerValue}</div>
            </div>
        </div>
    );
}

export default DonutChart;