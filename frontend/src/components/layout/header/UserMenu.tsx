import { faBox, faCircleInfo, faComment, faGear, faHeart, faRightFromBracket, faUser, } from "@fortawesome/free-solid-svg-icons";
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
}

export default function UserMenu({ fullname, avatar, email }: UserMenuProps) {
    const navigate = useNavigate();
    const { setUser, setIsAuthenticated } = useAuth();
    const handleLogout = async () => {
        try {
            await authService.logout();
            setUser(null);
            setIsAuthenticated(false);
            navigate(ROUTES.HOME);
        } catch (error) {
            console.error("Đăng xuất thất bại:", error);
        }
    };

    return (
        <div className="dropdown">
            <UserNav fullname={fullname} email={email} avatar={avatar} />
            <ul className="dropdown-menu rounded-5 dropdown-menu-end user-dropdown-menu" style={{ width: "355px", height: "555px" }}>
                <UserMenuItem to="#" icon={faUser} content="Hồ sơ cá nhân" active />
                <UserMenuItem to="#" icon={faBox} content="Đơn hàng của tôi" badge="3 đang giao" />
                <UserMenuItem to="#" icon={faHeart} content="Sản phẩm yêu thích" />
                <UserMenuItem to="#" icon={faComment} content="Cộng đồng người sành" badge="Mới" />
                <UserMenuItem to="#" icon={faGear} content="Cài đặt tài khoản" />
                <UserMenuItem to="#" icon={faCircleInfo} content="Trung tâm hỗ trợ" badge="24/7" />
                <UserMenuItem to="" action={handleLogout} icon={faRightFromBracket} content="Đăng xuất" danger />
            </ul>
        </div>
    );
}
