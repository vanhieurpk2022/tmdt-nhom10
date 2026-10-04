import {
    faFacebook,
    faInstagram,
    faLinkedin,
    faTwitter,
} from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router";

export default function FooterSubscribe() {
    return (
        <div>
            <h6 className="fw-semibold footer-title">Nhận ưu đãi mới</h6>

            <div className="input-group input-group-sm mb-3">
                <input type="email" className="form-control" placeholder="Email của bạn" />
                <button className="btn btn-warning" type="button">
                    Gửi
                </button>
            </div>

            <div className="d-flex align-items-center gap-3">
                <Link to="#" className="text-primary">
                    <FontAwesomeIcon icon={faFacebook} />
                </Link>
                <Link to="#" className="text-info">
                    <FontAwesomeIcon icon={faTwitter} />
                </Link>
                <Link to="#" className="text-danger">
                    <FontAwesomeIcon icon={faInstagram} />
                </Link>
                <Link to="#" className="text-primary">
                    <FontAwesomeIcon icon={faLinkedin} />
                </Link>
            </div>
        </div>
    );
}
