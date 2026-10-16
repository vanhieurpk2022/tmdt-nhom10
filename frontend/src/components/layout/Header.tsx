import { faUser } from "@fortawesome/free-solid-svg-icons";
import { useLocation } from "react-router";
import Cart from "./header/Cart";
import LogoHeader from "./header/LogoHeader";
import NavItem from "./header/NavItem";
import { NonLogin } from "./header/NonLogin";
import NotifyAbove from "./header/NotifyAbove";
import SearchBox from "./header/SearchBox";
import UserMenu from "./header/UserMenu";
import { ROUTES } from "../../routes/routes";
import { useAuth } from "../../api/AuthContext";
import { useCart } from "../../api/CartContext";
import CartToast from "../cart/CartToast";

export function Header() {
    const location = useLocation();
    const pathname = location.pathname;

    const { user, loading } = useAuth();
    const { summary } = useCart();

    const isHome = pathname === ROUTES.HOME;
    const isProducts = pathname.startsWith(ROUTES.PRODUCTS) || pathname.startsWith(ROUTES.PRODUCT_DETAIL);
    const isFactories = pathname.startsWith(ROUTES.FACTORIES);
    const isCustomScent = pathname.startsWith(ROUTES.CUSTOM_SCENT);

    return (
        <>
            <CartToast />
            <NotifyAbove firstContent="Free Shipping on orders over $150" secondContent="Sử dụng mã: TINHDAU10 giảm 10%" />

            <div className="bg-white site-header">
                <div className="container-fluid px-4 px-lg-5 d-flex align-items-center site-header-inner">
                    <div className="flex-shrink-0 me-4">
                        <LogoHeader logo="" branch="Oilia" />
                    </div>

                    <nav className="d-flex align-items-center gap-3 gap-xl-4 flex-shrink-0 site-nav" aria-label="Điều hướng chính">
                        <NavItem href={ROUTES.HOME} content="Trang Chủ" active={isHome} />
                        <NavItem href={ROUTES.PRODUCTS} content="Sản phẩm" active={isProducts} />
                        <NavItem href={ROUTES.CUSTOM_SCENT} content="Phối hương" active={isCustomScent} />
                        <NavItem href={ROUTES.FACTORIES} content="Xưởng" active={isFactories} />
                        <NavItem href={ROUTES.HOME} content="Ưu đãi" />
                    </nav>

                    <div className="flex-grow-1 d-flex justify-content-center px-4 site-search-wrap">
                        <div className="site-search-box">
                            <SearchBox PlaceHolder="Tìm kiếm tinh dầu, thương hiệu..." />
                        </div>
                    </div>

                    <div className="d-flex align-items-center gap-4 flex-shrink-0 site-user-actions">
                        {loading ? (null) :
                            user ? (<UserMenu fullname={user.fullName} email={user.email} avatar={user.avatar} />)
                                :
                                (<NonLogin avatar={faUser} />)
                        }


                        <span className="site-header-divider" />
                        <Cart quantity={summary.totalItems} total={summary.total} />
                    </div>


                </div>
            </div>
        </>
    );
}
