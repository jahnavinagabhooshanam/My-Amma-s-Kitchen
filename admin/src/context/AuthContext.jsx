import React, { createContext, useState, useEffect, useContext } from 'react';
import adminService from '../services/adminService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('amma_admin_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      localStorage.setItem('amma_admin_token', token);
      fetchProfile();
    } else {
      localStorage.removeItem('amma_admin_token');
      setUser(null);
      setLoading(false);
    }
  }, [token]);

  const fetchProfile = async () => {
    try {
      const response = await adminService.getProfile();
      const u = response.data.user;
      const allowedRoles = ['admin', 'manager', 'kitchen_staff', 'delivery_staff'];
      if (u && allowedRoles.includes(u.role) && u.status !== 'Disabled') {
        setUser(u);
      } else {
        // Not an admin/staff or disabled: log out immediately
        logout();
      }
    } catch (err) {
      console.error("Failed to fetch admin profile, logging out:", err);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await adminService.login(email, password);
      const u = response.data.user;
      const allowedRoles = ['admin', 'manager', 'kitchen_staff', 'delivery_staff'];

      if (!u || !allowedRoles.includes(u.role)) {
        return { success: false, error: "Access denied. Only administrators and staff are allowed." };
      }

      if (u.status === 'Disabled') {
        return { success: false, error: "Your account has been disabled. Please contact the administrator." };
      }

      setToken(response.data.token);
      setUser(u);
      return { success: true, user: u };
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Login failed. Please check your credentials.";
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
