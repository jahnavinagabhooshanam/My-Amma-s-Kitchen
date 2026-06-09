import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import AdminNavbar from '../../components/AdminNavbar';
import apiClient from '../../services/api';
import { User, Mail, Phone, Shield, CheckCircle, Smartphone, Key, Briefcase, FileText, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const ViewProfile = () => {
  const navigate = useNavigate();
  const { user: authUser, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await apiClient.get('/auth/me');
        if (response.data.user) {
          setProfile(response.data.user);
        }
      } catch (err) {
        console.error("Failed to fetch profile", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const displayUser = profile || authUser;

  return (
    <div className="admin-wrapper">
      <AdminSidebar />
      <div className="admin-container">
        <AdminNavbar />

        <div className="admin-content">
          <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="page-title-area">
              <h2>My Profile</h2>
              <p>View your personal, business, and security information.</p>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                className="btn-secondary" 
                onClick={() => { logout(); navigate('/login'); }}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', color: '#E84C3D', border: '1px solid #E84C3D', backgroundColor: 'transparent' }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#FADBD8'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                <LogOut size={16} /> Logout
              </button>
              <button 
                className="page-action-btn" 
                onClick={() => navigate('/admin/profile/edit')}
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <User size={16} /> Edit Profile
              </button>
            </div>
          </div>

          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center' }}>Loading profile data...</div>
          ) : (
            <div className="premium-card" style={{ padding: '30px' }}>
              
              {/* Profile Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '30px', paddingBottom: '20px', borderBottom: '1px solid var(--border-color)' }}>
                <div style={{
                  width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'var(--theme-color)', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: 'bold',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                }}>
                  {(displayUser?.name || 'A').charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 style={{ margin: '0 0 5px 0', fontSize: '24px', color: 'var(--title-color)' }}>{displayUser?.name || 'Admin User'}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px', color: '#666', fontSize: '13px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Shield size={14} /> {displayUser?.role === 'admin' ? 'Super Admin' : 'Staff'}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Mail size={14} /> {displayUser?.email}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Phone size={14} /> {displayUser?.phone || 'Not provided'}</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
                
                {/* Personal Information */}
                <div>
                  <h4 style={{ fontSize: '16px', color: 'var(--title-color)', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px dashed #d8ebdE', paddingBottom: '8px' }}>
                    <User size={16} /> Personal Information
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '10px' }}>
                      <span style={{ color: '#888', fontWeight: '600' }}>Full Name</span>
                      <span>{displayUser?.name}</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '10px' }}>
                      <span style={{ color: '#888', fontWeight: '600' }}>Email</span>
                      <span>{displayUser?.email}</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '10px' }}>
                      <span style={{ color: '#888', fontWeight: '600' }}>Phone Number</span>
                      <span>{displayUser?.phone || 'N/A'}</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '10px' }}>
                      <span style={{ color: '#888', fontWeight: '600' }}>Role</span>
                      <span style={{ textTransform: 'capitalize' }}>{displayUser?.role?.replace('_', ' ')}</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '10px' }}>
                      <span style={{ color: '#888', fontWeight: '600' }}>Employee ID</span>
                      <span>EMP-{(displayUser?.id || 101).toString().padStart(4, '0')}</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '10px' }}>
                      <span style={{ color: '#888', fontWeight: '600' }}>Account Status</span>
                      <span style={{ color: 'var(--success-color)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle size={14} /> Active
                      </span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '10px' }}>
                      <span style={{ color: '#888', fontWeight: '600' }}>Joined Date</span>
                      <span>Jan 15, 2026</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '10px' }}>
                      <span style={{ color: '#888', fontWeight: '600' }}>Last Login</span>
                      <span>Today 10:30 AM</span>
                    </div>
                  </div>
                </div>

                {/* Business Information */}
                <div>
                  <h4 style={{ fontSize: '16px', color: 'var(--title-color)', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px dashed #d8ebdE', paddingBottom: '8px' }}>
                    <Briefcase size={16} /> Business Information
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '10px' }}>
                      <span style={{ color: '#888', fontWeight: '600' }}>Business Name</span>
                      <span>Ammulu's Kitchen</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '10px' }}>
                      <span style={{ color: '#888', fontWeight: '600' }}>Business Email</span>
                      <span>info@ammaskitchen.com</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '10px' }}>
                      <span style={{ color: '#888', fontWeight: '600' }}>Business Phone</span>
                      <span>+91 98765 43210</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '10px' }}>
                      <span style={{ color: '#888', fontWeight: '600' }}>Address</span>
                      <span>123 Food Street, Culinary District, FL 33021</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '10px' }}>
                      <span style={{ color: '#888', fontWeight: '600' }}>GST Number</span>
                      <span>22AAAAA0000A1Z5</span>
                    </div>
                  </div>
                </div>

                {/* Security Information */}
                <div>
                  <h4 style={{ fontSize: '16px', color: 'var(--title-color)', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px dashed #d8ebdE', paddingBottom: '8px' }}>
                    <Shield size={16} /> Security Information
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '10px' }}>
                      <span style={{ color: '#888', fontWeight: '600' }}>Last Password Change</span>
                      <span>May 01, 2026</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '10px' }}>
                      <span style={{ color: '#888', fontWeight: '600' }}>Role Permissions</span>
                      <span>Full Access</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '10px' }}>
                      <span style={{ color: '#888', fontWeight: '600' }}>Login Devices</span>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Smartphone size={14} /> iPhone 14 Pro (Active)</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><FileText size={14} /> Windows PC (Chrome)</span>
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ marginTop: '20px' }}>
                    <button 
                      onClick={() => navigate('/admin/profile/change-password')}
                      className="btn-secondary" 
                      style={{ padding: '8px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Key size={14} /> Change Password
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewProfile;
