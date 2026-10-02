import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconProp } from "@fortawesome/fontawesome-svg-core";

export type Tone = "danger" | "success" | "info" | "warning";

interface StatCardProps {
    label: string;
    value: string;
    icon: IconProp;
    tone: Tone;
    note?: string;       // dòng chú thích xám
    actionText?: string; // dòng hành động màu primary
    onAction?: () => void;
}

function StatCard({ label, value, icon, tone, note, actionText, onAction }: StatCardProps) {
    return (
        <div className="dash-card d-flex flex-column">
            <div className="d-flex justify-content-between align-items-start gap-2">
                <span className="dash-label">{label}</span>
                <span className={`stat-icon tone-${tone}`}>
                    <FontAwesomeIcon icon={icon} />
                </span>
            </div>

            <div className="fs-3 fw-bold mt-2">{value}</div>

            <hr className="my-2" style={{ borderColor: "var(--color-border)" }} />

            {note && <span className="dash-muted">{note}</span>}
            {actionText && (
                <button className="btn btn-link dash-link p-0 text-start" onClick={onAction}>
                    {actionText}
                </button>
            )}
        </div>
    );
}

export default StatCard;