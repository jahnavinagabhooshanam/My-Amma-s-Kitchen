import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import './StickyCartSummary.css';

const StickyCartSummary = () => {
  const { cartCount, cartTotal } = useCart();
  const navigate = useNavigate();
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (cartCount > 0) {
      setAnimate(true);
      const timer = setTimeout(() => setAnimate(false), 300);
      return () => clearTimeout(timer);
    }
  }, [cartCount]);

  if (cartCount === 0) return null;

  return (
    <div className={`sticky-cart-summary ${animate ? 'cart-bump' : ''}`}>
      <div className="sticky-cart-content" onClick={() => navigate('/cart')}>
        <div className="sticky-cart-info">
          <div className="sticky-cart-icon">
            <ShoppingCart size={20} color="var(--primary-color)" fill="white" />
          </div>
          <div className="sticky-cart-details">
            <span className="sticky-cart-items">{cartCount} {cartCount === 1 ? 'Item' : 'Items'}</span>
            <span className="sticky-cart-divider">•</span>
            <span className="sticky-cart-price">₹{cartTotal}</span>
          </div>
        </div>
        <div className="sticky-cart-action">
          <span>View Cart</span>
          <ArrowRight size={18} />
        </div>
      </div>
    </div>
  );
};

export default StickyCartSummary;
