import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import logoImg from '../../assets/img/ammulus-kitchen-logo.jpg';
import loginBg from '../../assets/img/login-bg.webp';
import { AlertCircle, Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = location.state?.from?.pathname || '/admin/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      navigate(redirectPath, { replace: true });
    } else {
      setError(result.error);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundImage: `url(${loginBg})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      fontFamily: "'Outfit', sans-serif",
      padding: '20px',
      overflow: 'hidden',
      zIndex: 9999
    }}>
      <div style={{
        width: '100%',
        maxWidth: '430px',
        backgroundColor: '#FFFFFF',
        borderRadius: '20px',
        boxShadow: '0 15px 45px rgba(0, 0, 0, 0.08)',
        padding: '45px 35px',
        border: 'none'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '20px'
          }}>
            <img
              src={logoImg}
              alt="My Ammulu's Kitchen Logo"
              style={{
                height: '135px',
                objectFit: 'contain',
                transition: 'transform 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1E293B', margin: 0 }}>Admin Login</h2>
          <p style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '8px' }}>Welcome back! Please login to your account.</p>
        </div>

        {error && (
          <div style={{
            backgroundColor: '#FADBD8',
            color: '#7B241C',
            border: '1px solid #F5B7B1',
            padding: '12px 16px',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: '600',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="form-group">
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Email</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                style={{ 
                  width: '100%', 
                  padding: '12px 40px 12px 16px', 
                  border: '1px solid #CBD5E1', 
                  borderRadius: '8px', 
                  fontSize: '14px',
                  color: '#0F172A',
                  outline: 'none',
                  transition: 'border-color 0.2s ease'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#0A5D32'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#CBD5E1'}
              />
              <Mail size={16} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
            </div>
          </div>

          <div className="form-group">
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? "text" : "password"}
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                style={{ 
                  width: '100%', 
                  padding: '12px 65px 12px 16px', 
                  border: '1px solid #CBD5E1', 
                  borderRadius: '8px', 
                  fontSize: '14px',
                  color: '#0F172A',
                  outline: 'none',
                  transition: 'border-color 0.2s ease'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#0A5D32'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#CBD5E1'}
              />
              <div style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#94A3B8',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '15px',
                    transition: 'color 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#0A5D32'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#94A3B8'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                <Lock size={16} style={{ color: '#94A3B8' }} />
              </div>
            </div>
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '2px'
          }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: '#475569', fontWeight: '500' }}>
              <input 
                type="checkbox" 
                style={{ 
                  accentColor: '#0A5D32',
                  width: '16px',
                  height: '16px',
                  cursor: 'pointer'
                }} 
              />
              Remember Me
            </label>
            <span 
              style={{ 
                fontSize: '13px', 
                color: '#C2410C', 
                fontWeight: '600', 
                cursor: 'pointer',
                transition: 'color 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#9A3412'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#C2410C'}
              onClick={() => alert('Please contact the system administrator to reset your password.')}
            >
              Forgot Password?
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              border: 'none',
              padding: '14px',
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: '600',
              cursor: 'pointer',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginTop: '8px',
              backgroundColor: '#0A5D32',
              color: '#FFFFFF',
              transition: 'background-color 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#064E2B'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0A5D32'}
          >
            {loading ? (
              'Authenticating secure connection...'
            ) : (
              <>
                <LogIn size={18} /> Login
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
