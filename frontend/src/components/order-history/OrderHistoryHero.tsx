import { faCheckCircle, faReceipt, faWallet } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { OrderHistorySummary } from "../../api/OrderService";

interface OrderHistoryHeroProps {
    summary?: OrderHistorySummary;
}

const currencyFormatter = new Intl.NumberFormat("vi-VN");

function formatPrice(price: number) {
    return `${currencyFormatter.format(price)}₫`;
}

export default function OrderHistoryHero({ summary }: OrderHistoryHeroProps) {
    return (
        <section className="bg-white rounded-4 border shadow-sm p-3 p-md-4 mb-2">
            <div className="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-3">
                {/* Tiêu đề & mô tả */}
                <div>
                    <div className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill bg-primary bg-opacity-10 text-primary fw-bold fs-8 mb-2">
                        <FontAwesomeIcon icon={faReceipt} />
                        <span>QUẢN LÝ ĐƠN HÀNG</span>
                    </div>
                    <h1 className="h4 fw-bold text-dark mb-1">Đơn hàng của tôi</h1>
                    <p className="text-muted fs-7 mb-0">
                        Theo dõi tiến trình xử lý, trạng thái giao vận và lịch sử mua sắm tại Oilia
                    </p>
                </div>

                {/* 3 Thẻ thống kê - Thiết kế không bị co cụm hay cắt chữ */}
                <div className="d-flex flex-wrap flex-sm-nowrap gap-2 gap-md-3">
                    {/* Tổng đơn */}
                    <div className="d-flex align-items-center gap-3 px-3 py-2 rounded-3 bg-light bg-opacity-75 border flex-fill flex-sm-grow-0" style={{ minWidth: "135px" }}>
                        <div className="rounded-circle d-flex align-items-center justify-content-center bg-primary bg-opacity-10 text-primary flex-shrink-0" style={{ width: "40px", height: "40px" }}>
                            <FontAwesomeIcon icon={faReceipt} className="fs-6" />
                        </div>
                        <div>
                            <span className="d-block text-muted fw-bold" style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                                Tổng đơn
                            </span>
                            <strong className="fs-5 text-dark fw-black lh-1">
                                {summary?.totalOrders ?? 0}
                            </strong>
                        </div>
                    </div>

                    {/* Đã giao */}
                    <div className="d-flex align-items-center gap-3 px-3 py-2 rounded-3 bg-light bg-opacity-75 border flex-fill flex-sm-grow-0" style={{ minWidth: "145px" }}>
                        <div className="rounded-circle d-flex align-items-center justify-content-center bg-success bg-opacity-10 text-success flex-shrink-0" style={{ width: "40px", height: "40px" }}>
                            <FontAwesomeIcon icon={faCheckCircle} className="fs-6" />
                        </div>
                        <div>
                            <span className="d-block text-muted fw-bold" style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                                Đã giao
                            </span>
                            <strong className="fs-5 text-success fw-black lh-1">
                                {summary?.deliveredOrders ?? 0}
                            </strong>
                        </div>
                    </div>

                    {/* Tổng chi tiêu */}
                    <div className="d-flex align-items-center gap-3 px-3 py-2 rounded-3 bg-light bg-opacity-75 border flex-fill flex-sm-grow-0" style={{ minWidth: "165px" }}>
                        <div className="rounded-circle d-flex align-items-center justify-content-center bg-danger bg-opacity-10 text-danger flex-shrink-0" style={{ width: "40px", height: "40px" }}>
                            <FontAwesomeIcon icon={faWallet} className="fs-6" />
                        </div>
                        <div>
                            <span className="d-block text-muted fw-bold" style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                                Tổng chi tiêu
                            </span>
                            <strong className="fs-6 text-dark fw-black lh-1 text-nowrap">
                                {summary ? formatPrice(summary.totalSpent) : "0₫"}
                            </strong>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
