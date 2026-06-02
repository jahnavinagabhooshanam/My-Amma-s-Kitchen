import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex-center" style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '16px', fontFamily: "'Outfit', sans-serif" }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '4px solid #FADBD8',
          borderTopColor: '#E84C3D',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <p className="text-muted" style={{ color: '#7E7A6B' }}>Loading administrative dashboard...</p>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Not logged in as Admin: redirect to administrative login screen
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role check
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
