import React, { useState, useEffect, useRef } from 'react';
import apiClient from '../services/api';

const POPULAR_SEARCHES = ['Idli', 'Dosa', 'Ragi Batter', 'Biryani', 'Meals', 'Podi'];

const SearchBar = ({ value, onChange, placeholder = "Search for warm dishes or batters..." }) => {
  const [focused, setFocused] = useState(false);
  const [history, setHistory] = useState([]);
  const [products, setProducts] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const containerRef = useRef(null);

  // Load Search History and Cache Products List once
  useEffect(() => {
    const saved = localStorage.getItem('amma_search_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        setHistory([]);
      }
    }

    const fetchAllProducts = async () => {
      try {
        const res = await apiClient.get('/products/');
        if (Array.isArray(res.data)) {
          setProducts(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch products for search bar suggestions:", err);
      }
    };
    fetchAllProducts();
  }, []);

  // Compute suggestions when user types (debounced)
  useEffect(() => {
    const handler = setTimeout(() => {
      if (!value.trim() || products.length === 0) {
        setSuggestions([]);
        return;
      }

      const query = value.toLowerCase();
      
      // Filter matching products (max 5)
      const matchingProducts = products
        .filter(p => p.name.toLowerCase().includes(query) || (p.description && p.description.toLowerCase().includes(query)))
        .slice(0, 5);

      // Find matching categories
      const categories = Array.from(new Set(products.map(p => p.category.replace('_', '-'))));
      const matchingCategories = categories
        .filter(cat => cat.toLowerCase().includes(query))
        .slice(0, 2);

      setSuggestions({
        products: matchingProducts,
        categories: matchingCategories
      });
    }, 300); // 300ms debounce

    return () => clearTimeout(handler);
  }, [value, products]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const addSearchToHistory = (term) => {
    if (!term.trim()) return;
    const cleanTerm = term.trim();
    const updated = [cleanTerm, ...history.filter(h => h !== cleanTerm)].slice(0, 5);
    setHistory(updated);
    localStorage.setItem('amma_search_history', JSON.stringify(updated));
  };

  const removeHistoryItem = (e, item) => {
    e.stopPropagation();
    const updated = history.filter(h => h !== item);
    setHistory(updated);
    localStorage.setItem('amma_search_history', JSON.stringify(updated));
  };

  const handleSelectTerm = (term) => {
    onChange(term);
    addSearchToHistory(term);
    setFocused(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      addSearchToHistory(value);
      setFocused(false);
    } else if (e.key === 'Escape') {
      setFocused(false);
    }
  };

  return (
    <div 
      ref={containerRef}
      className="search-bar-container" 
      style={{ 
        width: '100%', 
        maxWidth: '100%', 
        margin: '0 auto 30px', 
        position: 'relative',
        zIndex: 500
      }}
    >
      <div className="search-input-wrapper" style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        boxShadow: focused ? '0 6px 20px rgba(0,0,0,0.08)' : '0 4px 10px rgba(0,0,0,0.03)',
        borderRadius: '50px',
        border: focused ? '1px solid var(--primary-color)' : '1px solid #EAE6DB',
        backgroundColor: '#FFFFFF',
        overflow: 'hidden',
        transition: 'all 0.25s ease'
      }}>
        <i className="fal fa-search" style={{ position: 'absolute', left: '20px', color: focused ? 'var(--primary-color)' : '#7A7870' }}></i>
        <input
          type="text"
          value={value}
          onFocus={() => setFocused(true)}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          aria-label="Search items"
          aria-autocomplete="list"
          style={{
            width: '100%',
            padding: '16px 20px 16px 54px',
            border: 'none',
            outline: 'none',
            fontSize: '16px',
            color: '#2B2A27'
          }}
        />
        {value && (
          <button 
            type="button" 
            onClick={() => { onChange(''); setSuggestions([]); }}
            style={{ 
              background: 'none', 
              border: 'none', 
              position: 'absolute', 
              right: '20px', 
              cursor: 'pointer',
              color: '#7A7870',
              padding: '4px'
            }}
            aria-label="Clear search"
          >
            <i className="fal fa-times"></i>
          </button>
        )}
      </div>

      {/* SEARCH SUGGESTIONS OVERLAY */}
      {focused && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          marginTop: '10px',
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #EAE6DB',
          boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
          overflow: 'hidden',
          padding: '15px 0'
        }}>
          {/* Default overlay when query is empty */}
          {!value.trim() ? (
            <>
              {history.length > 0 && (
                <div style={{ padding: '0 20px 15px' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Recent Searches</span>
                    <button 
                      onClick={() => { setHistory([]); localStorage.removeItem('amma_search_history'); }}
                      style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', fontSize: '0.75rem', padding: 0 }}
                    >
                      Clear All
                    </button>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {history.map((item, idx) => (
                      <span 
                        key={idx}
                        onClick={() => handleSelectTerm(item)}
                        style={{
                          backgroundColor: '#F5F5F0',
                          padding: '6px 12px',
                          borderRadius: '20px',
                          fontSize: '0.85rem',
                          color: 'var(--text-dark)',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          transition: 'background-color 0.2s'
                        }}
                      >
                        {item}
                        <i 
                          className="fal fa-times-circle" 
                          onClick={(e) => removeHistoryItem(e, item)}
                          style={{ cursor: 'pointer', color: '#A09E96' }}
                        ></i>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ padding: '0 20px', borderTop: history.length > 0 ? '1px solid #FAF9F6' : 'none', paddingTop: history.length > 0 ? '15px' : '0' }}>
                <span style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Popular Searches
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {POPULAR_SEARCHES.map((term, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectTerm(term)}
                      style={{
                        border: '1px solid #EAE6DB',
                        backgroundColor: '#FFFFFF',
                        padding: '6px 14px',
                        borderRadius: '20px',
                        fontSize: '0.85rem',
                        color: 'var(--text-dark)',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => { e.target.style.borderColor = 'var(--primary-color)'; e.target.style.color = 'var(--primary-color)'; }}
                      onMouseLeave={(e) => { e.target.style.borderColor = '#EAE6DB'; e.target.style.color = 'var(--text-dark)'; }}
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            // Autocomplete suggestions based on query
            <>
              {suggestions.categories && suggestions.categories.length > 0 && (
                <div style={{ padding: '0 20px 10px' }}>
                  <span style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Categories
                  </span>
                  {suggestions.categories.map((cat, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => handleSelectTerm(cat)}
                      style={{
                        padding: '8px 10px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        color: 'var(--primary-color)',
                        fontWeight: '600'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#FAF9F6'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                      Browse {cat.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                    </div>
                  ))}
                </div>
              )}

              <div style={{ padding: '0 10px' }}>
                <span style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-muted)', textTransform: 'uppercase', padding: '5px 10px' }}>
                  Products
                </span>
                {suggestions.products && suggestions.products.length > 0 ? (
                  suggestions.products.map((p) => (
                    <div 
                      key={p.id}
                      onClick={() => handleSelectTerm(p.name)}
                      style={{
                        padding: '10px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FAF9F6'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <div style={{
                        width: '36px',
                        height: '36px',
                        backgroundColor: '#F5F5F0',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1rem'
                      }}>🍛</div>
                      <div>
                        <div style={{ fontWeight: '500', fontSize: '0.9rem', color: 'var(--text-dark)' }}>{p.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Rs. {p.price.toFixed(2)}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ padding: '10px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    No matching products found. Try "Idli" or "Roast".
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
