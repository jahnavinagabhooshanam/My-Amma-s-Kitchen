import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { motion } from 'framer-motion';
import { Star, Clock, Gift, Package, CheckCircle, TrendingUp, ChevronRight, RefreshCw } from 'lucide-react';
import apiClient from '../../services/api';
import './Dashboard.css';

const DEFAULT_HOMEPAGE_CONFIG = {
  hero_banner: {
    title: "Amma's Specials",
    subtitle: 'Upto 60% OFF on all South Indian delicacies',
    bg_image: '/assets/Food images/Veg/South Indian.webp'
  },
  trending_today: [
    { name: 'Onion Dosa', price: 110, img: '/assets/Food images/Veg/Onion Dosa.webp', rating: 4.8, time: '20-25 mins' },
    { name: 'Hyderabad Dum Biryani', price: 260, img: '/assets/Food images/Non-veg/Hyderabad Dum Biriyani.webp', rating: 4.9, time: '35-40 mins' },
    { name: 'Idli Vada', price: 110, img: '/assets/Food images/Veg/Edli Vada.webp', rating: 4.7, time: '15-20 mins' }
  ]
};

const CATEGORIES = [
  { id: 1, name: 'Breakfast', img: '/assets/Food images/Veg/Podi Edli.webp', path: '/ready-to-eat' },
  { id: 2, name: 'Lunch', img: '/assets/Food images/Veg/Veg Meals.webp', path: '/ready-to-eat' },
  { id: 3, name: 'Dinner', img: '/assets/Food images/Veg/Ghee Roast Dosa.webp', path: '/ready-to-eat' },
  { id: 4, name: 'Batters', img: '/assets/Food images/Batters/Idli Batter.webp', path: '/ready-to-cook' },
];

