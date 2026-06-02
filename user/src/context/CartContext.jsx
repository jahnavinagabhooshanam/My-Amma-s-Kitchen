import React, { createContext, useState, useEffect, useContext } from 'react';
import { useAuth } from './AuthContext';
import cartService from '../services/cartService';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { token } = useAuth();
  const [cartItems, setCartItems] = useState([]);

  // Load cart items initially or when token changes
  useEffect(() => {
    const loadCart = async () => {
      if (token) {
        try {
          console.log('Loading cart with token:', token.substring(0, 20) + '...');
          const response = await cartService.getCart();
          setCartItems(response.data || []);
        } catch (err) {
          console.error("Failed to load server cart:", err.response?.status, err.response?.data);
          // Fall back to empty cart if token fails
          setCartItems([]);
        }
      } else {
        // No token - use localStorage
        const saved = localStorage.getItem('amma_cart');
        setCartItems(saved ? JSON.parse(saved) : []);
      }
    };
    loadCart();
  }, [token]);

  // Sync to localStorage only if NOT logged in
  useEffect(() => {
    if (!token) {
      localStorage.setItem('amma_cart', JSON.stringify(cartItems));
    }
  }, [cartItems, token]);

  const addToCart = async (product, quantity = 1) => {
    if (token) {
      try {
        await cartService.addToCart(product.id, quantity);
        // Refresh cart from server to be in sync
        const response = await cartService.getCart();
        setCartItems(response.data);
      } catch (err) {
        console.error("Failed to add to server cart:", err);
      }
    } else {
      setCartItems(prev => {
        const existing = prev.find(item => item.id === product.id);
        if (existing) {
          return prev.map(item =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        }
        return [...prev, {
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          unit: product.unit || '1kg Pouch',
          quantity
        }];
      });
    }
  };

  const removeFromCart = async (productId) => {
    if (token) {
      try {
        await cartService.removeFromCart(productId);
        // Refresh cart from server
        const response = await cartService.getCart();
        setCartItems(response.data);
      } catch (err) {
        console.error("Failed to remove from server cart:", err);
      }
    } else {
      setCartItems(prev => prev.filter(item => item.id !== productId));
    }
  };

  const updateQuantity = async (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    if (token) {
      try {
        // Find existing item quantity to calculate delta
        const existing = cartItems.find(item => item.id === productId);
        const currentQty = existing ? existing.quantity : 0;
        const delta = quantity - currentQty;
        
        await cartService.addToCart(productId, delta);
        // Refresh
        const response = await cartService.getCart();
        setCartItems(response.data);
      } catch (err) {
        console.error("Failed to update server cart quantity:", err);
      }
    } else {
      setCartItems(prev =>
        prev.map(item =>
          item.id === productId ? { ...item, quantity } : item
        )
      );
    }
  };

  const clearCart = async () => {
    if (token) {
      try {
        for (const item of cartItems) {
          await cartService.removeFromCart(item.id);
        }
        setCartItems([]);
      } catch (err) {
        console.error("Failed to clear server cart:", err);
      }
    } else {
      setCartItems([]);
    }
  };

  const cartTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      cartTotal,
      cartCount
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
