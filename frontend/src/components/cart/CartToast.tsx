import { CheckCircleFill, ExclamationTriangleFill, X } from "react-bootstrap-icons";
import { Link } from "react-router";
import { useCart } from "../../api/CartContext";

export default function CartToast() {
    const { notice, clearCartNotice } = useCart();

    if (!notice) return null;

    const Icon = notice.type === "success" ? CheckCircleFill : ExclamationTriangleFill;
    const title = notice.type === "success" ? "Đã thêm vào giỏ hàng" : "Chưa thêm được sản phẩm";

    return (
        <div className={`cart-toast cart-toast-${notice.type}`} role="status" aria-live="polite">
            <span className="cart-toast-icon d-inline-flex align-items-center justify-content-center">
                <Icon />
            </span>

            <div className="cart-toast-content">
                <strong>{title}</strong>
                <span>{notice.message}</span>
                {notice.type === "success" ? (
                    <Link className="cart-toast-action" to="/cart" onClick={clearCartNotice}>
                        Xem giỏ hàng
                    </Link>
                ) : (
                    <button className="btn cart-toast-action cart-toast-action-button" type="button" onClick={clearCartNotice}>
                        Thử lại
                    </button>
                )}
            </div>

            <button
                className="btn cart-toast-close d-inline-flex align-items-center justify-content-center"
                type="button"
                aria-label="Đóng thông báo"
                onClick={clearCartNotice}
            >
                <X />
            </button>

            <span className="cart-toast-progress" key={notice.id} />
        </div>
    );
}
