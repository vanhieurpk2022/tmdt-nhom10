import type { IconProp } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router";

interface UserMenuItemProps {
    icon: IconProp;
    content: string;
    badge?: string;
    active?: boolean;
    danger?: boolean;
    to: string;
    action?: () => void;
}

export default function UserMenuItem({ icon, content, badge, danger = false, to, action }: UserMenuItemProps) {
    const navigate = useNavigate();

    const handleClick = () => {
        if (action) {
            action();
        } else if (to && to !== "#") {
            navigate(to);
        }
    };

    return (
        <li>
            <button type="button" onClick={handleClick} className={`btn user-menu-item ${danger ? "text-danger" : ""}`}>
                <span className="user-menu-icon" aria-hidden="true">
                    <FontAwesomeIcon icon={icon} />
                </span>
                <span className="flex-grow-1">{content}</span>
                {badge && <span className="badge rounded-pill bg-warning-subtle text-warning-emphasis">{badge}</span>}
            </button>
        </li>
    );
}

