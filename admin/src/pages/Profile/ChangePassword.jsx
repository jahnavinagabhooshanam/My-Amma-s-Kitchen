import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import AdminNavbar from '../../components/AdminNavbar';
import apiClient from '../../services/api';
import { Key, CheckCircle, AlertTriangle, X, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const ChangePassword = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [forceLogout, setForceLogout] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Password strength calculation
  const calculateStrength = (password) => {
    let score = 0;
    if (!password) return { score: 0, label: '', color: 'transparent' };
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    if (score <= 2) return { score, label: 'Weak', color: '#E74C3C' }; // Red
    if (score <= 4) return { score, label: 'Medium', color: '#F39C12' }; // Yellow
    return { score, label: 'Strong', color: '#27AE60' }; // Green
  };

  const strength = calculateStrength(formData.newPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (formData.newPassword !== formData.confirmPassword) {
      setErrorMsg("New password and confirm password do not match.");
      return;
    }

    if (strength.score < 5) {
      setErrorMsg("New password does not meet all security requirements.");
      return;
    }

    setIsSaving(true);
    
    try {
      // Simulate API call
      await apiClient.post('/auth/change-password', {
        current_password: formData.currentPassword,
        new_password: formData.newPassword,
        force_logout: forceLogout
      });
      
      setSuccessMsg("Password Updated Successfully");
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      
      if (forceLogout) {
        setTimeout(() => {
          logout();
          navigate('/login');
        }, 2000);
      } else {
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.error || "Incorrect current password or server error.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="admin-wrapper">
      <AdminSidebar />
      <div className="admin-container">
        <AdminNavbar />

        <div className="admin-content">
          <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="page-title-area">
              <h2>Change Password</h2>
              <p>Ensure your account is using a long, random password to stay secure.</p>
            </div>
            <button 
              className="btn-secondary" 
              onClick={() => navigate('/admin/profile/view')}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <X size={16} /> Cancel
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

          <div className="premium-card" style={{ padding: '30px', maxWidth: '600px', margin: '0 auto' }}>
            <form onSubmit={handleSubmit}>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px', paddingBottom: '15px', borderBottom: '1px solid var(--border-color)' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#f0f4f8', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}>
                  <Lock size={20} />
                </div>
                <h3 style={{ margin: 0, fontSize: '18px', color: 'var(--title-color)' }}>Update Security Credentials</h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className="form-field">
                  <label>Current Password *</label>
                  <input 
                    type="password" 
                    value={formData.currentPassword} 
                    onChange={(e) => setFormData({...formData, currentPassword: e.target.value})} 
                    required 
                    placeholder="Enter current password"
                    style={{ width: '100%', padding: '10px', border: '1px solid #EAE6DB', borderRadius: '8px' }}
                  />
                </div>
                
                <div className="form-field">
                  <label>New Password *</label>
                  <input 
                    type="password" 
                    value={formData.newPassword} 
                    onChange={(e) => setFormData({...formData, newPassword: e.target.value})} 
                    required 
                    placeholder="Enter new password"
                    style={{ width: '100%', padding: '10px', border: '1px solid #EAE6DB', borderRadius: '8px' }}
                  />
                  
                  {/* Password Strength Meter */}
                  {formData.newPassword && (
                    <div style={{ marginTop: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', marginBottom: '4px' }}>
                        <span style={{ color: '#666' }}>Password Strength:</span>
                        <span style={{ fontWeight: 'bold', color: strength.color }}>{strength.label}</span>
                      </div>
                      <div style={{ height: '6px', width: '100%', backgroundColor: '#eee', borderRadius: '3px', overflow: 'hidden', display: 'flex' }}>
                        <div style={{ height: '100%', width: `${(strength.score / 5) * 100}%`, backgroundColor: strength.color, transition: 'all 0.3s' }}></div>
                      </div>
                    </div>
                  )}

                  <ul style={{ margin: '10px 0 0 0', paddingLeft: '20px', fontSize: '11px', color: '#666', lineHeight: '1.6' }}>
                    <li style={{ color: formData.newPassword.length >= 8 ? '#27AE60' : '#666' }}>Minimum 8 characters</li>
                    <li style={{ color: /[A-Z]/.test(formData.newPassword) ? '#27AE60' : '#666' }}>At least one uppercase character</li>
                    <li style={{ color: /[a-z]/.test(formData.newPassword) ? '#27AE60' : '#666' }}>At least one lowercase character</li>
                    <li style={{ color: /[0-9]/.test(formData.newPassword) ? '#27AE60' : '#666' }}>At least one number</li>
                    <li style={{ color: /[^A-Za-z0-9]/.test(formData.newPassword) ? '#27AE60' : '#666' }}>At least one special character</li>
                  </ul>
                </div>
                
                <div className="form-field">
                  <label>Confirm New Password *</label>
                  <input 
                    type="password" 
                    value={formData.confirmPassword} 
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})} 
                    required 
                    placeholder="Re-enter new password"
                    style={{ width: '100%', padding: '10px', border: '1px solid #EAE6DB', borderRadius: '8px' }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px', padding: '15px', backgroundColor: '#f9f9f9', border: '1px solid #EAE6DB', borderRadius: '8px' }}>
                  <input 
                    type="checkbox" 
                    id="forceLogout" 
                    checked={forceLogout}
                    onChange={(e) => setForceLogout(e.target.checked)}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <label htmlFor="forceLogout" style={{ fontSize: '13px', fontWeight: '600', cursor: 'pointer', color: 'var(--title-color)' }}>
                    Force logout from all devices
                  </label>
                </div>
              </div>

              <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'flex-end', gap: '15px' }}>
                <button 
                  type="button" 
                  className="btn-secondary" 
                  onClick={() => navigate('/admin/profile/view')}
                  style={{ padding: '10px 20px', borderRadius: '30px' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="page-action-btn" 
                  disabled={isSaving}
                  style={{ padding: '10px 20px', borderRadius: '30px', display: 'flex', alignItems: 'center', gap: '8px', opacity: isSaving ? 0.7 : 1 }}
                >
                  {isSaving ? 'Updating...' : <><Key size={16} /> Update Password</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
