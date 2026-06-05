import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PublicRoute = ({ children }) => {
  const { user, token, loading } = useAuth();

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

  if (token && user) {
    if (user.profile_completed) {
      return <Navigate to="/" replace />;
    } else {
      return <Navigate to="/complete-profile" replace />;
    }
  }

  return children;
};

export default PublicRoute;
