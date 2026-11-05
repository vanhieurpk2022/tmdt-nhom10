import { faFileLines, faLocationDot, faPhone, faTruckFast, faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { OrderResponse } from "../../api/OrderService";

interface OrderShippingInfoProps {
    order: OrderResponse;
}

export default function OrderShippingInfo({ order }: OrderShippingInfoProps) {
    return (
        <section className="bg-white rounded-4 border shadow-sm p-3 p-md-4 mb-3" aria-labelledby="order-shipping-title">
            <div className="d-flex align-items-center gap-2 pb-3 mb-3 border-bottom">
                <div className="rounded-circle d-flex align-items-center justify-content-center bg-primary bg-opacity-10 text-primary" style={{ width: "36px", height: "36px" }}>
                    <FontAwesomeIcon icon={faTruckFast} className="fs-7" />
                </div>
                <div>
                    <h2 id="order-shipping-title" className="fs-6 fw-bold text-dark mb-0">
                        Thông tin giao nhận
                    </h2>
                    <span className="text-muted fs-8">Địa chỉ nhận hàng và hướng dẫn giao nhận</span>
                </div>
            </div>

            <div className="row g-3">
                {/* Thông tin người nhận */}
                <div className="col-12 col-md-7">
                    <div className="p-3 rounded-3 bg-light bg-opacity-50 border h-100">
                        <div className="d-flex align-items-center gap-2 mb-2 text-primary fw-bold fs-8 text-uppercase">
                            <FontAwesomeIcon icon={faUser} />
                            <span>Người nhận hàng</span>
                        </div>

                        <div className="mb-2">
                            <span className="fs-6 fw-bold text-dark d-block mb-1">{order.recipientName}</span>
                            <span className="d-inline-flex align-items-center gap-1 fs-7 text-muted">
                                <FontAwesomeIcon icon={faPhone} className="fs-8 text-secondary" />
                                <strong className="text-dark">{order.phoneNumber}</strong>
                            </span>
                        </div>

                        <div className="d-flex align-items-start gap-2 pt-2 border-top">
                            <FontAwesomeIcon icon={faLocationDot} className="text-danger mt-1 fs-7 flex-shrink-0" />
                            <p className="fs-7 text-secondary mb-0 lh-sm">
                                {order.shippingAddress}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Ghi chú giao hàng & đơn vị vận chuyển */}
                <div className="col-12 col-md-5">
                    <div className="p-3 rounded-3 bg-light bg-opacity-50 border h-100 d-flex flex-column justify-content-between">
                        <div>
                            <div className="d-flex align-items-center gap-2 mb-2 text-primary fw-bold fs-8 text-uppercase">
                                <FontAwesomeIcon icon={faFileLines} />
                                <span>Ghi chú đơn hàng</span>
                            </div>

                            <p className="fs-7 text-dark fst-italic mb-3">
                                {order.note?.trim() ? `"${order.note.trim()}"` : "Không có ghi chú thêm."}
                            </p>
                        </div>

                        <div className="pt-2 border-top d-flex align-items-center justify-content-between">
                            <span className="fs-8 text-muted">Đơn vị vận chuyển:</span>
                            <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 rounded-pill px-2 py-1 fs-8 fw-bold">
                                GHN Express
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
