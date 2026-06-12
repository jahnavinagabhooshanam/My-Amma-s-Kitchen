import React from 'react';
import { BrowserRouter, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';
import AppRoutes from './routes/AppRoutes';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import BottomNav from './components/BottomNav';
import StickyCartSummary from './components/StickyCartSummary';
import ModalHost from './components/ModalHost';
import OfferPopup from './components/OfferPopup';
import ErrorBoundary from './components/ErrorBoundary';
import './App.css';
import './premium.css';
import './responsive.css';
function AppContent() {
  const location = useLocation();
  const { token, user } = useAuth();
  const { cartCount } = useCart();
  const authRoutes = ['/login', '/register', '/forgot-password', '/verify-otp', '/complete-profile'];
  const isAuthPage = authRoutes.includes(location.pathname);
  // Show main layout on all non-auth pages so Navbar and modal work for public users
  const showMainLayout = !isAuthPage;

  // Only show footer on specific pages as requested
  const footerRoutes = ['/', '/home', '/bulk-orders', '/certificates', '/contact'];
  const showFooter = footerRoutes.includes(location.pathname);

  const hasCart = cartCount > 0;

  return (
    <div className={`app-shell ${hasCart ? 'has-active-cart' : ''}`}>
      {showMainLayout && <Navbar />}
      <main className="main-content">
        <ErrorBoundary>
          <AppRoutes />
        </ErrorBoundary>
      </main>
      {showFooter && <Footer />}
      {showMainLayout && <StickyCartSummary />}
      {showMainLayout && <BottomNav />}
      {showMainLayout && <ModalHost />}
      {showMainLayout && <OfferPopup />}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <AppContent />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
