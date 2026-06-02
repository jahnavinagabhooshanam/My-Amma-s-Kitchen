import React from 'react';
import { BrowserRouter, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import AppRoutes from './routes/AppRoutes';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import OfferPopup from './components/OfferPopup';
import './App.css';

function AppContent() {
  const location = useLocation();
  const { token, user } = useAuth();
  const authRoutes = ['/auth', '/login', '/register', '/forgot-password', '/verify-otp', '/complete-profile'];
  const isAuthPage = authRoutes.includes(location.pathname);
  const showMainLayout = !isAuthPage && token && user && user.profile_completed;

  return (
    <div className="app-shell">
      {showMainLayout && <Navbar />}
      <main className="main-content">
        <AppRoutes />
      </main>
      {showMainLayout && <Footer />}
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
