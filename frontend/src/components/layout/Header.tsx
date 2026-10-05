import Cart from "./header/Cart";
import LogoHeader from "./header/LogoHeader";
import NavItem from "./header/NavItem";
import NotifyAbove from "./header/NotifyAbove";
import SearchBox from "./header/SearchBox";
import UserMenu from "./header/UserMenu";

export function Header() {
    const user = {
        username: "Minh Hậu",
        email: "minhhau@nordic.vn",
        avatar: "",
    };

    const cart = {
        quantity: 0,
        total: 0,
    };

    return (
        <>
            <NotifyAbove firstContent="Free Shipping on orders over $150" secondContent="Sử dụng mã: TINHDAU10 giảm 10%" />

            <div className="bg-white site-header">
                <div className="container-fluid px-4 px-lg-5 d-flex align-items-center site-header-inner">
                    <div className="flex-shrink-0 me-4">
                        <LogoHeader logo="" branch="Oilia" />
                    </div>

                    <nav className="d-flex align-items-center gap-3 gap-xl-4 flex-shrink-0 site-nav" aria-label="Điều hướng chính">
                        <NavItem content="Trang Chủ" active />
                        <NavItem content="Sản phẩm" />
                        <NavItem content="Xưởng" />
                        <NavItem content="Ưu đãi" />
                    </nav>

                    <div className="flex-grow-1 d-flex justify-content-center px-4 site-search-wrap">
                        <div className="site-search-box">
                            <SearchBox PlaceHolder="Tìm kiếm tinh dầu, thương hiệu..." />
                        </div>
                    </div>

                    <div className="d-flex align-items-center gap-4 flex-shrink-0 site-user-actions">
                        <UserMenu username={user.username} email={user.email} avatar={user.avatar} />
                        <span className="site-header-divider" />
                        <Cart quantity={cart.quantity} total={cart.total} />
                    </div>
                </div>
            </div>
        </>
    );
}
