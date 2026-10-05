import {
    faBox,
    faCircleInfo,
    faComment,
    faGear,
    faHeart,
    faRightFromBracket,
    faUser,
} from "@fortawesome/free-solid-svg-icons";
import UserMenuItem from "./UserMenuItem/UserMenuItem";
import UserNav from "./UserMenuItem/UserNav";

interface UserMenuProps {
    username: string;
    avatar?: string;
    email: string;
}

export default function UserMenu({ username, avatar, email }: UserMenuProps) {
    return (
        <div className="dropdown">
            <UserNav username={username} email={email} avatar={avatar} />
            <ul className="dropdown-menu rounded-5 dropdown-menu-end user-dropdown-menu" style={{ width: "355px", height: "555px" }}>
                <UserMenuItem icon={faUser} content="Hồ sơ cá nhân" active />
                <UserMenuItem icon={faBox} content="Đơn hàng của tôi" badge="3 đang giao" />
                <UserMenuItem icon={faHeart} content="Sản phẩm yêu thích" />
                <UserMenuItem icon={faComment} content="Cộng đồng người sành" badge="Mới" />
                <UserMenuItem icon={faGear} content="Cài đặt tài khoản" />
                <UserMenuItem icon={faCircleInfo} content="Trung tâm hỗ trợ" badge="24/7" />
                <UserMenuItem icon={faRightFromBracket} content="Đăng xuất" danger />
            </ul>
        </div>
    );
}
