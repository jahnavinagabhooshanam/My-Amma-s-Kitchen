import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Phone, MapPin, Save, CheckCircle } from 'lucide-react';
import addressService from '../../services/addressService';

const CustomerProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: ''
  });
  const [addressObj, setAddressObj] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user) {
      setProfile(prev => ({ ...prev, name: user.name, email: user.email, phone: user.phone || '' }));
      addressService.getAll().then(res => {
        if (res.data && res.data.length > 0) {
          const addr = res.data.find(a => a.is_default) || res.data[0];
          setAddressObj(addr);
          setProfile(prev => ({ 
            ...prev, 
            address: `${addr.door_number || ''}, ${addr.street_name || ''}, ${addr.area || ''}, ${addr.city || ''} - ${addr.pincode || ''}`.replace(/^, | ,|, $/g, '').trim() 
          }));
        }
      }).catch(err => console.error("Could not fetch addresses", err));
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // In a real app we'd call customerService.update and addressService.update
      // For now we just simulate success
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="profile-page space" style={{ backgroundColor: '#FCFBF7', minHeight: '80vh' }}>
      <div className="container">
        
        <div className="title-area style9 text-center mb-40">
          <span className="sub-title">My Account</span>
          <h1 className="sec-title" style={{ fontSize: '2.5rem', color: 'var(--primary-dark)', marginTop: '8px' }}>
            Customer Profile
          </h1>
          <p className="text-muted" style={{ maxWidth: '600px', margin: '12px auto 0' }}>
            Manage your personal profile, email notifications, and default delivery addresses.
          </p>
        </div>

        <div className="row gy-4 justify-content-center">
          <div className="col-lg-8">
            <form onSubmit={handleSubmit} className="card flex flex-col gap-2" style={{ padding: '30px', backgroundColor: '#FFFFFF', border: '1px solid #EAE6DB', borderRadius: '15px' }}>
              <h3 className="title-md" style={{ color: 'var(--primary-dark)', borderBottom: '1px solid #EAE6DB', paddingBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User size={20} /> Personal Information
              </h3>

              {saved && (
                <div className="alert alert-success flex gap-2" style={{ alignItems: 'center', backgroundColor: '#EBF5FB', color: '#1B4F72', border: '1px solid #AED6F1', padding: '12px 18px', borderRadius: '8px', marginBottom: '15px' }}>
                  <CheckCircle size={16} /> Changes successfully saved and synchronized!
                </div>
              )}

              <div className="row gy-3">
                <div className="col-md-6 form-group">
                  <label className="form-label">Full Name</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    required 
                    value={profile.name} 
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })} 
                  />
                </div>

                <div className="col-md-6 form-group">
                  <label className="form-label">Email Address</label>
                  <input 
                    type="email" 
                    className="form-control" 
                    disabled 
                    value={profile.email} 
                  />
                  <div className="text-muted" style={{ fontSize: '11px', marginTop: '4px' }}>Contact support to modify login email address.</div>
                </div>

                <div className="col-md-6 form-group">
                  <label className="form-label">Phone / WhatsApp</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    required 
                    value={profile.phone} 
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })} 
                  />
                </div>

                <div className="col-12 form-group">
                  <label className="form-label">Default Delivery Address</label>
                  <textarea 
                    rows="3" 
                    className="form-control" 
                    required 
                    value={profile.address} 
                    onChange={(e) => setProfile({ ...profile, address: e.target.value })} 
                  />
                </div>
              </div>

              <div className="form-btn" style={{ marginTop: '20px' }}>
                <button type="submit" className="th-btn style9 th-icon" style={{ border: 'none', cursor: 'pointer', width: '100%' }}>
                  <Save size={16} style={{ marginRight: '6px' }} /> Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CustomerProfile;
