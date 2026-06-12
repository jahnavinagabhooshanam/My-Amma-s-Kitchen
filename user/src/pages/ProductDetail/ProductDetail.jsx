import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, Star, Plus, Minus, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import apiClient from '../../services/api';
import { useCart } from '../../context/CartContext';
import wishlistService from '../../services/wishlistService';
import OptimizedImage from '../../components/OptimizedImage';
import SEO from '../../components/SEO';
import { ProductGridSkeleton } from '../../components/ProductSkeleton';

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

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { cartItems, addToCart, updateQuantity } = useCart();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await apiClient.get(`/products/${id}`);
        setProduct(res.data);
      } catch (err) {
        console.error("Failed to fetch product:", err);
        setError("Product not found");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleWishlist = async () => {
    try {
      if (!isWishlisted) {
        await wishlistService.add({ product_id: product.id });
      }
      setIsWishlisted(!isWishlisted);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '40px 20px', minHeight: '80vh' }}>
        <ProductGridSkeleton count={1} />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 20px', minHeight: '60vh' }}>
        <h2>Product not found</h2>
        <button onClick={() => navigate('/menu')} style={{ marginTop: '20px', padding: '10px 20px', background: 'var(--primary-color)', color: 'white', borderRadius: '8px', border: 'none' }}>
          Back to Menu
        </button>
      </div>
    );
  }

  const cartItem = cartItems.find(c => c.id === product.id);
  const qty = cartItem ? cartItem.quantity : 0;
  const isNonVeg = product.diet_type?.toLowerCase() === 'non-veg';
  const rating = product.rating || (Math.random() * 0.8 + 4.2).toFixed(1);

  return (
    <div style={{ background: '#FAF9F5', minHeight: '100vh', paddingBottom: '80px' }}>
      <SEO 
        title={`${product.name} - Ammulu's Kitchen`} 
        description={product.description || `Buy authentic ${product.name} from Ammulu's Kitchen.`}
        image={resolveImg(product.image)}
        schemaType="Product"
        schemaData={{
          name: product.name,
          description: product.description,
          image: resolveImg(product.image),
          price: product.price,
          in_stock: product.in_stock
        }}
      />
      
      {/* Header */}
      <div style={{ padding: '15px 20px', background: 'white', display: 'flex', alignItems: 'center', position: 'sticky', top: 0, zIndex: 10, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', color: 'var(--text-dark)' }}>
          <ChevronLeft size={24} /> <span style={{ marginLeft: '5px', fontWeight: '500' }}>Back</span>
        </button>
      </div>

      <div className="container" style={{ paddingTop: '20px' }}>
        <div className="row">
          {/* Image Section */}
          <div className="col-12 col-md-6 mb-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
            >
              <OptimizedImage src={product.image} alt={product.name} style={{ width: '100%', height: 'auto', aspectRatio: '4/3' }} />
              <button 
                onClick={handleWishlist}
                style={{ position: 'absolute', top: '15px', right: '15px', background: 'white', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', cursor: 'pointer' }}
              >
                <Heart fill={isWishlisted ? '#DC143C' : 'none'} color={isWishlisted ? '#DC143C' : '#666'} size={22} />
              </button>
            </motion.div>
          </div>

          {/* Info Section */}
          <div className="col-12 col-md-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <div style={{ width: '16px', height: '16px', border: `1px solid ${isNonVeg ? '#E84C3D' : '#2E8B57'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: isNonVeg ? '#E84C3D' : '#2E8B57' }} />
                </div>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '600' }}>
                  {product.category.replace(/-/g, ' ')}
                </span>
              </div>
              
              <h1 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--primary-dark)', marginBottom: '10px' }}>{product.name}</h1>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', background: '#F5B941', color: 'white', padding: '4px 8px', borderRadius: '6px', fontSize: '0.9rem', fontWeight: 'bold' }}>
                  <Star size={14} fill="white" style={{ marginRight: '4px' }} /> {rating}
                </div>
                <span style={{ color: 'var(--text-muted)' }}>128+ Ratings</span>
              </div>

              <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '20px' }}>
                ₹{product.price}
              </div>

              <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: '1.6', marginBottom: '30px' }}>
                {product.description || 'Authentic South Indian delicacy prepared with premium ingredients and traditional recipes.'}
              </p>

              <div style={{ borderTop: '1px solid #eee', paddingTop: '30px' }}>
                {product.in_stock === false ? (
                  <div style={{ background: '#f5f5f5', color: '#888', textAlign: 'center', padding: '15px', borderRadius: '12px', fontWeight: 'bold', fontSize: '1.1rem' }}>
                    CURRENTLY SOLD OUT
                  </div>
                ) : qty > 0 ? (
                  <div style={{ display: 'flex', alignItems: 'center', background: 'white', border: '1px solid var(--primary-color)', borderRadius: '12px', overflow: 'hidden', height: '50px', maxWidth: '200px' }}>
                    <button onClick={() => updateQuantity(product.id, qty - 1)} style={{ flex: 1, background: 'none', border: 'none', height: '100%', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Minus size={20} /></button>
                    <span style={{ fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--text-dark)' }}>{qty}</span>
                    <button onClick={() => updateQuantity(product.id, qty + 1)} style={{ flex: 1, background: 'none', border: 'none', height: '100%', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Plus size={20} /></button>
                  </div>
                ) : (
                  <button 
                    onClick={() => addToCart(product, 1)}
                    style={{ width: '100%', background: 'var(--primary-color)', color: 'white', border: 'none', padding: '15px', borderRadius: '12px', fontSize: '1.1rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 15px rgba(46,139,87,0.2)' }}
                  >
                    Add to Cart
                  </button>
                )}
              </div>

              <div style={{ marginTop: '30px', background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '15px', color: 'var(--text-dark)' }}>Why choose Ammulu's?</h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: 'var(--text-muted)' }}>
                  <li style={{ marginBottom: '10px', display: 'flex', alignItems: 'center' }}>✓ 100% Authentic Recipes</li>
                  <li style={{ marginBottom: '10px', display: 'flex', alignItems: 'center' }}>✓ Premium Ingredients</li>
                  <li style={{ display: 'flex', alignItems: 'center' }}>✓ Freshly Prepared</li>
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
