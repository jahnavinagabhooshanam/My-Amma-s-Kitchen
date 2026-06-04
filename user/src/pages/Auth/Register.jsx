import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, User, Mail, Phone, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import AuthLayout from './AuthLayout';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  
  const { register, loginWithGoogle, loading } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.name || !formData.email || !formData.phone || !formData.password) {
      setError('Please fill in all required fields.');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    
    if (!formData.acceptTerms) {
      setError('You must accept the Terms & Conditions.');
      return;
    }
    
    const result = await register(formData.name, formData.email, formData.phone, formData.password);
    if (result.success) {
      navigate('/complete-profile');
    } else {
      setError(result.error);
    }
  };

  return (
    <AuthLayout isSingle={true}>
      <div className="auth-single-header">
        <h1 className="auth-title">Create Account</h1>
        <p className="auth-subtitle">Join us and enjoy fresh homemade food</p>
      </div>

      <form className="auth-form-single" onSubmit={handleSubmit}>
        {error && <div className="alert alert-danger" style={{ backgroundColor: 'rgba(220, 53, 69, 0.1)', color: '#ff6b6b', border: '1px solid rgba(220, 53, 69, 0.2)', padding: '10px', borderRadius: '8px', marginBottom: '15px', fontSize: '0.9rem' }}>{error}</div>}
        
        <div className="form-group-single">
          <div className="input-with-icon">
            <User size={18} className="input-icon" />
            <input 
              type="text" 
              name="name"
              className="form-control" 
              placeholder="Full Name" 
              value={formData.name}
              onChange={handleChange}
            />
          </div>
        </div>
        
        <div className="form-group-single auth-flex-row">
          <div className="input-with-icon" style={{ flex: 1 }}>
            <Mail size={18} className="input-icon" />
            <input 
              type="email" 
              name="email"
              className="form-control" 
              placeholder="Email Address" 
              value={formData.email}
              onChange={handleChange}
              autoComplete="new-email"
            />
          </div>
          <div className="input-with-icon" style={{ flex: 1 }}>
            <Phone size={18} className="input-icon" />
            <input 
              type="text" 
              name="phone"
              className="form-control" 
              placeholder="Mobile Number" 
              value={formData.phone}
              onChange={handleChange}
              autoComplete="new-password"
            />
          </div>
        </div>
        
        <div className="form-group-single">
          <div className="input-with-icon">
            <Lock size={18} className="input-icon" />
            <input 
              type={showPassword ? 'text' : 'password'} 
              name="password"
              className="form-control" 
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              autoComplete="new-password"
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
        
        <div className="form-group-single">
          <div className="input-with-icon">
            <Lock size={18} className="input-icon" />
            <input 
              type={showConfirmPassword ? 'text' : 'password'} 
              name="confirmPassword"
              className="form-control" 
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
            <button 
              type="button" 
              className="password-toggle"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
        
        <div className="auth-actions-single" style={{ marginBottom: '20px', justifyContent: 'flex-start' }}>
          <label className="auth-checkbox">
            <input 
              type="checkbox" 
              name="acceptTerms"
              checked={formData.acceptTerms}
              onChange={handleChange}
            /> 
            <span className="checkmark"></span>
            <span className="label-text" style={{ color: '#fff', fontSize: '0.9rem' }}>
              I accept the <Link to="/terms" style={{color: '#E85D04'}}>Terms & Conditions</Link>
            </span>
          </label>
        </div>
        
        <button type="submit" className="auth-submit-btn" disabled={loading}>
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>
        
        <div className="auth-footer-single">
          Already have an account? <Link to="/login">Login here</Link>
        </div>
      </form>
    </AuthLayout>
  );
};

export default Register;
