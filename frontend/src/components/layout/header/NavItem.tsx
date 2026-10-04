interface NavItemProps {
    content: string;
    active?: boolean;
}

export default function NavItem({ content, active = false }: NavItemProps) {
    return (
        <button className={`border-0 bg-transparent fw-bold ${active ? "text-danger" : "text-dark"}`}>
            {content}
        </button>
    );
}