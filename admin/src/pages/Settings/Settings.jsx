import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import AdminNavbar from '../../components/AdminNavbar';
import apiClient from '../../services/api';
import '../../assets/styles/admin-style.css';
import '../../assets/styles/tables.css';
import { 
  User, 
  Lock, 
  CheckCircle, 
  AlertTriangle,
  UserPlus, 
  Search, 
  MoreVertical, 
  Pencil, 
  Trash2, 
  Key, 
  X, 
  Save,
  Shield,
  ShieldAlert,
  Server,
  Settings as SettingsIcon,
  Download,
  Upload
} from 'lucide-react';

const Settings = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const activeTabParam = searchParams.get('tab') || 'rbac';

  const [activeTab, setActiveTab] = useState('rbac');

  // Common notifications
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Tab 1: Business Settings (Owner Profile) states
  const [profileLoading, setProfileLoading] = useState(true);
  const [profile, setProfile] = useState({ name: 'Amma Admin', email: 'admin@ammaskitchen.com', phone: '+91 99999 99999' });

  // Tab 2: Staff Management states
  const [users, setUsers] = useState([]);
  const [staffLoading, setStaffLoading] = useState(true);
  const [staffSearch, setStaffSearch] = useState('');
  const [staffRoleFilter, setStaffRoleFilter] = useState('All');
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', role: 'manager', password: '', status: 'Active' });
  const [newPassword, setNewPassword] = useState('');

  // Tab 4: Security Settings states
  const [passwords, setPasswords] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [sessionLogs] = useState([
    { time: "Today, 12:45 PM", event: "Admin Logged In", ip: "192.168.1.15", status: "Success" },
    { time: "Today, 11:30 AM", event: "Updated Storefront Banner", ip: "192.168.1.15", status: "Success" },
    { time: "Yesterday, 05:14 PM", event: "Attempted password reset", ip: "182.74.88.10", status: "Blocked" },
    { time: "May 29, 2026", event: "Modified Batter Variants", ip: "192.168.1.15", status: "Success" }
  ]);

  // Tab 5: System Settings states
  const [systemConfig, setSystemConfig] = useState({
    tax_rate: 5.0,
    currency: 'INR',
    timezone: 'Asia/Kolkata (IST)',
    maintenance_mode: false
  });

  // Tab 6: Backup simulated state
  const [backupFile, setBackupFile] = useState(null);

  useEffect(() => {
    setActiveTab(activeTabParam);
  }, [activeTabParam]);

  // Fetch Business Profile
  const fetchProfile = async () => {
    setProfileLoading(true);
    try {
      const response = await apiClient.get('/auth/me');
      if (response.data.user) {
        setProfile(response.data.user);
      }
    } catch (err) {
      console.error("Failed to load admin profile info:", err);
    } finally {
      setProfileLoading(false);
    }
  };

  // Fetch Staff Directory
  const fetchStaff = async () => {
    setStaffLoading(true);
    try {
      const response = await apiClient.get('/user-management/');
      setUsers(response.data);
    } catch (err) {
      console.error("Failed to load users:", err);
    } finally {
      setStaffLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'business') {
      fetchProfile();
    } else if (activeTab === 'staff') {
      fetchStaff();
    }
  }, [activeTab]);

  // Owner profile update submission
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');
    try {
      await apiClient.post('/auth/complete-profile', {
        name: profile.name,
        email: profile.email,
        phone: profile.phone
      });
      setSuccessMsg("Owner Business profile details updated successfully!");
      fetchProfile();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to update profile details.");
    }
  };

  // Staff creation
  const handleAddStaffSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      await apiClient.post('/user-management/', formData);
      setSuccessMsg(`Staff member "${formData.name}" added successfully.`);
      setIsAddOpen(false);
      setFormData({ name: '', email: '', phone: '', role: 'manager', password: '', status: 'Active' });
      fetchStaff();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.error || "Failed to create user.");
    }
  };

  // Staff edits
  const handleEditStaffSubmit = async (e) => {
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
      setSuccessMsg(`Staff account details updated successfully.`);
      setIsEditOpen(false);
      fetchStaff();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.error || "Failed to update user.");
    }
  };

  // Staff password reset
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

  // Staff status toggle
  const handleToggleStaffStatus = async (user) => {
    try {
      await apiClient.put(`/user-management/${user.id}/toggle-status`);
      setSuccessMsg(`Staff status toggled successfully.`);
      fetchStaff();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to toggle status.");
    }
  };

  // Delete staff
  const handleDeleteStaff = async (userId) => {
    if (!window.confirm("Permanently delete this staff account?")) return;
    try {
      await apiClient.delete(`/user-management/${userId}`);
      setSuccessMsg("Staff account deleted successfully.");
      fetchStaff();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.error || "Failed to delete user.");
    }
  };

  // Security password change
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');
    if (passwords.new_password !== passwords.confirm_password) {
      setErrorMsg("New password and confirm password do not match.");
      return;
    }
    try {
      await apiClient.post('/auth/change-password', {
        current_password: passwords.current_password,
        new_password: passwords.new_password
      });
      setSuccessMsg("Owner security password changed successfully!");
      setPasswords({ current_password: '', new_password: '', confirm_password: '' });
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.error || "Incorrect current password. Verification failed.");
    }
  };

  // System config save simulation
  const handleSystemSubmit = (e) => {
    e.preventDefault();
    setSuccessMsg("System configuration settings updated successfully.");
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  // Trigger backup simulation
  const triggerBackupDownload = () => {
    const backupData = {
      timestamp: new Date().toISOString(),
      creator: profile.email,
      system_config: systemConfig,
      backup_type: 'Full JSON dump'
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `amma_kitchen_db_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setSuccessMsg("System database JSON snapshot backup downloaded successfully.");
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleRestoreSimulation = (e) => {
    e.preventDefault();
    if (!backupFile) return;
    setSuccessMsg("Simulated restore successful! Database state reset back to backup timestamp.");
    setBackupFile(null);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  // Filter staff list
  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(staffSearch.toLowerCase()) || 
                          u.email.toLowerCase().includes(staffSearch.toLowerCase()) ||
                          (u.phone && u.phone.includes(staffSearch));
    const matchesRole = staffRoleFilter === 'All' || u.role === staffRoleFilter;
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
              <h2>Restaurant Configuration & Settings</h2>
              <p>
                {activeTab === 'business' ? 'Change your owner profile credentials and contact email.' :
                 activeTab === 'staff' ? 'Manage staff rosters, register kitchen/delivery accounts, and configure duty flags.' :
                 activeTab === 'rbac' ? 'Review role descriptions and read/write RBAC permissions.' :
                 activeTab === 'security' ? 'Update admin security passwords and review login session history.' :
                 activeTab === 'system' ? 'Modify operational variables, currency symbols, and tax rate percentages.' :
                 'Download system database snapshots or restore historical states.'}
              </p>
            </div>
            {activeTab === 'staff' && (
              <button className="page-action-btn" onClick={() => setIsAddOpen(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <UserPlus size={16} /> Add Staff Account
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

          {/* Section tabs */}
          <div style={{ display: 'flex', gap: '15px', borderBottom: '2px solid #EAE6DB', marginBottom: '25px', paddingBottom: '0', flexWrap: 'wrap' }}>
            {[
              { id: 'rbac', label: 'Role Management' },
              { id: 'staff', label: 'Staff Management' },
              { id: 'business', label: 'Business Settings' },
              { id: 'security', label: 'Security Settings' },
              { id: 'system', label: 'System Settings' },
              { id: 'backup', label: 'Backup & Restore' }
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => navigate(`/admin/settings?tab=${tab.id}`)}
                style={{
                  padding: '10px 20px', fontSize: '14px', fontWeight: '700', border: 'none', background: 'none',
                  borderBottom: activeTab === tab.id ? '3px solid var(--primary-color)' : '3px solid transparent',
                  color: activeTab === tab.id ? 'var(--primary-color)' : '#7E7A6B', cursor: 'pointer',
                  fontFamily: "'Outfit', sans-serif"
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="premium-card" style={{ padding: '30px', margin: 0 }}>

            {/* Tab 1: Business Settings (Owner Profile) */}
            {activeTab === 'business' && (
              <>
                <h3 style={{ fontSize: '18px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '20px', color: 'var(--title-color)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <User size={18} /> Owner Business Profile Info
                </h3>
                
                {profileLoading ? (
                  <div style={{ height: '180px', backgroundColor: '#e2ebd9', borderRadius: '15px', animation: 'pulse 1.5s infinite' }} />
                ) : (
                  <form onSubmit={handleProfileSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div className="form-field">
                      <label>Super Admin Name</label>
                      <input 
                        type="text" 
                        required
                        value={profile.name}
                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      />
                    </div>
                    <div className="form-grid">
                      <div className="form-field">
                        <label>Registered Email</label>
                        <input 
                          type="email" 
                          required
                          value={profile.email}
                          onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                        />
                      </div>
                      <div className="form-field">
                        <label>Operational Mobile</label>
                        <input 
                          type="text" 
                          value={profile.phone || ''}
                          onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                        />
                      </div>
                    </div>
                    <div>
                      <button type="submit" className="page-action-btn" style={{ border: 'none', padding: '10px 22px', cursor: 'pointer', borderRadius: '30px' }}>
                        Save Profile Details
                      </button>
                    </div>
                  </form>
                )}
              </>
            )}

            {/* Tab 2: Staff Management directory list */}
            {activeTab === 'staff' && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', marginBottom: '20px' }}>
                  <div className="navbar-search" style={{ margin: 0, width: '320px', border: '1px solid #EAE6DB', borderRadius: '10px', display: 'flex', alignItems: 'center' }}>
                    <Search size={16} style={{ marginRight: '8px', color: '#888' }} />
                    <input 
                      type="text" 
                      placeholder="Search staff by name or email..." 
                      value={staffSearch}
                      onChange={(e) => setStaffSearch(e.target.value)}
                      style={{ width: '100%' }}
                    />
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <label style={{ fontSize: '13px', fontWeight: '600' }}>Filter Role:</label>
                    <select 
                      value={staffRoleFilter} 
                      onChange={(e) => setStaffRoleFilter(e.target.value)}
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

                {staffLoading ? (
                  <div style={{ height: '240px', backgroundColor: '#e2ebd9', borderRadius: '15px', animation: 'pulse 1.5s infinite' }} />
                ) : (
                  <div className="responsive-table-wrapper" style={{ border: 'none', boxShadow: 'none' }}>
                    <table className="responsive-table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Phone</th>
                          <th>Role</th>
                          <th>Status</th>
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
                                padding: '4px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '600',
                                backgroundColor: u.role === 'admin' ? '#FCF3CF' : u.role === 'manager' ? '#EBF5FB' : u.role === 'kitchen_staff' ? '#E8F8F5' : '#FEF9E7',
                                color: u.role === 'admin' ? '#78281F' : u.role === 'manager' ? '#1B4F72' : u.role === 'kitchen_staff' ? '#0E6251' : '#7D6608'
                              }}>
                                {u.role.replace('_', ' ').toUpperCase()}
                              </span>
                            </td>
                            <td>
                              <button 
                                onClick={() => handleToggleStaffStatus(u)}
                                style={{
                                  border: 'none', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700',
                                  cursor: 'pointer', backgroundColor: u.status === 'Active' ? '#D4EFDF' : '#FADBD8',
                                  color: u.status === 'Active' ? '#196F3D' : '#943126', display: 'inline-flex', alignItems: 'center', gap: '4px'
                                }}
                              >
                                {u.status}
                              </button>
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
                                    position: 'absolute', right: 0, top: '30px', backgroundColor: '#fff', border: '1px solid #EAE6DB',
                                    borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 100, minWidth: '150px',
                                    display: 'flex', flexDirection: 'column', padding: '4px 0'
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
                                      onClick={() => { handleDeleteStaff(u.id); setActiveDropdown(null); }}
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
                            <td colSpan="6" className="text-center text-muted" style={{ padding: '40px' }}>No staff users match filters.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}

            {/* Tab 3: RBAC Roles and Permissions Grid */}
            {activeTab === 'rbac' && (
              <>
                <h3 style={{ fontSize: '18px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '20px', color: 'var(--title-color)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Shield size={18} /> Role-Based Access Controls (RBAC)
                </h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
                  <div style={{ border: '1px solid #EAE6DB', borderRadius: '12px', padding: '20px', backgroundColor: '#EDF3F0' }}>
                    <h4 style={{ color: '#1b3d2b', borderBottom: '1px dashed #d8ebdE', paddingBottom: '8px', marginBottom: '10px' }}>Super Admin</h4>
                    <p style={{ fontSize: '12px', color: '#555', lineHeight: '1.4' }}>
                      Has unrestricted root read and write permissions across the entire management ERP panel, including financial ledger writes, user account creations, and database backup controls.
                    </p>
                  </div>
                  <div style={{ border: '1px solid #EAE6DB', borderRadius: '12px', padding: '20px', backgroundColor: '#EDF3F0' }}>
                    <h4 style={{ color: '#1b3d2b', borderBottom: '1px dashed #d8ebdE', paddingBottom: '8px', marginBottom: '10px' }}>Manager</h4>
                    <p style={{ fontSize: '12px', color: '#555', lineHeight: '1.4' }}>
                      Allowed full catalog modifications, coupons creation, dispatch controls, bulk order schedules, and inventory listings. Access to payroll registers, system settings and backup downloads is restricted.
                    </p>
                  </div>
                  <div style={{ border: '1px solid #EAE6DB', borderRadius: '12px', padding: '20px', backgroundColor: '#EDF3F0' }}>
                    <h4 style={{ color: '#1b3d2b', borderBottom: '1px dashed #d8ebdE', paddingBottom: '8px', marginBottom: '10px' }}>Kitchen Staff</h4>
                    <p style={{ fontSize: '12px', color: '#555', lineHeight: '1.4' }}>
                      Operational access restricted to the Orders tab (Ready to Eat & Cook checklist queues), Batter Production tracker log updates, and Inventory item alerts. Cannot modify product pricing or access financial data.
                    </p>
                  </div>
                  <div style={{ border: '1px solid #EAE6DB', borderRadius: '12px', padding: '20px', backgroundColor: '#EDF3F0' }}>
                    <h4 style={{ color: '#1b3d2b', borderBottom: '1px dashed #d8ebdE', paddingBottom: '8px', marginBottom: '10px' }}>Delivery Staff</h4>
                    <p style={{ fontSize: '12px', color: '#555', lineHeight: '1.4' }}>
                      Restricted to Assigned Delivery Queue dashboard views, active Google Maps route coordinates, and customer telephone / WhatsApp chat triggers. Cannot access settings or core catalog lists.
                    </p>
                  </div>
                </div>
              </>
            )}

            {/* Tab 4: Security Settings */}
            {/* Global Business Contact config block */}
            {activeTab === 'security' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 400px), 1fr))', gap: '30px', alignItems: 'start' }}>
                {/* Password card */}
                <div>
                  <h3 style={{ fontSize: '18px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '20px', color: 'var(--title-color)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Lock size={18} /> Update Account Password
                  </h3>
                  <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div className="form-field">
                      <label>Current Password *</label>
                      <input 
                        type="password" 
                        required
                        value={passwords.current_password}
                        onChange={(e) => setPasswords({ ...passwords, current_password: e.target.value })}
                        placeholder="••••••••"
                      />
                    </div>
                    <div className="form-grid">
                      <div className="form-field">
                        <label>New Password *</label>
                        <input 
                          type="password" 
                          required
                          value={passwords.new_password}
                          onChange={(e) => setPasswords({ ...passwords, new_password: e.target.value })}
                          placeholder="••••••••"
                        />
                      </div>
                      <div className="form-field">
                        <label>Confirm Password *</label>
                        <input 
                          type="password" 
                          required
                          value={passwords.confirm_password}
                          onChange={(e) => setPasswords({ ...passwords, confirm_password: e.target.value })}
                          placeholder="••••••••"
                        />
                      </div>
                    </div>
                    <div>
                      <button type="submit" className="page-action-btn" style={{ border: 'none', padding: '10px 22px', cursor: 'pointer', borderRadius: '30px' }}>
                        Change Password
                      </button>
                    </div>
                  </form>
                </div>

                {/* Session logs */}
                <div style={{ borderLeft: '1px solid #EAE6DB', paddingLeft: '30px' }}>
                  <h3 style={{ fontSize: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '15px', color: 'var(--title-color)' }}>
                    Active Session Activity Logs
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {sessionLogs.map((log, i) => (
                      <div key={i} style={{ fontSize: '12px', borderBottom: '1px solid var(--smoke-color3)', paddingBottom: '6px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700' }}>
                          <span>{log.event}</span>
                          <span className={`badge-status ${log.status === 'Success' ? 'approved' : 'inactive'}`} style={{ padding: '2px 6px', fontSize: '9px' }}>{log.status}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#888', marginTop: '2px', fontSize: '11px' }}>
                          <span>IP: {log.ip}</span>
                          <span>{log.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tab 5: System Settings */}
            {activeTab === 'system' && (
              <>
                <h3 style={{ fontSize: '18px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '20px', color: 'var(--title-color)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <SettingsIcon size={18} /> System Configurations
                </h3>
                <form onSubmit={handleSystemSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div className="form-grid">
                    <div className="form-field">
                      <label>Operational Currency Symbol</label>
                      <select 
                        value={systemConfig.currency} 
                        onChange={(e) => setSystemConfig({ ...systemConfig, currency: e.target.value })}
                        style={{ height: '38px', background: '#fff', width: '100%', padding: '8px', border: '1px solid #EAE6DB', borderRadius: '8px' }}
                      >
                        <option value="INR">Indian Rupee (₹)</option>
                        <option value="USD">US Dollar ($)</option>
                      </select>
                    </div>
                    <div className="form-field">
                      <label>Default GST/Tax Percentage (%)</label>
                      <input 
                        type="number" 
                        step="0.01"
                        value={systemConfig.tax_rate}
                        onChange={(e) => setSystemConfig({ ...systemConfig, tax_rate: parseFloat(e.target.value) })}
                      />
                    </div>
                  </div>

                  <div className="form-field">
                    <label>System Timezone</label>
                    <input 
                      type="text" 
                      value={systemConfig.timezone}
                      onChange={(e) => setSystemConfig({ ...systemConfig, timezone: e.target.value })}
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
                    <input 
                      type="checkbox" 
                      id="maintenance_mode" 
                      checked={systemConfig.maintenance_mode}
                      onChange={(e) => setSystemConfig({ ...systemConfig, maintenance_mode: e.target.checked })}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                    <label htmlFor="maintenance_mode" style={{ fontSize: '13px', fontWeight: '700', cursor: 'pointer', color: 'var(--title-color)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      Enable ERP System Maintenance Mode (Disables customer orders) <ShieldAlert size={14} style={{ color: '#E74C3C' }} />
                    </label>
                  </div>

                  <div style={{ marginTop: '10px' }}>
                    <button type="submit" className="page-action-btn" style={{ padding: '10px 22px', borderRadius: '30px' }}>
                      Update System Config
                    </button>
                  </div>
                </form>
              </>
            )}

            {/* Tab 6: Backup & Restore */}
            {activeTab === 'backup' && (
              <>
                <h3 style={{ fontSize: '18px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '20px', color: 'var(--title-color)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Server size={18} /> Database Backup Utility
                </h3>
                {/* Brand Profile Edit Form block */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '35px' }}>
                  <div>
                    <h4 style={{ margin: '0 0 10px', fontSize: '14px', color: 'var(--title-color)' }}>Download JSON Database Dump</h4>
                    <p style={{ fontSize: '12px', color: '#666', lineHeight: '1.5', marginBottom: '15px' }}>
                      Download a complete snapshot of all products catalogs, user registries, operational configs, and bulk catering lists as a raw JSON backup file.
                    </p>
                    <button onClick={triggerBackupDownload} className="page-action-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 22px' }}>
                      <Download size={14} /> Download System Backup
                    </button>
                  </div>

                  <div style={{ borderLeft: '1px solid #EAE6DB', paddingLeft: '35px' }}>
                    <h4 style={{ margin: '0 0 10px', fontSize: '14px', color: 'var(--title-color)' }}>Restore Database Snapshot</h4>
                    <p style={{ fontSize: '12px', color: '#666', lineHeight: '1.5', marginBottom: '15px' }}>
                      Upload a previously downloaded JSON database backup file to restore system settings. <strong style={{ color: '#E74C3C' }}>Warning: This overrides all existing records.</strong>
                    </p>
                    
                    <form onSubmit={handleRestoreSimulation} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <input 
                        type="file" 
                        accept=".json"
                        onChange={(e) => setBackupFile(e.target.files[0])}
                        style={{ fontSize: '12px' }}
                      />
                      <div>
                        <button type="submit" disabled={!backupFile} className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: backupFile ? '#FCF3CF' : '#FAF8F2', color: backupFile ? '#7D6608' : '#aaa', cursor: backupFile ? 'pointer' : 'not-allowed' }}>
                          <Upload size={14} /> Restore Snapshot
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </>
            )}

          </div>
        </div>

        {/* Add Staff Modal */}
        {isAddOpen && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
            <div className="premium-card" style={{ width: '480px', padding: '30px', borderRadius: '15px', backgroundColor: '#fff', boxShadow: '0 8px 30px rgba(0,0,0,0.15)' }}>
              <h3 style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Create Staff Account</span>
                <button onClick={() => setIsAddOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}>
                  <X size={18} />
                </button>
              </h3>
              <form onSubmit={handleAddStaffSubmit}>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>Full Name *</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.name} 
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    style={{ width: '100%', padding: '10px', border: '1px solid #EAE6DB', borderRadius: '8px' }}
                  />
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>Email Address *</label>
                  <input 
                    type="email" 
                    required 
                    value={formData.email} 
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    style={{ width: '100%', padding: '10px', border: '1px solid #EAE6DB', borderRadius: '8px' }}
                  />
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>Phone Number</label>
                  <input 
                    type="text" 
                    value={formData.phone} 
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    style={{ width: '100%', padding: '10px', border: '1px solid #EAE6DB', borderRadius: '8px' }}
                  />
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>Access Role *</label>
                  <select 
                    value={formData.role} 
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
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
                    required 
                    value={formData.password} 
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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

        {/* Edit Staff Modal */}
        {isEditOpen && selectedUser && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
            <div className="premium-card" style={{ width: '480px', padding: '30px', borderRadius: '15px', backgroundColor: '#fff', boxShadow: '0 8px 30px rgba(0,0,0,0.15)' }}>
              <h3 style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Edit Staff Account</span>
                <button onClick={() => setIsEditOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}>
                  <X size={18} />
                </button>
              </h3>
              <form onSubmit={handleEditStaffSubmit}>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>Full Name *</label>
                  <input 
                    type="text" 
                    required 
                    value={selectedUser.name} 
                    onChange={(e) => setSelectedUser({ ...selectedUser, name: e.target.value })}
                    style={{ width: '100%', padding: '10px', border: '1px solid #EAE6DB', borderRadius: '8px' }}
                  />
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>Email Address *</label>
                  <input 
                    type="email" 
                    required 
                    value={selectedUser.email} 
                    onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })}
                    style={{ width: '100%', padding: '10px', border: '1px solid #EAE6DB', borderRadius: '8px' }}
                  />
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>Phone Number</label>
                  <input 
                    type="text" 
                    value={selectedUser.phone || ''} 
                    onChange={(e) => setSelectedUser({ ...selectedUser, phone: e.target.value })}
                    style={{ width: '100%', padding: '10px', border: '1px solid #EAE6DB', borderRadius: '8px' }}
                  />
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>Access Role *</label>
                  <select 
                    value={selectedUser.role} 
                    onChange={(e) => setSelectedUser({ ...selectedUser, role: e.target.value })}
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
                    onChange={(e) => setSelectedUser({ ...selectedUser, status: e.target.value })}
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
  );
};

export default Settings;
