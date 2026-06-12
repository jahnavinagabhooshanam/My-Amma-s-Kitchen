import React, { useState, useEffect, useMemo } from 'react';
import { useCart } from '../../context/CartContext';
import { resolveImagePath } from '../../components/FoodCard';
import { Search, LayoutGrid, Plus, Minus, Star, Clock, Heart } from 'lucide-react';
import apiClient from '../../services/api';
import wishlistService from '../../services/wishlistService';
import SEO from '../../components/SEO';
import DishDetailsModal from '../Menu/DishDetailsModal';
import OptimizedImage from '../../components/OptimizedImage';
import { ProductGridSkeleton } from '../../components/ProductSkeleton';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import '../Menu/Menu.css';

const CATEGORIES = ['All Items', 'Gravies', 'Dry Mixes'];

const RTCMenuCard = React.memo(({ product, onQuickView }) => {
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
          <span className="badge" style={{ background: '#E67E22', color: 'white' }}>Cook Time: 10 mins</span>
          <span className="badge" style={{ background: '#34495E', color: 'white' }}>Shelf: 3 Days</span>
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
          {product.description || 'Pre-measured, portioned meal kits ready to be cooked at home.'}
        </p>

        <div className="meta-row">
          <div className="rating">
            <Star size={14} fill="#F5B941" color="#F5B941" /> 
            <span>{rating} <span style={{ color: '#999', fontWeight: 400, marginLeft: 4 }}>(45)</span></span>
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

const ReadyToCook = () => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All Items');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get('/products/', { params: { limit: 200 } });
        if (res.data && res.data.length > 0) {
          let rtcProducts = res.data.filter(p => p.category === 'ready_to_cook' || p.category === 'ready-to-cook' || p.category === 'Ready To Cook');
          if (rtcProducts.length === 0) {
             rtcProducts = res.data.filter(p => p.name.toLowerCase().includes('kit') || p.name.toLowerCase().includes('mix'));
          }
          
          const mapped = rtcProducts.map(p => {
             let c = 'Gravies';
             if(p.name.toLowerCase().includes('mix') || p.name.toLowerCase().includes('powder')) c = 'Dry Mixes';
             if(p.name.toLowerCase().includes('mix') || p.name.toLowerCase().includes('powder')) c = 'Dry Mixes';
             
             return { ...p, uiCategory: c }
          });
          setProducts(mapped);
        }
      } catch (err) {
        console.error("Failed to fetch ready to cook products:", err);
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
      return matchesSearch && matchesCat;
    });
  }, [products, search, category]);

  return (
    <div className="app-menu-container pb-20" style={{ background: '#FAF9F5', minHeight: '100vh' }}>
      <SEO title="Ready To Cook | Ammulu's Kitchen" />
      
      {/* Search Bar */}
      <div className="app-menu-search d-none d-lg-block">
        <div className="search-bar-app">
          <Search size={18} color="var(--text-muted)" />
          <input 
            type="text" 
            placeholder="Search for meal kits, gravies..." 
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
        <div className="mb-15">
          <h1 className="section-title mb-0">Ready To Cook</h1>
          <p className="text-muted" style={{ fontSize: '0.9rem' }}>Smart meal kits. Zero prep, authentic taste.</p>
        </div>

        {loading ? (
          <ProductGridSkeleton count={8} />
        ) : filtered.length > 0 ? (
          <div className="modern-menu-grid">
            {filtered.map(product => (
              <RTCMenuCard key={product.id} product={product} onQuickView={setQuickViewProduct} />
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

export default ReadyToCook;
