import { faCommentDots, faPenToSquare } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { receiverInfo } from "../../data/checkoutData";
import CheckoutSectionTitle from "./CheckoutSectionTitle";

export default function ShippingInfo() {
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

            <div className="checkout-address-card">
                <div className="row g-3">
                    <div className="col-12 col-md-6">
                        <span>Tên người nhận</span>
                        <strong>{receiverInfo.name}</strong>
                    </div>
                    <div className="col-12 col-md-6">
                        <span>Số điện thoại</span>
                        <strong>{receiverInfo.phone}</strong>
                    </div>
                    <div className="col-12">
                        <span>Địa chỉ nhận hàng</span>
                        <strong>{receiverInfo.address}</strong>
                    </div>
                </div>
            </div>

            <div className="checkout-note-card d-flex align-items-center">
                <div className="checkout-note-icon d-inline-flex align-items-center justify-content-center">
                    <FontAwesomeIcon icon={faCommentDots} />
                </div>
                <div>
                    <span>Ghi chú giao hàng</span>
                    <strong>{receiverInfo.note}</strong>
                </div>
            </div>
        </section>
    );
}
