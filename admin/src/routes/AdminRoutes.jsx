import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

// Loading indicator for Admin panel
const AdminLoader = () => (
  <div style={{
    minHeight: '60vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "var(--font-sans, sans-serif)",
    color: 'var(--primary-color)'
  }}>
    <div style={{
      width: '45px',
      height: '45px',
      border: '4px solid #EAE6DB',
      borderTop: '4px solid var(--primary-color)',
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite',
      marginBottom: '15px'
    }} />
    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
    <p style={{ fontWeight: '600', fontSize: '1rem', color: '#6C757D' }}>Loading Control Center...</p>
  </div>
);

// Admin Pages (Lazy Loaded)
const Dashboard = lazy(() => import('../pages/Dashboard/Dashboard'));
const ReadyToEat = lazy(() => import('../pages/ReadyToEat/ReadyToEat'));
const ReadyToCook = lazy(() => import('../pages/ReadyToCook/ReadyToCook'));
const BatterProducts = lazy(() => import('../pages/BatterProducts/BatterProducts'));
const BulkOrders = lazy(() => import('../pages/BulkOrders/BulkOrders'));
const Orders = lazy(() => import('../pages/Orders/Orders'));
const Customers = lazy(() => import('../pages/Customers/Customers'));
const Inventory = lazy(() => import('../pages/Inventory/Inventory'));
const Products = lazy(() => import('../pages/Products/Products'));
const Reports = lazy(() => import('../pages/Reports/Reports'));
const Coupons = lazy(() => import('../pages/Coupons/Coupons'));
const Reviews = lazy(() => import('../pages/Reviews/Reviews'));
const Notifications = lazy(() => import('../pages/Notifications/Notifications'));
const WebsiteManagement = lazy(() => import('../pages/WebsiteManagement/WebsiteManagement'));
const HomepageManagement = lazy(() => import('../pages/HomepageManagement/HomepageManagement'));
const Settings = lazy(() => import('../pages/Settings/Settings'));
const BatterProduction = lazy(() => import('../pages/BatterProduction/BatterProduction'));
const DeliveryManagement = lazy(() => import('../pages/DeliveryManagement/DeliveryManagement'));
const KitchenManagement = lazy(() => import('../pages/KitchenManagement/KitchenManagement'));

// New Upgraded ERP pages (Lazy Loaded)
const UserManagement = lazy(() => import('../pages/UserManagement/UserManagement'));
const Finance = lazy(() => import('../pages/Finance/Finance'));
const ReadyToEatOrders = lazy(() => import('../pages/Orders/ReadyToEatOrders'));
const ReadyToCookOrders = lazy(() => import('../pages/Orders/ReadyToCookOrders'));
const AssignedOrders = lazy(() => import('../pages/Orders/AssignedOrders'));
const DeliveryRoutes = lazy(() => import('../pages/Orders/DeliveryRoutes'));
const CustomerContacts = lazy(() => import('../pages/Orders/CustomerContacts'));

const AdminRoutes = () => {
  const staffAndOps = ['admin', 'manager', 'kitchen_staff', 'delivery_staff'];
  const kitchenOps = ['admin', 'manager', 'kitchen_staff'];
  const deliveryOps = ['admin', 'manager', 'delivery_staff'];
  const mgmtRoles = ['admin', 'manager'];

  return (
    <Suspense fallback={<AdminLoader />}>
      <Routes>
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute allowedRoles={staffAndOps}>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/ready-to-eat" 
          element={
            <ProtectedRoute allowedRoles={mgmtRoles}>
              <ReadyToEat />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/ready-to-cook" 
          element={
            <ProtectedRoute allowedRoles={mgmtRoles}>
              <ReadyToCook />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/batter-products" 
          element={
            <ProtectedRoute allowedRoles={mgmtRoles}>
              <BatterProducts />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/bulk-orders" 
          element={
            <ProtectedRoute allowedRoles={mgmtRoles}>
              <BulkOrders />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/orders" 
          element={
            <ProtectedRoute allowedRoles={mgmtRoles}>
              <Orders />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/customers" 
          element={
            <ProtectedRoute allowedRoles={mgmtRoles}>
              <Customers />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/inventory" 
          element={
            <ProtectedRoute allowedRoles={mgmtRoles}>
              <Inventory />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/products" 
          element={
            <ProtectedRoute allowedRoles={mgmtRoles}>
              <Products />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/reports" 
          element={
            <ProtectedRoute allowedRoles={mgmtRoles}>
              <Reports />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/coupons" 
          element={
            <ProtectedRoute allowedRoles={mgmtRoles}>
              <Coupons />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/reviews" 
          element={
            <ProtectedRoute allowedRoles={mgmtRoles}>
              <Reviews />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/notifications" 
          element={
            <ProtectedRoute allowedRoles={mgmtRoles}>
              <Notifications />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/website-management" 
          element={
            <ProtectedRoute allowedRoles={mgmtRoles}>
              <WebsiteManagement />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/homepage-management" 
          element={
            <ProtectedRoute allowedRoles={mgmtRoles}>
              <HomepageManagement />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/settings" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Settings />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/batter-production" 
          element={
            <ProtectedRoute allowedRoles={kitchenOps}>
              <BatterProduction />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/delivery-management" 
          element={
            <ProtectedRoute allowedRoles={mgmtRoles}>
              <DeliveryManagement />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/kitchen-management" 
          element={
            <ProtectedRoute allowedRoles={mgmtRoles}>
              <KitchenManagement />
            </ProtectedRoute>
          } 
        />

        {/* New Upgraded ERP Paths */}
        <Route 
          path="/user-management" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <UserManagement />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/finance" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Finance />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/ready-to-eat-orders" 
          element={
            <ProtectedRoute allowedRoles={kitchenOps}>
              <ReadyToEatOrders />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/ready-to-cook-orders" 
          element={
            <ProtectedRoute allowedRoles={kitchenOps}>
              <ReadyToCookOrders />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/assigned-orders" 
          element={
            <ProtectedRoute allowedRoles={deliveryOps}>
              <AssignedOrders />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/delivery-routes" 
          element={
            <ProtectedRoute allowedRoles={deliveryOps}>
              <DeliveryRoutes />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/customer-contacts" 
          element={
            <ProtectedRoute allowedRoles={deliveryOps}>
              <CustomerContacts />
            </ProtectedRoute>
          } 
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>
    </Suspense>
  );
};
export default AdminRoutes;
