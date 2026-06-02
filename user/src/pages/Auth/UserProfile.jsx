import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import authService from '../../services/authService';
import orderService from '../../services/orderService';
import { 
  LogOut, Package, Heart, MapPin, Edit3, User as UserIcon, 
  Lock, ShoppingCart, CheckCircle, ArrowRight, ShieldCheck, 
  Upload, Tag
} from 'lucide-react';
import './Auth.css';
import DashboardCards from '../../components/DashboardCards';

const UserProfile = () => {
  const { user, logout, refreshUser } = useAuth();
  const { cartItems, cartTotal } = useCart();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Edit Profile Form State
  const [profileData, setProfileData] = useState({
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
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');

  // Password Form State
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // Mock Wishlist matching the global layout
  const [wishlist, setWishlist] = useState([
    { id: 'bat-01', name: 'Premium Mini Tiffin', price: 274.00, image: '🍶', unit: 'Combo Box' },
    { id: 'bat-02', name: 'Premium Idli Dosa Batter', price: 80.00, image: '🍶', unit: '1 kg Tub' }
  ]);

  useEffect(() => {
    if (user) {
      setProfileData({
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
      });
      setProfileImage(user.profile_image || '');
    }
  }, [user]);

  // Load orders when relevant tab is selected AND user has a token
  useEffect(() => {
    if ((activeTab === 'orders' || activeTab === 'dashboard') && user && user.id) {
      const loadOrders = async () => {
        setOrdersLoading(true);
        try {
          console.log('Loading orders for user:', user.id);
          const response = await orderService.getAll();
          console.log('Orders loaded:', response.data);
          setOrders(response.data || []);
        } catch (err) {
          console.error("Failed to load orders:", err.response?.status, err.response?.data);
          // Fallback to mock orders
          setOrders([
            { id: '9419', created_at: '2026-05-28T10:00:00', total_amount: 274.00, status: 'Completed' },
            { id: '9412', created_at: '2026-05-15T12:00:00', total_amount: 377.00, status: 'Completed' }
          ]);
        } finally {
          setOrdersLoading(false);
        }
      };
      loadOrders();
    }
  }, [activeTab, user]);

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');

    try {
      const payload = {
        ...profileData,
        profile_image: profileImage
      };
      await authService.completeProfile(payload);
      await refreshUser();
      setProfileSuccess('Profile updated successfully!');
    } catch (err) {
      setProfileError(err.response?.data?.error || 'Failed to update profile.');
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const imgFormData = new FormData();
    imgFormData.append('file', file);

    setUploading(true);
    setProfileError('');
    setProfileSuccess('');

    try {
      const response = await authService.uploadAvatar(imgFormData);
      setProfileImage(response.data.profile_image);
      setProfileSuccess('Profile picture uploaded! Save changes to apply.');
    } catch (err) {
      setProfileError(err.response?.data?.error || 'Failed to upload image.');
    } finally {
      setUploading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (passwordData.new_password !== passwordData.confirm_password) {
      setPasswordError('New passwords do not match.');
      return;
    }

    try {
      await authService.changePassword({
        current_password: passwordData.current_password,
        new_password: passwordData.new_password
      });
      setPasswordSuccess('Password changed successfully!');
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
    } catch (err) {
      setPasswordError(err.response?.data?.error || 'Failed to change password.');
    }
  };

  if (!user) return null;

  return (
    <div style={{ backgroundColor: '#FCFBF7', minHeight: '90vh', padding: '60px 0' }}>
      <div className="container">
        
        {/* Profile Banner */}
        <div className="profile-header" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '24px', backgroundColor: 'var(--primary-dark)', borderRadius: '15px', padding: '40px', color: 'white', marginBottom: '40px' }}>
          <div style={{ width: '100px', height: '100px', borderRadius: '50%', backgroundColor: 'white', overflow: 'hidden', border: '3px solid rgba(255,255,255,0.2)' }}>
            {profileImage ? (
              <img src={profileImage} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-color)', fontSize: '2.5rem', fontWeight: 'bold' }}>
                {user.name?.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <h2 style={{ margin: 0, fontFamily: 'var(--font-serif)', fontSize: '2.2rem' }}>{user.name}</h2>
            <p style={{ margin: '4px 0 0', opacity: 0.9 }}>{user.email} &bull; {user.phone}</p>
            <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
              <span className="badge" style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: 'white', padding: '5px 12px', borderRadius: '20px', fontSize: '0.8rem' }}>
                Preference: {user.preference || 'Both'}
              </span>
              <span className="badge" style={{ backgroundColor: '#4CAF50', color: 'white', padding: '5px 12px', borderRadius: '20px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ShieldCheck size={12} /> Profile Complete
              </span>
            </div>
          </div>
          <button 
            onClick={handleLogout} 
            className="social-btn" 
            style={{ marginLeft: 'auto', backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', padding: '12px 20px' }}
          >
            <LogOut size={16} /> Logout
          </button>
        </div>

        {/* Dashboard grid */}
        <div style={{ display: 'flex', gap: '30px', flexDirection: 'row', flexWrap: 'wrap' }} className="profile-dashboard-wrapper">
          
          {/* Sidebar Menu */}
          <div style={{ flex: '1', minWidth: '250px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ backgroundColor: 'white', border: '1px solid #EAE6DB', borderRadius: '12px', padding: '15px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {[
                { id: 'dashboard', label: 'Dashboard Overview', icon: <UserIcon size={18} /> },
                { id: 'orders', label: 'My Order History', icon: <Package size={18} /> },
                { id: 'wishlist', label: 'My Saved Wishlist', icon: <Heart size={18} /> },
                { id: 'cart', label: 'My Shopping Basket', icon: <ShoppingCart size={18} /> },
                { id: 'edit-profile', label: 'Edit Profile & Details', icon: <Edit3 size={18} /> },
                { id: 'change-password', label: 'Change Password', icon: <Lock size={18} /> }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    width: '100%',
                    padding: '12px 16px',
                    border: 'none',
                    borderRadius: '8px',
                    textAlign: 'left',
                    fontWeight: '600',
                    cursor: 'pointer',
                    backgroundColor: activeTab === tab.id ? 'rgba(200, 75, 49, 0.08)' : 'transparent',
                    color: activeTab === tab.id ? 'var(--primary-color)' : 'var(--text-dark)',
                    transition: 'all 0.2s'
                  }}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Main Content Area */}
          <div style={{ flex: '3', minWidth: '300px' }}>
            <div style={{ backgroundColor: 'white', border: '1px solid #EAE6DB', borderRadius: '12px', padding: '30px', minHeight: '400px' }}>
              
              {/* TAB 1: DASHBOARD OVERVIEW */}
              {activeTab === 'dashboard' && (
                <div>
                  <h3 style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary-dark)', fontSize: '1.6rem', marginBottom: '20px' }}>Dashboard Overview</h3>
                  <div style={{ marginBottom: '16px' }}>
                    <DashboardCards stats={[
                      { icon: 'fa-solid fa-basket-shopping', trendValue: null, trendType: 'up', value: cartItems.length, label: 'Items in Basket', colorClass: 'red' },
                      { icon: 'fa-solid fa-heart', trendValue: null, trendType: 'up', value: wishlist.length, label: 'Saved Products', colorClass: 'orange' },
                      { icon: 'fa-solid fa-box-open', trendValue: null, trendType: 'up', value: orders.length, label: 'Total Orders', colorClass: 'blue' },
                    ]} />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '25px' }}>
                    {/* Primary Address */}
                    <div style={{ border: '1px solid #EAE6DB', borderRadius: '10px', padding: '20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '15px' }}>
                        <MapPin size={18} style={{ color: 'var(--primary-color)' }} />
                        <strong style={{ fontSize: '1.1rem', color: 'var(--primary-dark)' }}>Primary Delivery Address</strong>
                      </div>
                      <div style={{ lineHeight: '1.6', color: 'var(--text-dark)' }}>
                        <div>{user.door_number}, {user.street_name}</div>
                        <div>{user.area}</div>
                        <div>{user.city} - {user.pincode}</div>
                        <div>{user.state}</div>
                        {user.landmark && <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '6px' }}>Landmark: {user.landmark}</div>}
                        {user.alternate_mobile && <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Alt Mobile: {user.alternate_mobile}</div>}
                      </div>
                    </div>

                    {/* Recent Order Summary */}
                    <div style={{ border: '1px solid #EAE6DB', borderRadius: '10px', padding: '20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '15px' }}>
                        <Package size={18} style={{ color: 'var(--primary-color)' }} />
                        <strong style={{ fontSize: '1.1rem', color: 'var(--primary-dark)' }}>Latest Order</strong>
                      </div>
                      {orders.length > 0 ? (
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span>Order #{orders[0].id}</span>
                            <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>{orders[0].status}</span>
                          </div>
                          <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--primary-color)', marginBottom: '15px' }}>
                            ₹{Number(orders[0].total_amount).toFixed(2)}
                          </div>
                          <button onClick={() => setActiveTab('orders')} className="social-btn" style={{ width: '100%', fontSize: '0.9rem' }}>
                            Track All Orders <ArrowRight size={14} />
                          </button>
                        </div>
                      ) : (
                        <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>
                          No orders placed yet.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: ORDER HISTORY */}
              {activeTab === 'orders' && (
                <div>
                  <h3 style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary-dark)', fontSize: '1.6rem', marginBottom: '20px' }}>Order History</h3>
                  {ordersLoading ? (
                    <p className="text-muted">Loading your orders...</p>
                  ) : orders.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px 0' }}>
                      <Package size={48} style={{ color: 'var(--text-muted)', opacity: '0.4', marginBottom: '15px' }} />
                      <h4>No Orders Found</h4>
                      <p className="text-muted">Browse our delicious South Indian kitchen menu to place your first order.</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                      {orders.map((order) => (
                        <div key={order.id} style={{ border: '1px solid #EAE6DB', borderRadius: '10px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                          <div>
                            <strong style={{ fontSize: '1.1rem', color: 'var(--primary-dark)' }}>Order #{order.id}</strong>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                              Placed on: {new Date(order.created_at || Date.now()).toLocaleDateString()}
                            </div>
                            <div style={{ marginTop: '8px' }}>
                              <span className="badge" style={{ backgroundColor: 'rgba(76, 175, 80, 0.1)', color: '#4CAF50', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                                {order.status}
                              </span>
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>₹{Number(order.total_amount).toFixed(2)}</div>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Payment: Paid</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: WISHLIST */}
              {activeTab === 'wishlist' && (
                <div>
                  <h3 style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary-dark)', fontSize: '1.6rem', marginBottom: '20px' }}>My Saved Products</h3>
                  {wishlist.length === 0 ? (
                    <p className="text-muted">Your wishlist is empty.</p>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
                      {wishlist.map((item) => (
                        <div key={item.id} style={{ border: '1px solid #EAE6DB', borderRadius: '10px', padding: '15px', backgroundColor: 'white', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          <div style={{ height: '140px', backgroundColor: '#F5F4EE', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>
                            {item.image}
                          </div>
                          <div>
                            <strong style={{ fontSize: '1rem', color: 'var(--primary-dark)' }}>{item.name}</strong>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.unit}</div>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                            <span style={{ fontWeight: 'bold', color: 'var(--primary-color)' }}>₹{item.price.toFixed(2)}</span>
                            <button 
                              onClick={() => {
                                setWishlist(wishlist.filter(w => w.id !== item.id));
                              }} 
                              className="btn-text" 
                              style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem' }}
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: CART */}
              {activeTab === 'cart' && (
                <div>
                  <h3 style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary-dark)', fontSize: '1.6rem', marginBottom: '20px' }}>My Shopping Basket</h3>
                  {cartItems.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '30px 0' }}>
                      <ShoppingCart size={48} style={{ color: 'var(--text-muted)', opacity: '0.4', marginBottom: '15px' }} />
                      <p className="text-muted">Your shopping basket is currently empty.</p>
                    </div>
                  ) : (
                    <div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '25px' }}>
                        {cartItems.map((item) => (
                          <div key={item.id} style={{ display: 'flex', justifyItems: 'center', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                              <div style={{ width: '40px', height: '40px', backgroundColor: '#F5F4EE', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🍶</div>
                              <div>
                                <strong style={{ color: 'var(--primary-dark)' }}>{item.name}</strong>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>₹{Number(item.price).toFixed(2)} x {item.quantity}</div>
                              </div>
                            </div>
                            <strong style={{ color: 'var(--primary-color)' }}>₹{(item.price * item.quantity).toFixed(2)}</strong>
                          </div>
                        ))}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '2px solid #EAE6DB', paddingTop: '15px' }}>
                        <strong>Basket Total:</strong>
                        <strong style={{ fontSize: '1.4rem', color: 'var(--primary-color)' }}>₹{Number(cartTotal).toFixed(2)}</strong>
                      </div>
                      <button onClick={() => navigate('/cart')} className="auth-submit-btn" style={{ marginTop: '20px' }}>
                        Go to Checkout
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 5: EDIT PROFILE */}
              {activeTab === 'edit-profile' && (
                <div>
                  <h3 style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary-dark)', fontSize: '1.6rem', marginBottom: '20px' }}>Edit Profile & Delivery Details</h3>
                  <form onSubmit={handleProfileSubmit}>
                    {profileError && <div className="alert alert-danger">{profileError}</div>}
                    {profileSuccess && <div className="alert alert-success">{profileSuccess}</div>}

                    {/* Photo upload */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '25px', backgroundColor: '#FAF9F6', padding: '15px', borderRadius: '8px' }}>
                      <div style={{ width: '70px', height: '70px', borderRadius: '50%', backgroundColor: 'white', overflow: 'hidden', border: '2px solid var(--primary-color)' }}>
                        {profileImage ? (
                          <img src={profileImage} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-color)', fontSize: '1.8rem', fontWeight: 'bold' }}>
                            {user.name?.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div>
                        <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', backgroundColor: 'var(--primary-color)', color: 'white', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 'bold', cursor: 'pointer' }}>
                          <Upload size={14} />
                          {uploading ? 'Uploading...' : 'Upload New Photo'}
                          <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} disabled={uploading} />
                        </label>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '5px' }}>Allowed formats: PNG, JPG, JPEG, GIF</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '15px' }}>
                      <div className="form-group" style={{ flex: 1 }}>
                        <label style={{ fontSize: '0.85rem', color: 'var(--text-dark)', fontWeight: '600', marginBottom: '6px', display: 'block' }}>Full Name</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          value={profileData.name} 
                          onChange={(e) => setProfileData({...profileData, name: e.target.value})} 
                        />
                      </div>
                      <div className="form-group" style={{ flex: 1 }}>
                        <label style={{ fontSize: '0.85rem', color: 'var(--text-dark)', fontWeight: '600', marginBottom: '6px', display: 'block' }}>Mobile Number</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          value={profileData.phone} 
                          onChange={(e) => setProfileData({...profileData, phone: e.target.value})} 
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label style={{ fontSize: '0.85rem', color: 'var(--text-dark)', fontWeight: '600', marginBottom: '6px', display: 'block' }}>Email Address</label>
                      <input 
                        type="email" 
                        className="form-control" 
                        value={profileData.email} 
                        onChange={(e) => setProfileData({...profileData, email: e.target.value})} 
                      />
                    </div>

                    <div style={{ borderTop: '1px solid var(--border-color)', margin: '20px 0', paddingTop: '15px' }}>
                      <strong style={{ display: 'block', marginBottom: '15px', color: 'var(--primary-dark)', fontSize: '1.05rem' }}>Delivery Address Details</strong>
                    </div>

                    <div style={{ display: 'flex', gap: '15px' }}>
                      <div className="form-group" style={{ flex: 1 }}>
                        <label style={{ fontSize: '0.85rem', color: 'var(--text-dark)', fontWeight: '600', marginBottom: '6px', display: 'block' }}>Door Number</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          value={profileData.door_number} 
                          onChange={(e) => setProfileData({...profileData, door_number: e.target.value})} 
                        />
                      </div>
                      <div className="form-group" style={{ flex: 2 }}>
                        <label style={{ fontSize: '0.85rem', color: 'var(--text-dark)', fontWeight: '600', marginBottom: '6px', display: 'block' }}>Street Name</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          value={profileData.street_name} 
                          onChange={(e) => setProfileData({...profileData, street_name: e.target.value})} 
                        />
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '15px' }}>
                      <div className="form-group" style={{ flex: 1 }}>
                        <label style={{ fontSize: '0.85rem', color: 'var(--text-dark)', fontWeight: '600', marginBottom: '6px', display: 'block' }}>Area / Locality</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          value={profileData.area} 
                          onChange={(e) => setProfileData({...profileData, area: e.target.value})} 
                        />
                      </div>
                      <div className="form-group" style={{ flex: 1 }}>
                        <label style={{ fontSize: '0.85rem', color: 'var(--text-dark)', fontWeight: '600', marginBottom: '6px', display: 'block' }}>City</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          value={profileData.city} 
                          onChange={(e) => setProfileData({...profileData, city: e.target.value})} 
                        />
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '15px' }}>
                      <div className="form-group" style={{ flex: 1 }}>
                        <label style={{ fontSize: '0.85rem', color: 'var(--text-dark)', fontWeight: '600', marginBottom: '6px', display: 'block' }}>State</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          value={profileData.state} 
                          onChange={(e) => setProfileData({...profileData, state: e.target.value})} 
                        />
                      </div>
                      <div className="form-group" style={{ flex: 1 }}>
                        <label style={{ fontSize: '0.85rem', color: 'var(--text-dark)', fontWeight: '600', marginBottom: '6px', display: 'block' }}>Pincode</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          value={profileData.pincode} 
                          onChange={(e) => setProfileData({...profileData, pincode: e.target.value})} 
                        />
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '15px' }}>
                      <div className="form-group" style={{ flex: 1 }}>
                        <label style={{ fontSize: '0.85rem', color: 'var(--text-dark)', fontWeight: '600', marginBottom: '6px', display: 'block' }}>Landmark</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          value={profileData.landmark} 
                          onChange={(e) => setProfileData({...profileData, landmark: e.target.value})} 
                        />
                      </div>
                      <div className="form-group" style={{ flex: 1 }}>
                        <label style={{ fontSize: '0.85rem', color: 'var(--text-dark)', fontWeight: '600', marginBottom: '6px', display: 'block' }}>Alternate Mobile</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          value={profileData.alternate_mobile} 
                          onChange={(e) => setProfileData({...profileData, alternate_mobile: e.target.value})} 
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label style={{ fontSize: '0.85rem', color: 'var(--text-dark)', fontWeight: '600', marginBottom: '6px', display: 'block' }}>Food Preference</label>
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
                              border: `1px solid ${profileData.preference === pref ? 'var(--primary-color)' : 'var(--border-color)'}`, 
                              backgroundColor: profileData.preference === pref ? 'rgba(200, 75, 49, 0.05)' : 'var(--bg-secondary)', 
                              borderRadius: 'var(--radius-sm)', 
                              cursor: 'pointer', 
                              fontWeight: '600', 
                              color: profileData.preference === pref ? 'var(--primary-color)' : 'var(--text-dark)',
                              transition: 'all 0.2s'
                            }}
                          >
                            <input 
                              type="radio" 
                              name="preference" 
                              value={pref} 
                              checked={profileData.preference === pref} 
                              onChange={(e) => setProfileData({...profileData, preference: e.target.value})} 
                              style={{ accentColor: 'var(--primary-color)' }} 
                            />
                            {pref}
                          </label>
                        ))}
                      </div>
                    </div>

                    <button type="submit" className="auth-submit-btn" style={{ marginTop: '10px' }}>
                      Save Changes
                    </button>
                  </form>
                </div>
              )}

              {/* TAB 6: CHANGE PASSWORD */}
              {activeTab === 'change-password' && (
                <div>
                  <h3 style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary-dark)', fontSize: '1.6rem', marginBottom: '20px' }}>Change Password</h3>
                  <form onSubmit={handlePasswordSubmit} style={{ maxWidth: '500px' }}>
                    {passwordError && <div className="alert alert-danger">{passwordError}</div>}
                    {passwordSuccess && <div className="alert alert-success">{passwordSuccess}</div>}

                    <div className="form-group">
                      <label style={{ fontSize: '0.85rem', color: 'var(--text-dark)', fontWeight: '600', marginBottom: '6px', display: 'block' }}>Current Password</label>
                      <input 
                        type="password" 
                        className="form-control" 
                        value={passwordData.current_password} 
                        onChange={(e) => setPasswordData({...passwordData, current_password: e.target.value})} 
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label style={{ fontSize: '0.85rem', color: 'var(--text-dark)', fontWeight: '600', marginBottom: '6px', display: 'block' }}>New Password</label>
                      <input 
                        type="password" 
                        className="form-control" 
                        value={passwordData.new_password} 
                        onChange={(e) => setPasswordData({...passwordData, new_password: e.target.value})} 
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label style={{ fontSize: '0.85rem', color: 'var(--text-dark)', fontWeight: '600', marginBottom: '6px', display: 'block' }}>Confirm New Password</label>
                      <input 
                        type="password" 
                        className="form-control" 
                        value={passwordData.confirm_password} 
                        onChange={(e) => setPasswordData({...passwordData, confirm_password: e.target.value})} 
                        required
                      />
                    </div>

                    <button type="submit" className="auth-submit-btn" style={{ marginTop: '10px' }}>
                      Change Password
                    </button>
                  </form>
                </div>
              )}

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default UserProfile;
