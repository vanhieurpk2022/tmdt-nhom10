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

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/online-payment" element={<OnlinePaymentPage />} />
      </Routes>
      <Footer />
    </BrowserRouter>

  </StrictMode>,
)
