import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import logoImg from '../assets/img/ammulus-kitchen-logo-green.png';
import {
  Home,
  UtensilsCrossed,
  Layers,
  Factory,
  ShoppingCart,
  Truck,
  PartyPopper,
  Users,
  Warehouse,
  Tag,
  BarChart3,
  Globe,
  Settings,
  LogOut,
  Package,
  Gift,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const menuItems = [
  { to: '/admin/dashboard', icon: Home, label: 'Dashboard', roles: ['admin', 'manager', 'kitchen_staff', 'delivery_staff'] },
  { to: '/admin/ready-to-eat', icon: UtensilsCrossed, label: 'Ready To Eat Catalog', roles: ['admin', 'manager'] },
  { to: '/admin/ready-to-cook', icon: Package, label: 'Ready To Cook Catalog', roles: ['admin', 'manager'] },
  { to: '/admin/batter-production', icon: Factory, label: 'Batter Production', roles: ['admin', 'manager', 'kitchen_staff'] },
  { to: '/admin/orders', icon: ShoppingCart, label: 'Orders', roles: ['admin', 'manager', 'kitchen_staff', 'delivery_staff'] },
  { to: '/admin/delivery-management', icon: Truck, label: 'Delivery Management', roles: ['admin', 'manager', 'delivery_staff'] },
  { to: '/admin/bulk-orders', icon: PartyPopper, label: 'Bulk Orders', roles: ['admin', 'manager'] },
  { to: '/admin/customers', icon: Users, label: 'Customers', roles: ['admin', 'manager'] },
  { to: '/admin/inventory', icon: Warehouse, label: 'Inventory', roles: ['admin', 'manager'] },
  { to: '/admin/offers', icon: Gift, label: 'Offers & Coupons', roles: ['admin', 'manager'] },
  { to: '/admin/reports', icon: BarChart3, label: 'Reports & Analytics', roles: ['admin', 'manager'] },
  { to: '/admin/website-management', icon: Globe, label: 'Website Control Center', roles: ['admin', 'manager'] },
  { to: '/admin/settings', icon: Settings, label: 'Settings', roles: ['admin'] },
];

const AdminSidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const handleToggle = () => setIsOpen(prev => !prev);
    window.addEventListener('toggleSidebar', handleToggle);
    return () => window.removeEventListener('toggleSidebar', handleToggle);
  }, []);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Sync collapsed state to body or wrapper so main content can expand
  useEffect(() => {
    if (isCollapsed) {
      document.documentElement.style.setProperty('--sidebar-width', '80px');
    } else {
      document.documentElement.style.setProperty('--sidebar-width', '260px');
    }
  }, [isCollapsed]);

  const userRole = user?.role || 'admin';
  const visibleItems = menuItems.filter(item => item.roles.includes(userRole));

  const handleLogout = (e) => {
    e.preventDefault();
    logout();
    navigate('/login');
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="sidebar-overlay mobile-only"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      <div className={`admin-sidebar ${isOpen ? 'open' : ''} ${isCollapsed ? 'collapsed' : ''}`} id="mainSidebar">

      {/* ── Header ── */}
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <NavLink to="/admin/dashboard">
            <img src={logoImg} alt="Hotel Ammulu's Kitchen" style={{ width: isCollapsed ? '40px' : '80px', transition: 'width 0.3s' }} />
          </NavLink>
        </div>
        {!isCollapsed && (
          <>
            <h2 className="sidebar-title">Ammulu's Kitchen</h2>
            <p className="sidebar-subtitle">Food ERP Management</p>
          </>
        )}
        <div className="sidebar-divider">
          <span className="divider-line" />
          <span className="divider-icon">✦</span>
          <span className="divider-line" />
        </div>
      </div>

      {/* â”€â”€ Menu â”€â”€ */}
      <ul className="sidebar-menu">
        {visibleItems.map((item, idx) => {
          const Icon = item.icon;
          const isActive =
            location.pathname === item.to ||
            location.pathname.startsWith(item.to + '/');

          return (
            <li className={`sidebar-item ${isActive ? 'active' : ''}`} key={idx}>
              <NavLink to={item.to} className="sidebar-link" title={isCollapsed ? item.label : ''}>
                <Icon size={isCollapsed ? 22 : 17} strokeWidth={1.8} />
                {!isCollapsed && <span>{item.label}</span>}
              </NavLink>
            </li>
          );
        })}
      </ul>

      {/* â”€â”€ Footer â”€â”€ */}
      <div className="sidebar-footer">
        <button 
          className="desktop-only" 
          onClick={() => setIsCollapsed(!isCollapsed)}
          style={{ 
            background: 'none', border: '1px solid #EAE6DB', width: '100%', 
            padding: '10px', borderRadius: '8px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            marginBottom: '15px', color: '#666'
          }}
        >
          {isCollapsed ? <ChevronRight size={18} /> : <><ChevronLeft size={18} /> Collapse Sidebar</>}
        </button>

        <a href="#logout" className="sidebar-logout-btn" onClick={handleLogout} style={{ justifyContent: isCollapsed ? 'center' : 'flex-start' }} title={isCollapsed ? 'Logout' : ''}>
          <LogOut size={16} strokeWidth={2} />
          {!isCollapsed && <span>Logout</span>}
        </a>
        
        {!isCollapsed && (
          <div className="sidebar-version">
            <span className="sidebar-version-num">⚙ Version 1.0 ⚙</span>
            <span className="sidebar-brand-name">Ammulu's Kitchen ERP</span>
          </div>
        )}
      </div>

    </div>
    </>
  );
};

export default AdminSidebar;
