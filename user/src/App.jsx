import React from 'react';
import { BrowserRouter, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import AppRoutes from './routes/AppRoutes';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ModalHost from './components/ModalHost';
import OfferPopup from './components/OfferPopup';
import './App.css';

function AppContent() {
  const location = useLocation();
  const { token, user } = useAuth();
  const authRoutes = ['/login', '/register', '/forgot-password', '/verify-otp', '/complete-profile'];
  const isAuthPage = authRoutes.includes(location.pathname);
  // Show main layout on all non-auth pages so Footer and modal work for public users
  const showMainLayout = !isAuthPage;

  return (
    <div className="app-shell">
      {showMainLayout && <Navbar />}
      <main className="main-content">
        <AppRoutes />
      </main>
      {showMainLayout && <Footer />}
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
