import { useLayoutEffect } from "react";
import { useLocation } from "react-router";
import {
    getLastOrder,
    toCartItemsFromOrder,
    type OrderResponse,
} from "../api/OrderService";
import OrderProductList from "../components/order-success/OrderProductList";
import OrderShippingInfo from "../components/order-success/OrderShippingInfo";
import OrderStatusTimeline from "../components/order-success/OrderStatusTimeline";
import OrderSuccessBreadcrumb from "../components/order-success/OrderSuccessBreadcrumb";
import OrderSuccessHero from "../components/order-success/OrderSuccessHero";
import OrderSuccessSummary from "../components/order-success/OrderSuccessSummary";
import { cartItems } from "../data/cartData";

interface OrderSuccessLocationState {
    order?: OrderResponse;
}

export default function OrderSuccessPage() {
    const location = useLocation();
    const state = location.state as OrderSuccessLocationState | null;
    const order = state?.order ?? getLastOrder();
    const orderedItems = order ? toCartItemsFromOrder(order) : cartItems.filter((item) => item.selected);

    useLayoutEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }, [location.key]);

    return (
        <main className="order-success-page">
            <div className="container-fluid px-4 px-lg-5">
                <div className="order-success-content">
                    <OrderSuccessBreadcrumb />
                    <OrderSuccessHero order={order ?? undefined} />
                    <OrderSuccessSummary items={orderedItems} order={order ?? undefined} />
                    <OrderStatusTimeline />
                    <OrderShippingInfo order={order ?? undefined} />
                    <OrderProductList items={orderedItems} />
                </div>
            </div>
        </main>
    );
}
