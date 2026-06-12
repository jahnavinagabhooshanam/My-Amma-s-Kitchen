import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import logoImg from '../assets/img/ammulus-kitchen-logo.jpg';
import apiClient from '../services/api';
import { resolveImagePath } from './FoodCard';

const Navbar = () => {
  const { cartItems, cartTotal, cartCount, removeFromCart, isCartAnimating } = useCart();
  const { user, logout } = useAuth();
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const [config, setConfig] = useState({
    banner: "âœ¨ Amma's Special Deal: 15% Off Your First Artisan Batter Order! Code: AMMA20 âœ¨",
    opening_hours: "6am to 10pm",
    contact_phone: "+91 72009 42596",
    contact_email: "ammuluskitchen57@gmail.com",
    social_facebook: "https://www.facebook.com/profile.php?id=61590451811686",
    social_instagram: "https://www.instagram.com/ammuluskitchen_?igsh=MzE1dHRqNGQ2MGZx",
    social_twitter: "https://x.com/ammuluskitchen",
    whatsapp_number: "+917200942596"
  });

  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [activeBannerOffer, setActiveBannerOffer] = useState(null);
  
  // Location States
  const [currentLocation, setCurrentLocation] = useState('Click to set your location');
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    const savedLoc = localStorage.getItem('userLocation');
    if (savedLoc) {
      setCurrentLocation(savedLoc);
    } else {
      // Default placeholder if none saved
      setCurrentLocation('8 Chennaikothapalli Rd, Hosur');
    }
  }, []);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }
    
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          // Use OpenStreetMap Nominatim API for reverse geocoding
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`);
          const data = await res.json();
          
          if (data && data.address) {
            // Format a nice short address
            const road = data.address.road || data.address.suburb || data.address.neighbourhood || '';
            const city = data.address.city || data.address.town || data.address.county || '';
            const newLoc = road && city ? `${road}, ${city}` : (data.display_name.split(',').slice(0,2).join(','));
            
            setCurrentLocation(newLoc);
            localStorage.setItem('userLocation', newLoc);
          } else {
            setCurrentLocation('Location found');
          }
        } catch (err) {
          console.error("Error getting location name:", err);
          setCurrentLocation('Location found (Unnamed)');
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        console.error(err);
        setIsLocating(false);
        if (err.code === 1) alert('Please allow location permissions to use this feature.');
        else alert('Failed to get location. Try again.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  useEffect(() => {
    const fetchActiveBanner = async () => {
      try {
        const res = await apiClient.get('/offers/active');
        const bannerOffer = res.data.find(o => o.display_locations.includes('home_banner'));
        if (bannerOffer) setActiveBannerOffer(bannerOffer);
      } catch (err) {
        console.error("Failed to load active banner offer:", err);
      }
    };
    fetchActiveBanner();
  }, []);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await apiClient.get('/admin/website-config');
        setConfig(res.data);
      } catch (err) {
        console.error("Failed to load website config in Navbar:", err);
      }
    };
    fetchConfig();
  }, []);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (user) {
        try {
          const res = await apiClient.get('/notifications');
          setNotifications(res.data);
        } catch (err) {
          console.error("Failed to fetch notifications:", err);
        }
      }
    };
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const handleToggleCart = () => setCartOpen(!cartOpen);
  const handleToggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  const handleNotificationClick = async (id) => {
    try {
      await apiClient.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const handleCheckoutClick = () => {
    setCartOpen(false);
    navigate('/cart');
  };

  const path = location.pathname;

  // Render Mobile Native App Header
  const renderMobileHeader = () => {
    if (path === '/') {
      return (
        <div className="app-header-home d-lg-none">
          <div className="app-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <button onClick={handleToggleMobileMenu} aria-label="Toggle Navigation Menu" style={{ background: 'none', border: 'none', padding: 0, fontSize: '20px', color: 'var(--text-dark)' }}>
              <i className="fas fa-bars" aria-hidden="true"></i>
            </button>
            <img src={logoImg} alt="Ammulu's Kitchen Logo" className="app-logo" style={{ height: '60px', objectFit: 'contain' }} />
            <Link to="/cart" aria-label={`View Shopping Cart, ${cartCount} items`} className={`cart-btn-app ${isCartAnimating ? 'cart-bump' : ''}`} style={{ position: 'relative', fontSize: '22px', color: 'var(--text-dark)', textDecoration: 'none' }}>
              <i className="fa-regular fa-cart-shopping" aria-hidden="true"></i>
              {cartCount > 0 && <span className="badge" style={{ position: 'absolute', top: '-6px', right: '-8px', background: 'var(--danger)', color: 'white', fontSize: '10px', minWidth: '18px', height: '18px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>{cartCount}</span>}
            </Link>
          </div>
          <div className="app-location-row" onClick={handleGetLocation} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <i className={`fas ${isLocating ? 'fa-spinner fa-spin' : 'fa-map-marker-alt'}`} style={{ color: '#2E8B57', marginRight: '10px', fontSize: '18px' }}></i>
            <div className="loc-text" style={{ flex: 1, overflow: 'hidden' }}>
              <div className="loc-title" style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-dark)' }}>
                Deliver to <i className="fas fa-chevron-down" style={{ fontSize: '10px', marginLeft: '4px', color: 'var(--primary-color)' }}></i>
              </div>
              <div className="loc-desc" style={{ fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {isLocating ? 'Detecting location...' : currentLocation}
              </div>
            </div>
          </div>
          <div className="app-search-row">
            <button className="search-bar-app" aria-label="Search Menu" onClick={() => navigate('/menu')} style={{ width: '100%', display: 'flex', alignItems: 'center', background: 'none', border: 'none', padding: 0, textAlign: 'left', cursor: 'text' }}>
              <i className="fas fa-search" aria-hidden="true"></i>
              <input type="text" placeholder="Search 'Idli, Dosa, Meals...'" readOnly aria-label="Search input" style={{ cursor: 'text' }} />
              <i className="fas fa-microphone" aria-hidden="true" style={{ color: '#2E8B57' }}></i>
            </button>
          </div>
        </div>
      );
    } else {
      let title = "Ammulu's Kitchen";
      if (path === '/cart') title = "My Cart";
      else if (path === '/account') title = "My Profile";
      else if (path === '/orders') title = "My Orders";
      else if (path === '/menu') title = "Menu";
      else if (path === '/offers') title = "Offers";
      else if (path === '/ready-to-eat') title = "Ready To Eat";
      else if (path === '/ready-to-cook') title = "Ready To Cook";
      else if (path === '/bulk-orders') title = "Bulk Orders";
      else if (path === '/certificates') title = "Certificates";
      else if (path === '/contact') title = "Contact";
      else if (path === '/wishlist') title = "Wishlist";
      else if (path === '/saved-for-later') title = "Saved For Later";
      else if (path === '/login') title = "Login";
      else if (path === '/register') title = "Register";

      return (
        <div className="app-header-inner d-lg-none">
          <button onClick={handleToggleMobileMenu} style={{ background: 'none', border: 'none', padding: 0, fontSize: '20px', color: 'var(--text-dark)' }}><i className="fas fa-bars"></i></button>
          <h2 className="inner-page-title" style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#0F400F', fontWeight: '700', margin: 0, fontSize: '24px' }}>{title}</h2>
          {path === '/menu' ? (
            <button><i className="fas fa-search"></i></button>
          ) : path === '/account' ? (
            <button><i className="fas fa-cog"></i></button>
          ) : path === '/cart' ? (
             <Link to="/cart" style={{ color: 'var(--text-dark)' }}>
               <i className="fa-regular fa-cart-shopping"></i>
             </Link>
          ) : (
            <div style={{ width: '40px' }}></div>
          )}
        </div>
      );
    }
  };

  return (
    <>
      {/* Mobile Header Native App Style */}
      {renderMobileHeader()}



      {/* Desktop Header */}
      <header className="th-header header-default d-none d-lg-block">
        {/* Top Info Bar */}
        <div className="header-top premium-contact-bar">
          <div className="container-fluid px-4 px-lg-5">
            <div className="row justify-content-center justify-content-lg-between align-items-center gy-2">
              <div className="col-auto">
                <div className="header-links">
                  <ul>
                    <li className="d-none d-xl-inline-block">
                      <i className="far fa-location-dot"></i> 2nd Cross, Gopalappa Nagar, Near KCC Nagar, Hosur - 635109
                    </li>
                    <li className="d-none d-md-inline-block">
                      <i className="far fa-envelope-open"></i>
                      <a href={`mailto:${config.contact_email}`}>{config.contact_email}</a>
                    </li>
                    <li className="d-none d-sm-inline-block">
                      <i className="far fa-clock"></i> {config.opening_hours}
                    </li>
                  </ul>
                </div>
              </div>
              <div className="col-auto d-none d-lg-block">
                <div className="header-links">
                  <ul>
                    <li className="d-none d-lg-inline-block header-contact">
                      <i className="far fa-phone"></i>
                      <a href={`tel:${config.contact_phone}`}>{config.contact_phone}</a>
                    </li>
                    <li>
                      <div className="th-social">
                        <a href={config.social_facebook} target="_blank" rel="noreferrer"><i className="fab fa-facebook-f"></i></a>
                        <a href={config.social_twitter} target="_blank" rel="noreferrer"><i className="fab fa-twitter"></i></a>
                        <a href={config.social_instagram} target="_blank" rel="noreferrer"><i className="fab fa-instagram"></i></a>
                        <a href={`https://wa.me/${config.whatsapp_number?.replace(/\+/g, '').replace(/\s/g, '')}`} target="_blank" rel="noreferrer"><i className="fab fa-whatsapp"></i></a>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Sticky Navbar Wrapper */}
        <div className="sticky-wrapper premium-navbar">
          <div className="menu-area" style={{ width: '100%' }}>
            <div className="container-fluid px-2 px-xl-4">
              <div className="row align-items-center justify-content-between flex-nowrap">

                {/* Logo */}
                <div className="col-auto flex-shrink-0 mx-auto mx-lg-0">
                  <div className="header-logo premium-navbar-logo">
                    <Link to="/">
                      <img src={logoImg} alt="Ammulu's Kitchen Logo" />
                    </Link>
                  </div>
                </div>

                {/* Desktop Nav Links */}
                <div className="col d-none d-lg-block text-center" style={{ overflowX: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                  <nav className="main-menu">
                    <ul style={{ whiteSpace: 'nowrap' }}>
                      <li><NavLink to="/" end>HOME</NavLink></li>
                      <li><NavLink to="/menu">MENU</NavLink></li>
                      <li><NavLink to="/ready-to-eat">READY TO EAT</NavLink></li>
                      <li><NavLink to="/ready-to-cook">READY TO COOK</NavLink></li>
                      <li><NavLink to="/bulk-orders">BULK ORDERS</NavLink></li>
                      <li><NavLink to="/certificates">CERTIFICATES</NavLink></li>
                      <li><NavLink to="/contact">CONTACT</NavLink></li>
                      {user?.role === 'admin' && (
                        <li><Link to="/admin/dashboard" style={{ color: '#E84C3D' }}>ADMIN PANEL</Link></li>
                      )}
                    </ul>
                  </nav>
                </div>

                {/* Actions buttons */}
                <div className="col-auto flex-shrink-0">
                  <div className="header-button d-flex align-items-center">
                    
                    {/* User Profile / Login */}
                    <div className="d-none d-lg-flex align-items-center me-3">
                      {user ? (
                        <>
                          <div className="dropdown me-3">
                            <button className="premium-user-action" type="button" onClick={() => setShowNotifications(!showNotifications)}>
                              <span className="badge bg-danger" style={{ position: 'absolute', top: -5, right: -5, fontSize: '10px' }}>
                                {notifications.filter(n => !n.is_read).length > 0 ? notifications.filter(n => !n.is_read).length : ''}
                              </span>
                              <i className="fa-regular fa-bell"></i>
                            </button>
                            <ul className={`dropdown-menu dropdown-menu-end p-2 ${showNotifications ? 'show' : ''}`} style={{ width: '300px', maxHeight: '400px', overflowY: 'auto', position: 'absolute', top: '100%', right: '0' }}>
                              <h6 className="dropdown-header">Notifications</h6>
                              {notifications.length === 0 ? (
                                <li className="text-center p-3 text-muted">No notifications</li>
                              ) : (
                                notifications.map(notif => (
                                  <li 
                                    key={notif.id} 
                                    className="border-bottom p-2" 
                                    style={{ fontSize: '13px', backgroundColor: notif.is_read ? '#fff' : '#f8f9fa', cursor: 'pointer' }}
                                    onClick={() => handleNotificationClick(notif.id)}
                                  >
                                    <div className="fw-bold text-primary">{notif.type.toUpperCase()}</div>
                                    <div>{notif.message}</div>
                                    <div className="text-muted" style={{ fontSize: '11px' }}>{new Date(notif.created_at).toLocaleString()}</div>
                                  </li>
                                ))
                              )}
                            </ul>
                          </div>

                          <Link to="/account" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: 'inherit' }} title="My Account">
                            <div className="premium-user-action" style={{ padding: 0, overflow: 'hidden' }}>
                              {user.profile_image ? (
                                <img src={user.profile_image} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              ) : (
                                <span style={{ color: 'var(--primary-color)', fontSize: '24px' }}>{(user.name || 'U').charAt(0).toUpperCase()}</span>
                              )}
                            </div>
                            <span style={{ fontWeight: '600', fontSize: '14px', fontFamily: "'Jost', sans-serif" }}>
                              {user.name ? user.name.split(' ')[0] : 'Account'}
                            </span>
                          </Link>
                        </>
                      ) : (
                        <>
                          <Link to="/login" className="me-3" style={{ fontWeight: '600', fontSize: '14px', textDecoration: 'none', color: 'var(--text-dark)' }}>Login</Link>
                          <Link to="/register" className="th-btn style9" style={{ padding: '8px 15px', fontSize: '13px', borderRadius: 'var(--radius-full)' }}>Sign Up</Link>
                        </>
                      )}
                    </div>

                    {/* Cart Button */}
                    <button type="button" onClick={handleToggleCart} className={`premium-user-action ${isCartAnimating ? 'cart-bump' : ''}`}>
                      <span className="badge bg-danger" style={{ position: 'absolute', top: '-4px', right: '-4px', fontSize: '11px', borderRadius: '50%', minWidth: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0' }}>{cartCount}</span>
                      <i className="fa-regular fa-cart-shopping"></i>
                    </button>

                    {/* View Cart Button */}
                    <Link to="/cart" className="premium-cart-btn d-none d-xl-inline-flex ms-2">
                      View Cart <i className="fa-light fa-arrow-right"></i>
                    </Link>
                    
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Responsive Mobile Navigation Drawer (Framer Motion) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'black', zIndex: 9999 }}
              onClick={handleToggleMobileMenu}
            />
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3, ease: 'easeOut' }}
              style={{ 
                position: 'fixed', top: 0, left: 0, width: '85%', maxWidth: '350px', height: '100%', 
                backgroundColor: '#FFFFFF', zIndex: 10000, boxShadow: '5px 0 25px rgba(0,0,0,0.1)', 
                display: 'flex', flexDirection: 'column',
                borderTopRightRadius: '24px', borderBottomRightRadius: '24px', overflow: 'hidden'
              }}
            >
              {/* Header Section */}
              <div style={{ 
                background: 'linear-gradient(135deg, #074026 0%, #032112 100%)', 
                padding: '40px 20px 25px 20px', 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center',
                position: 'relative',
                borderBottomRightRadius: '32px',
                borderBottomLeftRadius: '32px',
                overflow: 'hidden',
                boxShadow: '0 15px 35px rgba(3, 33, 18, 0.25)'
              }}>
                {/* Elegant SVG Leaf Watermarks */}
                <svg style={{ position: 'absolute', width: '220px', height: '220px', top: '-40px', right: '-60px', opacity: 0.04, transform: 'rotate(15deg)' }} viewBox="0 0 100 100" fill="#FFFFFF">
                  <path d="M 5 95 C 5 40 40 5 95 5 C 95 60 60 95 5 95 Z" />
                </svg>
                <svg style={{ position: 'absolute', width: '180px', height: '180px', bottom: '-60px', left: '-50px', opacity: 0.03, transform: 'rotate(-45deg)' }} viewBox="0 0 100 100" fill="#FFFFFF">
                  <path d="M 5 95 C 5 40 40 5 95 5 C 95 60 60 95 5 95 Z" />
                </svg>

                {/* Close Button */}
                <button onClick={handleToggleMobileMenu} style={{ 
                  position: 'absolute', top: '22px', right: '22px',
                  background: '#FFFFFF', border: 'none', borderRadius: '50%',
                  width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.15)', zIndex: 10,
                  transition: 'transform 0.2s ease, background 0.2s ease'
                }}>
                  <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="#222222" strokeWidth="1.2">
                    <path d="M1 1L13 13M1 13L13 1" strokeLinecap="round"/>
                  </svg>
                </button>
                
                {/* Brand Logo Composition */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 10 }}>
                   {/* Steam Marks */}
                   <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
                     <svg width="6" height="11" viewBox="0 0 8 16" fill="none" stroke="#F5B941" strokeWidth="2.5" strokeLinecap="round" style={{ transform: 'translateY(4px) rotate(15deg)', opacity: 0.75 }}>
                       <path d="M2,14 C6,10 0,6 4,2" />
                     </svg>
                     <svg width="6" height="12" viewBox="0 0 8 16" fill="none" stroke="#F5B941" strokeWidth="2.5" strokeLinecap="round" style={{ transform: 'translateY(-1px) rotate(15deg)' }}>
                       <path d="M2,14 C6,10 0,6 4,2" />
                     </svg>
                     <svg width="6" height="11" viewBox="0 0 8 16" fill="none" stroke="#F5B941" strokeWidth="2.5" strokeLinecap="round" style={{ transform: 'translateY(4px) rotate(15deg)', opacity: 0.75 }}>
                       <path d="M2,14 C6,10 0,6 4,2" />
                     </svg>
                   </div>
                   
                   {/* Ammulu's Text */}
                   <div style={{ color: '#FFFFFF', fontSize: '26px', fontFamily: "'Playfair Display', Georgia, serif", fontWeight: '700', lineHeight: '1', letterSpacing: '0px', marginBottom: '16px', textShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
                     Ammulu's Kitchen
                   </div>
                   
                   {/* Tagline */}
                   <div style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '11px', fontFamily: "'Inter', sans-serif", fontWeight: '400', letterSpacing: '0.5px' }}>
                     Just Like Amma Made It
                   </div>
                </div>
              </div>

              {/* Menu Links */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '15px 20px' }}>
                <div style={{ 
                  background: 'white', borderRadius: '16px', padding: '10px 0' 
                }}>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column' }}>
                    
                    {[
                      { to: '/', icon: 'fas fa-home', text: 'HOME', color: '#2E8B57', bg: 'rgba(46, 139, 87, 0.1)' },
                      { to: '/menu', icon: 'fas fa-utensils', text: 'MENU', color: '#2E8B57', bg: 'rgba(46, 139, 87, 0.1)' },
                      { to: '/ready-to-eat', icon: 'fas fa-concierge-bell', text: 'READY TO EAT', color: '#FF8C00', bg: 'rgba(255, 140, 0, 0.1)' },
                      { to: '/ready-to-cook', icon: 'fas fa-search', text: 'READY TO COOK', color: '#8A2BE2', bg: 'rgba(138, 43, 226, 0.1)' },
                      { to: '/bulk-orders', icon: 'fas fa-box-open', text: 'BULK ORDERS', color: '#8B4513', bg: 'rgba(139, 69, 19, 0.1)' },
                      { to: '/certificates', icon: 'fas fa-award', text: 'CERTIFICATES', color: '#DAA520', bg: 'rgba(218, 165, 32, 0.1)' },
                      { to: '/contact', icon: 'fas fa-phone-alt', text: 'CONTACT', color: '#FF6347', bg: 'rgba(255, 99, 71, 0.1)' },
                    ].map((item, idx) => {
                      const active = location.pathname === item.to;
                      return (
                        <React.Fragment key={idx}>
                          <li style={{ padding: '0 10px', margin: '2px 0' }}>
                            <Link to={item.to} onClick={handleToggleMobileMenu} style={{ 
                              display: 'flex', alignItems: 'center', padding: '8px 12px', textDecoration: 'none', 
                              color: '#1A1A1A', fontWeight: '600', fontSize: '13px', 
                              border: active ? '1px solid #2E8B57' : '1px solid transparent', 
                              borderRadius: '8px', 
                              background: active ? '#F2F8F5' : 'transparent',
                              transition: 'all 0.2s ease'
                            }}>
                              <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '15px' }}>
                                <i className={item.icon} style={{ color: item.color, fontSize: '13px' }}></i>
                              </div>
                              <span style={{ letterSpacing: '0.3px' }}>{item.text}</span>
                            </Link>
                          </li>
                          {!active && <div style={{ height: '1px', background: '#F5F5F5', margin: '0 20px' }}></div>}
                        </React.Fragment>
                      );
                    })}

                    {user && [
                      { to: '/wishlist', icon: 'fas fa-heart', text: 'WISHLIST', color: '#DC143C', bg: 'rgba(220, 20, 60, 0.1)' },
                      { to: '/saved-for-later', icon: 'fas fa-bookmark', text: 'SAVE FOR LATER', color: '#2E8B57', bg: 'rgba(46, 139, 87, 0.1)' },
                    ].map((item, idx) => {
                      const active = location.pathname === item.to;
                      return (
                        <React.Fragment key={`user-${idx}`}>
                          <li style={{ padding: '0 10px', margin: '2px 0' }}>
                            <Link to={item.to} onClick={handleToggleMobileMenu} style={{ 
                              display: 'flex', alignItems: 'center', padding: '8px 12px', textDecoration: 'none', 
                              color: '#1A1A1A', fontWeight: '600', fontSize: '13px', 
                              border: active ? '1px solid #2E8B57' : '1px solid transparent', 
                              borderRadius: '8px', 
                              background: active ? '#F2F8F5' : 'transparent',
                              transition: 'all 0.2s ease'
                            }}>
                              <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '15px' }}>
                                <i className={item.icon} style={{ color: item.color, fontSize: '13px' }}></i>
                              </div>
                              <span style={{ letterSpacing: '0.3px' }}>{item.text}</span>
                            </Link>
                          </li>
                          {!active && <div style={{ height: '1px', background: '#F5F5F5', margin: '0 20px' }}></div>}
                        </React.Fragment>
                      );
                    })}

                    {/* Auth Actions */}
                    {user ? (
                      <li style={{ marginTop: '10px', padding: '0 10px' }}>
                        <button onClick={() => { logout(); handleToggleMobileMenu(); }} style={{ 
                          width: '100%', background: '#FFF0F0', border: 'none', borderRadius: '8px', padding: '8px 12px', display: 'flex', alignItems: 'center', color: '#DC143C', fontWeight: '600', fontSize: '13px', cursor: 'pointer'
                        }}>
                          <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '15px' }}>
                            <i className="fas fa-power-off" style={{ fontSize: '14px' }}></i>
                          </div>
                          <span style={{ letterSpacing: '0.3px' }}>LOG OUT</span>
                        </button>
                      </li>
                    ) : (
                      <li style={{ marginTop: '10px', padding: '0 10px' }}>
                        <button onClick={() => { navigate('/login'); handleToggleMobileMenu(); }} style={{ 
                          width: '100%', background: '#F2F8F5', border: 'none', borderRadius: '8px', padding: '8px 12px', display: 'flex', alignItems: 'center', color: '#2E8B57', fontWeight: '600', fontSize: '13px', cursor: 'pointer'
                        }}>
                          <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '15px' }}>
                            <i className="fas fa-sign-in-alt" style={{ fontSize: '14px' }}></i>
                          </div>
                          <span style={{ letterSpacing: '0.3px' }}>LOG IN</span>
                        </button>
                      </li>
                    )}

                  </ul>
                </div>

                {/* Footer Section */}
                <div style={{ 
                  background: '#F2F8F5', borderRadius: '12px', padding: '20px', marginTop: '20px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '15px' 
                }}>
                  <div style={{ color: '#004A2F', fontSize: '32px' }}><i className="fal fa-salad"></i></div>
                  <div style={{ fontSize: '13px', color: '#004A2F', fontWeight: '500', lineHeight: 1.4 }}>
                    Thank you for supporting homemade food! <i className="fas fa-heart"></i>
                  </div>
                </div>

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Sliding Minicart Side Drawer - Desktop Only */}
      <div className={`sidemenu-wrapper sidemenu-cart ${cartOpen ? 'show' : ''} d-none d-lg-block`} style={{ zIndex: 10000 }}>
        <div className="sidemenu-content">
          <button className="closeButton sideMenuCls" onClick={handleToggleCart}><i className="far fa-times"></i></button>
          <div className="widget woocommerce widget_shopping_cart">
            <h3 className="widget_title">Shopping Basket</h3>
            <div className="widget_shopping_cart_content">
              {cartItems.length === 0 ? (
                <div className="text-center py-5">
                  <p className="text-muted" style={{ fontFamily: "'Jost', sans-serif" }}>Your basket is empty.</p>
                  <Link to="/" className="th-btn style2 mt-3" onClick={handleToggleCart}>Shop Batters</Link>
                </div>
              ) : (
                <>
                  <ul className="woocommerce-mini-cart cart_list product_list_widget">
                    {cartItems.map((item) => (
                      <li className="woocommerce-mini-cart-item mini_cart_item" key={item.id}>
                        <button onClick={() => removeFromCart(item.id)} className="remove remove_from_cart_button" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                          <i className="far fa-times"></i>
                        </button>
                        <a href="#">
                          <div className="mini-cart-avatar" style={{
                            position: 'relative',
                            width: '45px',
                            height: '45px',
                            minWidth: '45px',
                            backgroundColor: '#F5F5F0',
                            borderRadius: '10px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.2rem',
                            marginRight: '15px',
                            float: 'left',
                            overflow: 'hidden'
                          }}>
                            {item.image ? (
                              <img src={resolveImagePath(item.image)} alt={item.name} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', margin: 0, padding: 0, border: 'none' }} />
                            ) : (
                              <i className="fa-solid fa-utensils" style={{ color: '#aaa', fontSize: '20px' }}></i>
                            )}
                          </div>
                          {item.name}
                        </a>
                        <span className="quantity">
                          {item.quantity} x <span className="woocommerce-Price-amount amount">
                            <span className="woocommerce-Price-currencySymbol">Rs. </span>{item.price.toFixed(2)}
                          </span>
                        </span>
                      </li>
                    ))}
                  </ul>
                  <p className="woocommerce-mini-cart__total total">
                    <strong>Basket Subtotal:</strong>
                    <span className="woocommerce-Price-amount amount">
                      <span className="woocommerce-Price-currencySymbol">Rs. </span>{cartTotal.toFixed(2)}
                    </span>
                  </p>
                  <p className="woocommerce-mini-cart__buttons buttons">
                    <button onClick={handleCheckoutClick} className="th-btn style2 wc-forward">
                      View basket
                    </button>
                    <button onClick={handleCheckoutClick} className="th-btn style2 checkout wc-forward">
                      Checkout
                    </button>
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
