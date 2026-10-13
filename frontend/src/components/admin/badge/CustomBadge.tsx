interface CustomBadgeProps {
    label: string;
    badge: string;
}

export default function CustomBadge({ label, badge, }: CustomBadgeProps) {
    return (
        <span
            className={`badge rounded-pill px-3 py-2 ${badge}`}>
            {label}
        </span>
    );
}
