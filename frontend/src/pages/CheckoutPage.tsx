import CheckoutBreadcrumb from "../components/checkout/CheckoutBreadcrumb";
import CheckoutProductList from "../components/checkout/CheckoutProductList";
import CheckoutSummary from "../components/checkout/CheckoutSummary";
import PaymentMethodList from "../components/checkout/PaymentMethodList";
import ShippingInfo from "../components/checkout/ShippingInfo";
import { cartItems } from "../data/cartData";
import { paymentMethods } from "../data/checkoutData";

export default function CheckoutPage() {
    const checkoutItems = cartItems.filter((item) => item.selected);

    return (
        <main className="checkout-page">
            <div className="container-fluid px-4 px-lg-5">
                <CheckoutBreadcrumb />

                <div className="row g-4 align-items-start">
                    <div className="col-12 col-xl-8">
                        <section className="checkout-panel">
                            <div className="checkout-heading">
                                <h1>Thông tin thanh toán & Giao hàng</h1>
                                <p>Vui lòng kiểm tra kỹ danh sách sản phẩm, địa chỉ nhận hàng và phương thức thanh toán.</p>
                            </div>

                            <CheckoutProductList items={checkoutItems} />
                            <ShippingInfo />
                            <PaymentMethodList methods={paymentMethods} />
                        </section>
                    </div>

                    <div className="col-12 col-xl-4">
                        <CheckoutSummary items={checkoutItems} />
                    </div>
                </div>
            </div>
        </main>
    );
}
