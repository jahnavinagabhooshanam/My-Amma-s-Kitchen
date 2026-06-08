import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { motion } from 'framer-motion';
import { ChevronLeft, MapPin, Receipt, CheckCircle, ChevronRight, Banknote } from 'lucide-react';
import orderService from '../../services/orderService';

const OrderReview = () => {
  const { cartItems, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  
  const [checkoutData, setCheckoutData] = useState(null);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const data = sessionStorage.getItem('checkoutData');
    if (!data || cartItems.length === 0) {
      navigate('/cart');
      return;
    }
    setCheckoutData(JSON.parse(data));
  }, [cartItems, navigate]);

  const handlePlaceOrder = async () => {
    setIsPlacingOrder(true);
    setErrorMsg('');
    
    try {
      const payload = {
        items: cartItems.map(item => ({
          product_id: item.id,
          price: item.price,
          quantity: item.quantity
        })),
        delivery_address: checkoutData.deliveryAddress,
        phone: checkoutData.phone,
        payment_method: 'COD',
        coupon_code: checkoutData.coupon
      };

      // Also pass instructions if the backend supports it in the future,
      // currently backend ignores instructions, but we can append it to address for now
      if (checkoutData.instructions && Object.keys(checkoutData.instructions).length > 0) {
        let instrString = " | Instructions: ";
        for (const [id, instr] of Object.entries(checkoutData.instructions)) {
          if (instr) instrString += `[Item ${id}: ${instr}] `;
        }
        payload.delivery_address += instrString;
      }

      const response = await orderService.place(payload);
      clearCart();
      sessionStorage.removeItem('checkoutData');
      
      // Navigate to success screen with order ID
      navigate('/order-success', { state: { orderId: response.data.order.id }});
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.error || 'Failed to place order. Please try again.');
      setIsPlacingOrder(false);
    }
  };

  if (!checkoutData) return null;

  return (
    <div style={{ backgroundColor: '#F5F5F0', minHeight: '100vh', paddingBottom: 100 }}>
      {/* Header */}
      <div style={{ background: 'white', padding: '15px 20px', display: 'flex', alignItems: 'center', gap: 15, position: 'sticky', top: 0, zIndex: 10, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        <button onClick={() => navigate('/checkout/address')} style={{ background: 'none', border: 'none', padding: 0, display: 'flex' }}>
          <ChevronLeft size={24} color="var(--text-dark)" />
        </button>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-dark)', margin: 0 }}>Review Order</h2>
      </div>

      <div style={{ maxWidth: 600, margin: '0 auto', padding: '20px 15px' }}>
        
        {errorMsg && (
          <div style={{ padding: 16, background: '#FDF2F0', color: 'var(--danger)', borderRadius: 12, fontSize: 14, fontWeight: 600, marginBottom: 20 }}>
            {errorMsg}
          </div>
        )}

        {/* Delivery Address Review */}
        <div style={{ background: 'white', borderRadius: 20, padding: 20, marginBottom: 16, boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 15 }}>
            <MapPin size={20} color="var(--primary-color)" />
            <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0, color: 'var(--text-dark)' }}>Delivering To</h3>
          </div>
          <div style={{ background: '#F5F5F0', borderRadius: 12, padding: 16 }}>
            <p style={{ margin: 0, fontSize: 14, color: 'var(--text-dark)', lineHeight: 1.5, fontWeight: 600 }}>
              {checkoutData.deliveryAddress}
            </p>
            <p style={{ margin: '8px 0 0 0', fontSize: 13, color: 'var(--text-muted)' }}>
              Phone: +91 {checkoutData.phone}
            </p>
          </div>
        </div>

        {/* Order Summary */}
        <div style={{ background: 'white', borderRadius: 20, padding: 20, marginBottom: 16, boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 15 }}>
            <Receipt size={20} color="var(--primary-color)" />
            <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0, color: 'var(--text-dark)' }}>Order Summary</h3>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
            {cartItems.map(item => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div className={`diet-dot veg`} style={{ width: 10, height: 10, border: `1px solid #27AE60`, padding: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#27AE60' }}></div>
                  </div>
                  <span style={{ fontSize: 14, color: 'var(--text-dark)', fontWeight: 600 }}>{item.quantity} x {item.name}</span>
                </div>
                <span style={{ fontSize: 14, color: 'var(--text-dark)', fontWeight: 700 }}>₹{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div style={{ height: 1, background: '#EAEAEA', marginBottom: 15 }}></div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13, color: 'var(--text-muted)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Item Total</span>
              <span style={{ color: 'var(--text-dark)', fontWeight: 600 }}>₹{cartTotal.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Packing Charge</span>
              <span style={{ color: 'var(--text-dark)', fontWeight: 600 }}>₹{checkoutData.packingCharge.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Delivery Fee</span>
              <span style={{ color: 'var(--text-dark)', fontWeight: 600 }}>{checkoutData.deliveryFee === 0 ? 'FREE' : `₹${checkoutData.deliveryFee.toFixed(2)}`}</span>
            </div>
            {checkoutData.discount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--primary-color)' }}>
                <span>Discount Applied</span>
                <span style={{ fontWeight: 600 }}>- ₹{checkoutData.discount.toFixed(2)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Payment Method */}
        <div style={{ background: 'white', borderRadius: 20, padding: 20, marginBottom: 16, boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 15 }}>
            <Banknote size={20} color="var(--primary-color)" />
            <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0, color: 'var(--text-dark)' }}>Payment Method</h3>
          </div>
          
          <div style={{ background: '#E6F4EA', border: '1px solid var(--primary-color)', borderRadius: 12, padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--primary-dark)' }}>Cash On Delivery</h4>
              <p style={{ margin: '4px 0 0 0', fontSize: 12, color: 'var(--primary-color)' }}>Pay when your food arrives</p>
            </div>
            <CheckCircle size={24} color="var(--primary-color)" fill="white" />
          </div>
        </div>

      </div>

      {/* Sticky Bottom Checkout Bar */}
      <div className="checkout-bottom-bar">
        <div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Grand Total</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-dark)' }}>₹{checkoutData.grandTotal.toFixed(2)}</div>
        </div>
        <button 
          onClick={handlePlaceOrder} 
          disabled={isPlacingOrder}
          style={{ 
            background: isPlacingOrder ? '#CCC' : 'var(--primary-color)', 
            color: 'white', padding: '14px 30px', borderRadius: 16, border: 'none', 
            fontWeight: 800, fontSize: 16, display: 'flex', alignItems: 'center', gap: 8,
            transition: 'all 0.2s'
          }}
        >
          {isPlacingOrder ? 'Processing...' : 'Place Order'}
        </button>
      </div>
    </div>
  );
};

export default OrderReview;
