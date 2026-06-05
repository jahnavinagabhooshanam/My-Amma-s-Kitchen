import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import authService from '../../services/authService';
import AuthLayout from './AuthLayout';
import { CheckCircle } from 'lucide-react';

const OTPVerification = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';
  
  const inputRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];

  useEffect(() => {
    if (!email) {
      navigate('/forgot-password');
    }
    
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [email, navigate]);

  const handleChange = (index, value) => {
    if (isNaN(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    // Auto focus next input
    if (value !== '' && index < 5) {
      inputRefs[index + 1].current.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs[index - 1].current.focus();
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;
    try {
      await authService.forgotPassword(email);
      setTimer(60);
      setError('');
    } catch (err) {
      setError('Failed to resend OTP.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpValue = otp.join('');
    if (otpValue.length < 6) {
      setError('Please enter the full 6-digit OTP.');
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      await authService.verifyOtp(email, otpValue);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="Verify OTP" 
      subtitle={`We've sent a 6-digit verification code to ${email}`}
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        {error && <div className="alert alert-danger">{error}</div>}
        {success && (
          <div className="alert alert-success" style={{display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#EAF2E8', color: 'var(--secondary-dark)'}}>
            <CheckCircle size={20} /> OTP Verified Successfully! Redirecting...
          </div>
        )}
        
        <div className="otp-container">
          {otp.map((digit, index) => (
            <input
              key={index}
              type="text"
              maxLength="1"
              className="otp-box"
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              ref={inputRefs[index]}
              disabled={success}
            />
          ))}
        </div>
        
        <div className="otp-timer">
          {timer > 0 ? (
            <span>Resend OTP in 00:{timer < 10 ? `0${timer}` : timer}</span>
          ) : (
            <button type="button" className="resend-btn" onClick={handleResend}>
              Resend OTP
            </button>
          )}
        </div>
        
        <button type="submit" className="auth-submit-btn" disabled={loading || success}>
          {loading ? 'Verifying...' : 'Verify OTP'}
        </button>
        
        <div className="auth-footer" style={{ marginTop: '30px' }}>
          <Link to="/login">Back to Login</Link>
        </div>
      </form>
    </AuthLayout>
  );
};

export default OTPVerification;
