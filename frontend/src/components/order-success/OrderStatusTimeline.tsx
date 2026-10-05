import { orderTimeline } from "../../data/orderSuccessData";

export default function OrderStatusTimeline() {
    return (
        <section className="order-success-card">
            <div className="order-success-section-heading">
                <h2>Tiến trình xử lý</h2>
                <span>Đang chuẩn bị</span>
            </div>

            <div className="order-success-timeline">
                {orderTimeline.map((item) => (
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
