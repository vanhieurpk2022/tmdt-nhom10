import { faHouse } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router";
import { ROUTES } from "../../routes/routes";

interface OrderSuccessBreadcrumbProps {
    orderCode?: string;
}

export default function OrderSuccessBreadcrumb({ orderCode }: OrderSuccessBreadcrumbProps) {
    return (
        <nav aria-label="breadcrumb" className="mb-4">
            <ol className="breadcrumb mb-0 fs-7">
                <li className="breadcrumb-item">
                    <Link to={ROUTES.HOME} className="text-muted text-decoration-none d-inline-flex align-items-center gap-1">
                        <FontAwesomeIcon icon={faHouse} className="fs-8" />
                        <span>Trang chủ</span>
                    </Link>
                </li>
                <li className="breadcrumb-item">
                    <Link to={ROUTES.ORDERS} className="text-muted text-decoration-none">
                        Đơn hàng của tôi
                    </Link>
                </li>
                <li className="breadcrumb-item active fw-bold text-dark text-truncate" aria-current="page" style={{ maxWidth: "260px" }}>
                    {orderCode ? `Chi tiết đơn #${orderCode}` : "Chi tiết đơn hàng"}
                </li>
            </ol>
        </nav>
    );
}
