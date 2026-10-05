import { useMemo, useState } from "react";
import { Link } from "react-router";
import OrderHistoryFilters, { type OrderHistoryFilter } from "../components/order-history/OrderHistoryFilters";
import OrderHistoryHero from "../components/order-history/OrderHistoryHero";
import OrderHistoryList from "../components/order-history/OrderHistoryList";
import { orderHistoryItems } from "../data/orderHistoryData";
import "../css/pages/profile.css";

export default function OrderHistoryPage() {
    const [activeFilter, setActiveFilter] = useState<OrderHistoryFilter>("all");
    const [searchValue, setSearchValue] = useState("");

    const filteredOrders = useMemo(() => {
        const normalizedSearch = searchValue.trim().toLowerCase();

        return orderHistoryItems.filter((order) => {
            const matchesStatus = activeFilter === "all" || order.status === activeFilter;
            const matchesSearch =
                normalizedSearch.length === 0 ||
                order.code.toLowerCase().includes(normalizedSearch) ||
                order.products.some((product) => product.name.toLowerCase().includes(normalizedSearch));

            return matchesStatus && matchesSearch;
        });
    }, [activeFilter, searchValue]);

    return (
        <main className="profile-page bg-light py-4">
            <div className="container-fluid px-4 px-lg-5">
                {/* Breadcrumb */}
                <nav aria-label="breadcrumb" className="mb-4">
                    <ol className="breadcrumb mb-0 fs-7">
                        <li className="breadcrumb-item"><Link to="/" className="text-muted text-decoration-none">Trang chủ</Link></li>
                        <li className="breadcrumb-item"><Link to="/profile" className="text-muted text-decoration-none">Tài khoản khách hàng</Link></li>
                        <li className="breadcrumb-item active fw-bold text-dark" aria-current="page">Đơn hàng của tôi</li>
                    </ol>
                </nav>

                {/* Header */}
                <div className="mb-4">
                    <h1 className="h2 fw-bold text-dark mb-2">Tài khoản của tôi</h1>
                    <p className="text-muted fs-7 mb-0">Quản lý thông tin cá nhân, bảo mật và các cài đặt tài khoản của bạn.</p>
                </div>

                <div className="row g-4">
                    {/* Sidebar */}
                    <div className="col-12 col-lg-3">
                        <div className="bg-white rounded-4 shadow-sm p-4">
                            {/* Profile Info */}
                            <div className="d-flex align-items-center gap-3 mb-4">
                                <div className="profile-avatar-lg bg-primary bg-opacity-10 text-primary fw-bold rounded-circle d-flex align-items-center justify-content-center flex-shrink-0">
                                    H
                                </div>
                                <div>
                                    <div className="fw-bold text-dark">Trần Bảo Hoàng</div>
                                    <div className="text-muted fs-8">Khách hàng NORDIC</div>
                                </div>
                            </div>

                            {/* Menu */}
                            <ul className="list-unstyled profile-menu mb-4">
                                <li>
                                    <Link to="/profile" className="text-decoration-none d-block px-3 py-2 rounded-3 text-muted fw-bold hover-bg-light mb-2">
                                        Hồ sơ cá nhân
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/addresses" className="text-decoration-none d-block px-3 py-2 rounded-3 text-muted fw-bold hover-bg-light mb-2">
                                        Sổ địa chỉ
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/change-password" className="text-decoration-none d-block px-3 py-2 rounded-3 text-muted fw-bold hover-bg-light mb-2">
                                        Đổi mật khẩu
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/orders" className="text-decoration-none d-block px-3 py-2 rounded-3 active fw-bold text-primary bg-primary bg-opacity-10 mb-2">
                                        Đơn hàng của tôi
                                    </Link>
                                </li>
                                <li>
                                    <Link to="#" className="text-decoration-none d-block px-3 py-2 rounded-3 text-muted fw-bold hover-bg-light mb-2">
                                        Sản phẩm yêu thích
                                    </Link>
                                </li>
                                <li>
                                    <Link to="#" className="text-decoration-none d-block px-3 py-2 rounded-3 text-muted fw-bold hover-bg-light mb-2">
                                        Thông báo
                                    </Link>
                                </li>
                            </ul>
                            
                            <hr className="text-muted opacity-25" />

                            <button className="btn btn-link text-primary text-decoration-none fw-bold px-3 w-100 text-start mt-2 p-0 logout-btn">
                                Đăng xuất
                            </button>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="col-12 col-lg-9">
                        <div className="d-flex flex-column gap-4">
                            <OrderHistoryHero orders={orderHistoryItems} />
                            
                            <OrderHistoryFilters
                                activeFilter={activeFilter}
                                orders={orderHistoryItems}
                                searchValue={searchValue}
                                onFilterChange={setActiveFilter}
                                onSearchChange={setSearchValue}
                            />
                            
                            <OrderHistoryList orders={filteredOrders} />
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
