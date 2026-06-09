import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Star, Clock, Plus, Search, LayoutGrid } from 'lucide-react';
import apiClient from '../../services/api';
import { useCart } from '../../context/CartContext';
import DishDetailsModal from './DishDetailsModal';
import './Menu.css';

const resolveImg = (path) => {
  if (!path) return 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80';
  let clean = path;
  if (clean.startsWith('http')) return clean;
  
  const backendUrl = import.meta.env.VITE_API_BASE_URL 
    ? import.meta.env.VITE_API_BASE_URL.replace('/api', '') 
    : 'http://127.0.0.1:5000';

  if (clean.startsWith('/uploads/') || clean.startsWith('uploads/')) {
    if (clean.startsWith('/')) clean = clean.substring(1);
    return `${backendUrl}/${clean}`;
  }

  if (clean.startsWith('/assets/') || clean.startsWith('assets/') || clean.startsWith('/api/assets/')) {
    clean = clean.replace(/^\/?(api\/)?assets\//, '');
    return `/assets/${clean}`;
  }
  
  return clean.startsWith('/') ? clean : `/${clean}`;
};

const CATEGORY_ORDER = [
  'All', 'Breakfast', 'Lunch', 'Dinner', 'Ready To Eat', 'Ready To Cook', 'Batter Products', 'Snacks', 'Curries', 'Combos', 'Bestsellers'
];

const CATEGORY_ICONS = {
  'Breakfast': '🥞',
  'Lunch': '🍱',
  'Snacks': '🥟',
  'Curries': '🍲',
  'Combos': '🎁',
  'Bestsellers': '⭐',
  'Ready To Eat': '🍛',
  'Ready To Cook': '🍳',
  'Batter Products': '🥣',
  'Dinner': '🥘'
};

const Menu = () => {
  const { addToCart } = useCart();
  
  const [loading, setLoading] = useState(true);
  const [allProducts, setAllProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedDish, setSelectedDish] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await apiClient.get('/products/', { params: { limit: 200 } });
        setAllProducts(res.data || []);
      } catch (e) { 
        console.error("Failed to load products", e); 
      } finally { 
        setLoading(false); 
      }
    };
    load();
  }, []);

  const categories = useMemo(() => {
    const cats = ['All'];
    allProducts.forEach(p => {
      if (p.category) {
        const cleanCat = p.category.replace(/_/g, ' ').replace(/-/g, ' ');
        const titleCase = cleanCat.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        if (!cats.includes(titleCase)) cats.push(titleCase);
      }
    });
    return cats.sort((a, b) => {
      const idxA = CATEGORY_ORDER.indexOf(a);
      const idxB = CATEGORY_ORDER.indexOf(b);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.localeCompare(b);
    });
  }, [allProducts]);

  const filteredProducts = useMemo(() => {
    let filtered = allProducts;
    if (activeCategory !== 'All') {
      filtered = filtered.filter(p => {
        const cleanCat = (p.category || '').replace(/_/g, ' ').replace(/-/g, ' ');
        const titleCase = cleanCat.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        return titleCase === activeCategory;
      });
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.name?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q)
      );
    }
    return filtered;
  }, [allProducts, activeCategory, searchQuery]);

  return (
    <div className="app-menu-container pb-5 mb-5" style={{ background: '#FAF9F5', minHeight: '100vh' }}>
      
      {/* Search Bar - visible only on desktop since mobile has header search, but let's keep a functional one */}
      <div className="app-menu-search d-none d-lg-block" style={{ padding: '20px', background: 'white' }}>
        <div className="search-bar-app" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <Search size={18} color="var(--text-muted)" />
          <input 
            type="text" 
            placeholder="Search for idli, dosa, batter..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Horizontal Filter Chips */}
      <div className="app-menu-filters" style={{ background: 'white', padding: '15px 20px', position: 'sticky', top: 0, zIndex: 100, borderBottom: '1px solid #EAEAEA' }}>
        <div style={{ display: 'flex', gap: 12, overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: 5 }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 20px',
                borderRadius: '20px',
                border: activeCategory === cat ? 'none' : '1px solid #EAEAEA',
                background: activeCategory === cat ? 'var(--primary-color)' : 'white',
                color: activeCategory === cat ? 'white' : 'var(--text-dark)',
                fontWeight: 600,
                fontSize: 13,
                whiteSpace: 'nowrap',
                transition: '0.2s ease'
              }}
            >
              {cat === 'All' ? <LayoutGrid size={14} /> : (CATEGORY_ICONS[cat] && <span style={{fontSize: 14}}>{CATEGORY_ICONS[cat]}</span>)}
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product List */}
      <div className="app-menu-list desktop-container" style={{ padding: '20px', margin: '0 auto' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px 0' }}>
            <div className="spinner-border text-primary" role="status"></div>
            <p className="mt-3 text-muted">Loading menu...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px 0' }}>
            <p className="text-muted">No dishes found matching your criteria.</p>
          </div>
        ) : (
          <div className="app-food-list" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {filteredProducts.map((item, i) => (
              <motion.div 
                key={item.id || i}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="app-food-card-horizontal" 
                style={{ display: 'flex', flexDirection: 'row-reverse', gap: 15, padding: 15, background: 'white', borderRadius: 16, border: '1px solid #EAEAEA', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}
                onClick={() => setSelectedDish(item)}
              >
                <div className="menu-desktop-img" style={{ position: 'relative', width: 130, height: 130, flexShrink: 0 }}>
                  <img src={resolveImg(item.image)} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 12 }} />
                  <button 
                    onClick={(e) => { e.stopPropagation(); addToCart(item); }}
                    disabled={item.in_stock === false}
                    style={{ 
                      position: 'absolute', bottom: -12, left: '50%', transform: 'translateX(-50%)', 
                      background: 'white', color: item.in_stock === false ? 'gray' : 'var(--primary-color)', 
                      border: '1px solid #EAEAEA', borderRadius: 8, padding: '6px 24px', 
                      fontSize: 13, fontWeight: 800, boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {item.in_stock === false ? 'SOLD OUT' : 'ADD +'}
                  </button>
                </div>

                <div className="menu-desktop-text" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <div className={`diet-dot ${item.diet_type?.toLowerCase() === 'non-veg' ? 'nonveg' : 'veg'}`} style={{ width: 12, height: 12, border: `1px solid ${item.diet_type?.toLowerCase() === 'non-veg' ? '#E74C3C' : '#27AE60'}`, padding: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: item.diet_type?.toLowerCase() === 'non-veg' ? '#E74C3C' : '#27AE60' }}></div>
                    </div>
                    {item.is_bestseller && <span style={{ fontSize: 10, color: '#E84C3D', fontWeight: 700, background: '#FDF2F0', padding: '2px 6px', borderRadius: 4 }}>BESTSELLER</span>}
                  </div>
                  <h4 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4, color: 'var(--text-dark)' }}>{item.name}</h4>
                  <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-dark)', marginBottom: 8 }}>Rs. {item.price}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 2, background: '#F5F5F0', padding: '2px 6px', borderRadius: 4 }}><Star size={10} fill="var(--warning)" color="var(--warning)"/> 4.5</span>
                    <span><Clock size={10}/> 20-30 mins</span>
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {item.description || 'Authentic south indian delicacy prepared with love and premium ingredients.'}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <DishDetailsModal
        dish={selectedDish}
        onClose={() => setSelectedDish(null)}
        resolveImagePath={resolveImg}
      />
    </div>
  );
};

export default Menu;
