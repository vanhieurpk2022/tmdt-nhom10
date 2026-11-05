import {
    faBoxArchive,
    faCheckCircle,
    faCircleDot,
    faClock,
    faTruckFast,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { getOrderProgress, getOrderStatusView } from "../../data/orderSuccessData";

const stepIcons: IconDefinition[] = [
    faClock,
    faCheckCircle,
    faBoxArchive,
    faTruckFast,
    faCheckCircle,
];

export default function OrderStatusTimeline({ status }: { status: string }) {
    const isCancelled = ["CANCELLED", "RETURNED"].includes(status);
    // Nếu đơn đã hủy hoặc trả hàng, không hiển thị timeline rỗng nữa (đã có thẻ Thông tin hủy & Hoàn tiền hiển thị chi tiết)
    if (isCancelled) return null;

    const view = getOrderStatusView(status);
    const progress = getOrderProgress(status);

    return (
        <section className="bg-white rounded-4 border shadow-sm p-3 p-md-4 mb-3">
            <div className="d-flex flex-wrap align-items-center justify-content-between pb-3 mb-3 border-bottom gap-2">
                <div className="d-flex align-items-center gap-2">
                    <div className="rounded-circle d-flex align-items-center justify-content-center bg-primary bg-opacity-10 text-primary" style={{ width: "36px", height: "36px" }}>
                        <FontAwesomeIcon icon={faTruckFast} className="fs-7" />
                    </div>
                    <div>
                        <h2 className="fs-6 fw-bold text-dark mb-0">Tiến trình đơn hàng</h2>
                        <span className="text-muted fs-8">Cập nhật theo thời gian thực</span>
                    </div>
                </div>

                <span className="badge rounded-pill px-3 py-1 fs-8 fw-bold bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25">
                    {view.label}
                </span>
            </div>

            {/* Stepper tiến trình nhiều bước */}
            <div className="order-stepper position-relative ps-2 pt-2">
                {progress.map((item, index) => {
                    const icon = stepIcons[index] || faCircleDot;
                    const isLast = index === progress.length - 1;

                    return (
                        <div key={item.title} className="d-flex gap-3 position-relative pb-3">
                            {/* Đường nối giữa các bước */}
                            {!isLast && (
                                <div
                                    className={`position-absolute ${item.active ? "bg-success" : "bg-light-subtle"}`}
                                    style={{
                                        left: "15px",
                                        top: "28px",
                                        bottom: "0",
                                        width: "2px",
                                        zIndex: 0,
                                    }}
                                />
                            )}

                            {/* Icon / Nút trạng thái */}
                            <div
                                className={`rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 z-1 transition-all ${
                                    item.active
                                        ? "bg-success text-white shadow-sm"
                                        : "bg-light text-muted border"
                                }`}
                                style={{ width: "32px", height: "32px" }}
                            >
                                <FontAwesomeIcon icon={icon} className="fs-8" />
                            </div>

                            {/* Nội dung bước */}
                            <div className="pt-1">
                                <h4 className={`fs-7 fw-bold mb-0.5 ${item.active ? "text-dark" : "text-muted"}`}>
                                    {item.title}
                                </h4>
                                <p className="fs-8 text-muted mb-0 lh-base">
                                    {item.description}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
