import { useLocation } from "react-router";
import {
    getLastOrder,
    toCartItemsFromOrder,
    type OrderResponse,
} from "../api/OrderService";
import OnlinePaymentBreadcrumb from "../components/online-payment/OnlinePaymentBreadcrumb";
import OnlinePaymentSummary from "../components/online-payment/OnlinePaymentSummary";
import PaymentDetails from "../components/online-payment/PaymentDetails";
import PaymentQrPanel from "../components/online-payment/PaymentQrPanel";
import { cartItems } from "../data/cartData";
import { checkoutTotals } from "../data/checkoutData";

interface OnlinePaymentLocationState {
    order?: OrderResponse;
}

export default function OnlinePaymentPage() {
    const location = useLocation();
    const state = location.state as OnlinePaymentLocationState | null;
    const order = state?.order ?? getLastOrder();
    const paymentItems = order ? toCartItemsFromOrder(order) : cartItems.filter((item) => item.selected);
    const subtotal = paymentItems.reduce((total, item) => total + item.price * item.quantity, 0);
    const total = order?.totalPrice ?? subtotal - checkoutTotals.discount + checkoutTotals.shippingFee;

    return (
        <main className="online-payment-page">
            <div className="container-fluid px-4 px-lg-5">
                <OnlinePaymentBreadcrumb />

                <div className="online-payment-heading">
                    <span>Thanh toán trực tuyến</span>
                    <h1>Hoàn tất thanh toán cho đơn hàng của bạn</h1>
                    <p>
                        Quét mã QR hoặc kiểm tra thông tin thanh toán bên dưới. Sau khi giao dịch thành công,
                        đơn hàng sẽ được xác nhận tự động.
                    </p>
                </div>

                <div className="row g-4 align-items-start">
                    <div className="col-12 col-xl-8">
                        <section className="online-payment-panel">
                            <PaymentQrPanel />
                            <PaymentDetails amount={total} order={order ?? undefined} />
                        </section>
                    </div>

                    <div className="col-12 col-xl-4">
                        <OnlinePaymentSummary items={paymentItems} order={order ?? undefined} />
                    </div>
                </div>
            </div>
        </main>
    );
}
