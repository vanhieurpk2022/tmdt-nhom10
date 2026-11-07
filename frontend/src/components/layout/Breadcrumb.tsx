import { Link } from "react-router";

interface BreadcrumbItem {
    label: string;
    to?: string;
    onClick?: () => void;
}

interface BreadcrumbProps {
    items: BreadcrumbItem[];
    className?: string;
}

export default function Breadcrumb({ items, className = "mb-4" }: BreadcrumbProps) {
    return (
        <nav className={`site-breadcrumb ${className}`} aria-label="Đường dẫn trang">
            <ol className="breadcrumb mb-0">
                {items.map((item, index) => {
                    const current = index === items.length - 1;
                    return (
                        <li key={index} className={`breadcrumb-item${current ? " active" : ""}`} aria-current={current ? "page" : undefined}>
                            {!current && item.to ? <Link to={item.to}>{item.label}</Link>
                                : !current && item.onClick ? <button type="button" onClick={item.onClick}>{item.label}</button>
                                    : item.label}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}
