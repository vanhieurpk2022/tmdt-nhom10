import { PieChart, Cell, Pie, ResponsiveContainer, Tooltip } from "recharts";

interface DonutProps {
    data: { name: string; value: number; color: string }[];
    centerLabel?: string;
    centerValue?: string;
}
export function DonutChart({ data, centerLabel, centerValue }: DonutProps) {
    const hasData = data && data.length > 0 && data.some((d) => d.value > 0.001);
    const chartData = hasData ? data : [{ name: "Chưa có phát sinh", value: 1, color: "#e2e8f0" }];

    return (
        <div className="position-relative" style={{ width: 180, height: 180 }}>
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={chartData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={58}
                        outerRadius={84}
                        paddingAngle={hasData ? 2 : 0}
                        stroke="none"
                    >
                        {chartData.map((item, index) => (
                            <Cell key={`${item.name}-${index}`} fill={item.color} />
                        ))}
                    </Pie>
                    {hasData && <Tooltip />}
                </PieChart>
            </ResponsiveContainer>

            {centerValue && (
                <div className="position-absolute top-50 start-50 translate-middle text-center pe-none">
                    <div className="fw-bold fs-5">{centerValue}</div>
                    {centerLabel && <div className="small text-secondary">{centerLabel}</div>}
                </div>
            )}
        </div>
    );
}
