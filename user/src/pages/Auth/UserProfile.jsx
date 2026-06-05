import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LogOut, Edit2, Package, Heart, ShoppingCart, Star,
  MapPin, Phone, Mail, Calendar, Award, TrendingUp, Utensils,
  CheckCircle, Clock, Truck, CreditCard, Lock, Save, ChevronRight, Zap
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import apiClient from '../../services/api';
import './CustomerHub.css';

/* ─── Tier meta ─── */
const TIER_META = {
  Bronze:   { icon: '🥉', color: '#CD7F32', perks: ['Early Access to Offers', 'Birthday Bonus'] },
  Silver:   { icon: '🥈', color: '#A8A9AD', perks: ['5% Loyalty Discount', 'Free Delivery above ₹300', 'Priority Support'] },
  Gold:     { icon: '🥇', color: '#FFD700', perks: ['10% Loyalty Discount', 'Free Delivery always', 'Chef Specials Access', 'Priority Delivery'] },
  Platinum: { icon: '💎', color: '#E5E4E2', perks: ['15% Loyalty Discount', 'Free Delivery always', 'Exclusive Recipes', 'Personal Amma Service', 'Festival Hampers'] },
};

const STATUS_ICON = {
  Pending:           <Clock size={14} />,
  Confirmed:         <CheckCircle size={14} />,
  Preparing:         <Utensils size={14} />,
  'Out For Delivery': <Truck size={14} />,
  Delivered:         <CheckCircle size={14} />,
  Cancelled:         <span>✕</span>,
};

/* ─── Helpers ─── */
const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

const resolveImage = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  const clean = path.replace(/^\/?(api\/)?assets\//, '');
  return `http://localhost:5000/assets/${clean}`;
};

const fade = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } };

/* ══════════════════════════════════════════════════════════ */

