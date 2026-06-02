import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminNavbar from '../../components/AdminNavbar';
import apiClient from '../../services/api';
import '../../assets/styles/admin-style.css';
import '../../assets/styles/tables.css';
import { Plus, IndianRupee, TrendingDown, TrendingUp, CreditCard, Receipt, Users, CheckCircle, X, Save } from 'lucide-react';

const Finance = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
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
  const [newExpense, setNewExpense] = useState({
    category: '',
    amount: '',
    frequency: 'Monthly',
    status: 'Paid'
  });

  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await apiClient.get('/admin/dashboard-stats');
        setStats(res.data);
      } catch (err) {
        console.error("Error loading dashboard statistics:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

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
    setSuccessMsg("Overhead expense added successfully.");
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  // Calculations
  const totalRevenue = stats?.total_revenue || 128450.00;
  const totalOverheads = overheads.reduce((sum, item) => sum + item.amount, 0);
  const totalSalaries = salaries.reduce((sum, item) => sum + item.baseSalary, 0);
  const totalExpenses = totalOverheads + totalSalaries;
  const netMargin = totalRevenue - totalExpenses;
  const marginPercentage = ((netMargin / totalRevenue) * 100).toFixed(1);

  return (
    <div className="admin-wrapper">
      <AdminSidebar />
      <div className="admin-container">
        <AdminNavbar />
        
        <div className="admin-content">
          <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
            <div className="page-title-area">
              <h2>Financial Dashboard</h2>
              <p>Review real-time revenues, manage overhead operational costs, and disburse staff salaries</p>
            </div>
            
            <button className="page-action-btn" onClick={() => setIsAddExpenseOpen(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Plus size={16} /> Record Expense
            </button>
          </div>

          {successMsg && (
            <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#e2ebd9', color: '#1b3d2b', border: '1px solid var(--border-color)', padding: '12px 18px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', marginBottom: '20px' }}>
              <CheckCircle size={16} style={{ marginRight: '6px' }} /> {successMsg}
            </div>
          )}

          {/* Finance KPIs */}
          <div className="kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '25px' }}>
            <div className="kpi-card" style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '15px', border: '1px solid #EAE6DB', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#7E7A6B' }}>Gross Revenue</span>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#E2EBD9', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#1B3D2B' }}>
                  <IndianRupee size={18} />
                </div>
              </div>
              <h3>₹{totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
              <span style={{ fontSize: '11px', color: '#27AE60', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <TrendingUp size={12} /> +12.4% vs last month
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
              <span style={{ fontSize: '11px', color: '#7E7A6B' }}>
                Overheads + Staff Salaries
              </span>
            </div>

            <div className="kpi-card" style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '15px', border: '1px solid #EAE6DB', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#7E7A6B' }}>Net Operating Profit</span>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#E8F8F5', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#117A65' }}>
                  <TrendingUp size={18} />
                </div>
              </div>
              <h3>₹{netMargin.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
              <span style={{ fontSize: '11px', color: '#117A65', fontWeight: '700' }}>
                {marginPercentage}% Net Margin
              </span>
            </div>

            <div className="kpi-card" style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '15px', border: '1px solid #EAE6DB', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#7E7A6B' }}>Salaries Disbursed</span>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#EBF5FB', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#2980B9' }}>
                  <CreditCard size={18} />
                </div>
              </div>
              <h3>₹{totalSalaries.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
              <span style={{ fontSize: '11px', color: '#2980B9', fontWeight: '700' }}>
                3 active employee rosters
              </span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr', gap: '25px', alignItems: 'start', flexWrap: 'wrap' }}>
            {/* Overheads Section */}
            <div className="premium-card" style={{ padding: '25px' }}>
              <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Receipt size={18} style={{ color: 'var(--primary-color)' }} />
                Operational Overheads
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
                    {overheads.map((o) => (
                      <tr key={o.id}>
                        <td><strong>{o.category}</strong></td>
                        <td className="text-muted">{o.frequency}</td>
                        <td>
                          <span style={{
                            padding: '3px 8px',
                            borderRadius: '10px',
                            fontSize: '11px',
                            fontWeight: '600',
                            backgroundColor: o.status === 'Paid' ? '#D4EFDF' : '#FCF3CF',
                            color: o.status === 'Paid' ? '#196F3D' : '#7D6608'
                          }}>
                            {o.status}
                          </span>
                        </td>
                        <td style={{ fontWeight: '700' }}>₹{o.amount.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Salary Roster */}
            <div className="premium-card" style={{ padding: '25px' }}>
              <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Users size={18} style={{ color: 'var(--primary-color)' }} />
                Staff Payroll Roster
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {salaries.map((s) => (
                  <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 15px', border: '1px solid #EAE6DB', borderRadius: '10px' }}>
                    <div>
                      <strong style={{ display: 'block', fontSize: '13px' }}>{s.name}</strong>
                      <span className="text-muted" style={{ fontSize: '11px' }}>{s.role} • Paid on {s.date}</span>
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
    </div>
  );
};

export default Finance;
