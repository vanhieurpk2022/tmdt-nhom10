import SearchBox from "./header/SearchBox";
import LogoHeader from "./header/LogoHeader";
import NavItem from "./header/NavItem";
import NotifyAbove from "./header/NotifyAbove";
import UserMenu from "./header/UserMenu";
import Cart from "./header/Cart";

export function Header() {

    const user = {
        username: "Minh Hậu",
        email: "minhhau@nordic.vn",
        avatar: "",
    };
    const cart = {
        quantity: 0,
        total: 0

    }

    return <>
        <NotifyAbove firstContent="Free Shipping on orders over $150" secondContent="Sử dụng mã: TINHDAU10 giảm 10%" />

        <div className="bg-white">
            <div className="container-fluid px-5 d-flex align-items-center" style={{ height: "68px" }}>
                {/* Logo */}
                <div className="flex-shrink-0 me-5">
                    <LogoHeader logo="" branch="Oilia" />
                </div>

                {/* Navigation */}
                <div className="d-flex align-items-center gap-4 flex-shrink-0">
                    <NavItem content="Tất cả" active />
                    <NavItem content="Xưởng" />
                    <NavItem content="Bộ sản phẩm" />
                    <NavItem content="Ưu đãi" />
                </div>

                {/* Search */}
                <div className="flex-grow-1 d-flex justify-content-center px-5">
                    <div style={{ width: "315px" }}>
                        <SearchBox PlaceHolder="Tìm kiếm tinh dầu, thương hiệu..." />
                    </div>
                </div>

                {/* User + Cart */}
                <div className="d-flex align-items-center gap-4 flex-shrink-0">
                    <UserMenu username={user.username} email={user.email} avatar={user.avatar} />
                    <span style={{ width: "1px", height: "20px", backgroundColor: "#ccc", }} />
                    <Cart quantity={cart.quantity} total={cart.total} />
                </div>
            </div>
        </div>

    </>
}