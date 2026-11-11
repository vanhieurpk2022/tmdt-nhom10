import { StrictMode } from 'react'
import { GoogleOAuthProvider } from '@react-oauth/google';
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
import OrderHistoryPage from './pages/OrderHistoryPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import OrderCancellationPage from './pages/OrderCancellationPage';
import VnPayResultPage from './pages/VnPayResultPage';
import PaymentReviewsPage from './pages/PaymentReviewsPage';
import RefundsPage from './pages/RefundsPage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import FactoriesPage from './pages/FactoriesPage';
import FactoryDetailPage from './pages/FactoryDetailPage';
import CustomScentPage from './pages/CustomScentPage';
import CustomScentCustomizerPage from './pages/CustomScentCustomizerPage';
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
import { AdminSidebarProvider } from './api/AdminSidebarContext';
import ProtectedRoute from './api/ProtectedRoute';
import FactoryProtectedRoute from './api/protected/FactoryProtectedRoute';
import { VerifyAccount } from './pages/VerifyAccount';
import RequireVerifyState from './api/RequireVerifyState';
import { VerifyEmailSuccess } from './pages/VerifyEmailSuccess';
import RequireVerifyEmail from './api/ProtectVerifyEmail';
import { Admin } from './pages/Admin';
import WorkshopManagement from './pages/WorkshopManagement';
import UserManager from './pages/UserManager';
import AdminOrder from './pages/AdminOrder';
import AdminProductPage from './pages/AdminProductPage';
import { AdminSale } from './pages/AdminSale';
import { AdminSupport } from './pages/AdminSupport';
import { FactoryDashBoard } from './pages/FactoryDashBoard';
import FactoryProfile from './pages/FactoryProfile';
import FactorySupport from './pages/FactorySupport';
import FactoryOrder from './pages/FactoryOrder';
import FactorySale from './pages/FactorySale';
import FactoryStaff from './pages/FactoryStaff';
import { RegisterFactoryForm } from './pages/RegisterFactoryForm';
import { FactoryProductDetails } from './components/admin/factory/product-variant/FactoryProductDetails';
import { ToastProvider } from './components/toasts/ToastContext';
import FactoryProductPage from './pages/FactoryProductPage';
import { Chatbot } from './components/chatbot';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'dummy-google-client-id';

