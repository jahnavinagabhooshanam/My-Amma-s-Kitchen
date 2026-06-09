import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { ChevronLeft, Package, Clock, Calendar, Truck, CheckCircle, MapPin, Receipt, RefreshCw, XCircle } from 'lucide-react';
import api from '../../services/api';

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const { addToCart } = useCart();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await api.get(`/orders/${id}`);
        setOrder(res.data);
      } catch (err) {
        console.error(err);
        setError('Failed to load order details.');
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchOrder();
  }, [id, token]);

  const formatDate = (isoString) => {
    if (!isoString) return 'N/A';
    const d = new Date(isoString);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' });
  };

  const handleReorder = () => {
    if (!order || !order.items) return;
    order.items.forEach(item => {
      addToCart({
        id: item.product_id,
        name: item.product_name,
        price: item.price,
        image: item.product_image || 'assets/img/default-food.png'
      }, item.quantity);
    });
    navigate('/cart');
  };

  if (loading) {
    return (
      <div style={{ backgroundColor: '#F5F5F0', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 40, height: 40, border: '4px solid var(--primary-light)', borderTop: '4px solid var(--primary-color)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div style={{ backgroundColor: '#F5F5F0', minHeight: '100vh', padding: 20, textAlign: 'center' }}>
        <h3>{error || 'Order not found'}</h3>
        <button onClick={() => navigate('/orders')} style={{ padding: '10px 20px', background: 'var(--primary-color)', color: 'white', borderRadius: 8, border: 'none' }}>Back to Orders</button>
      </div>
    );
  }

  const getStatusDisplay = (status) => {
    const s = status?.toLowerCase() || 'pending';
    if (s === 'delivered') return { text: 'Delivered', color: '#145A32', bg: '#EAF7EF', icon: <CheckCircle size={16}/> };
    if (s === 'cancelled') return { text: 'Cancelled', color: '#C0392B', bg: '#FDF2F0', icon: <XCircle size={16}/> };
    if (s === 'out for delivery') return { text: 'Out For Delivery', color: '#27AE60', bg: '#EAF7EF', icon: <Truck size={16}/> };
    if (s === 'packed') return { text: 'Packed', color: '#8E44AD', bg: '#F4ECF7', icon: <Package size={16}/> };
    if (s === 'preparing') return { text: 'Preparing', color: '#E67E22', bg: '#FEF5EB', icon: <Clock size={16}/> };
    return { text: 'Received', color: '#2980B9', bg: '#EBF5FB', icon: <Clock size={16}/> };
  };

  const statusDisplay = getStatusDisplay(order.status);
  const isActive = !['delivered', 'cancelled'].includes(order.status?.toLowerCase() || 'pending');

  return (
    <div style={{ backgroundColor: '#F5F5F0', minHeight: '100vh', paddingBottom: 100 }}>
      {/* Header */}
      <div style={{ background: 'white', padding: '15px 20px', position: 'sticky', top: 0, zIndex: 100, display: 'flex', alignItems: 'center', gap: 15, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        <button onClick={() => navigate('/orders')} style={{ background: 'none', border: 'none', color: 'var(--text-dark)', padding: 0, display: 'flex' }}>
          <ChevronLeft size={24} />
        </button>
        <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: 'var(--text-dark)' }}>Order Summary</h2>
      </div>

      <div style={{ maxWidth: 600, margin: '0 auto', padding: '20px 15px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        
        {/* Order Info Summary */}
        <div style={{ background: 'white', borderRadius: 20, padding: 20, boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 15 }}>
            <div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-dark)', margin: '0 0 4px 0' }}>Order #{order.id}</h3>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Calendar size={14}/> {formatDate(order.created_at)}
              </div>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: statusDisplay.bg, color: statusDisplay.color, padding: '12px 16px', borderRadius: 12, fontSize: 14, fontWeight: 700 }}>
            {statusDisplay.icon} {statusDisplay.text}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: 10 }}>
          {isActive ? (
            <button 
              onClick={() => navigate(`/track-order/${order.id}`)}
              style={{ flex: 1, padding: '14px', background: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: 16, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              <Truck size={18} /> Track Order
            </button>
          ) : (
            <button 
              onClick={handleReorder}
              style={{ flex: 1, padding: '14px', background: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: 16, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              <RefreshCw size={18} /> Reorder
            </button>
          )}
        </div>

        {/* Delivery Address */}
        <div style={{ background: 'white', borderRadius: 20, padding: 20, boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 15 }}>
            <MapPin size={20} color="var(--primary-color)" />
            <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0, color: 'var(--text-dark)' }}>Delivery Details</h3>
          </div>
          <div style={{ fontSize: 14, color: 'var(--text-dark)', lineHeight: 1.5, fontWeight: 600 }}>
            {order.delivery_address || 'Address not provided'}
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 8 }}>
            Phone: {order.phone || 'N/A'}
          </div>
        </div>

        {/* Bill Details */}
        <div style={{ background: 'white', borderRadius: 20, padding: 20, boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 15 }}>
            <Receipt size={20} color="var(--primary-color)" />
            <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0, color: 'var(--text-dark)' }}>Bill Details</h3>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 15 }}>
            {order.items.map(item => (
              <div key={item.product_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div className={`diet-dot veg`} style={{ width: 10, height: 10, border: `1px solid #27AE60`, padding: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#27AE60' }}></div>
                  </div>
                  <span style={{ fontSize: 14, color: 'var(--text-dark)', fontWeight: 600 }}>{item.quantity} x {item.product_name}</span>
                </div>
                <span style={{ fontSize: 14, color: 'var(--text-dark)', fontWeight: 700 }}>Rs. {(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div style={{ height: 1, background: '#EAEAEA', marginBottom: 15 }}></div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 800, color: 'var(--text-dark)', marginBottom: 8 }}>
            <span>Total Amount Paid</span>
            <span>Rs. {order.total?.toFixed(2)}</span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', background: '#F5F5F0', padding: '8px 12px', borderRadius: 8, display: 'inline-block' }}>
            Payment Method: {order.payment_method || 'Cash On Delivery'}
          </div>
        </div>

      </div>
    </div>
  );
};

export default OrderDetails;
