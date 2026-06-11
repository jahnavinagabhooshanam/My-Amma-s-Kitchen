import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import AdminNavbar from '../../components/AdminNavbar';
import apiClient from '../../services/api';
import { User, CheckCircle, AlertTriangle, Upload, X, Save } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const EditProfile = () => {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    business_email: 'info@ammaskitchen.com',
    business_phone: '+91 72009 42596',
    business_address: '123 Food Street, Culinary District, FL 33021'
  });
  
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  // Image preview state
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await apiClient.get('/auth/me');
        if (response.data.user) {
          const user = response.data.user;
          setFormData({
            ...formData,
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            role: user.role || ''
          });
        }
      } catch (err) {
        console.error("Failed to fetch profile", err);
        // Fallback to auth context
        if (authUser) {
           setFormData({
            ...formData,
            name: authUser.name || '',
            email: authUser.email || '',
            phone: authUser.phone || '',
            role: authUser.role || ''
          });
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsSaving(true);
    
    // Basic validation
    if (!formData.name.trim() || !formData.email.trim()) {
      setErrorMsg("Name and Email are required fields.");
      setIsSaving(false);
      return;
    }

    try {
      // Simulate API call or call actual API to update profile
      await apiClient.post('/auth/complete-profile', {
        name: formData.name,
        email: formData.email,
        phone: formData.phone
      });
      
      setSuccessMsg("Profile details updated successfully!");
      setTimeout(() => {
        setSuccessMsg('');
      }, 4000);
      
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to update profile. Please try again.");
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
              <h2>Edit Profile</h2>
              <p>Update your personal and business contact information.</p>
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

          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center' }}>Loading profile data...</div>
          ) : (
            <div className="premium-card" style={{ padding: '30px', maxWidth: '800px', margin: '0 auto' }}>
              <form onSubmit={handleSubmit}>
                
                {/* Photo Upload Section */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '30px', paddingBottom: '20px', borderBottom: '1px solid var(--border-color)' }}>
                  <div style={{
                    width: '100px', height: '100px', borderRadius: '50%', backgroundColor: '#f0f0f0', border: '2px dashed #ccc',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative'
                  }}>
                    {imagePreview ? (
                      <img src={imagePreview} alt="Profile Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#888' }}>
                         <User size={30} />
                         <span style={{ fontSize: '10px', marginTop: '4px' }}>{(formData.name || 'A').charAt(0).toUpperCase()}</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 10px 0', fontSize: '15px' }}>Profile Photo</h4>
                    <label style={{
                      display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px',
                      backgroundColor: 'var(--smoke-color2)', border: '1px solid var(--border-color)', borderRadius: '6px',
                      cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: 'var(--title-color)'
                    }}>
                      <Upload size={14} /> Upload New Photo
                      <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                    </label>
                    <p style={{ margin: '8px 0 0 0', fontSize: '11px', color: '#888' }}>Recommended: Square image, max 2MB.</p>
                  </div>
                </div>

                {/* Form Fields */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                  
                  <div className="form-field">
                    <label>Full Name *</label>
                    <input 
                      type="text" 
                      value={formData.name} 
                      onChange={(e) => setFormData({...formData, name: e.target.value})} 
                      required 
                      style={{ width: '100%', padding: '10px', border: '1px solid #EAE6DB', borderRadius: '8px' }}
                    />
                  </div>
                  
                  <div className="form-field">
                    <label>Role</label>
                    <input 
                      type="text" 
                      value={formData.role.replace('_', ' ').toUpperCase()} 
                      disabled 
                      style={{ width: '100%', padding: '10px', border: '1px solid #EAE6DB', borderRadius: '8px', backgroundColor: '#f9f9f9', color: '#888', cursor: 'not-allowed' }}
                    />
                  </div>
                  
                  <div className="form-field">
                    <label>Personal Email *</label>
                    <input 
                      type="email" 
                      value={formData.email} 
                      onChange={(e) => setFormData({...formData, email: e.target.value})} 
                      required 
                      style={{ width: '100%', padding: '10px', border: '1px solid #EAE6DB', borderRadius: '8px' }}
                    />
                  </div>
                  
                  <div className="form-field">
                    <label>Personal Phone</label>
                    <input 
                      type="tel" 
                      value={formData.phone} 
                      onChange={(e) => setFormData({...formData, phone: e.target.value})} 
                      style={{ width: '100%', padding: '10px', border: '1px solid #EAE6DB', borderRadius: '8px' }}
                    />
                  </div>

                  <div className="form-field">
                    <label>Business Email</label>
                    <input 
                      type="email" 
                      value={formData.business_email} 
                      onChange={(e) => setFormData({...formData, business_email: e.target.value})} 
                      style={{ width: '100%', padding: '10px', border: '1px solid #EAE6DB', borderRadius: '8px' }}
                    />
                  </div>
                  
                  <div className="form-field">
                    <label>Business Phone</label>
                    <input 
                      type="tel" 
                      value={formData.business_phone} 
                      onChange={(e) => setFormData({...formData, business_phone: e.target.value})} 
                      style={{ width: '100%', padding: '10px', border: '1px solid #EAE6DB', borderRadius: '8px' }}
                    />
                  </div>

                  <div className="form-field" style={{ gridColumn: '1 / -1' }}>
                    <label>Business Address</label>
                    <textarea 
                      value={formData.business_address} 
                      onChange={(e) => setFormData({...formData, business_address: e.target.value})} 
                      style={{ width: '100%', padding: '10px', border: '1px solid #EAE6DB', borderRadius: '8px', minHeight: '80px', resize: 'vertical' }}
                    />
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
                    {isSaving ? 'Saving...' : <><Save size={16} /> Save Changes</>}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
