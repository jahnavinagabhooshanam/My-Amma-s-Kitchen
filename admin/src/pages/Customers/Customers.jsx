import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminNavbar from '../../components/AdminNavbar';
import apiClient from '../../services/api';
import '../../assets/styles/admin-style.css';
import '../../assets/styles/tables.css';
import { Search, MapPin, Mail, Phone, Pencil, ShieldOff, Shield, Trash2, MoreVertical, X, Save, CheckCircle, AlertTriangle } from 'lucide-react';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingCustomer, setEditingCustomer] = useState(null);
  
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [activeDropdown, setActiveDropdown] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Form Field State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    is_blocked: false
  });

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/customers/');
      setCustomers(response.data);
    } catch (err) {
      console.error("Failed to load customers:", err);
      setErrorMsg("Failed to load customer list from database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

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
      fetchCustomers();
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
      fetchCustomers();
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
      fetchCustomers();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to delete customer profile.");
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone.includes(searchQuery)
  );

  return (
    <div className="admin-wrapper">
      <AdminSidebar />
      <div className="admin-container">
        <AdminNavbar />
        
        <div className="admin-content">
          <div className="page-header">
            <div className="page-title-area">
              <h2>Registered Customers</h2>
              <p>Review customer spend charts, purchase counts, block unwanted users, and correct details</p>
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

          {/* Table Toolbar */}
          <div className="premium-card" style={{ padding: '15px 25px', marginBottom: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
            <div className="navbar-search" style={{ margin: 0, width: '320px', border: '1px solid #EAE6DB', borderRadius: '10px', display: 'flex', alignItems: 'center' }}>
              <Search size={16} style={{ marginRight: '8px', color: '#888' }} />
              <input 
                type="text" 
                placeholder="Search by name, email, or mobile..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
            <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--body-color)' }}>
              Showing {filteredCustomers.length} Registered Customers
            </div>
          </div>

          {loading ? (
            <div style={{ height: '240px', backgroundColor: '#e2ebd9', borderRadius: '15px', animation: 'pulse 1.5s infinite' }} />
          ) : (
            <div className="premium-card">
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
                            <MapPin size={10} /> {cust.address}
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
                              <div style={{ position: 'absolute', right: 0, top: '30px', backgroundColor: '#fff', border: '1px solid #EAE6DB', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 100, minWidth: '150px', display: 'flex', flexDirection: 'column', padding: '4px 0' }}>
                                <button onClick={() => { handleOpenEditModal(cust); setActiveDropdown(null); }} style={{ padding: '8px 12px', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#333' }}>
                                  <Pencil size={12} /> Edit Details
                                </button>
                                <button onClick={() => { handleToggleBlock(cust); setActiveDropdown(null); }} style={{ padding: '8px 12px', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: cust.is_blocked ? '#196F3D' : '#7D6608' }}>
                                  {cust.is_blocked ? <Shield size={12} /> : <ShieldOff size={12} />} {cust.is_blocked ? 'Unblock' : 'Block'}
                                </button>
                                <button onClick={() => { handleDeleteCustomer(cust.id); setActiveDropdown(null); }} style={{ padding: '8px 12px', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#78281F', borderTop: '1px solid #FAF8F2' }}>
                                  <Trash2 size={12} /> Delete
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}

                    {filteredCustomers.length === 0 && (
                      <tr>
                        <td colSpan="7" className="text-center text-muted" style={{ padding: '40px' }}>
                          No customer profiles match your search criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination Controls */}
              {Math.ceil(filteredCustomers.length / itemsPerPage) > 1 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', padding: '15px 25px', borderTop: '1px solid #FAF8F2', flexWrap: 'wrap', gap: '15px' }}>
                  <div style={{ fontSize: '13px', color: '#666' }}>
                    Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredCustomers.length)} to {Math.min(currentPage * itemsPerPage, filteredCustomers.length)} of {filteredCustomers.length} entries
                  </div>
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <button 
                      disabled={currentPage === 1} 
                      onClick={() => setCurrentPage(prev => prev - 1)}
                      style={{ padding: '6px 12px', fontSize: '12px', border: '1px solid #EAE6DB', borderRadius: '6px', backgroundColor: currentPage === 1 ? '#FAF8F2' : '#fff', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', color: currentPage === 1 ? '#aaa' : '#333' }}
                    >
                      Previous
                    </button>
                    {Array.from({ length: Math.ceil(filteredCustomers.length / itemsPerPage) }, (_, i) => i + 1).map(page => (
                      <button 
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        style={{ padding: '6px 12px', fontSize: '12px', border: '1px solid', borderColor: currentPage === page ? 'var(--primary-color)' : '#EAE6DB', borderRadius: '6px', backgroundColor: currentPage === page ? 'var(--primary-color)' : '#fff', color: currentPage === page ? '#fff' : '#333', fontWeight: currentPage === page ? '700' : 'normal', cursor: 'pointer' }}
                      >
                        {page}
                      </button>
                    ))}
                    <button 
                      disabled={currentPage === Math.ceil(filteredCustomers.length / itemsPerPage)} 
                      onClick={() => setCurrentPage(prev => prev + 1)}
                      style={{ padding: '6px 12px', fontSize: '12px', border: '1px solid #EAE6DB', borderRadius: '6px', backgroundColor: currentPage === Math.ceil(filteredCustomers.length / itemsPerPage) ? '#FAF8F2' : '#fff', cursor: currentPage === Math.ceil(filteredCustomers.length / itemsPerPage) ? 'not-allowed' : 'pointer', color: currentPage === Math.ceil(filteredCustomers.length / itemsPerPage) ? '#aaa' : '#333' }}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Edit Customer Modal */}
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
                      style={{ height: '38px', background: '#fff' }}
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

        <div className="admin-footer">
          <div>&copy; 2026 <strong>Amma's Kitchen Admin</strong>. All Rights Reserved.</div>
        </div>
      </div>
    </div>
  );
};

export default Customers;
