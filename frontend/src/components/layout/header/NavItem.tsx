interface NavItemProps {
    content: string;
    active?: boolean;
}

export default function NavItem({ content, active = false }: NavItemProps) {
    return (
        <button className={`nav-item-button border-0 bg-transparent fw-bold ${active ? "active" : ""}`} type="button">
            {content}
        </button>
    );
}
