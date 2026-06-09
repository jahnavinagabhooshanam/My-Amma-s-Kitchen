import React, { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { resolveImagePath } from '../../components/FoodCard';
import { X, Sparkles, Star, Flame, Search, Filter, Heart, Clock, ShoppingCart, Home, Leaf, ShieldCheck, Bike, LayoutGrid } from 'lucide-react';
import apiClient from '../../services/api';
import SEO from '../../components/SEO';
import './ReadyToEat.css';

const CATEGORY_ICONS = {
  'All Items': <LayoutGrid size={16} />,
  'Curries': '🍲',
  'Combos': '🎁',
  'Bestsellers': '⭐'
};

const CATEGORIES = ['All Items', 'Breakfast', 'Lunch', 'Snacks', 'Curries', 'Combos', 'Bestsellers'];

const PremiumRTECard = React.memo(({ product, onQuickView }) => {
  const { addToCart } = useCart();
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('amma_wishlist') || '[]');
    if (saved.some(item => item.id === product.id)) {
      setIsWishlisted(true);
    }
  }, [product.id]);
  
  // Dynamic Badges (Simulation based on ID/Name)
  const isBestSeller = product.id === 'rte-1' || product.name.toLowerCase().includes('biryani') || product.name.toLowerCase().includes('mushroom') || product.name.toLowerCase().includes('chicken');
  const isTrending = product.id === 'rte-2' || product.name.toLowerCase().includes('dosa') || product.name.toLowerCase().includes('sambar');
  const isChefRec = product.id === 'rte-3' || product.name.toLowerCase().includes('kurma') || product.name.toLowerCase().includes('gobi');
  const isFresh = product.id === 'rte-4' || product.name.toLowerCase().includes('paniyaram') || product.name.toLowerCase().includes('vada');

  // Diet Icon
  const isNonVegItem = product.type === 'Non-Veg' || product.diet_type === 'Non-Veg' || (['chicken', 'mutton', 'fish', 'egg', 'prawn', 'crab', 'beef', 'pork', 'meat', 'biriyani', 'prawns'].some(keyword => product.name.toLowerCase().includes(keyword)) && !product.name.toLowerCase().includes('veg bir'));
  const isVeg = !isNonVegItem;

  const isOutOfStock = product.stock === 0 || product.stock_count === 0 || product.is_available === false || product.in_stock === false;

  return (
    <div className={`rte-card ${isOutOfStock ? 'out-of-stock-card' : ''}`} style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', ...(isOutOfStock ? { opacity: 0.6, filter: 'grayscale(0.5)' } : {}) }}>
      <div style={{ position: 'relative', width: '100%', height: '180px', cursor: 'pointer' }} onClick={() => !isOutOfStock && onQuickView(product)}>
        <img src={resolveImagePath(product.image)} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        
        <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
           {isTrending && <div style={{ background: '#E74C3C', color: 'white', fontSize: '11px', fontWeight: 700, padding: '5px 10px', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: 4 }}><Flame size={12} fill="white" /> Trending</div>}
           {isBestSeller && <div style={{ background: '#F39C12', color: 'white', fontSize: '11px', fontWeight: 700, padding: '5px 10px', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: 4 }}><Star size={12} fill="white" /> Most Ordered</div>}
           {isChefRec && <div style={{ background: '#27AE60', color: 'white', fontSize: '11px', fontWeight: 700, padding: '5px 10px', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: 4 }}><Sparkles size={12} /> Healthy Choice</div>}
           {isFresh && <div style={{ background: '#8BC34A', color: 'white', fontSize: '11px', fontWeight: 700, padding: '5px 10px', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: 4 }}><Sparkles size={12} /> Freshly Made</div>}
        </div>

        <div 
          onClick={(e) => { 
            e.stopPropagation(); 
            e.preventDefault();
            const newState = !isWishlisted;
            setIsWishlisted(newState); 
            
            let saved = JSON.parse(localStorage.getItem('amma_wishlist') || '[]');
            if (newState) {
              if (!saved.find(i => i.id === product.id)) {
                saved.push(product);
                localStorage.setItem('amma_wishlist', JSON.stringify(saved));
              }
            } else {
              saved = saved.filter(i => i.id !== product.id);
              localStorage.setItem('amma_wishlist', JSON.stringify(saved));
            }
          }} 
          style={{ position: 'absolute', top: 12, right: 12, width: 30, height: 30, background: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', cursor: 'pointer', zIndex: 10 }}
        >
          <Heart size={16} color={isWishlisted ? "#e74c3c" : "#666"} fill={isWishlisted ? "#e74c3c" : "transparent"} />
        </div>
      </div>
      
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
           <div style={{ width: 14, height: 14, border: `1px solid ${isVeg ? '#27AE60' : '#E74C3C'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 2 }}>
             <div style={{ width: 8, height: 8, background: isVeg ? '#27AE60' : '#E74C3C', borderRadius: '50%' }}></div>
           </div>
           <span style={{ fontSize: '12px', fontWeight: 700, color: isVeg ? '#27AE60' : '#E74C3C' }}>{isVeg ? 'Veg' : 'Non-Veg'}</span>
        </div>

        <h3 style={{ fontSize: '17px', fontWeight: 800, marginBottom: 8, color: '#2C1A0E' }}>{product.name}</h3>
        <p style={{ fontSize: '13px', color: '#666', lineHeight: 1.5, marginBottom: 15, flex: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {product.description || "Authentic and delicious."}
        </p>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 15, fontSize: '12px', color: '#666', marginBottom: 18 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 700, color: '#F39C12' }}><Star size={14} fill="#F39C12" /> 4.8 <span style={{color: '#999', fontWeight: 400}}>(128)</span></span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={14} /> 20-30 mins</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
          <span style={{ fontSize: '18px', fontWeight: 800, color: '#2C1A0E' }}>Rs. {product.price}</span>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {isOutOfStock ? (
              <button disabled style={{ background: '#ccc', color: '#666', border: 'none', padding: '8px 20px', borderRadius: '20px', fontSize: '14px', fontWeight: 700, cursor: 'not-allowed' }}>Out of Stock</button>
            ) : (
              <>
                <button onClick={(e) => { e.stopPropagation(); e.preventDefault(); addToCart(product, 1); }} style={{ background: '#1A5D1A', color: 'white', border: 'none', padding: '8px 24px', borderRadius: '24px', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}>+ Add</button>
                <button onClick={(e) => { e.stopPropagation(); e.preventDefault(); addToCart(product, 1); }} style={{ width: 36, height: 36, borderRadius: '50%', border: '1px solid #EAEAEA', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <ShoppingCart size={16} color="#1A5D1A" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

const QuickViewModal = ({ product, onClose }) => {
  const { addToCart } = useCart();
  if (!product) return null;

  return (
    <div className="rte-modal-backdrop" onClick={onClose}>
      <div className="rte-modal-content" onClick={e => e.stopPropagation()}>
        <button className="rte-modal-close" onClick={onClose}><X size={20} /></button>
        <img src={resolveImagePath(product.image)} alt={product.name} className="rte-modal-img" style={{borderTopLeftRadius: 16, borderTopRightRadius: 16}} />
        <div className="rte-modal-details">
          <div style={{ color: '#8B1A10', fontWeight: '700', letterSpacing: '2px', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '10px' }}>
            {product.category || 'Ready To Eat'}
          </div>
          <h2 className="rte-modal-title" style={{fontSize: '24px', fontWeight: 800}}>{product.name}</h2>
          <p className="rte-modal-desc">{product.description || "Authentic South Indian flavor prepared fresh."}</p>
          
          <div style={{ display: 'flex', gap: '15px', marginBottom: '30px', flexWrap: 'wrap' }}>
             <span style={{ padding: '6px 12px', background: '#F5F3ED', borderRadius: '20px', fontSize: '0.85rem' }}>Freshly Prepared</span>
             <span style={{ padding: '6px 12px', background: '#F5F3ED', borderRadius: '20px', fontSize: '0.85rem' }}>Authentic Recipe</span>
             <span style={{ padding: '6px 12px', background: '#F5F3ED', borderRadius: '20px', fontSize: '0.85rem' }}>Premium Ingredients</span>
          </div>

          <div className="rte-modal-price" style={{fontSize: '22px', fontWeight: 800}}>Rs. {product.price}</div>
          <button className="rte-modal-btn" onClick={() => { addToCart(product, 1); onClose(); }} style={{background: '#1A5D1A'}}>
            Add To Order
          </button>
        </div>
      </div>
    </div>
  );
};

const ReadyToEat = () => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All Items');
  const [dietFilter, setDietFilter] = useState('All');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get('/products/', { params: { limit: 200 } });
        if (res.data && res.data.length > 0) {
          // Filter to only ready_to_eat from all products since backend returns everything if limit is set
          let rteProducts = res.data.filter(p => p.category === 'ready_to_eat' || p.category === 'ready-to-eat' || p.category === 'Ready To Eat');
          if (rteProducts.length === 0) {
             // Fallback if backend doesn't filter perfectly
             rteProducts = res.data.filter(p => !p.category || p.category.toLowerCase().includes('eat') || p.name.toLowerCase().includes('dosa') || p.name.toLowerCase().includes('chicken') || p.name.toLowerCase().includes('kurma'));
          }
          
          const mapped = rteProducts.map(p => {
             // assign a dynamic category to simulate backend data mapping to these filters
             let c = 'Bestsellers';
             if(p.name.toLowerCase().includes('dosa') || p.name.toLowerCase().includes('idli') || p.name.toLowerCase().includes('vada')) c = 'Breakfast';
             else if(p.name.toLowerCase().includes('biryani') || p.name.toLowerCase().includes('rice') || p.name.toLowerCase().includes('meal')) c = 'Lunch';
             else if(p.name.toLowerCase().includes('samosa') || p.name.toLowerCase().includes('baji') || p.name.toLowerCase().includes('paniyaram')) c = 'Snacks';
             else if(p.name.toLowerCase().includes('kurma') || p.name.toLowerCase().includes('sambar') || p.name.toLowerCase().includes('chicken')) c = 'Curries';
             
             return {
              ...p,
              type: p.diet_type || 'Veg',
              uiCategory: c
             }
          });
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
    if (category !== 'All Items') {
      matchesCat = p.uiCategory === category;
    }

    let matchesDiet = true;
    const isNonVegItem = p.type === 'Non-Veg' || p.diet_type === 'Non-Veg' || (['chicken', 'mutton', 'fish', 'egg', 'prawn', 'crab', 'beef', 'pork', 'meat', 'biriyani', 'prawns'].some(keyword => p.name.toLowerCase().includes(keyword)) && !p.name.toLowerCase().includes('veg bir'));
    
    if (dietFilter === 'Veg') {
      matchesDiet = !isNonVegItem;
    } else if (dietFilter === 'Non-Veg') {
      matchesDiet = isNonVegItem;
    }

    return matchesSearch && matchesCat && matchesDiet;
  });

  return (
    <div className="rte-page" style={{ background: '#FAF9F5', minHeight: '100vh', paddingBottom: '60px' }}>
      <SEO title="Ready To Eat | Ammulu's Kitchen" description="Delicious homemade meals, ready when you are." />
      
      <div className="container" style={{ maxWidth: '1400px', paddingTop: '40px', paddingLeft: '40px', paddingRight: '40px' }}>
        
        {/* Header Section */}
        <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '30px' }}>
          <div className="search-filter-row" style={{ display: 'flex', gap: 15, alignItems: 'center' }}>
            <div className="search-input-col" style={{ flex: 1, position: 'relative', maxWidth: '600px' }}>
              <Search size={20} color="#999" className="search-icon" style={{ position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="text" 
                className="search-input-field"
                placeholder="Search for idli, dosa, sambar..." 
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
                <option value="Veg">Vegetarian 🥗</option>
                <option value="Non-Veg">Non-Veg 🍗</option>
              </select>
              <div className="filter-arrow" style={{ position: 'absolute', right: 20, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', fontSize: '0.8rem', color: '#666' }}>▼</div>
            </div>
          </div>
        </div>
        
        {/* Category Filters */}
        <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 15, marginBottom: 30, scrollbarWidth: 'none' }}>
          {CATEGORIES.map(cat => (
            <button 
              key={cat}
              onClick={() => setCategory(cat)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                borderRadius: '30px',
                border: category === cat ? 'none' : '1px solid #EAEAEA',
                background: category === cat ? '#1A5D1A' : 'white',
                color: category === cat ? 'white' : '#2C1A0E',
                fontWeight: 600,
                fontSize: '14px',
                whiteSpace: 'nowrap',
                transition: '0.2s ease',
                cursor: 'pointer',
                boxShadow: category === cat ? '0 4px 10px rgba(26, 93, 26, 0.2)' : '0 2px 5px rgba(0,0,0,0.02)'
              }}
            >
              {cat === 'All Items' ? <LayoutGrid size={16} /> : (CATEGORY_ICONS[cat] && <span style={{fontSize: 16}}>{CATEGORY_ICONS[cat]}</span>)}
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '100px', color: '#1A5D1A' }}>
            <Sparkles className="fa-spin" size={32} />
          </div>
        ) : (
          <>
            {/* Main Menu Grid */}
            {filtered.length > 0 ? (
              <div className="rte-grid" style={{ gap: '25px' }}>
                {filtered.map(product => (
                  <PremiumRTECard key={product.id} product={product} onQuickView={setQuickViewProduct} />
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '60px', color: '#666', background: 'white', borderRadius: '20px', border: '1px dashed #EAE6DB' }}>
                No dishes matched your search.
              </div>
            )}
          </>
        )}
        
        {/* Info Banner at Bottom */}
        <div style={{ marginTop: '60px', padding: '30px 40px', background: '#F0EFE9', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
            <Home size={28} color="#1A5D1A" />
            <div>
              <div style={{ fontWeight: 800, fontSize: '15px', color: '#2C1A0E' }}>100% Homemade</div>
              <div style={{ fontSize: '13px', color: '#666' }}>Just like Amma makes</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
            <Leaf size={28} color="#1A5D1A" />
            <div>
              <div style={{ fontWeight: 800, fontSize: '15px', color: '#2C1A0E' }}>No Preservatives</div>
              <div style={{ fontSize: '13px', color: '#666' }}>Pure & natural ingredients</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
            <ShieldCheck size={28} color="#1A5D1A" />
            <div>
              <div style={{ fontWeight: 800, fontSize: '15px', color: '#2C1A0E' }}>Hygienically Prepared</div>
              <div style={{ fontSize: '13px', color: '#666' }}>Clean kitchen, safe food</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
            <Bike size={28} color="#1A5D1A" />
            <div>
              <div style={{ fontWeight: 800, fontSize: '15px', color: '#2C1A0E' }}>Delivered Fresh</div>
              <div style={{ fontSize: '13px', color: '#666' }}>On time, every time</div>
            </div>
          </div>
        </div>
        
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
