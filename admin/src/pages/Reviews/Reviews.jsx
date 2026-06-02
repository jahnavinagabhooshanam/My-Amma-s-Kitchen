import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminNavbar from '../../components/AdminNavbar';
import apiClient from '../../services/api';
import '../../assets/styles/admin-style.css';
import '../../assets/styles/tables.css';
import { Star, CheckCircle, AlertTriangle, Send, X } from 'lucide-react';

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeReplyId, setActiveReplyId] = useState(null);
  const [replyText, setReplyText] = useState('');
  
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/reviews/');
      setReviews(response.data);
    } catch (err) {
      console.error("Failed to load reviews:", err);
      setErrorMsg("Failed to load reviews from database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleApprove = async (id) => {
    try {
      await apiClient.put(`/reviews/${id}/approve`);
      setSuccessMsg("Review approved successfully!");
      fetchReviews();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to approve review.");
    }
  };

  const handleReject = async (id) => {
    try {
      await apiClient.put(`/reviews/${id}/reject`);
      setSuccessMsg("Review rejected successfully!");
      fetchReviews();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to reject review.");
    }
  };

  const handleToggleFeature = async (id) => {
    try {
      await apiClient.put(`/reviews/${id}/feature`);
      setSuccessMsg("Review featured status updated successfully!");
      fetchReviews();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to update featured status.");
    }
  };

  const handleDeleteReview = async (id) => {
    if (!window.confirm("Permanently delete this customer review?")) return;
    try {
      await apiClient.delete(`/reviews/${id}`);
      setSuccessMsg("Review deleted successfully!");
      fetchReviews();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to delete review.");
    }
  };

  const handleOpenReply = (id) => {
    setActiveReplyId(id);
    setReplyText('');
  };

  const handleSendReply = async (e, id) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    try {
      await apiClient.post(`/reviews/${id}/reply`, { reply: replyText });
      setSuccessMsg("Reply dispatched successfully to customer's registered email!");
      setActiveReplyId(null);
      setReplyText('');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to dispatch reply message.");
    }
  };

  return (
    <div className="admin-wrapper">
      <AdminSidebar />
      <div className="admin-container">
        <AdminNavbar />
        
        <div className="admin-content">
          <div className="page-header">
            <div className="page-title-area">
              <h2>Customer Reviews Moderation</h2>
              <p>Approve testimonials, reject spam, reply directly to clients, and toggle gold-star features.</p>
            </div>
          </div>

          {successMsg && (
            <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#e2ebd9', color: '#1b3d2b', border: '1px solid var(--border-color)', padding: '12px 18px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', marginBottom: '20px' }}>
              <CheckCircle size={16} style={{ marginRight: '6px' }} /> {successMsg}
            </div>
          )}

          {errorMsg && (
            <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#fcdcd8', color: 'var(--danger-color)', border: '1px solid #f8b4ac', padding: '12px 18px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', marginBottom: '20px' }}>
              <AlertTriangle size={16} style={{ marginRight: '6px' }} /> {errorMsg}
            </div>
          )}

          {loading ? (
            <div style={{ height: '240px', backgroundColor: '#e2ebd9', borderRadius: '15px', animation: 'pulse 1.5s infinite' }} />
          ) : (
            <div className="premium-card">
              <div className="responsive-table-wrapper" style={{ border: 'none', boxShadow: 'none' }}>
                <table className="responsive-table">
                  <thead>
                    <tr>
                      <th>Customer Name</th>
                      <th>Product Name</th>
                      <th>Rating</th>
                      <th>Review Content</th>
                      <th>Featured</th>
                      <th>Status</th>
                      <th>Submitted Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reviews.map((r) => {
                      let statusClass = 'pending';
                      if (r.status?.toLowerCase() === 'approved') statusClass = 'approved';
                      if (r.status?.toLowerCase() === 'rejected') statusClass = 'rejected';

                      return (
                        <tr key={r.id}>
                          <td>
                            <strong>{r.user_name || 'Anonymous Customer'}</strong>
                            <div className="text-muted" style={{ fontSize: '11px' }}>User ID: #{r.user_id}</div>
                          </td>
                          <td>
                            <strong>{r.product_name || `Product #${r.product_id}`}</strong>
                          </td>
                          <td style={{ color: '#F1C40F', whiteSpace: 'nowrap' }}>
                            {Array(r.rating || 5).fill().map((_, i) => (
                              <Star key={i} size={14} fill="#F1C40F" />
                            ))}
                          </td>
                          <td style={{ maxWidth: '280px', fontSize: '13px' }}>
                            <div style={{ fontStyle: 'italic', marginBottom: '6px' }}>"{r.review}"</div>
                            {activeReplyId === r.id && (
                              <form onSubmit={(e) => handleSendReply(e, r.id)} style={{ marginTop: '10px' }}>
                                <textarea 
                                  className="form-control" 
                                  rows="2" 
                                  required 
                                  value={replyText}
                                  onChange={(e) => setReplyText(e.target.value)}
                                  placeholder="Type email response to client..."
                                  style={{ width: '100%', fontSize: '12px', padding: '8px', borderRadius: '6px', border: '1px solid #EAE6DB' }}
                                />
                                <div style={{ display: 'flex', gap: '5px', marginTop: '5px' }}>
                                  <button type="submit" className="th-btn" style={{ padding: '4px 10px', fontSize: '11px', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                    <Send size={10} /> Send Response
                                  </button>
                                  <button type="button" onClick={() => setActiveReplyId(null)} className="btn-secondary" style={{ padding: '4px 10px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                    <X size={10} /> Cancel
                                  </button>
                                </div>
                              </form>
                            )}
                          </td>
                          <td>
                            <span 
                              style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px', fontWeight: '700', color: r.is_featured ? '#F1C40F' : '#ccc' }}
                              onClick={() => handleToggleFeature(r.id)}
                              title="Click to toggle featured rating badge"
                            >
                              <Star size={14} fill={r.is_featured ? '#F1C40F' : 'none'} />
                              {r.is_featured ? 'Featured' : 'Regular'}
                            </span>
                          </td>
                          <td>
                            <span className={`badge-status ${statusClass}`}>
                              {r.status || 'Pending'}
                            </span>
                          </td>
                          <td className="text-muted" style={{ fontSize: '12px' }}>
                            {r.created_at ? new Date(r.created_at).toLocaleDateString() : 'N/A'}
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                              {r.status !== 'Approved' && (
                                <button onClick={() => handleApprove(r.id)} className="btn-secondary" style={{ padding: '5px 10px', fontSize: '11px', color: 'var(--theme-color)', borderColor: 'var(--border-color)' }}>
                                  Approve
                                </button>
                              )}
                              {r.status !== 'Rejected' && (
                                <button onClick={() => handleReject(r.id)} className="btn-secondary text-danger" style={{ padding: '5px 10px', fontSize: '11px' }}>
                                  Reject
                                </button>
                              )}
                              <button onClick={() => handleOpenReply(r.id)} className="btn-secondary" style={{ padding: '5px 10px', fontSize: '11px' }}>
                                Reply
                              </button>
                              <button onClick={() => handleDeleteReview(r.id)} className="btn-secondary text-danger" style={{ padding: '5px 10px', fontSize: '11px' }}>
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}

                    {reviews.length === 0 && (
                      <tr>
                        <td colSpan="8" className="text-center text-muted" style={{ padding: '45px' }}>
                          No customer reviews submitted yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="admin-footer">
          <div>&copy; 2026 <strong>Amma's Kitchen Admin</strong>. All Rights Reserved.</div>
        </div>
      </div>
    </div>
  );
};

export default Reviews;
