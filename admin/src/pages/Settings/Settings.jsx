import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminNavbar from '../../components/AdminNavbar';
import apiClient from '../../services/api';
import '../../assets/styles/admin-style.css';
import { User, Lock, CheckCircle, AlertTriangle } from 'lucide-react';

const Settings = () => {
  const [profile, setProfile] = useState({
    name: 'Amma Admin',
    email: 'admin@ammaskitchen.com',
    phone: '+91 99999 99999'
  });

  const [passwords, setPasswords] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  const [sessionLogs] = useState([
    { time: "Today, 12:45 PM", event: "Admin Logged In", ip: "192.168.1.15", status: "Success" },
    { time: "Today, 11:30 AM", event: "Updated Storefront Banner", ip: "192.168.1.15", status: "Success" },
    { time: "Yesterday, 05:14 PM", event: "Attempted password reset", ip: "182.74.88.10", status: "Blocked" },
    { time: "May 29, 2026", event: "Modified Batter Variants", ip: "192.168.1.15", status: "Success" }
  ]);

  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const response = await apiClient.get('/auth/me');
        if (response.data.user) {
          setProfile(response.data.user);
        }
      } catch (err) {
        console.error("Failed to load admin profile info:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

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
      setSuccessMsg("Admin profile updated successfully!");
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to update profile details.");
    }
  };

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
      setSuccessMsg("Password changed successfully!");
      setPasswords({ current_password: '', new_password: '', confirm_password: '' });
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.error || "Incorrect current password. Verification failed.");
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
              <h2>Restaurant Configuration & Settings</h2>
              <p>Change your owner profile credentials, update passwords, view role permissions, and check session logs</p>
            </div>
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

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '25px', alignItems: 'start' }}>
            
            {/* Left Column Settings form */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
              
              {/* Profile card */}
              <div className="premium-card" style={{ padding: '30px', margin: 0 }}>
                <h3 style={{ fontSize: '18px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '20px', color: 'var(--title-color)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <User size={18} /> Owner Profile Info
                </h3>
                
                {loading ? (
                  <div style={{ height: '140px', backgroundColor: '#e2ebd9', borderRadius: '15px', animation: 'pulse 1.5s infinite' }} />
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
                          value={profile.phone}
                          onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                        />
                      </div>
                    </div>
                    <div>
                      <button type="submit" className="th-btn" style={{ border: 'none', padding: '10px 20px', cursor: 'pointer', borderRadius: '30px' }}>
                        Save Profile Details
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Password change card */}
              <div className="premium-card" style={{ padding: '30px', margin: 0 }}>
                <h3 style={{ fontSize: '18px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '20px', color: 'var(--title-color)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Lock size={18} /> Change Password Security
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
                    <button type="submit" className="th-btn style9" style={{ border: 'none', padding: '10px 20px', cursor: 'pointer', borderRadius: '30px' }}>
                      Update Account Password
                    </button>
                  </div>
                </form>
              </div>

            </div>

            {/* Right Column Roles & Logs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
              
              {/* Roles card */}
              <div className="premium-card" style={{ padding: '25px', margin: 0 }}>
                <h3 style={{ fontSize: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '15px', color: 'var(--title-color)' }}>
                  Active Roles & Permissions
                </h3>
                <div style={{ fontSize: '13px' }}>
                  <div><strong>Super Admin:</strong> Full write permissions across the console.</div>
                  <div style={{ color: 'var(--theme-color)', fontWeight: '700', marginTop: '10px' }}>Granted Actions:</div>
                  <ul style={{ paddingLeft: '20px', margin: '5px 0 0', lineHeight: '1.6' }} className="text-muted">
                    <li>Add / Modify / Delete food catalogs</li>
                    <li>Toggle user blocking states</li>
                    <li>Update dynamic storefront announcements</li>
                    <li>Configure coupons discounts</li>
                  </ul>
                </div>
              </div>

              {/* Login Session Logs */}
              <div className="premium-card" style={{ padding: '25px', margin: 0 }}>
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

          </div>
        </div>

        <div className="admin-footer">
          <div>&copy; 2026 <strong>Amma's Kitchen Admin</strong>. All Rights Reserved.</div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
