import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { Header } from './components/layout/Header';
import Footer from './components/layout/Footer';
import { BrowserRouter, Route, Routes, Outlet } from 'react-router';
import HomePage from './pages/HomePage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OnlinePaymentPage from './pages/OnlinePaymentPage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import ProfilePage from './pages/ProfilePage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import AddressBookPage from './pages/AddressBookPage';
import FavoriteProductsPage from './pages/FavoriteProductsPage';
import NotificationsPage from './pages/NotificationsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import RegisterFactoryPage from './pages/RegisterFactoryPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import VerifyRecoveryCodePage from './pages/VerifyRecoveryCodePage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import { ROUTES } from './routes/routes';
import { AuthProvider } from './api/AuthContext';
import { CartProvider } from './api/CartContext';
import { VerifyAccount } from './pages/VerifyAccount';
import RequireVerifyState from './api/RequireVerifyState';
import { VerifyEmailSuccess } from './pages/VerifyEmailSuccess';
import RequireVerifyEmail from './api/ProtectVerifyEmail';
import { Admin } from './pages/Admin';
import WorkshopManagement from './pages/WorkshopManagement';
import UserManager from './pages/UserManager';
import AdminOrder from './pages/AdminOrder';
import { AdminSale } from './pages/AdminSale';
import { AdminSupport } from './pages/AdminSupport';
import { FactoryDashBoard } from './pages/FactoryDashBoard';
import FactoryProfile from './pages/FactoryProfile';
import FactorySupport from './pages/FactorySupport';
import FactoryOrder from './pages/FactoryOrder';
import FactorySale from './pages/FactorySale';
import FactoryProductPage from './pages/FactoryProduct';
import FactoryStaff from './pages/FactoryStaff';


const MainLayout = () => (
  <>
    <Header />
    <Outlet />
    <Footer />
  </>
);

createRoot(document.getElementById('root')!).render(
  <StrictMode>

    <BrowserRouter>
      <AuthProvider>


        <Routes>
          <Route path={ROUTES.FACTORY_DASHBOARD} element={<FactoryDashBoard />} />
          <Route path={ROUTES.FACTORY_PROFILE} element={<FactoryProfile />} />
          <Route path={ROUTES.FACTORY_SUPPORT} element={<FactorySupport />} />
          <Route path={ROUTES.FACTORY_ORDER} element={<FactoryOrder />} />
          <Route path={ROUTES.FACTORY_PRODUCT} element={<FactoryProductPage />} />
          <Route path={ROUTES.FACTORY_STAFF} element={<FactoryStaff />} />
          <Route path={ROUTES.FACTORY_SALE} element={<FactorySale />} />

          <Route path={ROUTES.AdMIN_SALE} element={<AdminSale />} />
          <Route path={ROUTES.ADMIN_DASHBOARD} element={<Admin />} />
          <Route path={ROUTES.ADMIN_WORKSHOP} element={<WorkshopManagement />} />
          <Route path={ROUTES.ADMIN_CUSTOMER} element={<UserManager />} />
          <Route path={ROUTES.ADMIN_ORDER} element={<AdminOrder />} />
          <Route path={ROUTES.ADMIN_SUPPORT} element={<AdminSupport />} />
        </Routes>
        <CartProvider>
          <Routes>

            <Route element={<MainLayout />}>
              <Route path={ROUTES.HOME} element={<HomePage />} />
              <Route path={ROUTES.CART} element={<CartPage />} />
              <Route path={ROUTES.PRODUCTS} element={<ProductsPage />} />
              <Route path={ROUTES.CHECKOUT} element={<CheckoutPage />} />
              <Route path={ROUTES.ONLINE_PAYMENT} element={<OnlinePaymentPage />} />
              <Route path={ROUTES.ORDER_SUCCESS} element={<OrderSuccessPage />} />
              <Route path={ROUTES.ORDERS} element={<OrderHistoryPage />} />
              <Route path={ROUTES.PRODUCT_DETAIL} element={<ProductDetailPage />} />
              <Route path={`${ROUTES.PRODUCT_DETAIL}/:id`} element={<ProductDetailPage />} />
              <Route path={ROUTES.PROFILE} element={<ProfilePage />} />
              <Route path={ROUTES.CHANGE_PASSWORD} element={<ChangePasswordPage />} />
              <Route path={ROUTES.ADDRESSES} element={<AddressBookPage />} />
              <Route path={ROUTES.FAVORITES} element={<FavoriteProductsPage />} />
              <Route path={ROUTES.NOTIFICATIONS} element={<NotificationsPage />} />
              <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
              <Route path={ROUTES.REGISTER_FACTORY} element={<RegisterFactoryPage />} />
              <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
              <Route path={ROUTES.VERIFY_RECOVERY} element={<VerifyRecoveryCodePage />} />
              <Route path={ROUTES.RESET_PASSWORD} element={<ResetPasswordPage />} />
              <Route path={ROUTES.LOGIN} element={<LoginPage />} />
              <Route element={<RequireVerifyEmail />} >
                <Route path={ROUTES.VERIFY_SUCCESS} element={<VerifyEmailSuccess />} />
              </Route>
              <Route element={<RequireVerifyState />} >
                <Route path={ROUTES.VERIFY_ACCOUNT} element={<VerifyAccount />} />
              </Route>

            </Route>

          </Routes>
        </CartProvider>
      </AuthProvider>


    </BrowserRouter>

  </StrictMode>,
)
