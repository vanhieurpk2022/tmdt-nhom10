import type { IconProp } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router";

interface UserMenuItemProps {
    icon: IconProp;
    content: string;
    badge?: string;
    active?: boolean;
    danger?: boolean;
    to: string;
    action?: () => void;
}

export default function UserMenuItem({ icon, content, badge, danger = false, to, action, }: UserMenuItemProps) {
    return (
        <button className={`btn w-100 border-0 d-flex align-items-center gap-3 text-start rounded-4 p-3
                ${danger ? "text-danger" : "text-dark"} text-start`}>
            {/* Icon */}
            <div className={`flex-shrink-0 rounded-3 d-flex align-items-center justify-content-center `} style={{ width: "40px", height: "40px" }}>
                <FontAwesomeIcon icon={icon} />
            </div>

            {/* Content */}
            <Link to={to} onClick={action} className="flex-grow-1 fs-5 fw-normal text-decoration-none text-reset"> {content} </Link>

            {/* Badge */}
            {badge && (<span className="badge rounded-pill bg-warning-subtle text-warning-emphasis">  {badge}</span>)}
        </button>
    );
}
