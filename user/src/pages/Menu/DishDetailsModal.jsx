import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Heart, CheckCircle, Info } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import './Menu.css';

const DishDetailsModal = ({ dish, onClose, resolveImagePath }) => {
  const { addToCart } = useCart();

  if (!dish) return null;

  return (
    <AnimatePresence>
      <motion.div 
        className="modal-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(10, 25, 47, 0.8)', backdropFilter: 'blur(5px)',
          zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '20px'
        }}
      >
        <motion.div 
          className="dish-modal-content"
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            background: 'var(--dash-bg)', borderRadius: '24px', width: '100%', maxWidth: '900px',
            maxHeight: '90vh', overflowY: 'auto', display: 'flex', flexDirection: 'column',
            position: 'relative', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}
        >
          <button 
            onClick={onClose}
            style={{
              position: 'absolute', top: '16px', right: '16px', zIndex: 10,
              background: 'white', border: 'none', borderRadius: '50%', width: '40px', height: '40px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          >
            <X size={20} color="var(--dash-primary)" />
          </button>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0' }}>
            {/* Image Side */}
            <div style={{ position: 'relative', height: '100%', minHeight: '400px' }}>
              <img 
                src={resolveImagePath(dish.image)} 
                alt={dish.name} 
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderTopLeftRadius: '24px', borderBottomLeftRadius: '24px' }}
              />
              <div style={{ position: 'absolute', top: '20px', left: '20px', display: 'flex', gap: '10px' }}>
                {dish.in_stock ? (
                  <span className="stock-badge" style={{ position: 'static' }}>In Stock</span>
                ) : (
                  <span className="stock-badge out" style={{ position: 'static' }}>Sold Out</span>
                )}
              </div>
            </div>

            {/* Content Side */}
            <div style={{ padding: '40px' }}>
              <span style={{ color: 'var(--dash-accent)', fontWeight: 'bold', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                {dish.category.replace('_', ' ')}
              </span>
              
              <h2 style={{ fontSize: '2.5rem', color: 'var(--dash-primary)', margin: '10px 0', fontFamily: "'Barlow Condensed', sans-serif" }}>
                {dish.name}
              </h2>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#D4AF37', fontWeight: 'bold' }}>
                  <Star size={18} fill="#D4AF37" /> 4.8 Rating
                </span>
                <span style={{ color: 'var(--dash-text-light)', fontSize: '0.9rem' }}>
                  (120+ Reviews)
                </span>
              </div>

              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--dash-accent)', marginBottom: '20px' }}>
                ₹{dish.price}
                {dish.unit && <span style={{ fontSize: '1rem', color: 'var(--dash-text-light)', fontWeight: 'normal', marginLeft: '8px' }}>/ {dish.unit}</span>}
              </div>

              <div style={{ marginBottom: '30px' }}>
                <h4 style={{ fontSize: '1.1rem', color: 'var(--dash-primary)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Info size={18} /> Description
                </h4>
                <p style={{ color: 'var(--dash-text-light)', lineHeight: '1.6' }}>
                  {dish.description || 'A deeply flavorful, traditional recipe cooked to perfection with authentic home-style spices. Enjoy the comfort of Amma\'s cooking in every bite.'}
                </p>
              </div>

              <div style={{ display: 'flex', gap: '15px', marginTop: 'auto' }}>
                <button 
                  style={{
                    flex: 2, background: dish.in_stock ? 'var(--dash-primary)' : '#ccc', color: 'white',
                    border: 'none', padding: '16px', borderRadius: '50px', fontSize: '1.1rem', fontWeight: 'bold',
                    display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px',
                    cursor: dish.in_stock ? 'pointer' : 'not-allowed', transition: 'background 0.2s'
                  }}
                  disabled={!dish.in_stock}
                  onClick={() => {
                    addToCart(dish);
                    onClose();
                  }}
                >
                  <CheckCircle size={20} />
                  {dish.in_stock ? 'Add to Cart' : 'Currently Unavailable'}
                </button>
                <button 
                  style={{
                    flex: 1, background: 'transparent', color: 'var(--dash-primary)',
                    border: '2px solid var(--dash-border)', padding: '16px', borderRadius: '50px',
                    fontSize: '1.1rem', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px',
                    cursor: 'pointer', transition: 'all 0.2s'
                  }}
                >
                  <Heart size={20} /> Save
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DishDetailsModal;
