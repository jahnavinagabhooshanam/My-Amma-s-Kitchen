import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading, token } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex-center" style={{ minHeight: '80vh', flexDirection: 'column', gap: '16px' }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '4px solid var(--primary-light)',
          borderTopColor: 'var(--primary-color)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <p className="text-muted">Loading your secure session...</p>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Not logged in: redirect to /login
  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Removed forced profile completion redirect. Users can browse the app normally.

  // Logged in and profile completed, but trying to go to /complete-profile: redirect to home
  if (user.profile_completed && location.pathname === '/complete-profile') {
    return <Navigate to="/" replace />;
  }

  // Role authorization check
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
