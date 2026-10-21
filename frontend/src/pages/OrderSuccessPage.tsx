import { useEffect, useLayoutEffect, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router";
import {
    getLastOrder,
    orderService,
    toCartItemsFromOrder,
    type OrderResponse,
} from "../api/OrderService";
import OrderProductList from "../components/order-success/OrderProductList";
import OrderShippingInfo from "../components/order-success/OrderShippingInfo";
import OrderStatusTimeline from "../components/order-success/OrderStatusTimeline";
import OrderSuccessBreadcrumb from "../components/order-success/OrderSuccessBreadcrumb";
import OrderSuccessHero from "../components/order-success/OrderSuccessHero";
import OrderSuccessSummary from "../components/order-success/OrderSuccessSummary";
import { ROUTES } from "../routes/routes";

interface OrderSuccessLocationState {
    order?: OrderResponse;
}

export default function OrderSuccessPage() {
    const location = useLocation();
    const state = location.state as OrderSuccessLocationState | null;
    const [params] = useSearchParams();
    const id = Number(params.get("orderId") || state?.order?.id || getLastOrder()?.id);
    const [result, setResult] = useState<{ id: number; order: OrderResponse | null; error: string } | null>(null);
    const order = result?.id === id ? result.order : null;
    const error = result?.id === id ? result.error : "";
    const orderedItems = order ? toCartItemsFromOrder(order) : [];

    useEffect(() => {
        let active = true;
        if (!Number.isSafeInteger(id) || id <= 0) return;
        orderService.getOrder(id).then(response => {
            if (!active) return;
            if (response.paymentMethod === "VNPAY" && response.paymentStatus !== "PAID") {
                setResult({ id, order: null, error: "Đơn hàng chưa được xác nhận thanh toán. Vui lòng kiểm tra kết quả giao dịch VNPay." });
                return;
            }
            setResult({ id, order: response, error: "" });
        }).catch(() => { if (active) setResult({ id, order: null, error: "Không tìm thấy đơn hàng thuộc tài khoản của bạn." }); });
        return () => { active = false; };
    }, [id]);

    useLayoutEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }, [location.key]);

    if (!order || error) return <main className="container py-5"><p role="status">{error || (id > 0 ? "Đang tải đơn hàng…" : "Chưa có đơn hàng để hiển thị.")}</p><Link to={ROUTES.HOME}>Về trang chủ</Link></main>;

    return (
        <main className="order-success-page">
            <div className="container-fluid px-4 px-lg-5">
                <div className="order-success-content">
                    <OrderSuccessBreadcrumb />
                    <OrderSuccessHero order={order} />
                    <OrderSuccessSummary order={order} />
                    <OrderStatusTimeline status={order.status} />
                    <OrderShippingInfo order={order} />
                    <OrderProductList items={orderedItems} />
                </div>
            </div>
        </main>
    );
}
