import { Link } from "react-router";

interface NavItemProps {
    content: string;
    active?: boolean;
    href: string;
}

export default function NavItem({ content, active = false, href }: NavItemProps) {
    return (
        <Link to={href} className={`nav-item-button border-0 bg-transparent fw-bold ${active ? "active" : ""} text-decoration-none`} type="button">
            {content}
        </Link>
    );
}
