import { faBoxOpen, faLeaf } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { CartItem } from "../../data/cartData";
import { fallbackCartImage } from "../../data/cartData";
import { Link } from "react-router";
import { ROUTES } from "../../routes/routes";

interface OrderProductListProps {
    items: CartItem[];
}

const currencyFormatter = new Intl.NumberFormat("vi-VN");

function formatPrice(price: number) {
    return `${currencyFormatter.format(price)}đ`;
}

export default function OrderProductList({ items }: OrderProductListProps) {
    return (
        <section className="bg-white rounded-4 border shadow-sm p-3 p-md-4 mb-3">
            <div className="d-flex flex-wrap align-items-center justify-content-between pb-3 mb-3 border-bottom gap-2">
                <div className="d-flex align-items-center gap-2">
                    <div className="rounded-circle d-flex align-items-center justify-content-center bg-primary bg-opacity-10 text-primary" style={{ width: "36px", height: "36px" }}>
                        <FontAwesomeIcon icon={faBoxOpen} className="fs-7" />
                    </div>
                    <div>
                        <h2 className="fs-6 fw-bold text-dark mb-0">Sản phẩm đã đặt</h2>
                        <span className="text-muted fs-8">Danh sách các mặt hàng trong kiện hàng</span>
                    </div>
                </div>

                <span className="badge bg-light text-dark border rounded-pill px-3 py-1 fs-8 fw-bold">
                    {items.length} sản phẩm
                </span>
            </div>

            <div className="d-flex flex-column gap-3">
                {items.map((item) => (
                    <div
                        key={item.id}
                        className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between p-3 rounded-3 bg-light bg-opacity-50 border gap-3 transition-all hover-shadow-sm"
                    >
                        <div className="d-flex align-items-center gap-3 min-w-0">
                            <Link to={`${ROUTES.PRODUCT_DETAIL}/${item.productId}`} className="flex-shrink-0">
                                <img
                                    src={item.image || fallbackCartImage}
                                    alt={item.name}
                                    className="rounded-3 border object-fit-cover"
                                    style={{ width: "64px", height: "64px" }}
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = fallbackCartImage;
                                    }}
                                />
                            </Link>

                            <div className="min-w-0">
                                <h3 className="fs-6 fw-bold mb-1 text-truncate">
                                    <Link
                                        to={`${ROUTES.PRODUCT_DETAIL}/${item.productId}`}
                                        className="text-dark text-decoration-none hover-text-primary"
                                        title={item.name}
                                    >
                                        {item.name}
                                    </Link>
                                </h3>

                                <div className="d-flex flex-wrap align-items-center gap-2 fs-8 mb-1">
                                    <span className="badge bg-secondary bg-opacity-10 text-secondary rounded-pill px-2 py-0">
                                        {item.variant}
                                    </span>
                                    {item.factoryName && (
                                        <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 rounded-pill px-2 py-0">
                                            <FontAwesomeIcon icon={faLeaf} className="me-1 fs-9" />
                                            {item.factoryName}
                                        </span>
                                    )}
                                </div>

                                <span className="text-muted fs-8">
                                    Đơn giá: {formatPrice(item.price)} • Số lượng: <strong className="text-dark">x{item.quantity}</strong>
                                </span>
                            </div>
                        </div>

                        <div className="text-sm-end ms-sm-3 ps-sm-3 border-sm-start flex-shrink-0">
                            <span className="d-block fs-8 text-muted fw-bold text-uppercase">Thành tiền</span>
                            <strong className="fs-6 fw-bold text-dark">
                                {formatPrice(item.price * item.quantity)}
                            </strong>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
