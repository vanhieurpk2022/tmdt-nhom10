import { Link } from "react-router";

interface NavItemProps {
    content: string;
    active?: boolean;
    href: string;
    onClick?: () => void;
}

export default function NavItem({ content, active = false, href, onClick }: NavItemProps) {
    return (
        <Link to={href} onClick={onClick} className={`nav-item-button border-0 bg-transparent fw-bold ${active ? "active" : ""} text-decoration-none`} type="button">
            {content}
        </Link>
    );
}
