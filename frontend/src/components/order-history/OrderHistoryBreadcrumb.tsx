import { Link } from "react-router";

export default function OrderHistoryBreadcrumb() {
    return (
        <nav className="order-history-breadcrumb" aria-label="breadcrumb">
            <Link to="/">Tài khoản</Link>
            <span>/</span>
            <strong>Lịch sử mua hàng</strong>
        </nav>
    );
}
