import type { ReactNode } from "react";

interface CheckoutSectionTitleProps {
    index: number;
    title: string;
    action?: ReactNode;
}

export default function CheckoutSectionTitle({ index, title, action }: CheckoutSectionTitleProps) {
    return (
        <div className="checkout-section-title d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-2">
                <span className="d-inline-flex align-items-center justify-content-center">{index}</span>
                <h2>{title}</h2>
            </div>
            {action}
        </div>
    );
}
