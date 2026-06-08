import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Clock, Calendar, Star, CheckCircle, Truck, ArrowLeft, RefreshCw, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import orderService from '../../services/orderService';
import reviewService from '../../services/reviewService';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const CustomerOrders = () => {
  const { token } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState('All');

  // Modals
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [reviewData, setReviewData] = useState({ product_id: '', rating: 5, review: '' });
  const [reviewMsg, setReviewMsg] = useState('');

  const fetchOrders = async () => {
    if (!token) return;
    try {
      const res = await orderService.getAll();
      setOrders(res.data || []);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(() => {
      fetchOrders();
    }, 15000);
    return () => clearInterval(interval);
  }, [token]);

  const formatDate = (isoString) => {
    if (!isoString) return 'N/A';
    const d = new Date(isoString);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' });
  };

  const handleOpenReview = (order) => {
    setSelectedOrder(order);
    setReviewData({ product_id: order.items[0]?.product_id || '', rating: 5, review: '' });
    setReviewMsg('');
    setShowReviewModal(true);
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!reviewData.product_id) {
      setReviewMsg('Please select a product to review.');
      return;
    }
    try {
      await reviewService.create({
        product_id: reviewData.product_id,
        rating: reviewData.rating,
        review: reviewData.review
      });
      setReviewMsg('Review submitted successfully! Thank you.');
      setTimeout(() => {
        setShowReviewModal(false);
        setReviewMsg('');
      }, 2000);
    } catch (err) {
      setReviewMsg('Failed to submit review. Try again later.');
    }
  };

  const handleReorder = (order) => {
    if (!order.items || order.items.length === 0) return;
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

  const getStatusDisplay = (status) => {
    const s = status?.toLowerCase() || 'pending';
    if (s === 'delivered') return { text: 'Delivered', color: '#145A32', bg: '#EAF7EF', icon: <CheckCircle size={14}/> };
    if (s === 'cancelled') return { text: 'Cancelled', color: '#C0392B', bg: '#FDF2F0', icon: <XCircle size={14}/> };
    if (s === 'out for delivery') return { text: 'Out For Delivery', color: '#27AE60', bg: '#EAF7EF', icon: <Truck size={14}/> };
    if (s === 'packed') return { text: 'Packed', color: '#8E44AD', bg: '#F4ECF7', icon: <Package size={14}/> };
    if (s === 'preparing') return { text: 'Preparing', color: '#E67E22', bg: '#FEF5EB', icon: <Clock size={14}/> };
    return { text: 'Received', color: '#2980B9', bg: '#EBF5FB', icon: <Clock size={14}/> };
  };

  const filteredOrders = orders.filter(o => {
    const s = o.status?.toLowerCase() || 'pending';
    if (activeTab === 'Active') return !['delivered', 'cancelled'].includes(s);
    if (activeTab === 'Completed') return s === 'delivered';
    if (activeTab === 'Cancelled') return s === 'cancelled';
    return true; // 'All'
  });

  return (
    <div style={{ backgroundColor: '#F5F5F0', minHeight: '100vh', paddingBottom: 100 }}>
      {/* Header */}
      <div style={{ background: 'white', padding: '15px 20px', position: 'sticky', top: 0, zIndex: 100, display: 'flex', alignItems: 'center', gap: 15, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        <button onClick={() => navigate('/account')} style={{ background: 'none', border: 'none', color: 'var(--text-dark)', padding: 5, display: 'flex' }}>
          <ArrowLeft size={24} />
        </button>
        <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: 'var(--text-dark)' }}>My Orders</h2>
      </div>

      <div style={{ maxWidth: 600, margin: '0 auto', padding: '20px 15px' }}>
        
        {/* Tabs */}
        <div style={{ display: 'flex', overflowX: 'auto', gap: 10, paddingBottom: 10, marginBottom: 15, scrollbarWidth: 'none' }}>
          {['All', 'Active', 'Completed', 'Cancelled'].map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '8px 16px',
                borderRadius: 20,
                border: 'none',
                whiteSpace: 'nowrap',
                fontWeight: 700,
                fontSize: 14,
                background: activeTab === tab ? 'var(--text-dark)' : 'white',
                color: activeTab === tab ? 'white' : 'var(--text-muted)',
                boxShadow: activeTab === tab ? '0 4px 10px rgba(0,0,0,0.1)' : '0 2px 5px rgba(0,0,0,0.02)'
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px 0', color: 'var(--text-muted)' }}>
            <RefreshCw size={30} style={{ animation: 'spin 1s linear infinite' }} />
            <p style={{ marginTop: 15, fontWeight: 600 }}>Loading your delicious history...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: 20, boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
            <div style={{ fontSize: 60, marginBottom: 20 }}>🍽️</div>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-dark)', marginBottom: 10 }}>No {activeTab.toLowerCase()} orders</h3>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 20 }}>You haven't ordered any homestyle goodness from Amma's Kitchen yet.</p>
            <button onClick={() => navigate('/menu')} style={{ padding: '14px 30px', background: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: 16, fontWeight: 700 }}>
              Explore Menu
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {filteredOrders.map((order) => {
              const status = getStatusDisplay(order.status);
              const isActive = !['delivered', 'cancelled'].includes(order.status?.toLowerCase() || 'pending');

              return (
                <div key={order.id} onClick={() => navigate(`/order/${order.id}`)} style={{ background: 'white', borderRadius: 20, padding: 20, boxShadow: '0 2px 10px rgba(0,0,0,0.03)', cursor: 'pointer' }}>
                  {/* Card Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px dashed #EAEAEA', paddingBottom: 15, marginBottom: 15 }}>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-dark)', marginBottom: 4 }}>Order #{order.id}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Calendar size={12}/> {formatDate(order.created_at)}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: status.bg, color: status.color, padding: '6px 12px', borderRadius: 50, fontSize: 12, fontWeight: 700 }}>
                      {status.icon} {status.text}
                    </div>
                  </div>

                  {/* Card Body - Items */}
                  <div style={{ marginBottom: 15 }}>
                    <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 10 }}>
                      {order.items?.map(i => `${i.quantity} x ${i.product_name}`).join(', ')}
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-dark)' }}>₹{order.total.toFixed(2)}</div>
                    
                    <div style={{ display: 'flex', gap: 10 }}>
                      {isActive && (
                        <button onClick={(e) => { e.stopPropagation(); navigate(`/track-order/${order.id}`); }} style={{ padding: '8px 16px', background: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: 12, fontSize: 13, fontWeight: 700 }}>
                          Track Order
                        </button>
                      )}
                      {!isActive && (
                        <button onClick={(e) => { e.stopPropagation(); handleReorder(order); }} style={{ padding: '8px 16px', background: '#F5F5F0', color: 'var(--text-dark)', border: 'none', borderRadius: 12, fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <RefreshCw size={14}/> Reorder
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Review Modal */}
      <AnimatePresence>
        {showReviewModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 20 }}>
            <motion.div initial={{ y: 50, scale: 0.95 }} animate={{ y: 0, scale: 1 }} exit={{ y: 50, scale: 0.95 }} style={{ backgroundColor: '#fff', padding: '25px', borderRadius: '24px', width: '100%', maxWidth: '400px', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 15px 0' }}>Rate your meal</h3>
              {reviewMsg && <div style={{ padding: 10, background: '#F5F5F0', borderRadius: 8, fontSize: 13, marginBottom: 15, fontWeight: 600, color: 'var(--primary-color)' }}>{reviewMsg}</div>}
              <form onSubmit={submitReview}>
                <div style={{ marginBottom: 15 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>WHICH DISH?</label>
                  <select value={reviewData.product_id} onChange={(e) => setReviewData({...reviewData, product_id: e.target.value})} required style={{ width: '100%', padding: '12px', background: '#F5F5F0', border: '1px solid #EAEAEA', borderRadius: 12, fontSize: 14 }}>
                    <option value="">Select dish</option>
                    {selectedOrder?.items?.map(item => (
                      <option key={item.product_id} value={item.product_id}>{item.product_name}</option>
                    ))}
                  </select>
                </div>
                <div style={{ marginBottom: 15 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>RATING</label>
                  <select value={reviewData.rating} onChange={(e) => setReviewData({...reviewData, rating: Number(e.target.value)})} required style={{ width: '100%', padding: '12px', background: '#F5F5F0', border: '1px solid #EAEAEA', borderRadius: 12, fontSize: 14 }}>
                    <option value="5">⭐⭐⭐⭐⭐ Awesome</option>
                    <option value="4">⭐⭐⭐⭐ Good</option>
                    <option value="3">⭐⭐⭐ Okay</option>
                    <option value="2">⭐⭐ Bad</option>
                    <option value="1">⭐ Terrible</option>
                  </select>
                </div>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>YOUR FEEDBACK</label>
                  <textarea rows="3" placeholder="Tell us what you loved..." value={reviewData.review} onChange={(e) => setReviewData({...reviewData, review: e.target.value})} required style={{ width: '100%', padding: '12px', background: '#F5F5F0', border: '1px solid #EAEAEA', borderRadius: 12, fontSize: 14 }}></textarea>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button type="button" onClick={() => setShowReviewModal(false)} style={{ flex: 1, padding: '14px', background: '#F5F5F0', color: 'var(--text-dark)', border: 'none', borderRadius: 12, fontWeight: 700 }}>Cancel</button>
                  <button type="submit" style={{ flex: 1, padding: '14px', background: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: 12, fontWeight: 700 }}>Submit</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default CustomerOrders;
