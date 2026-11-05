import type { OrderResponse } from "../../api/OrderService";

interface OrderShippingInfoProps {
    order: OrderResponse;
}

export function OrderShippingInfo({ order }: OrderShippingInfoProps) {
    return (
        <section className="bg-white rounded-4 border shadow-sm p-4 mb-4" aria-labelledby="order-shipping-title">
            <div className="pb-3 mb-3 border-bottom">
                <h2 id="order-shipping-title" className="h6 fw-bold text-dark mb-0.5">
                    Thông tin giao nhận
                </h2>
                <span className="text-muted" style={{ fontSize: "12.5px" }}>Địa chỉ nhận hàng và hướng dẫn giao hàng</span>
            </div>

            <div className="row g-4">
                {/* Thông tin người nhận */}
                <div className="col-12 col-md-7">
                    <span className="d-block text-muted fw-semibold text-uppercase mb-2" style={{ fontSize: "11px", letterSpacing: "0.5px" }}>
                        Người nhận hàng
                    </span>
                    <div className="d-flex flex-wrap align-items-center gap-2 mb-1.5">
                        <strong className="text-dark fw-bold" style={{ fontSize: "14.5px" }}>
                            {order.recipientName}
                        </strong>
                        <span className="text-muted">•</span>
                        <span className="text-secondary fw-semibold" style={{ fontSize: "13.5px" }}>
                            {order.phoneNumber}
                        </span>
                    </div>
                    <p className="text-muted mb-0" style={{ fontSize: "13.5px", lineHeight: "1.5" }}>
                        {order.shippingAddress}
                    </p>
                </div>

                {/* Ghi chú giao hàng & đơn vị vận chuyển */}
                <div className="col-12 col-md-5">
                    <span className="d-block text-muted fw-semibold text-uppercase mb-2" style={{ fontSize: "11px", letterSpacing: "0.5px" }}>
                        Ghi chú đơn hàng
                    </span>
                    <p className="text-secondary fst-italic mb-3" style={{ fontSize: "13px", lineHeight: "1.5" }}>
                        {order.note?.trim() ? `"${order.note.trim()}"` : "Không có ghi chú thêm từ khách hàng."}
                    </p>

                    <div className="d-flex align-items-center gap-2">
                        <span className="text-muted" style={{ fontSize: "12.5px" }}>Vận chuyển:</span>
                        <span className="badge bg-light text-dark border rounded-pill px-2.5 py-1 fw-semibold" style={{ fontSize: "12px" }}>
                            GHN Express
                        </span>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default OrderShippingInfo;
