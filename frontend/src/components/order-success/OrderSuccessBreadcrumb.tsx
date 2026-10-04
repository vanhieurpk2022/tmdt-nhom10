import { Link } from "react-router";

export default function OrderSuccessBreadcrumb() {
    return (
        <nav className="order-success-breadcrumb" aria-label="breadcrumb">
            <Link to="/">Tài khoản</Link>
            <span>/</span>
            <Link to="/checkout">Thanh toán</Link>
            <span>/</span>
            <strong>Đặt hàng thành công</strong>
        </nav>
    );
}
