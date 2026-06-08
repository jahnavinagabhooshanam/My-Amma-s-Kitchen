import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, ShoppingBag, ClipboardList, User } from 'lucide-react';
import { useCart } from '../context/CartContext';
import './MobileBottomNav.css';

const MobileBottomNav = () => {
  const location = useLocation();
  const { cartItems } = useCart();
  
  const totalItems = cartItems?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  const navItems = [
    { path: '/', label: 'Home', icon: <Home size={24} /> },
    { path: '/menu', label: 'Menu', icon: <Search size={24} /> },
    { path: '/cart', label: 'Cart', icon: <ShoppingBag size={24} />, badge: totalItems },
    { path: '/account', label: 'Orders', icon: <ClipboardList size={24} /> },
    { path: '/profile', label: 'Profile', icon: <User size={24} /> },
  ];

  return (
    <div className="mobile-bottom-nav">
      {navItems.map((item) => {
        // Simple active check
        let isActive = location.pathname === item.path;
        if (item.path === '/profile' && location.pathname.startsWith('/account')) {
           isActive = true; // both profile and orders might be in account?
           // Actually, /account has order history. Let's direct /profile to /account and /orders to /account?
        }
        
        return (
          <Link to={item.path} key={item.label} className={`nav-item ${isActive ? 'active' : ''}`}>
            <div className="icon-wrapper">
              {item.icon}
              {item.badge > 0 && <span className="nav-badge">{item.badge}</span>}
            </div>
            <span className="nav-label">{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
};

export default MobileBottomNav;
