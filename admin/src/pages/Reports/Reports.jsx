import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import AdminNavbar from '../../components/AdminNavbar';
import apiClient from '../../services/api';
import '../../assets/styles/admin-style.css';
import '../../assets/styles/tables.css';
import { 
  AlertTriangle, 
  FileSpreadsheet, 
  Sheet, 
  FilePen, 
  List,
  Plus, 
  IndianRupee, 
  TrendingDown, 
  TrendingUp, 
  CreditCard, 
  Receipt, 
  Users, 
  CheckCircle, 
  X, 
  Save 
} from 'lucide-react';

const Reports = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const activeTabParam = searchParams.get('tab') || 'revenue';

  const [activeTab, setActiveTab] = useState('revenue');

  // Tab 1: Analytics Report states
  const [reportType, setReportType] = useState('revenue');
  const [reportData, setReportData] = useState({ type: 'revenue', summary: {}, data: [] });
  const [reportsLoading, setReportsLoading] = useState(true);

  // Tab 2: Finance & Overheads states
  const [financeLoading, setFinanceLoading] = useState(true);
  const [financeStats, setFinanceStats] = useState(null);
  const [overheads, setOverheads] = useState([
    { id: 1, category: 'Ingredients & Raw Materials', amount: 48500.00, frequency: 'Monthly', status: 'Paid' },
    { id: 2, category: 'Shop Rent & Lease', amount: 25000.00, frequency: 'Monthly', status: 'Paid' },
    { id: 3, category: 'Utilities (Electricity & Water)', amount: 8420.00, frequency: 'Monthly', status: 'Paid' },
    { id: 4, category: 'Logistics & Fuel Allowances', amount: 12500.00, frequency: 'Monthly', status: 'Pending' },
    { id: 5, category: 'Marketing & Digital Ads', amount: 5000.00, frequency: 'Monthly', status: 'Paid' },
  ]);
  const [salaries, setSalaries] = useState([
    { id: 1, name: 'Suresh Kumar', role: 'Manager', baseSalary: 35000.00, status: 'Disbursed', date: '2026-06-01' },
    { id: 2, name: 'Muthu Swamy', role: 'Kitchen Chef', baseSalary: 28000.00, status: 'Disbursed', date: '2026-06-01' },
    { id: 3, name: 'Karthik S.', role: 'Delivery Agent', baseSalary: 18000.00, status: 'Disbursed', date: '2026-06-01' },
  ]);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [newExpense, setNewExpense] = useState({ category: '', amount: '', frequency: 'Monthly', status: 'Paid' });

  // Common notifications
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Handle active tab switches
  useEffect(() => {
    setActiveTab(activeTabParam);
    if (activeTabParam === 'revenue') {
      setReportType('revenue');
    } else if (activeTabParam === 'sales') {
      if (!['daily', 'weekly', 'monthly', 'yearly'].includes(reportType)) {
        setReportType('daily');
      }
    } else if (activeTabParam === 'customer') {
      setReportType('customer');
    } else if (activeTabParam === 'inventory') {
      setReportType('product');
    } else if (activeTabParam === 'export') {
      if (!['revenue', 'daily', 'weekly', 'monthly', 'yearly', 'customer', 'product'].includes(reportType)) {
        setReportType('revenue');
      }
    }
  }, [activeTabParam]);

  // Fetch Tab 1 (Reports Engine) data
  const fetchReportData = async () => {
    setReportsLoading(true);
    setErrorMsg('');
    try {
      const response = await apiClient.get(`/admin/reports?type=${reportType}`);
      setReportData(response.data);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to generate analytics report statement.");
    } finally {
      setReportsLoading(false);
    }
  };

  useEffect(() => {
    if (['revenue', 'sales', 'customer', 'inventory', 'export'].includes(activeTab)) {
      fetchReportData();
    }
  }, [reportType, activeTab]);

  // Fetch Tab 2 (Finance) data
  const fetchFinanceData = async () => {
    setFinanceLoading(true);
    try {
      const res = await apiClient.get('/admin/dashboard-stats');
      setFinanceStats(res.data);
    } catch (err) {
      console.error(err);
      setErrorMsg("Error loading gross revenues stats.");
    } finally {
      setFinanceLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'export') {
      fetchFinanceData();
    }
  }, [activeTab]);

  // Export CSV
  const handleExportCSV = (format = 'csv') => {
    if (!reportData.data || reportData.data.length === 0) return;
    
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += `Hotel Amma's Kitchen - ${reportType.toUpperCase()} REPORT\n`;
    csvContent += `Generated Date: ${new Date().toLocaleDateString()}\n\n`;
    
    csvContent += `SUMMARY METRICS\n`;
    Object.entries(reportData.summary).forEach(([key, val]) => {
      csvContent += `${key.replace(/_/g, ' ').toUpperCase()},${val}\n`;
    });
    csvContent += `\n`;
    
    const headers = Object.keys(reportData.data[0]);
    csvContent += headers.map(h => h.replace(/_/g, ' ').toUpperCase()).join(',') + "\n";
    
    reportData.data.forEach(row => {
      const line = headers.map(header => {
        let val = row[header];
        if (typeof val === 'string' && val.includes(',')) {
          return `"${val}"`;
        }
        return val;
      }).join(',');
      csvContent += line + "\n";
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `amma_kitchen_${reportType}_report_${new Date().toISOString().slice(0,10)}.${format === 'excel' ? 'csv' : 'csv'}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Generate printable PDF
  const handleExportPDF = () => {
    if (!reportData.data || reportData.data.length === 0) return;
    
    const printWindow = window.open('', '_blank');
    
    let summaryHtml = '<div class="metric-grid">';
    Object.entries(reportData.summary).forEach(([key, val]) => {
      const displayKey = key.replace(/_/g, ' ').toUpperCase();
      const displayVal = typeof val === 'number' ? `₹${val.toLocaleString()}` : val;
      summaryHtml += `
        <div class="metric-card">
          <div>${displayKey}</div>
          <div class="metric-val">${displayVal}</div>
        </div>
      `;
    });
    summaryHtml += '</div>';
    
    const headers = Object.keys(reportData.data[0]);
    const ths = headers.map(h => `<th>${h.replace(/_/g, ' ').toUpperCase()}</th>`).join('');
    
    const trs = reportData.data.map(row => {
      const tds = headers.map(header => {
        let val = row[header];
        if (typeof val === 'number' && (header.includes('amount') || header.includes('spent') || header.includes('revenue') || header.includes('tax') || header.includes('price') || header.includes('total_revenue') || header.includes('total_spent'))) {
          return `<td>₹${val.toLocaleString()}</td>`;
        }
        return `<td>${val}</td>`;
      }).join('');
      return `<tr>${tds}</tr>`;
    }).join('');
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Amma's Kitchen - Reports Statement</title>
          <style>
            body { font-family: 'Inter', sans-serif; padding: 40px; color: #1b3d2b; line-height: 1.5; }
            .header { text-align: center; border-bottom: 3px double #3F9065; padding-bottom: 20px; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: 700; color: #3F9065; }
            .metric-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 20px; margin-bottom: 40px; }
            .metric-card { border: 1px solid #d8ebdE; padding: 15px; border-radius: 8px; text-align: center; background-color: #FAF8F2; }
            .metric-val { font-size: 20px; font-weight: bold; color: #3F9065; margin-top: 5px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            table th, table td { border: 1px solid #d8ebdE; padding: 10px; text-align: left; font-size: 13px; }
            table th { background-color: #EDF3F0; font-weight: 700; }
            .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #888; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">HOTEL AMMA'S KITCHEN</div>
            <div>Business Intelligence Reporting Engine</div>
            <div style="font-weight: bold; margin-top: 5px; text-transform: uppercase;">${reportType} Analytics Report</div>
            <div style="font-size: 13px; color: #666; margin-top: 2px;">Generated Date: ${new Date().toLocaleDateString()}</div>
          </div>
          
          ${summaryHtml}
          
          <h3>Data Records Breakdown</h3>
          <table>
            <thead>
              <tr>${ths}</tr>
            </thead>
            <tbody>
              ${trs}
            </tbody>
          </table>
          
          <div class="footer">
            Thank you for choosing Hotel Amma's Kitchen. Dynamic Statement Generation verified.
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Add Overhead cost action
  const handleAddExpense = (e) => {
    e.preventDefault();
    if (!newExpense.category || !newExpense.amount) return;

    const expenseItem = {
      id: overheads.length + 1,
      category: newExpense.category,
      amount: parseFloat(newExpense.amount),
      frequency: newExpense.frequency,
      status: newExpense.status
    };

    setOverheads(prev => [...prev, expenseItem]);
    setIsAddExpenseOpen(false);
    setNewExpense({ category: '', amount: '', frequency: 'Monthly', status: 'Paid' });
    setSuccessMsg("Overhead expense recorded successfully.");
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  // Calculations for Finance tab
  const totalRevenue = financeStats?.total_revenue || 128450.00;
  const totalOverheads = overheads.reduce((sum, item) => sum + item.amount, 0);
  const totalSalaries = salaries.reduce((sum, item) => sum + item.baseSalary, 0);
  const totalExpenses = totalOverheads + totalSalaries;
  const netMargin = totalRevenue - totalExpenses;
  const marginPercentage = totalRevenue > 0 ? ((netMargin / totalRevenue) * 100).toFixed(1) : 0;

  return (
    <div className="admin-wrapper">
      <AdminSidebar />
      <div className="admin-container">
        <AdminNavbar />

        <div className="admin-content">
          <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
            <div className="page-title-area">
              <h2>Reports & Analytics Command</h2>
              <p>
                {activeTab === 'export' ? 'Review operational overheads ledger, staff salary roster, and profit margins.' : 
                 'Generate product catalogs reports, customer metrics, sales summaries, and tax sheets.'}
              </p>
            </div>
            
            {activeTab === 'export' && (
              <button className="page-action-btn" onClick={() => setIsAddExpenseOpen(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <Plus size={16} /> Record Overhead Expense
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

          {/* Tab buttons */}
          <div style={{ display: 'flex', gap: '15px', borderBottom: '2px solid #EAE6DB', marginBottom: '25px', paddingBottom: '0', flexWrap: 'wrap' }}>
            <button 
              onClick={() => navigate('/admin/reports?tab=revenue')}
              style={{
                padding: '10px 20px', fontSize: '14px', fontWeight: '700', border: 'none', background: 'none',
                borderBottom: activeTab === 'revenue' ? '3px solid var(--primary-color)' : '3px solid transparent',
                color: activeTab === 'revenue' ? 'var(--primary-color)' : '#7E7A6B', cursor: 'pointer', fontFamily: "'Outfit', sans-serif"
              }}
            >
              Revenue Reports
            </button>
            <button 
              onClick={() => navigate('/admin/reports?tab=sales')}
              style={{
                padding: '10px 20px', fontSize: '14px', fontWeight: '700', border: 'none', background: 'none',
                borderBottom: activeTab === 'sales' ? '3px solid var(--primary-color)' : '3px solid transparent',
                color: activeTab === 'sales' ? 'var(--primary-color)' : '#7E7A6B', cursor: 'pointer', fontFamily: "'Outfit', sans-serif"
              }}
            >
              Sales Reports
            </button>
            <button 
              onClick={() => navigate('/admin/reports?tab=customer')}
              style={{
                padding: '10px 20px', fontSize: '14px', fontWeight: '700', border: 'none', background: 'none',
                borderBottom: activeTab === 'customer' ? '3px solid var(--primary-color)' : '3px solid transparent',
                color: activeTab === 'customer' ? 'var(--primary-color)' : '#7E7A6B', cursor: 'pointer', fontFamily: "'Outfit', sans-serif"
              }}
            >
              Customer Reports
            </button>
            <button 
              onClick={() => navigate('/admin/reports?tab=inventory')}
              style={{
                padding: '10px 20px', fontSize: '14px', fontWeight: '700', border: 'none', background: 'none',
                borderBottom: activeTab === 'inventory' ? '3px solid var(--primary-color)' : '3px solid transparent',
                color: activeTab === 'inventory' ? 'var(--primary-color)' : '#7E7A6B', cursor: 'pointer', fontFamily: "'Outfit', sans-serif"
              }}
            >
              Inventory Reports
            </button>
            <button 
              onClick={() => navigate('/admin/reports?tab=export')}
              style={{
                padding: '10px 20px', fontSize: '14px', fontWeight: '700', border: 'none', background: 'none',
                borderBottom: activeTab === 'export' ? '3px solid var(--primary-color)' : '3px solid transparent',
                color: activeTab === 'export' ? 'var(--primary-color)' : '#7E7A6B', cursor: 'pointer', fontFamily: "'Outfit', sans-serif"
              }}
            >
              Export Reports
            </button>
          </div>

          {/* Tab Content: Revenue, Sales, Customer, Inventory Reports */}
          {['revenue', 'sales', 'customer', 'inventory'].includes(activeTab) && (
            <>
              {/* Sales Period Switcher (only for Sales tab) */}
              {activeTab === 'sales' && (
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px', justifyContent: 'flex-start' }}>
                  {['daily', 'weekly', 'monthly', 'yearly'].map(type => (
                    <button 
                      key={type}
                      onClick={() => setReportType(type)} 
                      className={`th-btn ${reportType === type ? 'style9' : 'style10'}`} 
                      style={{ border: 'none', cursor: 'pointer', padding: '8px 16px', borderRadius: '20px', textTransform: 'capitalize', fontWeight: '700', fontSize: '12px' }}
                    >
                      {type} Period
                    </button>
                  ))}
                </div>
              )}

              {reportsLoading ? (
                <div style={{ height: '300px', backgroundColor: '#e2ebd9', borderRadius: '15px', animation: 'pulse 1.5s infinite' }} />
              ) : (
                <>
                  {/* Summary Metric cards */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                    {reportData.summary && Object.entries(reportData.summary).map(([key, val]) => (
                      <div className="stats-card" key={key}>
                        <div className="stats-card-value">
                          {typeof val === 'number' ? (key.includes('spent') || key.includes('revenue') || key.includes('tax') || key.includes('price') || key.includes('sales') ? `₹${val.toLocaleString()}` : val) : val}
                        </div>
                        <div className="stats-card-label" style={{ textTransform: 'uppercase', fontSize: '11px', fontWeight: '700' }}>
                          {key.replace(/_/g, ' ')}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Records Table */}
                  <div className="premium-card">
                    <div className="premium-card-header">
                      <div className="premium-card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <List size={18} />
                        <h3 style={{ textTransform: 'uppercase' }}>
                          {activeTab === 'inventory' ? 'Inventory' : activeTab} Report Records ({reportType})
                        </h3>
                      </div>
                    </div>
                    <div className="responsive-table-wrapper" style={{ border: 'none', boxShadow: 'none' }}>
                      <table className="responsive-table">
                        <thead>
                          <tr>
                            {reportData.data && reportData.data.length > 0 && Object.keys(reportData.data[0]).map(h => (
                              <th key={h} style={{ textTransform: 'uppercase' }}>{h.replace(/_/g, ' ')}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {reportData.data && reportData.data.map((row, idx) => (
                            <tr key={idx}>
                              {Object.entries(row).map(([cellKey, cellVal], cellIdx) => {
                                let cellHtml = cellVal;
                                
                                if (typeof cellVal === 'number' && (cellKey.includes('amount') || cellKey.includes('spent') || cellKey.includes('revenue') || cellKey.includes('tax') || cellKey.includes('price') || cellKey.includes('total_revenue') || cellKey.includes('total_spent'))) {
                                  cellHtml = <strong style={{ color: 'var(--theme-color)' }}>₹{cellVal.toLocaleString()}</strong>;
                                }
                                
                                if (cellKey === 'status' || cellKey === 'payment_status') {
                                  let statusClass = 'pending';
                                  if (cellVal?.toLowerCase() === 'paid' || cellVal?.toLowerCase() === 'completed' || cellVal?.toLowerCase() === 'active' || cellVal?.toLowerCase() === 'delivered' || cellVal?.toLowerCase() === 'approved') statusClass = 'approved';
                                  if (cellVal?.toLowerCase() === 'cancelled' || cellVal?.toLowerCase() === 'rejected') statusClass = 'inactive';
                                  
                                  cellHtml = <span className={`badge-status ${statusClass}`}>{cellVal}</span>;
                                }

                                return <td key={cellIdx}>{cellHtml}</td>;
                              })}
                            </tr>
                          ))}
                          {(!reportData.data || reportData.data.length === 0) && (
                            <tr>
                              <td className="text-center text-muted" style={{ padding: '40px' }}>No records found for this period.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </>
          )}

          {/* Tab Content: Export Reports & Finance/Overheads */}
          {activeTab === 'export' && (
            <>
              {/* Export Selector & Action Card */}
              <div className="premium-card" style={{ padding: '25px', marginBottom: '25px' }}>
                <h3 style={{ marginBottom: '15px', color: 'var(--title-color)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileSpreadsheet size={18} style={{ color: 'var(--primary-color)' }} />
                  Data Export & Report Generation Center
                </h3>
                <p className="text-muted" style={{ marginBottom: '20px', fontSize: '13px' }}>
                  Select any business intelligence report type to preview summaries and execute CSV, Excel, or PDF document printing.
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
                  <div style={{ flex: '1', minWidth: '200px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>Select Report Type</label>
                    <select 
                      value={reportType} 
                      onChange={(e) => setReportType(e.target.value)}
                      style={{ width: '100%', padding: '10px', border: '1px solid #EAE6DB', borderRadius: '8px', backgroundColor: '#fff', fontSize: '14px', fontWeight: '600' }}
                    >
                      <option value="revenue">Revenue Report</option>
                      <option value="daily">Daily Sales Report</option>
                      <option value="weekly">Weekly Sales Report</option>
                      <option value="monthly">Monthly Sales Report</option>
                      <option value="yearly">Yearly Sales Report</option>
                      <option value="customer">Customer Analytics Report</option>
                      <option value="product">Inventory / Product Report</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', alignSelf: 'flex-end' }}>
                    <button onClick={() => handleExportCSV('csv')} className="btn-secondary" style={{ padding: '10px 20px', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                      <FileSpreadsheet size={16} /> Download CSV
                    </button>
                    <button onClick={() => handleExportCSV('excel')} className="btn-secondary" style={{ padding: '10px 20px', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                      <Sheet size={16} /> Download Excel
                    </button>
                    <button onClick={handleExportPDF} className="page-action-btn" style={{ padding: '10px 20px', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px', borderRadius: '20px', cursor: 'pointer' }}>
                      <FilePen size={16} /> Print PDF
                    </button>
                  </div>
                </div>
              </div>

              {/* Finance / Overheads Stats Metrics and Editor */}
              {financeLoading ? (
                <div style={{ height: '320px', backgroundColor: '#e2ebd9', borderRadius: '15px', animation: 'pulse 1.5s infinite' }} />
              ) : (
                <>
                  {/* Finance stats metrics */}
                  <div className="kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '25px' }}>
                    <div className="kpi-card" style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '15px', border: '1px solid #EAE6DB', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                        <span style={{ fontSize: '13px', fontWeight: '600', color: '#7E7A6B' }}>Gross Revenues</span>
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#E2EBD9', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#1B3D2B' }}>
                          <IndianRupee size={18} />
                        </div>
                      </div>
                      <h3>₹{totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
                      <span style={{ fontSize: '11px', color: '#27AE60', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <TrendingUp size={12} /> Operations revenue
                      </span>
                    </div>

                    <div className="kpi-card" style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '15px', border: '1px solid #EAE6DB', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                        <span style={{ fontSize: '13px', fontWeight: '600', color: '#7E7A6B' }}>Total Expenses</span>
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#FDEDEC', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#C0392B' }}>
                          <TrendingDown size={18} />
                        </div>
                      </div>
                      <h3>₹{totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
                      <span style={{ fontSize: '11px', color: '#7E7A6B' }}>Overheads + Staff Salaries</span>
                    </div>

                    <div className="kpi-card" style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '15px', border: '1px solid #EAE6DB', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                        <span style={{ fontSize: '13px', fontWeight: '600', color: '#7E7A6B' }}>Net profit margins</span>
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#E8F8F5', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#117A65' }}>
                          <TrendingUp size={18} />
                        </div>
                      </div>
                      <h3>₹{netMargin.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
                      <span style={{ fontSize: '11px', color: '#117A65', fontWeight: '700' }}>{marginPercentage}% Net Margin</span>
                    </div>

                    <div className="kpi-card" style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '15px', border: '1px solid #EAE6DB', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                        <span style={{ fontSize: '13px', fontWeight: '600', color: '#7E7A6B' }}>Salaries Disbursed</span>
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#EBF5FB', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#2980B9' }}>
                          <CreditCard size={18} />
                        </div>
                      </div>
                      <h3>₹{totalSalaries.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
                      <span style={{ fontSize: '11px', color: '#2980B9', fontWeight: '700' }}>Active employee rosters</span>
                    </div>
                  </div>

                  {/* Recent Sales Activity & Category Pie */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 400px), 1fr))', gap: '25px', alignItems: 'start' }}>
                    {/* Overheads ledger */}
                    <div className="premium-card" style={{ padding: '25px', margin: 0 }}>
                      <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '18px', color: 'var(--title-color)' }}>
                        <Receipt size={18} style={{ color: 'var(--primary-color)' }} />
                        Operational Overheads Cost Ledger
                      </h3>
                      <div className="responsive-table-wrapper" style={{ border: 'none', boxShadow: 'none' }}>
                        <table className="responsive-table">
                          <thead>
                            <tr>
                              <th>Expense Category</th>
                              <th>Frequency</th>
                              <th>Status</th>
                              <th>Amount</th>
                            </tr>
                          </thead>
                          <tbody>
                            {overheads.map(o => (
                              <tr key={o.id}>
                                <td><strong>{o.category}</strong></td>
                                <td className="text-muted">{o.frequency}</td>
                                <td>
                                  <span style={{
                                    padding: '3px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: '600',
                                    backgroundColor: o.status === 'Paid' ? '#D4EFDF' : '#FCF3CF',
                                    color: o.status === 'Paid' ? '#196F3D' : '#7D6608'
                                  }}>{o.status}</span>
                                </td>
                                <td style={{ fontWeight: '700' }}>₹{o.amount.toFixed(2)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Payroll roster */}
                    <div className="premium-card" style={{ padding: '25px', margin: 0 }}>
                      <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '18px', color: 'var(--title-color)' }}>
                        <Users size={18} style={{ color: 'var(--primary-color)' }} />
                        Staff Payroll Roster
                      </h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {salaries.map(s => (
                          <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 15px', border: '1px solid #EAE6DB', borderRadius: '10px' }}>
                            <div>
                              <strong style={{ display: 'block', fontSize: '13px' }}>{s.name}</strong>
                              <span className="text-muted" style={{ fontSize: '11px' }}>{s.role} • Disbursed on {s.date}</span>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <span style={{ display: 'block', fontWeight: '700', fontSize: '13px' }}>₹{s.baseSalary.toFixed(2)}</span>
                              <span style={{ fontSize: '10px', color: '#27AE60', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '3px', justifyContent: 'flex-end' }}>
                                <CheckCircle size={10} /> {s.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>

        {/* Add Expense Modal */}
        {isAddExpenseOpen && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
            <div className="premium-card" style={{ width: '400px', padding: '30px', borderRadius: '15px', backgroundColor: '#fff', boxShadow: '0 8px 30px rgba(0,0,0,0.15)' }}>
              <h3 style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Record Overhead Expense</span>
                <button onClick={() => setIsAddExpenseOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'inline-flex' }}>
                  <X size={18} />
                </button>
              </h3>
              <form onSubmit={handleAddExpense}>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>Expense Category *</label>
                  <input 
                    type="text" 
                    required 
                    value={newExpense.category} 
                    onChange={(e) => setNewExpense(prev => ({ ...prev, category: e.target.value }))}
                    style={{ width: '100%', padding: '10px', border: '1px solid #EAE6DB', borderRadius: '8px' }}
                    placeholder="e.g., Cooking Gas Cylinders"
                  />
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>Amount (₹) *</label>
                  <input 
                    type="number" 
                    required 
                    value={newExpense.amount} 
                    onChange={(e) => setNewExpense(prev => ({ ...prev, amount: e.target.value }))}
                    style={{ width: '100%', padding: '10px', border: '1px solid #EAE6DB', borderRadius: '8px' }}
                    placeholder="e.g., 4200.00"
                  />
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>Frequency</label>
                  <select 
                    value={newExpense.frequency} 
                    onChange={(e) => setNewExpense(prev => ({ ...prev, frequency: e.target.value }))}
                    style={{ width: '100%', padding: '10px', border: '1px solid #EAE6DB', borderRadius: '8px', backgroundColor: '#fff' }}
                  >
                    <option value="One-time">One-time</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Monthly">Monthly</option>
                    <option value="Yearly">Yearly</option>
                  </select>
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>Payment Status</label>
                  <select 
                    value={newExpense.status} 
                    onChange={(e) => setNewExpense(prev => ({ ...prev, status: e.target.value }))}
                    style={{ width: '100%', padding: '10px', border: '1px solid #EAE6DB', borderRadius: '8px', backgroundColor: '#fff' }}
                  >
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button type="button" className="btn-secondary" onClick={() => setIsAddExpenseOpen(false)}>Cancel</button>
                  <button type="submit" className="page-action-btn" style={{ padding: '8px 16px', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <Save size={14} /> Record Expense
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Reports;
