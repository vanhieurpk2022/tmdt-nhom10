import {
    faBan,
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
    const view = getOrderStatusView(status);
    const progress = getOrderProgress(status);

    return (
        <section className="bg-white rounded-4 border shadow-sm p-4 mb-4">
            <div className="d-flex flex-wrap align-items-center justify-content-between pb-3 mb-4 border-bottom gap-2">
                <div className="d-flex align-items-center gap-2">
                    <div className="rounded-circle d-flex align-items-center justify-content-center bg-primary bg-opacity-10 text-primary" style={{ width: "36px", height: "36px" }}>
                        <FontAwesomeIcon icon={faTruckFast} className="fs-7" />
                    </div>
                    <div>
                        <h2 className="fs-6 fw-bold text-dark mb-0">Tiến trình đơn hàng</h2>
                        <span className="text-muted fs-8">Cập nhật trạng thái xử lý theo thời gian thực</span>
                    </div>
                </div>

                <span
                    className={`badge rounded-pill px-3 py-1 fs-8 fw-bold border ${
                        isCancelled
                            ? "bg-danger bg-opacity-10 text-danger border-danger border-opacity-25"
                            : status === "DELIVERED"
                            ? "bg-success bg-opacity-10 text-success border-success border-opacity-25"
                            : "bg-primary bg-opacity-10 text-primary border-primary border-opacity-25"
                    }`}
                >
                    {view.label}
                </span>
            </div>

            {isCancelled ? (
                /* Trạng thái đơn hàng bị hủy */
                <div className="p-3 rounded-3 bg-danger bg-opacity-10 border border-danger border-opacity-25 d-flex align-items-start gap-3">
                    <div className="rounded-circle bg-danger text-white d-flex align-items-center justify-content-center flex-shrink-0 mt-1" style={{ width: "32px", height: "32px" }}>
                        <FontAwesomeIcon icon={faBan} className="fs-7" />
                    </div>
                    <div>
                        <h3 className="fs-7 fw-bold text-danger mb-1">Đơn hàng đã kết thúc (Đã hủy)</h3>
                        <p className="fs-8 text-dark text-opacity-75 mb-0 lh-base">
                            {view.description}
                        </p>
                    </div>
                </div>
            ) : (
                /* Stepper tiến trình nhiều bước */
                <div className="order-stepper position-relative ps-2">
                    {progress.map((item, index) => {
                        const icon = stepIcons[index] || faCircleDot;
                        const isLast = index === progress.length - 1;

                        return (
                            <div key={item.title} className="d-flex gap-3 position-relative pb-4">
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
                                    <h4 className={`fs-7 fw-bold mb-1 ${item.active ? "text-dark" : "text-muted"}`}>
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
            )}
        </section>
    );
}
