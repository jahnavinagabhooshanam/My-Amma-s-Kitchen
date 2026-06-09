import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { motion } from 'framer-motion';
import { Trash2, Plus, Minus, Info, ChevronRight, Tag, MessageSquare, Bookmark } from 'lucide-react';
import api from '../../services/api';
import { resolveImagePath } from '../../components/FoodCard';

const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  
  const [coupon, setCoupon] = useState('');
  const [discount, setDiscount] = useState(0);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  // New features
  const [instructions, setInstructions] = useState({});
  const packingCharge = 20;
  const deliveryFee = cartTotal > 500 ? 0 : 40;

  useEffect(() => {
    // Load previously applied coupon/instructions if needed
    const saved = sessionStorage.getItem('checkoutData');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.coupon) setCoupon(parsed.coupon);
      if (parsed.discount) setDiscount(parsed.discount);
      if (parsed.instructions) setInstructions(parsed.instructions);
    }
  }, []);

  const handleInstructionChange = (id, val) => {
    setInstructions(prev => ({ ...prev, [id]: val }));
  };

  const applyPromo = async (e) => {
    e.preventDefault();
    if (!coupon.trim()) return;
    setErrorMsg('');
    setSuccessMsg('');
    
    try {
      const res = await api.get(`/coupons/${coupon.trim().toUpperCase()}`);
      const couponData = res.data;
      if (couponData.discount_type === 'percentage') {
        setDiscount(cartTotal * (couponData.discount_value / 100));
        setSuccessMsg(`Saved ${couponData.discount_value}% on this order.`);
      } else {
        setDiscount(couponData.discount_value);
        setSuccessMsg(`Saved Rs. ${couponData.discount_value} on this order.`);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Invalid coupon.');
      setDiscount(0);
    }
  };

  const grandTotal = Math.max(0, cartTotal + packingCharge + deliveryFee - discount);

  const proceedToCheckout = () => {
    sessionStorage.setItem('checkoutData', JSON.stringify({
      coupon: discount > 0 ? coupon.trim().toUpperCase() : null,
      discount,
      instructions,
      packingCharge,
      deliveryFee,
      grandTotal
    }));
    navigate('/checkout/address');
  };

  if (cartItems.length === 0) {
    return (
      <div style={{ backgroundColor: '#F5F5F0', minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ fontSize: '4rem', marginBottom: 20 }}>🛒</div>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-dark)', marginBottom: 10 }}>Your cart is empty</h2>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', textAlign: 'center', maxWidth: 300, marginBottom: 30 }}>Looks like you haven't added any homestyle goodness to your cart yet.</p>
        <button onClick={() => navigate('/menu')} style={{ padding: '14px 30px', background: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: 20, fontWeight: 700 }}>
          Browse Menu
        </button>
      </div>
    );
  }



  return (
    <div style={{ backgroundColor: '#F5F5F0', minHeight: '100vh', paddingBottom: 120 }}>
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '20px 15px' }}>
        
        {/* Cart Items List */}
        <div style={{ background: 'white', borderRadius: 20, padding: 20, marginBottom: 16, boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0, color: 'var(--text-dark)' }}>Items Added</h3>
            <button onClick={clearCart} style={{ color: 'var(--danger)', fontSize: 12, fontWeight: 700, background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Trash2 size={14}/> CLEAR ALL
            </button>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {cartItems.map((item) => (
              <div key={item.id} style={{ display: 'flex', flexDirection: 'column', gap: 12, borderBottom: '1px solid #F5F5F0', paddingBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 15 }}>
                  
                  {/* Image & Veg icon */}
                  <div style={{ position: 'relative', width: 70, height: 70, flexShrink: 0 }}>
                    <img src={resolveImagePath(item.image)} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 12 }} />
                    <div style={{ position: 'absolute', top: -6, left: -6, width: 14, height: 14, background: 'white', border: `1px solid #27AE60`, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#27AE60' }}></div>
                    </div>
                  </div>

                  {/* Details */}
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: 15, fontWeight: 700, color: 'var(--text-dark)' }}>{item.name}</h4>
                    <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-dark)', marginBottom: 8 }}>Rs. {item.price}</div>
                    
                    <div style={{ display: 'flex', gap: 10 }}>
                      <button onClick={() => removeFromCart(item.id)} style={{ background: 'none', border: 'none', fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, padding: 0 }}>
                        <Trash2 size={12}/> Remove
                      </button>
                      <button style={{ background: 'none', border: 'none', fontSize: 11, color: 'var(--primary-color)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, padding: 0 }}>
                        <Bookmark size={12}/> Save for later
                      </button>
                    </div>
                  </div>
                  
                  {/* Quantity Control */}
                  <div style={{ display: 'flex', alignItems: 'center', background: '#FFF5F6', border: '1px solid #FFE4E6', borderRadius: 8, padding: '4px 8px' }}>
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} style={{ background: 'none', border: 'none', color: 'var(--primary-color)', padding: 4 }}>
                      <Minus size={14} />
                    </button>
                    <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--primary-color)', width: 24, textAlign: 'center' }}>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} style={{ background: 'none', border: 'none', color: 'var(--primary-color)', padding: 4 }}>
                      <Plus size={14} />
                    </button>
                  </div>
                </div>

                {/* Special Instructions Input */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, background: '#F9F9F9', padding: '10px 12px', borderRadius: 8 }}>
                  <MessageSquare size={14} color="var(--text-muted)" style={{ marginTop: 2 }} />
                  <input 
                    type="text"
                    placeholder="Any special requests? (e.g., Less spicy)"
                    value={instructions[item.id] || ''}
                    onChange={(e) => handleInstructionChange(item.id, e.target.value)}
                    style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: 12, width: '100%', color: 'var(--text-dark)' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Apply Coupon Widget */}
        <div style={{ background: 'white', borderRadius: 20, padding: 20, marginBottom: 16, boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 15 }}>
            <Tag size={20} color="var(--primary-color)" />
            <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0, color: 'var(--text-dark)' }}>Offers & Benefits</h3>
          </div>
          <form onSubmit={applyPromo} style={{ display: 'flex', gap: 10 }}>
            <input 
              type="text" 
              placeholder="Enter coupon code" 
              value={coupon} 
              onChange={(e) => setCoupon(e.target.value)} 
              style={{ flex: 1, padding: '12px 16px', background: '#F5F5F0', border: '1px solid #EAEAEA', borderRadius: 12, fontSize: 14, textTransform: 'uppercase' }}
            />
            <button type="submit" style={{ padding: '0 20px', background: 'var(--text-dark)', color: 'white', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 14 }}>
              APPLY
            </button>
          </form>
          {successMsg && <div style={{ marginTop: 10, fontSize: 12, color: 'var(--primary-color)', fontWeight: 600 }}>✅ {successMsg}</div>}
          {errorMsg && <div style={{ marginTop: 10, fontSize: 12, color: 'var(--danger)', fontWeight: 600 }}>❌ {errorMsg}</div>}
        </div>

        {/* Bill Details */}
        <div style={{ background: 'white', borderRadius: 20, padding: 20, marginBottom: 16, boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, margin: '0 0 16px 0', color: 'var(--text-dark)' }}>Bill Details</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 14, color: 'var(--text-muted)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Item Total</span>
              <span style={{ color: 'var(--text-dark)', fontWeight: 600 }}>Rs. {cartTotal.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--primary-color)', fontWeight: 600 }}>
                <span>Item Discount</span>
                <span>- Rs. {discount.toFixed(2)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>Packing Charge</span>
              <span style={{ color: 'var(--text-dark)', fontWeight: 600 }}>Rs. {packingCharge.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>Delivery Fee <Info size={12}/></span>
              <span style={{ color: deliveryFee === 0 ? 'var(--primary-color)' : 'var(--text-dark)', fontWeight: 600 }}>
                {deliveryFee === 0 ? 'FREE' : `Rs. ${deliveryFee.toFixed(2)}`}
              </span>
            </div>
            <div style={{ height: 1, background: '#EAEAEA', margin: '4px 0' }}></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 800, color: 'var(--text-dark)' }}>
              <span>To Pay</span>
              <span>Rs. {grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
        
        {/* Sticky Bottom Checkout Bar */}
        <div className="checkout-bottom-bar">
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>To Pay</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-dark)' }}>Rs. {grandTotal.toFixed(2)}</div>
          </div>
          <button 
            onClick={proceedToCheckout} 
            style={{ background: 'var(--primary-color)', color: 'white', padding: '14px 24px', borderRadius: 16, border: 'none', fontWeight: 700, fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}
          >
            Select Address <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
