import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminNavbar from '../../components/AdminNavbar';
import '../../assets/styles/admin-style.css';
import '../../assets/styles/tables.css';
import apiClient from '../../services/api';
import { 
  UserPlus, 
  MoreVertical, 
  Trash2, 
  ClipboardCheck, 
  CheckCircle, 
  X, 
  AlertTriangle,
  Phone,
  Power
} from 'lucide-react';

const DeliveryManagement = () => {
  const [partners, setPartners] = useState([]);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [activeDropdown, setActiveDropdown] = useState(null);

  // Form states
  const [newPartner, setNewPartner] = useState({
    name: '',
    phone: '',
    status: 'Available'
  });

  const [selectedOrderToAssign, setSelectedOrderToAssign] = useState('');

  const fetchData = async () => {
    try {
      const partnersRes = await apiClient.get('/delivery-management/');
      setPartners(partnersRes.data);
      
      // Also fetch stats to extract pending/confirmed orders for assignment
      const statsRes = await apiClient.get('/admin/dashboard-stats');
      // Filter orders that are Confirmed, Preparing, or Pending
      const assignable = statsRes.data.recent_orders?.filter(
        o => o.status === 'Confirmed' || o.status === 'Preparing' || o.status === 'Pending'
      ) || [];
      setPendingOrders(assignable);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to load delivery partners information.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStatusChange = async (partnerId, newStatus) => {
    try {
      await apiClient.put(`/delivery-management/${partnerId}`, { status: newStatus });
      setSuccessMsg(`Status updated successfully to ${newStatus}`);
      fetchData();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to update status.");
      setTimeout(() => setErrorMsg(''), 4000);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!newPartner.name || !newPartner.phone) {
      setErrorMsg("Name and phone are required.");
      return;
    }

    try {
      await apiClient.post('/delivery-management/', newPartner);
      setSuccessMsg("Delivery partner registered successfully!");
      setShowAddModal(false);
      setNewPartner({ name: '', phone: '', status: 'Available' });
      fetchData();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to register partner.");
      setTimeout(() => setErrorMsg(''), 4000);
    }
  };

  const handleDeletePartner = async (partnerId) => {
    if (!window.confirm("Are you sure you want to unregister this delivery partner?")) return;
    try {
      await apiClient.delete(`/delivery-management/${partnerId}`);
      setSuccessMsg("Delivery partner unregistered successfully!");
      fetchData();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to unregister delivery partner.");
      setTimeout(() => setErrorMsg(''), 4000);
    }
  };

  const openAssignModal = (partner) => {
    setSelectedPartner(partner);
    if (pendingOrders.length > 0) {
      setSelectedOrderToAssign(pendingOrders[0].id);
    } else {
      setSelectedOrderToAssign('');
    }
    setShowAssignModal(true);
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!selectedOrderToAssign) {
      setErrorMsg("No order selected to assign.");
      return;
    }

    try {
      await apiClient.put(`/delivery-management/${selectedPartner.id}/assign`, {
        order_id: selectedOrderToAssign
      });

      setSuccessMsg(`Order ${selectedOrderToAssign} successfully assigned!`);
      setShowAssignModal(false);
      fetchData();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to assign order.");
      setTimeout(() => setErrorMsg(''), 4000);
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
              <h2>Delivery Control Panel</h2>
              <p>Register agents, change duty states, and dispatch client orders.</p>
            </div>
            <button className="page-action-btn" onClick={() => setShowAddModal(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <UserPlus size={16} /> Add Delivery Boy
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

          <div className="premium-card">
            <div className="premium-card-header">
              <div className="premium-card-title">
                <i className="fa-solid fa-users-gear"></i>
                <h3>Active Delivery Partners</h3>
              </div>
            </div>

            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#888' }}>
                Loading partners database...
              </div>
            ) : (
              <div className="responsive-table-wrapper" style={{ border: 'none', boxShadow: 'none' }}>
                <table className="responsive-table">
                  <thead>
                    <tr>
                      <th>Partner ID</th>
                      <th>Delivery Partner Name</th>
                      <th>Mobile Phone</th>
                      <th>Active Status</th>
                      <th>Assigned Orders</th>
                      <th>Quick Status Update</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {partners && partners.length > 0 ? (
                      partners.map((p) => {
                        let statusColor = '#666';
                        if (p.status === 'Available') statusColor = '#3F9065';
                        else if (p.status === 'Assigned') statusColor = '#FF9924';
                        else if (p.status === 'Out For Delivery') statusColor = '#2b5c8f';
                        else if (p.status === 'Delivered') statusColor = '#2d6a4f';

                        return (
                          <tr key={p.id}>
                            <td><strong>DPT-{p.id}</strong></td>
                            <td><strong>{p.name}</strong></td>
                            <td>
                              <a href={`tel:${p.phone}`} style={{ color: 'var(--theme-color)', fontWeight: '700', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                <Phone size={12} />
                                {p.phone}
                              </a>
                            </td>
                            <td>
                              <span style={{
                                padding: '4px 10px',
                                borderRadius: '15px',
                                fontSize: '11px',
                                fontWeight: '700',
                                backgroundColor: `${statusColor}15`,
                                color: statusColor,
                                border: `1px solid ${statusColor}`
                              }}>
                                {p.status}
                              </span>
                            </td>
                            <td>
                              <div style={{ maxWidth: '200px', wordBreak: 'break-all', fontWeight: '600' }}>
                                {p.assigned_orders ? p.assigned_orders : 'None'}
                              </div>
                            </td>
                            <td>
                              <select 
                                value={p.status} 
                                onChange={(e) => handleStatusChange(p.id, e.target.value)}
                                style={{ padding: '6px 10px', fontSize: '12px', border: '1px solid #EAE6DB', borderRadius: '8px', backgroundColor: '#fff', fontWeight: '600' }}
                              >
                                <option value="Available">Available</option>
                                <option value="Assigned">Assigned</option>
                                <option value="Out For Delivery">Out For Delivery</option>
                                <option value="Delivered">Delivered</option>
                              </select>
                            </td>
                            <td>
                              <div style={{ position: 'relative', display: 'inline-block' }} onMouseLeave={() => setActiveDropdown(null)}>
                                <button 
                                  onClick={() => setActiveDropdown(activeDropdown === p.id ? null : p.id)}
                                  className="btn-secondary"
                                  style={{ padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
                                >
                                  <MoreVertical size={14} /> Actions
                                </button>
                                {activeDropdown === p.id && (
                                  <div style={{
                                    position: 'absolute',
                                    right: 0,
                                    top: '30px',
                                    backgroundColor: '#fff',
                                    border: '1px solid #EAE6DB',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                    zIndex: 100,
                                    minWidth: '150px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    padding: '4px 0'
                                  }}>
                                    <button 
                                      onClick={() => { openAssignModal(p); setActiveDropdown(null); }}
                                      style={{ padding: '8px 12px', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#333' }}
                                    >
                                      <ClipboardCheck size={12} /> Assign Order
                                    </button>
                                    <button 
                                      onClick={() => { handleStatusChange(p.id, p.status === 'Available' ? 'On Break' : 'Available'); setActiveDropdown(null); }}
                                      style={{ padding: '8px 12px', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#7D6608' }}
                                    >
                                      <Power size={12} /> Toggle Duty
                                    </button>
                                    <button 
                                      onClick={() => { handleDeletePartner(p.id); setActiveDropdown(null); }}
                                      style={{ padding: '8px 12px', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#78281F', borderTop: '1px solid #FAF8F2' }}
                                    >
                                      <Trash2 size={12} /> Unregister
                                    </button>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="7" className="text-center text-muted" style={{ padding: '40px' }}>
                          No delivery boys registered in ERP yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Add Modal */}
        {showAddModal && (
          <div className="admin-modal show">
            <div className="admin-modal-content">
              <div className="admin-modal-header" style={{ backgroundColor: 'var(--theme-color)', padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTopLeftRadius: '12px', borderTopRightRadius: '12px' }}>
                <h3 style={{ margin: 0 }}>Register Delivery Boy</h3>
                <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleAddSubmit}>
                <div className="admin-modal-body" style={{ padding: '20px' }}>
                  <div className="form-field">
                    <label>Full Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Karthik S."
                      value={newPartner.name}
                      onChange={(e) => setNewPartner(prev => ({ ...prev, name: e.target.value }))}
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #EAE6DB' }}
                      required
                    />
                  </div>
                  <div className="form-field">
                    <label>Mobile Number</label>
                    <input 
                      type="tel" 
                      placeholder="e.g. +91 98765 43210"
                      value={newPartner.phone}
                      onChange={(e) => setNewPartner(prev => ({ ...prev, phone: e.target.value }))}
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #EAE6DB' }}
                      required
                    />
                  </div>
                  <div className="form-field">
                    <label>Status</label>
                    <select 
                      value={newPartner.status}
                      onChange={(e) => setNewPartner(prev => ({ ...prev, status: e.target.value }))}
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #EAE6DB' }}
                    >
                      <option value="Available">Available</option>
                      <option value="Assigned">Assigned</option>
                      <option value="Out For Delivery">Out For Delivery</option>
                    </select>
                  </div>
                </div>
                <div className="admin-modal-footer" style={{ padding: '15px 20px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                  <button type="submit" className="page-action-btn" style={{ borderRadius: '20px' }}>Register Partner</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Assign Modal */}
        {showAssignModal && (
          <div className="admin-modal show">
            <div className="admin-modal-content">
              <div className="admin-modal-header" style={{ backgroundColor: 'var(--theme-color)', padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTopLeftRadius: '12px', borderTopRightRadius: '12px' }}>
                <h3 style={{ margin: 0 }}>Assign Order to {selectedPartner?.name}</h3>
                <button onClick={() => setShowAssignModal(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleAssignSubmit}>
                <div className="admin-modal-body" style={{ padding: '20px' }}>
                  {pendingOrders.length > 0 ? (
                    <div className="form-field">
                      <label>Select Active/Pending Order</label>
                      <select 
                        value={selectedOrderToAssign}
                        onChange={(e) => setSelectedOrderToAssign(e.target.value)}
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #EAE6DB' }}
                      >
                        {pendingOrders.map(o => (
                          <option key={o.id} value={o.id}>
                            {o.id} - {o.customer} (₹{o.amount.toFixed(2)} - {o.status})
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="form-field">
                      <label>Select Active/Pending Order</label>
                      <p style={{ color: '#888', fontStyle: 'italic' }}>No pending orders available to dispatch.</p>
                      <input 
                        type="text"
                        placeholder="Enter Order ID manually (e.g. ORD-1)"
                        value={selectedOrderToAssign}
                        onChange={(e) => setSelectedOrderToAssign(e.target.value)}
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #EAE6DB', marginTop: '10px' }}
                      />
                    </div>
                  )}
                </div>
                <div className="admin-modal-footer" style={{ padding: '15px 20px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button type="button" className="btn-secondary" onClick={() => setShowAssignModal(false)}>Cancel</button>
                  <button type="submit" className="page-action-btn" style={{ borderRadius: '20px' }}>Assign Dispatch</button>
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

export default DeliveryManagement;
