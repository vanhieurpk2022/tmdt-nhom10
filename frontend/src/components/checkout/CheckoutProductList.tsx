import { faBoxOpen, faLeaf } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { CartItem } from "../../data/cartData";
import { fallbackCartImage } from "../../data/cartData";

interface CheckoutProductListProps {
    items: CartItem[];
    isLoading?: boolean;
}

const currencyFormatter = new Intl.NumberFormat("vi-VN");

function formatPrice(price: number) {
    return `${currencyFormatter.format(price)}₫`;
}

export default function CheckoutProductList({ items, isLoading = false }: CheckoutProductListProps) {
    return (
        <section className="bg-white rounded-4 border shadow-sm p-4 mb-4" aria-labelledby="checkout-products-title">
            {/* Header mục sản phẩm */}
            <div className="d-flex flex-wrap align-items-center justify-content-between pb-3 mb-3 border-bottom gap-2">
                <div className="d-flex align-items-center gap-2.5">
                    <div className="rounded-circle d-flex align-items-center justify-content-center bg-primary bg-opacity-10 text-primary fw-bold" style={{ width: "32px", height: "32px", fontSize: "14px" }}>
                        2
                    </div>
                    <div>
                        <h2 id="checkout-products-title" className="h6 fw-bold text-dark mb-0">
                            Kiện hàng thanh toán
                        </h2>
                        <span className="text-muted" style={{ fontSize: "12.5px" }}>Danh sách các mặt hàng chuẩn bị đặt</span>
                    </div>
                </div>

                <span className="badge bg-light text-dark border rounded-pill px-2.5 py-1 fw-semibold" style={{ fontSize: "12px" }}>
                    {items.length} mặt hàng
                </span>
            </div>

            <div className="d-flex flex-column gap-3">
                {isLoading && (
                    <div className="p-4 rounded-3 bg-light text-center text-muted" style={{ fontSize: "13px" }}>
                        <div className="spinner-border spinner-border-sm text-primary me-2" role="status" aria-hidden="true" />
                        <span>Đang tải danh sách sản phẩm…</span>
                    </div>
                )}

                {!isLoading && items.length === 0 && (
                    <div className="p-4 rounded-3 bg-light text-center border">
                        <FontAwesomeIcon icon={faBoxOpen} className="fs-3 text-muted mb-2 opacity-50" />
                        <p className="fw-bold text-dark mb-1" style={{ fontSize: "14px" }}>Chưa có sản phẩm để thanh toán</p>
                        <span className="text-muted" style={{ fontSize: "13px" }}>Hãy quay lại giỏ hàng và chọn sản phẩm bạn muốn đặt.</span>
                    </div>
                )}

                {!isLoading && items.map((item) => (
                    <div
                        key={item.id}
                        className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between p-3 rounded-3 bg-light bg-opacity-50 border gap-3"
                    >
                        <div className="d-flex align-items-center gap-3 min-w-0">
                            <img
                                src={item.image || fallbackCartImage}
                                alt={item.name}
                                className="rounded-3 border object-fit-cover flex-shrink-0"
                                style={{ width: "56px", height: "56px" }}
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = fallbackCartImage;
                                }}
                            />
                            <div className="min-w-0">
                                <h3 className="fw-bold text-dark mb-1 text-truncate" style={{ fontSize: "14px" }} title={item.name}>
                                    {item.name}
                                </h3>
                                <div className="d-flex flex-wrap align-items-center gap-2 mb-1" style={{ fontSize: "12px" }}>
                                    <span className="badge bg-secondary bg-opacity-10 text-secondary rounded-pill px-2 py-0.5">
                                        {item.variant}
                                    </span>
                                    {item.factoryName && (
                                        <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 rounded-pill px-2 py-0.5">
                                            <FontAwesomeIcon icon={faLeaf} className="me-1" style={{ fontSize: "9px" }} />
                                            {item.factoryName}
                                        </span>
                                    )}
                                </div>
                                <span className="text-muted" style={{ fontSize: "12.5px" }}>
                                    Đơn giá: {formatPrice(item.price)} • Số lượng: <strong className="text-dark fw-semibold">x{item.quantity}</strong>
                                </span>
                            </div>
                        </div>

                        <div className="text-sm-end ms-sm-3 ps-sm-3 border-sm-start flex-shrink-0">
                            <span className="d-block text-muted fw-bold text-uppercase mb-0.5" style={{ fontSize: "11px", letterSpacing: "0.5px" }}>Thành tiền</span>
                            <strong className="text-dark fw-bold" style={{ fontSize: "14.5px" }}>
                                {formatPrice(item.price * item.quantity)}
                            </strong>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
