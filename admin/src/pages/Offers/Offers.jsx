import React, { useState, useEffect, useRef } from 'react';
import { Plus, Edit2, Trash2, Tag, Gift, Copy, EyeOff, Save, X, BarChart3, TrendingUp, Filter } from 'lucide-react';
import { Chart } from 'chart.js/auto';
import apiClient from '../../services/api';
import './Offers.css';
import '../../assets/styles/tables.css';
import AdminSidebar from '../../components/AdminSidebar';
import AdminNavbar from '../../components/AdminNavbar';

const Offers = () => {
  const [activeTab, setActiveTab] = useState('OFFERS');
  
  // Data States
  const [offers, setOffers] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [currentOffer, setCurrentOffer] = useState(null);
  const [currentCoupon, setCurrentCoupon] = useState(null);

  // Form States
  const initialOfferForm = {
    title: '', description: '', type: 'popup', discount_value: '', 
    priority: 'Medium', start_date: '', start_time: '', end_date: '', end_time: '',
    display_locations: [], featured_products: [], image_url: '', popup_image_url: '', thumbnail_image_url: '', status: 'Active'
  };
  const [offerFormData, setOfferFormData] = useState(initialOfferForm);

  const initialCouponForm = {
    coupon_code: '', discount_type: 'percentage', discount_value: '', expiry_date: '', is_active: true
  };
  const [couponFormData, setCouponFormData] = useState(initialCouponForm);

  // Chart Ref
  const analyticsCanvasRef = useRef(null);
  const analyticsChartInstanceRef = useRef(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [offersRes, couponsRes, productsRes] = await Promise.all([
        apiClient.get('/offers'),
        apiClient.get('/coupons'),
        apiClient.get('/products')
      ]);
      setOffers(offersRes.data);
      setCoupons(couponsRes.data);
      setProducts(productsRes.data);
    } catch (err) {
      console.error("Failed to load data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Build Charts when switching to Offers tab if data exists
  useEffect(() => {
    if (activeTab === 'OFFERS' && !loading && analyticsCanvasRef.current) {
      if (analyticsChartInstanceRef.current) analyticsChartInstanceRef.current.destroy();
      const ctx = analyticsCanvasRef.current.getContext('2d');
      
      const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const views = [120, 150, 180, 140, 210, 250, 300];
      const conversions = [12, 18, 25, 15, 30, 45, 50];

      analyticsChartInstanceRef.current = new Chart(ctx, {
        type: 'bar',
        data: {
          labels,
          datasets: [
            {
              label: 'Offer Views',
              data: views,
              backgroundColor: '#C9AB81',
              borderRadius: 4
            },
            {
              label: 'Conversions',
              data: conversions,
              backgroundColor: '#3F9065',
              borderRadius: 4
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'top' } }
        }
      });
    }
    return () => {
      if (analyticsChartInstanceRef.current) {
        analyticsChartInstanceRef.current.destroy();
        analyticsChartInstanceRef.current = null;
      }
    };
  }, [activeTab, loading, offers]);

  // --- OFFER MODAL HANDLERS ---
  const handleOpenOfferModal = (offer = null) => {
    if (offer) {
      setCurrentOffer(offer);
      setOfferFormData({
        ...offer,
        display_locations: Array.isArray(offer.display_locations) ? offer.display_locations : [],
        featured_products: Array.isArray(offer.featured_products) ? offer.featured_products : [],
      });
    } else {
      setCurrentOffer(null);
      setOfferFormData(initialOfferForm);
    }
    setIsOfferModalOpen(true);
  };

  const handleOfferChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      if (checked) {
        setOfferFormData(prev => ({ ...prev, display_locations: [...prev.display_locations, value] }));
      } else {
        setOfferFormData(prev => ({ ...prev, display_locations: prev.display_locations.filter(loc => loc !== value) }));
      }
    } else if (e.target.multiple) {
      const options = Array.from(e.target.selectedOptions, option => parseInt(option.value));
      setOfferFormData(prev => ({ ...prev, featured_products: options }));
    } else {
      setOfferFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const submitOffer = async (e) => {
    e.preventDefault();
    try {
      if (currentOffer) {
        await apiClient.put(`/offers/${currentOffer.id}`, offerFormData);
      } else {
        await apiClient.post('/offers', offerFormData);
      }
      setIsOfferModalOpen(false);
      fetchData();
    } catch (err) {
      alert("Error saving offer.");
    }
  };

  const deleteOffer = async (id) => {
    if (window.confirm("Permanently delete this offer?")) {
      await apiClient.delete(`/offers/${id}`);
      fetchData();
    }
  };

  const duplicateOffer = async (offer) => {
    const duplicatedData = { ...offer, title: `${offer.title} (Copy)` };
    delete duplicatedData.id;
    await apiClient.post('/offers', duplicatedData);
    fetchData();
  };

  const toggleOfferStatus = async (offer) => {
    const newStatus = offer.status === 'Active' ? 'Disabled' : 'Active';
    await apiClient.put(`/offers/${offer.id}`, { status: newStatus });
    fetchData();
  };

  // --- COUPON MODAL HANDLERS ---
  const handleOpenCouponModal = (coupon = null) => {
    if (coupon) {
      setCurrentCoupon(coupon);
      setCouponFormData(coupon);
    } else {
      setCurrentCoupon(null);
      setCouponFormData(initialCouponForm);
    }
    setIsCouponModalOpen(true);
  };

  const handleCouponChange = (e) => {
    const { name, value } = e.target;
    setCouponFormData(prev => ({ ...prev, [name]: name === 'is_active' ? value === 'true' : value }));
  };

  const submitCoupon = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...couponFormData,
        coupon_code: couponFormData.coupon_code.toUpperCase().replace(/\s+/g, ''),
        discount_value: parseFloat(couponFormData.discount_value)
      };
      if (currentCoupon) {
        await apiClient.put(`/coupons/${currentCoupon.id}`, payload);
      } else {
        await apiClient.post('/coupons', payload);
      }
      setIsCouponModalOpen(false);
      fetchData();
    } catch (err) {
      alert("Error saving coupon.");
    }
  };

  const deleteCoupon = async (id) => {
    if (window.confirm("Permanently delete this coupon code?")) {
      await apiClient.delete(`/coupons/${id}`);
      fetchData();
    }
  };

  // --- STATS CALCULATION ---
  const activeOffersCount = offers.filter(o => o.status === 'Active').length;
  const scheduledOffersCount = offers.filter(o => o.status === 'Scheduled').length;
  const expiredOffersCount = offers.filter(o => o.status === 'Disabled').length;
  const totalOfferViews = offers.reduce((sum, o) => sum + (o.views || 0), 0);
  const totalRevenue = offers.reduce((sum, o) => sum + (o.revenue_generated || 0), 0);

  const activeCouponsCount = coupons.filter(c => c.is_active).length;
  const totalCouponUsage = coupons.reduce((sum, c) => sum + (c.usage_count || 0), 0);

  return (
    <div className="admin-wrapper">
      <AdminSidebar />
      <div className="admin-container">
        <AdminNavbar />
        <div className="admin-content">
          <div className="offers-module">
            {/* Header Section */}
            <div className="offers-page-header">
              <div className="offers-title-area">
                <h2>🎟️ Offers & Coupons</h2>
                <p>Manage discounts, promotional campaigns, homepage popups, banners, and coupon codes from a single centralized control panel.</p>
              </div>
          {activeTab === 'OFFERS' ? (
            <button className="page-action-btn" onClick={() => handleOpenOfferModal()} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Plus size={16} /> Create New Offer
            </button>
          ) : (
            <button className="page-action-btn" onClick={() => handleOpenCouponModal()} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Plus size={16} /> Create Coupon Code
            </button>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="module-tabs">
          <button 
            className={`module-tab ${activeTab === 'OFFERS' ? 'active' : ''}`} 
            onClick={() => setActiveTab('OFFERS')}
          >
            <Gift size={16} /> OFFERS
          </button>
          <button 
            className={`module-tab ${activeTab === 'COUPONS' ? 'active' : ''}`} 
            onClick={() => setActiveTab('COUPONS')}
          >
            <Tag size={16} /> COUPONS
          </button>
        </div>

        <div className="module-content">
          {activeTab === 'OFFERS' && (
            <div className="offers-section">
              {/* Offers KPI Cards */}
              <div className="kpi-grid">
                <div className="kpi-card">
                  <div className="kpi-title">Active Offers</div>
                  <div className="kpi-val">{activeOffersCount}</div>
                </div>
                <div className="kpi-card">
                  <div className="kpi-title">Scheduled</div>
                  <div className="kpi-val">{scheduledOffersCount}</div>
                </div>
                <div className="kpi-card">
                  <div className="kpi-title">Total Views</div>
                  <div className="kpi-val">{totalOfferViews}</div>
                </div>
                <div className="kpi-card">
                  <div className="kpi-title">Revenue Generated</div>
                  <div className="kpi-val">{totalRevenue.toLocaleString()}</div>
                </div>
              </div>

              {/* Offers Analytics Chart */}
              <div className="premium-card">
                <div className="premium-card-title"><BarChart3 size={18} /> Offer Analytics</div>
                <div className="chart-container" style={{ height: '250px' }}>
                  <canvas ref={analyticsCanvasRef}></canvas>
                </div>
              </div>

              {/* Offers Table */}
              <div className="premium-card" style={{ marginTop: '20px' }}>
                <div className="premium-card-title"><Filter size={18} /> Active Offers Table</div>
                <div className="responsive-table-wrapper">
                  <table className="responsive-table">
                    <thead>
                      <tr>
                        <th>Image</th>
                        <th>Offer Title</th>
                        <th>Type</th>
                        <th>Discount</th>
                        <th>Dates</th>
                        <th>Priority</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {offers.map(offer => (
                        <tr key={offer.id}>
                          <td data-label="Image">
                            {offer.thumbnail_image_url ? 
                              <img src={offer.thumbnail_image_url} alt="offer" width="40" height="40" style={{ borderRadius: '4px', objectFit: 'cover' }} /> : 
                              <div style={{ width: '40px', height: '40px', background: '#e2ebd9', borderRadius: '4px' }}></div>
                            }
                          </td>
                          <td data-label="Offer Title" style={{ fontWeight: '600' }}>{offer.title}</td>
                          <td data-label="Type"><span className={`badge ${offer.type}`}>{offer.type.replace('_', ' ')}</span></td>
                          <td data-label="Discount" style={{ color: 'var(--theme-color)', fontWeight: 'bold' }}>{offer.discount_value}%</td>
                          <td data-label="Dates">{offer.start_date || 'Now'} - {offer.end_date || 'Forever'}</td>
                          <td data-label="Priority"><span className={`priority-badge ${offer.priority?.toLowerCase()}`}>{offer.priority}</span></td>
                          <td data-label="Status">
                            <div className="food-rating" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span className={`badge-status ${offer.status === 'Active' ? 'approved' : 'inactive'}`}>{offer.status}</span>
                              <label className="switch" style={{ position: 'relative', display: 'inline-block', width: '34px', height: '20px', cursor: 'pointer' }}>
                                <input
                                  type="checkbox"
                                  checked={offer.status === 'Active'}
                                  onChange={() => toggleOfferStatus(offer)}
                                  style={{ position: 'absolute', opacity: 0, width: '100%', height: '100%', cursor: 'pointer', zIndex: 5, margin: 0 }}
                                />
                                <span className="slider round" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: offer.status === 'Active' ? 'var(--theme-color)' : '#dc3545', transition: '.4s', borderRadius: '34px', pointerEvents: 'none' }}>
                                  <span style={{ position: 'absolute', content: '""', height: '14px', width: '14px', left: offer.status === 'Active' ? '16px' : '4px', bottom: '3px', backgroundColor: 'white', transition: '.4s', borderRadius: '50%' }} />
                                </span>
                              </label>
                            </div>
                          </td>
                          <td data-label="Actions">
                            <div className="action-buttons">
                              <button onClick={() => handleOpenOfferModal(offer)} title="Edit"><Edit2 size={16} /></button>
                              <button onClick={() => duplicateOffer(offer)} title="Duplicate"><Copy size={16} /></button>
                              <button onClick={() => deleteOffer(offer.id)} className="text-danger" title="Delete"><Trash2 size={16} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {offers.length === 0 && <tr><td colSpan="8" style={{ textAlign: 'center' }}>No offers found.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'COUPONS' && (
            <div className="coupons-section">
              {/* Coupons KPI Cards */}
              <div className="kpi-grid">
                <div className="kpi-card">
                  <div className="kpi-title">Active Coupons</div>
                  <div className="kpi-val">{activeCouponsCount}</div>
                </div>
                <div className="kpi-card">
                  <div className="kpi-title">Total Usage</div>
                  <div className="kpi-val">{totalCouponUsage}</div>
                </div>
                <div className="kpi-card">
                  <div className="kpi-title">Expired Codes</div>
                  <div className="kpi-val">{coupons.length - activeCouponsCount}</div>
                </div>
              </div>

              {/* Coupons Table */}
              <div className="premium-card" style={{ marginTop: '20px' }}>
                <div className="responsive-table-wrapper">
                  <table className="responsive-table">
                    <thead>
                      <tr>
                        <th>Coupon Code</th>
                        <th>Discount Value</th>
                        <th>Discount Type</th>
                        <th>Expiry Date</th>
                        <th>Usage Count</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {coupons.map((c) => (
                        <tr key={c.id}>
                          <td data-label="Coupon Code" style={{ fontWeight: '700', color: 'var(--title-color)' }}><code>{c.coupon_code}</code></td>
                          <td data-label="Discount Value" style={{ color: 'var(--theme-color)', fontWeight: '700' }}>
                            {c.discount_type === 'percentage' ? `${c.discount_value}%` : `${c.discount_value}`}
                          </td>
                          <td data-label="Discount Type" style={{ textTransform: 'capitalize' }}>{c.discount_type}</td>
                          <td data-label="Expiry Date" className="text-muted">{c.expiry_date || 'No Expiry'}</td>
                          <td data-label="Usage Count">{c.usage_count || 0} times</td>
                          <td data-label="Status">
                            <div className="food-rating" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span className={`badge-status ${c.is_active ? 'approved' : 'inactive'}`}>
                                {c.is_active ? 'Active' : 'Disabled'}
                              </span>
                              <label className="switch" style={{ position: 'relative', display: 'inline-block', width: '34px', height: '20px', cursor: 'pointer' }}>
                                <input
                                  type="checkbox"
                                  checked={c.is_active}
                                  onChange={async () => {
                                    await apiClient.put(`/coupons/${c.id}`, { ...c, is_active: !c.is_active });
                                    fetchData();
                                  }}
                                  style={{ position: 'absolute', opacity: 0, width: '100%', height: '100%', cursor: 'pointer', zIndex: 5, margin: 0 }}
                                />
                                <span className="slider round" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: c.is_active ? 'var(--theme-color)' : '#dc3545', transition: '.4s', borderRadius: '34px', pointerEvents: 'none' }}>
                                  <span style={{ position: 'absolute', content: '""', height: '14px', width: '14px', left: c.is_active ? '16px' : '4px', bottom: '3px', backgroundColor: 'white', transition: '.4s', borderRadius: '50%' }} />
                                </span>
                              </label>
                            </div>
                          </td>
                          <td data-label="Actions">
                            <div className="action-buttons">
                              <button onClick={() => handleOpenCouponModal(c)}><Edit2 size={16} /></button>
                              <button onClick={() => deleteCoupon(c.id)} className="text-danger"><Trash2 size={16} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {coupons.length === 0 && <tr><td colSpan="7" style={{ textAlign: 'center' }}>No coupons found.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* --- OFFER MODAL --- */}
      {isOfferModalOpen && (
        <div className="admin-modal show">
          <div className="admin-modal-content" style={{ maxWidth: '800px' }}>
            <div className="admin-modal-header" style={{ backgroundColor: 'var(--theme-color)', padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, color: '#fff', textTransform: 'uppercase' }}>{currentOffer ? 'Edit Offer' : 'Create New Offer'}</h3>
              <button className="admin-modal-close" onClick={() => setIsOfferModalOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex' }}><X size={20} /></button>
            </div>
            <form onSubmit={submitOffer}>
              <div className="admin-modal-body modal-grid-layout" style={{ padding: '20px' }}>
                {/* Basic Details */}
                <div className="form-section">
                  <h4>Basic Details</h4>
                  <div className="form-field">
                    <label>Offer Title *</label>
                    <input type="text" name="title" value={offerFormData.title} onChange={handleOfferChange} required placeholder="e.g. Festival Special Sale" />
                  </div>
                  <div className="form-field">
                    <label>Description</label>
                    <textarea name="description" value={offerFormData.description} onChange={handleOfferChange} rows="3" placeholder="Get 50% off on all items..." />
                  </div>
                  <div className="form-row">
                    <div className="form-field">
                      <label>Offer Type</label>
                      <select name="type" value={offerFormData.type} onChange={handleOfferChange}>
                        <option value="Percentage Discount">Percentage Discount</option>
                        <option value="Flat Discount">Flat Discount</option>
                        <option value="Buy One Get One">Buy One Get One</option>
                        <option value="Festival Offer">Festival Offer</option>
                        <option value="Weekend Offer">Weekend Offer</option>
                        <option value="Flash Sale">Flash Sale</option>
                        <option value="Custom Offer">Custom Offer</option>
                      </select>
                    </div>
                    <div className="form-field">
                      <label>Discount Value (%)</label>
                      <input type="number" name="discount_value" value={offerFormData.discount_value} onChange={handleOfferChange} />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-field">
                      <label>Priority</label>
                      <select name="priority" value={offerFormData.priority} onChange={handleOfferChange}>
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                      </select>
                    </div>
                    <div className="form-field">
                      <label>Status</label>
                      <select name="status" value={offerFormData.status} onChange={handleOfferChange}>
                        <option value="Active">Active</option>
                        <option value="Scheduled">Scheduled</option>
                        <option value="Disabled">Disabled</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Display & Schedule */}
                <div className="form-section">
                  <h4>Display Locations</h4>
                  <div className="checkbox-grid">
                    {['Homepage Popup', 'Homepage Hero Banner', 'Product Cards', 'Ready To Eat Page', 'Batter Products Page', 'Bulk Orders Page'].map(loc => (
                      <label key={loc} className="checkbox-label">
                        <input type="checkbox" name="display_locations" value={loc} checked={offerFormData.display_locations.includes(loc)} onChange={handleOfferChange} /> {loc}
                      </label>
                    ))}
                  </div>

                  <h4 style={{ marginTop: '20px' }}>Schedule</h4>
                  <div className="form-row">
                    <div className="form-field">
                      <label>Start Date</label>
                      <input type="date" name="start_date" value={offerFormData.start_date} onChange={handleOfferChange} />
                    </div>
                    <div className="form-field">
                      <label>Start Time</label>
                      <input type="time" name="start_time" value={offerFormData.start_time} onChange={handleOfferChange} />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-field">
                      <label>End Date</label>
                      <input type="date" name="end_date" value={offerFormData.end_date} onChange={handleOfferChange} />
                    </div>
                    <div className="form-field">
                      <label>End Time</label>
                      <input type="time" name="end_time" value={offerFormData.end_time} onChange={handleOfferChange} />
                    </div>
                  </div>

                  <h4 style={{ marginTop: '20px' }}>Media Links</h4>
                  <div className="form-field">
                    <label>Popup Image URL</label>
                    <input type="text" name="popup_image_url" value={offerFormData.popup_image_url} onChange={handleOfferChange} placeholder="/assets/img/popup.jpg" />
                  </div>
                  <div className="form-field">
                    <label>Banner Image URL</label>
                    <input type="text" name="image_url" value={offerFormData.image_url} onChange={handleOfferChange} placeholder="/assets/img/banner.jpg" />
                  </div>

                  <h4 style={{ marginTop: '20px' }}>Featured Products</h4>
                  <div className="form-field">
                    <select multiple name="featured_products" value={offerFormData.featured_products} onChange={handleOfferChange} style={{ height: '100px' }}>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name} ({p.category})</option>
                      ))}
                    </select>
                    <small>Hold Ctrl/Cmd to select multiple products</small>
                  </div>
                </div>
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setIsOfferModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary"><Save size={16} style={{marginRight:'5px'}}/> Save Offer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- COUPON MODAL --- */}
      {isCouponModalOpen && (
        <div className="admin-modal show">
          <div className="admin-modal-content" style={{ maxWidth: '480px' }}>
            <div className="admin-modal-header" style={{ backgroundColor: 'var(--theme-color)', padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, color: '#fff', textTransform: 'uppercase' }}>{currentCoupon ? 'Modify Coupon' : 'Create Coupon Code'}</h3>
              <button className="admin-modal-close" onClick={() => setIsCouponModalOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex' }}><X size={20} /></button>
            </div>
            <form onSubmit={submitCoupon}>
              <div className="admin-modal-body" style={{ padding: '20px' }}>
                <div className="form-field">
                  <label>Coupon Code *</label>
                  <input type="text" name="coupon_code" value={couponFormData.coupon_code} onChange={handleCouponChange} required placeholder="e.g. SAVE20" style={{ textTransform: 'uppercase' }} />
                </div>
                <div className="form-row">
                  <div className="form-field">
                    <label>Discount Type</label>
                    <select name="discount_type" value={couponFormData.discount_type} onChange={handleCouponChange}>
                      <option value="percentage">Percentage (%)</option>
                      <option value="flat">Flat Amount ()</option>
                    </select>
                  </div>
                  <div className="form-field">
                    <label>Discount Value *</label>
                    <input type="number" name="discount_value" value={couponFormData.discount_value} onChange={handleCouponChange} required />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-field">
                    <label>Expiry Date</label>
                    <input type="date" name="expiry_date" value={couponFormData.expiry_date} onChange={handleCouponChange} />
                  </div>
                  <div className="form-field">
                    <label>Status</label>
                    <select name="is_active" value={couponFormData.is_active} onChange={handleCouponChange}>
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setIsCouponModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary"><Save size={16} style={{marginRight:'5px'}}/> Save Coupon</button>
              </div>
            </form>
          </div>
        </div>
      )}


        </div>
      </div>
    </div>
  );
};

export default Offers;
