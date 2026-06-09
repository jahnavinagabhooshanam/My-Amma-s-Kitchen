import React, { useState, useEffect, useRef } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminNavbar from '../../components/AdminNavbar';
import '../../assets/styles/admin-style.css';
import '../../assets/styles/tables.css';
import '../../assets/styles/charts.css';
import apiClient from '../../services/api';
import { Chart } from 'chart.js/auto';
import { useAuth } from '../../context/AuthContext';
import { 
  IndianRupee, 
  TrendingUp, 
  ShoppingBag, 
  Clock, 
  Users, 
  UserCheck, 
  Tag, 
  Cpu, 
  ChefHat, 
  AlertTriangle, 
  Eye, 
  ShoppingCart, 
  UserPlus, 
  Star, 
  PartyPopper, 
  CheckCircle, 
  X, 
  ChevronRight, 
  Activity, 
  Bell, 
  FileText, 
  Layers, 
  Truck, 
  Sparkles,
  ArrowRight,
  TrendingDown,
  Info,
  Calendar,
  Flame,
  Factory,
  Package,
  MapPin,
  ClipboardList
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const userRole = user?.role || 'admin';
  const isStaff = userRole === 'kitchen_staff' || userRole === 'delivery_staff';

  const [activeTab, setActiveTab] = useState('overview');

  const [stats, setStats] = useState({
    total_orders: 0,
    today_orders: 0,
    total_revenue: 0,
    total_customers: 0,
    pending_orders: 0,
    completed_orders: 0,
    cancelled_orders: 0,
    total_products: 0,
    monthly_revenue: 0,
    bulk_orders: 0,
    active_coupons: 0,
    active_customers: 0,
    new_customers_this_month: 0,
    repeat_customers: 0,
    ai_predicted_tomorrow: 0,
    ai_predicted_week: 0,
    stage_preparing: 0,
    stage_cooking: 0,
    stage_packed: 0,
    stage_delivery: 0,
    stage_delivered: 0,
    recent_activity: [],
    best_selling_products: [],
    monthly_sales: [],
    inventory_alerts: [],
    recent_orders: [],
    latest_customers: []
  });

  const [liveMonitor, setLiveMonitor] = useState({
    unique_visitors: 0,
    total_views: 0,
    product_views: 0,
    cart_activity: 0,
    today_orders: 0,
    today_revenue: 0,
    most_viewed_product: null,
    most_sold_product: null,
    activity_logs: []
  });

  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Period filter for Chart.js Trends
  const [analyticsPeriod, setAnalyticsPeriod] = useState('month');
  const [analyticsData, setAnalyticsData] = useState({
    labels: [],
    revenue: [],
    orders: [],
    customers: [],
    pie_data: []
  });
  const [productionLogs, setProductionLogs] = useState([]);

  // Chart Refs
  const trendCanvasRef = useRef(null);
  const categoryCanvasRef = useRef(null);
  const trendChartInstanceRef = useRef(null);
  const categoryChartInstanceRef = useRef(null);

  const fetchStats = async () => {
    try {
      const response = await apiClient.get('/admin/dashboard-stats');
      setStats(response.data);
    } catch (err) {
      console.error("Failed to fetch dashboard stats:", err);
    }
  };

  const fetchAnalytics = async () => {
    if (isStaff) return;
    try {
      const response = await apiClient.get(`/admin/analytics?period=${analyticsPeriod}`);
      setAnalyticsData(response.data);
    } catch (err) {
      console.error("Failed to fetch analytics data:", err);
    }
  };

  const fetchProductionLogs = async () => {
    try {
      const response = await apiClient.get('/batter-production/');
      setProductionLogs(response.data.slice(0, 5));
    } catch (err) {
      console.error("Failed to fetch batter production logs:", err);
    }
  };

  const fetchLiveMonitor = async () => {
    try {
      const response = await apiClient.get('/admin/live-monitor');
      setLiveMonitor(response.data);
    } catch (err) {
      console.error("Failed to fetch live monitor statistics:", err);
    }
  };

  const loadData = async () => {
    setLoading(true);
    if (isStaff) {
      await Promise.all([fetchStats(), fetchProductionLogs()]);
    } else {
      await Promise.all([fetchStats(), fetchAnalytics(), fetchProductionLogs()]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!isStaff) {
      fetchAnalytics();
    }
  }, [analyticsPeriod]);

  // Live polling for the website monitor
  useEffect(() => {
    let intervalId;
    if (activeTab === 'live_monitor' && !isStaff) {
      fetchLiveMonitor();
      intervalId = setInterval(fetchLiveMonitor, 3000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [activeTab]);

  // Render Line/Trend Chart
  useEffect(() => {
    if (!isStaff && !loading && trendCanvasRef.current && activeTab === 'overview') {
      if (trendChartInstanceRef.current) {
        trendChartInstanceRef.current.destroy();
      }

      const ctx = trendCanvasRef.current.getContext('2d');
      
      const chartLabels = analyticsData.labels || [];
      const chartRevenue = analyticsData.revenue || [];
      const chartOrders = analyticsData.orders || [];

      trendChartInstanceRef.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels: chartLabels,
          datasets: [
            {
              label: 'Revenue ()',
              data: chartRevenue,
              borderColor: '#3F9065',
              backgroundColor: 'rgba(63, 144, 101, 0.1)',
              tension: 0.35,
              fill: true,
              yAxisID: 'y',
              borderWidth: 3
            },
            {
              label: 'Orders',
              data: chartOrders,
              borderColor: '#C9AB81',
              backgroundColor: 'rgba(201, 171, 129, 0.1)',
              tension: 0.35,
              fill: true,
              yAxisID: 'y1',
              borderWidth: 3
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
              labels: {
                color: '#1b3d2b',
                font: { weight: '600', family: 'Inter' }
              }
            }
          },
          scales: {
            y: {
              type: 'linear',
              display: true,
              position: 'left',
              grid: { color: '#FAF8F2' }
            },
            y1: {
              type: 'linear',
              display: true,
              position: 'right',
              grid: { drawOnChartArea: false }
            }
          }
        }
      });
    }

    return () => {
      if (trendChartInstanceRef.current) {
        trendChartInstanceRef.current.destroy();
        trendChartInstanceRef.current = null;
      }
    };
  }, [analyticsData, loading, activeTab]);

  // Render Pie Chart
  useEffect(() => {
    if (!isStaff && !loading && categoryCanvasRef.current && activeTab === 'overview') {
      if (categoryChartInstanceRef.current) {
        categoryChartInstanceRef.current.destroy();
      }

      const ctx = categoryCanvasRef.current.getContext('2d');
      const colors = ['#3F9065', '#C9AB81', '#FF9924', '#7E7A6B'];

      let chartPieData = [];
      let chartLabels = [];

      if (analyticsData.pie_data && analyticsData.pie_data.length > 0) {
        const mappedLabels = analyticsData.pie_data.map(item => item.category);
        const mappedData = analyticsData.pie_data.map(item => typeof item === 'object' ? item.revenue : item);
        
        // Only use real backend data if there is at least one non-zero revenue value
        const hasRealData = mappedData.some(val => val > 0);
        if (hasRealData) {
          chartLabels = mappedLabels;
          chartPieData = mappedData;
        }
      }

      categoryChartInstanceRef.current = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: chartLabels,
          datasets: [
            {
              data: chartPieData,
              backgroundColor: colors,
              hoverOffset: 6,
              borderWidth: 3,
              borderColor: '#FAF8F2'
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                color: '#1b3d2b',
                font: { weight: '600', size: 12 },
                boxWidth: 14
              }
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const label = context.label || '';
                  const value = context.raw || 0;
                  const total = context.dataset.data.reduce((a, b) => a + b, 0);
                  const pct = ((value / total) * 100).toFixed(1);
                  return ` ${label}: ${value.toLocaleString()} (${pct}%)`;
                }
              }
            }
          },
          cutout: '65%'
        }
      });
    }

    return () => {
      if (categoryChartInstanceRef.current) {
        categoryChartInstanceRef.current.destroy();
        categoryChartInstanceRef.current = null;
      }
    };
  }, [analyticsData, loading, activeTab]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await apiClient.put(`/orders/${orderId}`, { status: newStatus });
      setSuccessMsg(`Order #${orderId} status changed to ${newStatus}`);
      fetchStats();
      if (selectedOrder && selectedOrder.raw_id === orderId) {
        setSelectedOrder(prev => ({ ...prev, status: newStatus }));
      }
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to update order status.");
      setTimeout(() => setErrorMsg(''), 4000);
    }
  };

  const getFreshness = (dateStr) => {
    if (!dateStr) return { hours: 0, text: 'Unknown', color: 'gray' };
    const prodDate = new Date(dateStr);
    const expiryDate = new Date(prodDate.getTime() + 72 * 60 * 60 * 1000); 
    const now = new Date();
    const diffMs = expiryDate.getTime() - now.getTime();
    const diffHours = Math.round(diffMs / (1000 * 60 * 60));

    if (diffHours <= 0) {
      return { hours: 0, text: 'Expired', color: '#e63946' }; 
    } else if (diffHours <= 24) {
      return { hours: diffHours, text: `${diffHours}h left (Near Expiry)`, color: '#f5a623' }; 
    } else {
      return { hours: diffHours, text: `${diffHours}h left (Fresh)`, color: '#2d6a4f' }; 
    }
  };

  const formatActivityTime = (timestampStr) => {
    if (!timestampStr) return "Just now";
    const date = new Date(timestampStr);
    const diffMs = new Date().getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    if (diffSecs < 60) return "Just now";
    const diffMins = Math.floor(diffSecs / 60);
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="admin-wrapper">
      <AdminSidebar />
      
      <div className="admin-container">
        <AdminNavbar />
  
        <div className="admin-content">
          <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="page-title-area">
              <h2>Ammulu's ERP Control Panel</h2>
              <p>Operational summary, supply-chain monitoring, and predictive analytics.</p>
            </div>
          </div>

          {/* Smart Inventory Alerts Bar */}
          {stats.inventory_alerts && stats.inventory_alerts.length > 0 && (
            <div className="smart-alerts-banner" style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#fffbeb',
              borderLeft: '5px solid #FF9924',
              padding: '15px 25px',
              borderRadius: '12px',
              marginBottom: '25px',
              boxShadow: '0 4px 12px rgba(255, 153, 36, 0.08)',
              gap: '15px'
            }}>
              <div style={{ color: '#FF9924', display: 'flex', alignItems: 'center' }}>
                <AlertTriangle size={24} />
              </div>
              <div style={{ flexGrow: 1 }}>
                <h4 style={{ margin: 0, color: '#b55a00', fontSize: '15px', fontWeight: '700' }}>Critical Material Shortage Alerts</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', marginTop: '5px' }}>
                  {stats.inventory_alerts.map((alert, idx) => (
                    <span key={idx} style={{ fontSize: '13px', color: '#7a3e02' }}>
                      ⚡ <strong>{alert.item}</strong>: {alert.reason}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

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

          {/* Tab Selection */}
          {!isStaff && (
            <div className="module-tabs">
              <button 
                onClick={() => setActiveTab('overview')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '10px 20px',
                  fontSize: '14px',
                  fontWeight: '700',
                  border: 'none',
                  background: 'none',
                  borderBottom: activeTab === 'overview' ? '3px solid var(--primary-color)' : '3px solid transparent',
                  color: activeTab === 'overview' ? 'var(--primary-color)' : '#7E7A6B',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontFamily: "'Outfit', sans-serif"
                }}
              >
                <TrendingUp size={16} style={{ marginRight: '6px' }} />
                ERP Operations Overview
              </button>
              <button 
                onClick={() => setActiveTab('live_monitor')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '10px 20px',
                  fontSize: '14px',
                  fontWeight: '700',
                  border: 'none',
                  background: 'none',
                  borderBottom: activeTab === 'live_monitor' ? '3px solid var(--primary-color)' : '3px solid transparent',
                  color: activeTab === 'live_monitor' ? 'var(--primary-color)' : '#7E7A6B',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontFamily: "'Outfit', sans-serif"
                }}
              >
                <Activity size={16} style={{ marginRight: '6px', color: '#E74C3C' }} />
                Live Website Traffic Monitor
              </button>
            </div>
          )}

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ height: '100px', backgroundColor: '#e2ebd9', borderRadius: '15px', animation: 'pulse 1.5s infinite' }} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={{ height: '300px', backgroundColor: '#e2ebd9', borderRadius: '15px', animation: 'pulse 1.5s infinite' }} />
                <div style={{ height: '300px', backgroundColor: '#e2ebd9', borderRadius: '15px', animation: 'pulse 1.5s infinite' }} />
              </div>
            </div>
          ) : activeTab === 'overview' ? (
            <>
              {/* Premium 5 KPI Cards Grid (Phase 5) */}
              <div className="dashboard-kpi-grid">
                
                {!isStaff && (
                  <div className="stats-card">
                    <div className="stats-card-top">
                      <div className="stats-card-icon yellow" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ShoppingBag size={20} />
                      </div>
                      <span className="stats-card-trend up">Today</span>
                    </div>
                    <div className="stats-card-value">{stats.today_orders}</div>
                    <div className="stats-card-label">Today's Orders</div>
                  </div>
                )}

                {!isStaff && (
                  <div className="stats-card">
                    <div className="stats-card-top">
                      <div className="stats-card-icon teal" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <IndianRupee size={20} />
                      </div>
                      <span className="stats-card-trend up">Today</span>
                    </div>
                    <div className="stats-card-value">{(stats.today_revenue || 0).toLocaleString()}</div>
                    <div className="stats-card-label">Today's Revenue</div>
                  </div>
                )}

                {!isStaff && (
                  <div className="stats-card">
                    <div className="stats-card-top">
                      <div className="stats-card-icon red" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <TrendingUp size={20} />
                      </div>
                      <span className="stats-card-trend up">#1</span>
                    </div>
                    <div className="stats-card-value" style={{ fontSize: '20px' }}>
                      {stats.best_selling_products?.length > 0 ? stats.best_selling_products[0].name : 'N/A'}
                    </div>
                    <div className="stats-card-label">Top Selling Product</div>
                  </div>
                )}

                {!isStaff && (
                  <div className="stats-card">
                    <div className="stats-card-top">
                      <div className="stats-card-icon blue" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Layers size={20} />
                      </div>
                      <span className="stats-card-trend up">Popular</span>
                    </div>
                    <div className="stats-card-value" style={{ fontSize: '20px' }}>{stats.most_ordered_category || 'N/A'}</div>
                    <div className="stats-card-label">Most Ordered Category</div>
                  </div>
                )}

                {!isStaff && (
                  <div className="stats-card">
                    <div className="stats-card-top">
                      <div className="stats-card-icon orange" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Users size={20} />
                      </div>
                      <span className="stats-card-trend up">Total</span>
                    </div>
                    <div className="stats-card-value">{stats.active_customers}</div>
                    <div className="stats-card-label">Active Customers</div>
                  </div>
                )}

                {/* Keep some useful cards for staff */}
                {isStaff && (
                  <>
                    <div className="stats-card">
                      <div className="stats-card-top">
                        <div className="stats-card-icon yellow" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <ShoppingBag size={20} />
                        </div>
                        <span className="stats-card-trend up">Today</span>
                      </div>
                      <div className="stats-card-value">{stats.today_orders}</div>
                      <div className="stats-card-label">Orders Today</div>
                    </div>
                    <div className="stats-card">
                      <div className="stats-card-top">
                        <div className="stats-card-icon blue" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Clock size={20} />
                        </div>
                        <span className="stats-card-trend warning">Active</span>
                      </div>
                      <div className="stats-card-value">{stats.pending_orders}</div>
                      <div className="stats-card-label">Pending Orders</div>
                    </div>
                    <div className="stats-card">
                      <div className="stats-card-top">
                        <div className="stats-card-icon red" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <ChefHat size={20} />
                        </div>
                        <span className="stats-card-trend up">Items</span>
                      </div>
                      <div className="stats-card-value">{stats.total_products}</div>
                      <div className="stats-card-label">Total Products</div>
                    </div>
                  </>
                )}

              </div>

              {/* Live Order Tracking Pipeline */}
              <div className="premium-card" style={{ padding: '20px 25px', marginBottom: '25px' }}>
                <div className="premium-card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' }}>
                  <MapPin size={18} style={{ color: 'var(--theme-color)' }} />
                  <h3 style={{ margin: 0, fontSize: '16px' }}>Live Order Tracking Pipeline</h3>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 150px), 1fr))', gap: '15px', position: 'relative' }}>
                  <div style={{ backgroundColor: '#FAF8F2', border: '1px solid #EAE6DB', borderRadius: '12px', padding: '12px 15px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', color: '#3f9065', marginBottom: '5px' }}>
                      <FileText size={20} />
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--title-color)' }}>{stats.stage_preparing}</div>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: '#666' }}>Preparing (New)</div>
                  </div>

                  <div style={{ backgroundColor: '#FAF8F2', border: '1px solid #EAE6DB', borderRadius: '12px', padding: '12px 15px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', color: '#C9AB81', marginBottom: '5px' }}>
                      <Flame size={20} />
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--title-color)' }}>{stats.stage_cooking}</div>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: '#666' }}>Cooking (Kitchen)</div>
                  </div>

                  <div style={{ backgroundColor: '#FAF8F2', border: '1px solid #EAE6DB', borderRadius: '12px', padding: '12px 15px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', color: '#FF9924', marginBottom: '5px' }}>
                      <Package size={20} />
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--title-color)' }}>{stats.stage_packed}</div>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: '#666' }}>Packed & Ready</div>
                  </div>

                  <div style={{ backgroundColor: '#FAF8F2', border: '1px solid #EAE6DB', borderRadius: '12px', padding: '12px 15px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', color: '#2b5c8f', marginBottom: '5px' }}>
                      <Truck size={20} />
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--title-color)' }}>{stats.stage_delivery}</div>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: '#666' }}>Out For Delivery</div>
                  </div>

                  <div style={{ backgroundColor: '#FAF8F2', border: '1px solid #EAE6DB', borderRadius: '12px', padding: '12px 15px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', color: '#2d6a4f', marginBottom: '5px' }}>
                      <CheckCircle size={20} />
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--title-color)' }}>{stats.stage_delivered}</div>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: '#666' }}>Delivered Today</div>
                  </div>
                </div>
              </div>

              {/* Batter Production & Inventory Insights */}
              {stats.batter_stats && (
                <div className="premium-card" style={{ padding: '20px 25px', marginBottom: '25px' }}>
                  <div className="premium-card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' }}>
                    <Factory size={18} style={{ color: 'var(--theme-color)' }} />
                    <h3 style={{ margin: 0, fontSize: '16px' }}>Batter Production & Inventory Insights</h3>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 150px), 1fr))', gap: '15px' }}>
                    <div style={{ backgroundColor: '#FAF8F2', border: '1px solid #EAE6DB', borderRadius: '12px', padding: '12px 15px', textAlign: 'center' }}>
                      <span style={{ fontSize: '12px', fontWeight: '600', color: '#666', display: 'block', marginBottom: '5px' }}>Produced Today</span>
                      <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--title-color)' }}>
                        {stats.batter_stats.produced} kg
                      </div>
                    </div>

                    <div style={{ backgroundColor: '#FAF8F2', border: '1px solid #EAE6DB', borderRadius: '12px', padding: '12px 15px', textAlign: 'center' }}>
                      <span style={{ fontSize: '12px', fontWeight: '600', color: '#666', display: 'block', marginBottom: '5px' }}>Sold Today</span>
                      <div style={{ fontSize: '18px', fontWeight: '800', color: '#3f9065' }}>
                        {stats.batter_stats.sold} kg
                      </div>
                    </div>

                    <div style={{ backgroundColor: '#FAF8F2', border: '1px solid #EAE6DB', borderRadius: '12px', padding: '12px 15px', textAlign: 'center' }}>
                      <span style={{ fontSize: '12px', fontWeight: '600', color: '#666', display: 'block', marginBottom: '5px' }}>Remaining Batch</span>
                      <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--theme-color)' }}>
                        {stats.batter_stats.remaining} kg
                      </div>
                    </div>

                    <div style={{ backgroundColor: '#FAF8F2', border: '1px solid #EAE6DB', borderRadius: '12px', padding: '12px 15px', textAlign: 'center' }}>
                      <span style={{ fontSize: '12px', fontWeight: '600', color: '#666', display: 'block', marginBottom: '5px' }}>Available in Catalog</span>
                      <div style={{ fontSize: '18px', fontWeight: '800', color: '#2d6a4f' }}>
                        {stats.batter_stats.available} Items
                      </div>
                    </div>

                    <div style={{ backgroundColor: '#FAF8F2', border: '1px solid #EAE6DB', borderRadius: '12px', padding: '12px 15px', textAlign: 'center' }}>
                      <span style={{ fontSize: '12px', fontWeight: '600', color: '#666', display: 'block', marginBottom: '5px' }}>Out of Stock</span>
                      <div style={{ fontSize: '18px', fontWeight: '800', color: '#e63946' }}>
                        {stats.batter_stats.out_of_stock} Items
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Analytical Charts and Category Split Grid - Admin/Manager Only */}
              {!isStaff && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 400px), 1fr))', gap: '20px', marginBottom: '25px' }}>
                  <div className="premium-card" style={{ padding: '20px 25px', margin: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                      <div className="premium-card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <TrendingUp size={16} />
                        <h3 style={{ margin: 0, fontSize: '16px' }}>Business Trends & Revenue Forecasts</h3>
                      </div>
                      <div style={{ display: 'flex', gap: '5px' }}>
                        {['today', 'week', 'month', 'year'].map(p => (
                          <button
                            key={p}
                            onClick={() => setAnalyticsPeriod(p)}
                            style={{
                              padding: '4px 10px',
                              fontSize: '11px',
                              fontWeight: '700',
                              borderRadius: '15px',
                              border: '1px solid #EAE6DB',
                              textTransform: 'uppercase',
                              cursor: 'pointer',
                              backgroundColor: analyticsPeriod === p ? 'var(--primary-color)' : '#fff',
                              color: analyticsPeriod === p ? '#fff' : '#666',
                              transition: 'all 0.2s'
                            }}
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div style={{ height: '260px', position: 'relative' }}>
                      <canvas ref={trendCanvasRef} id="trendChart"></canvas>
                    </div>
                  </div>

                  <div className="premium-card" style={{ padding: '20px 25px', margin: 0 }}>
                    <div className="premium-card-title" style={{ marginBottom: '15px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                      <i className="fa-solid fa-chart-pie"></i>
                      <h3 style={{ margin: 0, fontSize: '16px' }}>Sales Category Breakdown</h3>
                    </div>
                    <div style={{ height: '260px', position: 'relative' }}>
                      <canvas ref={categoryCanvasRef} id="categoryChart"></canvas>
                    </div>
                  </div>
                </div>
              )}



              {/* Recent Orders Table */}
              <div className="premium-card" style={{ margin: '0 0 30px 0' }}>
                <div className="premium-card-header">
                  <div className="premium-card-title">
                    <i className="fa-solid fa-receipt"></i>
                    <h3>{isStaff && userRole === 'delivery_staff' ? "My Assigned Orders Queue" : "Recent Customer Orders"}</h3>
                  </div>
                </div>
                <div className="responsive-table-wrapper" style={{ border: 'none', boxShadow: 'none' }}>
                  <table className="responsive-table">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Customer Name</th>
                        <th>Product Name</th>
                        <th>Category</th>
                        <th>Quantity</th>
                        <th>Amount</th>
                        <th>Payment Status</th>
                        <th>Order Status</th>
                        <th>Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recent_orders && stats.recent_orders.length > 0 ? (
                        stats.recent_orders.map((o) => (
                          <tr key={o.id}>
                            <td data-label="Order ID"><strong>{o.id}</strong></td>
                            <td data-label="Customer Name">
                              <strong>{o.customer}</strong>
                              <div className="text-muted" style={{ fontSize: '11px' }}>{o.phone}</div>
                            </td>
                            <td data-label="Product Name">
                              <div style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={o.products}>
                                {o.products}
                              </div>
                            </td>
                            <td data-label="Category">
                              <span style={{ fontSize: '12px', fontWeight: '500' }}>
                                {o.categories}
                              </span>
                            </td>
                            <td data-label="Quantity">{o.quantities}</td>
                            <td data-label="Amount" style={{ fontWeight: '700', color: 'var(--primary-color)' }}>{o.amount.toFixed(2)}</td>
                            <td data-label="Payment Status">
                              <span className={`badge-status ${o.payment_status?.toLowerCase() === 'paid' ? 'completed' : 'pending'}`}>
                                {o.payment_status}
                              </span>
                            </td>
                            <td data-label="Order Status">
                              {isStaff ? (
                                <span style={{
                                  padding: '4px 10px',
                                  borderRadius: '12px',
                                  fontSize: '11px',
                                  fontWeight: '700',
                                  backgroundColor: '#EBF5FB',
                                  color: '#1B4F72'
                                }}>
                                  {o.status}
                                </span>
                              ) : (
                                <select 
                                  value={o.status} 
                                  onChange={(e) => handleStatusChange(o.raw_id, e.target.value)}
                                  style={{ padding: '6px', fontSize: '12px', border: '1px solid #EAE6DB', borderRadius: '8px', backgroundColor: '#fff', fontWeight: '600' }}
                                >
                                  <option value="Pending">Pending</option>
                                  <option value="Confirmed">Confirmed</option>
                                  <option value="Preparing">Preparing</option>
                                  <option value="Out For Delivery">Out For Delivery</option>
                                  <option value="Delivered">Delivered</option>
                                  <option value="Cancelled">Cancelled</option>
                                </select>
                              )}
                            </td>
                            <td data-label="Date" className="text-muted" style={{ fontSize: '12px' }}>
                              {o.date ? new Date(o.date).toLocaleDateString() : 'N/A'}
                            </td>
                            <td data-label="Actions">
                              <button 
                                onClick={() => setSelectedOrder(o)} 
                                className="btn-secondary" 
                                style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '20px' }}
                              >
                                View Details
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="10" className="text-center text-muted" style={{ padding: '40px' }}>
                            No assigned or recent orders found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            /* Live Traffic Monitor Section */
            <div className="live-monitor-dashboard">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '20px', marginBottom: '25px' }}>
                
                <div className="stats-card" style={{ borderLeft: '4px solid #3F9065' }}>
                  <div className="stats-card-top">
                    <div className="stats-card-icon teal" style={{ backgroundColor: 'rgba(63, 144, 101, 0.1)', color: '#3F9065' }}>
                      <i className="fa-solid fa-users-line"></i>
                    </div>
                    <span className="stats-card-trend warning" style={{ backgroundColor: '#FDEDEC', color: '#E74C3C', animation: 'pulse 1.5s infinite' }}>â— LIVE</span>
                  </div>
                  <div className="stats-card-value">{liveMonitor.unique_visitors}</div>
                  <div className="stats-card-label">Active Visitors Online (Last 5m)</div>
                </div>

                <div className="stats-card" style={{ borderLeft: '4px solid #C9AB81' }}>
                  <div className="stats-card-top">
                    <div className="stats-card-icon orange" style={{ backgroundColor: 'rgba(201, 171, 129, 0.1)', color: '#C9AB81' }}>
                      <i className="fa-solid fa-eye"></i>
                    </div>
                    <span className="stats-card-trend up">Views</span>
                  </div>
                  <div className="stats-card-value">{liveMonitor.total_views}</div>
                  <div className="stats-card-label">Total Storefront Page Views</div>
                </div>

                <div className="stats-card" style={{ borderLeft: '4px solid #FF9924' }}>
                  <div className="stats-card-top">
                    <div className="stats-card-icon yellow" style={{ backgroundColor: 'rgba(255, 153, 36, 0.1)', color: '#FF9924' }}>
                      <i className="fa-solid fa-pizza-slice"></i>
                    </div>
                    <span className="stats-card-trend up">Dishes</span>
                  </div>
                  <div className="stats-card-value">{liveMonitor.product_views}</div>
                  <div className="stats-card-label">Storefront Product Clicks</div>
                </div>

                <div className="stats-card" style={{ borderLeft: '4px solid #3498DB' }}>
                  <div className="stats-card-top">
                    <div className="stats-card-icon blue" style={{ backgroundColor: 'rgba(52, 152, 219, 0.1)', color: '#3498DB' }}>
                      <i className="fa-solid fa-cart-plus"></i>
                    </div>
                    <span className="stats-card-trend up">Carts</span>
                  </div>
                  <div className="stats-card-value">{liveMonitor.cart_activity}</div>
                  <div className="stats-card-label">Add/Remove Cart Operations</div>
                </div>

              </div>

              {/* Live Catalog Performance Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '20px', marginBottom: '25px' }}>
                <div className="premium-card" style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#FAF8F2', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#FF9924', fontSize: '18px' }}>
                      <i className="fa-solid fa-fire"></i>
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '700' }}>Most Viewed Dish (Popularity)</h4>
                      <span className="text-muted" style={{ fontSize: '11px' }}>Based on page details clicks</span>
                    </div>
                  </div>
                  {liveMonitor.most_viewed_product ? (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 15px', border: '1px solid #EAE6DB', borderRadius: '8px' }}>
                      <div>
                        <strong>{liveMonitor.most_viewed_product.name}</strong>
                        <span className="text-muted" style={{ display: 'block', fontSize: '11px', textTransform: 'capitalize' }}>
                          Category: {liveMonitor.most_viewed_product.category?.replace('_', ' ')}
                        </span>
                      </div>
                      <span style={{ fontSize: '14px', fontWeight: '800', color: 'var(--primary-color)' }}>
                        {liveMonitor.most_viewed_product.views} views
                      </span>
                    </div>
                  ) : (
                    <p className="text-muted" style={{ fontSize: '12px' }}>No visitor interaction recorded yet.</p>
                  )}
                </div>

                <div className="premium-card" style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#FAF8F2', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#3F9065', fontSize: '18px' }}>
                      <i className="fa-solid fa-trophy"></i>
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '700' }}>Most Sold Dish (Revenue Driver)</h4>
                      <span className="text-muted" style={{ fontSize: '11px' }}>Based on checkout totals</span>
                    </div>
                  </div>
                  {liveMonitor.most_sold_product ? (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 15px', border: '1px solid #EAE6DB', borderRadius: '8px' }}>
                      <div>
                        <strong>{liveMonitor.most_sold_product.name}</strong>
                        <span className="text-muted" style={{ display: 'block', fontSize: '11px', textTransform: 'capitalize' }}>
                          Category: {liveMonitor.most_sold_product.category?.replace('_', ' ')}
                        </span>
                      </div>
                      <span style={{ fontSize: '14px', fontWeight: '800', color: 'var(--primary-color)' }}>
                        {liveMonitor.most_sold_product.sales} orders
                      </span>
                    </div>
                  ) : (
                    <p className="text-muted" style={{ fontSize: '12px' }}>No client orders placed yet.</p>
                  )}
                </div>
              </div>

              {/* Real-time Traffic Logs Feed */}
              <div className="premium-card" style={{ padding: '25px', marginBottom: '30px' }}>
                <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '15px', marginBottom: '20px' }}>
                  <h3 style={{ margin: 0, fontSize: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <i className="fa-solid fa-tower-broadcast" style={{ color: '#E74C3C' }}></i>
                    Real-time Traffic Activity Logs
                  </h3>
                  <p className="text-muted" style={{ margin: '5px 0 0 0', fontSize: '12px' }}>
                    Logs activity clicks, cart changes, and customer registrations from storefront
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '450px', overflowY: 'auto' }}>
                  {liveMonitor.activity_logs && liveMonitor.activity_logs.length > 0 ? (
                    liveMonitor.activity_logs.map((log) => {
                      let typeLabel = "Info";
                      let bgBadge = "#EBF5FB";
                      let colorBadge = "#1B4F72";
                      let iconLog = "fa-info-circle";

                      if (log.activity_type === 'page_view') {
                        typeLabel = "VIEW";
                        bgBadge = "#FAF8F2";
                        colorBadge = "#7E7A6B";
                        iconLog = "fa-globe";
                      } else if (log.activity_type === 'product_view') {
                        typeLabel = "PRODUCT";
                        bgBadge = "#FEF9E7";
                        colorBadge = "#7D6608";
                        iconLog = "fa-pizza-slice";
                      } else if (log.activity_type === 'add_to_cart') {
                        typeLabel = "+ CART";
                        bgBadge = "#EBF5FB";
                        colorBadge = "#1B4F72";
                        iconLog = "fa-cart-plus";
                      } else if (log.activity_type === 'remove_from_cart') {
                        typeLabel = "- CART";
                        bgBadge = "#FDEDEC";
                        colorBadge = "#78281F";
                        iconLog = "fa-cart-shopping";
                      } else if (log.activity_type === 'order_placed') {
                        typeLabel = "CHECKOUT";
                        bgBadge = "#E8F8F5";
                        colorBadge = "#0E6251";
                        iconLog = "fa-credit-card";
                      } else if (log.activity_type === 'customer_registered') {
                        typeLabel = "REGISTRATION";
                        bgBadge = "#FCF3CF";
                        colorBadge = "#7D6608";
                        iconLog = "fa-user-check";
                      }

                      return (
                        <div key={log.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 18px', border: '1px solid #EAE6DB', borderRadius: '10px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <span style={{
                              padding: '4px 10px',
                              borderRadius: '8px',
                              fontSize: '10px',
                              fontWeight: '800',
                              backgroundColor: bgBadge,
                              color: colorBadge,
                              minWidth: '80px',
                              textAlign: 'center'
                            }}>
                              {typeLabel}
                            </span>
                            <div style={{ fontSize: '13px' }}>
                              <i className={`fa-solid ${iconLog}`} style={{ marginRight: '6px', color: colorBadge }}></i>
                              <strong>{log.message}</strong>
                              <div className="text-muted" style={{ fontSize: '10px', marginTop: '2px' }}>
                                IP: {log.ip_address}
                              </div>
                            </div>
                          </div>
                          <span style={{ fontSize: '11px', color: '#7E7A6B' }}>
                            {formatActivityTime(log.timestamp)}
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#7E7A6B' }}>
                      No live storefront activity recorded in this session.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Detailed Order Modal */}
        {selectedOrder && (
          <div className="admin-modal show">
            <div className="admin-modal-content">
              <div className="admin-modal-header" style={{ backgroundColor: 'var(--theme-color)' }}>
                <h3>Order {selectedOrder.id} Details</h3>
                <button className="admin-modal-close" onClick={() => setSelectedOrder(null)}>&times;</button>
              </div>
              <div className="admin-modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                  <div>
                    <strong>Customer Info:</strong>
                    <div style={{ fontSize: '13px', marginTop: '5px', fontWeight: '700' }}>{selectedOrder.customer}</div>
                    <div style={{ fontSize: '13px', color: '#666' }}>{selectedOrder.phone}</div>
                  </div>
                  <div>
                    <strong>Delivery Address:</strong>
                    <div style={{ fontSize: '13px', marginTop: '5px', lineHeight: '1.4' }}>{selectedOrder.delivery_address}</div>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '15px', marginBottom: '15px' }}>
                  <strong>Ordered Items:</strong>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', marginTop: '10px', fontSize: '13px', minWidth: '400px' }}>
                      <thead>
                      <tr style={{ background: 'var(--smoke-color3)' }}>
                        <th style={{ padding: '8px', textAlign: 'left' }}>Product</th>
                        <th style={{ padding: '8px', textAlign: 'left' }}>Category</th>
                        <th style={{ padding: '8px', textAlign: 'center' }}>Qty</th>
                        <th style={{ padding: '8px', textAlign: 'right' }}>Price</th>
                        <th style={{ padding: '8px', textAlign: 'right' }}>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items?.map((it, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <td style={{ padding: '8px' }}>{it.product_name}</td>
                          <td style={{ padding: '8px' }}>{it.category}</td>
                          <td style={{ padding: '8px', textAlign: 'center' }}>{it.quantity}</td>
                          <td style={{ padding: '8px', textAlign: 'right' }}>{it.price.toFixed(2)}</td>
                          <td style={{ padding: '8px', textAlign: 'right' }}>{(it.price * it.quantity).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
                    <div style={{ fontSize: '13px' }}>
                      Payment Status: <span className={`badge-status ${selectedOrder.payment_status?.toLowerCase() === 'paid' ? 'completed' : 'pending'}`}>{selectedOrder.payment_status}</span>
                    </div>
                    <div style={{ fontSize: '16px', fontWeight: '800', color: 'var(--theme-color)' }}>
                      Total Amount: {selectedOrder.amount.toFixed(2)}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#EDF3F0', padding: '12px 15px', borderRadius: '8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: '700' }}>Modify Delivery State:</span>
                  {isStaff ? (
                    <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--primary-color)' }}>{selectedOrder.status}</span>
                  ) : (
                    <select 
                      value={selectedOrder.status} 
                      onChange={(e) => handleStatusChange(selectedOrder.raw_id, e.target.value)}
                      style={{ padding: '6px 12px', fontSize: '13px', border: '1px solid #EAE6DB', borderRadius: '4px', backgroundColor: '#fff' }}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Preparing">Preparing</option>
                      <option value="Out For Delivery">Out For Delivery</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  )}
                </div>
              </div>
              <div className="admin-modal-footer">
                <button className="btn-secondary" onClick={() => setSelectedOrder(null)}>Close</button>
              </div>
            </div>
          </div>
        )}

        <div className="admin-footer">
          <div>&copy; 2026 <strong>Ammulu's Kitchen Admin</strong>. All Rights Reserved.</div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
