import { PieChart } from "react-bootstrap-icons";
import { Cell, Pie, ResponsiveContainer, Tooltip } from "recharts";

interface DonutProps {
    data: { name: string; value: number; color: string }[];
    centerLabel?: string;
    centerValue?: string;
}
export function DonutChart({ data, centerLabel, centerValue }: DonutProps) {
    return (
        <div className="position-relative" style={{ width: 180, height: 180 }}>
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={58}
                        outerRadius={84}
                        paddingAngle={2}
                        stroke="none"
                    >
                        {data.map((item) => (
                            <Cell key={item.name} fill={item.color} />
                        ))}
                    </Pie>
                    <Tooltip />
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