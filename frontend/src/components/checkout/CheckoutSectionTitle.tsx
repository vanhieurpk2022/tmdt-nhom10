import type { ReactNode } from "react";

interface CheckoutSectionTitleProps {
    index: number;
    title: string;
    action?: ReactNode;
}

export default function CheckoutSectionTitle({ index, title, action }: CheckoutSectionTitleProps) {
    return (
        <div className="checkout-section-title">
            <div className="d-flex align-items-center gap-2">
                <span>{index}</span>
                <h2>{title}</h2>
            </div>
            {action}
        </div>
    );
}
