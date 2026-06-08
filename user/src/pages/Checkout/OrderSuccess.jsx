import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight } from 'lucide-react';

const OrderSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const orderId = location.state?.orderId;

  useEffect(() => {
    // If no order ID, redirect to home
    if (!orderId) {
      navigate('/');
    }
  }, [orderId, navigate]);

  if (!orderId) return null;

  return (
    <div style={{ backgroundColor: '#F5F5F0', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }} 
        transition={{ type: 'spring', damping: 15 }}
        style={{ background: 'white', padding: '40px 20px', borderRadius: 24, textAlign: 'center', width: '100%', maxWidth: 400, boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        >
          <CheckCircle size={80} color="var(--primary-color)" style={{ margin: '0 auto 20px' }} />
        </motion.div>
        
        <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-dark)', marginBottom: 10 }}>Order Confirmed!</h2>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 20, lineHeight: 1.5 }}>
          Amma's Kitchen has started preparing your order with love.
        </p>
        
        <div style={{ background: '#F5F5F0', padding: '16px', borderRadius: 16, marginBottom: 30, border: '1px dashed #CCC' }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.5px' }}>ORDER ID</span>
          <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--primary-dark)', marginTop: 4 }}>#{orderId}</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button 
            onClick={() => navigate(`/track-order/${orderId}`)} 
            style={{ width: '100%', padding: '16px', background: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: 16, fontWeight: 700, fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            Track Order <ArrowRight size={18} />
          </button>
          <button 
            onClick={() => navigate('/')} 
            style={{ width: '100%', padding: '16px', background: 'white', color: 'var(--text-dark)', border: '1px solid #EAEAEA', borderRadius: 16, fontWeight: 700, fontSize: 16 }}
          >
            Back to Home
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default OrderSuccess;
