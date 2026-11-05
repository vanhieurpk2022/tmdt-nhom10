import { useEffect, useLayoutEffect, useState } from "react";
import { Link, useLocation, useParams, useSearchParams } from "react-router";
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
import OrderActions from "../components/order-success/OrderActions";
import OrderRefunds from "../components/order-success/OrderRefunds";
import { ROUTES } from "../routes/routes";

interface OrderSuccessLocationState {
    order?: OrderResponse;
}

export default function OrderSuccessPage({ detail = false }: { detail?: boolean }) {
    const location = useLocation();
    const state = location.state as OrderSuccessLocationState | null;
    const [params] = useSearchParams();
    const routeParams = useParams();
    const id = Number(detail ? routeParams.id : params.get("orderId") ?? state?.order?.id ?? getLastOrder()?.id);
    const validId = Number.isSafeInteger(id) && id > 0;
    return <OrderDetails key={`${detail}-${id}`} id={id} validId={validId} detail={detail} />;
}

function OrderDetails({ id, validId, detail }: { id: number; validId: boolean; detail: boolean }) {
    const location = useLocation();
    const [version, setVersion] = useState(0);
    const [result, setResult] = useState<{ id: number; order: OrderResponse | null; error: string } | null>(null);
    const order = result?.id === id ? result.order : null;
    const error = result?.id === id ? result.error : "";
    const orderedItems = order ? toCartItemsFromOrder(order) : [];

    useEffect(() => {
        let active = true;
        if (!validId) return;
        orderService.getOrder(id).then(response => {
            if (!active) return;
            setResult({ id, order: response, error: "" });
        }).catch(() => { if (active) setResult({ id, order: null, error: "Không tìm thấy đơn hàng thuộc tài khoản của bạn." }); });
        return () => { active = false; };
    }, [id, validId, version]);

    useLayoutEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }, [location.key]);

    function refresh() {
        setResult(null);
        setVersion(current => current + 1);
    }

    if (!order || error) return <main className="container py-5">
        <p role={error ? "alert" : "status"}>{error || (validId ? "Đang tải đơn hàng…" : "Mã đơn hàng không hợp lệ hoặc chưa có đơn hàng để hiển thị.")}</p>
        {error && <button type="button" className="btn btn-outline-secondary me-3" onClick={refresh}>Thử lại</button>}
        <Link to={ROUTES.ORDERS}>Về đơn hàng của tôi</Link>
    </main>;

    return (
        <main className="order-success-page">
            <div className="container-fluid px-4 px-lg-5">
                <div className="order-success-content">
                    <OrderSuccessBreadcrumb />
                    <OrderSuccessHero order={order} detail={detail} />
                    <OrderActions key={order.id} order={order} onOrderChange={updated => setResult({ id, order: updated, error: "" })} onRefresh={refresh} />
                    <OrderSuccessSummary order={order} />
                    <OrderRefunds order={order} />
                    <OrderStatusTimeline status={order.status} />
                    <OrderShippingInfo order={order} />
                    <OrderProductList items={orderedItems} />
                </div>
            </div>
        </main>
    );
}
