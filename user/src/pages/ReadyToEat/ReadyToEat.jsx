import React, { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { resolveImagePath } from '../../components/FoodCard';
import { X, Sparkles, Star, Flame } from 'lucide-react';
import apiClient from '../../services/api';
import SEO from '../../components/SEO';
import SearchBar from '../../components/SearchBar';
import './ReadyToEat.css';

const PremiumRTECard = ({ product, onQuickView }) => {
  const { addToCart } = useCart();
  
  // Dynamic Badges (Simulation based on ID/Name)
  const isBestSeller = product.id === 'rte-1' || product.name.includes('Biryani');
  const isTrending = product.id === 'rte-2' || product.name.includes('Dosa');
  const isNew = product.id === 'rte-5';
  const isChefRec = product.id === 'rte-3';

  // Diet Icon
  const isVeg = product.type === 'Veg';

  return (
    <div className="rte-card">
      <div className="rte-card-img-wrapper">
        <img src={resolveImagePath(product.image)} alt={product.name} className="rte-card-img" />
        
        <div className="rte-card-badges">
          {isBestSeller && <div className="rte-badge bestseller">⭐ Best Seller</div>}
          {isTrending && <div className="rte-badge trending">🔥 Trending</div>}
          {isNew && <div className="rte-badge new">🆕 Newly Added</div>}
          {isChefRec && <div className="rte-badge chef">👨‍🍳 Chef Recommended</div>}
        </div>

        <div className="rte-diet-icon" style={{ borderColor: isVeg ? '#008000' : '#C84B31' }}>
          <div style={{ 
            width: '12px', height: '12px', 
            border: `1px solid ${isVeg ? '#008000' : '#C84B31'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '2px'
          }}>
            {isVeg ? (
              <div style={{ width: '6px', height: '6px', backgroundColor: '#008000', borderRadius: '50%' }}></div>
            ) : (
              <div style={{ width: '0', height: '0', borderLeft: '3px solid transparent', borderRight: '3px solid transparent', borderBottom: '6px solid #C84B31' }}></div>
            )}
          </div>
        </div>

        <div className="rte-quickview-overlay">
          <button className="rte-quickview-btn" onClick={(e) => { e.stopPropagation(); onQuickView(product); }}>
            Quick View
          </button>
        </div>
      </div>
      
      <div className="rte-card-content">
        <h3 className="rte-card-title">{product.name}</h3>
        <p className="rte-card-desc">{product.description}</p>
        
        <div className="rte-card-footer">
          <span className="rte-card-price">₹{product.price.toFixed(2)}</span>
          <button className="rte-add-btn" onClick={(e) => { e.stopPropagation(); addToCart(product, 1); }}>
            Add To Cart
          </button>
        </div>
      </div>
    </div>
  );
};

const QuickViewModal = ({ product, onClose }) => {
  const { addToCart } = useCart();
  if (!product) return null;

  return (
    <div className="rte-modal-backdrop" onClick={onClose}>
      <div className="rte-modal-content" onClick={e => e.stopPropagation()}>
        <button className="rte-modal-close" onClick={onClose}><X size={20} /></button>
        <img src={resolveImagePath(product.image)} alt={product.name} className="rte-modal-img" />
        <div className="rte-modal-details">
          <div style={{ color: '#8B1A10', fontWeight: '700', letterSpacing: '2px', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '10px' }}>
            {product.category}
          </div>
          <h2 className="rte-modal-title">{product.name}</h2>
          <p className="rte-modal-desc">{product.description || "Authentic South Indian flavor prepared fresh."}</p>
          
          <div style={{ display: 'flex', gap: '15px', marginBottom: '30px', flexWrap: 'wrap' }}>
             <span style={{ padding: '6px 12px', background: '#F5F3ED', borderRadius: '20px', fontSize: '0.85rem' }}>Freshly Prepared</span>
             <span style={{ padding: '6px 12px', background: '#F5F3ED', borderRadius: '20px', fontSize: '0.85rem' }}>Authentic Recipe</span>
             <span style={{ padding: '6px 12px', background: '#F5F3ED', borderRadius: '20px', fontSize: '0.85rem' }}>Premium Ingredients</span>
          </div>

          <div className="rte-modal-price">₹{product.price.toFixed(2)}</div>
          <button className="rte-modal-btn" onClick={() => { addToCart(product, 1); onClose(); }}>
            Add To Order
          </button>
        </div>
      </div>
    </div>
  );
};

const ReadyToEat = () => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  const CATEGORIES = ['All', 'Breakfast', 'Main Course', 'Snacks', 'Beverages', 'Veg', 'Non-Veg'];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get('/products/', { params: { category: 'ready_to_eat' } });
        if (res.data && res.data.length > 0) {
          const mapped = res.data.map(p => ({
            ...p,
            type: p.name.toLowerCase().includes('chicken') || p.name.toLowerCase().includes('mutton') ? 'Non-Veg' : 'Veg',
            category: p.name.toLowerCase().includes('biryani') || p.name.toLowerCase().includes('parotta') ? 'Main Course' : 'Breakfast'
          }));
          setProducts(mapped);
        }
      } catch (err) {
        console.error("Failed to fetch ready to eat products:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const filtered = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                          (p.description && p.description.toLowerCase().includes(search.toLowerCase()));
    
    let matchesCat = true;
    if (category === 'Veg') matchesCat = p.type === 'Veg';
    else if (category === 'Non-Veg') matchesCat = p.type === 'Non-Veg';
    else if (category !== 'All') matchesCat = p.category === category;

    return matchesSearch && matchesCat;
  });

  // Dynamic sections (Derived from products)
  const todaysSpecials = products.filter(p => p.id === 'rte-1' || p.id === 'rte-6');
  const trending = products.filter(p => p.id === 'rte-2' || p.id === 'rte-7' || p.id === 'rte-4');

  return (
    <div className="rte-page">
      <SEO title="Premium Dining | Amma's Kitchen" description="Order hot, fresh South Indian premium meals." />
      
      {/* Premium Hero Section */}
      <div className="rte-hero">
        <div className="rte-hero-content" style={{ padding: '0 10px', width: '100%' }}>
          <h1 className="rte-hero-title" style={{ fontSize: '2.5rem', marginBottom: '8px' }}>Premium Dining Experience</h1>
          
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.2rem', color: '#D4AF37', marginBottom: '20px', fontStyle: 'italic', letterSpacing: '1px' }}>
            Fresh Meals &bull; Fast Delivery &bull; Homemade Taste
          </div>
          
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '25px' }}>
             <span className="rte-info-chip" style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', padding: '6px 12px' }}><Sparkles size={12}/> Fresh Daily</span>
             <span className="rte-info-chip" style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', padding: '6px 12px' }}><Star size={12}/> Quality Ingredients</span>
             <span className="rte-info-chip" style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', padding: '6px 12px' }}><Flame size={12}/> Fast Delivery</span>
          </div>

          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <SearchBar value={search} onChange={setSearch} placeholder="Search our premium menu..." />
          </div>
        </div>
      </div>

      <div className="container" style={{ maxWidth: '1400px' }}>
        
        {/* Category Filters */}
        <div className="rte-filters">
          {CATEGORIES.map(cat => (
            <button 
              key={cat}
              className={`rte-filter-chip ${category === cat ? 'active' : ''}`}
              onClick={() => setCategory(cat)}
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
            {/* Sections only visible when 'All' is selected and no search query */}
            {category === 'All' && search === '' && (
              <>
                {todaysSpecials.length > 0 && (
                  <div style={{ marginBottom: '80px' }}>
                    <h2 className="rte-section-title"><Star color="#D4AF37" fill="#D4AF37" /> Today's Specials</h2>
                    <div className="rte-grid">
                      {todaysSpecials.map(p => <PremiumRTECard key={p.id} product={p} onQuickView={setQuickViewProduct} />)}
                    </div>
                  </div>
                )}

                {trending.length > 0 && (
                  <div style={{ marginBottom: '80px' }}>
                    <h2 className="rte-section-title"><Flame color="#E91E63" fill="#E91E63" /> Trending Today</h2>
                    <div className="rte-grid">
                      {trending.map(p => <PremiumRTECard key={p.id} product={p} onQuickView={setQuickViewProduct} />)}
                    </div>
                  </div>
                )}
                
                <h2 className="rte-section-title">Explore The Menu</h2>
              </>
            )}

            {/* Main Menu Grid */}
            {filtered.length > 0 ? (
              <div className="rte-grid">
                {filtered.map(product => (
                  <PremiumRTECard key={product.id} product={product} onQuickView={setQuickViewProduct} />
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '60px', color: '#666', background: 'white', borderRadius: '20px', border: '1px dashed #EAE6DB' }}>
                No premium dishes matched your criteria.
              </div>
            )}
          </>
        )}
      </div>

      {quickViewProduct && (
        <QuickViewModal 
          product={quickViewProduct} 
          onClose={() => setQuickViewProduct(null)} 
        />
      )}
    </div>
  );
};

export default ReadyToEat;
