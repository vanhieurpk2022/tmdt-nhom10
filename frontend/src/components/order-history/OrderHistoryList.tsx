import { faBoxOpen } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router";
import type { OrderHistoryItem } from "../../data/orderHistoryData";
import { ROUTES } from "../../routes/routes";
import OrderHistoryCard from "./OrderHistoryCard";

interface OrderHistoryListProps {
    orders: OrderHistoryItem[];
}

export default function OrderHistoryList({ orders }: OrderHistoryListProps) {
    if (orders.length === 0) {
        return (
            <div className="bg-white rounded-4 border shadow-sm p-5 text-center my-3">
                <div className="rounded-circle d-inline-flex align-items-center justify-content-center bg-light text-muted mb-3" style={{ width: "70px", height: "70px" }}>
                    <FontAwesomeIcon icon={faBoxOpen} className="fs-2 opacity-50" />
                </div>
                <h3 className="h5 fw-bold text-dark mb-2">Chưa tìm thấy đơn hàng phù hợp</h3>
                <p className="text-muted fs-7 mb-4 max-w-sm mx-auto" style={{ maxWidth: "420px" }}>
                    Bạn chưa có đơn hàng nào theo bộ lọc này hoặc chưa phát sinh giao dịch. Hãy khám phá bộ sưu tập tinh dầu thiên nhiên cao cấp tại Oilia!
                </p>
                <Link to={ROUTES.PRODUCTS} className="btn btn-primary rounded-pill px-4 py-2 fw-bold fs-7 shadow-sm">
                    Khám phá sản phẩm ngay
                </Link>
            </div>
        );
    }

    return (
        <section className="d-flex flex-column gap-3" aria-label="Danh sách đơn hàng">
            {orders.map((order) => (
                <OrderHistoryCard key={order.id} order={order} />
            ))}
        </section>
    );
}
