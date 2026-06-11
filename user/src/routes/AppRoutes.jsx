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
const Certificates = lazy(() => import('../pages/Certificates/Certificates'));
const Cart = lazy(() => import('../pages/Cart/Cart'));
const Wishlist = lazy(() => import('../pages/Wishlist/Wishlist'));
const SavedForLater = lazy(() => import('../pages/SavedForLater/SavedForLater'));
const CustomerOrders = lazy(() => import('../pages/CustomerOrders/CustomerOrders'));
const Menu = lazy(() => import('../pages/Menu/Menu'));
const Offers = lazy(() => import('../pages/Offers/Offers'));
const CheckoutAddress = lazy(() => import('../pages/Checkout/CheckoutAddress'));
const OrderReview = lazy(() => import('../pages/Checkout/OrderReview'));
const OrderSuccess = lazy(() => import('../pages/Checkout/OrderSuccess'));
const TrackOrder = lazy(() => import('../pages/Orders/TrackOrder'));
const OrderDetails = lazy(() => import('../pages/Orders/OrderDetails'));

const AppRoutes = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public Auth Routes */}
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
        <Route path="/verify-otp" element={<PublicRoute><OTPVerification /></PublicRoute>} />

        {/* Public Customer Routes */}
        <Route path="/" element={<CustomerHome />} />
        <Route path="/home" element={<Navigate to="/" replace />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/ready-to-eat" element={<ReadyToEat />} />
        <Route path="/ready-to-cook" element={<ReadyToCook />} />
        <Route path="/batter-products" element={<BatterProducts />} />
        <Route path="/bulk-orders" element={<BulkOrders />} />
        <Route path="/certificates" element={<Certificates />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/offers" element={<Offers />} />

        {/* Protected Customer Routes */}
        <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
        <Route path="/checkout/address" element={<ProtectedRoute><CheckoutAddress /></ProtectedRoute>} />
        <Route path="/checkout/review" element={<ProtectedRoute><OrderReview /></ProtectedRoute>} />
        <Route path="/order-success" element={<ProtectedRoute><OrderSuccess /></ProtectedRoute>} />
        <Route path="/track-order/:id" element={<ProtectedRoute><TrackOrder /></ProtectedRoute>} />
        <Route path="/order/:id" element={<ProtectedRoute><OrderDetails /></ProtectedRoute>} />
        <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
        <Route path="/saved-for-later" element={<ProtectedRoute><SavedForLater /></ProtectedRoute>} />
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
        <Route path="*" element={<CustomerHome />} />
      </Routes>
    </Suspense>
  );
};
export default AppRoutes;
