import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ChevronLeft, Package, Clock, CheckCircle2, Phone, User as UserIcon } from 'lucide-react';
import api from '../../services/api';

const STAGES = [
  { id: 'Received', label: 'Order Received', icon: <Clock size={20} /> },
  { id: 'Preparing', label: 'Preparing Food', icon: <Package size={20} /> },
  { id: 'Packed', label: 'Packed', icon: <Package size={20} /> },
  { id: 'Out For Delivery', label: 'Out For Delivery', icon: <UserIcon size={20} /> },
  { id: 'Delivered', label: 'Delivered', icon: <CheckCircle2 size={20} /> }
];

const TrackOrder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  
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
        setError('Failed to load order tracking details.');
      } finally {
        setLoading(false);
      }
    };
    if (token) {
      fetchOrder();
      // Polling every 10 seconds for real-time tracking feel
      const interval = setInterval(fetchOrder, 10000);
      return () => clearInterval(interval);
    }
  }, [id, token]);

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

  // Map Backend Status to tracking stage
  // Backend typically uses: Pending -> Preparing -> Packed -> Out For Delivery -> Delivered
  let currentStatus = order.status || 'Pending';
  if (currentStatus === 'Pending') currentStatus = 'Received';

  let currentStageIndex = STAGES.findIndex(s => s.id.toLowerCase() === currentStatus.toLowerCase());
  
  const isCancelled = currentStatus.toLowerCase() === 'cancelled';
  if (isCancelled) currentStageIndex = -1; // Special case

  return (
    <div style={{ backgroundColor: '#F5F5F0', minHeight: '100vh', paddingBottom: 50 }}>
      {/* Header */}
      <div style={{ background: 'var(--primary-color)', padding: '20px 20px 40px', color: 'white', borderBottomLeftRadius: 24, borderBottomRightRadius: 24, boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 15, marginBottom: 20 }}>
          <button onClick={() => navigate('/orders')} style={{ background: 'none', border: 'none', padding: 0, color: 'white' }}>
            <ChevronLeft size={24} />
          </button>
          <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>Track Order</h2>
        </div>
        
        <div>
          <div style={{ fontSize: 13, opacity: 0.9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>Order #{order.id}</div>
          <div style={{ fontSize: 24, fontWeight: 800, marginTop: 4 }}>
            {isCancelled ? 'Order Cancelled' : STAGES[Math.max(0, currentStageIndex)]?.label || currentStatus}
          </div>
          <div style={{ fontSize: 14, opacity: 0.9, marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Clock size={14} /> Arriving in 30-45 mins
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 600, margin: '-20px auto 0', padding: '0 15px', position: 'relative', zIndex: 2 }}>
        
        {/* Timeline */}
        <div style={{ background: 'white', borderRadius: 20, padding: 24, marginBottom: 16, boxShadow: '0 4px 15px rgba(0,0,0,0.04)' }}>
          {isCancelled ? (
            <div style={{ color: 'var(--danger)', fontWeight: 700, textAlign: 'center', padding: 20 }}>
              This order was cancelled.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {STAGES.map((stage, idx) => {
                const isCompleted = idx <= currentStageIndex;
                const isCurrent = idx === currentStageIndex;
                const isLast = idx === STAGES.length - 1;

                return (
                  <div key={stage.id} style={{ display: 'flex', gap: 16, position: 'relative' }}>
                    {/* Line connecting circles */}
                    {!isLast && (
                      <div style={{ 
                        position: 'absolute', left: 15, top: 32, bottom: -8, width: 2, 
                        background: idx < currentStageIndex ? 'var(--primary-color)' : '#EAEAEA',
                        zIndex: 1
                      }} />
                    )}
                    
                    {/* Circle Icon */}
                    <div style={{ 
                      width: 32, height: 32, borderRadius: '50%', flexShrink: 0, zIndex: 2,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: isCompleted ? 'var(--primary-color)' : '#F5F5F0',
                      color: isCompleted ? 'white' : '#CCC',
                      border: isCurrent ? '4px solid #E6F4EA' : 'none',
                      boxShadow: isCurrent ? '0 0 0 2px var(--primary-color)' : 'none'
                    }}>
                      {isCompleted ? <CheckCircle2 size={16} /> : <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#CCC' }} />}
                    </div>

                    {/* Content */}
                    <div style={{ paddingBottom: 32, paddingTop: 6 }}>
                      <div style={{ fontSize: 15, fontWeight: isCompleted ? 800 : 600, color: isCompleted ? 'var(--text-dark)' : 'var(--text-muted)' }}>
                        {stage.label}
                      </div>
                      {isCurrent && stage.id === 'Preparing' && (
                         <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Chef is preparing your homestyle meal.</div>
                      )}
                      {isCurrent && stage.id === 'Out For Delivery' && (
                         <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Your delivery partner is on the way.</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Delivery Partner Info (Shows only if Out For Delivery) */}
        {currentStatus === 'Out For Delivery' && (
          <div style={{ background: 'white', borderRadius: 20, padding: 20, marginBottom: 16, boxShadow: '0 2px 10px rgba(0,0,0,0.02)', display: 'flex', alignItems: 'center', gap: 15 }}>
            <div style={{ width: 50, height: 50, borderRadius: '50%', background: '#F5F5F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <UserIcon size={24} color="var(--primary-color)" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-dark)' }}>Delivery Partner</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Assigned to your order</div>
            </div>
            <button style={{ background: '#E6F4EA', border: 'none', width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-color)' }}>
              <Phone size={18} fill="currentColor" />
            </button>
          </div>
        )}

        {/* Order Items Summary */}
        <div style={{ background: 'white', borderRadius: 20, padding: 20, boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
          <h3 style={{ fontSize: 15, fontWeight: 800, margin: '0 0 15px 0', color: 'var(--text-dark)' }}>Order Details</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {order.items.map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                <span style={{ color: 'var(--text-dark)', fontWeight: 600 }}>{item.quantity} x {item.product_name}</span>
                <span style={{ color: 'var(--text-muted)' }}>Rs. {item.price * item.quantity}</span>
              </div>
            ))}
            <div style={{ height: 1, background: '#EAEAEA', margin: '10px 0' }}></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, fontWeight: 800, color: 'var(--text-dark)' }}>
              <span>Total Amount</span>
              <span>Rs. {order.total}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default TrackOrder;