const UserProfile = () => {
  const { user, logout, refreshUser } = useAuth();
  const { cartItems } = useCart();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview');
  const [hub, setHub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  // Edit-profile form state
  const [form, setForm] = useState({
    name: '', phone: '', door_number: '', street_name: '',
    area: '', city: '', state: '', pincode: '', landmark: '',
  });

  useEffect(() => {
    const fetchHub = async () => {
      setLoading(true);
      try {
        const res = await apiClient.get('/auth/dashboard-stats');
        setHub(res.data);
        // Pre-fill form
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
    // eslint-disable-next-line
  }, []);

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
      const res = await apiClient.get('/auth/dashboard-stats');
      setHub(res.data);
    } catch (err) {
      setSaveMsg('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  const tier = hub?.membership?.tier || 'Bronze';
  const tierMeta = TIER_META[tier] || TIER_META.Bronze;

  const TABS = [
    { id: 'overview',  label: 'My Journey',     icon: <TrendingUp size={18} /> },
    { id: 'orders',    label: 'Order History',   icon: <Package size={18} /> },
    { id: 'favorites', label: 'My Favorites',    icon: <Heart size={18} /> },
    { id: 'profile',   label: 'Edit Profile',    icon: <Edit2 size={18} /> },
    { id: 'password',  label: 'Change Password', icon: <Lock size={18} /> },
  ];

  return (
    <div className="hub-page">

      {/* ════════════════════════ HERO ════════════════════════ */}
      <div className="hub-hero">
        <div className="hub-hero-inner">
          {/* Avatar */}
          <div className="hub-avatar-wrap">
            <div className="hub-avatar">
              {user.profile_image
                ? <img src={user.profile_image} alt="avatar" />
                : (user.name || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="hub-avatar-edit" title="Change photo">
              <Edit2 size={14} color="#fff" />
            </div>
          </div>

          {/* Info */}
          <div className="hub-profile-info">
            <h1 className="hub-profile-name">{user.name || 'Welcome!'}</h1>
            <div className="hub-profile-meta">
              <span><Mail size={13} /> {user.email}</span>
              {user.phone && <span><Phone size={13} /> {user.phone}</span>}
              <span><Calendar size={13} /> Member since {formatDate(user.created_at)}</span>
            </div>
            <span className={`hub-tier-badge ${tier}`}>
              {tierMeta.icon} &nbsp;{tier} Member
            </span>
          </div>

          {/* Logout */}
          <button
            style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.25)', color: '#fff', padding: '10px 20px', borderRadius: '50px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, marginBottom: '32px', flexShrink: 0 }}
            onClick={handleLogout}
          >
            <LogOut size={16} /> Logout
          </button>
        </div>

        {/* Hero Stats Strip */}
        <div className="hub-hero-stats">
          <div className="hub-hero-stat">
            <span className="hub-hero-stat-val">{hub?.stats?.total_orders ?? '—'}</span>
            <span className="hub-hero-stat-label">Total Orders</span>
          </div>
          <div className="hub-hero-stat">
            <span className="hub-hero-stat-val">₹{hub?.stats?.total_spent?.toLocaleString('en-IN') ?? '—'}</span>
            <span className="hub-hero-stat-label">Lifetime Spent</span>
          </div>
          <div className="hub-hero-stat">
            <span className="hub-hero-stat-val">{hub?.stats?.reward_points ?? '—'}</span>
            <span className="hub-hero-stat-label">Reward Points</span>
          </div>
          <div className="hub-hero-stat">
            <span className="hub-hero-stat-val">{cartItems?.length ?? 0}</span>
            <span className="hub-hero-stat-label">Basket Items</span>
          </div>
        </div>
      </div>

      <div className="hub-container">

        {/* ── Active Order Banner ── */}
        {hub?.active_order && (
          <motion.div
            className="hub-active-order"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="hub-active-order-icon">
              <Truck size={26} color="#fff" />
            </div>
            <div className="hub-active-order-info">
              <p className="hub-active-order-title">
                {STATUS_ICON[hub.active_order.status]} &nbsp; Order #{hub.active_order.id} — {hub.active_order.status}
              </p>
              <p className="hub-active-order-sub">
                {hub.active_order.items?.join(', ') || 'Your delicious order is on its way!'}
              </p>
            </div>
            <button className="hub-track-btn" onClick={() => navigate('/orders')}>
              Track Order <ChevronRight size={16} />
            </button>
          </motion.div>
        )}

        {/* ════════════════════════ MAIN GRID ════════════════════════ */}
        <div className="hub-grid">

          {/* ══ LEFT SIDEBAR ══ */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Navigation */}
            <div className="hub-card">
              <div style={{ padding: '8px' }}>
                {TABS.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '12px', width: '100%',
                      padding: '13px 16px', border: 'none', borderRadius: '12px',
                      background: activeTab === tab.id ? 'rgba(128,0,32,0.07)' : 'transparent',
                      color: activeTab === tab.id ? 'var(--hub-accent)' : 'var(--hub-muted)',
                      fontWeight: activeTab === tab.id ? 700 : 500,
                      textAlign: 'left', cursor: 'pointer', fontSize: '0.92rem',
                      fontFamily: "'Inter', sans-serif", transition: 'all 0.15s',
                      borderLeft: activeTab === tab.id ? '3px solid var(--hub-accent)' : '3px solid transparent',
                    }}
                  >
                    {tab.icon} {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Membership Card */}
            <div className="hub-card">
              <div className="hub-card-header">
                <h3 className="hub-card-title"><Award size={20} /> Membership</h3>
              </div>
              <div className="membership-card-body">
                <div className="membership-tier-display">
                  <div className="membership-tier-icon">{tierMeta.icon}</div>
                  <div className="membership-tier-name">{tier}</div>
                  <div className="membership-tier-sub">
                    {hub?.stats?.reward_points ?? 0} Reward Points
                  </div>
                </div>

                {hub?.membership?.next_tier && (
                  <div className="tier-progress-section">
                    <div className="tier-progress-header">
                      <span>{tier}</span>
                      <span>{hub.membership.points_to_next} pts to {hub.membership.next_tier}</span>
                    </div>
                    <div className="tier-progress-bar">
                      <div
                        className="tier-progress-fill"
                        style={{ width: `${hub.membership.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                <div style={{ marginTop: '16px' }}>
                  <p style={{ fontSize: '0.8rem', color: 'var(--hub-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 600, marginBottom: '10px' }}>
                    Your Perks
                  </p>
                  {tierMeta.perks.map((perk, i) => (
                    <div key={i} className="tier-benefit-row">
                      <CheckCircle size={14} />
                      <span>{perk}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ══ RIGHT CONTENT ══ */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* ── OVERVIEW TAB ── */}
            {activeTab === 'overview' && (
              <motion.div variants={fade} initial="hidden" animate="visible" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                {/* Stats Grid */}
                <div className="hub-stats-grid">
                  <div className="hub-stat-card">
                    <div className="hub-stat-icon orders"><Package size={22} /></div>
                    <div className="hub-stat-val">{hub?.stats?.total_orders ?? '—'}</div>
                    <div className="hub-stat-label">Orders Placed</div>
                  </div>
                  <div className="hub-stat-card">
                    <div className="hub-stat-icon spent"><CreditCard size={22} /></div>
                    <div className="hub-stat-val">₹{hub?.stats?.total_spent?.toLocaleString('en-IN') ?? '—'}</div>
                    <div className="hub-stat-label">Total Spent</div>
                  </div>
                  <div className="hub-stat-card">
                    <div className="hub-stat-icon points"><Zap size={22} /></div>
                    <div className="hub-stat-val">{hub?.stats?.reward_points ?? '—'}</div>
                    <div className="hub-stat-label">Reward Points</div>
                  </div>
                  <div className="hub-stat-card">
                    <div className="hub-stat-icon cart"><ShoppingCart size={22} /></div>
                    <div className="hub-stat-val">{cartItems?.length ?? 0}</div>
                    <div className="hub-stat-label">In My Basket</div>
                  </div>
                </div>

                {/* Food Journey */}
                <div className="hub-card">
                  <div className="hub-card-header">
                    <h3 className="hub-card-title"><TrendingUp size={20} /> My Food Journey</h3>
                  </div>
                  <div className="journey-grid">
                    <div className="journey-item">
                      <div className="journey-item-icon">🍽️</div>
                      <span className="journey-item-val">{hub?.stats?.completed_orders ?? 0}</span>
                      <span className="journey-item-label">Meals Enjoyed</span>
                    </div>
                    <div className="journey-item">
                      <div className="journey-item-icon">❤️</div>
                      <span className="journey-item-val">
                        {hub?.favorite_dishes?.[0]?.name?.split(' ')[0] || '—'}
                      </span>
                      <span className="journey-item-label">Favorite Dish</span>
                    </div>
                    <div className="journey-item">
                      <div className="journey-item-icon">🏆</div>
                      <span className="journey-item-val">{tier}</span>
                      <span className="journey-item-label">Member Tier</span>
                    </div>
                    <div className="journey-item">
                      <div className="journey-item-icon">📅</div>
                      <span className="journey-item-val">{formatDate(user.created_at)}</span>
                      <span className="journey-item-label">Member Since</span>
                    </div>
                    <div className="journey-item">
                      <div className="journey-item-icon">⭐</div>
                      <span className="journey-item-val">{hub?.stats?.reward_points ?? 0} pts</span>
                      <span className="journey-item-label">Reward Balance</span>
                    </div>
                    <div className="journey-item">
                      <div className="journey-item-icon">🍴</div>
                      <span className="journey-item-val">
                        {hub?.favorite_category
                          ? hub.favorite_category.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())
                          : '—'}
                      </span>
                      <span className="journey-item-label">Fav Category</span>
                    </div>
                  </div>
                </div>

                {/* Recent Orders */}
                <div className="hub-card">
                  <div className="hub-card-header">
                    <h3 className="hub-card-title"><Package size={20} /> Recent Orders</h3>
                    <button className="hub-card-action" onClick={() => setActiveTab('orders')}>
                      View All <ChevronRight size={14} />
                    </button>
                  </div>
                  {loading ? (
                    <div className="hub-loading"><div className="hub-spinner" /></div>
                  ) : hub?.recent_orders?.length > 0 ? (
                    hub.recent_orders.map(order => (
                      <div key={order.id} className="order-item-row">
                        <div className="order-id-badge">
                          <span>Order</span>
                          <strong>#{order.id}</strong>
                        </div>
                        <div className="order-item-info">
                          <p className="order-item-name">
                            {order.items?.join(', ') || 'Order items'}
                            {order.item_count > 2 && ` +${order.item_count - 2} more`}
                          </p>
                          <p className="order-item-meta">{formatDate(order.created_at)}</p>
                        </div>
                        <span className={`order-status-chip status-${order.status?.replace(/\s+/g, '-')}`}>
                          {STATUS_ICON[order.status]} &nbsp;{order.status}
                        </span>
                        <span className="order-amount">₹{order.total}</span>
                      </div>
                    ))
                  ) : (
                    <div className="hub-empty">
                      <Package size={48} />
                      <p>No orders yet. Start your food journey today!</p>
                      <button className="hub-btn-primary" style={{ marginTop: 12 }} onClick={() => navigate('/menu')}>
                        Explore Menu
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* ── ORDERS TAB ── */}
            {activeTab === 'orders' && (
              <motion.div variants={fade} initial="hidden" animate="visible">
                <div className="hub-card">
                  <div className="hub-card-header">
                    <h3 className="hub-card-title"><Package size={20} /> Order History</h3>
                  </div>
                  {loading ? (
                    <div className="hub-loading"><div className="hub-spinner" /></div>
                  ) : hub?.recent_orders?.length > 0 ? (
                    hub.recent_orders.map(order => (
                      <div key={order.id} className="order-item-row">
                        <div className="order-id-badge">
                          <span>Order</span>
                          <strong>#{order.id}</strong>
                        </div>
                        <div className="order-item-info">
                          <p className="order-item-name">
                            {order.items?.join(', ') || 'Order items'}
                            {order.item_count > 2 && ` +${order.item_count - 2} more`}
                          </p>
                          <p className="order-item-meta">{formatDate(order.created_at)}</p>
                        </div>
                        <span className={`order-status-chip status-${order.status?.replace(/\s+/g, '-')}`}>
                          {order.status}
                        </span>
                        <span className="order-amount">₹{order.total}</span>
                      </div>
                    ))
                  ) : (
                    <div className="hub-empty">
                      <Package size={48} />
                      <p>No orders yet. Your Amma's Kitchen journey starts here!</p>
                      <button className="hub-btn-primary" style={{ marginTop: 12 }} onClick={() => navigate('/menu')}>
                        Browse Menu
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* ── FAVORITES TAB ── */}
            {activeTab === 'favorites' && (
              <motion.div variants={fade} initial="hidden" animate="visible" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div className="hub-card">
                  <div className="hub-card-header">
                    <h3 className="hub-card-title"><Heart size={20} /> My Favorite Dishes</h3>
                    <span style={{ fontSize: '0.82rem', color: 'var(--hub-muted)' }}>Based on your orders</span>
                  </div>
                  {hub?.favorite_dishes?.length > 0 ? (
                    <div className="fav-dishes-grid">
                      {hub.favorite_dishes.map((dish, i) => (
                        <div key={dish.id || i} className="fav-dish-card" onClick={() => navigate('/menu')}>
                          {dish.image
                            ? <img src={resolveImage(dish.image)} alt={dish.name} className="fav-dish-img" />
                            : <div className="fav-dish-img-placeholder">🍽️</div>
                          }
                          <div className="fav-dish-info">
                            <p className="fav-dish-name">{dish.name}</p>
                            <p className="fav-dish-count">Ordered {dish.times_ordered}×</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="hub-empty">
                      <Heart size={48} />
                      <p>No favorites yet! Order some dishes to see them here.</p>
                      <button className="hub-btn-primary" style={{ marginTop: 12 }} onClick={() => navigate('/menu')}>
                        Discover Dishes
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* ── PROFILE/EDIT TAB ── */}
            {activeTab === 'profile' && (
              <motion.div variants={fade} initial="hidden" animate="visible">
                <div className="hub-card">
                  <div className="hub-card-header">
                    <h3 className="hub-card-title"><Edit2 size={20} /> Edit Profile & Address</h3>
                  </div>
                  <form onSubmit={handleSaveProfile}>
                    <div className="hub-form-grid">
                      <div className="hub-form-group">
                        <label className="hub-form-label">Full Name</label>
                        <input className="hub-form-input" name="name" value={form.name} onChange={handleFormChange} placeholder="Your full name" />
                      </div>
                      <div className="hub-form-group">
                        <label className="hub-form-label">Phone Number</label>
                        <input className="hub-form-input" name="phone" value={form.phone} onChange={handleFormChange} placeholder="+91 XXXXX XXXXX" />
                      </div>
                      <div className="hub-form-group">
                        <label className="hub-form-label">Door / Flat Number</label>
                        <input className="hub-form-input" name="door_number" value={form.door_number} onChange={handleFormChange} placeholder="e.g. 4B" />
                      </div>
                      <div className="hub-form-group">
                        <label className="hub-form-label">Street Name</label>
                        <input className="hub-form-input" name="street_name" value={form.street_name} onChange={handleFormChange} placeholder="Street / Colony" />
                      </div>
                      <div className="hub-form-group">
                        <label className="hub-form-label">Area / Locality</label>
                        <input className="hub-form-input" name="area" value={form.area} onChange={handleFormChange} placeholder="Area" />
                      </div>
                      <div className="hub-form-group">
                        <label className="hub-form-label">City</label>
                        <input className="hub-form-input" name="city" value={form.city} onChange={handleFormChange} placeholder="Chennai" />
                      </div>
                      <div className="hub-form-group">
                        <label className="hub-form-label">State</label>
                        <input className="hub-form-input" name="state" value={form.state} onChange={handleFormChange} placeholder="Tamil Nadu" />
                      </div>
                      <div className="hub-form-group">
                        <label className="hub-form-label">Pincode</label>
                        <input className="hub-form-input" name="pincode" value={form.pincode} onChange={handleFormChange} placeholder="600001" />
                      </div>
                      <div className="hub-form-group full-width">
                        <label className="hub-form-label">Landmark</label>
                        <input className="hub-form-input" name="landmark" value={form.landmark} onChange={handleFormChange} placeholder="Near temple / bus stop" />
                      </div>
                    </div>
                    <div className="hub-form-actions">
                      <button type="submit" className="hub-btn-primary" disabled={saving}>
                        <Save size={16} /> &nbsp;{saving ? 'Saving…' : 'Save Profile'}
                      </button>
                      {saveMsg && (
                        <span style={{ color: saveMsg.includes('success') ? 'var(--hub-success)' : 'red', fontSize: '0.9rem', alignSelf: 'center' }}>
                          {saveMsg}
                        </span>
                      )}
                    </div>
                  </form>
                </div>
              </motion.div>
            )}

            {/* ── PASSWORD TAB ── */}
            {activeTab === 'password' && (
              <motion.div variants={fade} initial="hidden" animate="visible">
                <ChangePasswordPanel />
              </motion.div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

/* ── Sub-component: Change Password ── */
const ChangePasswordPanel = () => {
  const [form, setForm] = useState({ current_password: '', new_password: '', confirm: '' });
  const [msg, setMsg] = useState('');
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.new_password !== form.confirm) { setMsg('New passwords do not match.'); return; }
    setSaving(true); setMsg('');
    try {
      await apiClient.post('/auth/change-password', {
        current_password: form.current_password,
        new_password: form.new_password,
      });
      setMsg('Password changed successfully!');
      setForm({ current_password: '', new_password: '', confirm: '' });
    } catch (err) {
      setMsg(err?.response?.data?.error || 'Failed to change password.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="hub-card">
      <div className="hub-card-header">
        <h3 className="hub-card-title"><Lock size={20} /> Change Password</h3>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="hub-form-grid" style={{ gridTemplateColumns: '1fr' }}>
          <div className="hub-form-group">
            <label className="hub-form-label">Current Password</label>
            <input type="password" className="hub-form-input" name="current_password" value={form.current_password} onChange={handleChange} required />
          </div>
          <div className="hub-form-group">
            <label className="hub-form-label">New Password</label>
            <input type="password" className="hub-form-input" name="new_password" value={form.new_password} onChange={handleChange} required />
          </div>
          <div className="hub-form-group">
            <label className="hub-form-label">Confirm New Password</label>
            <input type="password" className="hub-form-input" name="confirm" value={form.confirm} onChange={handleChange} required />
          </div>
        </div>
        <div className="hub-form-actions">
          <button type="submit" className="hub-btn-primary" disabled={saving}>
            <Lock size={16} /> &nbsp;{saving ? 'Updating…' : 'Update Password'}
          </button>
          {msg && (
            <span style={{ color: msg.includes('success') ? 'var(--hub-success)' : 'red', fontSize: '0.9rem', alignSelf: 'center' }}>
              {msg}
            </span>
          )}
        </div>
      </form>
    </div>
  );
};

export default UserProfile;
