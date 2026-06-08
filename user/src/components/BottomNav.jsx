import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Search, ShoppingBag, ClipboardList, User } from 'lucide-react';
import { useCart } from '../context/CartContext';
import './BottomNav.css';

const BottomNav = () => {
  const { cartCount } = useCart();

  return (
    <div className="bottom-nav-container mobile-only">
      <nav className="bottom-nav">
        <NavLink to="/" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
          <Home size={24} />
          <span>Home</span>
        </NavLink>
        <NavLink to="/menu" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
          <Search size={24} />
          <span>Menu</span>
        </NavLink>
        <NavLink to="/cart" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
          <div className="cart-icon-wrapper">
            <ShoppingBag size={24} />
            {cartCount > 0 && <span className="bottom-cart-badge">{cartCount}</span>}
          </div>
          <span>Cart</span>
        </NavLink>
        <NavLink to="/orders" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
          <ClipboardList size={24} />
          <span>Orders</span>
        </NavLink>
        <NavLink to="/account" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
          <User size={24} />
          <span>Profile</span>
        </NavLink>
      </nav>
    </div>
  );
};

export default BottomNav;
