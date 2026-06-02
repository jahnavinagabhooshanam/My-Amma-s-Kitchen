import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminNavbar from '../../components/AdminNavbar';
import apiClient from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import '../../assets/styles/admin-style.css';
import '../../assets/styles/tables.css';
import { 
  UserPlus, 
  Search, 
  MoreVertical, 
  Pencil, 
  Trash2, 
  Key, 
  CheckCircle, 
  X, 
  AlertTriangle 
} from 'lucide-react';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { searchQuery, setSearchQuery } = useAuth();
  const [roleFilter, setRoleFilter] = useState('All');
  const [activeDropdown, setActiveDropdown] = useState(null);
  
  // Modals / Form State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  
  // Form fields
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'manager',
    password: '',
    status: 'Active'
  });
  
  const [newPassword, setNewPassword] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/user-management/');
      setUsers(response.data);
    } catch (err) {
      console.error("Failed to load users:", err);
      setErrorMsg("Failed to load users from backend database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      await apiClient.post('/user-management/', formData);
      setSuccessMsg(`Staff member "${formData.name}" added successfully.`);
      setIsAddOpen(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        role: 'manager',
        password: '',
        status: 'Active'
      });
      fetchUsers();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.error || "Failed to create user.");
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      await apiClient.put(`/user-management/${selectedUser.id}`, {
        name: selectedUser.name,
        email: selectedUser.email,
        phone: selectedUser.phone,
        role: selectedUser.role,
        status: selectedUser.status
      });
      setSuccessMsg(`User details updated successfully.`);
      setIsEditOpen(false);
      fetchUsers();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.error || "Failed to update user.");
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    if (!newPassword) return;
    setErrorMsg('');
    try {
      await apiClient.put(`/user-management/${selectedUser.id}/reset-password`, {
        password: newPassword
      });
      setSuccessMsg(`Password reset successfully for ${selectedUser.name}.`);
      setIsResetOpen(false);
      setNewPassword('');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to reset password.");
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      await apiClient.put(`/user-management/${user.id}/toggle-status`);
      setSuccessMsg(`User status toggled successfully.`);
      fetchUsers();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to toggle status.");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to permanently delete this user?")) return;
    try {
      await apiClient.delete(`/user-management/${userId}`);
      setSuccessMsg("User deleted successfully.");
      fetchUsers();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.error || "Failed to delete user.");
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (u.phone && u.phone.includes(searchQuery));
    const matchesRole = roleFilter === 'All' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="admin-wrapper">
      <AdminSidebar />
      <div className="admin-container">
        <AdminNavbar />
        
        <div className="admin-content">
          <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
            <div className="page-title-area">
              <h2>User & Role Management</h2>
              <p>Manage access levels, active statuses, credentials, and custom operational profiles</p>
            </div>
            
            <button className="page-action-btn" onClick={() => setIsAddOpen(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <UserPlus size={16} /> Add Staff Account
            </button>
          </div>

          {successMsg && (
            <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#e2ebd9', color: '#1b3d2b', border: '1px solid var(--border-color)', padding: '12px 18px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', marginBottom: '20px' }}>
              <CheckCircle size={16} style={{ marginRight: '6px' }} /> {successMsg}
            </div>
          )}

          {errorMsg && (
            <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#FADBD8', color: '#78281F', border: '1px solid #F1948A', padding: '12px 18px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', marginBottom: '20px' }}>
              <AlertTriangle size={16} style={{ marginRight: '6px' }} /> {errorMsg}
            </div>
          )}

          {/* Table Toolbar */}
          <div className="premium-card" style={{ padding: '20px 25px', marginBottom: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
            <div className="navbar-search" style={{ margin: 0, width: '320px', border: '1px solid #EAE6DB', borderRadius: '10px', display: 'flex', alignItems: 'center' }}>
              <Search size={16} style={{ marginRight: '8px', color: '#888' }} />
              <input 
                type="text" 
                placeholder="Search staff by name or email..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
            
            <div className="flex gap-1" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600' }}>Filter Role:</label>
              <select 
                value={roleFilter} 
                onChange={(e) => setRoleFilter(e.target.value)}
                style={{ padding: '8px 12px', border: '1px solid #EAE6DB', borderRadius: '10px', backgroundColor: '#fff', fontSize: '13px' }}
              >
                <option value="All">All Roles</option>
                <option value="admin">Super Admin</option>
                <option value="manager">Manager</option>
                <option value="kitchen_staff">Kitchen Staff</option>
                <option value="delivery_staff">Delivery Staff</option>
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
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Date Registered</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => (
                      <tr key={u.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#E2EBD9', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#1B3D2B', fontWeight: '700' }}>
                              {u.name.charAt(0).toUpperCase()}
                            </div>
                            <strong>{u.name}</strong>
                          </div>
                        </td>
                        <td>{u.email}</td>
                        <td>{u.phone || 'N/A'}</td>
                        <td>
                          <span style={{
                            padding: '4px 8px',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: '600',
                            backgroundColor: u.role === 'admin' ? '#FCF3CF' : u.role === 'manager' ? '#EBF5FB' : u.role === 'kitchen_staff' ? '#E8F8F5' : '#FEF9E7',
                            color: u.role === 'admin' ? '#78281F' : u.role === 'manager' ? '#1B4F72' : u.role === 'kitchen_staff' ? '#0E6251' : '#7D6608'
                          }}>
                            {u.role.replace('_', ' ').toUpperCase()}
                          </span>
                        </td>
                        <td>
                          <button 
                            onClick={() => handleToggleStatus(u)}
                            style={{
                              border: 'none',
                              padding: '4px 10px',
                              borderRadius: '20px',
                              fontSize: '11px',
                              fontWeight: '700',
                              cursor: 'pointer',
                              backgroundColor: u.status === 'Active' ? '#D4EFDF' : '#FADBD8',
                              color: u.status === 'Active' ? '#196F3D' : '#943126',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <CheckCircle size={10} />
                            {u.status}
                          </button>
                        </td>
                        <td className="text-muted" style={{ fontSize: '12px' }}>
                          {u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A'}
                        </td>
                        <td>
                          <div style={{ position: 'relative', display: 'inline-block' }} onMouseLeave={() => setActiveDropdown(null)}>
                            <button 
                              onClick={() => setActiveDropdown(activeDropdown === u.id ? null : u.id)}
                              className="btn-secondary"
                              style={{ padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
                            >
                              <MoreVertical size={14} /> Actions
                            </button>
                            {activeDropdown === u.id && (
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
                                  onClick={() => { setSelectedUser(u); setIsEditOpen(true); setActiveDropdown(null); }}
                                  style={{ padding: '8px 12px', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#333' }}
                                >
                                  <Pencil size={12} /> Edit Details
                                </button>
                                <button 
                                  onClick={() => { setSelectedUser(u); setIsResetOpen(true); setActiveDropdown(null); }}
                                  style={{ padding: '8px 12px', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#7D6608' }}
                                >
                                  <Key size={12} /> Reset Password
                                </button>
                                <button 
                                  onClick={() => { handleToggleStatus(u); setActiveDropdown(null); }}
                                  style={{ padding: '8px 12px', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#196F3D' }}
                                >
                                  <CheckCircle size={12} /> Toggle Status
                                </button>
                                <button 
                                  onClick={() => { handleDeleteUser(u.id); setActiveDropdown(null); }}
                                  style={{ padding: '8px 12px', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#78281F', borderTop: '1px solid #FAF8F2' }}
                                >
                                  <Trash2 size={12} /> Delete User
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}

                    {filteredUsers.length === 0 && (
                      <tr>
                        <td colSpan="7" className="text-center text-muted" style={{ padding: '40px' }}>
                          No staff users match the query.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Add Modal */}
          {isAddOpen && (
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
              <div className="premium-card" style={{ width: '480px', padding: '30px', borderRadius: '15px', backgroundColor: '#fff', boxShadow: '0 8px 30px rgba(0,0,0,0.15)' }}>
                <h3 style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Create Staff Account</span>
                  <button onClick={() => setIsAddOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}>
                    <X size={18} />
                  </button>
                </h3>
                <form onSubmit={handleAddSubmit}>
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>Full Name *</label>
                    <input 
                      type="text" 
                      name="name" 
                      required 
                      value={formData.name} 
                      onChange={handleInputChange}
                      style={{ width: '100%', padding: '10px', border: '1px solid #EAE6DB', borderRadius: '8px' }}
                    />
                  </div>
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>Email Address *</label>
                    <input 
                      type="email" 
                      name="email" 
                      required 
                      value={formData.email} 
                      onChange={handleInputChange}
                      style={{ width: '100%', padding: '10px', border: '1px solid #EAE6DB', borderRadius: '8px' }}
                    />
                  </div>
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>Phone Number</label>
                    <input 
                      type="text" 
                      name="phone" 
                      value={formData.phone} 
                      onChange={handleInputChange}
                      style={{ width: '100%', padding: '10px', border: '1px solid #EAE6DB', borderRadius: '8px' }}
                    />
                  </div>
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>Access Role *</label>
                    <select 
                      name="role" 
                      value={formData.role} 
                      onChange={handleInputChange}
                      style={{ width: '100%', padding: '10px', border: '1px solid #EAE6DB', borderRadius: '8px', backgroundColor: '#fff' }}
                    >
                      <option value="manager">Manager</option>
                      <option value="kitchen_staff">Kitchen Staff</option>
                      <option value="delivery_staff">Delivery Staff</option>
                    </select>
                  </div>
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>Default Password *</label>
                    <input 
                      type="password" 
                      name="password" 
                      required 
                      value={formData.password} 
                      onChange={handleInputChange}
                      style={{ width: '100%', padding: '10px', border: '1px solid #EAE6DB', borderRadius: '8px' }}
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <button type="button" className="btn-secondary" onClick={() => setIsAddOpen(false)}>Cancel</button>
                    <button type="submit" className="page-action-btn" style={{ padding: '8px 16px', fontSize: '13px' }}>Create Account</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Edit Modal */}
          {isEditOpen && selectedUser && (
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
              <div className="premium-card" style={{ width: '480px', padding: '30px', borderRadius: '15px', backgroundColor: '#fff', boxShadow: '0 8px 30px rgba(0,0,0,0.15)' }}>
                <h3 style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Edit Staff Account</span>
                  <button onClick={() => setIsEditOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}>
                    <X size={18} />
                  </button>
                </h3>
                <form onSubmit={handleEditSubmit}>
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>Full Name *</label>
                    <input 
                      type="text" 
                      required 
                      value={selectedUser.name} 
                      onChange={(e) => setSelectedUser(prev => ({ ...prev, name: e.target.value }))}
                      style={{ width: '100%', padding: '10px', border: '1px solid #EAE6DB', borderRadius: '8px' }}
                    />
                  </div>
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>Email Address *</label>
                    <input 
                      type="email" 
                      required 
                      value={selectedUser.email} 
                      onChange={(e) => setSelectedUser(prev => ({ ...prev, email: e.target.value }))}
                      style={{ width: '100%', padding: '10px', border: '1px solid #EAE6DB', borderRadius: '8px' }}
                    />
                  </div>
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>Phone Number</label>
                    <input 
                      type="text" 
                      value={selectedUser.phone || ''} 
                      onChange={(e) => setSelectedUser(prev => ({ ...prev, phone: e.target.value }))}
                      style={{ width: '100%', padding: '10px', border: '1px solid #EAE6DB', borderRadius: '8px' }}
                    />
                  </div>
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>Access Role *</label>
                    <select 
                      value={selectedUser.role} 
                      onChange={(e) => setSelectedUser(prev => ({ ...prev, role: e.target.value }))}
                      style={{ width: '100%', padding: '10px', border: '1px solid #EAE6DB', borderRadius: '8px', backgroundColor: '#fff' }}
                    >
                      <option value="admin">Super Admin</option>
                      <option value="manager">Manager</option>
                      <option value="kitchen_staff">Kitchen Staff</option>
                      <option value="delivery_staff">Delivery Staff</option>
                    </select>
                  </div>
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>Status</label>
                    <select 
                      value={selectedUser.status} 
                      onChange={(e) => setSelectedUser(prev => ({ ...prev, status: e.target.value }))}
                      style={{ width: '100%', padding: '10px', border: '1px solid #EAE6DB', borderRadius: '8px', backgroundColor: '#fff' }}
                    >
                      <option value="Active">Active</option>
                      <option value="Disabled">Disabled</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <button type="button" className="btn-secondary" onClick={() => setIsEditOpen(false)}>Cancel</button>
                    <button type="submit" className="page-action-btn" style={{ padding: '8px 16px', fontSize: '13px' }}>Save Changes</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Reset Password Modal */}
          {isResetOpen && selectedUser && (
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
              <div className="premium-card" style={{ width: '400px', padding: '30px', borderRadius: '15px', backgroundColor: '#fff', boxShadow: '0 8px 30px rgba(0,0,0,0.15)' }}>
                <h3 style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Reset Password</span>
                  <button onClick={() => setIsResetOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}>
                    <X size={18} />
                  </button>
                </h3>
                <form onSubmit={handleResetSubmit}>
                  <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '15px' }}>
                    Set a new password for <strong>{selectedUser.name}</strong> ({selectedUser.email}).
                  </p>
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>New Password *</label>
                    <input 
                      type="password" 
                      required 
                      value={newPassword} 
                      onChange={(e) => setNewPassword(e.target.value)}
                      style={{ width: '100%', padding: '10px', border: '1px solid #EAE6DB', borderRadius: '8px' }}
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <button type="button" className="btn-secondary" onClick={() => setIsResetOpen(false)}>Cancel</button>
                    <button type="submit" className="page-action-btn" style={{ padding: '8px 16px', fontSize: '13px' }}>Reset Password</button>
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

export default UserManagement;
