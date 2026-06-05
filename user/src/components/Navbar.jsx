import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import logoImg from '../assets/img/logo.png';
import apiClient from '../services/api';

const Navbar = () => {
  const { cartItems, cartTotal, cartCount, removeFromCart, isCartAnimating } = useCart();
  const { user, logout } = useAuth();
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const [config, setConfig] = useState({
    banner: "✨ Amma's Special Deal: 15% Off Your First Artisan Batter Order! Code: AMMA20 ✨",
    opening_hours: "6am to 10pm",
    contact_phone: "+91 98765 43210",
    contact_email: "order@ammaskitchen.com",
    social_facebook: "#",
    social_instagram: "#",
    social_twitter: "#",
    whatsapp_number: "+919876543210"
  });

  const [notifications, setNotifications] = useState([]);

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
    // Refresh notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const handleToggleCart = () => setCartOpen(!cartOpen);
  const handleToggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  const handleCheckoutClick = () => {
    setCartOpen(false);
    navigate('/cart');
  };

  return (
    <>
      {config.banner && (
        <div style={{
          backgroundColor: 'var(--primary-color)',
          color: 'white',
          textAlign: 'center',
          padding: '6px 12px',
          fontSize: '13px',
          fontWeight: '600',
          fontFamily: "'Jost', sans-serif"
        }}>
          {config.banner}
        </div>
      )}
      <header className="th-header header-default">
        {/* Top Info Bar */}
        <div className="header-top d-sm-block d-none">
          <div className="container-fluid px-4 px-lg-5">
            <div className="row justify-content-center justify-content-lg-between align-items-center gy-2">
              <div className="col-auto">
                <div className="header-links">
                  <ul>
                    <li className="d-none d-xl-inline-block">
                      <i className="far fa-location-dot"></i> 45, Temple Car Street, Chennai
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
        <div className="sticky-wrapper">
          <div className="menu-area">
            <div className="container-fluid px-4 px-lg-5">
              <div className="row align-items-center justify-content-between flex-nowrap">

                {/* Logo */}
                <div className="col-auto">
                  <div className="header-logo">
                    <Link to="/">
                      <img src={logoImg} alt="Amma's Kitchen Logo" style={{ maxHeight: '180px', width: 'auto' }} />
                    </Link>
                  </div>
                </div>

                {/* Desktop Nav Links */}
                <div className="col d-none d-lg-block text-center">
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
                <div className="col-auto">
                  <div className="header-button d-flex align-items-center">
                    
                    {/* User Profile / Login (Desktop Only) */}
                    <div className="d-none d-lg-flex align-items-center me-3">
                      {user ? (
                        <>
                          <div className="dropdown me-3">
                            <button className="icon-btn" type="button" data-bs-toggle="dropdown" aria-expanded="false" onClick={() => {
                              // Optional: Mark as read here or handle differently
                            }}>
                              <span className="badge bg-danger" style={{ position: 'absolute', top: -5, right: -5, fontSize: '10px' }}>
                                {notifications.filter(n => !n.is_read).length > 0 ? notifications.filter(n => !n.is_read).length : ''}
                              </span>
                              <i className="fa-regular fa-bell"></i>
                            </button>
                            <ul className="dropdown-menu dropdown-menu-end p-2" style={{ width: '300px', maxHeight: '400px', overflowY: 'auto' }}>
                              <h6 className="dropdown-header">Notifications</h6>
                              {notifications.length === 0 ? (
                                <li className="text-center p-3 text-muted">No notifications</li>
                              ) : (
                                notifications.map(notif => (
                                  <li key={notif.id} className="border-bottom p-2" style={{ fontSize: '13px', backgroundColor: notif.is_read ? '#fff' : '#f8f9fa' }}>
                                    <div className="fw-bold text-primary">{notif.type.toUpperCase()}</div>
                                    <div>{notif.message}</div>
                                    <div className="text-muted" style={{ fontSize: '11px' }}>{new Date(notif.created_at).toLocaleString()}</div>
                                  </li>
                                ))
                              )}
                            </ul>
                          </div>

                          <Link to="/account" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: 'inherit' }} title="My Account">
                            <div style={{
                              width: '38px', height: '38px', borderRadius: '50%',
                              backgroundColor: 'var(--primary-color)', color: 'white',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontWeight: 'bold', fontSize: '14px', overflow: 'hidden',
                              border: '2px solid var(--border-color)', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                            }}>
                              {user.profile_image ? (
                                <img src={user.profile_image} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              ) : (
                                (user.name || 'U').charAt(0).toUpperCase()
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

                    {/* Cart Button (All Screens) */}
                    <button type="button" onClick={handleToggleCart} className={`icon-btn ${isCartAnimating ? 'cart-bump' : ''}`}>
                      <span className="badge">{cartCount}</span>
                      <i className="fa-regular fa-cart-shopping"></i>
                    </button>
                    <style>{`
                      @keyframes cartBump {
                        0% { transform: scale(1); }
                        50% { transform: scale(1.3); }
                        100% { transform: scale(1); }
                      }
                      .cart-bump {
                        animation: cartBump 0.3s ease-out;
                      }
                    `}</style>

                    {/* View Basket Button (Desktop Only) */}
                    <Link to="/cart" className="th-btn style9 th-icon d-none d-xl-inline-flex ms-2">
                      View Basket <i className="fa-light fa-arrow-right"></i>
                    </Link>

                    {/* Mobile Menu Toggle (Mobile Only) */}
                    <button type="button" onClick={handleToggleMobileMenu} className="icon-btn th-menu-toggle d-lg-none ms-2">
                      <i className="far fa-bars"></i>
                    </button>
                    
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Responsive Mobile Navigation Drawer */}
      <div className={`th-menu-wrapper ${mobileMenuOpen ? 'th-body-visible' : ''}`}>
        <div className="th-menu-area text-center">
          <button className="th-menu-toggle" onClick={handleToggleMobileMenu}><i className="fal fa-times"></i></button>
          <div className="mobile-logo">
            <Link to="/" onClick={handleToggleMobileMenu}>
              <img src={logoImg} alt="Amma Logo" style={{ maxHeight: '110px', width: 'auto' }} />
            </Link>
          </div>
              <div className="th-mobile-menu">
            <ul>
              <li><Link to="/" onClick={handleToggleMobileMenu}>HOME</Link></li>
              <li><Link to="/menu" onClick={handleToggleMobileMenu}>MENU</Link></li>
              <li><Link to="/ready-to-eat" onClick={handleToggleMobileMenu}>READY TO EAT</Link></li>
              <li><Link to="/ready-to-cook" onClick={handleToggleMobileMenu}>READY TO COOK</Link></li>
              <li><Link to="/bulk-orders" onClick={handleToggleMobileMenu}>BULK ORDERS</Link></li>
                  <li><Link to="/certificates" onClick={handleToggleMobileMenu}>CERTIFICATES</Link></li>
                  <li><Link to="/contact" onClick={handleToggleMobileMenu}>CONTACT</Link></li>
              {user ? (
                <>
                  <li><Link to="/account" onClick={handleToggleMobileMenu}>MY ACCOUNT</Link></li>
                  <li><button onClick={() => { logout(); handleToggleMobileMenu(); }} style={{ background: 'none', border: 'none', padding: 0, color: 'inherit', fontWeight: 'bold' }}>LOGOUT</button></li>
                  {user.role === 'admin' && <li><Link to="/admin/dashboard" onClick={handleToggleMobileMenu} style={{ color: '#E84C3D' }}>ADMIN PANEL</Link></li>}
                </>
              ) : (
                <>
                  <li><Link to="/login" onClick={handleToggleMobileMenu}>LOGIN</Link></li>
                  <li><Link to="/register" onClick={handleToggleMobileMenu}>REGISTER</Link></li>
                  <li><Link to="/admin/dashboard" onClick={handleToggleMobileMenu}>ADMIN SIGN IN</Link></li>
                </>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Sliding Minicart Side Drawer */}
      <div className={`sidemenu-wrapper sidemenu-cart ${cartOpen ? 'show' : ''}`} style={{ zIndex: 10000 }}>
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
                            width: '45px',
                            height: '45px',
                            backgroundColor: '#F5F5F0',
                            borderRadius: '10px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.2rem',
                            marginRight: '15px',
                            float: 'left'
                          }}>🍶</div>
                          {item.name}
                        </a>
                        <span className="quantity">
                          {item.quantity} × <span className="woocommerce-Price-amount amount">
                            <span className="woocommerce-Price-currencySymbol">₹</span>{item.price.toFixed(2)}
                          </span>
                        </span>
                      </li>
                    ))}
                  </ul>
                  <p className="woocommerce-mini-cart__total total">
                    <strong>Basket Subtotal:</strong>
                    <span className="woocommerce-Price-amount amount">
                      <span className="woocommerce-Price-currencySymbol">₹</span>{cartTotal.toFixed(2)}
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
