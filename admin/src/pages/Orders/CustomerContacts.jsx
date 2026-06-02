import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminNavbar from '../../components/AdminNavbar';
import apiClient from '../../services/api';
import '../../assets/styles/admin-style.css';
import '../../assets/styles/tables.css';

const CustomerContacts = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await apiClient.get('/delivery-management/my-orders');
        setOrders(response.data);
      } catch (err) {
        console.error("Failed to load contacts:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  return (
    <div className="admin-wrapper">
      <AdminSidebar />
      <div className="admin-container">
        <AdminNavbar />
        
        <div className="admin-content">
          <div className="page-header">
            <div className="page-title-area">
              <h2>Customer Contacts Directory</h2>
              <p>Quick directory lookup for telephone numbers, text notifications, and delivery support calls</p>
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
                      <th>Order ID</th>
                      <th>Customer Name</th>
                      <th>Access Status</th>
                      <th>Phone Number</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => (
                      <tr key={o.id}>
                        <td><strong>#{o.order_id_string || `ORD-${o.id}`}</strong></td>
                        <td><strong>{o.customer_name}</strong></td>
                        <td>
                          <span style={{
                            padding: '3px 8px',
                            borderRadius: '10px',
                            fontSize: '11px',
                            fontWeight: '600',
                            backgroundColor: o.status === 'Delivered' ? '#D4EFDF' : '#FCF3CF',
                            color: o.status === 'Delivered' ? '#196F3D' : '#7D6608'
                          }}>
                            {o.status === 'Delivered' ? 'Completed' : 'Delivery Active'}
                          </span>
                        </td>
                        <td>
                          <strong style={{ fontSize: '14px', color: '#1B3D2B' }}>{o.phone}</strong>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '10px' }}>
                            <a 
                              href={`tel:${o.phone}`} 
                              className="page-action-btn"
                              style={{ textDecoration: 'none', padding: '6px 12px', fontSize: '11px', display: 'inline-block' }}
                            >
                              <i className="fa-solid fa-phone" style={{ marginRight: '6px' }}></i> Call Customer
                            </a>
                            <a 
                              href={`https://wa.me/${o.phone.replace(/[^0-9]/g, '')}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="btn-secondary"
                              style={{ textDecoration: 'none', padding: '6px 12px', fontSize: '11px', display: 'inline-block', backgroundColor: '#E8F8F5', color: '#117A65', borderColor: '#A2D9CE' }}
                            >
                              <i className="fa-brands fa-whatsapp" style={{ marginRight: '6px' }}></i> WhatsApp message
                            </a>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {orders.length === 0 && (
                      <tr>
                        <td colSpan="5" className="text-center text-muted" style={{ padding: '40px' }}>
                          No customer contact cards found in your delivery queue.
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

export default CustomerContacts;
