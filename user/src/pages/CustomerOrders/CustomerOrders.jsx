import React, { useState, useEffect } from 'react';
import { Package, Eye, Clock, Calendar, Star, MessageSquare } from 'lucide-react';
import orderService from '../../services/orderService';
import reviewService from '../../services/reviewService';
import { useAuth } from '../../context/AuthContext';

const CustomerOrders = () => {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Review Modal State
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
    // Poll for order updates every 10 seconds
    const interval = setInterval(() => {
      fetchOrders();
    }, 10000);
    return () => clearInterval(interval);
  }, [token]);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'status-pending';
      case 'preparing': return 'status-processing';
      case 'ready': return 'status-shipped';
      case 'out for delivery': return 'status-shipped';
      case 'delivered': return 'status-delivered';
      case 'cancelled': return 'status-cancelled';
      default: return 'status-pending';
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return 'N/A';
    const d = new Date(isoString);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
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

  return (
    <div className="orders-page space" style={{ backgroundColor: '#FCFBF7', minHeight: '80vh', position: 'relative' }}>
      <div className="container">
        
        <div className="title-area style9 text-center mb-40">
          <span className="sub-title">Order History</span>
          <h1 className="sec-title" style={{ fontSize: '2.5rem', color: 'var(--primary-dark)', marginTop: '8px' }}>
            My Orders
          </h1>
          <p className="text-muted" style={{ maxWidth: '600px', margin: '12px auto 0' }}>
            Review, track, or reorder item mixtures from your current and previous breakfasts.
          </p>
        </div>

        <div className="row gy-4 justify-content-center">
          <div className="col-lg-10">
            {loading ? (
              <div className="text-center py-5">Loading orders...</div>
            ) : orders.length === 0 ? (
              <div className="card text-center" style={{ padding: '60px 30px', backgroundColor: '#FFFFFF', border: '1px solid #EAE6DB', borderRadius: '15px' }}>
                <Package size={56} style={{ color: 'var(--primary-color)', margin: '0 auto', opacity: 0.3 }} />
                <h3 className="title-md" style={{ color: 'var(--primary-dark)', marginTop: '20px' }}>No Orders Found</h3>
                <p className="text-muted" style={{ marginTop: '12px' }}>
                  Looks like you haven't placed any orders yet. Try one of Amma's specialty breakfast items today!
                </p>
              </div>
            ) : (
              <div className="card" style={{ padding: '20px', backgroundColor: '#FFFFFF', border: '1px solid #EAE6DB', borderRadius: '15px' }}>
                <div className="responsive-table-wrapper" style={{ border: 'none', boxShadow: 'none' }}>
                  <table className="responsive-table">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Order Date</th>
                        <th>Items Purchased</th>
                        <th>Amount Paid</th>
                        <th>Status</th>
                        <th className="text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr key={order.id}>
                          <td style={{ fontWeight: '700' }}>#{order.id}</td>
                          <td>
                            <div className="flex gap-1" style={{ alignItems: 'center', fontSize: '13px' }}>
                              <Calendar size={13} className="text-muted" /> {formatDate(order.created_at)}
                            </div>
                          </td>
                          <td style={{ fontSize: '13px', maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {order.items && order.items.map(item => `${item.quantity}x ${item.product_name}`).join(', ')}
                          </td>
                          <td style={{ fontWeight: '700', color: 'var(--primary-color)' }}>₹{order.total.toFixed(2)}</td>
                          <td>
                            <span className={`status-badge ${getStatusColor(order.status)}`} style={{ padding: '4px 10px', fontSize: '11px' }}>
                              {order.status}
                            </span>
                          </td>
                          <td className="text-end">
                            <div className="flex justify-content-end gap-2">
                              <button className="icon-btn text-primary" style={{ backgroundColor: 'transparent', border: 'none', cursor: 'pointer' }} title="View details">
                                <Eye size={16} />
                              </button>
                              {order.status?.toLowerCase() === 'delivered' && (
                                <button 
                                  onClick={() => handleOpenReview(order)}
                                  className="th-btn" 
                                  style={{ padding: '4px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                                >
                                  <Star size={12} fill="currentColor" /> Review
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {showReviewModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div className="card" style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '15px', width: '90%', maxWidth: '500px' }}>
            <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '10px' }}>Leave a Review</h3>
            {reviewMsg && <div className="alert alert-info">{reviewMsg}</div>}
            <form onSubmit={submitReview}>
              <div className="form-group mb-3">
                <label>Select Product</label>
                <select 
                  className="form-select" 
                  value={reviewData.product_id}
                  onChange={(e) => setReviewData({...reviewData, product_id: e.target.value})}
                  required
                >
                  <option value="">-- Choose Product --</option>
                  {selectedOrder?.items?.map(item => (
                    <option key={item.product_id} value={item.product_id}>{item.product_name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group mb-3">
                <label>Rating (1-5 Stars)</label>
                <select 
                  className="form-select" 
                  value={reviewData.rating}
                  onChange={(e) => setReviewData({...reviewData, rating: Number(e.target.value)})}
                  required
                >
                  <option value="5">⭐⭐⭐⭐⭐ (5) Amazing</option>
                  <option value="4">⭐⭐⭐⭐ (4) Good</option>
                  <option value="3">⭐⭐⭐ (3) Average</option>
                  <option value="2">⭐⭐ (2) Below Average</option>
                  <option value="1">⭐ (1) Poor</option>
                </select>
              </div>
              <div className="form-group mb-3">
                <label>Your Review</label>
                <textarea 
                  className="form-control" 
                  rows="3" 
                  placeholder="How was the taste and quality?" 
                  value={reviewData.review}
                  onChange={(e) => setReviewData({...reviewData, review: e.target.value})}
                  required
                ></textarea>
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="submit" className="th-btn" style={{ flex: 1 }}>Submit Review</button>
                <button type="button" className="th-btn style10" style={{ flex: 1 }} onClick={() => setShowReviewModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerOrders;
