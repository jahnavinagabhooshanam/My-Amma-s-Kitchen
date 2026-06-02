import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminNavbar from '../../components/AdminNavbar';
import apiClient from '../../services/api';
import '../../assets/styles/admin-style.css';
import '../../assets/styles/tables.css';
import { 
  CheckCircle, 
  AlertTriangle, 
  ChefHat, 
  Flame 
} from 'lucide-react';

const ReadyToEatOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/orders/');
      // Filter orders that have at least one 'ready_to_eat' item
      const rteOrders = response.data.filter(o => 
        o.items && o.items.some(item => item.category?.toLowerCase() === 'ready to eat' || item.category === 'ready_to_eat')
      );
      setOrders(rteOrders);
    } catch (err) {
      console.error("Failed to load RTE orders:", err);
      setErrorMsg("Failed to load orders from database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await apiClient.put(`/orders/${orderId}`, { status: newStatus });
      setSuccessMsg(`Order #${orderId} marked as ${newStatus}`);
      fetchOrders();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to update order status.");
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
              <h2>Ready To Eat Orders Checklist</h2>
              <p>Prepare hot meals, package orders safely, and dispatch them to delivery agents</p>
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
                      <th>Customer Details</th>
                      <th>RTE Dishes Checklist</th>
                      <th>Current Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => {
                      const rteItems = o.items.filter(item => item.category?.toLowerCase() === 'ready to eat' || item.category === 'ready_to_eat');
                      return (
                        <tr key={o.id}>
                          <td>#ORD-{o.id}</td>
                          <td>
                            <strong>{o.customer}</strong>
                            <div className="text-muted" style={{ fontSize: '11px' }}>{o.phone}</div>
                          </td>
                          <td>
                            <ul style={{ margin: 0, paddingLeft: '20px', listStyleType: 'square' }}>
                              {rteItems.map((item, idx) => (
                                <li key={idx} style={{ fontSize: '13px', margin: '4px 0' }}>
                                  <strong>{item.quantity}x</strong> {item.product_name}
                                </li>
                              ))}
                            </ul>
                          </td>
                          <td>
                            <span style={{
                              padding: '4px 10px',
                              borderRadius: '12px',
                              fontSize: '11px',
                              fontWeight: '700',
                              backgroundColor: o.status === 'Preparing' ? '#FCF3CF' : o.status === 'Packed' || o.status === 'Delivered' ? '#D4EFDF' : '#EBF5FB',
                              color: o.status === 'Preparing' ? '#7D6608' : o.status === 'Packed' || o.status === 'Delivered' ? '#196F3D' : '#1B4F72'
                            }}>
                              {o.status}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              {o.status !== 'Preparing' && o.status !== 'Packed' && o.status !== 'Delivered' && (
                                <button 
                                  onClick={() => handleUpdateStatus(o.id, 'Preparing')} 
                                  className="page-action-btn" 
                                  style={{ padding: '6px 12px', fontSize: '11px', backgroundColor: '#E67E22', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                >
                                  <ChefHat size={10} /> Start Preparing
                                </button>
                              )}
                              {o.status === 'Preparing' && (
                                <button 
                                  onClick={() => handleUpdateStatus(o.id, 'Packed')} 
                                  className="page-action-btn" 
                                  style={{ padding: '6px 12px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                >
                                  <CheckCircle size={10} /> Mark Packed / Prepared
                                </button>
                              )}
                              {(o.status === 'Packed' || o.status === 'Preparing') && (
                                <span style={{ fontSize: '11px', color: '#7E7A6B', padding: '6px' }}>Ready for delivery dispatch</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}

                    {orders.length === 0 && (
                      <tr>
                        <td colSpan="5" className="text-center text-muted" style={{ padding: '40px' }}>
                          No active Ready To Eat orders found.
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

export default ReadyToEatOrders;