const MainLayout = () => (
  <>
    <Header />
    <Outlet />
    <Footer />
    <Chatbot />
  </>
);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <ToastProvider>
              <AdminSidebarProvider>
                <Routes>
                  {/* Dashboard routes without MainLayout */}
                  <Route path={ROUTES.FACTORY_DASHBOARD} element={<FactoryProtectedRoute><FactoryDashBoard /></FactoryProtectedRoute>} />
                  <Route path={ROUTES.FACTORY_PROFILE} element={<FactoryProtectedRoute><FactoryProfile /></FactoryProtectedRoute>} />
                  <Route path={ROUTES.FACTORY_SUPPORT} element={<FactoryProtectedRoute><FactorySupport /></FactoryProtectedRoute>} />
                  <Route path={ROUTES.FACTORY_ORDER} element={<FactoryProtectedRoute><FactoryOrder /></FactoryProtectedRoute>} />
                  <Route path={ROUTES.FACTORY_PRODUCT} element={<FactoryProtectedRoute><FactoryProductPage /></FactoryProtectedRoute>} />
                  <Route path={ROUTES.FACTORY_STAFF} element={<FactoryProtectedRoute><FactoryStaff /></FactoryProtectedRoute>} />
                  <Route path={ROUTES.FACTORY_SALE} element={<FactoryProtectedRoute><FactorySale /></FactoryProtectedRoute>} />
                  <Route path={`${ROUTES.FACTORY_PRODUCT_DETAILS}/:id`} element={<FactoryProtectedRoute><FactoryProductDetails /></FactoryProtectedRoute>} />

                  <Route path={ROUTES.AdMIN_SALE} element={<ProtectedRoute requiredRole="ADMIN"><AdminSale /></ProtectedRoute>} />
                  <Route path={ROUTES.ADMIN_DASHBOARD} element={<ProtectedRoute requiredRole="ADMIN"><Admin /></ProtectedRoute>} />
                  <Route path={ROUTES.ADMIN_WORKSHOP} element={<ProtectedRoute requiredRole="ADMIN"><WorkshopManagement /></ProtectedRoute>} />
                  <Route path={ROUTES.ADMIN_CUSTOMER} element={<ProtectedRoute requiredRole="ADMIN"><UserManager /></ProtectedRoute>} />
                  <Route path={ROUTES.ADMIN_ORDER} element={<ProtectedRoute requiredRole="ADMIN"><AdminOrder /></ProtectedRoute>} />
                  <Route path={ROUTES.ADMIN_PRODUCT} element={<ProtectedRoute requiredRole="ADMIN"><AdminProductPage /></ProtectedRoute>} />
                  <Route path="/admin-products" element={<ProtectedRoute requiredRole="ADMIN"><AdminProductPage /></ProtectedRoute>} />
                  <Route path="/admin/products" element={<ProtectedRoute requiredRole="ADMIN"><AdminProductPage /></ProtectedRoute>} />
                  <Route path="/admin/product" element={<ProtectedRoute requiredRole="ADMIN"><AdminProductPage /></ProtectedRoute>} />
                  <Route path={ROUTES.PAYMENT_REVIEWS} element={<ProtectedRoute requiredRole="ADMIN"><PaymentReviewsPage /></ProtectedRoute>} />
                  <Route path={ROUTES.REFUNDS} element={<ProtectedRoute requiredRole="ADMIN"><RefundsPage /></ProtectedRoute>} />
                  <Route path={ROUTES.ADMIN_SUPPORT} element={<ProtectedRoute requiredRole="ADMIN"><AdminSupport /></ProtectedRoute>} />

                  {/* Main shop routes with MainLayout */}
                  <Route element={<MainLayout />}>
                    <Route path={ROUTES.FACTORY_FORM} element={<ProtectedRoute><RegisterFactoryForm /></ProtectedRoute>} />
                    <Route path={ROUTES.CUSTOM_SCENT} element={<CustomScentPage />} />
                    <Route path={ROUTES.CUSTOM_SCENT_CUSTOMIZER} element={<CustomScentCustomizerPage />} />
                    <Route path={`${ROUTES.CUSTOM_SCENT_CUSTOMIZER}/:id`} element={<CustomScentCustomizerPage />} />
                    <Route path={ROUTES.HOME} element={<HomePage />} />
                    <Route path={ROUTES.CART} element={<CartPage />} />
                    <Route path={ROUTES.PRODUCTS} element={<ProductsPage />} />
                    <Route path={ROUTES.FACTORIES} element={<FactoriesPage />} />
                    <Route path={`${ROUTES.FACTORY_DETAIL}/:id`} element={<FactoryDetailPage />} />
                    <Route path={ROUTES.CHECKOUT} element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
                    <Route path={ROUTES.ORDER_SUCCESS} element={<ProtectedRoute><OrderSuccessPage /></ProtectedRoute>} />
                    <Route path={ROUTES.ORDER_DETAIL} element={<ProtectedRoute><OrderSuccessPage detail /></ProtectedRoute>} />
                    <Route path={ROUTES.ORDER_CANCEL} element={<ProtectedRoute><OrderCancellationPage /></ProtectedRoute>} />
                    <Route path={ROUTES.VNPAY_RESULT} element={<ProtectedRoute><VnPayResultPage /></ProtectedRoute>} />
                    <Route path={ROUTES.ORDERS} element={<ProtectedRoute><OrderHistoryPage /></ProtectedRoute>} />
                    <Route path={ROUTES.PRODUCT_DETAIL} element={<ProductDetailPage />} />
                    <Route path={`${ROUTES.PRODUCT_DETAIL}/:id`} element={<ProductDetailPage />} />
                    <Route path={ROUTES.PROFILE} element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                    <Route path={ROUTES.CHANGE_PASSWORD} element={<ProtectedRoute><ChangePasswordPage /></ProtectedRoute>} />
                    <Route path={ROUTES.ADDRESSES} element={<ProtectedRoute><AddressBookPage /></ProtectedRoute>} />
                    <Route path={ROUTES.FAVORITES} element={<ProtectedRoute><FavoriteProductsPage /></ProtectedRoute>} />
                    <Route path={ROUTES.NOTIFICATIONS} element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
                    <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
                    <Route path={ROUTES.REGISTER_FACTORY} element={<ProtectedRoute><RegisterFactoryPage /></ProtectedRoute>} />
                    <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
                    <Route path={ROUTES.VERIFY_RECOVERY} element={<VerifyRecoveryCodePage />} />
                    <Route path={ROUTES.RESET_PASSWORD} element={<ResetPasswordPage />} />
                    <Route path={ROUTES.LOGIN} element={<LoginPage />} />
                    <Route element={<RequireVerifyEmail />}>
                      <Route path={ROUTES.VERIFY_SUCCESS} element={<VerifyEmailSuccess />} />
                    </Route>
                    <Route element={<RequireVerifyState />}>
                      <Route path={ROUTES.VERIFY_ACCOUNT} element={<VerifyAccount />} />
                    </Route>
                  </Route>
                </Routes>
              </AdminSidebarProvider>
            </ToastProvider>
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  </StrictMode>,
)
