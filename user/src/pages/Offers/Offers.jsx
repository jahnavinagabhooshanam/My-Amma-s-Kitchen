import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tag, ArrowLeft, Copy, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../services/api';

const Offers = () => {
  const navigate = useNavigate();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(null);

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const res = await api.get('/coupons/');
        setCoupons(res.data.filter(c => c.is_active) || []);
      } catch (err) {
        console.error('Failed to load offers', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCoupons();
  }, []);

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div style={{ backgroundColor: '#F5F5F0', minHeight: '100vh', paddingBottom: 50 }}>
      {/* Header */}
      <div style={{ background: 'white', padding: '15px 20px', position: 'sticky', top: 0, zIndex: 100, display: 'flex', alignItems: 'center', gap: 15, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: 'var(--text-dark)', padding: 5 }}>
          <ArrowLeft size={24} />
        </button>
        <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: 'var(--text-dark)' }}>Offers & Benefits</h2>
      </div>

      <div style={{ maxWidth: 600, margin: '0 auto', padding: '20px 15px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px 0', color: 'var(--text-muted)' }}>
            Loading exciting offers...
          </div>
        ) : coupons.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: 20, boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
            <div style={{ fontSize: 60, marginBottom: 20 }}>🏷️</div>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-dark)', marginBottom: 10 }}>No active offers</h3>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 20 }}>We are cooking up some great deals for you. Check back soon!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {coupons.map((coupon, idx) => (
              <motion.div 
                key={coupon.id} 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
                style={{ background: 'white', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', position: 'relative' }}
              >
                {/* Left Notch */}
                <div style={{ position: 'absolute', left: -10, top: '50%', transform: 'translateY(-50%)', width: 20, height: 20, borderRadius: '50%', background: '#F5F5F0' }}></div>
                {/* Right Notch */}
                <div style={{ position: 'absolute', right: -10, top: '50%', transform: 'translateY(-50%)', width: 20, height: 20, borderRadius: '50%', background: '#F5F5F0' }}></div>

                <div style={{ display: 'flex', flexDirection: 'column', padding: 20 }}>
                  <div style={{ display: 'flex', gap: 15, alignItems: 'flex-start' }}>
                    <div style={{ background: 'var(--primary-light)', padding: 12, borderRadius: 12, color: 'var(--primary-color)' }}>
                      <Tag size={28} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: 16, fontWeight: 800, margin: '0 0 6px 0', color: 'var(--text-dark)' }}>
                        {coupon.discount_type === 'percentage' ? `${coupon.discount_value}% OFF` : `Flat ₹${coupon.discount_value} OFF`}
                      </h3>
                      <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>
                        Save {coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` : `₹${coupon.discount_value}`} on your order above ₹300.
                      </p>
                    </div>
                  </div>

                  <div style={{ borderTop: '2px dashed #EAEAEA', marginTop: 15, paddingTop: 15, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ background: '#F9F9F9', border: '1px solid #EAEAEA', padding: '8px 12px', borderRadius: 8, fontWeight: 800, color: 'var(--text-dark)', fontSize: 14, letterSpacing: 1 }}>
                      {coupon.code}
                    </div>
                    <button 
                      onClick={() => handleCopy(coupon.code)}
                      style={{ background: 'none', border: 'none', color: 'var(--primary-color)', fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}
                    >
                      {copiedCode === coupon.code ? <><CheckCircle size={16}/> COPIED</> : <><Copy size={16}/> COPY</>}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Offers;
