import { Link } from "react-router";

export default function CartBreadcrumb() {
    return (
        <nav className="cart-breadcrumb d-flex flex-wrap align-items-center gap-2 mb-4" aria-label="breadcrumb">
            <Link to="/">Tài khoản</Link>
            <span>/</span>
            <Link to="/products">Sản phẩm</Link>
            <span>/</span>
            <strong>Giỏ hàng</strong>
        </nav>
    );
}
