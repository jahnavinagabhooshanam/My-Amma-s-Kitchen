import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Star, Clock, Plus, Minus, Search, LayoutGrid, Heart } from 'lucide-react';
import apiClient from '../../services/api';
import { useCart } from '../../context/CartContext';
import wishlistService from '../../services/wishlistService';
import DishDetailsModal from './DishDetailsModal';
import OptimizedImage from '../../components/OptimizedImage';
import { ProductGridSkeleton } from '../../components/ProductSkeleton';
import SEO from '../../components/SEO';
import { Link } from 'react-router-dom';
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
  const { cartItems, addToCart, updateQuantity } = useCart();
  
  const [loading, setLoading] = useState(true);
  const [allProducts, setAllProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedDish, setSelectedDish] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [dietFilter, setDietFilter] = useState('All');
  const [wishlistedItems, setWishlistedItems] = useState(new Set());

  const handleWishlist = async (e, item) => {
    e.stopPropagation();
    try {
      await wishlistService.add({ product_id: item.id });
      setWishlistedItems(prev => new Set([...prev, item.id]));
    } catch (err) {
      console.error(err);
    }
  };

  // Extract query param if any
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('search');
    if (q) setSearchQuery(q);
  }, []);

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
    if (dietFilter !== 'All') {
      filtered = filtered.filter(p => {
        const type = (p.diet_type || '').toLowerCase();
        if (dietFilter === 'Veg') return type === 'veg' || type === 'vegetarian';
        if (dietFilter === 'Non-Veg') return type === 'non-veg' || type === 'non-vegetarian';
        return true;
      });
    }
    return filtered;
  }, [allProducts, activeCategory, searchQuery, dietFilter]);

  return (
    <div className="app-menu-container pb-20" style={{ background: '#FAF9F5', minHeight: '100vh' }}>
      <h1 className="visually-hidden" style={{ display: 'none' }}>Our Menu - Ammulu's Kitchen</h1>
      {/* Search Bar */}
      <div className="app-menu-search d-none d-lg-block">
        <div className="search-bar-app">
          <Search size={18} color="var(--text-muted)" />
          <input 
            type="text" 
            placeholder="Search for idli, dosa, batter..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>


      <SEO title="Our Menu | Ammulu's Kitchen" description="Explore our extensive menu of authentic South Indian vegetarian dishes, fresh batters, and ready-to-eat meals." />
      
      {/* Filters Sidebar for Desktop */}
      <div className="diet-filters-container" style={{ padding: '0 20px', marginTop: '10px', display: 'flex', gap: '10px' }}>
        <button 
          onClick={() => setDietFilter('All')} 
          style={{ padding: '6px 16px', borderRadius: '20px', border: dietFilter === 'All' ? 'none' : '1px solid #ddd', background: dietFilter === 'All' ? '#2E8B57' : 'white', color: dietFilter === 'All' ? 'white' : '#666', fontSize: '13px', fontWeight: '600', transition: 'all 0.2s' }}>
          All
        </button>
        <button 
          onClick={() => setDietFilter('Veg')} 
          style={{ padding: '6px 16px', borderRadius: '20px', border: dietFilter === 'Veg' ? 'none' : '1px solid #ddd', background: dietFilter === 'Veg' ? '#2E8B57' : 'white', color: dietFilter === 'Veg' ? 'white' : '#666', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s' }}>
          <div className={`diet-indicator veg ${dietFilter === 'Veg' ? 'active-filter' : ''}`} style={{ position: 'relative', margin: 0, transform: 'scale(0.8)', borderColor: dietFilter === 'Veg' ? 'white' : '' }}><div className="dot" style={{ backgroundColor: dietFilter === 'Veg' ? 'white' : '' }}></div></div> Veg
        </button>
        <button 
          onClick={() => setDietFilter('Non-Veg')} 
          style={{ padding: '6px 16px', borderRadius: '20px', border: dietFilter === 'Non-Veg' ? 'none' : '1px solid #ddd', background: dietFilter === 'Non-Veg' ? '#E84C3D' : 'white', color: dietFilter === 'Non-Veg' ? 'white' : '#666', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s' }}>
          <div className={`diet-indicator non-veg ${dietFilter === 'Non-Veg' ? 'active-filter' : ''}`} style={{ position: 'relative', margin: 0, transform: 'scale(0.8)', borderColor: dietFilter === 'Non-Veg' ? 'white' : '' }}><div className="dot" style={{ backgroundColor: dietFilter === 'Non-Veg' ? 'white' : '' }}></div></div> Non-Veg
        </button>
      </div>

      {/* Product List */}
      <div className="container" style={{ padding: '20px' }}>
        {loading ? (
          <ProductGridSkeleton count={8} />
        ) : filteredProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px 0' }}>
            <p className="text-muted">No dishes found matching your criteria.</p>
          </div>
        ) : (
          <div className="modern-menu-grid">
            {filteredProducts.map((item, i) => {
              const cartItem = cartItems.find(c => c.id === item.id);
              const qty = cartItem ? cartItem.quantity : 0;
              const isNonVeg = item.diet_type?.toLowerCase() === 'non-veg';
              // Randomly assign rating between 4.2 and 5.0 for demonstration if not provided
              const rating = item.rating || (Math.random() * 0.8 + 4.2).toFixed(1);

              return (
                <motion.div 
                  key={item.id || i}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="modern-menu-card" 
                  >
                    <div className="card-image-section" style={{ position: 'relative' }}>
                      <Link to={`/product/${item.id}`} style={{ display: 'block', width: '100%', height: '100%' }} onClick={(e) => e.stopPropagation()}>
                        <OptimizedImage src={item.image} alt={item.name} className="menu-item-img" />
                      </Link>
                    <button 
                      onClick={(e) => handleWishlist(e, item)}
                      style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        background: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '32px',
                        height: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                        cursor: 'pointer',
                        zIndex: 10
                      }}
                    >
                      <Heart size={18} fill={wishlistedItems.has(item.id) ? '#DC143C' : 'none'} color={wishlistedItems.has(item.id) ? '#DC143C' : '#666'} />
                    </button>
                    
                    {/* Badges */}
                    <div className="badge-container">
                      {item.is_bestseller && <span className="badge bestseller">Best Seller</span>}
                      {Math.random() > 0.7 && <span className="badge fresh">Fresh Today</span>}
                    </div>
                  </div>

                  <div className="card-info-section">
                    <div className="title-row">
                      <div className={`diet-indicator ${isNonVeg ? 'non-veg' : 'veg'}`}>
                        <div className="dot"></div>
                      </div>
                      <Link to={`/product/${item.id}`} style={{ textDecoration: 'none', color: 'inherit' }} onClick={(e) => e.stopPropagation()}>
                        <h4 className="item-name">{item.name}</h4>
                      </Link>
                    </div>
                    
                    <p className="item-desc">
                      {item.description || 'Authentic south indian delicacy prepared with premium ingredients.'}
                    </p>

                    <div className="meta-row">
                      <div className="rating">
                        <Star size={14} fill="#F5B941" color="#F5B941" /> 
                        <span>{rating} <span style={{ color: '#999', fontWeight: 400, marginLeft: 4 }}>(128)</span></span>
                      </div>
                    </div>

                    <div className="card-bottom-row" onClick={e => e.stopPropagation()}>
                      <div className="price">₹{item.price}</div>
                      <div className="action-container">
                        {item.in_stock === false ? (
                          <div className="btn-sold-out">SOLD OUT</div>
                        ) : qty > 0 ? (
                          <div className="qty-controls">
                            <button className="qty-btn" onClick={() => updateQuantity(item.id, qty - 1)}><Minus size={16}/></button>
                            <span className="qty-val">{qty}</span>
                            <button className="qty-btn" onClick={() => updateQuantity(item.id, qty + 1)}><Plus size={16}/></button>
                          </div>
                        ) : (
                          <button className="btn-add" onClick={() => addToCart(item, 1)}>+ Add</button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
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
