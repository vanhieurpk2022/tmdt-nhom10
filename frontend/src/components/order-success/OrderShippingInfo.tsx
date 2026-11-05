import { faFileLines, faLocationDot, faPhone, faTruckFast, faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { OrderResponse } from "../../api/OrderService";

interface OrderShippingInfoProps {
    order: OrderResponse;
}

export default function OrderShippingInfo({ order }: OrderShippingInfoProps) {
    return (
        <section className="bg-white rounded-4 border shadow-sm p-4 mb-4" aria-labelledby="order-shipping-title">
            <div className="d-flex align-items-center gap-3 pb-3 mb-4 border-bottom">
                <div className="rounded-circle d-flex align-items-center justify-content-center bg-primary bg-opacity-10 text-primary" style={{ width: "38px", height: "38px" }}>
                    <FontAwesomeIcon icon={faTruckFast} className="fs-7" />
                </div>
                <div>
                    <h2 id="order-shipping-title" className="h6 fw-bold text-dark mb-1">
                        Thông tin giao nhận
                    </h2>
                    <span className="text-muted" style={{ fontSize: "13px" }}>Địa chỉ nhận hàng và hướng dẫn giao hàng</span>
                </div>
            </div>

            <div className="row g-3 g-md-4">
                {/* Thông tin người nhận */}
                <div className="col-12 col-md-7">
                    <div className="p-3.5 p-md-4 rounded-3 bg-light bg-opacity-60 border h-100">
                        <div className="d-flex align-items-center gap-2 mb-3 text-primary fw-bold text-uppercase" style={{ fontSize: "11.5px", letterSpacing: "0.5px" }}>
                            <FontAwesomeIcon icon={faUser} />
                            <span>Người nhận hàng</span>
                        </div>

                        <div className="mb-3">
                            <span className="fw-bold text-dark d-block mb-1" style={{ fontSize: "15px" }}>{order.recipientName}</span>
                            <span className="d-inline-flex align-items-center gap-1.5 text-muted" style={{ fontSize: "13.5px" }}>
                                <FontAwesomeIcon icon={faPhone} className="fs-8 text-secondary me-1" />
                                <strong className="text-dark fw-semibold">{order.phoneNumber}</strong>
                            </span>
                        </div>

                        <div className="d-flex align-items-start gap-2 pt-3 border-top">
                            <FontAwesomeIcon icon={faLocationDot} className="text-danger mt-1 fs-7 flex-shrink-0 me-1" />
                            <p className="text-secondary mb-0" style={{ fontSize: "13.5px", lineHeight: "1.5" }}>
                                {order.shippingAddress}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Ghi chú giao hàng & đơn vị vận chuyển */}
                <div className="col-12 col-md-5">
                    <div className="p-3.5 p-md-4 rounded-3 bg-light bg-opacity-60 border h-100 d-flex flex-column justify-content-between">
                        <div>
                            <div className="d-flex align-items-center gap-2 mb-3 text-primary fw-bold text-uppercase" style={{ fontSize: "11.5px", letterSpacing: "0.5px" }}>
                                <FontAwesomeIcon icon={faFileLines} />
                                <span>Ghi chú đơn hàng</span>
                            </div>

                            <p className="text-dark fst-italic mb-3" style={{ fontSize: "13.5px", lineHeight: "1.5" }}>
                                {order.note?.trim() ? `"${order.note.trim()}"` : "Không có ghi chú thêm từ khách hàng."}
                            </p>
                        </div>

                        <div className="pt-3 border-top d-flex align-items-center justify-content-between">
                            <span className="text-muted" style={{ fontSize: "12.5px" }}>Đơn vị vận chuyển:</span>
                            <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 rounded-pill px-2.5 py-1 fw-semibold" style={{ fontSize: "12px" }}>
                                GHN Express
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
