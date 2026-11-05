import {
    faChevronRight,
    faCircleCheck,
    faCircleXmark,
    faClock,
    faCreditCard,
    faLocationDot,
    faTruckFast,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import type { OrderHistoryItem, OrderStatus } from "../../data/orderHistoryData";
import { orderStatusLabels } from "../../data/orderHistoryData";
import { Link } from "react-router";
import { fallbackCartImage } from "../../data/cartData";

interface OrderHistoryCardProps {
    order: OrderHistoryItem;
}

const currencyFormatter = new Intl.NumberFormat("vi-VN");

const statusIcons: Record<OrderStatus, IconDefinition> = {
    processing: faClock,
    shipping: faTruckFast,
    completed: faCircleCheck,
    cancelled: faCircleXmark,
};

const statusStyles: Record<OrderStatus, { bg: string; text: string; border: string }> = {
    processing: { bg: "#fffbeb", text: "#b45309", border: "#fde68a" },
    shipping: { bg: "#eff6ff", text: "#1d4ed8", border: "#bfdbfe" },
    completed: { bg: "#f0fdf4", text: "#15803d", border: "#bbf7d0" },
    cancelled: { bg: "#fef2f2", text: "#b91c1c", border: "#fecaca" },
};

function formatPrice(price: number) {
    return `${currencyFormatter.format(price)}đ`;
}

export default function OrderHistoryCard({ order }: OrderHistoryCardProps) {
    const remainingProducts = Math.max(order.products.length - 2, 0);
    const style = statusStyles[order.status] || statusStyles.processing;

    return (
        <article className="bg-white rounded-4 border shadow-sm p-4 mb-3 transition-all hover-shadow-sm">
            {/* Header đơn hàng: Mã đơn, Thời gian đặt và Trạng thái */}
            <div className="d-flex flex-wrap align-items-center justify-content-between pb-3 border-bottom gap-2">
                <div className="d-flex flex-wrap align-items-center gap-3">
                    <span className="badge bg-dark bg-opacity-10 text-dark fw-bold rounded-pill px-3 py-1 fs-8">
                        #{order.code}
                    </span>
                    <span className="text-muted fs-8 d-inline-flex align-items-center gap-1">
                        <FontAwesomeIcon icon={faClock} className="opacity-75" />
                        {order.createdAt}
                    </span>
                </div>

                <div
                    className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill fw-bold fs-8 border"
                    style={{ backgroundColor: style.bg, color: style.text, borderColor: style.border }}
                >
                    <FontAwesomeIcon icon={statusIcons[order.status]} />
                    <span>{order.statusLabel ?? orderStatusLabels[order.status]}</span>
                </div>
            </div>

            {/* Danh sách sản phẩm trong đơn */}
            <div className="d-flex flex-column gap-2 py-3">
                {order.products.slice(0, 2).map((product) => (
                    <div
                        key={product.id}
                        className="d-flex align-items-center justify-content-between p-2 rounded-3 hover-bg-light transition-all"
                    >
                        <div className="d-flex align-items-center gap-3 min-w-0">
                            <img
                                src={product.image || fallbackCartImage}
                                alt={product.name}
                                className="rounded-3 border object-fit-cover flex-shrink-0"
                                style={{ width: "54px", height: "54px" }}
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = fallbackCartImage;
                                }}
                            />
                            <div className="min-w-0">
                                <h4 className="fs-6 fw-bold text-dark mb-1 text-truncate" title={product.name}>
                                    {product.name}
                                </h4>
                                <div className="d-flex align-items-center gap-2 fs-8 text-muted">
                                    <span className="badge bg-secondary bg-opacity-10 text-secondary rounded-pill px-2 py-0">
                                        {product.variant}
                                    </span>
                                    <span>Số lượng: <strong className="text-dark">x{product.quantity}</strong></span>
                                </div>
                            </div>
                        </div>

                        <strong className="fs-6 text-dark text-nowrap ms-3">
                            {formatPrice(product.price * product.quantity)}
                        </strong>
                    </div>
                ))}

                {remainingProducts > 0 && (
                    <div className="text-muted fs-8 ps-2 pt-1">
                        + {remainingProducts} sản phẩm khác trong đơn hàng
                    </div>
                )}
            </div>

            {/* Thông tin tóm lược: Thanh toán, Địa chỉ, Tổng tiền và Nút xem chi tiết */}
            <div className="rounded-3 bg-light bg-opacity-75 p-3 border">
                <div className="row g-3 align-items-center">
                    {/* Cột thông tin thanh toán */}
                    <div className="col-12 col-md-4">
                        <span className="d-block fs-8 text-muted fw-bold text-uppercase mb-1">
                            <FontAwesomeIcon icon={faCreditCard} className="me-1" /> Thanh toán
                        </span>
                        <strong className="d-block fs-7 text-dark text-truncate" title={order.paymentMethod}>
                            {order.paymentMethod}
                        </strong>
                        <small className="text-muted fs-8 d-block text-truncate" title={order.paymentStatus}>
                            {order.paymentStatus}
                        </small>
                    </div>

                    {/* Cột địa chỉ giao hàng */}
                    <div className="col-12 col-md-4">
                        <span className="d-block fs-8 text-muted fw-bold text-uppercase mb-1">
                            <FontAwesomeIcon icon={faLocationDot} className="me-1" /> Giao đến
                        </span>
                        <p className="fs-8 text-dark mb-0 text-truncate" title={order.deliveryAddress}>
                            {order.deliveryAddress}
                        </p>
                        <small className="text-muted fs-8 d-block">
                            {order.status === "completed" ? "Đơn hàng đã hoàn tất" : "Địa chỉ đã xác nhận"}
                        </small>
                    </div>

                    {/* Cột tổng tiền và nút thao tác */}
                    <div className="col-12 col-md-4 d-flex align-items-center justify-content-between justify-content-md-end gap-3 border-top border-md-top-0 pt-2 pt-md-0">
                        <div className="text-md-end">
                            <span className="d-block fs-8 text-muted fw-bold text-uppercase mb-0">Tổng tiền</span>
                            <span className="fs-5 fw-black text-danger lh-1">
                                {formatPrice(order.total)}
                            </span>
                        </div>

                        <Link
                            to={order.detailUrl || "/orders"}
                            className="btn btn-outline-dark btn-sm rounded-pill px-3 py-2 fw-bold d-inline-flex align-items-center gap-2 hover-shadow-sm flex-shrink-0"
                        >
                            <span>Xem chi tiết</span>
                            <FontAwesomeIcon icon={faChevronRight} className="fs-9" />
                        </Link>
                    </div>
                </div>
            </div>
        </article>
    );
}
