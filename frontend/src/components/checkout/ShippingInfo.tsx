import { faPenToSquare } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link, useLocation } from "react-router";
import type { AddressItem } from "../../api/AddressService";
import { ROUTES } from "../../routes/routes";
import CheckoutSectionTitle from "./CheckoutSectionTitle";

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
        <section className="checkout-block">
            <CheckoutSectionTitle
                index={2}
                title="Địa chỉ giao hàng"
                action={
                    <Link className="btn checkout-change-btn" to={`${ROUTES.ADDRESSES}?returnTo=${returnTo}`}>
                        <FontAwesomeIcon icon={faPenToSquare} />
                        {address ? "Thay đổi" : "Thêm địa chỉ"}
                    </Link>
                }
            />

            {isLoading && (
                <div className="checkout-address-card checkout-empty-state">
                    <div className="spinner-border spinner-border-sm text-danger" role="status" aria-hidden="true" />
                    <span>Đang tải địa chỉ giao hàng...</span>
                </div>
            )}

            {!isLoading && !address && (
                <div className="checkout-address-card checkout-empty-state">
                    <strong>Chưa có địa chỉ giao hàng</strong>
                    <span>Vui lòng thêm địa chỉ trong sổ địa chỉ trước khi đặt hàng.</span>
                </div>
            )}

            {!isLoading && address && (
                <div className="checkout-address-card">
                    <div className="row g-3">
                        <div className="col-12 col-md-6">
                            <span>Tên người nhận</span>
                            <strong>{address.recipentName}</strong>
                        </div>
                        <div className="col-12 col-md-6">
                            <span>Số điện thoại</span>
                            <strong>{address.phoneNumber}</strong>
                        </div>
                        <div className="col-12">
                            <span>Địa chỉ nhận hàng</span>
                            <strong>{formatAddress(address)}</strong>
                        </div>
                    </div>
                </div>
            )}

            <div className="checkout-note-card">
                <label htmlFor="delivery-note">Ghi chú giao hàng</label>
                <textarea
                    id="delivery-note"
                    className="form-control checkout-note-input"
                    maxLength={255}
                    rows={2}
                    value={deliveryNote}
                    onChange={(event) => onDeliveryNoteChange(event.target.value)}
                    placeholder="Ví dụ: Giao trong giờ hành chính, gọi trước khi đến."
                />
                <small>{deliveryNote.length}/255 ký tự</small>
            </div>
        </section>
    );
}
