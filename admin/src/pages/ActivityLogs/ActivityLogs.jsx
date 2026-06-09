import React, { useState } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminNavbar from '../../components/AdminNavbar';
import { Search, Download, Filter, Calendar } from 'lucide-react';
import '../../assets/styles/admin-style.css';
import '../../assets/styles/tables.css';

const ActivityLogs = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [moduleFilter, setModuleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  // Mock Data
  const logsData = [
    { id: 1, date: '09 Jun 2026', time: '10:30 AM', adminName: 'Admin User', action: 'Added Product', module: 'Ready To Eat', status: 'Success' },
    { id: 2, date: '09 Jun 2026', time: '11:10 AM', adminName: 'Admin User', action: 'Updated Order', module: 'Orders', status: 'Success' },
    { id: 3, date: '08 Jun 2026', time: '02:15 PM', adminName: 'Manager John', action: 'Deleted Coupon', module: 'Offers', status: 'Success' },
    { id: 4, date: '08 Jun 2026', time: '04:05 PM', adminName: 'Admin User', action: 'Failed Login Attempt', module: 'Auth', status: 'Failed' },
    { id: 5, date: '07 Jun 2026', time: '09:00 AM', adminName: 'Kitchen Staff 1', action: 'Updated Inventory', module: 'Inventory', status: 'Success' },
  ];

  const filteredLogs = logsData.filter(log => {
    const matchesSearch = log.action.toLowerCase().includes(searchTerm.toLowerCase()) || log.adminName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesModule = moduleFilter === 'All' || log.module === moduleFilter;
    const matchesStatus = statusFilter === 'All' || log.status === statusFilter;
    
    // Simple date filter logic (for demo purposes)
    let matchesDate = true;
    if (dateRange.start && new Date(log.date) < new Date(dateRange.start)) matchesDate = false;
    if (dateRange.end && new Date(log.date) > new Date(dateRange.end)) matchesDate = false;

    return matchesSearch && matchesModule && matchesStatus && matchesDate;
  });

  const handleExportCSV = () => {
    const headers = "Date,Time,Admin Name,Action,Module,Status\n";
    const csvContent = "data:text/csv;charset=utf-8," + headers + filteredLogs.map(e => `${e.date},${e.time},${e.adminName},${e.action},${e.module},${e.status}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "activity_logs.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportExcel = () => {
    // Basic Excel XML export for demonstration
    const xmlData = `<?xml version="1.0"?>
      <?mso-application progid="Excel.Sheet"?>
      <Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
       xmlns:o="urn:schemas-microsoft-com:office:office"
       xmlns:x="urn:schemas-microsoft-com:office:excel"
       xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
       xmlns:html="http://www.w3.org/TR/REC-html40">
       <Worksheet ss:Name="Activity Logs">
        <Table>
         <Row>
          <Cell><Data ss:Type="String">Date</Data></Cell>
          <Cell><Data ss:Type="String">Time</Data></Cell>
          <Cell><Data ss:Type="String">Admin Name</Data></Cell>
          <Cell><Data ss:Type="String">Action</Data></Cell>
          <Cell><Data ss:Type="String">Module</Data></Cell>
          <Cell><Data ss:Type="String">Status</Data></Cell>
         </Row>
         ${filteredLogs.map(log => `
         <Row>
          <Cell><Data ss:Type="String">${log.date}</Data></Cell>
          <Cell><Data ss:Type="String">${log.time}</Data></Cell>
          <Cell><Data ss:Type="String">${log.adminName}</Data></Cell>
          <Cell><Data ss:Type="String">${log.action}</Data></Cell>
          <Cell><Data ss:Type="String">${log.module}</Data></Cell>
          <Cell><Data ss:Type="String">${log.status}</Data></Cell>
         </Row>
         `).join('')}
        </Table>
       </Worksheet>
      </Workbook>`;
    
    const blob = new Blob([xmlData], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'activity_logs.xls';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="admin-wrapper">
      <AdminSidebar />
      <div className="admin-container">
        <AdminNavbar />

        <div className="admin-content">
          <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
            <div className="page-title-area">
              <h2>Activity Logs</h2>
              <p>Track all system actions, modifications, and login events.</p>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn-secondary" onClick={handleExportCSV} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Download size={14} /> Export CSV
              </button>
              <button className="page-action-btn" onClick={handleExportExcel} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Download size={14} /> Export Excel
              </button>
            </div>
          </div>

          <div className="premium-card" style={{ padding: '20px' }}>
            {/* Filters */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', marginBottom: '20px' }}>
              <div className="navbar-search" style={{ margin: 0, width: '250px', border: '1px solid #EAE6DB', borderRadius: '8px', display: 'flex', alignItems: 'center', padding: '0 10px' }}>
                <Search size={16} style={{ color: '#888', marginRight: '5px' }} />
                <input 
                  type="text" 
                  placeholder="Search action or admin..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Filter size={16} style={{ color: '#888' }} />
                <select 
                  value={moduleFilter} 
                  onChange={(e) => setModuleFilter(e.target.value)}
                  style={{ padding: '8px', border: '1px solid #EAE6DB', borderRadius: '8px', backgroundColor: '#fff', fontSize: '13px' }}
                >
                  <option value="All">All Modules</option>
                  <option value="Ready To Eat">Ready To Eat</option>
                  <option value="Orders">Orders</option>
                  <option value="Offers">Offers</option>
                  <option value="Auth">Auth</option>
                  <option value="Inventory">Inventory</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <select 
                  value={statusFilter} 
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{ padding: '8px', border: '1px solid #EAE6DB', borderRadius: '8px', backgroundColor: '#fff', fontSize: '13px' }}
                >
                  <option value="All">All Statuses</option>
                  <option value="Success">Success</option>
                  <option value="Failed">Failed</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={16} style={{ color: '#888' }} />
                <input 
                  type="date" 
                  value={dateRange.start}
                  onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                  style={{ padding: '7px', border: '1px solid #EAE6DB', borderRadius: '8px', fontSize: '13px' }}
                />
                <span style={{ color: '#888' }}>-</span>
                <input 
                  type="date" 
                  value={dateRange.end}
                  onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                  style={{ padding: '7px', border: '1px solid #EAE6DB', borderRadius: '8px', fontSize: '13px' }}
                />
              </div>
            </div>

            {/* Logs Table */}
            <div className="responsive-table-wrapper" style={{ border: 'none', boxShadow: 'none' }}>
              <table className="responsive-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Admin Name</th>
                    <th>Action</th>
                    <th>Module</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map(log => (
                    <tr key={log.id}>
                      <td data-label="Date" style={{ fontWeight: '600' }}>{log.date}</td>
                      <td data-label="Time" style={{ color: '#666' }}>{log.time}</td>
                      <td data-label="Admin Name">{log.adminName}</td>
                      <td data-label="Action" style={{ color: 'var(--title-color)' }}>{log.action}</td>
                      <td data-label="Module">{log.module}</td>
                      <td data-label="Status">
                        <span style={{ 
                          padding: '4px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold',
                          backgroundColor: log.status === 'Success' ? '#D4EFDF' : '#FADBD8',
                          color: log.status === 'Success' ? '#196F3D' : '#943126'
                        }}>
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {filteredLogs.length === 0 && (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#888' }}>No activity logs found for the selected criteria.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityLogs;
