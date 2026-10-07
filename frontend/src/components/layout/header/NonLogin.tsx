import type { IconProp } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router";
import { ROUTES } from "../../../routes/routes";

interface NonLoginProps {
    avatar: IconProp;
}
export function NonLogin({ avatar }: NonLoginProps) {

    return (
        <div className="d-flex align-items-center gap-3">
            <Link to={ROUTES.LOGIN} className={`d-inline-flex align-items-center gap-2 nav-item-button border-0 bg-transparent fw-bold text-decoration-none `}>
                <FontAwesomeIcon icon={avatar} />
                <span>Đăng nhập</span>
            </Link>
            <span className="site-header-divider" />

            <Link to={ROUTES.REGISTER} className="btn btn-danger rounded-pill px-3 py-1" style={{ fontSize: '14px' }}> Đăng ký </Link>
        </div>
    );
}