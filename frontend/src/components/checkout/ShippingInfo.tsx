import { faCommentDots, faPenToSquare } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { AddressItem } from "../../api/AddressService";
import CheckoutSectionTitle from "./CheckoutSectionTitle";

interface ShippingInfoProps {
    address: AddressItem | null;
    isLoading?: boolean;
}

function formatAddress(address: AddressItem) {
    return [address.street, address.ward, address.district, address.city]
        .filter(Boolean)
        .join(", ");
}

export default function ShippingInfo({ address, isLoading = false }: ShippingInfoProps) {
    return (
        <section className="checkout-block">
            <CheckoutSectionTitle
                index={2}
                title="Thông tin người nhận & Địa chỉ giao hàng"
                action={
                    <button className="btn checkout-change-btn" type="button">
                        <FontAwesomeIcon icon={faPenToSquare} />
                        Thay đổi
                    </button>
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

            <div className="checkout-note-card d-flex align-items-center">
                <div className="checkout-note-icon d-inline-flex align-items-center justify-content-center">
                    <FontAwesomeIcon icon={faCommentDots} />
                </div>
                <div>
                    <span>Ghi chú giao hàng</span>
                    <strong>Giao trong giờ hành chính, gọi trước khi đến.</strong>
                </div>
            </div>
        </section>
    );
}
