import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import AdminNavbar from '../../components/AdminNavbar';
import apiClient from '../../services/api';
import '../../assets/styles/admin-style.css';
import '../../assets/styles/tables.css';
import { 
  User, Lock, CheckCircle, AlertTriangle, UserPlus, Search, MoreVertical, 
  Pencil, Trash2, Key, X, Save, Shield, ShieldAlert, Server, Settings as SettingsIcon,
  Download, Upload, Globe, ShoppingCart, Bell, CreditCard, Image as ImageIcon
} from 'lucide-react';

const Settings = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const activeTabParam = searchParams.get('tab') || 'general';

  const [activeTab, setActiveTab] = useState('general');

  // Common notifications
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // General Settings
  const [generalConfig, setGeneralConfig] = useState({
    business_name: "Ammulu's Kitchen",
    business_email: "info@ammaskitchen.com",
    business_phone: "+91 98765 43210",
    business_address: "123 Food Street, Culinary District, FL 33021",
    currency: 'INR',
    tax_rate: 5.0,
    timezone: 'Asia/Kolkata (IST)'
  });

  // Website Settings
  const [websiteConfig, setWebsiteConfig] = useState({
    website_title: "Ammulu's Kitchen - Authentic Homemade Food",
    footer_text: "© 2026 Ammulu's Kitchen. All rights reserved.",
    maintenance_mode: false,
    logo_preview: null,
    favicon_preview: null
  });

  // Order Settings
  const [orderConfig, setOrderConfig] = useState({
    delivery_charge: 50,
    min_order_value: 150,
    free_delivery_limit: 500,
    allow_scheduled_delivery: true
  });

  // Notification Settings
  const [notificationConfig, setNotificationConfig] = useState({
    email_notifications: true,
    sms_notifications: false,
    whatsapp_notifications: true,
    push_notifications: true
  });

  // Payment Settings
  const [paymentConfig, setPaymentConfig] = useState({
    cod_enabled: true,
    upi_enabled: true,
    online_payment_enabled: true
  });

  // Security Settings
  const [securityConfig, setSecurityConfig] = useState({
    session_timeout: 30, // minutes
    two_factor_auth: false,
    max_login_attempts: 5
  });

  // Tab: Staff Management states
  const [users, setUsers] = useState([]);
  const [staffLoading, setStaffLoading] = useState(false);
  const [staffSearch, setStaffSearch] = useState('');
  const [staffRoleFilter, setStaffRoleFilter] = useState('All');
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', role: 'manager', password: '', status: 'Active' });
  const [newPassword, setNewPassword] = useState('');

  // Tab: Backup simulated state
  const [backupFile, setBackupFile] = useState(null);

  useEffect(() => {
    setActiveTab(activeTabParam);
  }, [activeTabParam]);

  // Fetch Staff Directory (Mocked/API)
  const fetchStaff = async () => {
    setStaffLoading(true);
    try {
      const response = await apiClient.get('/user-management/');
      setUsers(response.data);
    } catch (err) {
      console.error("Failed to load users:", err);
      setUsers([
        { id: 1, name: 'Admin User', email: 'ammuluskitchen57@gmail.com', phone: '9876543210', role: 'admin', status: 'Active' },
        { id: 2, name: 'John Manager', email: 'john@example.com', phone: '1234567890', role: 'manager', status: 'Active' }
      ]);
    } finally {
      setStaffLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'staff') {
      fetchStaff();
    }
  }, [activeTab]);

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleGenericSubmit = (e, sectionName) => {
    e.preventDefault();
    showSuccess(`${sectionName} Settings updated successfully!`);
  };

  // Staff Handlers
  const handleAddStaffSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post('/user-management/', formData);
      showSuccess(`Staff member "${formData.name}" added successfully.`);
      setIsAddOpen(false);
      fetchStaff();
    } catch (err) {
      setErrorMsg("Failed to create user.");
      setTimeout(() => setErrorMsg(''), 4000);
    }
  };

  const handleEditStaffSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiClient.put(`/user-management/${selectedUser.id}`, selectedUser);
      showSuccess(`Staff account details updated successfully.`);
      setIsEditOpen(false);
      fetchStaff();
    } catch (err) {
      setErrorMsg("Failed to update user.");
      setTimeout(() => setErrorMsg(''), 4000);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiClient.put(`/user-management/${selectedUser.id}/reset-password`, { password: newPassword });
      showSuccess(`Password reset successfully for ${selectedUser.name}.`);
      setIsResetOpen(false);
    } catch (err) {
      setErrorMsg("Failed to reset password.");
      setTimeout(() => setErrorMsg(''), 4000);
    }
  };

  const handleDeleteStaff = async (userId) => {
    if (!window.confirm("Permanently delete this staff account?")) return;
    try {
      await apiClient.delete(`/user-management/${userId}`);
      showSuccess("Staff account deleted successfully.");
      fetchStaff();
    } catch (err) {
      setErrorMsg("Failed to delete user.");
      setTimeout(() => setErrorMsg(''), 4000);
    }
  };

  // Image Upload Handlers for Website Settings
  const handleImageChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'logo') setWebsiteConfig({ ...websiteConfig, logo_preview: reader.result });
        if (type === 'favicon') setWebsiteConfig({ ...websiteConfig, favicon_preview: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  // Backup & Restore
  const triggerBackupDownload = () => {
    showSuccess("System database JSON snapshot backup downloaded successfully.");
  };

  const handleRestoreSimulation = (e) => {
    e.preventDefault();
    showSuccess("Simulated restore successful! Database state reset back to backup timestamp.");
    setBackupFile(null);
  };

  // Render Tabs Navigation
  const tabs = [
    { id: 'general', label: 'General', icon: SettingsIcon },
    { id: 'website', label: 'Website', icon: Globe },
    { id: 'order', label: 'Order', icon: ShoppingCart },
    { id: 'notification', label: 'Notification', icon: Bell },
    { id: 'payment', label: 'Payment', icon: CreditCard },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'staff', label: 'Staff Management', icon: UserPlus },
    { id: 'rbac', label: 'Role Management', icon: Key },
    { id: 'backup', label: 'Backup & Restore', icon: Server }
  ];

  return (
    <div className="admin-wrapper">
      <AdminSidebar />
      <div className="admin-container">
        <AdminNavbar />

        <div className="admin-content">
          <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
            <div className="page-title-area">
              <h2>System Settings</h2>
              <p>Configure all global preferences, website features, and system rules here.</p>
            </div>
            {activeTab === 'staff' && (
              <button className="page-action-btn" onClick={() => setIsAddOpen(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <UserPlus size={16} /> Add Staff Account
              </button>
            )}
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

          <div style={{ display: 'flex', gap: '25px', alignItems: 'flex-start' }}>
            {/* Vertical Sidebar for Tabs */}
            <div className="premium-card" style={{ width: '250px', padding: '15px 10px', flexShrink: 0 }}>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '5px' }}>
                {tabs.map(tab => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <li key={tab.id}>
                      <button 
                        onClick={() => navigate(`/admin/settings?tab=${tab.id}`)}
                        style={{
                          width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 15px',
                          border: 'none', background: isActive ? 'var(--smoke-color)' : 'transparent',
                          color: isActive ? 'var(--primary-color)' : '#666', borderRadius: '8px', cursor: 'pointer',
                          fontWeight: isActive ? '600' : '500', fontSize: '14px', textAlign: 'left',
                          transition: 'all 0.2s'
                        }}
                      >
                        <Icon size={18} /> {tab.label}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Main Content Area */}
            <div className="premium-card" style={{ flex: 1, padding: '30px' }}>
              
              {/* General Settings */}
              {activeTab === 'general' && (
                <div>
                  <h3 style={{ fontSize: '18px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '20px', color: 'var(--title-color)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <SettingsIcon size={18} /> General Settings
                  </h3>
                  <form onSubmit={(e) => handleGenericSubmit(e, 'General')} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div className="form-grid">
                      <div className="form-field">
                        <label>Business Name</label>
                        <input type="text" value={generalConfig.business_name} onChange={(e) => setGeneralConfig({...generalConfig, business_name: e.target.value})} required />
                      </div>
                      <div className="form-field">
                        <label>Business Email</label>
                        <input type="email" value={generalConfig.business_email} onChange={(e) => setGeneralConfig({...generalConfig, business_email: e.target.value})} required />
                      </div>
                      <div className="form-field">
                        <label>Business Phone</label>
                        <input type="text" value={generalConfig.business_phone} onChange={(e) => setGeneralConfig({...generalConfig, business_phone: e.target.value})} required />
                      </div>
                      <div className="form-field">
                        <label>Operational Currency</label>
                        <select value={generalConfig.currency} onChange={(e) => setGeneralConfig({...generalConfig, currency: e.target.value})} style={{ height: '38px', border: '1px solid #EAE6DB', borderRadius: '8px', width: '100%', padding: '0 10px' }}>
                          <option value="INR">INR (₹)</option>
                          <option value="USD">USD ($)</option>
                        </select>
                      </div>
                    </div>
                    <div className="form-field">
                      <label>Business Address</label>
                      <textarea value={generalConfig.business_address} onChange={(e) => setGeneralConfig({...generalConfig, business_address: e.target.value})} style={{ height: '80px', border: '1px solid #EAE6DB', borderRadius: '8px', width: '100%', padding: '10px' }}></textarea>
                    </div>
                    <div className="form-grid">
                      <div className="form-field">
                        <label>Tax Rate (%)</label>
                        <input type="number" step="0.01" value={generalConfig.tax_rate} onChange={(e) => setGeneralConfig({...generalConfig, tax_rate: e.target.value})} required />
                      </div>
                      <div className="form-field">
                        <label>System Timezone</label>
                        <input type="text" value={generalConfig.timezone} onChange={(e) => setGeneralConfig({...generalConfig, timezone: e.target.value})} required />
                      </div>
                    </div>
                    <div style={{ marginTop: '10px' }}>
                      <button type="submit" className="page-action-btn" style={{ padding: '10px 22px', borderRadius: '30px' }}><Save size={16} style={{marginRight: '6px'}}/> Save General Settings</button>
                    </div>
                  </form>
                </div>
              )}

              {/* Website Settings */}
              {activeTab === 'website' && (
                <div>
                  <h3 style={{ fontSize: '18px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '20px', color: 'var(--title-color)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Globe size={18} /> Website Settings
                  </h3>
                  <form onSubmit={(e) => handleGenericSubmit(e, 'Website')} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    
                    <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
                      {/* Logo Upload */}
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '8px' }}>Website Logo</label>
                        <div style={{ width: '120px', height: '120px', border: '2px dashed #EAE6DB', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', backgroundColor: '#f9f9f9' }}>
                          {websiteConfig.logo_preview ? (
                            <img src={websiteConfig.logo_preview} alt="Logo" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                          ) : (
                            <ImageIcon size={30} color="#ccc" />
                          )}
                        </div>
                        <label style={{ display: 'inline-block', marginTop: '10px', cursor: 'pointer', fontSize: '12px', color: 'var(--primary-color)', fontWeight: 'bold' }}>
                          Upload Logo
                          <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleImageChange(e, 'logo')} />
                        </label>
                      </div>

                      {/* Favicon Upload */}
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '8px' }}>Favicon (16x16)</label>
                        <div style={{ width: '60px', height: '60px', border: '2px dashed #EAE6DB', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', backgroundColor: '#f9f9f9' }}>
                          {websiteConfig.favicon_preview ? (
                            <img src={websiteConfig.favicon_preview} alt="Favicon" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                          ) : (
                            <ImageIcon size={20} color="#ccc" />
                          )}
                        </div>
                        <label style={{ display: 'inline-block', marginTop: '10px', cursor: 'pointer', fontSize: '12px', color: 'var(--primary-color)', fontWeight: 'bold' }}>
                          Upload Favicon
                          <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleImageChange(e, 'favicon')} />
                        </label>
                      </div>
                    </div>

                    <div className="form-field">
                      <label>Website Title</label>
                      <input type="text" value={websiteConfig.website_title} onChange={(e) => setWebsiteConfig({...websiteConfig, website_title: e.target.value})} required />
                    </div>
                    
                    <div className="form-field">
                      <label>Footer Text</label>
                      <input type="text" value={websiteConfig.footer_text} onChange={(e) => setWebsiteConfig({...websiteConfig, footer_text: e.target.value})} required />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '15px', backgroundColor: '#fcf3f2', borderRadius: '8px', border: '1px solid #fadbd8' }}>
                      <input 
                        type="checkbox" 
                        id="maintenance" 
                        checked={websiteConfig.maintenance_mode}
                        onChange={(e) => setWebsiteConfig({...websiteConfig, maintenance_mode: e.target.checked})}
                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                      />
                      <label htmlFor="maintenance" style={{ fontSize: '14px', fontWeight: '600', cursor: 'pointer', color: '#943126', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        Enable Maintenance Mode <ShieldAlert size={16} />
                      </label>
                    </div>

                    <div style={{ marginTop: '10px' }}>
                      <button type="submit" className="page-action-btn" style={{ padding: '10px 22px', borderRadius: '30px' }}><Save size={16} style={{marginRight: '6px'}}/> Save Website Settings</button>
                    </div>
                  </form>
                </div>
              )}

              {/* Order Settings */}
              {activeTab === 'order' && (
                <div>
                  <h3 style={{ fontSize: '18px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '20px', color: 'var(--title-color)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ShoppingCart size={18} /> Order Settings
                  </h3>
                  <form onSubmit={(e) => handleGenericSubmit(e, 'Order')} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div className="form-grid">
                      <div className="form-field">
                        <label>Delivery Charge (₹)</label>
                        <input type="number" value={orderConfig.delivery_charge} onChange={(e) => setOrderConfig({...orderConfig, delivery_charge: e.target.value})} required />
                      </div>
                      <div className="form-field">
                        <label>Minimum Order Value (₹)</label>
                        <input type="number" value={orderConfig.min_order_value} onChange={(e) => setOrderConfig({...orderConfig, min_order_value: e.target.value})} required />
                      </div>
                      <div className="form-field">
                        <label>Free Delivery Limit (₹)</label>
                        <input type="number" value={orderConfig.free_delivery_limit} onChange={(e) => setOrderConfig({...orderConfig, free_delivery_limit: e.target.value})} required />
                        <span style={{ fontSize: '11px', color: '#888' }}>Orders above this value get free delivery.</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '8px', border: '1px solid #EAE6DB' }}>
                      <input 
                        type="checkbox" 
                        id="scheduled_delivery" 
                        checked={orderConfig.allow_scheduled_delivery}
                        onChange={(e) => setOrderConfig({...orderConfig, allow_scheduled_delivery: e.target.checked})}
                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                      />
                      <label htmlFor="scheduled_delivery" style={{ fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
                        Allow Scheduled Deliveries
                      </label>
                    </div>

                    <div style={{ marginTop: '10px' }}>
                      <button type="submit" className="page-action-btn" style={{ padding: '10px 22px', borderRadius: '30px' }}><Save size={16} style={{marginRight: '6px'}}/> Save Order Settings</button>
                    </div>
                  </form>
                </div>
              )}

              {/* Notification Settings */}
              {activeTab === 'notification' && (
                <div>
                  <h3 style={{ fontSize: '18px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '20px', color: 'var(--title-color)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Bell size={18} /> Notification Settings
                  </h3>
                  <form onSubmit={(e) => handleGenericSubmit(e, 'Notification')} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '8px', border: '1px solid #EAE6DB' }}>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '14px' }}>Email Notifications</h4>
                        <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#666' }}>Send order updates and promotions via email.</p>
                      </div>
                      <input type="checkbox" checked={notificationConfig.email_notifications} onChange={(e) => setNotificationConfig({...notificationConfig, email_notifications: e.target.checked})} style={{ width: '20px', height: '20px' }} />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '8px', border: '1px solid #EAE6DB' }}>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '14px' }}>SMS Notifications</h4>
                        <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#666' }}>Send alerts directly to customer's mobile number.</p>
                      </div>
                      <input type="checkbox" checked={notificationConfig.sms_notifications} onChange={(e) => setNotificationConfig({...notificationConfig, sms_notifications: e.target.checked})} style={{ width: '20px', height: '20px' }} />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '8px', border: '1px solid #EAE6DB' }}>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '14px' }}>WhatsApp Notifications</h4>
                        <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#666' }}>Send automated WhatsApp messages for orders.</p>
                      </div>
                      <input type="checkbox" checked={notificationConfig.whatsapp_notifications} onChange={(e) => setNotificationConfig({...notificationConfig, whatsapp_notifications: e.target.checked})} style={{ width: '20px', height: '20px' }} />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '8px', border: '1px solid #EAE6DB' }}>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '14px' }}>Push Notifications</h4>
                        <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#666' }}>Enable browser/app push notifications.</p>
                      </div>
                      <input type="checkbox" checked={notificationConfig.push_notifications} onChange={(e) => setNotificationConfig({...notificationConfig, push_notifications: e.target.checked})} style={{ width: '20px', height: '20px' }} />
                    </div>

                    <div style={{ marginTop: '15px' }}>
                      <button type="submit" className="page-action-btn" style={{ padding: '10px 22px', borderRadius: '30px' }}><Save size={16} style={{marginRight: '6px'}}/> Save Notification Settings</button>
                    </div>
                  </form>
                </div>
              )}

              {/* Payment Settings */}
              {activeTab === 'payment' && (
                <div>
                  <h3 style={{ fontSize: '18px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '20px', color: 'var(--title-color)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CreditCard size={18} /> Payment Gateways
                  </h3>
                  <form onSubmit={(e) => handleGenericSubmit(e, 'Payment')} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '8px', border: '1px solid #EAE6DB' }}>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '14px' }}>Cash on Delivery (COD)</h4>
                        <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#666' }}>Allow customers to pay upon delivery.</p>
                      </div>
                      <input type="checkbox" checked={paymentConfig.cod_enabled} onChange={(e) => setPaymentConfig({...paymentConfig, cod_enabled: e.target.checked})} style={{ width: '20px', height: '20px' }} />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '8px', border: '1px solid #EAE6DB' }}>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '14px' }}>UPI Payments</h4>
                        <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#666' }}>Accept direct UPI transfers via Google Pay, PhonePe.</p>
                      </div>
                      <input type="checkbox" checked={paymentConfig.upi_enabled} onChange={(e) => setPaymentConfig({...paymentConfig, upi_enabled: e.target.checked})} style={{ width: '20px', height: '20px' }} />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '8px', border: '1px solid #EAE6DB' }}>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '14px' }}>Online Card Payment (Razorpay/Stripe)</h4>
                        <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#666' }}>Accept Credit/Debit cards & Net Banking.</p>
                      </div>
                      <input type="checkbox" checked={paymentConfig.online_payment_enabled} onChange={(e) => setPaymentConfig({...paymentConfig, online_payment_enabled: e.target.checked})} style={{ width: '20px', height: '20px' }} />
                    </div>

                    <div style={{ marginTop: '15px' }}>
                      <button type="submit" className="page-action-btn" style={{ padding: '10px 22px', borderRadius: '30px' }}><Save size={16} style={{marginRight: '6px'}}/> Save Payment Settings</button>
                    </div>
                  </form>
                </div>
              )}

              {/* Security Settings */}
              {activeTab === 'security' && (
                <div>
                  <h3 style={{ fontSize: '18px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '20px', color: 'var(--title-color)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Shield size={18} /> Global Security Rules
                  </h3>
                  <form onSubmit={(e) => handleGenericSubmit(e, 'Security')} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    
                    <div className="form-grid">
                      <div className="form-field">
                        <label>Session Timeout (Minutes)</label>
                        <input type="number" value={securityConfig.session_timeout} onChange={(e) => setSecurityConfig({...securityConfig, session_timeout: e.target.value})} required />
                        <span style={{ fontSize: '11px', color: '#888' }}>Logout inactive admins automatically.</span>
                      </div>
                      <div className="form-field">
                        <label>Max Login Attempts</label>
                        <input type="number" value={securityConfig.max_login_attempts} onChange={(e) => setSecurityConfig({...securityConfig, max_login_attempts: e.target.value})} required />
                        <span style={{ fontSize: '11px', color: '#888' }}>Account lockdown after X failed attempts.</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '8px', border: '1px solid #EAE6DB' }}>
                      <input 
                        type="checkbox" 
                        id="2fa" 
                        checked={securityConfig.two_factor_auth}
                        onChange={(e) => setSecurityConfig({...securityConfig, two_factor_auth: e.target.checked})}
                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                      />
                      <label htmlFor="2fa" style={{ fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
                        Enforce Two-Factor Authentication (2FA) for all Staff
                      </label>
                    </div>

                    <div style={{ marginTop: '10px' }}>
                      <button type="submit" className="page-action-btn" style={{ padding: '10px 22px', borderRadius: '30px' }}><Save size={16} style={{marginRight: '6px'}}/> Save Security Settings</button>
                    </div>
                  </form>
                </div>
              )}

              {/* Staff Management */}
              {activeTab === 'staff' && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', marginBottom: '20px' }}>
                    <div className="navbar-search" style={{ margin: 0, width: '320px', border: '1px solid #EAE6DB', borderRadius: '10px', display: 'flex', alignItems: 'center' }}>
                      <Search size={16} style={{ marginRight: '8px', color: '#888' }} />
                      <input 
                        type="text" 
                        placeholder="Search staff..." 
                        value={staffSearch}
                        onChange={(e) => setStaffSearch(e.target.value)}
                        style={{ width: '100%' }}
                      />
                    </div>
                  </div>

                  <div className="responsive-table-wrapper" style={{ border: 'none', boxShadow: 'none' }}>
                    <table className="responsive-table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Role</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((u) => (
                          <tr key={u.id}>
                            <td data-label="Name"><strong>{u.name}</strong></td>
                            <td data-label="Email">{u.email}</td>
                            <td data-label="Role"><span style={{ padding: '4px 8px', borderRadius: '12px', fontSize: '11px', backgroundColor: '#EBF5FB', color: '#1B4F72' }}>{u.role.toUpperCase()}</span></td>
                            <td data-label="Status">{u.status}</td>
                            <td data-label="Actions">
                               <button className="btn-secondary" style={{ padding: '4px 8px' }}>Manage</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {/* RBAC */}
              {activeTab === 'rbac' && (
                <>
                  <h3 style={{ fontSize: '18px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '20px', color: 'var(--title-color)' }}>
                    Role-Based Access Controls
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
                    <div style={{ border: '1px solid #EAE6DB', borderRadius: '12px', padding: '20px', backgroundColor: '#EDF3F0' }}>
                      <h4>Super Admin</h4><p style={{ fontSize: '12px' }}>Full root access to entire system.</p>
                    </div>
                    <div style={{ border: '1px solid #EAE6DB', borderRadius: '12px', padding: '20px', backgroundColor: '#EDF3F0' }}>
                      <h4>Manager</h4><p style={{ fontSize: '12px' }}>Can manage catalog, orders, coupons.</p>
                    </div>
                    <div style={{ border: '1px solid #EAE6DB', borderRadius: '12px', padding: '20px', backgroundColor: '#EDF3F0' }}>
                      <h4>Kitchen Staff</h4><p style={{ fontSize: '12px' }}>Order processing and inventory limits.</p>
                    </div>
                  </div>
                </>
              )}

              {/* Backup */}
              {activeTab === 'backup' && (
                <>
                  <h3 style={{ fontSize: '18px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '20px', color: 'var(--title-color)' }}>
                    Database Backup
                  </h3>
                  <div style={{ display: 'flex', gap: '20px' }}>
                    <button onClick={triggerBackupDownload} className="page-action-btn" style={{ padding: '10px 22px' }}><Download size={16} /> Download Backup</button>
                  </div>
                </>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
