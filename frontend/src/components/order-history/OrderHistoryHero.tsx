import { faCheckCircle, faReceipt, faWallet } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { OrderHistorySummary } from "../../api/OrderService";

interface OrderHistoryHeroProps {
    summary?: OrderHistorySummary;
}

const currencyFormatter = new Intl.NumberFormat("vi-VN");

function formatPrice(price: number) {
    return `${currencyFormatter.format(price)}đ`;
}

export default function OrderHistoryHero({ summary }: OrderHistoryHeroProps) {
    return (
        <section className="bg-white rounded-4 shadow-sm border p-4 mb-2">
            <div className="row g-4 align-items-center">
                <div className="col-12 col-xl-5">
                    <div className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill bg-primary bg-opacity-10 text-primary fw-bold fs-8 mb-2">
                        <FontAwesomeIcon icon={faReceipt} />
                        <span>QUẢN LÝ MUA HÀNG</span>
                    </div>
                    <h1 className="h3 fw-bold text-dark mb-2">Theo dõi đơn hàng của bạn</h1>
                    <p className="text-muted fs-7 mb-0">
                        Kiểm tra trạng thái xử lý, tiến trình vận chuyển, thông tin hoàn tiền và lịch sử mua sắm tại Oilia.
                    </p>
                </div>

                <div className="col-12 col-xl-7">
                    <div className="row g-3">
                        {/* Tổng số đơn hàng */}
                        <div className="col-12 col-sm-4">
                            <div className="d-flex align-items-center gap-3 p-3 rounded-4 bg-light bg-opacity-50 border h-100 transition-all hover-shadow-sm">
                                <div className="rounded-circle d-flex align-items-center justify-content-center bg-primary bg-opacity-10 text-primary flex-shrink-0" style={{ width: "46px", height: "46px" }}>
                                    <FontAwesomeIcon icon={faReceipt} className="fs-5" />
                                </div>
                                <div className="overflow-hidden">
                                    <span className="d-block fs-8 text-muted fw-bold text-uppercase text-truncate">Tổng đơn hàng</span>
                                    <strong className="fs-4 text-dark fw-black">{summary?.totalOrders ?? 0}</strong>
                                </div>
                            </div>
                        </div>

                        {/* Đã giao thành công */}
                        <div className="col-12 col-sm-4">
                            <div className="d-flex align-items-center gap-3 p-3 rounded-4 bg-light bg-opacity-50 border h-100 transition-all hover-shadow-sm">
                                <div className="rounded-circle d-flex align-items-center justify-content-center bg-success bg-opacity-10 text-success flex-shrink-0" style={{ width: "46px", height: "46px" }}>
                                    <FontAwesomeIcon icon={faCheckCircle} className="fs-5" />
                                </div>
                                <div className="overflow-hidden">
                                    <span className="d-block fs-8 text-muted fw-bold text-uppercase text-truncate">Giao thành công</span>
                                    <strong className="fs-4 text-success fw-black">{summary?.deliveredOrders ?? 0}</strong>
                                </div>
                            </div>
                        </div>

                        {/* Tổng chi tiêu tích lũy */}
                        <div className="col-12 col-sm-4">
                            <div className="d-flex align-items-center gap-3 p-3 rounded-4 bg-light bg-opacity-50 border h-100 transition-all hover-shadow-sm">
                                <div className="rounded-circle d-flex align-items-center justify-content-center bg-danger bg-opacity-10 text-danger flex-shrink-0" style={{ width: "46px", height: "46px" }}>
                                    <FontAwesomeIcon icon={faWallet} className="fs-5" />
                                </div>
                                <div className="overflow-hidden">
                                    <span className="d-block fs-8 text-muted fw-bold text-uppercase text-truncate">Tổng chi tiêu</span>
                                    <strong className="fs-5 text-dark fw-black text-truncate d-block" title={summary ? formatPrice(summary.totalSpent) : "0đ"}>
                                        {summary ? formatPrice(summary.totalSpent) : "0đ"}
                                    </strong>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
