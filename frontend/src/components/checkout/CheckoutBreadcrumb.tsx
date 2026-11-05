import { faHouse } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router";
import { ROUTES } from "../../routes/routes";

export default function CheckoutBreadcrumb() {
    return (
        <nav aria-label="breadcrumb" className="mb-4">
            <ol className="breadcrumb mb-0" style={{ fontSize: "13px" }}>
                <li className="breadcrumb-item">
                    <Link to={ROUTES.HOME} className="text-muted text-decoration-none d-inline-flex align-items-center">
                        <FontAwesomeIcon icon={faHouse} className="fs-8 me-1.5" />
                        <span>Trang chủ</span>
                    </Link>
                </li>
                <li className="breadcrumb-item">
                    <Link to={ROUTES.CART} className="text-muted text-decoration-none">
                        Giỏ hàng
                    </Link>
                </li>
                <li className="breadcrumb-item active text-dark fw-semibold" aria-current="page">
                    Thanh toán đơn hàng
                </li>
            </ol>
        </nav>
    );
}
