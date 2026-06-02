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
    const requiredFields = [
      'name', 'email', 'phone', 
      'door_number', 'street_name', 'area', 'city', 'state', 'pincode'
    ];
    for (const field of requiredFields) {
      if (!formData[field]) {
        setError(`Please fill out all mandatory fields. Missing: ${field.replace('_', ' ')}`);
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
    <AuthLayout
      title="Complete Your Profile"
      subtitle="Just one more step! We need your delivery address and details to serve you better."
    >
      <form className="auth-form" onSubmit={handleSubmit} style={{ maxHeight: '80vh', overflowY: 'auto', paddingRight: '10px' }}>
        {error && <div className="alert alert-danger">{error}</div>}

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
              <div style={{ width: '100%', height: '100%', borderRadius: '50%', backgroundColor: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed var(--border-color)' }}>
                <UserIcon size={36} style={{ color: 'var(--text-muted)' }} />
              </div>
            )}
            <label style={{ position: 'absolute', bottom: '0', right: '0', backgroundColor: 'var(--primary-color)', color: 'white', borderRadius: '50%', padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageChange} />
              <Camera size={16} />
            </label>
          </div>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '8px' }}>
            {uploading ? 'Uploading picture...' : 'Upload Profile Photo'}
          </span>
        </div>

        {/* PERSONAL DETAILS SECTION */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
            <UserIcon size={18} style={{ color: 'var(--primary-color)' }} />
            <h3 style={{ fontSize: '1.1rem', margin: '0', color: 'var(--primary-dark)', fontFamily: 'var(--font-serif)' }}>Personal Details</h3>
          </div>
          
          <div className="form-group">
            <label style={{ fontSize: '0.85rem', color: 'var(--text-dark)', fontWeight: '600', display: 'block', marginBottom: '6px' }}>Full Name *</label>
            <input 
              type="text" 
              name="name"
              className="form-control" 
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Rajesh Kumar"
            />
          </div>

          <div style={{ display: 'flex', gap: '15px' }}>
            <div className="form-group" style={{ flex: '1' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-dark)', fontWeight: '600', display: 'block', marginBottom: '6px' }}>Email *</label>
              <input 
                type="email" 
                name="email"
                className="form-control" 
                value={formData.email}
                onChange={handleChange}
                placeholder="e.g. rajesh@example.com"
              />
            </div>
            <div className="form-group" style={{ flex: '1' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-dark)', fontWeight: '600', display: 'block', marginBottom: '6px' }}>Mobile Number *</label>
              <input 
                type="text" 
                name="phone"
                className="form-control" 
                value={formData.phone}
                onChange={handleChange}
                placeholder="e.g. 9876543210"
              />
            </div>
          </div>
        </div>

        {/* ADDRESS SECTION */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
            <MapPin size={18} style={{ color: 'var(--primary-color)' }} />
            <h3 style={{ fontSize: '1.1rem', margin: '0', color: 'var(--primary-dark)', fontFamily: 'var(--font-serif)' }}>Address</h3>
          </div>

          <div style={{ display: 'flex', gap: '15px' }}>
            <div className="form-group" style={{ flex: '1' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-dark)', fontWeight: '600', display: 'block', marginBottom: '6px' }}>Door Number *</label>
              <input 
                type="text" 
                name="door_number"
                className="form-control" 
                value={formData.door_number}
                onChange={handleChange}
                placeholder="e.g. Flat 301, 3rd Floor"
              />
            </div>
            <div className="form-group" style={{ flex: '2' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-dark)', fontWeight: '600', display: 'block', marginBottom: '6px' }}>Street Name *</label>
              <input 
                type="text" 
                name="street_name"
                className="form-control" 
                value={formData.street_name}
                onChange={handleChange}
                placeholder="e.g. 2nd Cross Street, Gandhi Nagar"
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '15px' }}>
            <div className="form-group" style={{ flex: '1' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-dark)', fontWeight: '600', display: 'block', marginBottom: '6px' }}>Area / Locality *</label>
              <input 
                type="text" 
                name="area"
                className="form-control" 
                value={formData.area}
                onChange={handleChange}
                placeholder="e.g. Adyar"
              />
            </div>
            <div className="form-group" style={{ flex: '1' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-dark)', fontWeight: '600', display: 'block', marginBottom: '6px' }}>City *</label>
              <input 
                type="text" 
                name="city"
                className="form-control" 
                value={formData.city}
                onChange={handleChange}
                placeholder="e.g. Chennai"
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '15px' }}>
            <div className="form-group" style={{ flex: '1' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-dark)', fontWeight: '600', display: 'block', marginBottom: '6px' }}>State *</label>
              <input 
                type="text" 
                name="state"
                className="form-control" 
                value={formData.state}
                onChange={handleChange}
                placeholder="e.g. Tamil Nadu"
              />
            </div>
            <div className="form-group" style={{ flex: '1' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-dark)', fontWeight: '600', display: 'block', marginBottom: '6px' }}>Pincode *</label>
              <input 
                type="text" 
                name="pincode"
                className="form-control" 
                value={formData.pincode}
                onChange={handleChange}
                placeholder="e.g. 600020"
              />
            </div>
          </div>
        </div>

        {/* DELIVERY DETAILS */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
            <Phone size={18} style={{ color: 'var(--primary-color)' }} />
            <h3 style={{ fontSize: '1.1rem', margin: '0', color: 'var(--primary-dark)', fontFamily: 'var(--font-serif)' }}>Delivery Details</h3>
          </div>

          <div style={{ display: 'flex', gap: '15px' }}>
            <div className="form-group" style={{ flex: '1' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-dark)', fontWeight: '600', display: 'block', marginBottom: '6px' }}>Landmark</label>
              <input 
                type="text" 
                name="landmark"
                className="form-control" 
                value={formData.landmark}
                onChange={handleChange}
                placeholder="e.g. Near Vinayagar Temple"
              />
            </div>
            <div className="form-group" style={{ flex: '1' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-dark)', fontWeight: '600', display: 'block', marginBottom: '6px' }}>Alternate Mobile</label>
              <input 
                type="text" 
                name="alternate_mobile"
                className="form-control" 
                value={formData.alternate_mobile}
                onChange={handleChange}
                placeholder="e.g. 9876543211"
              />
            </div>
          </div>
        </div>

        {/* PREFERENCE */}
        <div style={{ marginBottom: '30px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
            <Heart size={18} style={{ color: 'var(--primary-color)' }} />
            <h3 style={{ fontSize: '1.1rem', margin: '0', color: 'var(--primary-dark)', fontFamily: 'var(--font-serif)' }}>Food Preference</h3>
          </div>

          <div style={{ display: 'flex', gap: '15px' }}>
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
                  border: `1px solid ${formData.preference === pref ? 'var(--primary-color)' : 'var(--border-color)'}`, 
                  backgroundColor: formData.preference === pref ? 'rgba(200, 75, 49, 0.05)' : 'var(--bg-secondary)', 
                  borderRadius: 'var(--radius-sm)', 
                  cursor: 'pointer', 
                  fontWeight: '600', 
                  color: formData.preference === pref ? 'var(--primary-color)' : 'var(--text-dark)',
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

        <button type="submit" className="auth-submit-btn" disabled={submitting || uploading} style={{ marginBottom: '30px' }}>
          {submitting ? 'Saving details...' : 'Save & Continue'}
        </button>
      </form>
    </AuthLayout>
  );
};

export default CompleteProfile;
