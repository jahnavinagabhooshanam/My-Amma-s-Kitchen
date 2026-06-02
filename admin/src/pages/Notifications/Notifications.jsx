import React from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminNavbar from '../../components/AdminNavbar';
import '../../assets/styles/admin-style.css';
import '../../assets/styles/tables.css';

const MOCK_NOTIFICATIONS = [
  { id: 1, type: "Inventory Warning", message: "Organic Finger Millet stock is low (28 kg left)", date: "Today, 3:15 PM", severity: "High" },
  { id: 2, type: "New Order Alert", message: "New bulk catering request received from Dr. Rajesh", date: "Today, 11:30 AM", severity: "Medium" },
  { id: 3, type: "System Notification", message: "Daily backup completed successfully", date: "Yesterday, 11:59 PM", severity: "Low" }
];

const Notifications = () => {
  return (
    <div className="admin-wrapper">
      <AdminSidebar />
      
      <div className="admin-container">
        <AdminNavbar />

        <div className="admin-content">
          <div className="page-header">
            <div className="page-title-area">
              <h2>System Notifications</h2>
              <p>Monitor system processes, low-stock notifications, and critical alerts</p>
            </div>
          </div>

          <div className="premium-card">
            <div className="responsive-table-wrapper" style={{ border: 'none', boxShadow: 'none' }}>
              <table className="responsive-table">
                <thead>
                  <tr>
                    <th>Alert Type</th>
                    <th>Message Details</th>
                    <th>Date & Time</th>
                    <th>Severity Level</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_NOTIFICATIONS.map((n) => (
                    <tr key={n.id}>
                      <td>
                        <strong>
                          <i className={`fa-solid ${n.type.includes('Warning') ? 'fa-triangle-exclamation text-danger' : n.type.includes('Order') ? 'fa-cart-plus text-primary' : 'fa-circle-info text-muted'}`} style={{ marginRight: '8px' }}></i>
                          {n.type}
                        </strong>
                      </td>
                      <td>{n.message}</td>
                      <td>{n.date}</td>
                      <td>
                        <span className={`status-badge ${n.severity === 'High' ? 'status-received' : n.severity === 'Medium' ? 'status-preparing' : 'status-delivered'}`}>
                          {n.severity} Priority
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        <div className="admin-footer">
          <div>&copy; 2026 <strong>Amma's Kitchen Admin</strong>. All Rights Reserved.</div>
        </div>

      </div>
    </div>
  );
};

export default Notifications;
