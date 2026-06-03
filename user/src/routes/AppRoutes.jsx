import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';

// Loading Fallback Component
const PageLoader = () => (
  <div style={{
    minHeight: '60vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Jost', sans-serif",
    color: 'var(--primary-color)'
  }}>
    <div style={{ 
      width: '40px', 
      height: '40px', 
      border: '4px solid var(--primary-light)', 
      borderTop: '4px solid var(--primary-color)', 
      borderRadius: '50%', 
      animation: 'spin 1s linear infinite',
      marginBottom: '15px'
    }} />
    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
    <p style={{ fontWeight: '500', fontSize: '1rem', color: 'var(--text-dark)' }}>Preparing your experience...</p>
  </div>
);

// Auth Pages (Lazy Loaded)
const AuthSplash = lazy(() => import('../pages/Auth/AuthSplash'));
const Login = lazy(() => import('../pages/Auth/Login'));
const Register = lazy(() => import('../pages/Auth/Register'));
const ForgotPassword = lazy(() => import('../pages/Auth/ForgotPassword'));
const OTPVerification = lazy(() => import('../pages/Auth/OTPVerification'));
const CompleteProfile = lazy(() => import('../pages/Auth/CompleteProfile'));
const UserProfile = lazy(() => import('../pages/Auth/UserProfile'));
const CustomerHome = lazy(() => import('../pages/Auth/CustomerHome'));

// Customer Pages (Lazy Loaded)
const Home = lazy(() => import('../pages/Home/Home'));
const ReadyToEat = lazy(() => import('../pages/ReadyToEat/ReadyToEat'));
const ReadyToCook = lazy(() => import('../pages/ReadyToCook/ReadyToCook'));
const BatterProducts = lazy(() => import('../pages/BatterProducts/BatterProducts'));
const BulkOrders = lazy(() => import('../pages/BulkOrders/BulkOrders'));
const Contact = lazy(() => import('../pages/Contact/Contact'));
const Cart = lazy(() => import('../pages/Cart/Cart'));
const Wishlist = lazy(() => import('../pages/Wishlist/Wishlist'));
const CustomerOrders = lazy(() => import('../pages/CustomerOrders/CustomerOrders'));
const Menu = lazy(() => import('../pages/Menu/Menu'));

const AppRoutes = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public Auth Routes */}
        <Route path="/auth" element={<PublicRoute><AuthSplash /></PublicRoute>} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
        <Route path="/verify-otp" element={<PublicRoute><OTPVerification /></PublicRoute>} />

        {/* Protected Customer Routes */}
        <Route path="/" element={<ProtectedRoute><CustomerHome /></ProtectedRoute>} />
        <Route path="/home" element={<ProtectedRoute><Navigate to="/" replace /></ProtectedRoute>} />
        <Route path="/menu" element={<ProtectedRoute><Menu /></ProtectedRoute>} />
        <Route path="/ready-to-eat" element={<ProtectedRoute><ReadyToEat /></ProtectedRoute>} />
        <Route path="/ready-to-cook" element={<ProtectedRoute><ReadyToCook /></ProtectedRoute>} />
        <Route path="/bulk-orders" element={<ProtectedRoute><BulkOrders /></ProtectedRoute>} />
        <Route path="/contact" element={<ProtectedRoute><Contact /></ProtectedRoute>} />
        <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
        <Route path="/checkout" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
        <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
        
        <Route path="/complete-profile" element={<ProtectedRoute><CompleteProfile /></ProtectedRoute>} />
        <Route path="/account" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Navigate to="/account" replace /></ProtectedRoute>} />
        
        <Route 
          path="/orders" 
          element={
            <ProtectedRoute allowedRoles={['customer', 'admin']}>
              <CustomerOrders />
            </ProtectedRoute>
          } 
        />

        {/* Fallback route */}
        {/* Fallback route */}
        <Route path="*" element={<ProtectedRoute><CustomerHome /></ProtectedRoute>} />
      </Routes>
    </Suspense>
  );
};
export default AppRoutes;
