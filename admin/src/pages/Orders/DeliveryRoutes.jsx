import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminNavbar from '../../components/AdminNavbar';
import apiClient from '../../services/api';
import '../../assets/styles/admin-style.css';

const DeliveryRoutes = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await apiClient.get('/delivery-management/my-orders');
        // Only show pending or active deliveries
        setOrders(response.data.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled'));
      } catch (err) {
        console.error("Failed to load routes:", err);
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
              <h2>Active Delivery Routes</h2>
              <p>View Google Maps directions, address coordinates, and dispatch routes for your assignments</p>
            </div>
          </div>

          {loading ? (
            <div style={{ height: '240px', backgroundColor: '#e2ebd9', borderRadius: '15px', animation: 'pulse 1.5s infinite' }} />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
              {orders.map((o) => {
                const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(o.delivery_address)}`;
                return (
                  <div key={o.id} className="premium-card" style={{ padding: '20px', border: '1px solid #EAE6DB', borderRadius: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <span style={{ fontWeight: '700', fontSize: '14px', color: 'var(--primary-color)' }}>ORD-{o.id}</span>
                      <span style={{
                        padding: '3px 8px',
                        borderRadius: '8px',
                        fontSize: '10px',
                        fontWeight: '700',
                        backgroundColor: '#FCF3CF',
                        color: '#7D6608'
                      }}>{o.status}</span>
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                      <strong style={{ fontSize: '13px', display: 'block', marginBottom: '4px' }}>Customer Name:</strong>
                      <span style={{ fontSize: '13px', color: '#64748B' }}>{o.customer_name}</span>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                      <strong style={{ fontSize: '13px', display: 'block', marginBottom: '4px' }}>Delivery Address:</strong>
                      <div style={{ fontSize: '13px', color: '#64748B', lineHeight: '1.4', backgroundColor: '#F9F8F6', padding: '10px', borderRadius: '8px', border: '1px dashed #EAE6DB' }}>
                        <i className="fa-solid fa-location-dot" style={{ color: 'var(--accent-color)', marginRight: '6px' }}></i>
                        {o.delivery_address}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                      <a 
                        href={mapUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="page-action-btn"
                        style={{ flex: 1, textAlign: 'center', textDecoration: 'none', padding: '8px 0', fontSize: '12px', display: 'inline-block' }}
                      >
                        <i className="fa-solid fa-map-location-dot" style={{ marginRight: '6px' }}></i> Open Google Maps
                      </a>
                      
                      <a 
                        href={`tel:${o.phone}`}
                        className="btn-secondary"
                        style={{ flex: 0.8, textAlign: 'center', textDecoration: 'none', padding: '8px 0', fontSize: '12px', display: 'inline-block' }}
                      >
                        <i className="fa-solid fa-phone" style={{ marginRight: '4px' }}></i> Call Client
                      </a>
                    </div>
                  </div>
                );
              })}

              {orders.length === 0 && (
                <div className="premium-card" style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', color: '#7E7A6B' }}>
                  <i className="fa-solid fa-route" style={{ fontSize: '32px', color: '#EAE6DB', marginBottom: '10px', display: 'block' }}></i>
                  No active routes. All assigned deliveries completed!
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default DeliveryRoutes;