const CustomerHome = () => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const [config, setConfig] = useState(DEFAULT_HOMEPAGE_CONFIG);
  const [allProducts, setAllProducts] = useState([]);
  const [recommendedDishes, setRecommendedDishes] = useState([]);
  const [heroImageIndex, setHeroImageIndex] = useState(0);
  const [recentOrder, setRecentOrder] = useState(null);

  useEffect(() => {
    const fetchRecentOrder = async () => {
      try {
        const res = await apiClient.get('/orders/');
        if (res.data && res.data.length > 0) {
          setRecentOrder(res.data[0]);
        }
      } catch (err) {
        console.log(err);
      }
    };
    if (user) fetchRecentOrder();
  }, [user]);

  const heroImages = [
    '/assets/Food images/Veg/Ghee Roast Dosa.webp',
    '/assets/Food images/Non-veg/Hyderabad Dum Biriyani.webp',
    '/assets/Food images/Veg/South Indian.webp'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setHeroImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);


  const resolveImagePath = (path) => {
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

  useEffect(() => {
    const fetchHomepageConfig = async () => {
      try {
        const res = await apiClient.get('/homepage/');
        if (res.data) {
          setConfig(prev => ({ ...prev, ...res.data }));
        }
      } catch (err) {
        console.error("Failed to load homepage config", err);
      }
    };
    fetchHomepageConfig();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await apiClient.get('/products/');
        const products = res.data;
        if (products && products.length > 0) {
          setAllProducts(products);
          const shuffled = [...products].sort(() => 0.5 - Math.random());
          setRecommendedDishes(shuffled.slice(0, 4).map(p => ({ ...p, img: resolveImagePath(p.image) })));
        }
      } catch (err) {
        console.error("Failed to load dashboard products", err);
      }
    };
    fetchProducts();
  }, []);

  const attachProductDetails = (item) => {
    if (!item || item.id) return item;
    const match = allProducts.find((p) => p.name?.toLowerCase() === item.name?.toLowerCase());
    if (!match) return item;
    return { ...match, ...item, image: match.image, img: resolveImagePath(match.image) };
  };

  const handleCardAction = (item) => {
    const product = attachProductDetails(item);
    if (product?.id) {
      addToCart(product);
      return;
    }
    navigate('/menu');
  };

  const hero = config.hero_banner || DEFAULT_HOMEPAGE_CONFIG.hero_banner;
  const trending = config.trending_today || DEFAULT_HOMEPAGE_CONFIG.trending_today;

  if (!user) return null;

  return (
    <div className="app-home-wrapper pb-4">

      {/* Horizontal Categories */}
      <div className="app-categories mt-2" style={{ paddingBottom: '5px' }}>
        <div className="app-cat-list">
          {CATEGORIES.map(cat => (
            <div key={cat.id} className="app-cat-item" onClick={() => navigate(cat.path)}>
              <div className="app-cat-img-wrap">
                <img src={resolveImagePath(cat.img)} alt={cat.name} />
              </div>
              <span className="app-cat-name">{cat.name}</span>
            </div>
          ))}
        </div>
      </div>



      {/* App Hero Slider - New Cream Design */}
      <div className="app-hero-container" style={{ padding: '5px 20px' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          style={{
            background: '#F9F6F0',
            borderRadius: '24px',
            position: 'relative',
            overflow: 'hidden',
            minHeight: '180px',
            display: 'flex',
            alignItems: 'center',
            boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
            border: '1px solid #EAE6DF'
          }}
        >
          {/* Images filling the whole card (absolute) */}
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1 }}>
            {heroImages.map((img, index) => (
              <img
                key={index}
                src={resolveImagePath(img)}
                alt="Hero Food"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  opacity: index === heroImageIndex ? 1 : 0,
                  transition: 'opacity 1s ease-in-out'
                }}
              />
            ))}
            {/* Dark Gradient Overlay for Text Readability */}
            <div style={{
              position: 'absolute',
              top: 0, left: 0, width: '100%', height: '100%',
              background: 'linear-gradient(to right, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0) 100%)'
            }} />
          </div>

          {/* Text Content Directly Over Image */}
          <div style={{
            position: 'relative',
            zIndex: 2,
            padding: '40px 24px',
            maxWidth: '85%',
          }}>
            <h2 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '28px',
              fontWeight: 800,
              color: '#FFFFFF',
              lineHeight: 1.1,
              marginBottom: '8px',
              textShadow: '0 2px 4px rgba(0,0,0,0.3)'
            }}>
              Welcome to<br />Ammulu's Kitchen
            </h2>
            <div style={{
              fontSize: '13px',
              color: '#EAE6DF',
              fontWeight: 600,
              marginBottom: '20px',
              lineHeight: 1.4,
              textShadow: '0 1px 2px rgba(0,0,0,0.3)'
            }}>
              Where Every Recipe<br />Tells a Story.
            </div>
            <button
              onClick={() => navigate('/menu')}
              style={{
                background: '#F9F6F0',
                color: '#0F3D2E',
                border: 'none',
                padding: '10px 24px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 700,
                boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
              }}
            >
              Order Now
            </button>
          </div>
        </motion.div>
      </div>



      <div style={{ height: 8, background: '#F5F5F0', width: '100%', margin: '10px 0' }}></div>

      {/* Trending Today / Food Cards */}
      <div className="app-food-section" style={{ padding: '15px 20px' }}>
        <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 15, display: 'flex', alignItems: 'center', gap: 8 }}>
          <TrendingUp size={20} color="var(--primary-color)" /> Trending Today
        </h3>

        <div className="app-food-list" style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
          {trending.map((dish, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="app-food-card-horizontal"
            >
              <div className="card-image-wrapper">
                <img src={resolveImagePath(dish.img)} alt={dish.name} />
              </div>
              <div className="card-text-wrapper">
                <div className="card-badge">MUST TRY</div>
                <h4 className="card-title">{dish.name}</h4>
                <div className="card-price">Rs. {dish.price}</div>
                <div className="card-meta">
                  <span className="rating"><Star size={10} fill="var(--warning)" color="var(--warning)" /> {dish.rating || '4.5'}</span>
                  <span><Clock size={10} /> {dish.time || '20 mins'}</span>
                </div>
              </div>
              <button
                className="card-add-btn"
                onClick={() => handleCardAction(dish)}
              >
                ADD
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      <div style={{ height: 8, background: '#F5F5F0', width: '100%', margin: '10px 0' }}></div>

      {/* Amma Recommends */}
      <div className="app-food-section" style={{ padding: '15px 20px' }}>
        <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 15, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Star size={20} color="var(--primary-color)" /> Amma Recommends
        </h3>

        <div className="app-food-list" style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
          {recommendedDishes.map((dish, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="app-food-card-horizontal"
            >
              <div className="card-image-wrapper">
                <img src={resolveImagePath(dish.img)} alt={dish.name} />
              </div>
              <div className="card-text-wrapper">
                <div className="card-badge">RECOMMENDED</div>
                <h4 className="card-title">{dish.name}</h4>
                <div className="card-price">Rs. {dish.price}</div>
                <p className="card-description">
                  {dish.description || 'Authentic south indian delicacy prepared with love and premium ingredients.'}
                </p>
              </div>
              <button
                className="card-add-btn"
                onClick={() => handleCardAction(dish)}
              >
                ADD
              </button>
            </motion.div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default CustomerHome;
