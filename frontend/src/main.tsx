import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { Header } from './components/layout/Header';
import Footer from './components/layout/Footer';
import { BrowserRouter, Route, Routes } from 'react-router';
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

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/online-payment" element={<OnlinePaymentPage />} />
        <Route path="/order-success" element={<OrderSuccessPage />} />
        <Route path="/orders" element={<OrderHistoryPage />} />
        <Route path="/product-detail" element={<ProductDetailPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/change-password" element={<ChangePasswordPage />} />
        <Route path="/addresses" element={<AddressBookPage />} />
        <Route path="/favorites" element={<FavoriteProductsPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/register-factory" element={<RegisterFactoryPage />} />
      </Routes>
      <Footer />
    </BrowserRouter>

  </StrictMode>,
)
