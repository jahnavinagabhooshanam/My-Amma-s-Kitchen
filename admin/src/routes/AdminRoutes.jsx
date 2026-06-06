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
const BulkOrders = lazy(() => import('../pages/BulkOrders/BulkOrders'));
const Orders = lazy(() => import('../pages/Orders/Orders'));
const Customers = lazy(() => import('../pages/Customers/Customers'));
const Inventory = lazy(() => import('../pages/Inventory/Inventory'));
const Products = lazy(() => import('../pages/Products/Products'));
const Reports = lazy(() => import('../pages/Reports/Reports'));

const WebsiteManagement = lazy(() => import('../pages/WebsiteManagement/WebsiteManagement'));
const Settings = lazy(() => import('../pages/Settings/Settings'));
const BatterProduction = lazy(() => import('../pages/BatterProduction/BatterProduction'));
const DeliveryManagement = lazy(() => import('../pages/DeliveryManagement/DeliveryManagement'));
const KitchenManagement = lazy(() => import('../pages/KitchenManagement/KitchenManagement'));
const Offers = lazy(() => import('../pages/Offers/Offers'));

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
            <ProtectedRoute allowedRoles={staffAndOps}>
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
              <Navigate to="/admin/offers?tab=coupons" replace />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/offers" 
          element={
            <ProtectedRoute allowedRoles={mgmtRoles}>
              <Offers />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/reviews" 
          element={
            <ProtectedRoute allowedRoles={mgmtRoles}>
              <Navigate to="/admin/customers?tab=reviews" replace />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/notifications" 
          element={
            <ProtectedRoute allowedRoles={mgmtRoles}>
              <Navigate to="/admin/dashboard" replace />
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
            <ProtectedRoute allowedRoles={deliveryOps}>
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

        {/* New Upgraded ERP Paths - Redirects to Consolidated Views */}
        <Route 
          path="/user-management" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Navigate to="/admin/settings?tab=staff" replace />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/finance" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Navigate to="/admin/reports?tab=export" replace />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/ready-to-eat-orders" 
          element={
            <ProtectedRoute allowedRoles={kitchenOps}>
              <Navigate to="/admin/orders?tab=rte" replace />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/ready-to-cook-orders" 
          element={
            <ProtectedRoute allowedRoles={kitchenOps}>
              <Navigate to="/admin/orders?tab=rtc" replace />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/assigned-orders" 
          element={
            <ProtectedRoute allowedRoles={deliveryOps}>
              <Navigate to="/admin/delivery-management?tab=queue" replace />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/delivery-routes" 
          element={
            <ProtectedRoute allowedRoles={deliveryOps}>
              <Navigate to="/admin/delivery-management?tab=routes" replace />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/customer-contacts" 
          element={
            <ProtectedRoute allowedRoles={deliveryOps}>
              <Navigate to="/admin/delivery-management?tab=contacts" replace />
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
