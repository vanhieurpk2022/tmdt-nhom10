import { faBox, faCircleInfo, faComment, faGear, faHeart, faRightFromBracket, faSadTear, faSignature, faUser, } from "@fortawesome/free-solid-svg-icons";
import UserMenuItem from "./UserMenuItem/UserMenuItem";
import UserNav from "./UserMenuItem/UserNav";
import { authService } from "../../../api/AuthService";
import { useNavigate } from "react-router";
import { ROUTES } from "../../../routes/routes";
import { useAuth } from "../../../api/AuthContext";

interface UserMenuProps {
    fullname: string;
    avatar?: string;
    email: string;
    roles: string[];
}

export default function UserMenu({ fullname, avatar, email, roles }: UserMenuProps) {
    const navigate = useNavigate();
    const { setUser } = useAuth();
    const handleLogout = async () => {
        setUser(null);
        navigate(ROUTES.HOME, { replace: true });

        try {
            await authService.logout();
        } catch (error) {
            console.error("Đăng xuất thất bại:", error);
        }
    };

    return (
        <div className="dropdown">
            <UserNav fullname={fullname} email={email} avatar={avatar} />
            <ul className="dropdown-menu rounded-5 dropdown-menu-end user-dropdown-menu" style={{ width: "355px", height: "555px" }}>
                <UserMenuItem to={ROUTES.PROFILE} icon={faUser} content="Hồ sơ cá nhân" active />
                <UserMenuItem to={ROUTES.ORDERS} icon={faBox} content="Đơn hàng của tôi" badge="3 đang giao" />
                {roles.some(role => role === "FACTORY") && <UserMenuItem to={ROUTES.FACTORY_DASHBOARD} icon={faSadTear} content="Quản lí xưởng" />}
                {!roles.some(role => role === "FACTORY") && (
                    <UserMenuItem
                        to={ROUTES.FACTORY_FORM}
                        icon={faSignature}
                        content="Đăng kí bán hàng"
                    />
                )}
                <UserMenuItem to={ROUTES.FAVORITES} icon={faHeart} content="Sản phẩm yêu thích" />
                <UserMenuItem to={ROUTES.CHANGE_PASSWORD} icon={faGear} content="Cài đặt tài khoản" />
                <UserMenuItem to="#" icon={faCircleInfo} content="Trung tâm hỗ trợ" badge="24/7" />
                <UserMenuItem to="" action={handleLogout} icon={faRightFromBracket} content="Đăng xuất" danger />
            </ul>
        </div>
    );
}
