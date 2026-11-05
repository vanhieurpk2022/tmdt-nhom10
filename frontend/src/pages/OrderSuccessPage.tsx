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

    if (!order || error) return (
        <main className="container py-5 text-center min-vh-50 d-flex flex-column align-items-center justify-content-center">
            <div className="bg-white rounded-4 border shadow-sm p-4 p-md-5 w-100" style={{ maxWidth: "480px" }}>
                <p className="fs-6 text-dark mb-4" role={error ? "alert" : "status"}>
                    {error || (validId ? "Đang tải thông tin đơn hàng…" : "Mã đơn hàng không hợp lệ hoặc chưa có đơn hàng để hiển thị.")}
                </p>
                <div className="d-flex justify-content-center gap-3">
                    {error && (
                        <button type="button" className="btn btn-outline-primary rounded-pill px-4 fw-bold fs-7" onClick={refresh}>
                            Thử lại
                        </button>
                    )}
                    <Link to={ROUTES.ORDERS} className="btn btn-dark rounded-pill px-4 fw-bold fs-7">
                        Về đơn hàng của tôi
                    </Link>
                </div>
            </div>
        </main>
    );

    return (
        <main className="order-success-page py-3 py-md-4" style={{ minHeight: "85vh", backgroundColor: "#f8fafc" }}>
            <div className="container-fluid px-3 px-md-4 px-xl-5" style={{ maxWidth: "1280px" }}>
                <OrderSuccessBreadcrumb />
                <OrderSuccessHero order={order} detail={detail} />

                {/* Bố cục 2 cột cân bằng: Cột trái (7 cột) & Cột phải (5 cột) */}
                <div className="row g-4 align-items-start">
                    {/* Cột trái: Sản phẩm đã đặt + Thông tin giao nhận + Hoàn tiền (nếu có) */}
                    <div className="col-12 col-lg-7">
                        <OrderProductList items={orderedItems} />
                        <OrderShippingInfo order={order} />
                        <OrderRefunds order={order} />
                    </div>

                    {/* Cột phải: Tiến trình xử lý đơn hàng + Tóm tắt thanh toán */}
                    <div className="col-12 col-lg-5 position-lg-sticky" style={{ top: "85px" }}>
                        <OrderStatusTimeline status={order.status} />
                        <OrderSuccessSummary
                            order={order}
                            detail={detail}
                            onOrderChange={updated => setResult({ id, order: updated, error: "" })}
                            onRefresh={refresh}
                        />
                    </div>
                </div>
            </div>
        </main>
    );
}
