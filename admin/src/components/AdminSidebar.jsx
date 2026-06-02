import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logoImg from '../assets/img/cropped-logo.webp';
import { 
  Home, 
  UtensilsCrossed, 
  ChefHat, 
  Layers, 
  Flame, 
  BookOpen, 
  Factory, 
  ClipboardList, 
  Compass, 
  Users, 
  PartyPopper, 
  ShoppingCart, 
  Truck, 
  Warehouse, 
  Tag, 
  MessageSquare, 
  BarChart3, 
  Bell, 
  Globe, 
  UserCog, 
  Wallet, 
  Settings, 
  LogOut 
} from 'lucide-react';

const AdminSidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = (e) => {
    e.preventDefault();
    logout();
    navigate('/login');
  };

  // Define all sidebar items with their details, Lucide components, and target roles
  const menuItems = [
    { to: '/admin/dashboard', icon: Home, label: 'Dashboard', roles: ['admin', 'manager', 'kitchen_staff', 'delivery_staff'] },
    
    // Catalog Management (Admin / Manager)
    { to: '/admin/ready-to-eat', icon: UtensilsCrossed, label: 'Ready To Eat Catalog', roles: ['admin', 'manager'] },
    { to: '/admin/ready-to-cook', icon: ChefHat, label: 'Ready To Cook Catalog', roles: ['admin', 'manager'] },
    { to: '/admin/batter-products', icon: Layers, label: 'Batter Products', roles: ['admin', 'manager'] },
    
    // Order Prep (Kitchen & Admin / Manager)
    { to: '/admin/ready-to-eat-orders', icon: Flame, label: 'Ready To Eat Orders', roles: ['admin', 'manager', 'kitchen_staff'] },
    { to: '/admin/ready-to-cook-orders', icon: BookOpen, label: 'Ready To Cook Orders', roles: ['admin', 'manager', 'kitchen_staff'] },
    { to: '/admin/batter-production', icon: Factory, label: 'Batter Production', roles: ['admin', 'manager', 'kitchen_staff'] },
    
    // Delivery (Delivery & Admin / Manager)
    { to: '/admin/assigned-orders', icon: ClipboardList, label: 'Assigned Orders', roles: ['admin', 'manager', 'delivery_staff'] },
    { to: '/admin/delivery-routes', icon: Compass, label: 'Delivery Routes', roles: ['admin', 'manager', 'delivery_staff'] },
    { to: '/admin/customer-contacts', icon: Users, label: 'Customer Contacts', roles: ['admin', 'manager', 'delivery_staff'] },
    
    // ERP Modules (Admin / Manager)
    { to: '/admin/bulk-orders', icon: PartyPopper, label: 'Bulk Orders', roles: ['admin', 'manager'] },
    { to: '/admin/orders', icon: ShoppingCart, label: 'All Orders', roles: ['admin', 'manager'] },
    { to: '/admin/delivery-management', icon: Truck, label: 'Delivery Management', roles: ['admin', 'manager'] },
    { to: '/admin/kitchen-management', icon: ChefHat, label: 'Kitchen Management', roles: ['admin', 'manager'] },
    { to: '/admin/customers', icon: Users, label: 'Customers', roles: ['admin', 'manager'] },
    { to: '/admin/inventory', icon: Warehouse, label: 'Inventory', roles: ['admin', 'manager'] },
    { to: '/admin/coupons', icon: Tag, label: 'Coupons', roles: ['admin', 'manager'] },
    { to: '/admin/reviews', icon: MessageSquare, label: 'Reviews', roles: ['admin', 'manager'] },
    { to: '/admin/reports', icon: BarChart3, label: 'Reports', roles: ['admin', 'manager'] },
    { to: '/admin/notifications', icon: Bell, label: 'Notifications', roles: ['admin', 'manager'] },
    { to: '/admin/website-management', icon: Globe, label: 'Website Control Center', roles: ['admin', 'manager'] },
    
    // Super Admin Modules
    { to: '/admin/user-management', icon: UserCog, label: 'User Management', roles: ['admin'] },
    { to: '/admin/finance', icon: Wallet, label: 'Finance & Overheads', roles: ['admin'] },
    { to: '/admin/settings', icon: Settings, label: 'Settings', roles: ['admin'] },
  ];

  const userRole = user?.role || 'admin';

  // Filter items matching the user's role
  const visibleItems = menuItems.filter(item => item.roles.includes(userRole));

  return (
    <div className="admin-sidebar" id="mainSidebar">
      <div className="sidebar-logo">
        <NavLink to="/admin/dashboard">
          <img src={logoImg} alt="Hotel Amma's Kitchen" />
        </NavLink>
      </div>
      <ul className="sidebar-menu">
        {visibleItems.map((item, idx) => {
          const Icon = item.icon;
          return (
            <li className="sidebar-item" key={idx}>
              <NavLink to={item.to} className="sidebar-link" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Icon size={18} strokeWidth={2.2} />
                <span>{item.label}</span>
              </NavLink>
            </li>
          );
        })}
      </ul>
      <div className="sidebar-profile" style={{ display: 'flex', justifyContent: 'center', width: '100%', padding: '12px 15px' }}>
        <a 
          href="#logout" 
          onClick={handleLogout} 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '10px', 
            width: '100%', 
            padding: '10px', 
            color: '#FADBD8', 
            backgroundColor: '#78281F', 
            borderRadius: '8px', 
            textDecoration: 'none', 
            fontWeight: '600', 
            fontSize: '13px',
            transition: 'background-color 0.2s ease-in-out'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#943126'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#78281F'}
        >
          <LogOut size={16} strokeWidth={2.2} />
          <span>Logout</span>
        </a>
      </div>
    </div>
  );
};

export default AdminSidebar;
