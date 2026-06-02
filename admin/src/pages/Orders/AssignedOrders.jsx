import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminNavbar from '../../components/AdminNavbar';
import apiClient from '../../services/api';
import '../../assets/styles/admin-style.css';
import '../../assets/styles/tables.css';
import { 
  CheckCircle, 
  AlertTriangle, 
  Phone, 
  MapPin, 
  Play, 
  XCircle,
  Check
} from 'lucide-react';

const AssignedOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchAssignedOrders = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/delivery-management/my-orders');
      setOrders(response.data);
    } catch (err) {
      console.error("Failed to load assigned orders:", err);
      setErrorMsg("Failed to load assigned orders from MySQL database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignedOrders();
  }, []);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      // If marked Delivered, also update payment status to Paid
      await apiClient.put(`/orders/${orderId}`, { status: newStatus });
      setSuccessMsg(`Order #${orderId} marked as "${newStatus}"`);
      fetchAssignedOrders();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to update status.");
    }
  };

  const handleRejectOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to reject this delivery assignment?")) return;
    try {
      // Rejections will mark order status back to Confirmed or Packed, and clear partner assigned_orders in real system
      // Here, we update order status back to Packed (so another driver can pick it up)
      await apiClient.put(`/orders/${orderId}`, { status: 'Packed' });
      setSuccessMsg(`Order #${orderId} rejected and put back in queue.`);
      fetchAssignedOrders();
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
          <div className="page-header">
            <div className="page-title-area">
              <h2>My Assigned Delivery Queue</h2>
              <p>Review designated orders, load food items, run map routes, and mark complete COD payments</p>
            </div>
          </div>

          {successMsg && (
            <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#e2ebd9', color: '#1b3d2b', border: '1px solid var(--border-color)', padding: '12px 18px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', marginBottom: '20px' }}>
              <CheckCircle size={16} style={{ marginRight: '6px' }} /> {successMsg}
            </div>
          )}

          {errorMsg && (
            <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#FADBD8', color: '#78281F', border: '1px solid #F1948A', padding: '12px 18px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', marginBottom: '20px' }}>
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
                      <th>Order ID</th>
                      <th>Customer Info</th>
                      <th>Delivery Address</th>
                      <th>Dishes Checklist</th>
                      <th>Total & COD</th>
                      <th>Route Progress</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => (
                      <tr key={o.id}>
                        <td><strong>#{o.order_id_string || `ORD-${o.id}`}</strong></td>
                        <td>
                          <strong>{o.customer_name}</strong>
                          <div style={{ fontSize: '11px', color: '#7E7A6B', marginTop: '4px' }}>
                            <a href={`tel:${o.phone}`} style={{ color: 'var(--primary-color)', fontWeight: '600', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <Phone size={11} /> {o.phone}
                            </a>
                          </div>
                        </td>
                        <td style={{ maxWidth: '240px', fontSize: '12px', lineHeight: '1.4' }}>
                          <MapPin size={12} style={{ color: 'var(--accent-color)', marginRight: '4px', verticalAlign: 'middle', display: 'inline-block' }} />
                          {o.delivery_address}
                        </td>
                        <td>
                          <div style={{ fontSize: '12px' }}>
                            {o.items?.map((it, idx) => (
                              <div key={idx}>• {it.quantity}x {it.product_name}</div>
                            ))}
                          </div>
                        </td>
                        <td>
                          <div style={{ fontWeight: '700' }}>₹{o.total.toFixed(2)}</div>
                          <span style={{
                            padding: '2px 6px',
                            borderRadius: '8px',
                            fontSize: '9px',
                            fontWeight: '700',
                            backgroundColor: o.payment_status === 'Paid' ? '#D4EFDF' : '#FCF3CF',
                            color: o.payment_status === 'Paid' ? '#196F3D' : '#7D6608'
                          }}>
                            {o.payment_status === 'Paid' ? 'Paid' : 'COD Pending'}
                          </span>
                        </td>
                        <td>
                          <span style={{
                            padding: '4px 10px',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: '700',
                            backgroundColor: o.status === 'Out For Delivery' ? '#FCF3CF' : o.status === 'Delivered' ? '#D4EFDF' : '#EBF5FB',
                            color: o.status === 'Out For Delivery' ? '#7D6608' : o.status === 'Delivered' ? '#196F3D' : '#1B4F72'
                          }}>
                            {o.status}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {o.status === 'Packed' && (
                              <div style={{ display: 'flex', gap: '4px' }}>
                                <button 
                                  onClick={() => handleUpdateStatus(o.id, 'Out For Delivery')} 
                                  className="page-action-btn" 
                                  style={{ padding: '6px 10px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                >
                                  <Play size={10} /> Start
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
                                onClick={() => handleUpdateStatus(o.id, 'Delivered')} 
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

                    {orders.length === 0 && (
                      <tr>
                        <td colSpan="7" className="text-center text-muted" style={{ padding: '40px' }}>
                          No assigned deliveries in queue.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default AssignedOrders;
