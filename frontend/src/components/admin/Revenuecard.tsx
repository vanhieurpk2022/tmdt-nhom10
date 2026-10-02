import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload } from "@fortawesome/free-solid-svg-icons";
import DonutChart from "./Donutchart";

export interface RevenueItem {
    label: string;
    amount: number;
    percent: number;
    color: string;
    highlight?: boolean; // hiển thị số tiền màu primary (vd: Tạm giữ Escrow)
}

const formatVND = (n: number) => `${n.toLocaleString("vi-VN")}₫`;

interface RevenueCardProps {
    total: number;
    items: RevenueItem[];
    centerLabel: string;
    centerValue: string;
    source: string;
    onDownload?: () => void;
}

function RevenueCard({ total, items, centerLabel, centerValue, source, onDownload }: RevenueCardProps) {
    return (
        <div className="dash-card d-flex flex-column">
            <div className="d-flex justify-content-between align-items-start">
                <div className="d-flex align-items-center gap-2">
                    <span className="dash-label">Cơ cấu doanh thu & quỹ dòng tiền</span>
                    <span className="escrow-badge">ESCROW VAULT</span>
                </div>
                <button className="btn btn-outline-soft btn-sm" onClick={onDownload} aria-label="Tải xuống">
                    <FontAwesomeIcon icon={faDownload} />
                </button>
            </div>

            <div className="mt-2">
                <span className="fs-3 fw-bold" style={{ color: "var(--color-bg-dark)" }}>
                    {formatVND(total)}
                </span>
                <span className="dash-muted ms-2">(Tổng giá trị ký quỹ & GMV)</span>
            </div>

            <div className="d-flex flex-wrap align-items-center justify-content-around gap-4 mt-4 flex-grow-1">
                <DonutChart segments={items} centerLabel={centerLabel} centerValue={centerValue} />

                <ul className="list-unstyled m-0 d-flex flex-column gap-3" style={{ minWidth: 260 }}>
                    {items.map((item) => (
                        <li key={item.label} className="d-flex justify-content-between align-items-center gap-4">
                            <span className="d-flex align-items-center gap-2 small">
                                <span className="dot" style={{ backgroundColor: item.color }} />
                                {item.label}
                            </span>
                            <span className="text-end">
                                <div
                                    className="fw-bold small"
                                    style={item.highlight ? { color: "var(--color-primary)" } : undefined}
                                >
                                    {formatVND(item.amount)}
                                </div>
                                <div className="dash-muted" style={{ fontSize: "0.65rem" }}>{item.percent}%</div>
                            </span>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="d-flex justify-content-between align-items-center mt-4 pt-3" style={{ borderTop: "1px solid var(--color-border)" }}>
                <span className="dash-muted">{source}</span>
                <a href="#" className="dash-link">Quản lý giải ngân hàng loạt →</a>
            </div>
        </div>
    );
}

export default RevenueCard;