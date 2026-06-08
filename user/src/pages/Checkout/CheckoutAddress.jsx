import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { ChevronLeft, Home, Briefcase, MapPin, Plus, CheckCircle2 } from 'lucide-react';
import addressService from '../../services/addressService';

const CheckoutAddress = () => {
  const navigate = useNavigate();
  const { token, user } = useAuth();
  
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  
  const [showNewForm, setShowNewForm] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    house: '',
    street: '',
    area: '',
    city: 'Hosur',
    pincode: '635109',
    landmark: '',
    label: 'Home' // Home, Office, Other
  });

  useEffect(() => {
    // If not logged in, just show form
    if (token) {
      addressService.getAll().then(res => {
        setSavedAddresses(res.data || []);
        if (res.data && res.data.length > 0) {
          const defaultAddr = res.data.find(a => a.is_default);
          if (defaultAddr) setSelectedAddressId(defaultAddr.id);
          else setSelectedAddressId(res.data[0].id);
        } else {
          setShowNewForm(true);
        }
      }).catch(err => {
        console.error("Failed to load addresses", err);
        setShowNewForm(true);
      });
    } else {
      setShowNewForm(true);
    }
  }, [token]);

  const handleSelectAddress = (id) => {
    setSelectedAddressId(id);
    setShowNewForm(false);
  };

  const proceedToReview = () => {
    let finalAddress = '';
    let finalPhone = '';

    if (showNewForm) {
      if (!formData.name || !formData.phone || !formData.house || !formData.street) {
        alert("Please fill in the required address fields.");
        return;
      }
      finalAddress = `${formData.house}, ${formData.street}, ${formData.area}, ${formData.city} - ${formData.pincode}`;
      if (formData.landmark) finalAddress += ` (Landmark: ${formData.landmark})`;
      finalAddress = `[${formData.label}] ` + finalAddress;
      finalPhone = formData.phone;
    } else {
      if (!selectedAddressId) {
        alert("Please select a delivery address.");
        return;
      }
      const addr = savedAddresses.find(a => a.id === selectedAddressId);
      finalAddress = `[${addr.label || 'Home'}] ${addr.door_number || ''}, ${addr.street_name || ''}, ${addr.area || ''}, ${addr.city || ''} - ${addr.pincode || ''}`.replace(/^, | ,|, $/g, '').trim();
      finalPhone = user?.phone || '9999999999';
    }

    const checkoutData = JSON.parse(sessionStorage.getItem('checkoutData') || '{}');
    checkoutData.deliveryAddress = finalAddress;
    checkoutData.phone = finalPhone;
    sessionStorage.setItem('checkoutData', JSON.stringify(checkoutData));
    
    navigate('/checkout/review');
  };

  return (
    <div style={{ backgroundColor: '#F5F5F0', minHeight: '100vh', paddingBottom: 100 }}>
      {/* Header */}
      <div style={{ background: 'white', padding: '15px 20px', display: 'flex', alignItems: 'center', gap: 15, position: 'sticky', top: 0, zIndex: 10, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        <button onClick={() => navigate('/cart')} style={{ background: 'none', border: 'none', padding: 0, display: 'flex' }}>
          <ChevronLeft size={24} color="var(--text-dark)" />
        </button>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-dark)', margin: 0 }}>Select Address</h2>
      </div>

      <div style={{ maxWidth: 600, margin: '0 auto', padding: '20px 15px' }}>
        
        {/* Saved Addresses */}
        {savedAddresses.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 12 }}>Saved Addresses</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {savedAddresses.map(addr => (
                <div 
                  key={addr.id} 
                  onClick={() => handleSelectAddress(addr.id)}
                  style={{ 
                    background: 'white', 
                    borderRadius: 16, 
                    padding: 16, 
                    border: selectedAddressId === addr.id && !showNewForm ? '2px solid var(--primary-color)' : '2px solid transparent',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                    display: 'flex',
                    gap: 12,
                    cursor: 'pointer',
                    position: 'relative'
                  }}
                >
                  <div style={{ color: 'var(--primary-color)' }}>
                    {addr.label === 'Home' ? <Home size={20} /> : addr.label === 'Office' ? <Briefcase size={20} /> : <MapPin size={20} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--text-dark)' }}>{addr.label || 'Home'}</h4>
                      {selectedAddressId === addr.id && !showNewForm && <CheckCircle2 size={16} color="var(--primary-color)" fill="var(--primary-color)" stroke="white" />}
                    </div>
                    <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.4 }}>
                      {addr.door_number}, {addr.street_name}, {addr.area}, {addr.city} - {addr.pincode}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add New Address Button */}
        {!showNewForm && (
          <button 
            onClick={() => setShowNewForm(true)}
            style={{ 
              width: '100%', background: 'white', border: '1px dashed #CCC', borderRadius: 16, padding: '16px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: 'var(--primary-color)',
              fontWeight: 700, fontSize: 15, marginBottom: 20
            }}
          >
            <Plus size={18} /> Add New Address
          </button>
        )}

        {/* New Address Form */}
        {showNewForm && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ background: 'white', borderRadius: 20, padding: 20, boxShadow: '0 4px 15px rgba(0,0,0,0.04)' }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, margin: '0 0 20px 0', color: 'var(--text-dark)' }}>Enter New Address</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6 }}>NAME *</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} style={{ width: '100%', padding: '12px', background: '#F5F5F0', border: '1px solid #EAEAEA', borderRadius: 12, fontSize: 14 }} />
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6 }}>PHONE NUMBER *</label>
                <input type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} style={{ width: '100%', padding: '12px', background: '#F5F5F0', border: '1px solid #EAEAEA', borderRadius: 12, fontSize: 14 }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6 }}>HOUSE / FLAT NO *</label>
                  <input type="text" value={formData.house} onChange={(e) => setFormData({...formData, house: e.target.value})} style={{ width: '100%', padding: '12px', background: '#F5F5F0', border: '1px solid #EAEAEA', borderRadius: 12, fontSize: 14 }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6 }}>STREET *</label>
                  <input type="text" value={formData.street} onChange={(e) => setFormData({...formData, street: e.target.value})} style={{ width: '100%', padding: '12px', background: '#F5F5F0', border: '1px solid #EAEAEA', borderRadius: 12, fontSize: 14 }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6 }}>AREA / LOCALITY</label>
                <input type="text" value={formData.area} onChange={(e) => setFormData({...formData, area: e.target.value})} style={{ width: '100%', padding: '12px', background: '#F5F5F0', border: '1px solid #EAEAEA', borderRadius: 12, fontSize: 14 }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6 }}>LANDMARK (OPTIONAL)</label>
                <input type="text" value={formData.landmark} onChange={(e) => setFormData({...formData, landmark: e.target.value})} placeholder="e.g. Near Apollo Pharmacy" style={{ width: '100%', padding: '12px', background: '#F5F5F0', border: '1px solid #EAEAEA', borderRadius: 12, fontSize: 14 }} />
              </div>

              {/* Address Label Selection */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 10 }}>SAVE AS</label>
                <div style={{ display: 'flex', gap: 10 }}>
                  {['Home', 'Office', 'Other'].map(lbl => (
                    <button 
                      key={lbl}
                      onClick={() => setFormData({...formData, label: lbl})}
                      style={{ 
                        flex: 1, padding: '10px', borderRadius: 10, fontSize: 13, fontWeight: 600,
                        background: formData.label === lbl ? '#E6F4EA' : 'white',
                        border: formData.label === lbl ? '1px solid var(--primary-color)' : '1px solid #EAEAEA',
                        color: formData.label === lbl ? 'var(--primary-color)' : 'var(--text-muted)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
                      }}
                    >
                      {lbl === 'Home' ? <Home size={14}/> : lbl === 'Office' ? <Briefcase size={14}/> : <MapPin size={14}/>}
                      {lbl}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Sticky Bottom Bar */}
      <div className="checkout-bottom-bar">
        <button 
          onClick={proceedToReview} 
          style={{ width: '100%', background: 'var(--primary-color)', color: 'white', padding: '16px', borderRadius: 16, border: 'none', fontWeight: 800, fontSize: 16, textTransform: 'uppercase', letterSpacing: '0.5px' }}
        >
          Deliver Here
        </button>
      </div>
    </div>
  );
};

export default CheckoutAddress;
