import { faBoxOpen, faReceipt, faWallet } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { OrderHistorySummary } from "../../api/OrderService";

interface OrderHistoryHeroProps {
    summary?: OrderHistorySummary;
}

const currencyFormatter = new Intl.NumberFormat("vi-VN");

function formatPrice(price: number) {
    return `${currencyFormatter.format(price)} ₫`;
}

export default function OrderHistoryHero({ summary }: OrderHistoryHeroProps) {
    return (
        <section className="account-panel order-history-hero">
            <div className="account-heading">
                <h2>Đơn hàng của tôi</h2>
                <p>Theo dõi trạng thái và xem chi tiết các đơn hàng của bạn.</p>
            </div>
            <div className="order-history-stats">
                <article>
                    <span><FontAwesomeIcon icon={faReceipt} /> Tổng đơn hàng</span>
                    <strong>{summary?.totalOrders ?? "—"}</strong>
                </article>
                <article>
                    <span><FontAwesomeIcon icon={faBoxOpen} /> Đã giao</span>
                    <strong>{summary?.deliveredOrders ?? "—"}</strong>
                </article>
                <article>
                    <span><FontAwesomeIcon icon={faWallet} /> Tổng chi tiêu</span>
                    <strong>{summary ? formatPrice(summary.totalSpent) : "—"}</strong>
                </article>
            </div>
        </section>
    );
}
