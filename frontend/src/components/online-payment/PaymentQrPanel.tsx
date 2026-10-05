import { faClock, faQrcode, faShieldHalved } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { onlinePaymentInfo } from "../../data/onlinePaymentData";

export default function PaymentQrPanel() {
    return (
        <section className="online-payment-qr-card">
            <div className="online-payment-status">
                <span>
                    <FontAwesomeIcon icon={faClock} />
                </span>
                <div>
                    <strong>Đang chờ thanh toán</strong>
                    <p>Vui lòng hoàn tất giao dịch trước khi mã QR hết hạn.</p>
                </div>
            </div>

            <div className="online-payment-qr-box" aria-label="Mã QR thanh toán">
                <div className="online-payment-qr-grid">
                    {Array.from({ length: 81 }).map((_, index) => (
                        <span className={index % 2 === 0 || index % 7 === 0 || index % 13 === 0 ? "active" : ""} key={index} />
                    ))}
                </div>
                <div className="online-payment-qr-center">
                    <FontAwesomeIcon icon={faQrcode} />
                </div>
            </div>

            <div className="online-payment-countdown">
                <span>Còn lại</span>
                <strong>
                    {onlinePaymentInfo.expiredInMinutes}:{String(onlinePaymentInfo.expiredInSeconds).padStart(2, "0")}
                </strong>
            </div>

            <div className="online-payment-security">
                <FontAwesomeIcon icon={faShieldHalved} />
                Giao dịch được bảo mật bằng mã hóa SSL 256-bit
            </div>
        </section>
    );
}
