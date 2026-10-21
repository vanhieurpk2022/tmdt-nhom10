import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";

interface VariantSummaryCardProps {
    title: string;
    value: string;
    icon: IconDefinition;
    iconClass?: string;
}

const VariantSummaryCard = ({
    title,
    value,
    icon,
    iconClass = "text-primary",
}: VariantSummaryCardProps) => {

    return (
        <div className="card border-0 shadow-sm rounded-4 h-100">

            <div className="card-body p-3 p-lg-4">

                <div className="small text-secondary mb-2">
                    {title}
                </div>

                <div className="d-flex align-items-center gap-2">

                    <FontAwesomeIcon
                        icon={icon}
                        className={`fs-4 ${iconClass}`}
                    />

                    <span className="fs-5 fw-bold">
                        {value}
                    </span>

                </div>

            </div>

        </div>
    );
};

export default VariantSummaryCard;