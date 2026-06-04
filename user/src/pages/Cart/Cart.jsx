import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { Trash2, Plus, Minus, ArrowRight, CheckCircle, Truck, MapPin } from 'lucide-react';
import orderService from '../../services/orderService';
import addressService from '../../services/addressService';
import api from '../../services/api';

const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart, cartTotal, clearCart } = useCart();
  
  const [coupon, setCoupon] = useState('');
  const [discount, setDiscount] = useState(0);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  // Checkout Form states
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [payment, setPayment] = useState('COD');
  
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [checkingOut, setCheckingOut] = useState(false);
  
  const { token, user } = useAuth();
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');

  React.useEffect(() => {
    if (checkingOut && token) {
      addressService.getAll().then(res => {
        setSavedAddresses(res.data);
        const defaultAddr = res.data.find(a => a.is_default);
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr.id);
          setAddress(`${defaultAddr.door_number || ''}, ${defaultAddr.street_name || ''}, ${defaultAddr.area || ''}, ${defaultAddr.city || ''} - ${defaultAddr.pincode || ''}`.replace(/^, | ,|, $/g, '').trim());
        }
      }).catch(err => console.error("Failed to load addresses", err));
      
      if (user && user.phone) {
          setPhone(user.phone);
      }
    }
  }, [checkingOut, token, user]);

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
        setSuccessMsg(`Coupon applied successfully! Saved ${couponData.discount_value}%.`);
      } else {
        setDiscount(couponData.discount_value);
        setSuccessMsg(`Coupon applied successfully! Saved ₹${couponData.discount_value}.`);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Invalid or inactive coupon code.');
      setDiscount(0);
    }
  };

  const grandTotal = Math.max(0, cartTotal - discount);

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    if (!address || !phone) {
      setErrorMsg('Please enter your delivery address and phone number.');
      return;
    }
    setErrorMsg('');
    try {
      const response = await orderService.place({
        items: cartItems.map(item => ({
          product_id: item.id,
          price: item.price,
          quantity: item.quantity
        })),
        delivery_address: address,
        phone,
        payment_method: payment,
        coupon_code: discount > 0 ? coupon.trim().toUpperCase() : null
      });
      setOrderId(response.data.order.id);
      setOrderPlaced(true);
      clearCart();
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.error || 'Failed to place order. Please check if you are logged in.');
    }
  };

  if (orderPlaced) {
    return (
      <div className="cart-page space" style={{ backgroundColor: '#FCFBF7', minHeight: '80vh' }}>
        <div className="container flex-center">
          <div className="card text-center flex flex-col gap-2" style={{ padding: '60px 40px', backgroundColor: '#FFFFFF', border: '1px solid #EAE6DB', borderRadius: '15px', maxWidth: '500px', margin: '0 auto' }}>
            <CheckCircle size={64} style={{ color: 'var(--secondary-color)', margin: '0 auto' }} />
            <h1 className="title-lg" style={{ color: 'var(--secondary-dark)', marginTop: '16px' }}>Order Placed!</h1>
            <p style={{
              backgroundColor: 'var(--primary-light)',
              color: 'var(--primary-color)',
              fontWeight: '700',
              padding: '6px 16px',
              borderRadius: '50px',
              display: 'inline-block',
              margin: '10px auto'
            }}>Order ID: #{orderId}</p>
            <p className="text-muted" style={{ lineHeight: '1.5' }}>
              Your fresh fermented batter and homestyle warm tiffin items are being packaged in our sterile kitchen right now.
            </p>
            <div className="flex-center gap-1" style={{ backgroundColor: 'var(--bg-tertiary)', padding: '12px 20px', borderRadius: '8px', width: '100%', marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Truck size={18} style={{ color: 'var(--primary-color)', marginRight: '6px' }} />
              <span>Estimated Delivery: <strong>30-40 minutes</strong></span>
            </div>
            <Link to="/" className="th-btn mt-4" style={{ width: '100%' }}>
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page space" style={{ backgroundColor: '#FCFBF7', minHeight: '80vh' }}>
      <div className="container">
        
        <h1 className="title-lg" style={{ color: 'var(--primary-dark)', marginBottom: '30px' }}>
          Shopping Basket
        </h1>

        {cartItems.length === 0 ? (
          <div className="card text-center flex flex-col gap-2" style={{ padding: '60px 40px', backgroundColor: '#FFFFFF', border: '1px solid #EAE6DB', borderRadius: '15px' }}>
            <span style={{ fontSize: '4rem' }}>🧺</span>
            <h2 className="title-md">Your basket is completely empty</h2>
            <p className="text-muted" style={{ maxWidth: '400px', margin: '8px auto' }}>
              Add some of Amma's signature stone-ground batters or freshly prepared warm tiffins to get started.
            </p>
            <Link to="/" className="th-btn mt-3" style={{ margin: '0 auto' }}>Explore Menu</Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: checkingOut ? '1fr' : '2.2fr 1fr', gap: '30px', alignItems: 'start' }}>
            
            {/* Basket Items List */}
            {!checkingOut ? (
              <div className="card" style={{ padding: '30px', backgroundColor: '#FFFFFF', border: '1px solid #EAE6DB', borderRadius: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #EAE6DB', paddingBottom: '16px', marginBottom: '16px' }}>
                  <span style={{ fontWeight: '700', fontSize: '18px', color: 'var(--text-dark)' }}>Selected Items</span>
                  <button onClick={clearCart} style={{ color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Trash2 size={14} /> Empty Basket
                  </button>
                </div>

                <div className="flex flex-col gap-2">
                  {cartItems.map((item) => (
                    <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #F5F3E9', paddingBottom: '16px', marginBottom: '16px' }}>
                      <div className="flex gap-2" style={{ alignItems: 'center' }}>
                        <div style={{ width: '45px', height: '45px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>🍶</div>
                        <div>
                          <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: 'var(--text-dark)' }}>{item.name}</h4>
                          <span className="text-muted" style={{ fontSize: '12px' }}>{item.unit}</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div className="quantity-adjuster" style={{ display: 'inline-flex', border: '1px solid #EAE6DB', borderRadius: '50px', backgroundColor: '#FFFFFF', overflow: 'hidden' }}>
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)} style={{ padding: '6px 12px', background: 'none', border: 'none', cursor: 'pointer' }}>
                            <Minus size={12} />
                          </button>
                          <span style={{ padding: '6px 4px', fontWeight: '700', fontSize: '14px' }}>{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)} style={{ padding: '6px 12px', background: 'none', border: 'none', cursor: 'pointer' }}>
                            <Plus size={12} />
                          </button>
                        </div>

                        <span style={{ fontWeight: '700', color: 'var(--primary-dark)', fontSize: '16px', minWidth: '70px', textAlign: 'right' }}>
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </span>

                        <button onClick={() => removeFromCart(item.id)} style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* Secure Checkout Form Panel */
              <form onSubmit={handleCheckoutSubmit} className="card flex flex-col gap-2" style={{ padding: '30px', backgroundColor: '#FFFFFF', border: '1px solid #EAE6DB', borderRadius: '15px' }}>
                <h3 className="title-md" style={{ color: 'var(--primary-dark)', borderBottom: '1px solid #EAE6DB', paddingBottom: '10px' }}>
                  Delivery Details
                </h3>

                {errorMsg && <div className="alert alert-danger" style={{ padding: '10px', fontSize: '14px' }}>{errorMsg}</div>}

                <div className="row">
                  <div className="form-group col-md-6">
                    <label className="form-label">Helpline Phone *</label>
                    <input type="tel" className="form-control" required placeholder="+91 XXXXX XXXXX" value={phone} onChange={(e) => setPhone(e.target.value)} />
                  </div>
                  <div className="form-group col-md-6 style-border">
                    <label className="form-label">Payment Method</label>
                    <select className="form-select" value={payment} onChange={(e) => setPayment(e.target.value)}>
                      <option value="COD">Cash on Delivery (COD)</option>
                      <option value="UPI">Instant UPI Payment</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Delivery Address *</label>
                  {savedAddresses.length > 0 && (
                    <select 
                      className="form-control" 
                      style={{ marginBottom: '10px' }}
                      value={selectedAddressId}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSelectedAddressId(val);
                        if (val) {
                          const addr = savedAddresses.find(a => a.id.toString() === val);
                          if (addr) setAddress(`${addr.door_number || ''}, ${addr.street_name || ''}, ${addr.area || ''}, ${addr.city || ''} - ${addr.pincode || ''}`.replace(/^, | ,|, $/g, '').trim());
                        } else {
                          setAddress('');
                        }
                      }}
                    >
                      <option value="">-- Select Saved Address --</option>
                      {savedAddresses.map(a => (
                        <option key={a.id} value={a.id}>{a.label} - {a.city}</option>
                      ))}
                      <option value="custom">Enter New Address</option>
                    </select>
                  )}
                  <textarea rows="3" className="form-control" required placeholder="Flat No, Building, Street, Area, Chennai" value={address} onChange={(e) => setAddress(e.target.value)} />
                </div>

                <div style={{ display: 'flex', gap: '15px', marginTop: '16px' }}>
                  <button type="submit" className="th-btn style9 th-icon" style={{ border: 'none', cursor: 'pointer', flexGrow: 1 }}>
                    Confirm order (₹{grandTotal.toFixed(2)})
                  </button>
                  <button type="button" onClick={() => setCheckingOut(false)} className="th-btn style10" style={{ border: 'none', cursor: 'pointer' }}>
                    Back to Basket
                  </button>
                </div>
              </form>
            )}

            {/* Cost Summary Column */}
            {!checkingOut && (
              <div className="flex flex-col gap-2">
                
                {/* Coupon widget */}
                <div className="card" style={{ padding: '20px', backgroundColor: '#FFFFFF', border: '1px solid #EAE6DB', borderRadius: '15px' }}>
                  <h4 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-dark)', margin: '0 0 10px 0' }}>Apply Coupon</h4>
                  <form onSubmit={applyPromo} style={{ display: 'flex', gap: '8px' }}>
                    <input type="text" className="form-control" placeholder="AMMA20" value={coupon} onChange={(e) => setCoupon(e.target.value)} style={{ padding: '8px 12px' }} />
                    <button type="submit" className="th-btn" style={{ padding: '8px 16px', border: 'none', cursor: 'pointer' }}>Apply</button>
                  </form>
                  {successMsg && <div className="alert alert-success" style={{ padding: '6px', fontSize: '12px', marginTop: '10px', marginBottom: 0 }}>{successMsg}</div>}
                  {errorMsg && <div className="alert alert-danger" style={{ padding: '6px', fontSize: '12px', marginTop: '10px', marginBottom: 0 }}>{errorMsg}</div>}
                </div>

                {/* Summary panel */}
                <div className="card" style={{ padding: '24px', backgroundColor: '#FFFFFF', border: '1px solid #EAE6DB', borderRadius: '15px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--primary-dark)', borderBottom: '1px solid #EAE6DB', paddingBottom: '10px', margin: '0 0 16px 0' }}>Order Summary</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span className="text-muted">Subtotal</span>
                      <span style={{ fontWeight: '600' }}>₹{cartTotal.toFixed(2)}</span>
                    </div>
                    {discount > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--secondary-color)', fontWeight: '700' }}>
                        <span>Promo Discount (20%)</span>
                        <span>- ₹{discount.toFixed(2)}</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span className="text-muted">Delivery Charges</span>
                      <span style={{ color: 'var(--secondary-color)', fontWeight: '700' }}>FREE</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #EAE6DB', paddingTop: '16px', marginTop: '8px', fontWeight: '700', fontSize: '1.2rem' }}>
                      <span>Grand Total</span>
                      <span style={{ color: 'var(--primary-dark)' }}>₹{grandTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  <button onClick={() => setCheckingOut(true)} className="th-btn mt-4" style={{ width: '100%', border: 'none', cursor: 'pointer' }}>
                    Proceed to Checkout <ArrowRight size={16} style={{ marginLeft: '6px' }} />
                  </button>
                </div>

              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
};

export default Cart;
