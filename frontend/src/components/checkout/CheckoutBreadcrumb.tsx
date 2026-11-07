import { Link } from "react-router";

export default function CheckoutBreadcrumb() {
    return (
        <nav className="checkout-breadcrumb d-flex flex-wrap align-items-center gap-2 mb-4" aria-label="breadcrumb">
            <Link to="/">Trang chủ</Link>
            <span>/</span>
            <Link to="/cart">Giỏ hàng</Link>
            <span>/</span>
            <strong>Thanh toán</strong>
        </nav>
    );
}
