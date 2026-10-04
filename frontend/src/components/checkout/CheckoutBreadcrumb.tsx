import { Link } from "react-router";

export default function CheckoutBreadcrumb() {
    return (
        <nav className="checkout-breadcrumb" aria-label="breadcrumb">
            <Link to="/">Tài khoản</Link>
            <span>/</span>
            <Link to="/products">Sản phẩm</Link>
            <span>/</span>
            <Link to="/cart">Đặt hàng</Link>
            <span>/</span>
            <strong>Chọn phương thức thanh toán</strong>
        </nav>
    );
}
