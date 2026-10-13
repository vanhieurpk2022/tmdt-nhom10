import type { IconProp } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router";

interface SideBarItemProps {
    place: IconProp;
    content: string;
    isActive: boolean;
    to: string;
}

function SideBarItem({ place, content, isActive, to }: SideBarItemProps) {
    return (
        <>
            <Link to={to} className={`btn SideBar-buttonItems w-100 d-flex align-items-center gap-2 p-2 px-4 fw-semibold text-start ${isActive ? `active` : ""}`}>
                <FontAwesomeIcon icon={place} />
                <span>{content}</span>
            </Link >
        </>
    );
}

export default SideBarItem;