import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
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
    <AuthLayout 
      title="Welcome Back" 
      subtitle="Login to continue ordering your favorite foods and batter products."
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        {error && <div className="alert alert-danger">{error}</div>}
        
        <div style={{
          backgroundColor: 'rgba(200, 75, 49, 0.05)',
          border: '1px solid rgba(200, 75, 49, 0.2)',
          borderRadius: '8px',
          padding: '12px 16px',
          marginBottom: '24px',
          fontSize: '0.9rem',
          color: 'var(--text-dark)'
        }}>
          <strong>Demo Credentials:</strong><br/>
          Email: <code style={{color: 'var(--primary-color)', fontSize: '0.9rem'}}>customer@test.com</code><br/>
          Password: <code style={{color: 'var(--primary-color)', fontSize: '0.9rem'}}>Customer@123</code>
        </div>

        <div className="form-group">
          <input 
            type="text" 
            className="form-control" 
            placeholder="Email / Mobile Number" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        
        <div className="form-group">
          <input 
            type={showPassword ? 'text' : 'password'} 
            className="form-control" 
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button 
            type="button" 
            className="password-toggle"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        
        <div className="auth-actions">
          <label className="auth-checkbox">
            <input type="checkbox" /> 
            <span className="checkmark"></span>
            <span className="label-text">Remember Me</span>
          </label>
          <Link to="/forgot-password" className="auth-forgot">Forgot Password?</Link>
        </div>
        
        <button type="submit" className="auth-submit-btn" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
        
        <div className="auth-divider">Or continue with</div>
        
        <div className="social-login">
          <button type="button" className="social-btn" onClick={async () => {
            const result = await loginWithGoogle();
            if (result.success) {
              navigate('/');
            } else {
              setError(result.error);
            }
          }}>
             Google
          </button>
        </div>
        
        <div className="auth-footer">
          Don't have an account? <Link to="/register">Create Account</Link>
        </div>
      </form>
    </AuthLayout>
  );
};

export default Login;
