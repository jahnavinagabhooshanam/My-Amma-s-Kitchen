import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import AuthLayout from './AuthLayout';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email) {
      setError('Please enter your email or mobile number.');
      return;
    }
    
    setLoading(true);
    try {
      await authService.forgotPassword(email);
      // Pass email to the OTP page
      navigate('/verify-otp', { state: { email } });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="Forgot Password" 
      subtitle="Enter your email or mobile number to receive a 6-digit OTP to reset your password."
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        {error && <div className="alert alert-danger">{error}</div>}
        
        <div className="form-group" style={{ marginBottom: '30px' }}>
          <input 
            type="text" 
            className="form-control" 
            placeholder="Email Address or Mobile Number" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        
        <button type="submit" className="auth-submit-btn" disabled={loading}>
          {loading ? 'Sending OTP...' : 'Send OTP'}
        </button>
        
        <div className="auth-footer" style={{ marginTop: '40px' }}>
          Remembered your password? <Link to="/login">Back to Login</Link>
        </div>
      </form>
    </AuthLayout>
  );
};

export default ForgotPassword;
