import React, { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { resolveImagePath } from '../../components/FoodCard';
import { Clock, ShieldCheck, Leaf, Flame, Sparkles, LayoutGrid, Search, Filter } from 'lucide-react';
import apiClient from '../../services/api';
import SEO from '../../components/SEO';
import './ReadyToCook.css';

const RTCProductCard = ({ product }) => {
  const { addToCart } = useCart();
  
  // Decide visual badges based on product attributes (simulating dynamic data)
  const isBestSeller = product.id === 'bat-1' || product.id === 'rtc-2' || product.name.includes('Premium');
  const isTrending = product.id === 'rtc-4' || product.name.includes('Sambar');
  const isNew = product.id === 'rtc-3' || product.name.includes('Millet');
  const isFavorite = product.id === 'bat-1' || product.name.includes('Paneer');
  
  // Visual rating
  const rating = product.name.includes('Idli') ? '4.9' : (product.name.includes('Sambar') ? '4.8' : '4.7');
  
  // Info chips
  const time = product.cookingTime || (product.name.toLowerCase().includes('batter') ? 'Ready instantly' : '10 mins');

  return (
    <div className="rtc-card">
      <div className="rtc-card-img-wrapper">
        <img src={resolveImagePath(product.image)} alt={product.name} className="rtc-card-img" />
        
        <div className="rtc-card-badges">
          {isBestSeller && <div className="rtc-badge bestseller">⭐ Best Seller</div>}
          {isTrending && <div className="rtc-badge trending">🔥 Trending</div>}
          {isNew && <div className="rtc-badge new">🆕 New</div>}
          {isFavorite && <div className="rtc-badge favorite">❤️ Customer Favorite</div>}
        </div>
        
        <div className="rtc-rating">
          <span className="rtc-rating-star">★</span> {rating}
        </div>
      </div>
      
      <div className="rtc-card-content">
        <h3 className="rtc-card-title">{product.name}</h3>
        
        <div className="rtc-quick-info">
          <div className="rtc-info-chip"><Clock size={12} /> {time}</div>
          <div className="rtc-info-chip"><Leaf size={12} /> Fresh Daily</div>
          <div className="rtc-info-chip"><ShieldCheck size={12} /> No Preservatives</div>
          <div className="rtc-info-chip">Serves 4</div>
        </div>
        
        <div className="rtc-card-footer">
          <span className="rtc-card-price">Rs. {product.price.toFixed(2)}</span>
          <button className="rtc-add-btn" onClick={(e) => { e.preventDefault(); addToCart(product, 1); }}>
            Add To Cart
          </button>
        </div>
      </div>
    </div>
  );
};

const ReadyToCook = () => {
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All Items');
  const [dietFilter, setDietFilter] = useState('All');
  const [search, setSearch] = useState('');

  const CATEGORIES = ['All Items', 'Batter', 'Breakfast', 'Snacks', 'Popular'];
  const CATEGORY_ICONS = {
    'All Items': <LayoutGrid size={16} />,
    'Batter': '🏺',
    'Breakfast': '🍳',
    'Snacks': '🥟',
    'Popular': '🌟'
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get('/products/');
        const all = res.data;
        const rtcs = all.filter(p => {
          const isRtc = p.category === 'ready-to-cook' || p.category === 'ready_to_cook';
          const isBatter = ['traditional', 'millet', 'health', 'batter_products', 'family_packs', 'premium'].includes(p.category);
          return isRtc || isBatter;
        });
        
        setProducts(rtcs);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Filtering logic
  const getFilteredProducts = () => {
    let filtered = products;
    if (activeCategory === 'Batter') filtered = products.filter(p => ['traditional', 'millet', 'health', 'batter_products', 'family_packs', 'premium'].includes(p.category) || p.name.toLowerCase().includes('batter') || p.name.toLowerCase().includes('dosa'));
    else if (activeCategory === 'Breakfast') filtered = products.filter(p => p.name.toLowerCase().includes('batter') || p.name.toLowerCase().includes('idli'));
    else if (activeCategory === 'Snacks') filtered = products.filter(p => p.name.toLowerCase().includes('tikka') || p.name.toLowerCase().includes('snack'));
    else if (activeCategory === 'Popular') filtered = products.filter(p => p.id === 'bat-1' || p.id === 'rtc-2' || p.name.includes('Premium') || p.name.includes('Sambar'));

    if (dietFilter === 'Veg') {
      filtered = filtered.filter(p => {
        const isNonVegItem = p.type === 'Non-Veg' || p.diet_type === 'Non-Veg' || (['chicken', 'mutton', 'fish', 'egg', 'prawn', 'crab', 'beef', 'pork', 'meat', 'biriyani', 'prawns'].some(keyword => p.name.toLowerCase().includes(keyword)) && !p.name.toLowerCase().includes('veg bir'));
        return !isNonVegItem;
      });
    } else if (dietFilter === 'Non-Veg') {
      filtered = filtered.filter(p => {
        const isNonVegItem = p.type === 'Non-Veg' || p.diet_type === 'Non-Veg' || (['chicken', 'mutton', 'fish', 'egg', 'prawn', 'crab', 'beef', 'pork', 'meat', 'biriyani', 'prawns'].some(keyword => p.name.toLowerCase().includes(keyword)) && !p.name.toLowerCase().includes('veg bir'));
        return isNonVegItem;
      });
    }

    if (search.trim() !== '') {
      filtered = filtered.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || (p.description && p.description.toLowerCase().includes(search.toLowerCase())));
    }
    return filtered;
  };

  const filteredProducts = getFilteredProducts();

  // Identify featured & trending
  const featuredProduct = products.find(p => p.name.toLowerCase().includes('premium')) || products[0];
  const trendingProducts = products.filter(p => p.id !== featuredProduct?.id).slice(0, 3);

  return (
    <div className="rtc-page-container">
      <SEO title="Ready-to-Cook & Batters" description="Fresh, preservative-free batters and curry kits." />
      
      <div className="container" style={{ maxWidth: '1400px' }}>
        
        {/* Search & Filter Bar */}
        <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '30px' }}>
          <div className="search-filter-row" style={{ display: 'flex', gap: 15, alignItems: 'center' }}>
            <div className="search-input-col" style={{ flex: 1, position: 'relative', maxWidth: '600px' }}>
              <Search size={20} color="#999" className="search-icon" style={{ position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="text" 
                className="search-input-field"
                placeholder="Search for batters, curries, meals..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ width: '100%', padding: '16px 20px 16px 50px', borderRadius: '30px', border: '1px solid #EAEAEA', fontSize: '1rem', outline: 'none', background: 'white', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}
              />
            </div>
            <div className="filter-select-col" style={{ position: 'relative' }}>
              <Filter size={18} color="#2C1A0E" className="filter-icon" style={{ position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              <select 
                className="filter-select-field"
                value={dietFilter} 
                onChange={(e) => setDietFilter(e.target.value)}
                style={{ appearance: 'none', padding: '16px 40px 16px 48px', borderRadius: '30px', border: '1px solid #EAEAEA', background: 'white', fontWeight: 600, color: '#2C1A0E', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', cursor: 'pointer', outline: 'none' }}
              >
                <option value="All">All Diet</option>
                <option value="Veg">Vegetarian 🌿</option>
                <option value="Non-Veg">Non-Veg 🍗</option>
              </select>
              <div className="filter-arrow" style={{ position: 'absolute', right: 20, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', fontSize: '0.8rem', color: '#666' }}>▼</div>
            </div>
          </div>
        </div>

        {/* Category Filter Chips */}
        <div className="rtc-filters">
          {CATEGORIES.map(cat => (
            <button 
              key={cat}
              className={`rtc-filter-chip ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              {CATEGORY_ICONS[cat]} {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '100px', color: '#8B1A10' }}>
            <Sparkles className="fa-spin" size={32} />
          </div>
        ) : (
          <>
            {/* Featured Product Section - Shows only on "All Items" or "Popular" */}
            {(activeCategory === 'All Items' || activeCategory === 'Popular') && featuredProduct && (
              <div className="rtc-featured-section">
                <div className="rtc-featured-img-wrapper">
                  <img src={resolveImagePath(featuredProduct.image)} alt={featuredProduct.name} className="rtc-featured-img" />
                </div>
                <div className="rtc-featured-content">
                  <div className="rtc-featured-badge">⭐ Signature Product</div>
                  <h2 className="rtc-featured-title">{featuredProduct.name}</h2>
                  <p className="rtc-featured-highlight">Perfect for crispy restaurant-style dosas.</p>
                  <div className="rtc-featured-price">Rs. {featuredProduct.price.toFixed(2)}</div>
                  <button className="rtc-featured-btn" onClick={() => addToCart(featuredProduct, 1)}>
                    Add To Cart
                  </button>
                </div>
              </div>
            )}

            {/* Trending Today - Shows only on "All Items" */}
            {activeCategory === 'All Items' && trendingProducts.length > 0 && (
              <div style={{ marginBottom: '60px' }}>
                <h3 className="rtc-section-title"><Flame color="#E91E63" /> Trending Today</h3>
                <div className="rtc-grid">
                  {trendingProducts.map(p => <RTCProductCard key={p.id} product={p} />)}
                </div>
              </div>
            )}

            {/* Main Products Grid */}
            <div style={{ marginBottom: '40px' }}>
              <h3 className="rtc-section-title">
                {activeCategory === 'All' ? 'All Items' : activeCategory}
              </h3>
              
              {filteredProducts.length > 0 ? (
                <div className="rtc-grid">
                  {filteredProducts.map(product => (
                    <RTCProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '60px', color: '#666', background: 'white', borderRadius: '20px', border: '1px dashed #EAE6DB' }}>
                  No items found for this category.
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ReadyToCook;
