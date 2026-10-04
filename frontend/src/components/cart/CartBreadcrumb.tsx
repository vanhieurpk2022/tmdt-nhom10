import { Link } from "react-router";

export default function CartBreadcrumb() {
    return (
        <nav className="cart-breadcrumb" aria-label="breadcrumb">
            <Link to="/">Tài khoản</Link>
            <span>/</span>
            <Link to="/products">Sản phẩm</Link>
            <span>/</span>
            <strong>Giỏ hàng</strong>
        </nav>
    );
}
