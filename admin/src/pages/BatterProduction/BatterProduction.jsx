import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminNavbar from '../../components/AdminNavbar';
import '../../assets/styles/admin-style.css';
import '../../assets/styles/tables.css';
import apiClient from '../../services/api';
import { Plus, Factory, Truck, Warehouse, List, X, Save, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';

const BatterProduction = () => {
  const [logs, setLogs] = useState([]);
  const [summary, setSummary] = useState({
    total_produced: 0,
    total_sold: 0,
    total_remaining: 0,
    unit: 'kg'
  });
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Form states
  const [formData, setFormData] = useState({
    batter_type: 'Idly Batter',
    produced_quantity: '',
    sold_quantity: '0',
    unit: 'kg'
  });

  const [updateSoldQty, setUpdateSoldQty] = useState('');

  const fetchLogsAndSummary = async () => {
    try {
      const logsRes = await apiClient.get('/batter-production/');
      const summaryRes = await apiClient.get('/batter-production/summary');
      setLogs(logsRes.data);
      setSummary(summaryRes.data);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to load batter production data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogsAndSummary();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!formData.produced_quantity) {
      setErrorMsg("Please fill in produced quantity.");
      return;
    }

    try {
      await apiClient.post('/batter-production/', {
        batter_type: formData.batter_type,
        produced_quantity: parseFloat(formData.produced_quantity),
        sold_quantity: parseFloat(formData.sold_quantity || 0),
        unit: formData.unit
      });

      setSuccessMsg("Production batch logged successfully!");
      setShowAddModal(false);
      setFormData({
        batter_type: 'Idly Batter',
        produced_quantity: '',
        sold_quantity: '0',
        unit: 'kg'
      });
      fetchLogsAndSummary();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to log production batch.");
      setTimeout(() => setErrorMsg(''), 4000);
    }
  };

  const openUpdateModal = (log) => {
    setSelectedLog(log);
    setUpdateSoldQty(log.sold_quantity.toString());
    setShowUpdateModal(true);
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (updateSoldQty === '') {
      setErrorMsg("Please fill in sold quantity.");
      return;
    }

    try {
      await apiClient.put(`/batter-production/${selectedLog.id}`, {
        sold_quantity: parseFloat(updateSoldQty)
      });

      setSuccessMsg("Sold quantity updated successfully!");
      setShowUpdateModal(false);
      fetchLogsAndSummary();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to update sold quantity.");
      setTimeout(() => setErrorMsg(''), 4000);
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
              <h2>Batter Production ERP Console</h2>
              <p>Record batches, track daily yields, and log distribution statistics.</p>
            </div>
            <button className="page-action-btn" onClick={() => setShowAddModal(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Plus size={16} /> Log New Production
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

          {/* Aggregate Summary indicators */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))', gap: '20px', marginBottom: '30px' }}>
            <div className="stats-card">
              <div className="stats-card-top">
                <div className="stats-card-icon teal">
                  <Factory size={20} />
                </div>
                <span className="stats-card-trend up">Yield</span>
              </div>
              <div className="stats-card-value">{summary.total_produced} {summary.unit}</div>
              <div className="stats-card-label">Total Produced Today</div>
            </div>

            <div className="stats-card">
              <div className="stats-card-top">
                <div className="stats-card-icon orange">
                  <Truck size={20} />
                </div>
                <span className="stats-card-trend up">Dispatched</span>
              </div>
              <div className="stats-card-value">{summary.total_sold} {summary.unit}</div>
              <div className="stats-card-label">Total Sold/Distributed Today</div>
            </div>

            <div className="stats-card">
              <div className="stats-card-top">
                <div className="stats-card-icon yellow">
                  <Warehouse size={20} />
                </div>
                <span className="stats-card-trend warning">Storage</span>
              </div>
              <div className="stats-card-value">{summary.total_remaining} {summary.unit}</div>
              <div className="stats-card-label">Remaining in Cold Storage</div>
            </div>
          </div>

          {/* Batches Table */}
          <div className="premium-card">
            <div className="premium-card-header">
              <div className="premium-card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <List size={18} />
                <h3>Active Batter Batches</h3>
              </div>
            </div>

            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#888' }}>
                Loading production logs...
              </div>
            ) : (
              <div className="responsive-table-wrapper" style={{ border: 'none', boxShadow: 'none' }}>
                <table className="responsive-table">
                  <thead>
                    <tr>
                      <th>Batch ID</th>
                      <th>Batter Type</th>
                      <th>Produced Qty</th>
                      <th>Sold Qty</th>
                      <th>Remaining Qty</th>
                      <th>Unit</th>
                      <th>Logged Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs && logs.length > 0 ? (
                      logs.map((log) => (
                        <tr key={log.id}>
                          <td><strong>BCH-{log.id}</strong></td>
                          <td><strong>{log.batter_type}</strong></td>
                          <td>{log.produced_quantity}</td>
                          <td>{log.sold_quantity}</td>
                          <td style={{ fontWeight: '700', color: 'var(--theme-color)' }}>
                            {log.remaining_quantity}
                          </td>
                          <td>{log.unit}</td>
                          <td className="text-muted" style={{ fontSize: '13px' }}>
                            {log.date ? new Date(log.date).toLocaleString() : 'N/A'}
                          </td>
                           <td>
                             <button 
                               onClick={() => openUpdateModal(log)}
                               className="btn-secondary"
                               style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '20px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                             >
                               <RefreshCw size={12} /> Update Sales
                             </button>
                           </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="8" className="text-center text-muted" style={{ padding: '40px' }}>
                          No production logs registered yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Add Modal */}
        {showAddModal && (
          <div className="admin-modal show">
            <div className="admin-modal-content">
              <div className="admin-modal-header" style={{ backgroundColor: 'var(--theme-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3>Log Production Batch</h3>
                <button className="admin-modal-close" onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fff', display: 'inline-flex' }}>
                  <X size={18} />
                </button>
              </div>
              <form onSubmit={handleAddSubmit}>
                <div className="admin-modal-body">
                  <div className="form-field">
                    <label>Batter Type</label>
                    <select 
                      name="batter_type"
                      value={formData.batter_type}
                      onChange={handleInputChange}
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #EAE6DB' }}
                    >
                      <option value="Idly Batter">Idly Batter</option>
                      <option value="Dosa Batter">Dosa Batter</option>
                      <option value="Millet Batter">Millet Batter</option>
                      <option value="Ragi Batter">Ragi Batter</option>
                    </select>
                  </div>

                  <div className="form-grid">
                    <div className="form-field">
                      <label>Produced Qty</label>
                      <input 
                        type="number"
                        step="0.1"
                        name="produced_quantity"
                        placeholder="e.g. 50"
                        value={formData.produced_quantity}
                        onChange={handleInputChange}
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #EAE6DB' }}
                      />
                    </div>
                    <div className="form-field">
                      <label>Sold Qty (Initial)</label>
                      <input 
                        type="number"
                        step="0.1"
                        name="sold_quantity"
                        placeholder="e.g. 10"
                        value={formData.sold_quantity}
                        onChange={handleInputChange}
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #EAE6DB' }}
                      />
                    </div>
                  </div>

                  <div className="form-field">
                    <label>Unit</label>
                    <input 
                      type="text"
                      name="unit"
                      value={formData.unit}
                      onChange={handleInputChange}
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #EAE6DB', backgroundColor: '#EDF3F0' }}
                      disabled
                    />
                  </div>
                </div>
                <div className="admin-modal-footer">
                  <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                  <button type="submit" className="page-action-btn" style={{ borderRadius: '20px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <Save size={16} /> Log Yield
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Update Modal */}
        {showUpdateModal && (
          <div className="admin-modal show">
            <div className="admin-modal-content">
              <div className="admin-modal-header" style={{ backgroundColor: 'var(--theme-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3>Update Sold Quantity</h3>
                <button className="admin-modal-close" onClick={() => setShowUpdateModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fff', display: 'inline-flex' }}>
                  <X size={18} />
                </button>
              </div>
              <form onSubmit={handleUpdateSubmit}>
                <div className="admin-modal-body">
                  <div style={{ marginBottom: '20px' }}>
                    <strong>Batter Type:</strong> {selectedLog?.batter_type} <br/>
                    <strong>Produced Qty:</strong> {selectedLog?.produced_quantity} {selectedLog?.unit} <br/>
                    <strong>Current Sold Qty:</strong> {selectedLog?.sold_quantity} {selectedLog?.unit}
                  </div>
                  <div className="form-field">
                    <label>New Sold Quantity ({selectedLog?.unit})</label>
                    <input 
                      type="number"
                      step="0.1"
                      placeholder="e.g. 15.5"
                      value={updateSoldQty}
                      onChange={(e) => setUpdateSoldQty(e.target.value)}
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #EAE6DB' }}
                    />
                  </div>
                </div>
                <div className="admin-modal-footer">
                  <button type="button" className="btn-secondary" onClick={() => setShowUpdateModal(false)}>Cancel</button>
                  <button type="submit" className="page-action-btn" style={{ borderRadius: '20px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <Save size={16} /> Save Changes
                  </button>
                </div>
              </form>
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

export default BatterProduction;
