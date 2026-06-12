import React, { useState, useEffect, useMemo } from 'react';
import { useCart } from '../../context/CartContext';
import { resolveImagePath } from '../../components/FoodCard';
import { Search, LayoutGrid, Plus, Minus, Star, Heart } from 'lucide-react';
import apiClient from '../../services/api';
import wishlistService from '../../services/wishlistService';
import SEO from '../../components/SEO';
import DishDetailsModal from '../Menu/DishDetailsModal';
import OptimizedImage from '../../components/OptimizedImage';
import { ProductGridSkeleton } from '../../components/ProductSkeleton';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import '../Menu/Menu.css';
import './ReadyToEat.css';

const CATEGORIES = ['All Items', 'Tiffins', 'Combos', 'Meals'];

const PremiumRTECard = React.memo(({ product, onQuickView }) => {
  const { cartItems, addToCart, updateQuantity } = useCart();
  const [wishlisted, setWishlisted] = useState(false);

  const handleWishlist = async (e) => {
    e.stopPropagation();
    try {
      await wishlistService.add({ product_id: product.id });
      setWishlisted(true);
    } catch (err) {
      console.error(err);
    }
  };

  
  const cartItem = cartItems.find(c => c.id === product.id);
  const qty = cartItem ? cartItem.quantity : 0;
  
  const isNonVeg = product.type === 'Non-Veg' || product.diet_type === 'Non-Veg' || (['chicken', 'mutton', 'fish', 'egg', 'prawn', 'crab', 'beef', 'pork', 'meat', 'biriyani', 'prawns'].some(keyword => product.name.toLowerCase().includes(keyword)) && !product.name.toLowerCase().includes('veg bir'));
  const isVeg = !isNonVeg;

  const isOutOfStock = product.stock === 0 || product.stock_count === 0 || product.is_available === false || product.in_stock === false;
  const rating = product.rating || (Math.random() * 0.8 + 4.2).toFixed(1);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className={`modern-menu-card ${isOutOfStock ? 'out-of-stock-card' : ''}`}
      style={isOutOfStock ? { opacity: 0.6, filter: 'grayscale(0.5)' } : {}}
    >
      <div className="card-image-section" style={{ position: 'relative' }}>
        <Link to={`/product/${product.id}`} style={{ display: 'block', width: '100%', height: '100%' }} onClick={(e) => e.stopPropagation()}>
          <OptimizedImage src={product.image} alt={product.name} className="menu-item-img" />
        </Link>
        <button 
          onClick={handleWishlist}
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
          <Heart size={18} fill={wishlisted ? '#DC143C' : 'none'} color={wishlisted ? '#DC143C' : '#666'} />
        </button>
        
        {/* Badges */}
        <div className="badge-container">
          {product.is_bestseller && <span className="badge bestseller">Best Seller</span>}
          <span className="badge fresh" style={{ background: '#34495E' }}>Prep Time: 0 mins</span>
        </div>
      </div>

      <div className="card-info-section">
        <div className="title-row">
          <div className={`diet-indicator ${isVeg ? 'veg' : 'non-veg'}`}>
            <div className="dot"></div>
          </div>
          <Link to={`/product/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }} onClick={(e) => e.stopPropagation()}>
            <h4 className="item-name">{product.name}</h4>
          </Link>
        </div>
        
        <p className="item-desc">
          {product.description || 'Authentic south indian delicacy prepared with premium ingredients.'}
        </p>

        <div className="meta-row">
          <div className="rating">
            <Star size={14} fill="#F5B941" color="#F5B941" /> 
            <span>{rating} <span style={{ color: '#999', fontWeight: 400, marginLeft: 4 }}>(128)</span></span>
          </div>
        </div>

        <div className="card-bottom-row" onClick={e => e.stopPropagation()}>
          <div className="price">₹{product.price}</div>
          <div className="action-container">
            {isOutOfStock ? (
              <div className="btn-sold-out">SOLD OUT</div>
            ) : qty > 0 ? (
              <div className="qty-controls">
                <button className="qty-btn" onClick={() => updateQuantity(product.id, qty - 1)}><Minus size={16}/></button>
                <span className="qty-val">{qty}</span>
                <button className="qty-btn" onClick={() => updateQuantity(product.id, qty + 1)}><Plus size={16}/></button>
              </div>
            ) : (
              <button className="btn-add" onClick={() => addToCart(product, 1)}>+ Add</button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
});

const ReadyToEat = () => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All Items');
  const [dietFilter, setDietFilter] = useState('All');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quickViewProduct, setQuickViewProduct] = useState(null); // Keep modal if needed, but not required to rewrite

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get('/products/', { params: { limit: 200 } });
        if (res.data && res.data.length > 0) {
          let rteProducts = res.data.filter(p => p.category === 'ready_to_eat' || p.category === 'ready-to-eat' || p.category === 'Ready To Eat');
          if (rteProducts.length === 0) {
             rteProducts = res.data.filter(p => !p.category || p.category.toLowerCase().includes('eat') || p.name.toLowerCase().includes('dosa') || p.name.toLowerCase().includes('chicken') || p.name.toLowerCase().includes('kurma'));
          }
          
          const mapped = rteProducts.map(p => {
             let c = 'Tiffins';
             if(p.name.toLowerCase().includes('biryani') || p.name.toLowerCase().includes('meal') || p.name.toLowerCase().includes('rice')) c = 'Meals';
             else if(p.name.toLowerCase().includes('combo')) c = 'Combos';
             
             return { ...p, uiCategory: c }
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

  const filtered = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
      const matchesCat = category === 'All Items' || p.uiCategory === category;
      
      const isNonVeg = p.type === 'Non-Veg' || p.diet_type === 'Non-Veg' || (['chicken', 'mutton', 'fish', 'egg', 'prawn', 'crab', 'beef', 'pork', 'meat', 'biriyani', 'prawns'].some(keyword => p.name.toLowerCase().includes(keyword)) && !p.name.toLowerCase().includes('veg bir'));
      const isVeg = !isNonVeg;
      
      const matchesDiet = dietFilter === 'All' ? true : (dietFilter === 'Veg' ? isVeg : isNonVeg);

      return matchesSearch && matchesCat && matchesDiet;
    });
  }, [products, search, category, dietFilter]);

  return (
    <div className="app-menu-container pb-20" style={{ background: '#FAF9F5', minHeight: '100vh' }}>
      <SEO title="Ready To Eat | Ammulu's Kitchen" />
      
      {/* Search Bar */}
      <div className="app-menu-search d-none d-lg-block">
        <div className="search-bar-app">
          <Search size={18} color="var(--text-muted)" />
          <input 
            type="text" 
            placeholder="Search for tiffins, meals..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Horizontal Filter Chips */}
      <div className="app-menu-filters">
        <div className="filter-scroll">
          {CATEGORIES.map(cat => (
            <button 
              key={cat}
              onClick={() => setCategory(cat)}
              className={`filter-chip ${category === cat ? 'active' : ''}`}
            >
              {cat === 'All Items' && <LayoutGrid size={14} />}
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="container" style={{ padding: '20px' }}>
        <div className="mb-15" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 className="section-title mb-0">Ready To Eat</h1>
          </div>
          <div style={{ display: 'flex', gap: '8px', background: 'white', padding: '4px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <button onClick={() => setDietFilter('All')} style={{ border: 'none', background: dietFilter === 'All' ? 'var(--primary-color)' : 'transparent', color: dietFilter === 'All' ? 'white' : '#666', padding: '6px 12px', borderRadius: '8px', fontSize: '13px', fontWeight: 600 }}>All</button>
            <button onClick={() => setDietFilter('Veg')} style={{ border: 'none', background: dietFilter === 'Veg' ? '#2E8B57' : 'transparent', color: dietFilter === 'Veg' ? 'white' : '#666', padding: '6px 12px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}><div className="diet-indicator veg" style={{ position: 'relative', width: 12, height: 12, margin: 0, padding: 0 }}><div className="dot" style={{ width: 6, height: 6 }}></div></div> Veg</button>
            <button onClick={() => setDietFilter('Non-Veg')} style={{ border: 'none', background: dietFilter === 'Non-Veg' ? '#E74C3C' : 'transparent', color: dietFilter === 'Non-Veg' ? 'white' : '#666', padding: '6px 12px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}><div className="diet-indicator non-veg" style={{ position: 'relative', width: 12, height: 12, margin: 0, padding: 0 }}><div className="dot" style={{ width: 6, height: 6 }}></div></div> Non-Veg</button>
          </div>
        </div>

        {loading ? (
          <ProductGridSkeleton count={8} />
        ) : filtered.length > 0 ? (
          <div className="modern-menu-grid">
            {filtered.map(product => (
              <PremiumRTECard key={product.id} product={product} onQuickView={setQuickViewProduct} />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '50px 0', color: '#666' }}>
            No products found matching your criteria.
          </div>
        )}
      </div>

      <DishDetailsModal
        dish={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        resolveImagePath={resolveImagePath}
      />
    </div>
  );
};

export default ReadyToEat;
