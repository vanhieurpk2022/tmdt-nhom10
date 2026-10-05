import type { IconProp } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface UserMenuItemProps {
    icon: IconProp;
    content: string;
    badge?: string;
    active?: boolean;
    danger?: boolean;
}

export default function UserMenuItem({
    icon,
    content,
    badge,
    danger = false,
}: UserMenuItemProps) {
    return (
        <button className={`btn w-100 border-0 d-flex align-items-center gap-3 text-start rounded-4 p-3
                ${danger ? "text-danger" : "text-dark"} text-start`}>
            {/* Icon */}
            <div className={`flex-shrink-0 rounded-3 d-flex align-items-center justify-content-center `} style={{ width: "40px", height: "40px" }}>
                <FontAwesomeIcon icon={icon} />
            </div>

            {/* Content */}
            <span className="flex-grow-1 fs-5 fw-normal"> {content} </span>

            {/* Badge */}
            {badge && (<span className="badge rounded-pill bg-warning-subtle text-warning-emphasis">  {badge}</span>)}
        </button>
    );
}
