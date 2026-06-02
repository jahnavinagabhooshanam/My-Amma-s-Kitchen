import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
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
    <AuthLayout 
      title="Create Your Account" 
      subtitle="Join Amma's Kitchen and enjoy fresh food, batter products and exclusive offers."
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        {error && <div className="alert alert-danger">{error}</div>}
        
        <div className="form-group">
          <input 
            type="text" 
            name="name"
            className="form-control" 
            placeholder="Full Name" 
            value={formData.name}
            onChange={handleChange}
          />
        </div>
        
        <div className="form-group" style={{ display: 'flex', gap: '15px' }}>
          <input 
            type="email" 
            name="email"
            className="form-control" 
            placeholder="Email Address" 
            value={formData.email}
            onChange={handleChange}
          />
          <input 
            type="text" 
            name="phone"
            className="form-control" 
            placeholder="Mobile Number" 
            value={formData.phone}
            onChange={handleChange}
          />
        </div>
        
        <div className="form-group">
          <input 
            type={showPassword ? 'text' : 'password'} 
            name="password"
            className="form-control" 
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
          />
          <button 
            type="button" 
            className="password-toggle"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        
        <div className="form-group">
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
            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        
        <div className="auth-actions" style={{ marginBottom: '20px' }}>
          <label className="auth-checkbox">
            <input 
              type="checkbox" 
              name="acceptTerms"
              checked={formData.acceptTerms}
              onChange={handleChange}
            /> 
            <span className="checkmark"></span>
            <span className="label-text">I accept the <Link to="/terms" style={{color: 'var(--primary-color)'}}>Terms & Conditions</Link></span>
          </label>
        </div>
        
        <button type="submit" className="auth-submit-btn" disabled={loading}>
          {loading ? 'Creating Account...' : 'Create Account'}
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
          Already have an account? <Link to="/login">Login here</Link>
        </div>
      </form>
    </AuthLayout>
  );
};

export default Register;
