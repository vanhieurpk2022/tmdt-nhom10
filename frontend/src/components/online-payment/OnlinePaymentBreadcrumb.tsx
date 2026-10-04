import { Link } from "react-router";

export default function OnlinePaymentBreadcrumb() {
    return (
        <nav className="online-payment-breadcrumb" aria-label="breadcrumb">
            <Link to="/">Tài khoản</Link>
            <span>/</span>
            <Link to="/products">Sản phẩm</Link>
            <span>/</span>
            <Link to="/checkout">Thanh toán</Link>
            <span>/</span>
            <strong>Thanh toán trực tuyến</strong>
        </nav>
    );
}
