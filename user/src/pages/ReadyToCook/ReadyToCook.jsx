import React, { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { resolveImagePath } from '../../components/FoodCard';
import { Clock, ShieldCheck, Leaf, Flame, Sparkles } from 'lucide-react';
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
          <span className="rtc-card-price">₹{product.price.toFixed(2)}</span>
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
  const [activeCategory, setActiveCategory] = useState('All');

  const CATEGORIES = ['All', 'Ready To Cook', 'Batter', 'Breakfast', 'Snacks', 'Popular', 'Veg', 'Non-Veg'];

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
    if (activeCategory === 'All') return products;
    if (activeCategory === 'Batter') return products.filter(p => ['traditional', 'millet', 'health', 'batter_products', 'family_packs', 'premium'].includes(p.category) || p.name.toLowerCase().includes('batter') || p.name.toLowerCase().includes('dosa'));
    if (activeCategory === 'Ready To Cook') return products.filter(p => p.category === 'ready_to_cook' || p.category === 'ready-to-cook');
    if (activeCategory === 'Breakfast') return products.filter(p => p.name.toLowerCase().includes('batter') || p.name.toLowerCase().includes('idli'));
    if (activeCategory === 'Snacks') return products.filter(p => p.name.toLowerCase().includes('tikka') || p.name.toLowerCase().includes('snack'));
    if (activeCategory === 'Popular') return products.filter(p => p.id === 'bat-1' || p.id === 'rtc-2' || p.name.includes('Premium') || p.name.includes('Sambar'));
    if (activeCategory === 'Veg') return products.filter(p => p.diet_type === 'Veg' || !p.diet_type);
    if (activeCategory === 'Non-Veg') return products.filter(p => p.diet_type === 'Non-Veg');
    return products;
  };

  const filteredProducts = getFilteredProducts();

  // Identify featured & trending
  const featuredProduct = products.find(p => p.name.toLowerCase().includes('premium')) || products[0];
  const trendingProducts = products.filter(p => p.id !== featuredProduct?.id).slice(0, 3);

  return (
    <div className="rtc-page-container">
      <SEO title="Ready-to-Cook & Batters" description="Fresh, preservative-free batters and curry kits." />
      
      <div className="container" style={{ maxWidth: '1400px' }}>
        
        <div className="rtc-header">
          <h1 className="rtc-title">Artisan Batters & Meal Kits</h1>
        </div>

        {/* Category Filter Chips */}
        <div className="rtc-filters">
          {CATEGORIES.map(cat => (
            <button 
              key={cat}
              className={`rtc-filter-chip ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '100px', color: '#8B1A10' }}>
            <Sparkles className="fa-spin" size={32} />
          </div>
        ) : (
          <>
            {/* Featured Product Section - Shows only on "All" or "Popular" */}
            {(activeCategory === 'All' || activeCategory === 'Popular') && featuredProduct && (
              <div className="rtc-featured-section">
                <div className="rtc-featured-img-wrapper">
                  <img src={resolveImagePath(featuredProduct.image)} alt={featuredProduct.name} className="rtc-featured-img" />
                </div>
                <div className="rtc-featured-content">
                  <div className="rtc-featured-badge">⭐ Signature Product</div>
                  <h2 className="rtc-featured-title">{featuredProduct.name}</h2>
                  <p className="rtc-featured-highlight">Perfect for crispy restaurant-style dosas.</p>
                  <div className="rtc-featured-price">₹{featuredProduct.price.toFixed(2)}</div>
                  <button className="rtc-featured-btn" onClick={() => addToCart(featuredProduct, 1)}>
                    Add To Cart
                  </button>
                </div>
              </div>
            )}

            {/* Trending Today - Shows only on "All" */}
            {activeCategory === 'All' && trendingProducts.length > 0 && (
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
