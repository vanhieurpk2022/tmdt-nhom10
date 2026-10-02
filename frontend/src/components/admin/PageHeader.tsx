import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileExport, faUserCheck, faChevronRight } from "@fortawesome/free-solid-svg-icons";

interface PageHeaderProps {
    title: string;
    pendingCount?: number;
    onExport?: () => void;
    onApprove?: () => void;
}

function PageHeader({ title, pendingCount = 0, onExport, onApprove }: PageHeaderProps) {
    return (
        <header className="d-flex flex-wrap justify-content-between align-items-end gap-3">
            <div>
                <h1 className="fs-4 fw-bold m-0">{title}</h1>
            </div>

            <div className="d-flex gap-2">
                <button className="btn btn-outline-soft d-flex align-items-center gap-2" onClick={onExport}>
                    <FontAwesomeIcon icon={faFileExport} />
                    Xuất báo cáo Sàn (Audit Log)
                </button>
                <button className="btn btn-approve d-flex align-items-center gap-2" onClick={onApprove}>
                    <FontAwesomeIcon icon={faUserCheck} />
                    Phê duyệt
                    {pendingCount > 0 && (
                        <span className="badge rounded-pill bg-white" style={{ color: "var(--color-primary)" }}>
                            {pendingCount}
                        </span>
                    )}
                </button>
            </div>
        </header>
    );
}

export default PageHeader;