import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import AdminNavbar from '../../components/AdminNavbar';
import apiClient from '../../services/api';
import '../../assets/styles/admin-style.css';
import '../../assets/styles/tables.css';
import { 
  Search, 
  MapPin, 
  Mail, 
  Phone, 
  Pencil, 
  ShieldOff, 
  Shield, 
  Trash2, 
  MoreVertical, 
  X, 
  Save, 
  CheckCircle, 
  AlertTriangle,
  Star,
  Send,
  Eye,
  ShoppingBag,
  TrendingUp,
  Activity
} from 'lucide-react';

const Customers = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const activeTabParam = searchParams.get('tab') || 'directory';

  const [activeTab, setActiveTab] = useState('directory'); // 'directory', 'reviews'

  // Master lists
  const [customers, setCustomers] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filtering
  const [searchQuery, setSearchQuery] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [activeDropdown, setActiveDropdown] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modals & form state
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [formData, setFormData] = useState({ name: '', phone: '', is_blocked: false });
  
  // Customer details modal (deep analytics)
  const [selectedCustDetail, setSelectedCustDetail] = useState(null);

  // Review reply state
  const [activeReplyId, setActiveReplyId] = useState(null);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    setActiveTab(activeTabParam);
    setCurrentPage(1);
  }, [activeTabParam, searchQuery]);

  const fetchAllData = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const customersRes = await apiClient.get('/customers/');
      setCustomers(customersRes.data);

      const reviewsRes = await apiClient.get('/reviews/');
      setReviews(reviewsRes.data);

      const ordersRes = await apiClient.get('/orders/');
      setOrders(ordersRes.data);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to load customer profiles and moderation databases.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Customer Management actions
  const handleOpenEditModal = (cust) => {
    setEditingCustomer(cust);
    setFormData({
      name: cust.name,
      phone: cust.phone || '',
      is_blocked: cust.is_blocked || false
    });
    setErrorMsg('');
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      setErrorMsg("Customer name is required.");
      return;
    }
    try {
      await apiClient.put(`/customers/${editingCustomer.id}`, {
        name: formData.name,
        phone: formData.phone,
        is_blocked: formData.is_blocked
      });
      setSuccessMsg("Customer details updated successfully!");
      setEditingCustomer(null);
      fetchAllData();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to save customer updates.");
    }
  };

  const handleToggleBlock = async (cust) => {
    try {
      const response = await apiClient.put(`/customers/${cust.id}/toggle-block`);
      setSuccessMsg(`Customer ${cust.name} has been ${response.data.is_blocked ? 'Blocked' : 'Unblocked'}`);
      fetchAllData();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to change customer block status.");
    }
  };

  const handleDeleteCustomer = async (id) => {
    if (!window.confirm("Permanently delete this customer account? This action cannot be undone.")) return;
    try {
      await apiClient.delete(`/customers/${id}`);
      setSuccessMsg("Customer account deleted.");
      fetchAllData();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to delete customer profile.");
    }
  };

  // Reviews Moderation actions
  const handleReviewApprove = async (id) => {
    try {
      await apiClient.put(`/reviews/${id}/approve`);
      setSuccessMsg("Review approved successfully!");
      fetchAllData();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to approve review.");
    }
  };

  const handleReviewReject = async (id) => {
    try {
      await apiClient.put(`/reviews/${id}/reject`);
      setSuccessMsg("Review rejected successfully!");
      fetchAllData();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to reject review.");
    }
  };

  const handleReviewToggleFeature = async (id) => {
    try {
      await apiClient.put(`/reviews/${id}/feature`);
      setSuccessMsg("Review featured status updated successfully!");
      fetchAllData();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to update featured status.");
    }
  };

  const handleReviewDelete = async (id) => {
    if (!window.confirm("Permanently delete this customer review?")) return;
    try {
      await apiClient.delete(`/reviews/${id}`);
      setSuccessMsg("Review deleted successfully!");
      fetchAllData();
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

  // Searching logic
  const getFilteredCustomers = () => {
    return customers.filter(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone?.includes(searchQuery)
    );
  };

  const getFilteredReviews = () => {
    return reviews.filter(r => 
      r.user_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.product_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.review?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const filteredCustomers = getFilteredCustomers();
  const filteredReviews = getFilteredReviews();

  // Load customer deep analytics modal
  const openCustDetailModal = (cust) => {
    // Filter customer specific orders and reviews
    const custOrders = orders.filter(o => o.customer_id === cust.id);
    const custReviews = reviews.filter(r => r.user_id === cust.id);
    
    // Average order value
    const totalSpent = cust.total_spent || 0;
    const orderCount = cust.orders_count || 0;
    const aov = orderCount > 0 ? (totalSpent / orderCount) : 0;

    // Simulate logs / activity feed
    const custActivity = [];
    if (cust.created_at) {
      custActivity.push({
        event: "Account Registered",
        time: new Date(cust.created_at).toLocaleString(),
        desc: "Profile created with status Active."
      });
    }
    custOrders.forEach(o => {
      custActivity.push({
        event: "Placed Purchase",
        time: o.created_at ? new Date(o.created_at).toLocaleString() : 'N/A',
        desc: `Order #ORD-${o.id} for ₹${o.total.toFixed(2)} (${o.status})`
      });
    });
    custReviews.forEach(r => {
      custActivity.push({
        event: "Dishes Review",
        time: r.created_at ? new Date(r.created_at).toLocaleString() : 'N/A',
        desc: `Rated "${r.product_name || `Product #${r.product_id}`}" with ${r.rating} stars.`
      });
    });

    // Sort activity chronologically
    custActivity.sort((a, b) => new Date(b.time) - new Date(a.time));

    setSelectedCustDetail({
      profile: cust,
      orders: custOrders,
      reviews: custReviews,
      aov,
      activity: custActivity.slice(0, 10)
    });
  };

  return (
    <div className="admin-wrapper">
      <AdminSidebar />
      <div className="admin-container">
        <AdminNavbar />

        <div className="admin-content">
          <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
            <div className="page-title-area">
              <h2>
                {activeTab === 'reviews' ? 'Storefront Reviews Moderation' : 
                 activeTab === 'analytics' ? 'Customer Base Analytics' :
                 activeTab === 'activity' ? 'Customer Activities Feed' :
                 'Registered Customers Registry'}
              </h2>
              <p>
                {activeTab === 'reviews' ? 'Approve client testimonials, reject spam ratings, and reply directly via email.' : 
                 activeTab === 'analytics' ? 'Review registered metrics, lifespan values, and top customer revenues.' :
                 activeTab === 'activity' ? 'Observe real-time customer activities, registrations, purchases, and reviews.' :
                 'Review customer accounts, total spends, average order metrics, and toggle security blockages.'}
              </p>
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

          {/* Tab Selection */}
          <div style={{ display: 'flex', gap: '15px', borderBottom: '2px solid #EAE6DB', marginBottom: '25px', paddingBottom: '0', flexWrap: 'wrap' }}>
            {[
              { id: 'directory', label: 'Customer List' },
              { id: 'reviews', label: 'Customer Reviews' },
              { id: 'analytics', label: 'Customer Analytics' },
              { id: 'activity', label: 'Customer Activity' }
            ].map(tabItem => (
              <button 
                key={tabItem.id}
                onClick={() => navigate(`/admin/customers?tab=${tabItem.id}`)}
                style={{
                  padding: '10px 20px', fontSize: '14px', fontWeight: '700', border: 'none', background: 'none',
                  borderBottom: activeTab === tabItem.id ? '3px solid var(--primary-color)' : '3px solid transparent',
                  color: activeTab === tabItem.id ? 'var(--primary-color)' : '#7E7A6B', cursor: 'pointer', fontFamily: "'Outfit', sans-serif"
                }}
              >
                {tabItem.label}
              </button>
            ))}
          </div>

          {/* Table Toolbar */}
          {(activeTab === 'directory' || activeTab === 'reviews') && (
            <div className="premium-card" style={{ padding: '15px 25px', marginBottom: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
              <div className="navbar-search" style={{ margin: 0, width: '320px', border: '1px solid #EAE6DB', borderRadius: '10px', display: 'flex', alignItems: 'center' }}>
                <Search size={16} style={{ marginRight: '8px', color: '#888' }} />
                <input 
                  type="text" 
                  placeholder={activeTab === 'reviews' ? "Search reviews content, users..." : "Search customer name, email, phone..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>
              <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--body-color)' }}>
                {activeTab === 'reviews' ? 
                  `Showing ${filteredReviews.length} Testimonial Reviews` : 
                  `Showing ${filteredCustomers.length} Registered Customer Profiles`}
              </div>
            </div>
          )}

          {loading ? (
            <div style={{ height: '240px', backgroundColor: '#e2ebd9', borderRadius: '15px', animation: 'pulse 1.5s infinite' }} />
          ) : (
            <div className="premium-card" style={{ padding: (activeTab === 'analytics' || activeTab === 'activity') ? '25px' : '0', margin: 0 }}>
              
              {/* Tab 1: Customers directory table */}
              {activeTab === 'directory' && (
                <div className="responsive-table-wrapper" style={{ border: 'none', boxShadow: 'none' }}>
                  <table className="responsive-table">
                    <thead>
                      <tr>
                        <th>Customer ID</th>
                        <th>Customer Details</th>
                        <th>Contact Info</th>
                        <th>Total Orders</th>
                        <th>Total Spend</th>
                        <th>Access Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCustomers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((cust) => (
                        <tr key={cust.id}>
                          <td>#CUST-{cust.id}</td>
                          <td>
                            <strong>{cust.name}</strong>
                            <div className="text-muted" style={{ fontSize: '11px', lineHeight: '1.4', maxWidth: '280px', textOverflow: 'ellipsis', overflow: 'hidden', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                              <MapPin size={10} /> {cust.address || 'Address not listed'}
                            </div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Mail size={11} style={{ color: '#888' }} /> {cust.email}</div>
                            <div className="text-muted" style={{ fontSize: '12px', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}><Phone size={11} /> {cust.phone || 'No Mobile'}</div>
                          </td>
                          <td style={{ fontWeight: '600' }}>{cust.orders_count} orders</td>
                          <td style={{ fontWeight: '800', color: 'var(--theme-color)', fontSize: '15px' }}>
                            ₹{cust.total_spent.toFixed(2)}
                          </td>
                          <td>
                            <span className={`badge-status ${cust.is_blocked ? 'inactive' : 'approved'}`}>
                              {cust.is_blocked ? 'Blocked' : 'Active'}
                            </span>
                          </td>
                          <td>
                            <div style={{ position: 'relative', display: 'inline-block' }} onMouseLeave={() => setActiveDropdown(null)}>
                              <button
                                onClick={() => setActiveDropdown(activeDropdown === cust.id ? null : cust.id)}
                                className="btn-secondary"
                                style={{ padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                              >
                                <MoreVertical size={14} /> Actions
                              </button>
                              {activeDropdown === cust.id && (
                                <div style={{ position: 'absolute', right: 0, top: '30px', backgroundColor: '#fff', border: '1px solid #EAE6DB', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 100, minWidth: '160px', display: 'flex', flexDirection: 'column', padding: '4px 0' }}>
                                  <button onClick={() => { openCustDetailModal(cust); setActiveDropdown(null); }} style={{ padding: '8px 12px', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#333' }}>
                                    <Eye size={12} /> View Profiles & Stats
                                  </button>
                                  <button onClick={() => { handleOpenEditModal(cust); setActiveDropdown(null); }} style={{ padding: '8px 12px', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#333' }}>
                                    <Pencil size={12} /> Edit Details
                                  </button>
                                  <button onClick={() => { handleToggleBlock(cust); setActiveDropdown(null); }} style={{ padding: '8px 12px', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: cust.is_blocked ? '#196F3D' : '#7D6608' }}>
                                    {cust.is_blocked ? <Shield size={12} /> : <ShieldOff size={12} />} {cust.is_blocked ? 'Unblock Access' : 'Block Access'}
                                  </button>
                                  <button onClick={() => { handleDeleteCustomer(cust.id); setActiveDropdown(null); }} style={{ padding: '8px 12px', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#78281F', borderTop: '1px solid #FAF8F2' }}>
                                    <Trash2 size={12} /> Delete Account
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredCustomers.length === 0 && (
                        <tr>
                          <td colSpan="7" className="text-center text-muted" style={{ padding: '40px' }}>No customer profiles match search.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Tab 2: Reviews moderation table */}
              {activeTab === 'reviews' && (
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
                        <th>Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredReviews.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((r) => {
                        let statusClass = 'pending';
                        if (r.status?.toLowerCase() === 'approved') statusClass = 'approved';
                        if (r.status?.toLowerCase() === 'rejected') statusClass = 'rejected';

                        return (
                          <tr key={r.id}>
                            <td>
                              <strong>{r.user_name || 'Anonymous Customer'}</strong>
                              <div className="text-muted" style={{ fontSize: '11px' }}>User ID: #{r.user_id}</div>
                            </td>
                            <td><strong>{r.product_name || `Product #${r.product_id}`}</strong></td>
                            <td style={{ color: '#F1C40F', whiteSpace: 'nowrap' }}>
                              {Array(r.rating || 5).fill().map((_, i) => (
                                <Star key={i} size={13} fill="#F1C40F" color="#F1C40F" />
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
                                    <button type="button" onClick={() => setActiveReplyId(null)} className="btn-secondary" style={{ padding: '4px 10px', fontSize: '11px' }}>
                                      Cancel
                                    </button>
                                  </div>
                                </form>
                              )}
                            </td>
                            <td>
                              <span 
                                style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px', fontWeight: '700', color: r.is_featured ? '#F1C40F' : '#ccc' }}
                                onClick={() => handleReviewToggleFeature(r.id)}
                                title="Toggle gold-star banner"
                              >
                                <Star size={13} fill={r.is_featured ? '#F1C40F' : 'none'} />
                                {r.is_featured ? 'Featured' : 'Regular'}
                              </span>
                            </td>
                            <td>
                              <span className={`badge-status ${statusClass}`}>{r.status || 'Pending'}</span>
                            </td>
                            <td className="text-muted" style={{ fontSize: '12px' }}>
                              {r.created_at ? new Date(r.created_at).toLocaleDateString() : 'N/A'}
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                                {r.status !== 'Approved' && (
                                  <button onClick={() => handleReviewApprove(r.id)} className="btn-secondary" style={{ padding: '5px 10px', fontSize: '11px', color: 'var(--theme-color)', borderColor: 'var(--border-color)' }}>
                                    Approve
                                  </button>
                                )}
                                {r.status !== 'Rejected' && (
                                  <button onClick={() => handleReviewReject(r.id)} className="btn-secondary text-danger" style={{ padding: '5px 10px', fontSize: '11px' }}>
                                    Reject
                                  </button>
                                )}
                                <button onClick={() => handleOpenReply(r.id)} className="btn-secondary" style={{ padding: '5px 10px', fontSize: '11px' }}>
                                  Reply
                                </button>
                                <button onClick={() => handleReviewDelete(r.id)} className="btn-secondary text-danger" style={{ padding: '5px 10px', fontSize: '11px' }}>
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {filteredReviews.length === 0 && (
                        <tr>
                          <td colSpan="8" className="text-center text-muted" style={{ padding: '40px' }}>No reviews submitted yet.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Tab 3: Customer Analytics */}
              {activeTab === 'analytics' && (
                <div style={{ padding: '10px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '25px' }}>
                    <div style={{ backgroundColor: '#FAF8F2', border: '1px solid #EAE6DB', borderRadius: '12px', padding: '15px', textAlign: 'center' }}>
                      <span style={{ fontSize: '12px', fontWeight: '600', color: '#666', display: 'block', marginBottom: '5px' }}>Total Registered</span>
                      <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--title-color)' }}>{customers.length}</div>
                    </div>
                    <div style={{ backgroundColor: '#FAF8F2', border: '1px solid #EAE6DB', borderRadius: '12px', padding: '15px', textAlign: 'center' }}>
                      <span style={{ fontSize: '12px', fontWeight: '600', color: '#666', display: 'block', marginBottom: '5px' }}>Active Profiles</span>
                      <div style={{ fontSize: '20px', fontWeight: '800', color: '#3f9065' }}>{customers.filter(c => !c.is_blocked).length}</div>
                    </div>
                    <div style={{ backgroundColor: '#FAF8F2', border: '1px solid #EAE6DB', borderRadius: '12px', padding: '15px', textAlign: 'center' }}>
                      <span style={{ fontSize: '12px', fontWeight: '600', color: '#666', display: 'block', marginBottom: '5px' }}>Blocked Profiles</span>
                      <div style={{ fontSize: '20px', fontWeight: '800', color: '#e63946' }}>{customers.filter(c => c.is_blocked).length}</div>
                    </div>
                    <div style={{ backgroundColor: '#FAF8F2', border: '1px solid #EAE6DB', borderRadius: '12px', padding: '15px', textAlign: 'center' }}>
                      <span style={{ fontSize: '12px', fontWeight: '600', color: '#666', display: 'block', marginBottom: '5px' }}>Average Lifespan Value</span>
                      <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--theme-color)' }}>
                        ₹{customers.length > 0 ? (customers.reduce((acc, c) => acc + (c.total_spent || 0), 0) / customers.length).toFixed(2) : '0.00'}
                      </div>
                    </div>
                  </div>

                  <h3 style={{ fontSize: '16px', margin: '20px 0 15px 0' }}>Top Customer Valuations</h3>
                  <div className="responsive-table-wrapper" style={{ border: 'none', boxShadow: 'none' }}>
                    <table className="responsive-table">
                      <thead>
                        <tr>
                          <th>Customer</th>
                          <th>Contact</th>
                          <th>Total Orders</th>
                          <th>Total Spends</th>
                          <th>AOV</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[...customers]
                          .sort((a, b) => b.total_spent - a.total_spent)
                          .slice(0, 5)
                          .map(cust => (
                            <tr key={cust.id}>
                              <td><strong>{cust.name}</strong></td>
                              <td>{cust.email}</td>
                              <td>{cust.orders_count} orders</td>
                              <td style={{ fontWeight: '700', color: 'var(--primary-color)' }}>₹{cust.total_spent.toFixed(2)}</td>
                              <td>₹{cust.orders_count > 0 ? (cust.total_spent / cust.orders_count).toFixed(2) : '0.00'}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Tab 4: Customer Activity */}
              {activeTab === 'activity' && (
                <div style={{ padding: '10px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {(() => {
                      const feed = [];
                      customers.forEach(c => {
                        if (c.created_at) {
                          feed.push({
                            type: 'register',
                            time: new Date(c.created_at),
                            title: 'New User Registration',
                            desc: `${c.name} (${c.email}) joined the Hotel Amma's Kitchen platform.`
                          });
                        }
                      });
                      orders.forEach(o => {
                        if (o.created_at) {
                          feed.push({
                            type: 'order',
                            time: new Date(o.created_at),
                            title: 'Customer Order Checkout',
                            desc: `${o.customer_name} placed order #ORD-${o.id} for ₹${o.total.toFixed(2)}.`
                          });
                        }
                      });
                      reviews.forEach(r => {
                        if (r.created_at) {
                          feed.push({
                            type: 'review',
                            time: new Date(r.created_at),
                            title: 'Customer Review Posted',
                            desc: `${r.user_name} rated "${r.product_name}" with ${r.rating} stars.`
                          });
                        }
                      });

                      const sortedFeed = feed
                        .sort((a, b) => b.time - a.time)
                        .slice(0, 20);

                      if (sortedFeed.length === 0) {
                        return <div className="text-muted" style={{ padding: '20px', textAlign: 'center' }}>No customer activities logged yet.</div>;
                      }

                      return sortedFeed.map((activity, idx) => (
                        <div key={idx} style={{
                          padding: '15px 20px',
                          border: '1px solid #EAE6DB',
                          backgroundColor: '#FAF8F2',
                          borderRadius: '10px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <div>
                            <span style={{
                              fontSize: '11px',
                              fontWeight: '700',
                              textTransform: 'uppercase',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              marginRight: '10px',
                              backgroundColor: activity.type === 'register' ? '#EBF5FB' : activity.type === 'order' ? '#E8F8F5' : '#FEF9E7',
                              color: activity.type === 'register' ? '#1B4F72' : activity.type === 'order' ? '#0E6251' : '#7D6608'
                            }}>{activity.type}</span>
                            <strong>{activity.title}</strong>
                            <p className="text-muted" style={{ margin: '5px 0 0 0', fontSize: '13px' }}>{activity.desc}</p>
                          </div>
                          <span style={{ fontSize: '12px', color: '#888' }}>{activity.time.toLocaleString()}</span>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              )}

              {/* Pagination Controls */}
              {(activeTab === 'directory' || activeTab === 'reviews') && Math.ceil((activeTab === 'reviews' ? filteredReviews.length : filteredCustomers.length) / itemsPerPage) > 1 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', padding: '15px 25px', borderTop: '1px solid #FAF8F2', flexWrap: 'wrap', gap: '15px' }}>
                  <div style={{ fontSize: '13px', color: '#666' }}>
                    Showing {Math.min((currentPage - 1) * itemsPerPage + 1, activeTab === 'reviews' ? filteredReviews.length : filteredCustomers.length)} to {Math.min(currentPage * itemsPerPage, activeTab === 'reviews' ? filteredReviews.length : filteredCustomers.length)} of {activeTab === 'reviews' ? filteredReviews.length : filteredCustomers.length} entries
                  </div>
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <button 
                      disabled={currentPage === 1} 
                      onClick={() => setCurrentPage(prev => prev - 1)}
                      style={{ padding: '6px 12px', fontSize: '12px', border: '1px solid #EAE6DB', borderRadius: '6px', backgroundColor: currentPage === 1 ? '#FAF8F2' : '#fff', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', color: currentPage === 1 ? '#aaa' : '#333' }}
                    >
                      Previous
                    </button>
                    {Array.from({ length: Math.ceil((activeTab === 'reviews' ? filteredReviews.length : filteredCustomers.length) / itemsPerPage) }, (_, i) => i + 1).map(page => (
                      <button 
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        style={{ padding: '6px 12px', fontSize: '12px', border: '1px solid', borderColor: currentPage === page ? 'var(--primary-color)' : '#EAE6DB', borderRadius: '6px', backgroundColor: currentPage === page ? 'var(--primary-color)' : '#fff', color: currentPage === page ? '#fff' : '#333', fontWeight: currentPage === page ? '700' : 'normal', cursor: 'pointer' }}
                      >
                        {page}
                      </button>
                    ))}
                    <button 
                      disabled={currentPage === Math.ceil((activeTab === 'reviews' ? filteredReviews.length : filteredCustomers.length) / itemsPerPage)} 
                      onClick={() => setCurrentPage(prev => prev + 1)}
                      style={{ padding: '6px 12px', fontSize: '12px', border: '1px solid #EAE6DB', borderRadius: '6px', backgroundColor: currentPage === Math.ceil((activeTab === 'reviews' ? filteredReviews.length : filteredCustomers.length) / itemsPerPage) ? '#FAF8F2' : '#fff', cursor: currentPage === Math.ceil((activeTab === 'reviews' ? filteredReviews.length : filteredCustomers.length) / itemsPerPage) ? 'not-allowed' : 'pointer', color: currentPage === Math.ceil((activeTab === 'reviews' ? filteredReviews.length : filteredCustomers.length) / itemsPerPage) ? '#aaa' : '#333' }}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}
        </div>

        {/* Edit profile info modal */}
        {editingCustomer && (
          <div className="admin-modal show">
            <div className="admin-modal-content">
              <div className="admin-modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3>Edit Customer Info</h3>
                <button className="admin-modal-close" onClick={() => setEditingCustomer(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'inline-flex' }}>
                  <X size={18} />
                </button>
              </div>
              <form onSubmit={handleFormSubmit}>
                <div className="admin-modal-body">
                  <div className="form-field">
                    <label>Full Name *</label>
                    <input 
                      type="text" 
                      required 
                      value={formData.name} 
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                    />
                  </div>
                  <div className="form-field">
                    <label>Mobile Number</label>
                    <input 
                      type="text" 
                      value={formData.phone} 
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })} 
                    />
                  </div>
                  <div className="form-field">
                    <label>Access Control</label>
                    <select 
                      value={formData.is_blocked} 
                      onChange={(e) => setFormData({ ...formData, is_blocked: e.target.value === 'true' })}
                      style={{ height: '38px', background: '#fff', width: '100%', padding: '8px', border: '1px solid #EAE6DB', borderRadius: '8px' }}
                    >
                      <option value="false">Active Access</option>
                      <option value="true">Block Access</option>
                    </select>
                  </div>
                </div>
                <div className="admin-modal-footer">
                  <button type="button" className="btn-secondary" onClick={() => setEditingCustomer(null)}>Cancel</button>
                  <button type="submit" className="page-action-btn" style={{ borderRadius: '20px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <Save size={16} /> Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Deep Analytics Details Modal */}
        {selectedCustDetail && (
          <div className="admin-modal show">
            <div className="admin-modal-content" style={{ maxWidth: '850px', width: '95%' }}>
              <div className="admin-modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3>Customer Analytics Card: #{selectedCustDetail.profile.name}</h3>
                <button className="admin-modal-close" onClick={() => setSelectedCustDetail(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  <X size={18} />
                </button>
              </div>

              <div className="admin-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Contact and address */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '20px' }}>
                  <div>
                    <h4 style={{ margin: '0 0 10px', fontSize: '14px', color: 'var(--title-color)' }}>Personal Profile Details</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                      <div>Email: <strong>{selectedCustDetail.profile.email}</strong></div>
                      <div>Phone: <strong>{selectedCustDetail.profile.phone || 'N/A'}</strong></div>
                      <div>Delivery Address: <strong>{selectedCustDetail.profile.address || 'Address not listed'}</strong></div>
                    </div>
                  </div>

                  {/* High KPI grid */}
                  <div>
                    <h4 style={{ margin: '0 0 10px', fontSize: '14px', color: 'var(--title-color)' }}>Financial Analytics Metrics</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 150px), 1fr))', gap: '10px' }}>
                      <div style={{ backgroundColor: '#EDF3F0', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
                        <div style={{ fontSize: '10px', color: '#666', fontWeight: '700' }}>TOTAL SPENT</div>
                        <div style={{ fontSize: '14px', fontWeight: '800', color: 'var(--theme-color)', marginTop: '4px' }}>₹{selectedCustDetail.profile.total_spent.toFixed(2)}</div>
                      </div>
                      <div style={{ backgroundColor: '#EDF3F0', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
                        <div style={{ fontSize: '10px', color: '#666', fontWeight: '700' }}>ORDERS PLACED</div>
                        <div style={{ fontSize: '14px', fontWeight: '800', color: 'var(--theme-color)', marginTop: '4px' }}>{selectedCustDetail.profile.orders_count}</div>
                      </div>
                      <div style={{ backgroundColor: '#EDF3F0', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
                        <div style={{ fontSize: '10px', color: '#666', fontWeight: '700' }}>AVG ORDER VALUE</div>
                        <div style={{ fontSize: '14px', fontWeight: '800', color: 'var(--theme-color)', marginTop: '4px' }}>₹{selectedCustDetail.aov.toFixed(2)}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sub Tab Grid: Orders, Reviews, Activities */}
                <div style={{ borderTop: '1px solid #EAE6DB', paddingTop: '15px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '20px' }}>
                    {/* Orders lists */}
                    <div>
                      <h4 style={{ margin: '0 0 10px', fontSize: '14px', color: 'var(--title-color)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <ShoppingBag size={14} /> Order Log History ({selectedCustDetail.orders.length})
                      </h4>
                      <div style={{ maxHeight: '180px', overflowY: 'auto', border: '1px solid #EAE6DB', borderRadius: '8px', overflowX: 'auto' }}>
                        <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse', minWidth: '300px' }}>
                          <thead style={{ background: '#f5f5f5', position: 'sticky', top: 0 }}>
                            <tr>
                              <th style={{ padding: '6px 10px', textAlign: 'left' }}>Order ID</th>
                              <th style={{ padding: '6px 10px', textAlign: 'right' }}>Total</th>
                              <th style={{ padding: '6px 10px', textAlign: 'center' }}>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedCustDetail.orders.map(o => (
                              <tr key={o.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                <td style={{ padding: '6px 10px' }}>#ORD-{o.id}</td>
                                <td style={{ padding: '6px 10px', textAlign: 'right', fontWeight: '700' }}>₹{o.total.toFixed(2)}</td>
                                <td style={{ padding: '6px 10px', textAlign: 'center' }}>
                                  <span style={{ fontSize: '9px', fontWeight: '700', textTransform: 'uppercase', color: o.status === 'Delivered' ? '#27AE60' : '#E67E22' }}>{o.status}</span>
                                </td>
                              </tr>
                            ))}
                            {selectedCustDetail.orders.length === 0 && (
                              <tr><td colSpan="3" style={{ padding: '20px', textAlign: 'center', color: '#999' }}>No orders placed.</td></tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Reviews list */}
                    <div>
                      <h4 style={{ margin: '0 0 10px', fontSize: '14px', color: 'var(--title-color)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Star size={14} /> Reviews Submitted ({selectedCustDetail.reviews.length})
                      </h4>
                      <div style={{ maxHeight: '180px', overflowY: 'auto', border: '1px solid #EAE6DB', borderRadius: '8px', overflowX: 'auto' }}>
                        <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse', minWidth: '300px' }}>
                          <thead style={{ background: '#f5f5f5', position: 'sticky', top: 0 }}>
                            <tr>
                              <th style={{ padding: '6px 10px', textAlign: 'left' }}>Dish</th>
                              <th style={{ padding: '6px 10px', textAlign: 'center' }}>Rating</th>
                              <th style={{ padding: '6px 10px', textAlign: 'left' }}>Review</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedCustDetail.reviews.map(r => (
                              <tr key={r.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                <td style={{ padding: '6px 10px', maxWidth: '100px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.product_name || `Dish #${r.product_id}`}</td>
                                <td style={{ padding: '6px 10px', color: '#F1C40F', textAlign: 'center', fontWeight: '700' }}>{r.rating}★</td>
                                <td style={{ padding: '6px 10px', fontStyle: 'italic', maxWidth: '120px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={r.review}>"{r.review}"</td>
                              </tr>
                            ))}
                            {selectedCustDetail.reviews.length === 0 && (
                              <tr><td colSpan="3" style={{ padding: '20px', textAlign: 'center', color: '#999' }}>No reviews submitted.</td></tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Activity Feed */}
                <div style={{ borderTop: '1px solid #EAE6DB', paddingTop: '15px' }}>
                  <h4 style={{ margin: '0 0 10px', fontSize: '14px', color: 'var(--title-color)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Activity size={14} /> Chronological Customer Activity Logs
                  </h4>
                  <div style={{ maxHeight: '150px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', padding: '5px' }}>
                    {selectedCustDetail.activity.map((act, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', borderBottom: '1px dashed #eee', paddingBottom: '4px' }}>
                        <div>
                          <strong style={{ color: 'var(--theme-color)' }}>{act.event}: </strong>
                          <span style={{ color: '#555' }}>{act.desc}</span>
                        </div>
                        <span style={{ fontSize: '10px', color: '#999' }}>{act.time}</span>
                      </div>
                    ))}
                    {selectedCustDetail.activity.length === 0 && (
                      <div style={{ padding: '10px', textAlign: 'center', color: '#999', fontSize: '12px' }}>No recorded activities for this client account.</div>
                    )}
                  </div>
                </div>

              </div>

              <div className="admin-modal-footer">
                <button className="btn-secondary" onClick={() => setSelectedCustDetail(null)}>Close Card</button>
              </div>
            </div>
          </div>
        )}

        <div className="admin-footer">
          <div>&copy; 2026 <strong>Amma's Kitchen Admin</strong>. All Rights Reserved.</div>
        </div>
      </div>
    </div>
  );
};

export default Customers;
