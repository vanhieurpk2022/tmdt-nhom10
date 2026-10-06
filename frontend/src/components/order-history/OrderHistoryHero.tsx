import { faBoxOpen, faReceipt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { OrderHistoryItem } from "../../data/orderHistoryData";

interface OrderHistoryHeroProps {
    orders: OrderHistoryItem[];
}

const currencyFormatter = new Intl.NumberFormat("vi-VN");

function formatPrice(price: number) {
    return `${currencyFormatter.format(price)}đ`;
}

export default function OrderHistoryHero({ orders }: OrderHistoryHeroProps) {
    const completedOrders = orders.filter((order) => order.status === "completed").length;
    const totalPaid = orders.reduce((total, order) => total + order.subtotal - order.discount + order.shippingFee, 0);

    return (
        <section className="bg-white rounded-4 shadow-sm p-4">
            <div className="row g-4 align-items-center">
                <div className="col-12 col-xl-6">

                    <h1 className="h3 fw-bold text-dark mb-2">Theo dõi toàn bộ đơn hàng của bạn</h1>
                    <p className="text-muted fs-7 mb-0">
                        Kiểm tra trạng thái xử lý, phương thức thanh toán và các sản phẩm đã mua tại Oilia.
                    </p>
                </div>

                <div className="col-12 col-xl-6">
                    <div className="d-flex flex-wrap flex-sm-nowrap gap-3">
                        <article className="d-flex flex-column bg-light rounded-4 p-3 border flex-fill" style={{ minWidth: "100px" }}>
                            <FontAwesomeIcon icon={faReceipt} className="text-primary mb-2 fs-5" />
                            <span className="fs-8 text-muted fw-bold text-uppercase mb-1 text-nowrap">Tổng đơn</span>
                            <strong className="fs-5 text-dark fw-bold">{orders.length}</strong>
                        </article>
                        <article className="d-flex flex-column bg-light rounded-4 p-3 border flex-fill" style={{ minWidth: "100px" }}>
                            <FontAwesomeIcon icon={faBoxOpen} className="text-primary mb-2 fs-5" />
                            <span className="fs-8 text-muted fw-bold text-uppercase mb-1 text-nowrap">Đã giao</span>
                            <strong className="fs-5 text-dark fw-bold">{completedOrders}</strong>
                        </article>
                        <article className="d-flex flex-column bg-light rounded-4 p-3 border flex-fill" style={{ minWidth: "140px" }}>
                            <FontAwesomeIcon icon={faReceipt} className="text-primary mb-2 fs-5" />
                            <span className="fs-8 text-muted fw-bold text-uppercase mb-1 text-nowrap">Tổng chi tiêu</span>
                            <strong className="fs-5 text-dark fw-bold text-nowrap">{formatPrice(totalPaid)}</strong>
                        </article>
                    </div>
                </div>
            </div>
        </section>
    );
}
