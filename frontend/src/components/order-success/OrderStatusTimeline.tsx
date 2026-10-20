import { getOrderProgress, getOrderStatusView } from "../../data/orderSuccessData";

export default function OrderStatusTimeline({ status }: { status: string }) {
    return (
        <section className="order-success-card">
            <div className="order-success-section-heading d-flex align-items-center justify-content-between">
                <h2>Tiến trình xử lý</h2>
                <span>{getOrderStatusView(status).label}</span>
            </div>

            <div className="order-success-timeline">
                {getOrderProgress(status).map((item) => (
                    <article className={item.active ? "active" : ""} key={item.title}>
                        <span />
                        <div>
                            <h3>{item.title}</h3>
                            <p>{item.description}</p>
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
}
