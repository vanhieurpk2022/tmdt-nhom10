import { faCommentDots, faLocationDot, faPenToSquare, faPhone, faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link, useLocation } from "react-router";
import type { AddressItem } from "../../api/AddressService";
import { ROUTES } from "../../routes/routes";

interface ShippingInfoProps {
    address: AddressItem | null;
    deliveryNote: string;
    isLoading?: boolean;
    onDeliveryNoteChange: (note: string) => void;
}

function formatAddress(address: AddressItem) {
    return [address.street, address.ward, address.district, address.city]
        .filter(Boolean)
        .join(", ");
}

export default function ShippingInfo({
    address,
    deliveryNote,
    isLoading = false,
    onDeliveryNoteChange,
}: ShippingInfoProps) {
    const location = useLocation();
    const returnTo = encodeURIComponent(`${location.pathname}${location.search}`);

    return (
        <section className="bg-white rounded-4 border shadow-sm p-4 mb-4" aria-labelledby="shipping-info-title">
            {/* Header mục giao hàng */}
            <div className="d-flex flex-wrap align-items-center justify-content-between pb-3 mb-3 border-bottom gap-2">
                <div className="d-flex align-items-center gap-2.5">
                    <div className="rounded-circle d-flex align-items-center justify-content-center bg-primary bg-opacity-10 text-primary fw-bold" style={{ width: "32px", height: "32px", fontSize: "14px" }}>
                        1
                    </div>
                    <div>
                        <h2 id="shipping-info-title" className="h6 fw-bold text-dark mb-0">
                            Địa chỉ giao nhận
                        </h2>
                        <span className="text-muted" style={{ fontSize: "12.5px" }}>Thông tin liên hệ & nơi nhận hàng</span>
                    </div>
                </div>

                <Link
                    className="btn btn-outline-secondary btn-sm rounded-pill px-3 py-1.5 fw-semibold d-inline-flex align-items-center gap-1.5 hover-border-dark"
                    style={{ fontSize: "12.5px" }}
                    to={`${ROUTES.ADDRESSES}?returnTo=${returnTo}`}
                >
                    <FontAwesomeIcon icon={faPenToSquare} className="fs-8" />
                    <span>Thay đổi địa chỉ</span>
                </Link>
            </div>

            {isLoading && (
                <div className="p-4 rounded-3 bg-light text-center text-muted" style={{ fontSize: "13px" }}>
                    <div className="spinner-border spinner-border-sm text-primary me-2" role="status" aria-hidden="true" />
                    <span>Đang tải thông tin địa chỉ giao hàng…</span>
                </div>
            )}

            {!isLoading && !address && (
                <div className="p-4 rounded-3 bg-light text-center border">
                    <p className="fw-bold text-dark mb-1" style={{ fontSize: "14px" }}>Chưa có địa chỉ giao hàng</p>
                    <p className="text-muted mb-3" style={{ fontSize: "13px" }}>Vui lòng thêm địa chỉ nhận hàng để tính phí vận chuyển chính xác.</p>
                    <Link to={`${ROUTES.ADDRESSES}?returnTo=${returnTo}`} className="btn btn-primary btn-sm rounded-pill px-3.5 py-1.5 fw-semibold text-white" style={{ backgroundColor: "var(--color-primary, #e11d48)", borderColor: "var(--color-primary, #e11d48)" }}>
                        + Thêm địa chỉ mới
                    </Link>
                </div>
            )}

            {!isLoading && address && (
                <div className="p-3.5 rounded-3 bg-light bg-opacity-60 border mb-3">
                    <div className="row g-2 align-items-center mb-2">
                        <div className="col-12 col-sm-6 d-flex align-items-center gap-2">
                            <FontAwesomeIcon icon={faUser} className="text-secondary fs-8" />
                            <span className="text-muted" style={{ fontSize: "13px" }}>Người nhận:</span>
                            <strong className="text-dark" style={{ fontSize: "14px" }}>{address.recipentName}</strong>
                        </div>
                        <div className="col-12 col-sm-6 d-flex align-items-center gap-2">
                            <FontAwesomeIcon icon={faPhone} className="text-secondary fs-8" />
                            <span className="text-muted" style={{ fontSize: "13px" }}>Điện thoại:</span>
                            <strong className="text-dark" style={{ fontSize: "14px" }}>{address.phoneNumber}</strong>
                        </div>
                    </div>

                    <div className="d-flex align-items-start gap-2 pt-2 border-top">
                        <FontAwesomeIcon icon={faLocationDot} className="text-danger mt-1 fs-7 flex-shrink-0" />
                        <span className="text-secondary" style={{ fontSize: "13.5px", lineHeight: "1.5" }}>
                            {formatAddress(address)}
                        </span>
                    </div>
                </div>
            )}

            {/* Ghi chú giao hàng */}
            <div className="pt-2">
                <label htmlFor="delivery-note" className="form-label d-flex align-items-center gap-1.5 fw-semibold text-dark mb-1.5" style={{ fontSize: "13px" }}>
                    <FontAwesomeIcon icon={faCommentDots} className="text-muted" />
                    <span>Ghi chú đơn hàng (không bắt buộc)</span>
                </label>
                <textarea
                    id="delivery-note"
                    className="form-control rounded-3"
                    style={{ fontSize: "13px" }}
                    maxLength={255}
                    rows={2}
                    value={deliveryNote}
                    onChange={(event) => onDeliveryNoteChange(event.target.value)}
                    placeholder="Ví dụ: Giao trong giờ hành chính, gọi trước khi giao…"
                />
                <span className="text-muted d-block text-end mt-1" style={{ fontSize: "11px" }}>{deliveryNote.length}/255 ký tự</span>
            </div>
        </section>
    );
}
