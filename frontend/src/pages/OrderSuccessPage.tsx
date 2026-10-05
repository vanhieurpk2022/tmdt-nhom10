import OrderProductList from "../components/order-success/OrderProductList";
import OrderShippingInfo from "../components/order-success/OrderShippingInfo";
import OrderStatusTimeline from "../components/order-success/OrderStatusTimeline";
import OrderSuccessBreadcrumb from "../components/order-success/OrderSuccessBreadcrumb";
import OrderSuccessHero from "../components/order-success/OrderSuccessHero";
import OrderSuccessSummary from "../components/order-success/OrderSuccessSummary";
import { cartItems } from "../data/cartData";

export default function OrderSuccessPage() {
    const orderedItems = cartItems.filter((item) => item.selected);

    return (
        <main className="order-success-page">
            <div className="container-fluid px-4 px-lg-5">
                <div className="order-success-content">
                    <OrderSuccessBreadcrumb />
                    <OrderSuccessHero />
                    <OrderSuccessSummary items={orderedItems} />
                    <OrderStatusTimeline />
                    <OrderShippingInfo />
                    <OrderProductList items={orderedItems} />
                </div>
            </div>
        </main>
    );
}
