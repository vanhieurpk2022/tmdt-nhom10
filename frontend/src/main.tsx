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
import VerifyEmailPage from './pages/VerifyEmailPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import VerifyRecoveryCodePage from './pages/VerifyRecoveryCodePage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import { ROUTES } from './routes/routes';
import { AuthProvider } from './api/AuthContext';

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
          <Route element={<MainLayout />}>
            <Route path={ROUTES.HOME} element={<HomePage />} />
            <Route path={ROUTES.CART} element={<CartPage />} />
            <Route path={ROUTES.PRODUCTS} element={<ProductsPage />} />
            <Route path={ROUTES.CHECKOUT} element={<CheckoutPage />} />
            <Route path={ROUTES.ONLINE_PAYMENT} element={<OnlinePaymentPage />} />
            <Route path={ROUTES.ORDER_SUCCESS} element={<OrderSuccessPage />} />
            <Route path={ROUTES.ORDERS} element={<OrderHistoryPage />} />
            <Route path={ROUTES.PRODUCT_DETAIL} element={<ProductDetailPage />} />
            <Route path={ROUTES.PROFILE} element={<ProfilePage />} />
            <Route path={ROUTES.CHANGE_PASSWORD} element={<ChangePasswordPage />} />
            <Route path={ROUTES.ADDRESSES} element={<AddressBookPage />} />
            <Route path={ROUTES.FAVORITES} element={<FavoriteProductsPage />} />
            <Route path={ROUTES.NOTIFICATIONS} element={<NotificationsPage />} />
            <Route path={ROUTES.LOGIN} element={<LoginPage />} />
            <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
            <Route path={ROUTES.REGISTER_FACTORY} element={<RegisterFactoryPage />} />
            <Route path={ROUTES.VERIFY_EMAIL} element={<VerifyEmailPage />} />
            <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
            <Route path={ROUTES.VERIFY_RECOVERY} element={<VerifyRecoveryCodePage />} />
            <Route path={ROUTES.RESET_PASSWORD} element={<ResetPasswordPage />} />
          </Route>


        </Routes>
      </AuthProvider>


    </BrowserRouter>

  </StrictMode>,
)
