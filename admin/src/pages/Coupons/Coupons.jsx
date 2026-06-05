import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminNavbar from '../../components/AdminNavbar';
import apiClient from '../../services/api';
import '../../assets/styles/admin-style.css';
import '../../assets/styles/tables.css';
import { Plus, X, Save, CheckCircle, AlertTriangle } from 'lucide-react';

const Coupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  
  const [formData, setFormData] = useState({
    coupon_code: '',
    discount_type: 'percentage',
    discount_value: '',
    expiry_date: '',
    is_active: true
  });

  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/coupons/');
      setCoupons(response.data);
    } catch (err) {
      console.error("Failed to load coupons:", err);
      setErrorMsg("Failed to load coupons from database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleOpenAddModal = () => {
    setEditingCoupon(null);
    setFormData({
      coupon_code: '',
      discount_type: 'percentage',
      discount_value: '',
      expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10), // 30 days default
      is_active: true
    });
    setErrorMsg('');
    setShowModal(true);
  };

  const handleOpenEditModal = (coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      coupon_code: coupon.coupon_code,
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value,
      expiry_date: coupon.expiry_date || '',
      is_active: coupon.is_active
    });
    setErrorMsg('');
    setShowModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.coupon_code || formData.discount_value === '') {
      setErrorMsg("Coupon Code and Discount Value are required.");
      return;
    }

    const payload = {
      coupon_code: formData.coupon_code.toUpperCase().replace(/\s+/g, ''),
      discount_type: formData.discount_type,
      discount_value: parseFloat(formData.discount_value),
      expiry_date: formData.expiry_date,
      is_active: formData.is_active
    };

    try {
      if (editingCoupon) {
        await apiClient.put(`/coupons/${editingCoupon.id}`, payload);
        setSuccessMsg("Coupon details modified successfully!");
      } else {
        await apiClient.post('/coupons/', payload);
        setSuccessMsg("New promotional coupon code added!");
      }
      setShowModal(false);
      fetchCoupons();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.error || "Failed to save coupon code.");
    }
  };

  const handleToggleActive = async (coupon) => {
    try {
      await apiClient.put(`/coupons/${coupon.id}`, { is_active: !coupon.is_active });
      setSuccessMsg(`Coupon ${coupon.coupon_code} is now ${!coupon.is_active ? 'Active' : 'Inactive'}`);
      fetchCoupons();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to change coupon active status.");
    }
  };

  const handleDeleteCoupon = async (id) => {
    if (!window.confirm("Permanently delete this coupon code?")) return;
    try {
      await apiClient.delete(`/coupons/${id}`);
      setSuccessMsg("Coupon code deleted.");
      fetchCoupons();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to delete coupon code.");
    }
  };

  return (
    <div className="admin-wrapper">
      <AdminSidebar />
      <div className="admin-container">
        <AdminNavbar />
        
        <div className="admin-content">
          <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
            <div className="page-title-area">
              <h2>Discount Coupons</h2>
              <p>Generate, edit, and configure promo codes, flat rates, and percentage coupons (WELCOME10, Pongal, Diwali)</p>
            </div>
            
            <button className="page-action-btn" onClick={handleOpenAddModal} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Plus size={16} /> Create Coupon Code
            </button>
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
                      <th>Coupon Code</th>
                      <th>Discount Value</th>
                      <th>Discount Type</th>
                      <th>Expiry Date</th>
                      <th>Redemptions</th>
                      <th>Usage Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coupons.map((c) => (
                      <tr key={c.id}>
                        <td style={{ fontWeight: '700', fontSize: '15px', color: 'var(--title-color)' }}>
                          <code>{c.coupon_code}</code>
                        </td>
                        <td style={{ color: 'var(--theme-color)', fontWeight: '700' }}>
                          {c.discount_type === 'percentage' ? `${c.discount_value}%` : `₹${c.discount_value.toFixed(2)}`}
                        </td>
                        <td style={{ textTransform: 'capitalize' }}>{c.discount_type}</td>
                        <td className="text-muted">{c.expiry_date || 'No Expiry'}</td>
                        <td style={{ fontWeight: '700', color: 'var(--title-color)' }}>{c.usage_count || 0} times</td>
                        <td>
                          <span className={`badge-status ${c.is_active ? 'approved' : 'inactive'}`}>
                            {c.is_active ? 'Active Code' : 'Disabled / Expired'}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={() => handleOpenEditModal(c)} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }}>
                              Edit
                            </button>
                            <button onClick={() => handleToggleActive(c)} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }}>
                              {c.is_active ? 'Disable' : 'Enable'}
                            </button>
                            <button onClick={() => handleDeleteCoupon(c.id)} className="btn-secondary text-danger" style={{ padding: '6px 12px', fontSize: '12px' }}>
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {coupons.length === 0 && (
                      <tr>
                        <td colSpan="6" className="text-center text-muted" style={{ padding: '40px' }}>
                          No promotional coupon codes currently configured.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Coupon Form Modal */}
        {showModal && (
          <div className="admin-modal show">
            <div className="admin-modal-content" style={{ maxWidth: '480px' }}>
              <div className="admin-modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3>{editingCoupon ? 'Modify Coupon Parameters' : 'Create Promotional Code'}</h3>
                <button className="admin-modal-close" onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'inline-flex' }}>
                  <X size={18} />
                </button>
              </div>
              <form onSubmit={handleFormSubmit}>
                <div className="admin-modal-body">
                  <div className="form-field">
                    <label>Coupon Code *</label>
                    <input 
                      type="text" 
                      required 
                      value={formData.coupon_code} 
                      onChange={(e) => setFormData({ ...formData, coupon_code: e.target.value })} 
                      placeholder="e.g. PONGAL50"
                      style={{ textTransform: 'uppercase' }}
                    />
                  </div>

                  <div className="form-grid">
                    <div className="form-field">
                      <label>Discount Type *</label>
                      <select 
                        value={formData.discount_type} 
                        onChange={(e) => setFormData({ ...formData, discount_type: e.target.value })}
                        style={{ height: '38px', background: '#fff' }}
                      >
                        <option value="percentage">Percentage (%)</option>
                        <option value="flat">Flat Amount (₹)</option>
                      </select>
                    </div>
                    
                    <div className="form-field">
                      <label>Discount Value *</label>
                      <input 
                        type="number" 
                        step="0.01"
                        required 
                        value={formData.discount_value} 
                        onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })} 
                        placeholder={formData.discount_type === 'percentage' ? '50' : '100'}
                      />
                    </div>
                  </div>

                  <div className="form-grid">
                    <div className="form-field">
                      <label>Expiry Date</label>
                      <input 
                        type="date" 
                        value={formData.expiry_date} 
                        onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })} 
                      />
                    </div>
                    
                    <div className="form-field">
                      <label>Status</label>
                      <select 
                        value={formData.is_active} 
                        onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'true' })}
                        style={{ height: '38px', background: '#fff' }}
                      >
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                <div className="admin-modal-footer">
                  <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="page-action-btn" style={{ borderRadius: '20px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <Save size={16} /> Save Promo Code
                  </button>
                </div>
              </form>
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

export default Coupons;
