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
            {/* Header mục giao hàng - Sạch sẽ, không icon vòng tròn rườm rà */}
            <div className="d-flex flex-wrap align-items-center justify-content-between pb-3 mb-3 border-bottom gap-2">
                <div>
                    <h2 id="shipping-info-title" className="h6 fw-bold text-dark mb-0.5">
                        Địa chỉ giao nhận
                    </h2>
                    <span className="text-muted" style={{ fontSize: "12.5px" }}>Thông tin liên hệ & nơi nhận hàng</span>
                </div>

                <Link
                    className="btn btn-outline-secondary btn-sm rounded-pill px-3 py-1.5 fw-semibold d-inline-flex align-items-center hover-border-dark"
                    style={{ fontSize: "12.5px" }}
                    to={`${ROUTES.ADDRESSES}?returnTo=${returnTo}`}
                >
                    Thay đổi địa chỉ
                </Link>
            </div>

            {isLoading && (
                <div className="p-3 text-center text-muted" style={{ fontSize: "13px" }}>
                    <div className="spinner-border spinner-border-sm text-primary me-2" role="status" aria-hidden="true" />
                    <span>Đang tải thông tin địa chỉ giao hàng…</span>
                </div>
            )}

            {!isLoading && !address && (
                <div className="p-4 rounded-3 text-center border">
                    <p className="fw-bold text-dark mb-1" style={{ fontSize: "14px" }}>Chưa có địa chỉ giao hàng</p>
                    <p className="text-muted mb-3" style={{ fontSize: "13px" }}>Vui lòng thêm địa chỉ nhận hàng để tính phí vận chuyển chính xác.</p>
                    <Link to={`${ROUTES.ADDRESSES}?returnTo=${returnTo}`} className="btn btn-primary btn-sm rounded-pill px-3.5 py-1.5 fw-semibold text-white" style={{ backgroundColor: "var(--color-primary, #e11d48)", borderColor: "var(--color-primary, #e11d48)" }}>
                        + Thêm địa chỉ mới
                    </Link>
                </div>
            )}

            {/* Thông tin địa chỉ tự nhiên, thoáng đãng - không đóng khung kẻ bảng */}
            {!isLoading && address && (
                <div className="mb-4">
                    <div className="d-flex flex-wrap align-items-center gap-2 mb-1.5">
                        <strong className="text-dark fw-bold" style={{ fontSize: "14.5px" }}>
                            {address.recipentName}
                        </strong>
                        <span className="text-muted">•</span>
                        <span className="text-secondary fw-semibold" style={{ fontSize: "13.5px" }}>
                            {address.phoneNumber}
                        </span>
                    </div>
                    <p className="text-muted mb-0" style={{ fontSize: "13.5px", lineHeight: "1.5" }}>
                        {formatAddress(address)}
                    </p>
                </div>
            )}

            {/* Ghi chú giao hàng - Nhãn văn bản rõ ràng, không dính icon */}
            <div className="pt-2">
                <label htmlFor="delivery-note" className="form-label fw-semibold text-dark mb-1.5" style={{ fontSize: "13px" }}>
                    Ghi chú đơn hàng (không bắt buộc)
                </label>
                <textarea
                    id="delivery-note"
                    className="form-control rounded-3"
                    style={{ fontSize: "13px", padding: "10px 14px" }}
                    maxLength={255}
                    rows={2}
                    value={deliveryNote}
                    onChange={(event) => onDeliveryNoteChange(event.target.value)}
                    placeholder="Ví dụ: Giao trong giờ hành chính, gọi trước khi đến…"
                />
                <span className="text-muted d-block text-end mt-1" style={{ fontSize: "11px" }}>{deliveryNote.length}/255 ký tự</span>
            </div>
        </section>
    );
}
