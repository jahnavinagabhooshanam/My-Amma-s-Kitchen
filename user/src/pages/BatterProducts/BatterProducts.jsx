import React, { useState, useEffect, useMemo } from 'react';
import { useCart } from '../../context/CartContext';
import { resolveImagePath } from '../../components/FoodCard';
import { Search, LayoutGrid, Plus, Minus, Star, Award, RefreshCw, Zap, Heart } from 'lucide-react';
import apiClient from '../../services/api';
import wishlistService from '../../services/wishlistService';
import SEO from '../../components/SEO';
import DishDetailsModal from '../Menu/DishDetailsModal';
import OptimizedImage from '../../components/OptimizedImage';
import { ProductGridSkeleton } from '../../components/ProductSkeleton';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import '../Menu/Menu.css';

const BatterMenuCard = React.memo(({ product, onQuickView }) => {
  const { cartItems, addToCart, updateQuantity } = useCart();
  const [selectedSize, setSelectedSize] = useState("1kg");
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

  
  // Need to figure out cart quantity for this specific product ID
  const cartItem = cartItems.find(c => c.id === product.id);
  const qty = cartItem ? cartItem.quantity : 0;
  
  const isOutOfStock = product.stock === 0 || product.stock_count === 0 || product.is_available === false || product.in_stock === false;
  const rating = product.rating || (Math.random() * 0.8 + 4.2).toFixed(1);

  // Calculate dynamic price
  let priceFactor = 1.0;
  if (selectedSize === "500g") priceFactor = 0.65;
  else if (selectedSize === "2kg") priceFactor = 1.85;
  const finalPrice = Math.round(product.price * priceFactor);

  const handleAddBatter = (e) => {
    e.stopPropagation();
    e.preventDefault();
    addToCart({
      id: product.id, 
      name: `${product.name} (${selectedSize})`,
      price: finalPrice,
      image: product.image,
      unit: selectedSize
    }, 1);
  };

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
          <span className="badge" style={{ background: '#27AE60', color: 'white' }}>Probiotic</span>
          <span className="badge" style={{ background: '#8E44AD', color: 'white' }}>Stone Ground</span>
        </div>
      </div>

      <div className="card-info-section">
        <div className="title-row">
          <div className="diet-indicator veg">
            <div className="dot"></div>
          </div>
          <Link to={`/product/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }} onClick={(e) => e.stopPropagation()}>
            <h4 className="item-name">{product.name}</h4>
          </Link>
        </div>
        
        <p className="item-desc">
          {product.description || 'Naturally fermented, 0% soda, 0% preservatives.'}
        </p>

        {/* Size Selection */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '16px' }} onClick={e => e.stopPropagation()}>
          {["500g", "1kg", "2kg"].map((size) => (
            <button 
              key={size}
              onClick={() => setSelectedSize(size)}
              style={{
                flex: 1,
                fontSize: '0.75rem',
                fontWeight: '700',
                padding: '6px 0',
                borderRadius: '6px',
                border: '1px solid var(--primary-color)',
                backgroundColor: selectedSize === size ? 'var(--primary-color)' : '#FFFFFF',
                color: selectedSize === size ? 'white' : 'var(--primary-color)',
                cursor: 'pointer',
                transition: '0.2s ease'
              }}
            >
              {size}
            </button>
          ))}
        </div>

        <div className="meta-row" style={{ marginBottom: 0 }}>
          <div className="rating">
            <Star size={14} fill="#F5B941" color="#F5B941" /> 
            <span>{rating} <span style={{ color: '#999', fontWeight: 400, marginLeft: 4 }}>(89)</span></span>
          </div>
        </div>

        <div className="card-bottom-row" onClick={e => e.stopPropagation()}>
          <div className="price">₹{finalPrice}</div>
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
              <button className="btn-add" onClick={handleAddBatter}>+ Add</button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
});

const COMPARISON_COLUMNS = [
  { name: "Attributes", key: "attr" },
  { name: "Classic Batter", key: "classic" },
  { name: "Ragi Batter", key: "ragi" },
  { name: "Sprouted Multigrain", key: "sprouted" }
];

const COMPARISON_ROWS = [
  { attr: "Fermentation Time", classic: "8 Hours", ragi: "10 Hours", sprouted: "6 Hours" },
  { attr: "Ingredients", classic: "Parboiled Rice, Urad Dal", ragi: "Finger Millet, Rice, Urad", sprouted: "Green Gram, Brown Rice, Horse Gram" },
  { attr: "Key Nutrients", classic: "Carbs, Probiotics", ragi: "Calcium, Iron, High Fiber", sprouted: "Plant Protein, Vitamins" },
  { attr: "Preservatives", classic: "0% (Zero Added)", ragi: "0% (Zero Added)", sprouted: "0% (Zero Added)" }
];

const BatterProducts = () => {
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get('/products/', { params: { limit: 200 } });
        if (res.data && res.data.length > 0) {
          let batProducts = res.data.filter(p => p.category === 'batter_products' || p.category === 'batter-products' || p.category === 'Batter Products');
          if (batProducts.length === 0) {
             batProducts = res.data.filter(p => p.name.toLowerCase().includes('batter') || p.name.toLowerCase().includes('maavu'));
          }
          setProducts(batProducts);
        }
      } catch (err) {
        console.error("Failed to fetch batter products:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const filtered = useMemo(() => {
    return products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
  }, [products, search]);

  return (
    <div className="app-menu-container pb-20" style={{ background: '#FAF9F5', minHeight: '100vh' }}>
      <SEO title="Fresh Probiotic Batters | Ammulu's Kitchen" />
      
      {/* Banner Section */}
      <div style={{ background: '#1A5D1A', padding: '40px 20px', textAlign: 'center', color: 'white', marginBottom: '30px' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', opacity: 0.8 }}>100% Probiotic & Organic</span>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: '10px 0', fontFamily: 'var(--font-serif)' }}>Artisan Stone-Ground Batters</h1>
        <p style={{ maxWidth: '600px', margin: '0 auto', opacity: 0.9, fontSize: '0.95rem' }}>
          Zero baking soda, zero chemical stabilizers, and zero preservatives. Just like Amma grinds at home.
        </p>
      </div>

      <div className="container">
        {/* Badges */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '40px' }}>
          <div style={{ background: 'white', padding: '20px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '15px', border: '1px solid #EAEAEA' }}>
            <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'rgba(46,139,87,0.1)', color: '#2E8B57', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Award size={24} />
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800 }}>Naturally Fermented</h4>
              <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#666' }}>8-10 Hours active process</p>
            </div>
          </div>
          <div style={{ background: 'white', padding: '20px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '15px', border: '1px solid #EAEAEA' }}>
            <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'rgba(230,126,34,0.1)', color: '#E67E22', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <RefreshCw size={24} />
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800 }}>Ground Fresh Daily</h4>
              <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#666' }}>Milled every morning</p>
            </div>
          </div>
          <div style={{ background: 'white', padding: '20px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '15px', border: '1px solid #EAEAEA' }}>
            <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'rgba(241,196,15,0.1)', color: '#F1C40F', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={24} />
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800 }}>Chemical Free</h4>
              <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#666' }}>Zero soda or preservatives</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="search-bar-app" style={{ marginBottom: '30px' }}>
          <Search size={18} color="var(--text-muted)" />
          <input 
            type="text" 
            placeholder="Search batters..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Products */}
        {loading ? (
          <ProductGridSkeleton count={8} />
        ) : filtered.length > 0 ? (
          <div className="modern-menu-grid" style={{ marginBottom: '60px' }}>
            {filtered.map(product => (
              <BatterMenuCard key={product.id} product={product} onQuickView={setQuickViewProduct} />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '50px 0', color: '#666' }}>
            No batters found.
          </div>
        )}

        {/* Matrix */}
        <div style={{ marginBottom: '40px' }}>
          <h2 className="section-title text-center mb-15">Which Batter Suits You?</h2>
          <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #EAEAEA', overflowX: 'auto', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
              <thead>
                <tr style={{ background: '#F9F9F9' }}>
                  {COMPARISON_COLUMNS.map(col => (
                    <th key={col.key} style={{ padding: '16px', textAlign: 'left', fontWeight: 800, color: '#1E1E1E', borderBottom: '2px solid #EAEAEA' }}>
                      {col.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #EAEAEA' }}>
                    <td style={{ padding: '16px', fontWeight: 700 }}>{row.attr}</td>
                    <td style={{ padding: '16px', color: '#666' }}>{row.classic}</td>
                    <td style={{ padding: '16px', color: '#666' }}>{row.ragi}</td>
                    <td style={{ padding: '16px', color: '#666' }}>{row.sprouted}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      <DishDetailsModal
        dish={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        resolveImagePath={resolveImagePath}
      />
    </div>
  );
};

export default BatterProducts;
