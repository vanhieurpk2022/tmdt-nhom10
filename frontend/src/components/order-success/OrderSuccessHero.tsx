import {
    faArrowLeft,
    faCheckCircle,
    faCircleXmark,
    faClock,
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
    CANCELLED: { icon: faCircleXmark, bg: "#fef2f2", text: "#b91c1c", border: "#fecaca" },
    RETURNED: { icon: faCircleXmark, bg: "#fef2f2", text: "#b91c1c", border: "#fecaca" },
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
            <section className="bg-white rounded-4 border shadow-sm p-4 mb-4">
                <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
                    <div>
                        <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
                            <span
                                className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill fw-bold fs-8 border"
                                style={{ backgroundColor: badge.bg, color: badge.text, borderColor: badge.border }}
                            >
                                <FontAwesomeIcon icon={badge.icon} />
                                <span>{view.label}</span>
                            </span>
                            <span className="text-muted fs-8">
                                Đặt lúc: <strong className="text-dark">{new Date(order.createdAt).toLocaleString("vi-VN")}</strong>
                            </span>
                        </div>

                        <h1 className="h3 fw-black text-dark mb-1">
                            Chi tiết đơn hàng #{orderCode}
                        </h1>
                        <p className="text-muted fs-7 mb-0">
                            {view.description}
                        </p>
                    </div>

                    <div className="d-flex align-items-center gap-2">
                        <Link
                            to={ROUTES.ORDERS}
                            className="btn btn-outline-secondary rounded-pill px-3 py-2 fw-bold fs-7 d-inline-flex align-items-center gap-2 hover-border-dark"
                        >
                            <FontAwesomeIcon icon={faArrowLeft} className="fs-8" />
                            <span>Về danh sách đơn hàng</span>
                        </Link>
                    </div>
                </div>
            </section>
        );
    }

    // Giao diện khi vừa checkout thành công (Order Success page)
    return (
        <section className="bg-white rounded-4 border shadow-sm p-5 text-center mb-4">
            <div
                className="rounded-circle d-inline-flex align-items-center justify-content-center bg-success bg-opacity-10 text-success mb-3 shadow-xs"
                style={{ width: "72px", height: "72px" }}
            >
                <FontAwesomeIcon icon={faCheckCircle} className="fs-1" />
            </div>

            <span
                className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill fw-bold fs-8 border mb-2"
                style={{ backgroundColor: badge.bg, color: badge.text, borderColor: badge.border }}
            >
                <FontAwesomeIcon icon={badge.icon} />
                <span>{view.label}</span>
            </span>

            <h1 className="h2 fw-black text-dark mb-2">Đặt hàng thành công!</h1>
            <p className="text-muted fs-6 max-w-md mx-auto mb-3" style={{ maxWidth: "560px" }}>
                Cảm ơn bạn đã tin tưởng mua sắm tinh dầu thiên nhiên tại Oilia. Đơn hàng của bạn đang được tiếp nhận và xử lý.
            </p>

            <div className="d-inline-flex align-items-center gap-2 px-4 py-2 rounded-pill bg-light border text-dark fs-7 fw-bold">
                <FontAwesomeIcon icon={faReceipt} className="text-primary" />
                <span className="text-muted">Mã đơn hàng:</span>
                <span className="text-primary fw-black">#{orderCode}</span>
            </div>
            <p className="text-muted fs-8 mt-2 mb-0">
                Thời gian đặt: {new Date(order.createdAt).toLocaleString("vi-VN")}
            </p>
        </section>
    );
}
