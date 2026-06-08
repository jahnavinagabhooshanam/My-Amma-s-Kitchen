import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import AdminNavbar from '../../components/AdminNavbar';
import '../../assets/styles/admin-style.css';
import '../../assets/styles/tables.css';
import apiClient from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { 
  UserPlus, 
  MoreVertical, 
  Trash2, 
  ClipboardCheck, 
  CheckCircle, 
  X, 
  AlertTriangle,
  Phone,
  Power,
  MapPin,
  Play,
  XCircle,
  Check,
  Send,
  MessageSquare,
  Route
} from 'lucide-react';

const DeliveryManagement = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const activeTabParam = searchParams.get('tab') || 'agents';

  const { user } = useAuth();
  const userRole = user?.role || 'admin';
  const isDriver = userRole === 'delivery_staff';

  const [activeTab, setActiveTab] = useState('agents'); // 'agents', 'queue', 'routes', 'contacts'
  
  // Manager states
  const [partners, setPartners] = useState([]);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [selectedOrderToAssign, setSelectedOrderToAssign] = useState('');
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [newPartner, setNewPartner] = useState({ name: '', phone: '', status: 'Available' });

  // Driver states
  const [myOrders, setMyOrders] = useState([]);

  // Common states
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Auto-set tab based on URL & permissions
  useEffect(() => {
    if (isDriver) {
      // Drivers cannot access agents tab
      if (activeTabParam === 'agents') {
        setActiveTab('queue');
      } else {
        setActiveTab(activeTabParam);
      }
    } else {
      setActiveTab(activeTabParam);
    }
  }, [activeTabParam, isDriver]);

  const fetchManagerData = async () => {
    try {
      const partnersRes = await apiClient.get('/delivery-management/');
      setPartners(partnersRes.data);
      
      const statsRes = await apiClient.get('/admin/dashboard-stats');
      const assignable = statsRes.data.recent_orders?.filter(
        o => o.status === 'Confirmed' || o.status === 'Preparing' || o.status === 'Pending' || o.status === 'Packed'
      ) || [];
      setPendingOrders(assignable);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to load delivery partners and assignments database.");
    }
  };

  const fetchDriverQueue = async () => {
    try {
      const response = await apiClient.get('/delivery-management/my-orders');
      setMyOrders(response.data);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to load your designated delivery queue.");
    }
  };

  const loadData = async () => {
    setLoading(true);
    setErrorMsg('');
    if (isDriver) {
      await fetchDriverQueue();
    } else {
      await Promise.all([fetchManagerData(), fetchDriverQueue()]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [userRole]);

  // Manager actions
  const handlePartnerStatusChange = async (partnerId, newStatus) => {
    try {
      await apiClient.put(`/delivery-management/${partnerId}`, { status: newStatus });
      setSuccessMsg(`Partner status updated to ${newStatus}`);
      fetchManagerData();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to update partner duty status.");
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
      fetchManagerData();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to register partner.");
    }
  };

  const handleDeletePartner = async (partnerId) => {
    if (!window.confirm("Are you sure you want to unregister this delivery partner?")) return;
    try {
      await apiClient.delete(`/delivery-management/${partnerId}`);
      setSuccessMsg("Delivery partner unregistered successfully!");
      fetchManagerData();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to unregister delivery partner.");
    }
  };

  const openAssignModal = (partner) => {
    setSelectedPartner(partner);
    if (pendingOrders.length > 0) {
      setSelectedOrderToAssign(pendingOrders[0].raw_id || pendingOrders[0].id);
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
      setSuccessMsg(`Order #${selectedOrderToAssign} assigned to ${selectedPartner.name}`);
      setShowAssignModal(false);
      fetchManagerData();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to assign order dispatch.");
    }
  };

  // Driver actions
  const handleOrderStatusChange = async (orderId, newStatus) => {
    try {
      await apiClient.put(`/orders/${orderId}`, { status: newStatus });
      setSuccessMsg(`Order #${orderId} marked as ${newStatus}`);
      loadData();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to update order status.");
    }
  };

  const handleRejectOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to reject this delivery assignment?")) return;
    try {
      // Rejections mark order back to Packed/Sealed so another agent can pickup
      await apiClient.put(`/orders/${orderId}`, { status: 'Packed' });
      setSuccessMsg(`Order #${orderId} rejected and placed back in dispatch queue.`);
      loadData();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to reject delivery order.");
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
              <p>
                {activeTab === 'agents' ? 'Register agents, change duty states, and dispatch client orders.' : 
                 activeTab === 'queue' ? 'Review designated orders, load food items, run map routes, and mark complete payments.' :
                 activeTab === 'routes' ? 'View Google Maps directions, address coordinates, and dispatch routes.' :
                 'Quick directory lookup for telephone numbers, text notifications, and customer calls.'}
              </p>
            </div>
            {!isDriver && activeTab === 'agents' && (
              <button className="page-action-btn" onClick={() => setShowAddModal(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <UserPlus size={16} /> Add Delivery Boy
              </button>
            )}
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

          {/* Section tabs */}
          <div className="module-tabs">
            {!isDriver && (
              <button 
                onClick={() => navigate('/admin/delivery-management?tab=agents')}
                style={{
                  padding: '10px 20px', fontSize: '14px', fontWeight: '700', border: 'none', background: 'none',
                  borderBottom: activeTab === 'agents' ? '3px solid var(--primary-color)' : '3px solid transparent',
                  color: activeTab === 'agents' ? 'var(--primary-color)' : '#7E7A6B', cursor: 'pointer', fontFamily: "'Outfit', sans-serif"
                }}
              >
                Duty & Assignment
              </button>
            )}
            <button 
              onClick={() => navigate(`/admin/delivery-management?tab=queue`)}
              style={{
                padding: '10px 20px', fontSize: '14px', fontWeight: '700', border: 'none', background: 'none',
                borderBottom: activeTab === 'queue' ? '3px solid var(--primary-color)' : '3px solid transparent',
                color: activeTab === 'queue' ? 'var(--primary-color)' : '#7E7A6B', cursor: 'pointer', fontFamily: "'Outfit', sans-serif"
              }}
            >
              Assigned Orders Queue
            </button>
            <button 
              onClick={() => navigate(`/admin/delivery-management?tab=routes`)}
              style={{
                padding: '10px 20px', fontSize: '14px', fontWeight: '700', border: 'none', background: 'none',
                borderBottom: activeTab === 'routes' ? '3px solid var(--primary-color)' : '3px solid transparent',
                color: activeTab === 'routes' ? 'var(--primary-color)' : '#7E7A6B', cursor: 'pointer', fontFamily: "'Outfit', sans-serif"
              }}
            >
              Delivery Routes Map
            </button>
            <button 
              onClick={() => navigate(`/admin/delivery-management?tab=contacts`)}
              style={{
                padding: '10px 20px', fontSize: '14px', fontWeight: '700', border: 'none', background: 'none',
                borderBottom: activeTab === 'contacts' ? '3px solid var(--primary-color)' : '3px solid transparent',
                color: activeTab === 'contacts' ? 'var(--primary-color)' : '#7E7A6B', cursor: 'pointer', fontFamily: "'Outfit', sans-serif"
              }}
            >
              Customer Contacts
            </button>
          </div>

          {loading ? (
            <div style={{ height: '320px', backgroundColor: '#e2ebd9', borderRadius: '15px', animation: 'pulse 1.5s infinite' }} />
          ) : (
            <div className="premium-card">
              
              {/* Tab 1: Duty & Assignment (Admin Only) */}
              {activeTab === 'agents' && !isDriver && (
                <div className="responsive-table-wrapper" style={{ border: 'none', boxShadow: 'none' }}>
                  <table className="responsive-table">
                    <thead>
                      <tr>
                        <th>Partner ID</th>
                        <th>Name</th>
                        <th>Mobile</th>
                        <th>Active Status</th>
                        <th>Assigned Orders</th>
                        <th>Quick Status Switch</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {partners.map(p => {
                        let statusColor = '#666';
                        if (p.status === 'Available') statusColor = '#3F9065';
                        else if (p.status === 'Assigned') statusColor = '#FF9924';
                        else if (p.status === 'Out For Delivery') statusColor = '#2b5c8f';
                        else if (p.status === 'Delivered') statusColor = '#2d6a4f';

                        return (
                          <tr key={p.id}>
                            <td data-label="Partner ID"><strong>DPT-{p.id}</strong></td>
                            <td data-label="Name"><strong>{p.name}</strong></td>
                            <td data-label="Mobile">
                              <a href={`tel:${p.phone}`} style={{ color: 'var(--theme-color)', fontWeight: '700', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                <Phone size={12} /> {p.phone}
                              </a>
                            </td>
                            <td data-label="Active Status">
                              <span style={{
                                padding: '4px 10px', borderRadius: '15px', fontSize: '11px', fontWeight: '700',
                                backgroundColor: `${statusColor}15`, color: statusColor, border: `1px solid ${statusColor}`
                              }}>
                                {p.status}
                              </span>
                            </td>
                            <td data-label="Assigned Orders">
                              <div style={{ maxWidth: '200px', wordBreak: 'break-all', fontWeight: '600' }}>
                                {p.assigned_orders || 'None'}
                              </div>
                            </td>
                            <td data-label="Quick Status Switch">
                              <select 
                                value={p.status} 
                                onChange={(e) => handlePartnerStatusChange(p.id, e.target.value)}
                                style={{ padding: '6px 10px', fontSize: '12px', border: '1px solid #EAE6DB', borderRadius: '8px', backgroundColor: '#fff', fontWeight: '600' }}
                              >
                                <option value="Available">Available</option>
                                <option value="Assigned">Assigned</option>
                                <option value="Out For Delivery">Out For Delivery</option>
                                <option value="Delivered">Delivered</option>
                              </select>
                            </td>
                            <td data-label="Actions">
                              <div style={{ position: 'relative', display: 'inline-block' }} onMouseLeave={() => setActiveDropdown(null)}>
                                <button 
                                  onClick={() => setActiveDropdown(activeDropdown === p.id ? null : p.id)}
                                  className="btn-secondary"
                                  style={{ padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                                >
                                  <MoreVertical size={14} /> Actions
                                </button>
                                {activeDropdown === p.id && (
                                  <div style={{
                                    position: 'absolute', right: 0, top: '30px', backgroundColor: '#fff', border: '1px solid #EAE6DB',
                                    borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 100, minWidth: '150px',
                                    display: 'flex', flexDirection: 'column', padding: '4px 0'
                                  }}>
                                    <button 
                                      onClick={() => { openAssignModal(p); setActiveDropdown(null); }}
                                      style={{ padding: '8px 12px', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#333' }}
                                    >
                                      <ClipboardCheck size={12} /> Assign Order
                                    </button>
                                    <button 
                                      onClick={() => { handlePartnerStatusChange(p.id, p.status === 'Available' ? 'On Break' : 'Available'); setActiveDropdown(null); }}
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
                      })}
                      {partners.length === 0 && (
                        <tr>
                          <td colSpan="7" className="text-center text-muted" style={{ padding: '40px' }}>No delivery partners registered in ERP yet.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Tab 2: Assigned Orders Queue */}
              {activeTab === 'queue' && (
                <div className="responsive-table-wrapper" style={{ border: 'none', boxShadow: 'none' }}>
                  <table className="responsive-table">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Customer Info</th>
                        <th>Delivery Address</th>
                        <th>Dishes Checklist</th>
                        <th>Total & COD</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {myOrders.map(o => (
                        <tr key={o.id}>
                          <td data-label="Order ID"><strong>#{o.order_id_string || `ORD-${o.id}`}</strong></td>
                          <td data-label="Customer Info">
                            <strong>{o.customer_name}</strong>
                            <div style={{ fontSize: '11px', color: '#7E7A6B', marginTop: '4px' }}>
                              <a href={`tel:${o.phone}`} style={{ color: 'var(--primary-color)', fontWeight: '600', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                <Phone size={11} /> {o.phone}
                              </a>
                            </div>
                          </td>
                          <td data-label="Delivery Address" style={{ maxWidth: '220px', fontSize: '12px', lineHeight: '1.4' }}>
                            <MapPin size={12} style={{ color: 'var(--accent-color)', marginRight: '4px', verticalAlign: 'middle', display: 'inline-block' }} />
                            {o.delivery_address}
                          </td>
                          <td data-label="Dishes Checklist">
                            <div style={{ fontSize: '12px' }}>
                              {o.items?.map((it, idx) => (
                                <div key={idx}>• {it.quantity}x {it.product_name}</div>
                              ))}
                            </div>
                          </td>
                          <td data-label="Total & COD">
                            <div style={{ fontWeight: '700' }}>₹{o.total.toFixed(2)}</div>
                            <span style={{
                              padding: '2px 6px', borderRadius: '8px', fontSize: '9px', fontWeight: '700',
                              backgroundColor: o.payment_status === 'Paid' ? '#D4EFDF' : '#FCF3CF',
                              color: o.payment_status === 'Paid' ? '#196F3D' : '#7D6608'
                            }}>
                              {o.payment_status === 'Paid' ? 'Paid' : 'COD Pending'}
                            </span>
                          </td>
                          <td data-label="Status">
                            <span style={{
                              padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '700',
                              backgroundColor: o.status === 'Out For Delivery' ? '#FCF3CF' : o.status === 'Delivered' ? '#D4EFDF' : '#EBF5FB',
                              color: o.status === 'Out For Delivery' ? '#7D6608' : o.status === 'Delivered' ? '#196F3D' : '#1B4F72'
                            }}>
                              {o.status}
                            </span>
                          </td>
                          <td data-label="Actions">
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              {o.status === 'Packed' && (
                                <div style={{ display: 'flex', gap: '4px' }}>
                                  <button 
                                    onClick={() => handleOrderStatusChange(o.id, 'Out For Delivery')} 
                                    className="page-action-btn" 
                                    style={{ padding: '6px 10px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                  >
                                    <Play size={10} /> Start Delivery
                                  </button>
                                  <button 
                                    onClick={() => handleRejectOrder(o.id)} 
                                    className="btn-secondary" 
                                    style={{ padding: '6px 10px', fontSize: '11px', backgroundColor: '#FADBD8', color: '#78281F', borderColor: '#F5B7B1', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                  >
                                    <XCircle size={10} /> Reject
                                  </button>
                                </div>
                              )}

                              {o.status === 'Out For Delivery' && (
                                <button 
                                  onClick={() => handleOrderStatusChange(o.id, 'Delivered')} 
                                  className="page-action-btn" 
                                  style={{ padding: '6px 12px', fontSize: '11px', backgroundColor: '#27AE60', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                >
                                  <Check size={11} /> Mark Delivered
                                </button>
                              )}

                              {o.status === 'Delivered' && (
                                <span style={{ fontSize: '11px', color: '#27AE60', fontWeight: '700', padding: '6px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                  <CheckCircle size={12} /> Completed
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                      {myOrders.length === 0 && (
                        <tr>
                          <td colSpan="7" className="text-center text-muted" style={{ padding: '40px' }}>No assigned deliveries in queue.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Tab 3: Delivery Routes */}
              {activeTab === 'routes' && (
                <div style={{ padding: '25px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                  {myOrders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled').map(o => {
                    const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(o.delivery_address)}`;
                    return (
                      <div key={o.id} style={{ border: '1px solid #EAE6DB', borderRadius: '12px', padding: '20px', backgroundColor: '#FAF8F2' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                          <span style={{ fontWeight: '700', fontSize: '14px', color: 'var(--primary-color)' }}>ORD-{o.id}</span>
                          <span style={{
                            padding: '3px 8px', borderRadius: '8px', fontSize: '10px', fontWeight: '700',
                            backgroundColor: '#FCF3CF', color: '#7D6608'
                          }}>{o.status}</span>
                        </div>
                        <div style={{ marginBottom: '10px' }}>
                          <strong style={{ fontSize: '13px' }}>Customer: </strong>
                          <span style={{ fontSize: '13px', color: '#555' }}>{o.customer_name}</span>
                        </div>
                        <div style={{ marginBottom: '15px' }}>
                          <strong style={{ fontSize: '13px' }}>Address: </strong>
                          <div style={{ fontSize: '12px', color: '#555', marginTop: '4px', padding: '8px', border: '1px dashed #EAE6DB', borderRadius: '6px', background: '#fff' }}>
                            {o.delivery_address}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="page-action-btn" style={{ flex: 1, padding: '8px 0', textDecoration: 'none', textAlign: 'center', fontSize: '12px' }}>
                            Open Maps Directions
                          </a>
                          <a href={`tel:${o.phone}`} className="btn-secondary" style={{ flex: 0.8, padding: '8px 0', textDecoration: 'none', textAlign: 'center', fontSize: '12px' }}>
                            Call Client
                          </a>
                        </div>
                      </div>
                    );
                  })}
                  {myOrders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled').length === 0 && (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#888' }}>
                      <Route size={32} style={{ color: '#ccc', marginBottom: '8px' }} />
                      <div>No active maps routes. All assigned deliveries completed!</div>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 4: Customer Contacts */}
              {activeTab === 'contacts' && (
                <div className="responsive-table-wrapper" style={{ border: 'none', boxShadow: 'none' }}>
                  <table className="responsive-table">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Customer Name</th>
                        <th>Delivery Status</th>
                        <th>Phone Number</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {myOrders.map(o => (
                        <tr key={o.id}>
                          <td data-label="Order ID"><strong>#{o.order_id_string || `ORD-${o.id}`}</strong></td>
                          <td data-label="Customer Name"><strong>{o.customer_name}</strong></td>
                          <td data-label="Delivery Status">
                            <span style={{
                              padding: '3px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: '600',
                              backgroundColor: o.status === 'Delivered' ? '#D4EFDF' : '#FCF3CF',
                              color: o.status === 'Delivered' ? '#196F3D' : '#7D6608'
                            }}>
                              {o.status === 'Delivered' ? 'Completed' : 'Delivery Active'}
                            </span>
                          </td>
                          <td data-label="Phone Number">
                            <strong style={{ fontSize: '14px', color: '#1B3D2B' }}>{o.phone}</strong>
                          </td>
                          <td data-label="Actions">
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <a href={`tel:${o.phone}`} className="page-action-btn" style={{ textDecoration: 'none', padding: '6px 12px', fontSize: '11px' }}>
                                <Phone size={10} style={{ marginRight: '4px' }} /> Call Customer
                              </a>
                              <a 
                                href={`https://wa.me/${o.phone.replace(/[^0-9]/g, '')}`} 
                                target="_blank" rel="noopener noreferrer" className="btn-secondary"
                                style={{ textDecoration: 'none', padding: '6px 12px', fontSize: '11px', backgroundColor: '#E8F8F5', color: '#117A65', borderColor: '#A2D9CE' }}
                              >
                                <MessageSquare size={10} style={{ marginRight: '4px' }} /> WhatsApp Message
                              </a>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {myOrders.length === 0 && (
                        <tr>
                          <td colSpan="5" className="text-center text-muted" style={{ padding: '40px' }}>No contacts available in your active queue.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

            </div>
          )}
        </div>

        {/* Register Agent Modal */}
        {showAddModal && (
          <div className="admin-modal show">
            <div className="admin-modal-content">
              <div className="admin-modal-header" style={{ backgroundColor: 'var(--theme-color)', padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
                      required
                      placeholder="e.g. Karthik S."
                      value={newPartner.name}
                      onChange={(e) => setNewPartner(prev => ({ ...prev, name: e.target.value }))}
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #EAE6DB' }}
                    />
                  </div>
                  <div className="form-field">
                    <label>Mobile Number</label>
                    <input 
                      type="tel" 
                      required
                      placeholder="e.g. +91 98765 43210"
                      value={newPartner.phone}
                      onChange={(e) => setNewPartner(prev => ({ ...prev, phone: e.target.value }))}
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #EAE6DB' }}
                    />
                  </div>
                  <div className="form-field">
                    <label>Status</label>
                    <select 
                      value={newPartner.status}
                      onChange={(e) => setNewPartner(prev => ({ ...prev, status: e.target.value }))}
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #EAE6DB', backgroundColor: '#fff' }}
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

        {/* Assign Dispatch Modal */}
        {showAssignModal && (
          <div className="admin-modal show">
            <div className="admin-modal-content">
              <div className="admin-modal-header" style={{ backgroundColor: 'var(--theme-color)', padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #EAE6DB', backgroundColor: '#fff' }}
                      >
                        {pendingOrders.map(o => (
                          <option key={o.id} value={o.raw_id || o.id}>
                            #{o.id} - {o.customer} (₹{o.amount.toFixed(2)} - {o.status})
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
                        placeholder="Enter Order ID manually (e.g. 1)"
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
