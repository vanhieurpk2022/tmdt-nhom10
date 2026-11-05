import type { CartItem } from "../../data/cartData";
import { fallbackCartImage } from "../../data/cartData";
import { Link } from "react-router";
import { ROUTES } from "../../routes/routes";

interface OrderProductListProps {
    items: CartItem[];
}

const currencyFormatter = new Intl.NumberFormat("vi-VN");

function formatPrice(price: number) {
    return `${currencyFormatter.format(price)}₫`;
}

export function OrderProductList({ items }: OrderProductListProps) {
    return (
        <section className="bg-white rounded-4 border shadow-sm p-4 mb-4">
            <div className="d-flex flex-wrap align-items-center justify-content-between pb-3 mb-3 border-bottom gap-2">
                <div>
                    <h2 className="h6 fw-bold text-dark mb-0.5">Sản phẩm đã đặt</h2>
                    <span className="text-muted" style={{ fontSize: "12.5px" }}>Danh sách các mặt hàng trong kiện hàng</span>
                </div>

                <span className="badge bg-light text-dark border rounded-pill px-3 py-1.5 fw-semibold" style={{ fontSize: "12.5px" }}>
                    {items.length} sản phẩm
                </span>
            </div>

            <div className="d-flex flex-column">
                {items.map((item, index) => (
                    <div
                        key={item.id}
                        className={`d-flex flex-column flex-sm-row align-items-sm-center justify-content-between py-3 gap-3 ${
                            index > 0 ? "border-top" : ""
                        }`}
                    >
                        <div className="d-flex align-items-center gap-3 min-w-0">
                            <Link to={`${ROUTES.PRODUCT_DETAIL}/${item.productId}`} className="flex-shrink-0">
                                <img
                                    src={item.image || fallbackCartImage}
                                    alt={item.name}
                                    className="rounded-3 border object-fit-cover"
                                    style={{ width: "60px", height: "60px" }}
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = fallbackCartImage;
                                    }}
                                />
                            </Link>

                            <div className="min-w-0">
                                <h3 className="fw-semibold mb-1 text-truncate" style={{ fontSize: "14px" }}>
                                    <Link
                                        to={`${ROUTES.PRODUCT_DETAIL}/${item.productId}`}
                                        className="text-dark text-decoration-none hover-text-primary"
                                        title={item.name}
                                    >
                                        {item.name}
                                    </Link>
                                </h3>

                                <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
                                    <span className="badge bg-light text-secondary border rounded-pill px-2 py-0.5" style={{ fontSize: "11.5px" }}>
                                        {item.variant}
                                    </span>
                                    {item.factoryName && (
                                        <span className="text-muted" style={{ fontSize: "12px" }}>
                                            Xưởng: {item.factoryName}
                                        </span>
                                    )}
                                </div>

                                <span className="text-muted" style={{ fontSize: "12.5px" }}>
                                    Đơn giá: {formatPrice(item.price)} • Số lượng: <strong className="text-dark fw-semibold">x{item.quantity}</strong>
                                </span>
                            </div>
                        </div>

                        <div className="text-sm-end ms-sm-3 ps-sm-3 flex-shrink-0">
                            <span className="d-block text-muted fw-medium mb-0.5" style={{ fontSize: "11px", letterSpacing: "0.5px" }}>Thành tiền</span>
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

export default OrderProductList;
