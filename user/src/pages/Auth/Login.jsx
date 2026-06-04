import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import AuthLayout from './AuthLayout';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login, loginWithGoogle, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    
    const result = await login(email, password);
    if (result.success) {
      if (result.user && result.user.profile_completed) {
        navigate('/');
      } else {
        navigate('/complete-profile');
      }
    } else {
      setError(result.error);
    }
  };

  return (
    <AuthLayout isSingle={true}>
      <div className="auth-single-header">
        <h1 className="auth-title">Log in to your Account</h1>
        <p className="auth-subtitle">Welcome back! Select method to log in</p>
      </div>

      <div className="social-login-single">
        <button type="button" className="social-btn" onClick={async () => {
          const result = await loginWithGoogle();
          if (result.success) {
            navigate('/');
          } else {
            setError(result.error);
          }
        }}>
          <svg width="20" height="20" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          Google
        </button>
        <button type="button" className="social-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#1877F2">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
          Facebook
        </button>
      </div>

      <div className="auth-divider-single">
        <span>or continue with email</span>
      </div>

      <form className="auth-form-single" onSubmit={handleSubmit}>
        {error && <div className="alert alert-danger" style={{ backgroundColor: 'rgba(220, 53, 69, 0.1)', color: '#ff6b6b', border: '1px solid rgba(220, 53, 69, 0.2)', padding: '10px', borderRadius: '8px', marginBottom: '15px', fontSize: '0.9rem' }}>{error}</div>}
        
        <div className="form-group-single">
          <div className="input-with-icon">
            <Mail size={18} className="input-icon" />
            <input 
              type="email" 
              className="form-control" 
              placeholder="Email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="new-email"
              name="amma_email_login"
            />
          </div>
        </div>

        <div className="form-group-single">
          <div className="input-with-icon">
            <Lock size={18} className="input-icon" />
            <input 
              type={showPassword ? 'text' : 'password'} 
              className="form-control" 
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              name="amma_password_login"
            />
            <button 
              type="button" 
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div className="auth-actions-single">
          <label className="auth-checkbox">
            <input type="checkbox" />
            <span className="checkmark"></span>
            <span className="label-text" style={{ color: '#fff', fontSize: '0.9rem' }}>Remember me</span>
          </label>
          <Link to="/forgot-password" className="auth-forgot" style={{ marginTop: 0 }}>Forgot Password?</Link>
        </div>

        <button type="submit" className="auth-submit-btn" disabled={loading}>
          {loading ? 'Logging In...' : 'Log In'}
        </button>

        <div className="auth-footer-single">
          Don't have an account? <Link to="/register">Create an Account</Link>
        </div>
      </form>
    </AuthLayout>
  );
};

export default Login;
