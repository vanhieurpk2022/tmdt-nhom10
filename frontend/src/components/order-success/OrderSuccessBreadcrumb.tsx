import { Link } from "react-router";
import { ROUTES } from "../../routes/routes";

export default function OrderSuccessBreadcrumb() {
    return (
        <nav className="order-success-breadcrumb d-flex flex-wrap align-items-center gap-2 mb-4" aria-label="breadcrumb">
            <Link to={ROUTES.HOME}>Trang chủ</Link>
            <span>/</span>
            <Link to={ROUTES.ORDERS}>Đơn hàng của tôi</Link>
            <span>/</span>
            <strong>Chi tiết đơn hàng</strong>
        </nav>
    );
}
