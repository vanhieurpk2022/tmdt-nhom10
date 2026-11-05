import {
    faChevronRight,
    faCircleCheck,
    faCircleXmark,
    faClock,
    faCreditCard,
    faLocationDot,
    faMoneyBillWave,
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
    cancelled: { bg: "#fef2f2", text: "#dc2626", border: "#fecaca" },
};

function formatPrice(price: number) {
    return `${currencyFormatter.format(price)}₫`;
}

export default function OrderHistoryCard({ order }: OrderHistoryCardProps) {
    const remainingProducts = Math.max(order.products.length - 2, 0);
    const style = statusStyles[order.status] || statusStyles.processing;
    const isVnPay = order.paymentMethod.toLowerCase().includes("vnpay");

    return (
        <article className="bg-white rounded-4 border shadow-sm p-3 p-md-4 mb-3 transition-all hover-shadow-sm">
            {/* 1. Header: Mã đơn, Thời gian & Trạng thái */}
            <div className="d-flex flex-wrap align-items-center justify-content-between pb-3 border-bottom gap-2">
                <div className="d-flex flex-wrap align-items-center gap-2 gap-md-3">
                    <span className="badge bg-light text-dark border rounded-pill px-2.5 py-1.5 fs-7 fw-bold">
                        #{order.code}
                    </span>
                    <span className="text-muted fs-8 d-inline-flex align-items-center">
                        <FontAwesomeIcon icon={faClock} className="opacity-50 me-1.5" />
                        <span>{order.createdAt}</span>
                    </span>
                </div>

                <div
                    className="d-inline-flex align-items-center px-3 py-1 rounded-pill fw-semibold border"
                    style={{ backgroundColor: style.bg, color: style.text, borderColor: style.border, fontSize: "12.5px" }}
                >
                    <FontAwesomeIcon icon={statusIcons[order.status]} className="me-1.5" />
                    <span>{order.statusLabel ?? orderStatusLabels[order.status]}</span>
                </div>
            </div>

            {/* 2. Danh sách sản phẩm trong đơn */}
            <div className="d-flex flex-column gap-2 py-3">
                {order.products.slice(0, 2).map((product) => (
                    <div
                        key={product.id}
                        className="d-flex align-items-center justify-content-between py-1 gap-3"
                    >
                        <div className="d-flex align-items-center gap-3 min-w-0">
                            <img
                                src={product.image || fallbackCartImage}
                                alt={product.name}
                                className="rounded-3 border object-fit-cover flex-shrink-0"
                                style={{ width: "64px", height: "64px" }}
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = fallbackCartImage;
                                }}
                            />
                            <div className="min-w-0">
                                <h3 className="fs-6 fw-bold text-dark mb-1 text-truncate" title={product.name}>
                                    {product.name}
                                </h3>
                                <div className="d-flex align-items-center gap-2 fs-8 text-muted">
                                    <span className="badge bg-secondary bg-opacity-10 text-secondary rounded-pill px-2 py-0.5">
                                        {product.variant}
                                    </span>
                                    <span>Số lượng: <strong className="text-dark">x{product.quantity}</strong></span>
                                </div>
                            </div>
                        </div>

                        <div className="text-end flex-shrink-0">
                            <span className="fs-6 fw-bold text-dark">
                                {formatPrice(product.price * product.quantity)}
                            </span>
                            <span className="d-block fs-8 text-muted">
                                {formatPrice(product.price)} / sp
                            </span>
                        </div>
                    </div>
                ))}

                {remainingProducts > 0 && (
                    <div className="text-muted fs-8 pt-1">
                        + {remainingProducts} sản phẩm khác trong đơn hàng này
                    </div>
                )}
            </div>

            {/* 3. Footer: Thông tin vắn tắt (Trái) & Tổng tiền + Nút xem chi tiết (Phải) */}
            <div className="pt-3 border-top d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
                {/* Thông tin phương thức & địa chỉ */}
                <div className="d-flex flex-wrap align-items-center gap-3 fs-8 text-muted">
                    <span className="d-inline-flex align-items-center gap-1.5">
                        <FontAwesomeIcon icon={isVnPay ? faCreditCard : faMoneyBillWave} className="text-secondary" />
                        <span className="text-dark fw-medium">{order.paymentMethod}</span>
                    </span>

                    <span className="text-secondary">•</span>

                    <span className="d-inline-flex align-items-center gap-1.5 text-truncate" style={{ maxWidth: "320px" }} title={order.deliveryAddress}>
                        <FontAwesomeIcon icon={faLocationDot} className="text-secondary flex-shrink-0" />
                        <span className="text-truncate">{order.deliveryAddress}</span>
                    </span>
                </div>

                {/* Tổng thanh toán và nút thao tác */}
                <div className="d-flex align-items-center justify-content-between justify-content-md-end gap-3 flex-shrink-0">
                    <div className="text-md-end">
                        <span className="fs-8 text-muted me-2">Tổng thanh toán:</span>
                        <strong className="fs-5 fw-black text-danger">
                            {formatPrice(order.total)}
                        </strong>
                    </div>

                    <Link
                        to={order.detailUrl || "/orders"}
                        className="btn btn-outline-dark btn-sm rounded-pill px-3 py-1.5 fw-bold d-inline-flex align-items-center gap-1.5 transition-all hover-shadow-sm flex-shrink-0"
                    >
                        <span>Xem chi tiết</span>
                        <FontAwesomeIcon icon={faChevronRight} className="fs-9" />
                    </Link>
                </div>
            </div>
        </article>
    );
}
