import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiClient from '../services/api';
import GlobalSearchModal from './GlobalSearchModal';
import { 
  Menu, 
  Search, 
  Calendar, 
  Mail, 
  Bell, 
  Eye, 
  Check, 
  Trash2, 
  ShoppingCart, 
  UserPlus, 
  AlertTriangle, 
  Star, 
  PartyPopper, 
  ChevronDown, 
  X, 
  User, 
  Settings, 
  Key, 
  Clock, 
  Phone, 
  Activity, 
  LogOut, 
  HelpCircle 
} from 'lucide-react';

const AdminNavbar = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const [currentDate, setCurrentDate] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMailOpen, setIsMailOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  // Business metrics for profile card
  const [stats, setStats] = useState({
    total_orders: 1248,
    total_revenue: 184500,
    total_products: 42
  });

  // Mock Messages (Mail popup)
  const [messages, setMessages] = useState([]);

  const [selectedMessage, setSelectedMessage] = useState(null);

  // Mock Notifications
  const [notifications, setNotifications] = useState([]);

  // Refs for click outside detection
  const profileRef = useRef(null);
  const mailRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    setCurrentDate(new Date().toLocaleDateString("en-US", options));

    // Fetch stats for business profile card section
    const fetchStats = async () => {
      try {
        const response = await apiClient.get('/admin/dashboard-stats');
        if (response.data) {
          setStats({
            total_orders: response.data.total_orders || 0,
            total_revenue: response.data.total_revenue || 0,
            total_products: response.data.total_products || 0
          });
        }
      } catch (err) {
        console.error("Failed to fetch stats for admin profile card:", err);
      }
    };
    fetchStats();
  }, []);

  // Polling API for notifications and messages
  useEffect(() => {
    let prevUnreadNotifs = 0;
    let prevUnreadMsgs = 0;

    const playNotificationSound = () => {
      try {
        // Base64 encoded short beep sound
        const beepSound = new Audio('data:audio/mp3;base64,//NExAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//NExAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq');
        beepSound.play().catch(e => console.log('Audio play failed (browser auto-play policy):', e));
      } catch(e) {}
    };

    const fetchInbox = async () => {
      try {
        const notifRes = await apiClient.get('/notifications');
        if (notifRes.data) {
          const fetchedNotifs = notifRes.data.map(n => ({
            id: n.id,
            type: n.type || "Notification",
            message: n.message,
            date: new Date(n.created_at).toLocaleString(),
            read: n.is_read
          }));
          setNotifications(fetchedNotifs);
          
          const currentUnread = fetchedNotifs.filter(n => !n.read).length;
          if (currentUnread > prevUnreadNotifs) {
            playNotificationSound();
          }
          prevUnreadNotifs = currentUnread;
        }

        const msgRes = await apiClient.get('/contact');
        if (msgRes.data) {
          const fetchedMsgs = msgRes.data.map(m => ({
            id: m.id,
            sender: m.name,
            subject: m.subject || "Customer Inquiry",
            body: m.message,
            date: new Date(m.created_at).toLocaleString(),
            read: m.status === 'Resolved'
          }));
          setMessages(fetchedMsgs);

          const currentUnreadMsg = fetchedMsgs.filter(m => !m.read).length;
          if (currentUnreadMsg > prevUnreadMsgs) {
            playNotificationSound();
          }
          prevUnreadMsgs = currentUnreadMsg;
        }
      } catch (err) {
        console.error("Failed to fetch inbox:", err);
      }
    };

    fetchInbox();
    const interval = setInterval(fetchInbox, 5000);
    return () => clearInterval(interval);
  }, []);

  // Click outside detection hook
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      if (mailRef.current && !mailRef.current.contains(event.target)) {
        setIsMailOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleToggleSidebar = () => {
    window.dispatchEvent(new CustomEvent('toggleSidebar'));
  };

  // Message functions
  const handleOpenMessage = (msg) => {
    setSelectedMessage(msg);
    // Mark as read
    setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, read: true } : m));
  };

  const handleMarkMessageRead = (id, e) => {
    e.stopPropagation();
    setMessages(prev => prev.map(m => m.id === id ? { ...m, read: true } : m));
  };

  const handleDeleteMessage = (id, e) => {
    e.stopPropagation();
    setMessages(prev => prev.filter(m => m.id !== id));
    if (selectedMessage && selectedMessage.id === id) {
      setSelectedMessage(null);
    }
  };

  // Notification functions
  const handleMarkNotificationRead = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await apiClient.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch(err) { console.error(err); }
  };

  const handleMarkAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleClearNotifications = async () => {
    try {
      await apiClient.delete('/notifications/clear');
      setNotifications([]);
    } catch(err) { console.error(err); }
  };

  const handleConfirmLogout = () => {
    setShowLogoutConfirm(false);
    logout();
    navigate('/');
  };

  const unreadMessagesCount = messages.filter(m => !m.read).length;
  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  return (
    <>
      <div className="admin-navbar">
        <div className="navbar-left">
          <button className="sidebar-toggle" id="sidebarToggleBtn" onClick={handleToggleSidebar} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Menu size={20} strokeWidth={2.2} />
          </button>
          
          <div className="navbar-search" style={{ display: 'flex', alignItems: 'center' }}>
            <Search size={16} strokeWidth={2.2} style={{ color: '#888', marginRight: '8px' }} />
            <input type="text" placeholder="Search orders, products, inventory..." />
          </div>

          <button className="mobile-search-trigger" onClick={() => setIsSearchModalOpen(true)}>
            <Search size={20} strokeWidth={2.2} />
          </button>
        </div>
        <div className="navbar-right">
          <div className="navbar-date" id="navDateDisplay" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={16} strokeWidth={2.2} style={{ color: 'var(--primary-color)' }} />
            <span>{currentDate}</span>
          </div>

          <div className="navbar-actions" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            {/* Mail Icon Dropdown wrapper */}
            <div className="position-relative" ref={mailRef} style={{ position: 'relative' }}>
              <button 
                className="navbar-action-btn" 
                title="Messages"
                onClick={() => {
                  setIsMailOpen(!isMailOpen);
                  setIsNotificationsOpen(false);
                  setIsProfileOpen(false);
                }}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <Mail size={18} strokeWidth={2.2} />
                {unreadMessagesCount > 0 && <span className="badge">{unreadMessagesCount}</span>}
              </button>


            </div>

            {/* Notification Icon Dropdown wrapper */}
            <div className="position-relative" ref={notifRef} style={{ position: 'relative' }}>
              <button 
                className="navbar-action-btn" 
                title="System Alerts"
                onClick={() => {
                  setIsNotificationsOpen(!isNotificationsOpen);
                  setIsMailOpen(false);
                  setIsProfileOpen(false);
                }}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <Bell size={18} strokeWidth={2.2} />
                {unreadNotificationsCount > 0 && <span className="badge pulse" id="navNotificationCount">{unreadNotificationsCount}</span>}
              </button>


            </div>
          </div>

          {/* User Profile Dropdown wrapper */}
          <div className="navbar-user-dropdown" ref={profileRef} onClick={() => {
            setIsProfileOpen(!isProfileOpen);
            setIsMailOpen(false);
            setIsNotificationsOpen(false);
          }} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: 'var(--theme-color)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              fontSize: '14px',
              border: '2px solid var(--theme-color2)',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              {(user?.name || 'A').charAt(0).toUpperCase()}
            </div>
            <div className="navbar-user-info d-none d-md-flex" style={{ display: 'flex', flexDirection: 'column' }}>
              <span className="navbar-user-name" style={{ fontWeight: '600', color: 'var(--title-color)' }}>{user?.name || "Amma's User"}</span>
              <span className="navbar-user-role" style={{ fontSize: '11px', color: '#666' }}>
                {user?.role === 'admin' ? 'Super Admin' : user?.role === 'manager' ? 'Manager' : user?.role === 'kitchen_staff' ? 'Kitchen Staff' : 'Delivery Agent'}
              </span>
            </div>
            <ChevronDown size={14} style={{ color: '#555' }} />


          </div>
        </div>
      </div>

      {/* Mail Modal Overlay */}
      {isMailOpen && (
        <div className="admin-modal-overlay" onClick={() => setIsMailOpen(false)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1050 }}>
          <div className="dropdown-panel" onClick={(e) => e.stopPropagation()} style={{ position: 'relative', top: 'auto', right: 'auto', width: '350px', maxWidth: '90vw', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
            <div className="dropdown-panel-header">
              <h4>Recent Messages</h4>
              <span className="badge-status active" style={{ padding: '2px 8px', fontSize: '10px' }}>
                {unreadMessagesCount} Unread
              </span>
            </div>
            <div className="dropdown-panel-body" style={{ overflowY: 'auto' }}>
              {messages.length > 0 ? (
                messages.map(msg => (
                  <div 
                    key={msg.id} 
                    className={`message-item ${!msg.read ? 'unread' : ''}`}
                    onClick={() => handleOpenMessage(msg)}
                  >
                    <div className="message-header">
                      <span className="message-sender">{msg.sender}</span>
                      <span className="message-date">{msg.date}</span>
                    </div>
                    <div className="message-subject">{msg.subject}</div>
                    <div className="message-actions" style={{ display: 'flex', gap: '6px', marginTop: '10px' }}>
                      <button className="msg-action-btn open" onClick={() => handleOpenMessage(msg)} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Eye size={12} /> Open
                      </button>
                      {!msg.read && (
                        <button className="msg-action-btn read" onClick={(e) => handleMarkMessageRead(msg.id, e)} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Check size={12} /> Read
                        </button>
                      )}
                      <button className="msg-action-btn delete" onClick={(e) => handleDeleteMessage(msg.id, e)} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Trash2 size={12} /> Delete
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted" style={{ padding: '30px 10px', fontSize: '12px' }}>
                  No messages found.
                </div>
              )}
            </div>
            <div className="dropdown-panel-footer">
              <span>Inbox Operations</span>
              <button className="dropdown-footer-btn" onClick={async () => {
                try {
                  await apiClient.delete('/contact/clear');
                  setMessages([]);
                } catch(err) { console.error(err); }
              }}>Clear Inbox</button>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Modal Overlay */}
      {isNotificationsOpen && (
        <div className="admin-modal-overlay" onClick={() => setIsNotificationsOpen(false)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1050 }}>
          <div className="dropdown-panel" onClick={(e) => e.stopPropagation()} style={{ position: 'relative', top: 'auto', right: 'auto', width: '350px', maxWidth: '90vw', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
            <div className="dropdown-panel-header">
              <h4>Notifications</h4>
              <span className="badge-status pending" style={{ padding: '2px 8px', fontSize: '10px' }}>
                {unreadNotificationsCount} Alerts
              </span>
            </div>
            <div className="dropdown-panel-body" style={{ overflowY: 'auto' }}>
              {notifications.length > 0 ? (
                notifications.map(notif => {
                  let IconComponent = Bell;
                  let bgClass = "rgba(47, 57, 74, 0.08)";
                  let iconColor = "#666";
                  
                  if (notif.type === "New Orders") {
                    IconComponent = ShoppingCart;
                    bgClass = "rgba(63, 144, 101, 0.1)";
                    iconColor = "#3F9065";
                  } else if (notif.type === "New Registrations") {
                    IconComponent = UserPlus;
                    bgClass = "rgba(47, 57, 74, 0.1)";
                    iconColor = "#2F394A";
                  } else if (notif.type === "Low Stock Updates") {
                    IconComponent = AlertTriangle;
                    bgClass = "rgba(235, 20, 0, 0.1)";
                    iconColor = "#eb1400";
                  } else if (notif.type === "Review Approvals") {
                    IconComponent = Star;
                    bgClass = "rgba(241, 196, 15, 0.15)";
                    iconColor = "#f1c40f";
                  } else if (notif.type === "Bulk Order Requests") {
                    IconComponent = PartyPopper;
                    bgClass = "rgba(47, 57, 74, 0.1)";
                    iconColor = "#2F394A";
                  }

                  return (
                    <div 
                      key={notif.id} 
                      className={`notification-item ${!notif.read ? 'unread' : ''}`}
                      onClick={() => handleMarkNotificationRead(notif.id)}
                      style={{ display: 'flex', gap: '12px', padding: '12px' }}
                    >
                      <div className="notif-icon" style={{ backgroundColor: bgClass, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0 }}>
                        <IconComponent size={14} style={{ color: iconColor }} />
                      </div>
                      <div className="notif-content" style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                        <span className="notif-msg" style={{ fontSize: '12px', fontWeight: '600', color: 'var(--title-color)', lineHeight: '1.4' }}>{notif.message}</span>
                        <span className="notif-date" style={{ fontSize: '10px', color: '#888', marginTop: '4px' }}>{notif.date}</span>
                      </div>
                      {!notif.read && <span className="notif-unread-dot" style={{ width: '6px', height: '6px', backgroundColor: 'var(--theme-color)', borderRadius: '50%', alignSelf: 'center', flexShrink: 0 }}></span>}
                    </div>
                  );
                })
              ) : (
                <div className="text-center text-muted" style={{ padding: '30px 10px', fontSize: '12px' }}>
                  No notifications found.
                </div>
              )}
            </div>
            <div className="dropdown-panel-footer" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button className="dropdown-footer-btn" onClick={handleMarkAllNotificationsRead}>Mark as Read</button>
              <button className="dropdown-footer-btn" onClick={handleClearNotifications}>Clear</button>
              <Link to="/admin/notifications" className="dropdown-footer-btn" onClick={() => setIsNotificationsOpen(false)}>
                View All
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Profile Modal Overlay */}
      {isProfileOpen && (
        <div className="admin-modal-overlay" onClick={() => setIsProfileOpen(false)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1050 }}>
          <div className="profile-dropdown-card" onClick={(e) => e.stopPropagation()} style={{ position: 'relative', top: 'auto', right: 'auto', width: '330px', maxWidth: '90vw', padding: '20px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
            {/* PROFILE SECTION */}
            <div>
              <h5 className="section-title">Profile Section</h5>
              <div className="profile-header-area" style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                <div style={{
                  width: '45px',
                  height: '45px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--theme-color)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: '18px',
                  border: '2px solid var(--theme-color2)',
                  marginRight: '10px'
                }}>
                  {(user?.name || 'A').charAt(0).toUpperCase()}
                </div>
                <div className="profile-header-details" style={{ display: 'flex', flexDirection: 'column' }}>
                  <span className="profile-header-name" style={{ fontWeight: '600' }}>{user?.name || "Amma's User"}</span>
                  <span className="profile-header-role" style={{ fontSize: '11px', color: '#666' }}>
                    {user?.role === 'admin' ? 'Super Admin' : user?.role === 'manager' ? 'Manager' : user?.role === 'kitchen_staff' ? 'Kitchen Staff' : 'Delivery Agent'}
                  </span>
                </div>
              </div>
              <div className="profile-info-list" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div className="profile-info-item" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                  <Mail size={14} className="text-secondary" />
                  <span>{user?.email || "ammuluskitchen57@gmail.com"}</span>
                </div>
                <div className="profile-info-item" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                  <Phone size={14} className="text-secondary" />
                  <span>{user?.phone || "+91 98765 43210"}</span>
                </div>
                <div className="profile-info-item" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                  <Clock size={14} className="text-secondary" />
                  <span>Last Login: Today, 10:30 AM</span>
                </div>
              </div>
            </div>

            {/* ACCOUNT SECTION */}
            <div style={{ marginTop: '15px' }}>
              <h5 className="section-title">Account Section</h5>
              <div className="profile-links-list" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <Link to="/admin/settings" className="profile-link-item" onClick={() => setIsProfileOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                  <User size={14} />
                  <span>View Profile</span>
                </Link>
                <Link to="/admin/settings" className="profile-link-item" onClick={() => setIsProfileOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                  <Settings size={14} />
                  <span>Edit Profile</span>
                </Link>
                <Link to="/admin/settings" className="profile-link-item" onClick={() => setIsProfileOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                  <Key size={14} />
                  <span>Change Password</span>
                </Link>
              </div>
            </div>

            {/* BUSINESS SECTION */}
            <div style={{ marginTop: '15px' }}>
              <h5 className="section-title">Business Section</h5>
              <div className="business-stats-summary" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginTop: '6px' }}>
                <div className="business-stat-card" style={{ padding: '6px', textAlign: 'center', border: '1px solid #EAE6DB', borderRadius: '8px' }}>
                  <span className="business-stat-val" style={{ display: 'block', fontWeight: '700', fontSize: '12px' }}>{stats.total_orders}</span>
                  <span className="business-stat-lbl" style={{ fontSize: '9px', color: '#666' }}>Orders</span>
                </div>
                <div className="business-stat-card" style={{ padding: '6px', textAlign: 'center', border: '1px solid #EAE6DB', borderRadius: '8px' }}>
                  <span className="business-stat-val" style={{ display: 'block', fontWeight: '700', fontSize: '11px', whiteSpace: 'nowrap' }}>{Math.round(stats.total_revenue / 1000)}k</span>
                  <span className="business-stat-lbl" style={{ fontSize: '9px', color: '#666' }}>Sales</span>
                </div>
                <div className="business-stat-card" style={{ padding: '6px', textAlign: 'center', border: '1px solid #EAE6DB', borderRadius: '8px' }}>
                  <span className="business-stat-val" style={{ display: 'block', fontWeight: '700', fontSize: '12px' }}>{stats.total_products}</span>
                  <span className="business-stat-lbl" style={{ fontSize: '9px', color: '#666' }}>Products</span>
                </div>
              </div>
            </div>

            {/* SYSTEM SECTION */}
            <div style={{ marginTop: '15px' }}>
              <h5 className="section-title">System Section</h5>
              <div className="profile-links-list" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <Link to="/admin/settings" className="profile-link-item" onClick={() => setIsProfileOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                  <Settings size={14} />
                  <span>Settings</span>
                </Link>
                <Link to="/admin/settings" className="profile-link-item" onClick={() => setIsProfileOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                  <Activity size={14} />
                  <span>Activity Logs</span>
                </Link>
              </div>
            </div>

            {/* LOGOUT SECTION */}
            <div className="border-top pt-2" style={{ borderTop: '1px solid var(--border-color)', marginTop: '15px', paddingTop: '10px' }}>
              <button className="profile-logout-btn" onClick={handleConfirmLogout} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', padding: '8px', borderRadius: '8px', backgroundColor: '#78281F', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: '600' }}>
                <LogOut size={14} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Message Reader Modal */}
      {selectedMessage && (
        <div className="admin-modal show" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.4)', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1050 }}>
          <div className="admin-modal-content" style={{ maxWidth: '500px', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 8px 30px rgba(0,0,0,0.15)' }}>
            <div className="admin-modal-header" style={{ backgroundColor: 'var(--theme-color)', padding: '15px 20px', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTopLeftRadius: '12px', borderTopRightRadius: '12px' }}>
              <h3 style={{ margin: 0 }}>Message Details</h3>
              <button className="admin-modal-close" onClick={() => setSelectedMessage(null)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '18px' }}>
                <X size={20} />
              </button>
            </div>
            <div className="admin-modal-body" style={{ padding: '20px' }}>
              <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <strong>From: {selectedMessage.sender}</strong>
                  <span style={{ fontSize: '11px', color: '#666' }}>{selectedMessage.date}</span>
                </div>
                <div style={{ color: 'var(--theme-color)', fontWeight: '700', fontSize: '14px' }}>
                  Subject: {selectedMessage.subject}
                </div>
              </div>
              <p style={{ fontSize: '13px', lineHeight: '1.6', color: 'var(--body-color)', backgroundColor: 'var(--smoke-color3)', padding: '15px', borderRadius: '8px' }}>
                {selectedMessage.body}
              </p>
            </div>
            <div className="admin-modal-footer" style={{ padding: '15px 20px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button 
                className="btn-secondary" 
                style={{ backgroundColor: '#c9302c', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '20px', cursor: 'pointer' }}
                onClick={(e) => {
                  handleDeleteMessage(selectedMessage.id, e);
                }}
              >
                Delete Message
              </button>
              <button className="btn-secondary" onClick={() => setSelectedMessage(null)} style={{ padding: '8px 16px', borderRadius: '20px', cursor: 'pointer' }}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Dialog Modal */}
      {showLogoutConfirm && (
        <div className="logout-confirm-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.4)', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1050 }}>
          <div className="logout-confirm-box" style={{ padding: '30px', backgroundColor: '#fff', borderRadius: '12px', textAlign: 'center', maxWidth: '400px', boxShadow: '0 8px 30px rgba(0,0,0,0.15)' }}>
            <HelpCircle size={48} style={{ color: '#FF9924', marginBottom: '15px' }} />
            <h3>Are you sure?</h3>
            <p style={{ fontSize: '13px', color: '#666', lineHeight: '1.5', margin: '15px 0' }}>Are you sure you want to logout? You will need to re-verify your credentials to gain access back to Ammulu's Kitchen Admin panel.</p>
            <div className="logout-confirm-actions" style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button className="btn-logout-yes" onClick={handleConfirmLogout} style={{ backgroundColor: '#78281F', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '20px', fontWeight: '600', cursor: 'pointer' }}>
                Yes, Logout
              </button>
              <button className="btn-logout-cancel" onClick={() => setShowLogoutConfirm(false)} style={{ backgroundColor: '#f5f5f5', border: '1px solid #ccc', padding: '8px 16px', borderRadius: '20px', fontWeight: '600', cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Mobile FAB (Floating Action Button) */}
      <Link to="/admin/orders" className="mobile-fab mobile-only" title="Quick POS Entry">
        <ShoppingCart size={24} />
      </Link>

      {/* Global Search Modal for Mobile */}
      <GlobalSearchModal isOpen={isSearchModalOpen} onClose={() => setIsSearchModalOpen(false)} />
    </>
  );
};

export default AdminNavbar;
