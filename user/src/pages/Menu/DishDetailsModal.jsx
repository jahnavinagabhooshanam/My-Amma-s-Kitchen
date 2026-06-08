import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Heart, CheckCircle, Clock, Info } from 'lucide-react';
import { useCart } from '../../context/CartContext';

const DishDetailsModal = ({ dish, onClose, resolveImagePath }) => {
  const { addToCart } = useCart();

  if (!dish) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0, 0.6)', backdropFilter: 'blur(3px)',
          zIndex: 9999, display: 'flex', alignItems: 'flex-end', justifyContent: 'center'
        }}
      >
        <motion.div 
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            background: 'white', width: '100%', maxWidth: '600px', maxHeight: '90vh',
            borderRadius: '24px 24px 0 0', display: 'flex', flexDirection: 'column',
            position: 'relative', overflow: 'hidden'
          }}
        >
          {/* Top Image Section */}
          <div style={{ position: 'relative', height: '280px', flexShrink: 0 }}>
            <img 
              src={resolveImagePath(dish.image)} 
              alt={dish.name} 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            {/* Gradient Overlay */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '100px', background: 'linear-gradient(to bottom, rgba(0,0,0,0.5), transparent)' }}></div>
            
            <button 
              onClick={onClose}
              style={{
                position: 'absolute', top: '20px', right: '20px', zIndex: 10,
                background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%', width: '36px', height: '36px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
              }}
            >
              <X size={20} color="var(--text-dark)" />
            </button>

            {!dish.in_stock && (
              <div style={{ position: 'absolute', bottom: '20px', left: '20px', background: 'var(--danger)', color: 'white', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 700 }}>
                SOLD OUT
              </div>
            )}
          </div>

          {/* Details Section */}
          <div style={{ padding: '20px', overflowY: 'auto', flex: 1, paddingBottom: '100px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <div className={`diet-dot`} style={{ width: 14, height: 14, border: `1px solid ${dish.diet_type?.toLowerCase() === 'non-veg' ? '#E74C3C' : '#27AE60'}`, padding: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: dish.diet_type?.toLowerCase() === 'non-veg' ? '#E74C3C' : '#27AE60' }}></div>
                  </div>
                  <span style={{ color: 'var(--primary-color)', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {dish.category?.replace('_', ' ')}
                  </span>
                </div>
                <h2 style={{ fontSize: '22px', color: 'var(--text-dark)', margin: '0 0 8px 0', fontWeight: 800 }}>
                  {dish.name}
                </h2>
                <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-dark)' }}>
                  ₹{dish.price}
                  {dish.unit && <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600, marginLeft: '4px' }}>/ {dish.unit}</span>}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px', padding: '12px 0', borderBottom: '1px solid #EAEAEA', borderTop: '1px solid #EAEAEA', marginTop: '15px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-dark)', fontWeight: '700', fontSize: '14px' }}>
                <Star size={16} fill="var(--warning)" color="var(--warning)" /> 4.8 <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>(120+)</span>
              </span>
              <div style={{ width: '4px', height: '4px', background: '#D9D9D9', borderRadius: '50%' }}></div>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)', fontSize: '14px', fontWeight: '600' }}>
                <Clock size={16} /> 20-30 mins
              </span>
            </div>

            <div>
              <h4 style={{ fontSize: '14px', color: 'var(--text-dark)', marginBottom: '8px', fontWeight: 800 }}>
                Details
              </h4>
              <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', fontSize: '14px' }}>
                {dish.description || 'A deeply flavorful, traditional recipe cooked to perfection with authentic home-style spices. Enjoy the comfort of Amma\'s cooking in every bite.'}
              </p>
            </div>
          </div>

          {/* Sticky Bottom Bar */}
          <div style={{ 
            position: 'absolute', bottom: 0, left: 0, right: 0, background: 'white', padding: '15px 20px', 
            paddingBottom: 'calc(15px + env(safe-area-inset-bottom))',
            boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.05)', display: 'flex', gap: '15px', alignItems: 'center',
            zIndex: 10
          }}>
            <div style={{ flex: 1 }}>
              <button 
                style={{
                  width: '100%', background: dish.in_stock ? 'var(--primary-color)' : '#EAEAEA', color: dish.in_stock ? 'white' : 'var(--text-muted)',
                  border: 'none', padding: '16px', borderRadius: '16px', fontSize: '16px', fontWeight: '700',
                  display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px',
                  cursor: dish.in_stock ? 'pointer' : 'not-allowed'
                }}
                disabled={!dish.in_stock}
                onClick={() => {
                  addToCart(dish);
                  onClose();
                }}
              >
                {dish.in_stock ? 'Add to cart' : 'Sold Out'}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DishDetailsModal;
