import { faUser } from "@fortawesome/free-solid-svg-icons";
import Cart from "./header/Cart";
import LogoHeader from "./header/LogoHeader";
import NavItem from "./header/NavItem";
import { NonLogin } from "./header/NonLogin";
import NotifyAbove from "./header/NotifyAbove";
import SearchBox from "./header/SearchBox";
import UserMenu from "./header/UserMenu";
import { ROUTES } from "../../routes/routes";
import { useEffect, useState } from "react";
import { useAuth, type UserResponse } from "../../api/AuthContext";
import { authService } from "../../api/AuthService";



export function Header() {
    const { user, setUser, setIsAuthenticated } = useAuth();
    const cart = {
        quantity: 3,
        total: 189,
    };

    useEffect(() => {
        const loadUser = async () => {
            try {
                const res = await authService.getCurrentUser();

                if (res.status == 200) {
                    setUser(res.data);
                    setIsAuthenticated(true);
                }
            } catch (error) {
                setUser(null);
                setIsAuthenticated(false);
            }
        };
        loadUser();
    }, [])
    return (
        <>
            <NotifyAbove firstContent="Free Shipping on orders over $150" secondContent="Sử dụng mã: TINHDAU10 giảm 10%" />

            <div className="bg-white site-header">
                <div className="container-fluid px-4 px-lg-5 d-flex align-items-center site-header-inner">
                    <div className="flex-shrink-0 me-4">
                        <LogoHeader logo="" branch="Oilia" />
                    </div>

                    <nav className="d-flex align-items-center gap-3 gap-xl-4 flex-shrink-0 site-nav" aria-label="Điều hướng chính">
                        <NavItem href={ROUTES.HOME} content="Trang Chủ" active />
                        <NavItem href={ROUTES.PRODUCTS} content="Sản phẩm" />
                        <NavItem href={ROUTES.HOME} content="Xưởng" />
                        <NavItem href={ROUTES.HOME} content="Ưu đãi" />
                    </nav>

                    <div className="flex-grow-1 d-flex justify-content-center px-4 site-search-wrap">
                        <div className="site-search-box">
                            <SearchBox PlaceHolder="Tìm kiếm tinh dầu, thương hiệu..." />
                        </div>
                    </div>

                    <div className="d-flex align-items-center gap-4 flex-shrink-0 site-user-actions">
                        {user ? (<UserMenu fullname={user.fullName} email={user.email} avatar={user.avatar} />)
                            :
                            (<NonLogin avatar={faUser} />)
                        }


                        <span className="site-header-divider" />
                        <Cart quantity={cart.quantity} total={cart.total} />
                    </div>


                </div>
            </div>
        </>
    );
}
