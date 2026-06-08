import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ArrowRight, ShoppingCart, User, Package, Gift } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const GlobalSearchModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  // Mock quick links for search
  const quickLinks = [
    { label: "Today's Orders", icon: ShoppingCart, to: "/admin/orders" },
    { label: "Recent Customers", icon: User, to: "/admin/customers" },
    { label: "Low Stock Items", icon: Package, to: "/admin/inventory" },
    { label: "Active Offers", icon: Gift, to: "/admin/offers" }
  ];

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
      setQuery('');
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [isOpen]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      // In a real app, this would route to a search results page or filter locally
      navigate(`/admin/orders?search=${encodeURIComponent(query)}`);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="global-search-modal"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: '#fff',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Header */}
          <div style={{ padding: '20px', borderBottom: '1px solid #EAE6DB', display: 'flex', alignItems: 'center', gap: '15px' }}>
            <form onSubmit={handleSearch} style={{ flex: 1, display: 'flex', alignItems: 'center', background: '#FAF8F2', borderRadius: '12px', padding: '10px 15px' }}>
              <Search size={20} color="#888" />
              <input 
                type="text" 
                placeholder="Search orders, products, customers..." 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
                style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', paddingLeft: '10px', fontSize: '16px' }}
              />
            </form>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px' }}>
              <X size={24} color="#333" />
            </button>
          </div>

          {/* Body */}
          <div style={{ padding: '20px', flex: 1, overflowY: 'auto' }}>
            {!query ? (
              <div>
                <h4 style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>Quick Links</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {quickLinks.map((link, idx) => (
                    <button 
                      key={idx}
                      onClick={() => { navigate(link.to); onClose(); }}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '15px', backgroundColor: '#FAF8F2', borderRadius: '10px',
                        border: 'none', cursor: 'pointer', textAlign: 'left',
                        transition: 'background 0.2s'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#333', fontWeight: '600' }}>
                        <link.icon size={18} color="var(--theme-color)" />
                        {link.label}
                      </div>
                      <ArrowRight size={16} color="#888" />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: '#666', marginTop: '40px' }}>
                <Search size={40} color="#ccc" style={{ marginBottom: '15px' }} />
                <p>Press Enter to search for "<strong>{query}</strong>"</p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GlobalSearchModal;
