import {
    faArrowLeft,
    faBagShopping,
    faCheckCircle,
    faCircleXmark,
    faClock,
    faListUl,
    faReceipt,
    faTruckFast,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { Link } from "react-router";
import { formatOrderCode, type OrderResponse } from "../../api/OrderService";
import { getOrderStatusView } from "../../data/orderSuccessData";
import { ROUTES } from "../../routes/routes";

interface OrderSuccessHeroProps {
    order: OrderResponse;
    detail?: boolean;
}

const statusBadgeConfig: Record<string, { icon: IconDefinition; bg: string; text: string; border: string }> = {
    DELIVERED: { icon: faCheckCircle, bg: "#f0fdf4", text: "#15803d", border: "#bbf7d0" },
    CANCELLED: { icon: faCircleXmark, bg: "#fef2f2", text: "#dc2626", border: "#fecaca" },
    RETURNED: { icon: faCircleXmark, bg: "#fef2f2", text: "#dc2626", border: "#fecaca" },
    PENDING_PAYMENT: { icon: faClock, bg: "#fffbeb", text: "#b45309", border: "#fde68a" },
    PENDING: { icon: faClock, bg: "#fffbeb", text: "#b45309", border: "#fde68a" },
    CONFIRMED: { icon: faCheckCircle, bg: "#eff6ff", text: "#1d4ed8", border: "#bfdbfe" },
    PROCESSING: { icon: faClock, bg: "#eff6ff", text: "#1d4ed8", border: "#bfdbfe" },
    SHIPPED: { icon: faTruckFast, bg: "#eff6ff", text: "#1d4ed8", border: "#bfdbfe" },
    DELIVERING: { icon: faTruckFast, bg: "#eff6ff", text: "#1d4ed8", border: "#bfdbfe" },
};

export default function OrderSuccessHero({ order, detail = false }: OrderSuccessHeroProps) {
    const orderCode = formatOrderCode(order.id);
    const view = getOrderStatusView(order.status);
    const badge = statusBadgeConfig[order.status] || {
        icon: faReceipt,
        bg: "#f8fafc",
        text: "#475569",
        border: "#e2e8f0",
    };

    if (detail) {
        return (
            <section className="bg-white rounded-4 border shadow-sm p-3.5 p-md-4 mb-4">
                <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
                    <div>
                        <div className="d-flex flex-wrap align-items-center gap-3 mb-2">
                            <span
                                className="d-inline-flex align-items-center px-3 py-1 rounded-pill fw-semibold border"
                                style={{
                                    backgroundColor: badge.bg,
                                    color: badge.text,
                                    borderColor: badge.border,
                                    fontSize: "12.5px",
                                }}
                            >
                                <FontAwesomeIcon icon={badge.icon} className="me-2" />
                                <span>{view.label}</span>
                            </span>

                            <span className="text-muted" style={{ fontSize: "13px" }}>
                                Đặt lúc: <strong className="text-dark fw-semibold">{new Date(order.createdAt).toLocaleString("vi-VN")}</strong>
                            </span>
                        </div>

                        <h1 className="h5 fw-bold text-dark mb-1">
                            Chi tiết đơn hàng #{orderCode}
                        </h1>
                        <p className="text-muted mb-0" style={{ fontSize: "13px" }}>
                            {view.description}
                        </p>
                    </div>

                    <div className="flex-shrink-0 pt-2 pt-md-0">
                        <Link
                            to={ROUTES.ORDERS}
                            className="btn btn-outline-secondary btn-sm rounded-pill px-3 py-2 fw-semibold d-inline-flex align-items-center gap-2 hover-border-dark"
                            style={{ fontSize: "13px" }}
                        >
                            <FontAwesomeIcon icon={faArrowLeft} className="fs-8" />
                            <span>Về danh sách đơn hàng</span>
                        </Link>
                    </div>
                </div>
            </section>
        );
    }

    // Giao diện khi vừa checkout thành công (Order Success page) - Gọn gàng, tinh tế, không chiếm hết màn hình
    return (
        <section className="bg-white rounded-4 border shadow-sm p-4 text-center mb-4">
            <div className="d-flex flex-column align-items-center">
                <div
                    className="rounded-circle d-inline-flex align-items-center justify-content-center bg-success bg-opacity-10 text-success mb-2.5 shadow-xs"
                    style={{ width: "52px", height: "52px" }}
                >
                    <FontAwesomeIcon icon={faCheckCircle} className="fs-3" />
                </div>

                <h1 className="h5 fw-bold text-dark mb-1.5">Đặt hàng thành công!</h1>
                <p className="text-muted mb-3" style={{ maxWidth: "480px", fontSize: "13.5px" }}>
                    Cảm ơn bạn đã tin tưởng mua sắm tại Oilia. Đơn hàng của bạn đang được tiếp nhận và xử lý.
                </p>

                {/* Thông tin mã đơn & trạng thái trên 1 hàng gọn */}
                <div className="d-flex flex-wrap align-items-center justify-content-center gap-2 mb-3">
                    <span className="badge bg-light text-dark border rounded-pill px-3 py-1.5 fw-semibold" style={{ fontSize: "13px" }}>
                        <FontAwesomeIcon icon={faReceipt} className="text-primary me-1.5" />
                        Mã đơn: <strong className="text-primary">#{orderCode}</strong>
                    </span>

                    <span
                        className="badge rounded-pill px-3 py-1.5 fw-semibold border"
                        style={{
                            backgroundColor: badge.bg,
                            color: badge.text,
                            borderColor: badge.border,
                            fontSize: "12.5px",
                        }}
                    >
                        <FontAwesomeIcon icon={badge.icon} className="me-1.5" />
                        {view.label}
                    </span>

                    <span className="text-muted" style={{ fontSize: "12.5px" }}>
                        Đặt lúc: {new Date(order.createdAt).toLocaleString("vi-VN")}
                    </span>
                </div>

                {/* 2 nút điều hướng chính đặt ngay tại banner */}
                <div className="d-flex flex-wrap align-items-center justify-content-center gap-2.5">
                    <Link
                        to={ROUTES.ORDERS}
                        className="btn btn-dark btn-sm rounded-pill px-3.5 py-2 fw-semibold d-inline-flex align-items-center gap-2 shadow-xs"
                        style={{ fontSize: "13px" }}
                    >
                        <FontAwesomeIcon icon={faListUl} className="fs-8" />
                        <span>Xem đơn hàng của tôi</span>
                    </Link>
                    <Link
                        to={ROUTES.PRODUCTS}
                        className="btn btn-outline-secondary btn-sm rounded-pill px-3.5 py-2 fw-semibold d-inline-flex align-items-center gap-2 hover-border-dark"
                        style={{ fontSize: "13px" }}
                    >
                        <FontAwesomeIcon icon={faBagShopping} className="fs-8" />
                        <span>Tiếp tục mua sắm</span>
                    </Link>
                </div>
            </div>
        </section>
    );
}
