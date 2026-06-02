import React from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from './AuthLayout';
import './Auth.css';

const AuthSplash = () => {
  return (
    <AuthLayout
      title="Experience Authentic South Indian Flavours"
      subtitle="Freshly prepared meals, premium batters, and handcrafted delicacies delivered daily."
    >
      <div className="auth-splash-content" style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '20px' }}>
        


        <div style={{ marginTop: '30px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Link to="/login" className="auth-submit-btn" style={{ textDecoration: 'none' }}>
            Login to your Account
          </Link>

          <Link to="/register" className="social-btn" style={{ textDecoration: 'none' }}>
            Create New Account
          </Link>
        </div>

        <div className="trust-signals-row">
          <span>⭐ 4.8 Rating</span>
          <span>10,000+ Orders Served</span>
          <span>100% Fresh Ingredients</span>
          <span>Same-Day Delivery</span>
        </div>
      </div>
    </AuthLayout>
  );
};

export default AuthSplash;
