import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/authService';
import AuthLayout from './AuthLayout';
import { Camera, MapPin, User as UserIcon, Heart, Phone } from 'lucide-react';

const CompleteProfile = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    door_number: '',
    street_name: '',
    area: '',
    city: '',
    state: '',
    pincode: '',
    landmark: '',
    alternate_mobile: '',
    preference: 'Both'
  });

  const [profileImage, setProfileImage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Pre-fill user data if available
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        door_number: user.door_number || '',
        street_name: user.street_name || '',
        area: user.area || '',
        city: user.city || '',
        state: user.state || '',
        pincode: user.pincode || '',
        landmark: user.landmark || '',
        alternate_mobile: user.alternate_mobile || '',
        preference: user.preference || 'Both'
      }));
      if (user.profile_image) {
        setProfileImage(user.profile_image);
      }
    }
  }, [user]);

  // Removed history trap to allow back navigation

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const imgFormData = new FormData();
    imgFormData.append('file', file);

    setUploading(true);
    setError('');

    try {
      const response = await authService.uploadAvatar(imgFormData);
      setProfileImage(response.data.profile_image);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to upload profile picture.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate mandatory fields
    const requiredFields = ['name', 'email', 'phone'];
    for (const field of requiredFields) {
      if (!formData[field]) {
        setError(`Please fill out ${field}.`);
        return;
      }
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        profile_image: profileImage
      };
      await authService.completeProfile(payload);
      await refreshUser();
      navigate('/');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to save profile. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout isSingle={true}>
      <div className="auth-single-header">
        <h1 className="auth-title">Complete Your Profile</h1>
      </div>
      <form className="auth-form-single" onSubmit={handleSubmit} style={{ maxHeight: '65vh', overflowY: 'auto', paddingRight: '10px' }}>
        {error && <div className="alert alert-danger" style={{ backgroundColor: 'rgba(220, 53, 69, 0.1)', color: '#ff6b6b', border: '1px solid rgba(220, 53, 69, 0.2)', padding: '10px', borderRadius: '8px', marginBottom: '15px', fontSize: '0.9rem' }}>{error}</div>}

        {/* PROFILE PHOTO UPLOAD */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '30px' }}>
          <div style={{ position: 'relative', width: '100px', height: '100px' }}>
            {profileImage ? (
              <img 
                src={profileImage} 
                alt="Avatar" 
                style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary-color)' }} 
              />
            ) : (
              <div style={{ width: '100%', height: '100%', borderRadius: '50%', backgroundColor: 'rgba(255, 255, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed rgba(255, 255, 255, 0.3)' }}>
                <UserIcon size={36} style={{ color: 'rgba(255, 255, 255, 0.5)' }} />
              </div>
            )}
            <label style={{ position: 'absolute', bottom: '0', right: '0', backgroundColor: 'var(--primary-color)', color: 'white', borderRadius: '50%', padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageChange} />
              <Camera size={16} />
            </label>
          </div>
          <span style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.7)', marginTop: '8px' }}>
            {uploading ? 'Uploading picture...' : 'Upload Profile Photo'}
          </span>
        </div>

        {/* PERSONAL DETAILS SECTION */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', borderBottom: '1px solid rgba(255, 255, 255, 0.2)', paddingBottom: '6px' }}>
            <UserIcon size={18} style={{ color: 'var(--primary-color)' }} />
            <h3 style={{ fontSize: '1.1rem', margin: '0', color: '#fff', fontFamily: 'var(--font-serif)' }}>Personal Details</h3>
          </div>
          
          <div className="form-group-single">
            <label style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.9)', fontWeight: '600', display: 'block', marginBottom: '6px' }}>Full Name *</label>
            <input 
              type="text" 
              name="name"
              className="form-control" 
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div className="auth-flex-row">
            <div className="form-group-single" style={{ flex: '1' }}>
              <label style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.9)', fontWeight: '600', display: 'block', marginBottom: '6px' }}>Email *</label>
              <input 
                type="email" 
                name="email"
                className="form-control" 
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div className="form-group-single" style={{ flex: '1' }}>
              <label style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.9)', fontWeight: '600', display: 'block', marginBottom: '6px' }}>Mobile Number *</label>
              <input 
                type="text" 
                name="phone"
                className="form-control" 
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* ADDRESS SECTION */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', borderBottom: '1px solid rgba(255, 255, 255, 0.2)', paddingBottom: '6px' }}>
            <MapPin size={18} style={{ color: 'var(--primary-color)' }} />
            <h3 style={{ fontSize: '1.1rem', margin: '0', color: '#fff', fontFamily: 'var(--font-serif)' }}>Address</h3>
          </div>

          <div className="auth-flex-row">
            <div className="form-group-single" style={{ flex: '1' }}>
              <label style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.9)', fontWeight: '600', display: 'block', marginBottom: '6px' }}>Door Number</label>
              <input 
                type="text" 
                name="door_number"
                className="form-control" 
                value={formData.door_number}
                onChange={handleChange}
              />
            </div>
            <div className="form-group-single" style={{ flex: '2' }}>
              <label style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.9)', fontWeight: '600', display: 'block', marginBottom: '6px' }}>Street Name</label>
              <input 
                type="text" 
                name="street_name"
                className="form-control" 
                value={formData.street_name}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="auth-flex-row">
            <div className="form-group-single" style={{ flex: '1' }}>
              <label style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.9)', fontWeight: '600', display: 'block', marginBottom: '6px' }}>Area / Locality</label>
              <input 
                type="text" 
                name="area"
                className="form-control" 
                value={formData.area}
                onChange={handleChange}
              />
            </div>
            <div className="form-group-single" style={{ flex: '1' }}>
              <label style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.9)', fontWeight: '600', display: 'block', marginBottom: '6px' }}>City</label>
              <input 
                type="text" 
                name="city"
                className="form-control" 
                value={formData.city}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="auth-flex-row">
            <div className="form-group-single" style={{ flex: '1' }}>
              <label style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.9)', fontWeight: '600', display: 'block', marginBottom: '6px' }}>State</label>
              <input 
                type="text" 
                name="state"
                className="form-control" 
                value={formData.state}
                onChange={handleChange}
              />
            </div>
            <div className="form-group-single" style={{ flex: '1' }}>
              <label style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.9)', fontWeight: '600', display: 'block', marginBottom: '6px' }}>Pincode</label>
              <input 
                type="text" 
                name="pincode"
                className="form-control" 
                value={formData.pincode}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* DELIVERY DETAILS */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', borderBottom: '1px solid rgba(255, 255, 255, 0.2)', paddingBottom: '6px' }}>
            <Phone size={18} style={{ color: 'var(--primary-color)' }} />
            <h3 style={{ fontSize: '1.1rem', margin: '0', color: '#fff', fontFamily: 'var(--font-serif)' }}>Delivery Details</h3>
          </div>

          <div className="auth-flex-row">
            <div className="form-group-single" style={{ flex: '1' }}>
              <label style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.9)', fontWeight: '600', display: 'block', marginBottom: '6px' }}>Landmark</label>
              <input 
                type="text" 
                name="landmark"
                className="form-control" 
                value={formData.landmark}
                onChange={handleChange}
              />
            </div>
            <div className="form-group-single" style={{ flex: '1' }}>
              <label style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.9)', fontWeight: '600', display: 'block', marginBottom: '6px' }}>Alternate Mobile</label>
              <input 
                type="text" 
                name="alternate_mobile"
                className="form-control" 
                value={formData.alternate_mobile}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* PREFERENCE */}
        <div style={{ marginBottom: '30px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', borderBottom: '1px solid rgba(255, 255, 255, 0.2)', paddingBottom: '6px' }}>
            <Heart size={18} style={{ color: 'var(--primary-color)' }} />
            <h3 style={{ fontSize: '1.1rem', margin: '0', color: '#fff', fontFamily: 'var(--font-serif)' }}>Food Preference</h3>
          </div>

          <div className="auth-flex-row">
            {['Veg', 'Non-Veg', 'Both'].map((pref) => (
              <label 
                key={pref} 
                style={{ 
                  flex: '1', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '8px', 
                  padding: '12px', 
                  border: `1px solid ${formData.preference === pref ? 'var(--primary-color)' : 'rgba(255, 255, 255, 0.2)'}`, 
                  backgroundColor: formData.preference === pref ? 'rgba(200, 75, 49, 0.2)' : 'rgba(255, 255, 255, 0.05)', 
                  borderRadius: 'var(--radius-sm)', 
                  cursor: 'pointer', 
                  fontWeight: '600', 
                  color: formData.preference === pref ? '#fff' : 'rgba(255, 255, 255, 0.7)',
                  transition: 'all 0.2s'
                }}
              >
                <input 
                  type="radio" 
                  name="preference" 
                  value={pref} 
                  checked={formData.preference === pref} 
                  onChange={handleChange} 
                  style={{ accentColor: 'var(--primary-color)' }} 
                />
                {pref}
              </label>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '15px', marginBottom: '10px' }}>
          <button type="button" onClick={() => navigate(-1)} className="auth-submit-btn" style={{ flex: '1', backgroundColor: '#EAEAEA', color: 'var(--text-dark)' }}>
            Back
          </button>
          <button type="submit" className="auth-submit-btn" disabled={submitting || uploading} style={{ flex: '2' }}>
            {submitting ? 'Saving details...' : 'Save & Continue'}
          </button>
        </div>
      </form>
    </AuthLayout>
  );
};

export default CompleteProfile;
