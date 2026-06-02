import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminNavbar from '../../components/AdminNavbar';
import apiClient from '../../services/api';
import '../../assets/styles/admin-style.css';
import '../../assets/styles/tables.css';
import { AlertTriangle, FileSpreadsheet, Sheet, FilePen, List } from 'lucide-react';

const Reports = () => {
  const [reportType, setReportType] = useState('revenue'); // 'daily', 'weekly', 'monthly', 'yearly', 'customer', 'revenue', 'product'
  const [reportData, setReportData] = useState({
    type: 'revenue',
    summary: {},
    data: []
  });
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchReport = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const response = await apiClient.get(`/admin/reports?type=${reportType}`);
      setReportData(response.data);
    } catch (err) {
      console.error("Failed to load report data:", err);
      setErrorMsg("Failed to load reports statement from server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [reportType]);

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

  return (
    <div className="admin-wrapper">
      <AdminSidebar />
      <div className="admin-container">
        <AdminNavbar />

        <div className="admin-content">
          <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
            <div className="page-title-area">
              <h2>Business Intelligence Reports</h2>
              <p>Download financial statements, track customer acquisitions, and analyze raw material revenue margins.</p>
            </div>
            
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {['revenue', 'daily', 'weekly', 'monthly', 'yearly', 'customer', 'product'].map(type => (
                <button 
                  key={type}
                  onClick={() => setReportType(type)} 
                  className={`th-btn ${reportType === type ? 'style9' : 'style10'}`} 
                  style={{ border: 'none', cursor: 'pointer', padding: '8px 16px', borderRadius: '20px', textTransform: 'capitalize' }}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {errorMsg && (
            <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#fcdcd8', color: 'var(--danger-color)', border: '1px solid #f8b4ac', padding: '12px 18px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', marginBottom: '20px' }}>
              <AlertTriangle size={16} style={{ marginRight: '6px' }} /> {errorMsg}
            </div>
          )}

          {/* Export Panel toolbar */}
          <div className="premium-card" style={{ padding: '15px 25px', marginBottom: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
            <div style={{ fontWeight: '700', color: 'var(--title-color)', textTransform: 'capitalize' }}>
              Selected Statement: <strong>{reportType} Analytics Report</strong>
            </div>
            <div className="flex gap-1">
              <button onClick={() => handleExportCSV('csv')} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <FileSpreadsheet size={14} /> Download CSV
              </button>
              <button onClick={() => handleExportCSV('excel')} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <Sheet size={14} /> Download Excel
              </button>
              <button onClick={handleExportPDF} className="page-action-btn" style={{ padding: '8px 16px', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px', borderRadius: '20px' }}>
                <FilePen size={14} /> Generate Printable PDF
              </button>
            </div>
          </div>

          {loading ? (
            <div style={{ height: '320px', backgroundColor: '#e2ebd9', borderRadius: '15px', animation: 'pulse 1.5s infinite' }} />
          ) : (
            <>
              {/* Dynamic KPI summary indicators */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                {Object.entries(reportData.summary).map(([key, val]) => (
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

              {/* Dynamic Records Table */}
              <div className="premium-card">
                <div className="premium-card-header">
                  <div className="premium-card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <List size={18} />
                    <h3 style={{ textTransform: 'uppercase' }}>{reportType} Statement Records</h3>
                  </div>
                </div>
                <div className="responsive-table-wrapper" style={{ border: 'none', boxShadow: 'none' }}>
                  <table className="responsive-table">
                    <thead>
                      <tr>
                        {reportData.data.length > 0 && Object.keys(reportData.data[0]).map(h => (
                          <th key={h} style={{ textTransform: 'uppercase' }}>{h.replace(/_/g, ' ')}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.data.map((row, idx) => (
                        <tr key={idx}>
                          {Object.entries(row).map(([cellKey, cellVal], cellIdx) => {
                            let cellHtml = cellVal;
                            
                            // Format currency fields
                            if (typeof cellVal === 'number' && (cellKey.includes('amount') || cellKey.includes('spent') || cellKey.includes('revenue') || cellKey.includes('tax') || cellKey.includes('price') || cellKey.includes('total_revenue') || cellKey.includes('total_spent'))) {
                              cellHtml = <strong style={{ color: 'var(--theme-color)' }}>₹{cellVal.toLocaleString()}</strong>;
                            }
                            
                            // Format statuses
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

                      {reportData.data.length === 0 && (
                        <tr>
                          <td className="text-center text-muted" style={{ padding: '40px' }}>
                            No records found for this report period.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

        </div>

        <div className="admin-footer">
          <div>&copy; 2026 <strong>Amma's Kitchen Admin</strong>. All Rights Reserved.</div>
        </div>

      </div>
    </div>
  );
};

export default Reports;
