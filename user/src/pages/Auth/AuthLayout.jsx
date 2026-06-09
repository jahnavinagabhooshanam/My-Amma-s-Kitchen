import React from 'react';
import logoImg from '../../assets/img/logo.png';
import bgImg from '../../assets/img/hero/new_login_bg.jpg';
import './Auth.css';

const AuthLayout = ({ children, title, subtitle, isSingle }) => {
  return (
    <div className="auth-page-premium" style={{ backgroundImage: `url(${bgImg})` }}>
      {isSingle ? (
        <div className="auth-glass-container auth-glass-single">
          {children}
        </div>
      ) : (
        <div className="auth-glass-container">
          {/* Left Side Branding */}
          <div className="auth-glass-left">
            <div className="auth-glass-logo-wrapper" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <img src={logoImg} alt="Ammulu's Kitchen" style={{ width: '100%', maxWidth: '360px', height: 'auto', marginBottom: '20px' }} />
            </div>
            <div style={{ color: '#E85D04', fontSize: '12px', margin: '15px 0' }}>â™¡</div>
            <p className="auth-glass-tagline">Homemade Taste.<br/>Made with <span style={{color: '#E85D04'}}>Love.</span></p>
          </div>
          
          {/* Right Side Form */}
          <div className="auth-glass-right">
            <div className="auth-glass-header">
              <p className="auth-welcome">Welcome Back!</p>
              <h1 className="auth-title">{title || 'Login'}</h1>
              {subtitle && <p className="auth-subtitle">{subtitle}</p>}
            </div>
            <div className="auth-form-wrapper">
              {children}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthLayout;
