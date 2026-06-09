import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminNavbar from '../../components/AdminNavbar';
import '../../assets/styles/admin-style.css';
import '../../assets/styles/tables.css';
import apiClient from '../../services/api';
import { 
  UserPlus, 
  Search, 
  MoreVertical, 
  Trash2, 
  ClipboardCheck, 
  CheckCircle, 
  X, 
  AlertTriangle,
  Phone,
  Power
} from 'lucide-react';

const KitchenManagement = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDropdown, setActiveDropdown] = useState(null);

  // Form states
  const [newMember, setNewMember] = useState({
    name: '',
    phone: '',
    specialty: 'General Chef',
    status: 'Available'
  });

  const [customTask, setCustomTask] = useState('');

  const fetchData = async () => {
    try {
      const response = await apiClient.get('/kitchen-management/');
      setStaff(response.data);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to load kitchen staff information from the server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStatusChange = async (staffId, newStatus) => {
    try {
      await apiClient.put(`/kitchen-management/${staffId}`, { status: newStatus });
      setSuccessMsg(`Duty status updated to ${newStatus}`);
      fetchData();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to update kitchen staff duty status.");
      setTimeout(() => setErrorMsg(''), 4000);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!newMember.name || !newMember.phone) {
      setErrorMsg("Name and phone number are required.");
      return;
    }

    try {
      await apiClient.post('/kitchen-management/', newMember);
      setSuccessMsg("Kitchen staff member registered successfully!");
      setShowAddModal(false);
      setNewMember({ name: '', phone: '', specialty: 'General Chef', status: 'Available' });
      fetchData();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to register kitchen staff member.");
      setTimeout(() => setErrorMsg(''), 4000);
    }
  };

  const openAssignModal = (member) => {
    setSelectedMember(member);
    setCustomTask(member.assigned_tasks !== 'None' ? member.assigned_tasks : '');
    setShowAssignModal(true);
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!customTask.trim()) {
      setErrorMsg("Please specify a task or order details.");
      return;
    }

    try {
      await apiClient.put(`/kitchen-management/${selectedMember.id}/assign`, {
        task: customTask.trim()
      });

      setSuccessMsg(`Task successfully assigned to ${selectedMember.name}!`);
      setShowAssignModal(false);
      setCustomTask('');
      fetchData();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to assign task to staff member.");
      setTimeout(() => setErrorMsg(''), 4000);
    }
  };

  const handleDeleteMember = async (id) => {
    if (!window.confirm("Are you sure you want to remove this kitchen staff member?")) return;
    try {
      await apiClient.delete(`/kitchen-management/${id}`);
      setSuccessMsg("Kitchen staff member removed successfully!");
      fetchData();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to delete kitchen staff member.");
      setTimeout(() => setErrorMsg(''), 4000);
    }
  };

  const filteredStaff = staff.filter(member => 
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.phone.includes(searchQuery)
  );

  return (
    <div className="admin-wrapper">
      <AdminSidebar />
      
      <div className="admin-container">
        <AdminNavbar />

        <div className="admin-content">
          <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
            <div className="page-title-area">
              <h2>Kitchen Control Panel</h2>
              <p>Register culinary staff, manage specialties, adjust shift states, and assign tasks.</p>
            </div>
            <button className="page-action-btn" onClick={() => setShowAddModal(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <UserPlus size={16} /> Add Kitchen Staff
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

          {/* Table Toolbar */}
          <div className="premium-card" style={{ padding: '15px 25px', marginBottom: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
            <div className="navbar-search" style={{ margin: 0, width: '320px', border: '1px solid #EAE6DB', borderRadius: '10px', display: 'flex', alignItems: 'center' }}>
              <Search size={16} style={{ marginRight: '8px', color: '#888' }} />
              <input
                type="text"
                placeholder="Search staff by name or specialty..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
            <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--body-color)' }}>
              Showing {filteredStaff.length} Culinary Team Members
            </div>
          </div>

          <div className="premium-card">
            <div className="premium-card-header">
              <div className="premium-card-title">
                <i className="fa-solid fa-kitchen-set"></i>
                <h3>Active Culinary Team</h3>
              </div>
            </div>

            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#888' }}>
                Loading kitchen staff database...
              </div>
            ) : (
              <div className="responsive-table-wrapper" style={{ border: 'none', boxShadow: 'none' }}>
                <table className="responsive-table">
                  <thead>
                    <tr>
                      <th>Staff ID</th>
                      <th>Chef Name</th>
                      <th>Specialty Duty</th>
                      <th>Mobile Phone</th>
                      <th>Duty Status</th>
                      <th>Assigned Tasks</th>
                      <th>Quick Status Update</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStaff && filteredStaff.length > 0 ? (
                      filteredStaff.map((p) => {
                        let statusColor = '#666';
                        if (p.status === 'Available') statusColor = '#3F9065';
                        else if (p.status === 'Cooking') statusColor = '#FF9924';
                        else if (p.status === 'On Break') statusColor = '#2b5c8f';
                        else if (p.status === 'Off Duty') statusColor = '#943126';

                        return (
                          <tr key={p.id}>
                            <td data-label="Staff ID"><strong>KCH-{p.id}</strong></td>
                            <td data-label="Chef Name">
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ width: '30px', height: '30px', borderRadius: '50%', backgroundColor: '#E2EBD9', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#1B3D2B', fontWeight: '700', fontSize: '12px' }}>
                                  {p.name.charAt(0).toUpperCase()}
                                </div>
                                <strong>{p.name}</strong>
                              </div>
                            </td>
                            <td data-label="Specialty Duty">
                              <span style={{ fontWeight: '600', color: 'var(--theme-color)', fontSize: '13px' }}>
                                {p.specialty}
                              </span>
                            </td>
                            <td data-label="Mobile Phone">
                              <a href={`tel:${p.phone}`} style={{ color: 'var(--body-color)', fontWeight: '600', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                <Phone size={12} style={{ color: 'var(--theme-color)', opacity: 0.8 }} />
                                {p.phone}
                              </a>
                            </td>
                            <td data-label="Duty Status">
                              <span style={{
                                padding: '4px 10px',
                                borderRadius: '15px',
                                fontSize: '11px',
                                fontWeight: '700',
                                backgroundColor: `${statusColor}15`,
                                color: statusColor,
                                border: `1px solid ${statusColor}`
                              }}>
                                {p.status}
                              </span>
                            </td>
                            <td data-label="Assigned Tasks">
                              <div style={{ maxWidth: '200px', wordBreak: 'break-all', fontWeight: '600', color: p.assigned_tasks === 'None' ? '#888' : '#222' }}>
                                {p.assigned_tasks}
                              </div>
                            </td>
                            <td data-label="Quick Status Update">
                              <select 
                                value={p.status} 
                                onChange={(e) => handleStatusChange(p.id, e.target.value)}
                                style={{ padding: '6px 10px', fontSize: '12px', border: '1px solid #EAE6DB', borderRadius: '8px', backgroundColor: '#fff', fontWeight: '600' }}
                              >
                                <option value="Available">Available</option>
                                <option value="Cooking">Cooking</option>
                                <option value="On Break">On Break</option>
                                <option value="Off Duty">Off Duty</option>
                              </select>
                            </td>
                            <td data-label="Actions">
                              <div style={{ position: 'relative', display: 'inline-block' }} onMouseLeave={() => setActiveDropdown(null)}>
                                <button 
                                  onClick={() => setActiveDropdown(activeDropdown === p.id ? null : p.id)}
                                  className="btn-secondary"
                                  style={{ padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
                                >
                                  <MoreVertical size={14} /> Actions
                                </button>
                                {activeDropdown === p.id && (
                                  <div style={{
                                    position: 'absolute',
                                    right: 0,
                                    top: '30px',
                                    backgroundColor: '#fff',
                                    border: '1px solid #EAE6DB',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                    zIndex: 100,
                                    minWidth: '150px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    padding: '4px 0'
                                  }}>
                                    <button 
                                      onClick={() => { openAssignModal(p); setActiveDropdown(null); }}
                                      style={{ padding: '8px 12px', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#333' }}
                                    >
                                      <ClipboardCheck size={12} /> Assign Task
                                    </button>
                                    <button 
                                      onClick={() => { handleStatusChange(p.id, p.status === 'Available' ? 'On Break' : 'Available'); setActiveDropdown(null); }}
                                      style={{ padding: '8px 12px', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#7D6608' }}
                                    >
                                      <Power size={12} /> Toggle Duty
                                    </button>
                                    <button 
                                      onClick={() => { handleDeleteMember(p.id); setActiveDropdown(null); }}
                                      style={{ padding: '8px 12px', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#78281F', borderTop: '1px solid #FAF8F2' }}
                                    >
                                      <Trash2 size={12} /> Remove Member
                                    </button>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="8" className="text-center text-muted" style={{ padding: '40px' }}>
                          No kitchen staff registered under current filters.
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
              <div className="admin-modal-header" style={{ backgroundColor: 'var(--theme-color)', padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTopLeftRadius: '12px', borderTopRightRadius: '12px' }}>
                <h3 style={{ margin: 0 }}>Register Kitchen Staff Member</h3>
                <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleAddSubmit}>
                <div className="admin-modal-body" style={{ padding: '20px' }}>
                  <div className="form-field">
                    <label>Full Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Ramanathan Iyer"
                      value={newMember.name}
                      onChange={(e) => setNewMember(prev => ({ ...prev, name: e.target.value }))}
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #EAE6DB' }}
                      required
                    />
                  </div>
                  <div className="form-field">
                    <label>Mobile Number</label>
                    <input 
                      type="tel" 
                      placeholder="e.g. +91 98840 55555"
                      value={newMember.phone}
                      onChange={(e) => setNewMember(prev => ({ ...prev, phone: e.target.value }))}
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #EAE6DB' }}
                      required
                    />
                  </div>
                  <div className="form-field">
                    <label>Culinary Specialty / Duty Role</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Dosa Specialist, Batter Master"
                      value={newMember.specialty}
                      onChange={(e) => setNewMember(prev => ({ ...prev, specialty: e.target.value }))}
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #EAE6DB' }}
                    />
                  </div>
                  <div className="form-field">
                    <label>Initial Status</label>
                    <select 
                      value={newMember.status}
                      onChange={(e) => setNewMember(prev => ({ ...prev, status: e.target.value }))}
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #EAE6DB' }}
                    >
                      <option value="Available">Available</option>
                      <option value="Cooking">Cooking</option>
                      <option value="On Break">On Break</option>
                      <option value="Off Duty">Off Duty</option>
                    </select>
                  </div>
                </div>
                <div className="admin-modal-footer" style={{ padding: '15px 20px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                  <button type="submit" className="page-action-btn" style={{ borderRadius: '20px' }}>Register Member</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Assign Modal */}
        {showAssignModal && (
          <div className="admin-modal show">
            <div className="admin-modal-content">
              <div className="admin-modal-header" style={{ backgroundColor: 'var(--theme-color)', padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTopLeftRadius: '12px', borderTopRightRadius: '12px' }}>
                <h3>Assign Prep Task to {selectedMember?.name}</h3>
                <button onClick={() => setShowAssignModal(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleAssignSubmit}>
                <div className="admin-modal-body" style={{ padding: '20px' }}>
                  <div className="form-field">
                    <label>Task Description / Order Allocation</label>
                    <input 
                      type="text"
                      placeholder="e.g. Prepare 20kg Idli Batter for ORD-120"
                      value={customTask}
                      onChange={(e) => setCustomTask(e.target.value)}
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #EAE6DB' }}
                      required
                    />
                  </div>
                </div>
                <div className="admin-modal-footer" style={{ padding: '15px 20px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button type="button" className="btn-secondary" onClick={() => setShowAssignModal(false)}>Cancel</button>
                  <button type="submit" className="page-action-btn" style={{ borderRadius: '20px' }}>Assign Allocation</button>
                </div>
              </form>
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

export default KitchenManagement;
