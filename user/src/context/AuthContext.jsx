import React, { createContext, useState, useEffect, useContext } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('amma_token') || null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state on app load
  useEffect(() => {
    const initializeAuth = async () => {
      // Check if token exists in localStorage (from previous login)
      const storedToken = localStorage.getItem('amma_token');
      const authProvider = localStorage.getItem('auth_provider');
      
      if (storedToken && authProvider === 'custom') {
        // Token exists from backend login - fetch profile
        setToken(storedToken);
        try {
          const response = await authService.getProfile();
          setUser(response.data.user);
        } catch (err) {
          console.error("Failed to fetch user profile with stored token:", err);
          // Token might be expired, clear it
          localStorage.removeItem('amma_token');
          localStorage.removeItem('auth_provider');
          setToken(null);
          setUser(null);
        }
      } else {
        // No valid token, user is not logged in
        setToken(null);
        setUser(null);
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await authService.login(email, password);
      const newToken = response.data.token;
      const userData = response.data.user;
      
      // Store token in localStorage BEFORE updating state
      localStorage.setItem('auth_provider', 'custom');
      localStorage.setItem('amma_token', newToken);
      
      console.log('✓ Login successful');
      console.log('✓ Token stored in localStorage:', newToken.substring(0, 30) + '...');
      console.log('✓ Stored token retrieved:', localStorage.getItem('amma_token').substring(0, 30) + '...');
      
      // Update state
      setToken(newToken);
      setUser(userData);
      
      return { success: true, user: userData };
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Login failed. Please check your credentials.";
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, phone, password) => {
    setLoading(true);
    try {
      await authService.register(name, email, phone, password);
      // Automatically log in after registration
      return await login(email, password);
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Registration failed.";
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    // Clear localStorage first
    localStorage.removeItem('amma_token');
    localStorage.removeItem('auth_provider');
    
    // Update state
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const response = await authService.getProfile();
      setUser(response.data.user);
      return response.data.user;
    } catch (err) {
      console.error("Failed to refresh user:", err);
      return null;
    }
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      const { signInWithPopup } = await import('firebase/auth');
      const { auth, googleProvider } = await import('../config/firebase');
      
      // 1. Sign in with Google Popup
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // 2. Get the Firebase ID Token
      const idToken = await user.getIdToken();
      
      // 3. Exchange it with our backend to get our own JWT token and user record
      const response = await authService.exchangeFirebaseToken(idToken);
      
      const newToken = response.data.token;
      const userData = response.data.user;
      
      // 4. Store and set state
      localStorage.setItem('auth_provider', 'google');
      localStorage.setItem('amma_token', newToken);
      
      setToken(newToken);
      setUser(userData);
      
      return { success: true, user: userData };
    } catch (err) {
      console.error("Firebase Login Error:", err);
      let errorMessage = "Google login failed.";
      if (err.code === 'auth/popup-closed-by-user') {
        errorMessage = "Login cancelled.";
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      }
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, refreshUser, loginWithGoogle }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
