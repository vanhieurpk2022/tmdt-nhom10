import { Link } from "react-router";

export default function CheckoutBreadcrumb() {
    return (
        <nav className="checkout-breadcrumb d-flex flex-wrap align-items-center gap-2 mb-4" aria-label="breadcrumb">
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
