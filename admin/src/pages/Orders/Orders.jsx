import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminNavbar from '../../components/AdminNavbar';
import apiClient from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import '../../assets/styles/admin-style.css';
import '../../assets/styles/tables.css';
import { 
  Search, 
  FileDown, 
  Eye, 
  X, 
  CheckCircle, 
  AlertTriangle 
} from 'lucide-react';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { searchQuery, setSearchQuery } = useAuth();
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/orders/');
      setOrders(response.data);
    } catch (err) {
      console.error("Failed to load orders:", err);
      setErrorMsg("Failed to load orders from MySQL database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await apiClient.put(`/orders/${orderId}`, { status: newStatus });
      setSuccessMsg(`Order #${orderId} status changed to ${newStatus}`);
      fetchOrders();
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(prev => ({ ...prev, status: newStatus }));
      }
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to update order status.");
    }
  };

  const handleExportCSV = () => {
    if (orders.length === 0) return;
    
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Order ID,Customer,Total Amount,Status,Date,Address,Phone\n";
    
    orders.forEach((o) => {
      const row = [
        o.id,
        `"${o.customer_name}"`,
        o.total,
        o.status,
        o.created_at || '',
        `"${o.delivery_address || ''}"`,
        `"${o.phone || ''}"`
      ].join(",");
      csvContent += row + "\n";
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `orders_report_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.id.toString().includes(searchQuery) || 
                          o.customer_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="admin-wrapper">
      <AdminSidebar />
      <div className="admin-container">
        <AdminNavbar />
        
        <div className="admin-content">
          <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
            <div className="page-title-area">
              <h2>Customer Orders</h2>
              <p>Manage order preparation flows, verify COD transitions, and review home deliveries</p>
            </div>
            
            <button className="page-action-btn" onClick={handleExportCSV} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <FileDown size={16} /> Export Orders (CSV)
            </button>
          </div>

          {successMsg && (
            <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#e2ebd9', color: '#1b3d2b', border: '1px solid var(--border-color)', padding: '12px 18px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', marginBottom: '20px' }}>
              <CheckCircle size={16} style={{ marginRight: '6px' }} /> {successMsg}
            </div>
          )}

          {/* Table Toolbar */}
          <div className="premium-card" style={{ padding: '20px 25px', marginBottom: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
            <div className="navbar-search" style={{ margin: 0, width: '320px', border: '1px solid #EAE6DB', borderRadius: '10px', display: 'flex', alignItems: 'center' }}>
              <Search size={16} style={{ marginRight: '8px', color: '#888' }} />
              <input 
                type="text" 
                placeholder="Search by Order ID or name..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
            
            <div className="flex gap-1" style={{ alignItems: 'center' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', marginRight: '5px' }}>Filter Status:</label>
              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ padding: '8px 12px', border: '1px solid #EAE6DB', borderRadius: '10px', backgroundColor: '#fff', fontSize: '13px' }}
              >
                <option value="All">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Preparing">Preparing</option>
                <option value="Out For Delivery">Out For Delivery</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
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
                      <th>Customer</th>
                      <th>Ordered Items Summary</th>
                      <th>Total Amount</th>
                      <th>Delivery Status</th>
                      <th>Date Placed</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((o) => (
                      <tr key={o.id}>
                        <td>#ORD-{o.id}</td>
                        <td>
                          <strong>{o.customer_name}</strong>
                          <div className="text-muted" style={{ fontSize: '11px' }}>{o.phone}</div>
                        </td>
                        <td>
                          <div style={{ maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {o.items?.map(it => `${it.quantity}x ${it.product_name}`).join(", ") || 'No Items'}
                          </div>
                        </td>
                        <td style={{ fontWeight: '700' }}>₹{o.total.toFixed(2)}</td>
                        <td>
                          <select 
                            value={o.status} 
                            onChange={(e) => handleStatusChange(o.id, e.target.value)}
                            style={{ padding: '6px', fontSize: '12px', border: '1px solid #EAE6DB', borderRadius: '4px', backgroundColor: '#fff' }}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Preparing">Preparing</option>
                            <option value="Out For Delivery">Out For Delivery</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="text-muted" style={{ fontSize: '12px' }}>
                          {o.created_at ? new Date(o.created_at).toLocaleDateString() : 'N/A'}
                        </td>
                        <td>
                          <button onClick={() => setSelectedOrder(o)} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            <Eye size={14} /> View Details
                          </button>
                        </td>
                      </tr>
                    ))}

                    {filteredOrders.length === 0 && (
                      <tr>
                        <td colSpan="7" className="text-center text-muted" style={{ padding: '40px' }}>
                          No orders matched your search or status query.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination Controls */}
              {Math.ceil(filteredOrders.length / itemsPerPage) > 1 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', padding: '15px 25px', borderTop: '1px solid #FAF8F2', flexWrap: 'wrap', gap: '15px' }}>
                  <div style={{ fontSize: '13px', color: '#666' }}>
                    Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredOrders.length)} to {Math.min(currentPage * itemsPerPage, filteredOrders.length)} of {filteredOrders.length} entries
                  </div>
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <button 
                      disabled={currentPage === 1} 
                      onClick={() => setCurrentPage(prev => prev - 1)}
                      style={{ padding: '6px 12px', fontSize: '12px', border: '1px solid #EAE6DB', borderRadius: '6px', backgroundColor: currentPage === 1 ? '#FAF8F2' : '#fff', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', color: currentPage === 1 ? '#aaa' : '#333' }}
                    >
                      Previous
                    </button>
                    {Array.from({ length: Math.ceil(filteredOrders.length / itemsPerPage) }, (_, i) => i + 1).map(page => (
                      <button 
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        style={{ padding: '6px 12px', fontSize: '12px', border: '1px solid', borderColor: currentPage === page ? 'var(--primary-color)' : '#EAE6DB', borderRadius: '6px', backgroundColor: currentPage === page ? 'var(--primary-color)' : '#fff', color: currentPage === page ? '#fff' : '#333', fontWeight: currentPage === page ? '700' : 'normal', cursor: 'pointer' }}
                      >
                        {page}
                      </button>
                    ))}
                    <button 
                      disabled={currentPage === Math.ceil(filteredOrders.length / itemsPerPage)} 
                      onClick={() => setCurrentPage(prev => prev + 1)}
                      style={{ padding: '6px 12px', fontSize: '12px', border: '1px solid #EAE6DB', borderRadius: '6px', backgroundColor: currentPage === Math.ceil(filteredOrders.length / itemsPerPage) ? '#FAF8F2' : '#fff', cursor: currentPage === Math.ceil(filteredOrders.length / itemsPerPage) ? 'not-allowed' : 'pointer', color: currentPage === Math.ceil(filteredOrders.length / itemsPerPage) ? '#aaa' : '#333' }}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Order Details Modal */}
        {selectedOrder && (
          <div className="admin-modal show">
            <div className="admin-modal-content">
              <div className="admin-modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3>Order #ORD-{selectedOrder.id} Details</h3>
                <button className="admin-modal-close" onClick={() => setSelectedOrder(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  <X size={18} />
                </button>
              </div>
              <div className="admin-modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                  <div>
                    <strong>Customer Info:</strong>
                    <div style={{ fontSize: '13px', marginTop: '5px' }}>{selectedOrder.customer_name}</div>
                    <div style={{ fontSize: '13px', color: '#666' }}>{selectedOrder.phone}</div>
                  </div>
                  <div>
                    <strong>Delivery Address:</strong>
                    <div style={{ fontSize: '13px', marginTop: '5px', lineHeight: '1.4' }}>{selectedOrder.delivery_address}</div>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '15px', marginBottom: '15px' }}>
                  <strong>Ordered Items:</strong>
                  <table style={{ width: '100%', marginTop: '10px', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ background: 'var(--smoke-color)' }}>
                        <th style={{ padding: '8px' }}>Product</th>
                        <th style={{ padding: '8px', textAlign: 'center' }}>Qty</th>
                        <th style={{ padding: '8px', textAlign: 'right' }}>Price</th>
                        <th style={{ padding: '8px', textAlign: 'right' }}>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items?.map((it, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <td style={{ padding: '8px' }}>{it.product_name}</td>
                          <td style={{ padding: '8px', textAlign: 'center' }}>{it.quantity}</td>
                          <td style={{ padding: '8px', textAlign: 'right' }}>₹{it.price.toFixed(2)}</td>
                          <td style={{ padding: '8px', textAlign: 'right' }}>₹{(it.price * it.quantity).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div style={{ textAlign: 'right', marginTop: '15px', fontSize: '16px', fontWeight: '800', color: 'var(--theme-color)' }}>
                    Total Amount: ₹{selectedOrder.total.toFixed(2)}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#EDF3F0', padding: '10px 15px', borderRadius: '8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: '700' }}>Modify Delivery State:</span>
                  <select 
                    value={selectedOrder.status} 
                    onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
                    style={{ padding: '6px 12px', fontSize: '13px', border: '1px solid #EAE6DB', borderRadius: '4px', backgroundColor: '#fff' }}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Preparing">Preparing</option>
                    <option value="Out For Delivery">Out For Delivery</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
              <div className="admin-modal-footer">
                <button className="btn-secondary" onClick={() => setSelectedOrder(null)}>Close</button>
              </div>
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

export default Orders;
