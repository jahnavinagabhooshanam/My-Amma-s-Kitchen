import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
  AlertTriangle,
  ChefHat,
  Flame,
  Package,
  Clock,
  Truck,
  ThumbsUp,
  MapPin,
  Phone
} from 'lucide-react';
import PropTypes from 'prop-types';

// Timeline components
const OrderTimeline = ({ currentStatus }) => {
  const stages = ['Pending', 'Confirmed', 'Preparing', 'Packed', 'Out For Delivery', 'Delivered'];
  const currentIdx = stages.indexOf(currentStatus);

  return (
    <div style={{ margin: '20px 0 30px', padding: '10px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
        {/* Connector Line */}
        <div style={{
          position: 'absolute',
          top: '15px',
          left: '5%',
          right: '5%',
          height: '4px',
          backgroundColor: '#EAE6DB',
          zIndex: 1
        }} />
        <div style={{
          position: 'absolute',
          top: '15px',
          left: '5%',
          width: `${currentIdx >= 0 ? (currentIdx / (stages.length - 1)) * 90 : 0}%`,
          height: '4px',
          backgroundColor: '#3F9065',
          zIndex: 2,
          transition: 'width 0.4s ease'
        }} />

        {stages.map((stage, idx) => {
          const isCompleted = idx < currentIdx;
          const isActive = idx === currentIdx;
          const isPending = idx > currentIdx;

          let icon = <Clock size={14} />;
          if (stage === 'Confirmed') icon = <ThumbsUp size={14} />;
          else if (stage === 'Preparing') icon = <ChefHat size={14} />;
          else if (stage === 'Packed') icon = <Package size={14} />;
          else if (stage === 'Out For Delivery') icon = <Truck size={14} />;
          else if (stage === 'Delivered') icon = <CheckCircle size={14} />;

          let circleColor = '#EAE6DB';
          let iconColor = '#888';
          let textColor = '#888';
          let borderWidth = '0px';

          if (isActive) {
            circleColor = '#C9AB81';
            iconColor = '#fff';
            textColor = '#C9AB81';
            borderWidth = '2px';
          } else if (isCompleted) {
            circleColor = '#3F9065';
            iconColor = '#fff';
            textColor = '#3F9065';
          }

          return (
            <div key={idx} style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              zIndex: 3,
              width: '15%'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: circleColor,
                color: iconColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: borderWidth !== '0px' ? `3px solid #FAF8F2` : 'none',
                boxShadow: isActive ? '0 0 0 3px #C9AB81' : 'none'
              }}>
                {icon}
              </div>
              <span style={{
                fontSize: '11px',
                fontWeight: isActive || isCompleted ? '700' : '500',
                color: textColor,
                marginTop: '8px',
                textAlign: 'center',
                whiteSpace: 'nowrap'
              }}>{stage}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

OrderTimeline.propTypes = {
  currentStatus: PropTypes.string
};

const Orders = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const activeTabParam = searchParams.get('tab') || 'all';

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { searchQuery, setSearchQuery } = useAuth();
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [activeTab, setActiveTab] = useState('all'); // 'all', 'rte', 'rtc'

  useEffect(() => {
    setActiveTab(activeTabParam);
    setCurrentPage(1);
  }, [activeTabParam, searchQuery, statusFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/orders/');
      setOrders(response.data);
    } catch (err) {
      console.error("Failed to load orders:", err);
      setErrorMsg("Failed to load orders from database.");
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
      setTimeout(() => setErrorMsg(''), 4000);
    }
  };

  const handleExportCSV = () => {
    if (orders.length === 0) return;
    
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Order ID,Customer,Total Amount,Status,Payment Status,Date,Address,Phone\n";
    
    orders.forEach((o) => {
      const row = [
        o.id,
        `"${o.customer_name}"`,
        o.total,
        o.status,
        o.payment_status || 'Pending',
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

  // Tab Filtering logic
  const getFilteredOrders = () => {
    let result = orders;

    // 1. Filter by search query
    if (searchQuery) {
      result = result.filter(o => 
        o.id.toString().includes(searchQuery) || 
        o.customer_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // 2. Filter by Status select
    if (statusFilter !== 'All') {
      result = result.filter(o => o.status === statusFilter);
    }

    // 3. Filter by Tab (RTE / RTC items filter)
    if (activeTab === 'rte') {
      result = result.filter(o => 
        o.items && o.items.some(item => 
          item.category?.toLowerCase() === 'ready to eat' || 
          item.category === 'ready_to_eat'
        )
      );
    } else if (activeTab === 'rtc' || activeTab === 'batter') {
      result = result.filter(o => 
        o.items && o.items.some(item => 
          item.category?.toLowerCase() === 'ready to cook' || 
          item.category === 'ready_to_cook' || 
          item.category?.toLowerCase() === 'batter products' ||
          item.category === 'batter_products' ||
          item.category === 'traditional' ||
          item.category === 'millet' ||
          item.category === 'health' ||
          item.category === 'family_packs' ||
          item.category === 'premium' ||
          item.category === 'subscription'
        )
      );
    } else if (activeTab === 'pending') {
      result = result.filter(o => o.status === 'Pending');
    } else if (activeTab === 'completed') {
      result = result.filter(o => o.status === 'Delivered' || o.status === 'Completed' || o.status === 'Packed');
    } else if (activeTab === 'cancelled') {
      result = result.filter(o => o.status === 'Cancelled');
    }

    return result;
  };

  const filteredOrders = getFilteredOrders();

  return (
    <div className="admin-wrapper">
      <AdminSidebar />
      <div className="admin-container">
        <AdminNavbar />
        
        <div className="admin-content">
          <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
            <div className="page-title-area">
              <h2>
                {activeTab === 'rte' ? 'Ready To Eat Orders Checklist' : 
                 activeTab === 'batter' ? 'Ready To Cook & Batter Checklist' : 
                 activeTab === 'pending' ? 'Pending Orders Queue' :
                 activeTab === 'completed' ? 'Completed Orders Records' :
                 activeTab === 'cancelled' ? 'Cancelled Orders Log' :
                 'Commercial Orders Roster'}
              </h2>
              <p>
                {activeTab === 'rte' ? 'Prepare hot meals, package orders safely, and dispatch them to delivery agents' : 
                 activeTab === 'batter' ? 'Monitor package assembly, verify vacuum sealings, and update delivery dispatch readiness' : 
                 activeTab === 'pending' ? 'Process new incoming client purchases, confirm schedules, and update status' :
                 activeTab === 'completed' ? 'Review successfully delivered, packed, and closed out orders histories' :
                 activeTab === 'cancelled' ? 'Inspect cancelled, voided, and refunded sales transactions' :
                 'Manage order preparation flows, verify COD transitions, and review home deliveries'}
              </p>
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

          {errorMsg && (
            <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#fcdcd8', color: 'var(--danger-color)', border: '1px solid #f8b4ac', padding: '12px 18px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', marginBottom: '20px' }}>
              <AlertTriangle size={16} style={{ marginRight: '6px' }} /> {errorMsg}
            </div>
          )}

          {/* Tab switches */}
          <div style={{ display: 'flex', gap: '15px', borderBottom: '2px solid #EAE6DB', marginBottom: '25px', paddingBottom: '0', flexWrap: 'wrap' }}>
            {[
              { id: 'all', label: 'All Orders' },
              { id: 'rte', label: 'Ready To Eat Orders' },
              { id: 'batter', label: 'Batter Orders' },
              { id: 'pending', label: 'Pending Orders' },
              { id: 'completed', label: 'Completed Orders' },
              { id: 'cancelled', label: 'Cancelled Orders' }
            ].map(tabItem => (
              <button 
                key={tabItem.id}
                onClick={() => navigate(`/admin/orders?tab=${tabItem.id}`)}
                style={{
                  padding: '10px 20px', fontSize: '14px', fontWeight: '700', border: 'none', background: 'none',
                  borderBottom: activeTab === tabItem.id ? '3px solid var(--primary-color)' : '3px solid transparent',
                  color: activeTab === tabItem.id ? 'var(--primary-color)' : '#7E7A6B', cursor: 'pointer', fontFamily: "'Outfit', sans-serif"
                }}
              >
                {tabItem.label}
              </button>
            ))}
          </div>

          {/* Table Toolbar */}
          <div className="premium-card" style={{ padding: '20px 25px', marginBottom: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
            <div className="navbar-search" style={{ margin: 0, width: '320px', border: '1px solid #EAE6DB', borderRadius: '10px', display: 'flex', alignItems: 'center' }}>
              <Search size={16} style={{ marginRight: '8px', color: '#888' }} />
              <input 
                type="text" 
                placeholder="Search by Order ID or customer..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
            
            <div className="flex gap-1" style={{ alignItems: 'center', display: 'flex', gap: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600' }}>Filter Status:</label>
              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ padding: '8px 12px', border: '1px solid #EAE6DB', borderRadius: '10px', backgroundColor: '#fff', fontSize: '13px' }}
              >
                <option value="All">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Preparing">Preparing</option>
                <option value="Packed">Packed</option>
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
                  
                  {/* Rendering Tab 1: All Orders Grid (reused for pending, completed, cancelled) */}
                  {['all', 'pending', 'completed', 'cancelled'].includes(activeTab) && (
                    <>
                      <thead>
                        <tr>
                          <th>Order ID</th>
                          <th>Customer</th>
                          <th>Ordered Items Summary</th>
                          <th>Total Amount</th>
                          <th>Payment Status</th>
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
                              <div style={{ maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {o.items?.map(it => `${it.quantity}x ${it.product_name}`).join(", ") || 'No Items'}
                              </div>
                            </td>
                            <td style={{ fontWeight: '700' }}>₹{o.total.toFixed(2)}</td>
                            <td>
                              <span style={{
                                padding: '3px 8px', borderRadius: '8px', fontSize: '10px', fontWeight: '700',
                                backgroundColor: o.payment_status === 'Paid' ? '#D4EFDF' : '#FCF3CF',
                                color: o.payment_status === 'Paid' ? '#196F3D' : '#7D6608'
                              }}>
                                {o.payment_status || 'Pending'}
                              </span>
                            </td>
                            <td>
                              <select 
                                value={o.status} 
                                onChange={(e) => handleStatusChange(o.id, e.target.value)}
                                style={{ padding: '6px', fontSize: '12px', border: '1px solid #EAE6DB', borderRadius: '4px', backgroundColor: '#fff', fontWeight: '600' }}
                              >
                                <option value="Pending">Pending</option>
                                <option value="Confirmed">Confirmed</option>
                                <option value="Preparing">Preparing</option>
                                <option value="Packed">Packed</option>
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
                      </tbody>
                    </>
                  )}

                  {/* Rendering Tab 2: Ready To Eat Kitchen Checklist */}
                  {activeTab === 'rte' && (
                    <>
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
                        {filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((o) => {
                          const rteItems = o.items?.filter(item => 
                            item.category?.toLowerCase() === 'ready to eat' || 
                            item.category === 'ready_to_eat'
                          ) || [];
                          
                          return (
                            <tr key={o.id}>
                              <td>#ORD-{o.id}</td>
                              <td>
                                <strong>{o.customer_name}</strong>
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
                                  padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '700',
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
                                      onClick={() => handleStatusChange(o.id, 'Preparing')} 
                                      className="page-action-btn" 
                                      style={{ padding: '6px 12px', fontSize: '11px', backgroundColor: '#E67E22', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                    >
                                      <ChefHat size={12} /> Start Preparing
                                    </button>
                                  )}
                                  {o.status === 'Preparing' && (
                                    <button 
                                      onClick={() => handleStatusChange(o.id, 'Packed')} 
                                      className="page-action-btn" 
                                      style={{ padding: '6px 12px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                    >
                                      <CheckCircle size={12} /> Mark Packed / Prepared
                                    </button>
                                  )}
                                  {(o.status === 'Packed' || o.status === 'Preparing') && (
                                    <span style={{ fontSize: '11px', color: '#7E7A6B', padding: '6px' }}>Ready for delivery dispatch</span>
                                  )}
                                  <button onClick={() => setSelectedOrder(o)} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '11px' }}>
                                    View details
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </>
                  )}

                  {/* Rendering Tab 3: Ready To Cook & Batter Packing */}
                  {(activeTab === 'rtc' || activeTab === 'batter') && (
                    <>
                      <thead>
                        <tr>
                          <th>Order ID</th>
                          <th>Customer Details</th>
                          <th>RTC & Batter Checklist</th>
                          <th>Current Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((o) => {
                          const rtcItems = o.items?.filter(item => 
                            item.category?.toLowerCase() === 'ready to cook' || 
                            item.category === 'ready_to_cook' || 
                            item.category?.toLowerCase() === 'batter products' ||
                            item.category === 'batter_products'
                          ) || [];
                          
                          return (
                            <tr key={o.id}>
                              <td>#ORD-{o.id}</td>
                              <td>
                                <strong>{o.customer_name}</strong>
                                <div className="text-muted" style={{ fontSize: '11px' }}>{o.phone}</div>
                              </td>
                              <td>
                                <ul style={{ margin: 0, paddingLeft: '20px', listStyleType: 'square' }}>
                                  {rtcItems.map((item, idx) => (
                                    <li key={idx} style={{ fontSize: '13px', margin: '4px 0' }}>
                                      <strong>{item.quantity}x</strong> {item.product_name} 
                                      <span style={{ fontSize: '11px', color: '#7E7A6B', marginLeft: '5px' }}>
                                        ({item.category?.replace('_', ' ').toUpperCase() || 'RTC'})
                                      </span>
                                    </li>
                                  ))}
                                </ul>
                              </td>
                              <td>
                                <span style={{
                                  padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '700',
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
                                      onClick={() => handleStatusChange(o.id, 'Preparing')} 
                                      className="page-action-btn" 
                                      style={{ padding: '6px 12px', fontSize: '11px', backgroundColor: '#E67E22', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                    >
                                      <Flame size={12} /> Start Packaging
                                    </button>
                                  )}
                                  {o.status === 'Preparing' && (
                                    <button 
                                      onClick={() => handleStatusChange(o.id, 'Packed')} 
                                      className="page-action-btn" 
                                      style={{ padding: '6px 12px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                    >
                                      <Package size={12} /> Mark Packed / Sealed
                                    </button>
                                  )}
                                  {(o.status === 'Packed' || o.status === 'Preparing') && (
                                    <span style={{ fontSize: '11px', color: '#7E7A6B', padding: '6px' }}>Ready for delivery dispatch</span>
                                  )}
                                  <button onClick={() => setSelectedOrder(o)} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '11px' }}>
                                    View details
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </>
                  )}

                  {filteredOrders.length === 0 && (
                    <tbody>
                      <tr>
                        <td colSpan="8" className="text-center text-muted" style={{ padding: '40px' }}>
                          No orders matched your search or status query.
                        </td>
                      </tr>
                    </tbody>
                  )}
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

        {/* Order Details Modal with Stepper Timeline */}
        {selectedOrder && (
          <div className="admin-modal show">
            <div className="admin-modal-content" style={{ maxWidth: '650px' }}>
              <div className="admin-modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3>Order Details: #ORD-{selectedOrder.id}</h3>
                <button className="admin-modal-close" onClick={() => setSelectedOrder(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  <X size={18} />
                </button>
              </div>
              
              <div className="admin-modal-body">
                {/* Order Timeline */}
                <h4 style={{ margin: '0 0 15px', color: 'var(--title-color)', fontSize: '14px', fontWeight: '700' }}>Order Timeline</h4>
                <OrderTimeline currentStatus={selectedOrder.status} />

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '15px', marginBottom: '20px', borderTop: '1px solid #EAE6DB', paddingTop: '15px' }}>
                  <div>
                    <strong>Customer Info:</strong>
                    <div style={{ fontSize: '13px', marginTop: '5px' }}>{selectedOrder.customer_name}</div>
                    <div style={{ fontSize: '13px', color: '#666' }}>{selectedOrder.phone}</div>
                  </div>
                  <div>
                    <strong>Delivery Address:</strong>
                    <div style={{ fontSize: '13px', marginTop: '5px', lineHeight: '1.4' }}>
                      <MapPin size={12} style={{ display: 'inline-block', marginRight: '4px', verticalAlign: 'middle', color: '#888' }} />
                      {selectedOrder.delivery_address}
                    </div>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '15px', marginBottom: '15px' }}>
                  <strong>Ordered Items:</strong>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', marginTop: '10px', fontSize: '13px', minWidth: '400px' }}>
                      <thead>
                      <tr style={{ background: '#EDF3F0' }}>
                        <th style={{ padding: '8px', textAlign: 'left' }}>Product</th>
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
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px' }}>
                    <div style={{ fontSize: '13px' }}>
                      <span>Payment Method: <strong>{selectedOrder.payment_method || 'COD'}</strong></span>
                      <span style={{ marginLeft: '15px' }}>
                        Payment Status: <strong style={{ color: selectedOrder.payment_status === 'Paid' ? '#27AE60' : '#E67E22' }}>{selectedOrder.payment_status || 'Pending'}</strong>
                      </span>
                    </div>
                    <div style={{ fontSize: '16px', fontWeight: '800', color: 'var(--theme-color)' }}>
                      Total: ₹{selectedOrder.total.toFixed(2)}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#EDF3F0', padding: '10px 15px', borderRadius: '8px', marginTop: '15px' }}>
                  <span style={{ fontSize: '13px', fontWeight: '700' }}>Modify Delivery State:</span>
                  <select 
                    value={selectedOrder.status} 
                    onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
                    style={{ padding: '6px 12px', fontSize: '13px', border: '1px solid #EAE6DB', borderRadius: '4px', backgroundColor: '#fff', fontWeight: '600' }}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Preparing">Preparing</option>
                    <option value="Packed">Packed</option>
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
