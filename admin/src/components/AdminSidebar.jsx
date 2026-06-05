import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logoImg from '../assets/img/cropped-logo.webp';
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
  Package
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
  { to: '/admin/coupons', icon: Tag, label: 'Coupons & Offers', roles: ['admin', 'manager'] },
  { to: '/admin/reports', icon: BarChart3, label: 'Reports & Analytics', roles: ['admin', 'manager'] },
  { to: '/admin/website-management', icon: Globe, label: 'Website Control Center', roles: ['admin', 'manager'] },
  { to: '/admin/settings', icon: Settings, label: 'Settings', roles: ['admin'] },
];

const AdminSidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const userRole = user?.role || 'admin';
  const visibleItems = menuItems.filter(item => item.roles.includes(userRole));

  const handleLogout = (e) => {
    e.preventDefault();
    logout();
    navigate('/login');
  };

  return (
    <div className="admin-sidebar" id="mainSidebar">

      {/* ── Header ── */}
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <NavLink to="/admin/dashboard">
            <img src={logoImg} alt="Hotel Amma's Kitchen" />
          </NavLink>
        </div>
        <h2 className="sidebar-title">My Amma's Kitchen</h2>
        <p className="sidebar-subtitle">Food ERP Management</p>
        <div className="sidebar-divider">
          <span className="divider-line" />
          <span className="divider-icon">✦</span>
          <span className="divider-line" />
        </div>
      </div>

      {/* ── Menu ── */}
      <ul className="sidebar-menu">
        {visibleItems.map((item, idx) => {
          const Icon = item.icon;
          const isActive =
            location.pathname === item.to ||
            location.pathname.startsWith(item.to + '/');

          return (
            <li className={`sidebar-item ${isActive ? 'active' : ''}`} key={idx}>
              <NavLink to={item.to} className="sidebar-link">
                <Icon size={17} strokeWidth={1.8} />
                <span>{item.label}</span>
              </NavLink>
            </li>
          );
        })}
      </ul>

      {/* ── Footer ── */}
      <div className="sidebar-footer">
        <a href="#logout" className="sidebar-logout-btn" onClick={handleLogout}>
          <LogOut size={16} strokeWidth={2} />
          <span>Logout</span>
        </a>
        <div className="sidebar-version">
          <span className="sidebar-version-num">⚙ Version 1.0 ⚙</span>
          <span className="sidebar-brand-name">Amma's Kitchen ERP</span>
        </div>
      </div>

    </div>
  );
};

export default AdminSidebar;
