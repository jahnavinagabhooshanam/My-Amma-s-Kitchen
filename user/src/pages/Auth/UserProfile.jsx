import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LogOut, Edit2, MapPin, CreditCard, Heart, Award, Gift, Bell, HelpCircle, 
  ChevronRight, ArrowLeft, Lock, Save, TrendingUp, Package, Zap, ShoppingCart
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import apiClient from '../../services/api';
import { resolveImagePath } from '../../components/FoodCard';
import './CustomerHub.css';

const UserProfile = () => {
  const { user, logout, refreshUser } = useAuth();
  const { cartItems, addToCart } = useCart();
  const navigate = useNavigate();

  const [activeScreen, setActiveScreen] = useState('menu'); // menu, edit, journey, favorites, password
  const [hub, setHub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [wishlistItems, setWishlistItems] = useState([]);

  useEffect(() => {
    if (activeScreen === 'favorites') {
      const saved = JSON.parse(localStorage.getItem('amma_wishlist') || '[]');
      setWishlistItems(saved);
    }
  }, [activeScreen]);
  
  // Edit-profile form state
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [form, setForm] = useState({
    name: '', phone: '', door_number: '', street_name: '',
    area: '', city: '', state: '', pincode: '', landmark: '',
  });

  const [pwdForm, setPwdForm] = useState({ oldPassword: '', newPassword: '' });
  const [pwdSaving, setPwdSaving] = useState(false);
  const [pwdMsg, setPwdMsg] = useState('');

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwdSaving(true);
    setPwdMsg('');
    try {
      await apiClient.post('/auth/change-password', {
        current_password: pwdForm.oldPassword,
        new_password: pwdForm.newPassword
      });
      setPwdMsg('Password updated successfully!');
      setPwdForm({ oldPassword: '', newPassword: '' });
      setTimeout(() => setActiveScreen('menu'), 2000);
    } catch (err) {
      setPwdMsg(err.response?.data?.error || 'Failed to update password.');
    } finally {
      setPwdSaving(false);
    }
  };

  useEffect(() => {
    const fetchHub = async () => {
      setLoading(true);
      try {
        const res = await apiClient.get('/auth/dashboard-stats');
        setHub(res.data);
        if (res.data?.profile) {
          const p = res.data.profile;
          setForm({
            name:        p.name || '',
            phone:       p.phone || '',
            door_number: user?.door_number || '',
            street_name: user?.street_name || '',
            area:        user?.area || '',
            city:        user?.city || '',
            state:       user?.state || '',
            pincode:     user?.pincode || '',
            landmark:    user?.landmark || '',
          });
        }
      } catch (err) {
        console.error('Dashboard stats error', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHub();
  }, [user]);

  const handleLogout = () => { logout(); navigate('/login'); };

  const handleFormChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveMsg('');
    try {
      await apiClient.post('/auth/complete-profile', form);
      await refreshUser();
      setSaveMsg('Profile saved successfully!');
      setTimeout(() => setActiveScreen('menu'), 1500);
    } catch (err) {
      setSaveMsg('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  const renderMenuScreen = () => (
    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
      {/* Profile Header */}
      <div style={{ background: 'white', padding: '30px 20px', borderRadius: '0 0 24px 24px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--primary-color)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 700, flexShrink: 0, overflow: 'hidden' }}>
          {user.profile_image ? <img src={user.profile_image} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (user.name || 'U').charAt(0).toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 4px 0', color: 'var(--text-dark)' }}>{user.name || 'Guest'}</h2>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 2 }}>{user.email}</div>
          {user.phone && <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{user.phone}</div>}
        </div>
        <button onClick={() => setActiveScreen('edit')} style={{ background: '#F5F5F0', border: 'none', width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dark)' }}>
          <Edit2 size={18} />
        </button>
      </div>

      {/* Menu List */}
      <div style={{ padding: '0 20px' }}>
        <div style={{ background: 'white', borderRadius: 20, padding: '10px 0', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
          
          <div onClick={() => setActiveScreen('edit')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #EAEAEA', cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 15, fontSize: 15, fontWeight: 600, color: 'var(--text-dark)' }}><MapPin size={20} color="var(--primary-color)" /> My Addresses</div>
            <ChevronRight size={18} color="var(--text-muted)" />
          </div>

          <div onClick={() => setActiveScreen('journey')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #EAEAEA', cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 15, fontSize: 15, fontWeight: 600, color: 'var(--text-dark)' }}><TrendingUp size={20} color="var(--primary-color)" /> My Journey</div>
            <ChevronRight size={18} color="var(--text-muted)" />
          </div>

          <div onClick={() => setActiveScreen('favorites')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #EAEAEA', cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 15, fontSize: 15, fontWeight: 600, color: 'var(--text-dark)' }}><Heart size={20} color="var(--primary-color)" /> My Favorites</div>
            <ChevronRight size={18} color="var(--text-muted)" />
          </div>

          <div onClick={() => setActiveScreen('password')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #EAEAEA', cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 15, fontSize: 15, fontWeight: 600, color: 'var(--text-dark)' }}><Lock size={20} color="var(--primary-color)" /> Change Password</div>
            <ChevronRight size={18} color="var(--text-muted)" />
          </div>


          <div onClick={() => setActiveScreen('notifications')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #EAEAEA', cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 15, fontSize: 15, fontWeight: 600, color: 'var(--text-dark)' }}><Bell size={20} color="var(--primary-color)" /> Notifications</div>
            <ChevronRight size={18} color="var(--text-muted)" />
          </div>

          <div onClick={() => navigate('/contact')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #EAEAEA', cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 15, fontSize: 15, fontWeight: 600, color: 'var(--text-dark)' }}><HelpCircle size={20} color="var(--primary-color)" /> Help & Support</div>
            <ChevronRight size={18} color="var(--text-muted)" />
          </div>

          <div onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 15, fontSize: 15, fontWeight: 700, color: 'var(--danger)' }}><LogOut size={20} /> Logout</div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderEditScreen = () => (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} style={{ padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 15, marginBottom: 20 }}>
        <button onClick={() => setActiveScreen('menu')} style={{ background: 'white', border: '1px solid #EAEAEA', width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dark)' }}>
          <ArrowLeft size={20} />
        </button>
        <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0, color: 'var(--text-dark)' }}>Edit Profile</h2>
      </div>

      <div style={{ background: 'white', borderRadius: 20, padding: 20, boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
        <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>FULL NAME</label>
            <input type="text" name="name" value={form.name} onChange={handleFormChange} style={{ width: '100%', padding: '12px 16px', background: '#F5F5F0', border: '1px solid #EAEAEA', borderRadius: 12, fontSize: 14 }} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>PHONE NUMBER</label>
            <input type="tel" name="phone" value={form.phone} onChange={handleFormChange} style={{ width: '100%', padding: '12px 16px', background: '#F5F5F0', border: '1px solid #EAEAEA', borderRadius: 12, fontSize: 14 }} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>DOOR / FLAT NUMBER</label>
            <input type="text" name="door_number" value={form.door_number} onChange={handleFormChange} style={{ width: '100%', padding: '12px 16px', background: '#F5F5F0', border: '1px solid #EAEAEA', borderRadius: 12, fontSize: 14 }} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>STREET NAME</label>
            <input type="text" name="street_name" value={form.street_name} onChange={handleFormChange} style={{ width: '100%', padding: '12px 16px', background: '#F5F5F0', border: '1px solid #EAEAEA', borderRadius: 12, fontSize: 14 }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>CITY</label>
              <input type="text" name="city" value={form.city} onChange={handleFormChange} style={{ width: '100%', padding: '12px 16px', background: '#F5F5F0', border: '1px solid #EAEAEA', borderRadius: 12, fontSize: 14 }} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>PINCODE</label>
              <input type="text" name="pincode" value={form.pincode} onChange={handleFormChange} style={{ width: '100%', padding: '12px 16px', background: '#F5F5F0', border: '1px solid #EAEAEA', borderRadius: 12, fontSize: 14 }} />
            </div>
          </div>
          
          <button type="submit" disabled={saving} style={{ width: '100%', padding: '16px', background: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: 16, fontWeight: 700, fontSize: 16, marginTop: 10 }}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          {saveMsg && <div style={{ textAlign: 'center', fontSize: 13, fontWeight: 600, color: saveMsg.includes('success') ? 'var(--success)' : 'var(--danger)' }}>{saveMsg}</div>}
        </form>
      </div>
    </motion.div>
  );

  const renderJourneyScreen = () => (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} style={{ padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 15, marginBottom: 20 }}>
        <button onClick={() => setActiveScreen('menu')} style={{ background: 'white', border: '1px solid #EAEAEA', width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dark)' }}>
          <ArrowLeft size={20} />
        </button>
        <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0, color: 'var(--text-dark)' }}>My Journey</h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 }}>
        <div style={{ background: 'white', padding: 20, borderRadius: 20, textAlign: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
          <Package size={28} color="var(--primary-color)" style={{ margin: '0 auto 10px' }}/>
          <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-dark)' }}>{hub?.stats?.total_orders ?? '—'}</div>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>Orders Placed</div>
        </div>
        <div style={{ background: 'white', padding: 20, borderRadius: 20, textAlign: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
          <CreditCard size={28} color="var(--primary-color)" style={{ margin: '0 auto 10px' }}/>
          <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-dark)' }}>Rs. {hub?.stats?.total_spent?.toLocaleString('en-IN') ?? '—'}</div>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>Total Spent</div>
        </div>
        <div style={{ background: 'white', padding: 20, borderRadius: 20, textAlign: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
          <Zap size={28} color="var(--primary-color)" style={{ margin: '0 auto 10px' }}/>
          <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-dark)' }}>{hub?.stats?.reward_points ?? '—'}</div>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>Reward Points</div>
        </div>
        <div style={{ background: 'white', padding: 20, borderRadius: 20, textAlign: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
          <ShoppingCart size={28} color="var(--primary-color)" style={{ margin: '0 auto 10px' }}/>
          <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-dark)' }}>{cartItems?.length ?? 0}</div>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>In Basket</div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div style={{ backgroundColor: '#F5F5F0', minHeight: '100vh', paddingBottom: 100, maxWidth: 600, margin: '0 auto' }}>
      <AnimatePresence mode="wait">
        {activeScreen === 'menu' && <motion.div key="menu">{renderMenuScreen()}</motion.div>}
        {activeScreen === 'edit' && <motion.div key="edit">{renderEditScreen()}</motion.div>}
        {activeScreen === 'journey' && <motion.div key="journey">{renderJourneyScreen()}</motion.div>}
        {activeScreen === 'favorites' && <motion.div key="favorites" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 15, marginBottom: 20 }}>
            <button onClick={() => setActiveScreen('menu')} style={{ background: 'white', border: '1px solid #EAEAEA', width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dark)' }}>
              <ArrowLeft size={20} />
            </button>
            <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0, color: 'var(--text-dark)' }}>My Favorites</h2>
          </div>
          {wishlistItems.length === 0 ? (
            <div style={{ background: 'white', borderRadius: 20, padding: 40, textAlign: 'center' }}>
              <Heart size={48} color="var(--text-muted)" style={{ margin: '0 auto 15px' }} />
              <p style={{ color: 'var(--text-muted)' }}>You haven't added any favorites yet.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
              {wishlistItems.map((item, index) => (
                <div key={index} style={{ background: 'white', borderRadius: 16, padding: 15, display: 'flex', alignItems: 'center', gap: 15, boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                  <img src={resolveImagePath(item.image)} alt={item.name} style={{ width: 60, height: 60, borderRadius: 10, objectFit: 'cover' }} />
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: 15, fontWeight: 700, color: 'var(--text-dark)' }}>{item.name}</h4>
                    <div style={{ color: 'var(--primary-color)', fontWeight: 800, fontSize: 14 }}>Rs. {item.price}</div>
                  </div>
                  <button onClick={() => {
                     addToCart(item, 1);
                     const newWL = wishlistItems.filter(w => w.id !== item.id);
                     setWishlistItems(newWL);
                     localStorage.setItem('amma_wishlist', JSON.stringify(newWL));
                  }} style={{ background: 'var(--primary-color)', color: 'white', border: 'none', padding: '8px 16px', borderRadius: 20, fontSize: 13, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                    + Basket
                  </button>
                </div>
              ))}
            </div>
          )}
        </motion.div>}
        {activeScreen === 'notifications' && <motion.div key="notifications" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 15, marginBottom: 20 }}>
            <button onClick={() => setActiveScreen('menu')} style={{ background: 'white', border: '1px solid #EAEAEA', width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dark)' }}>
              <ArrowLeft size={20} />
            </button>
            <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0, color: 'var(--text-dark)' }}>Notifications</h2>
          </div>
          <div style={{ background: 'white', borderRadius: 20, padding: 40, textAlign: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
            <Bell size={48} color="var(--text-muted)" style={{ margin: '0 auto 15px' }} />
            <p style={{ color: 'var(--text-muted)' }}>You have no new notifications.</p>
          </div>
        </motion.div>}
        {activeScreen === 'password' && <motion.div key="password" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 15, marginBottom: 20 }}>
            <button onClick={() => setActiveScreen('menu')} style={{ background: 'white', border: '1px solid #EAEAEA', width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dark)' }}>
              <ArrowLeft size={20} />
            </button>
            <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0, color: 'var(--text-dark)' }}>Change Password</h2>
          </div>
          <div style={{ background: 'white', borderRadius: 20, padding: 20, boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
            <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>OLD PASSWORD</label>
                <input type="password" value={pwdForm.oldPassword} onChange={(e) => setPwdForm({...pwdForm, oldPassword: e.target.value})} required style={{ width: '100%', padding: '12px 16px', background: '#F5F5F0', border: '1px solid #EAEAEA', borderRadius: 12, fontSize: 14 }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>NEW PASSWORD</label>
                <input type="password" value={pwdForm.newPassword} onChange={(e) => setPwdForm({...pwdForm, newPassword: e.target.value})} required style={{ width: '100%', padding: '12px 16px', background: '#F5F5F0', border: '1px solid #EAEAEA', borderRadius: 12, fontSize: 14 }} />
              </div>
              <button type="submit" disabled={pwdSaving} style={{ width: '100%', padding: '16px', background: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: 16, fontWeight: 700, fontSize: 16, marginTop: 10 }}>
                {pwdSaving ? 'Updating...' : 'Update Password'}
              </button>
              {pwdMsg && <div style={{ textAlign: 'center', fontSize: 13, fontWeight: 600, color: pwdMsg.includes('success') ? 'var(--success)' : 'var(--danger)' }}>{pwdMsg}</div>}
            </form>
          </div>
        </motion.div>}
      </AnimatePresence>
    </div>
  );
};

export default UserProfile;
