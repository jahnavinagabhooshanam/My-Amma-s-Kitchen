import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LogOut, Settings, Clock, Star, Gift, 
  Calendar, ChevronRight, ShoppingBag, 
  Heart, Coffee, Utensils, Plus, CheckCircle, 
  Package, PartyPopper, TrendingUp, Award, 
  Leaf, Truck, ShieldCheck, Flame, Zap
} from 'lucide-react';
import './Dashboard.css';
import apiClient from '../../services/api';

const CustomerHome = () => {
  const { user, logout } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  
  const [greeting] = useState(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  });

  const [activeTab, setActiveTab] = useState('Breakfast');
  const [config, setConfig] = useState(null);
  const [recommendedDishes, setRecommendedDishes] = useState([]);

  const resolveImagePath = (path) => {
    if (!path) return 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80';
    let clean = path;
    if (clean.startsWith('http')) return clean;
    if (clean.startsWith('/assets/') || clean.startsWith('assets/') || clean.startsWith('/api/assets/')) {
      clean = clean.replace(/^\/?(api\/)?assets\//, '');
      return `http://localhost:5000/assets/${clean}`;
    }
    if (clean.startsWith('/uploads/') || clean.startsWith('uploads/')) {
      if (clean.startsWith('/')) clean = clean.substring(1);
      return `http://localhost:5000/${clean}`;
    }
    return `http://localhost:5000/${clean}`;
  };

  useEffect(() => {
    const fetchHomepageConfig = async () => {
      try {
        const res = await apiClient.get('/homepage/');
        setConfig(res.data);
      } catch (err) {
        console.error("Failed to load homepage config", err);
      }
    };
    fetchHomepageConfig();
  }, []);

  useEffect(() => {
    // Also fetch real products to fill Amma Recommends since the config might just hold titles
    const fetchRecommended = async () => {
      try {
        const res = await apiClient.get('/products/', { params: { category: 'ready_to_eat' } });
        const products = res.data;
        if (products && products.length > 0) {
          const shuffled = [...products].sort(() => 0.5 - Math.random());
          setRecommendedDishes(shuffled.slice(0, 3).map(p => ({ ...p, img: resolveImagePath(p.image) })));
        }
      } catch (err) {
        console.error("Failed to load dashboard products", err);
      }
    };
    fetchRecommended();
  }, [activeTab]); // re-fetch / re-shuffle when tab changes

  const getMealRecommendation = () => {
    if (!config || !config.amma_recommends) return 'Recommended for you';
    switch(activeTab) {
      case 'Breakfast': return config.amma_recommends.breakfast_title || 'Popular Today in your area';
      case 'Lunch': return config.amma_recommends.lunch_title || 'Based on your previous orders';
      case 'Dinner': return config.amma_recommends.dinner_title || 'Light & Freshly Prepared';
      default: return '';
    }
  };

  if (!user || !config) return null; // Show loading spinner ideally

  const hero = config.hero_banner || {};
  const pulse = config.kitchen_pulse || {};
  const trending = config.trending_today || [];
  const festivals = config.festivals || {};

  return (
    <div className="premium-dashboard">
      <div className="dash-container">
        
        {/* 1. PREMIUM HERO EXPERIENCE (Dynamic) */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          className="premium-hero span-12"
          style={{ backgroundImage: `linear-gradient(to right, rgba(10, 25, 47, 0.9), rgba(10, 25, 47, 0.4)), url('${resolveImagePath(hero.bg_image)}')` }}
        >
          <div className="hero-content">
            <span className="hero-badge"><CheckCircle size={14} /> {hero.title}</span>
            <h1>{greeting}, {user.name?.split(' ')[0] || 'Guest'} 👋</h1>
            <p className="hero-subtitle">{hero.subtitle}</p>
            
            <div className="hero-special-box">
              <div className="special-info">
                <span className="special-tag">{hero.special_tag}</span>
                <h3>{hero.special_title}</h3>
                <div className="special-stats">
                  <span><Star size={14} fill="#D4AF37" color="#D4AF37" /> 4.9 Rating</span>
                  <span><Truck size={14} /> Fast Delivery</span>
                  <span><Heart size={14} /> Home Style</span>
                </div>
              </div>
              <button className="premium-btn" onClick={() => navigate('/ready-to-eat')}>Order Now</button>
            </div>
          </div>
        </motion.div>

        {/* 9. UNIFIED QUICK ACTIONS */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="quick-actions-bar span-12"
        >
          <button className="quick-action-btn" onClick={() => navigate('/account')}><Clock size={20} /> Reorder Favorite</button>
          <button className="quick-action-btn" onClick={() => navigate('/bulk-orders')}><Coffee size={20} /> Book Catering</button>
          <button className="quick-action-btn" onClick={() => navigate('/batter-products')}><Calendar size={20} /> Subscriptions</button>
          <button className="quick-action-btn" onClick={() => navigate('/account')}><Package size={20} /> Track Order</button>
          <button className="quick-action-btn" onClick={() => navigate('/account')}><Gift size={20} /> View Rewards</button>
        </motion.div>

        <div className="bento-grid">
          
          {/* NEW SECTION: KITCHEN PULSE (Dynamic) */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.25 }}
            className="glass-card span-12 kitchen-pulse-section"
          >
            <h2 className="section-title"><Zap size={28} /> Kitchen Pulse</h2>
            <div className="pulse-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '15px' }}>
              {Object.entries(pulse).map(([key, item], idx) => (
                <div key={idx} className="pulse-card recommend-card">
                  <div style={{ position: 'relative' }}>
                    <img src={resolveImagePath(item.img)} alt={item.name} style={{ height: '120px', width: '100%', objectFit: 'cover' }} />
                    <span style={{ position: 'absolute', top: 10, left: 10, background: 'var(--dash-accent)', color: 'white', padding: '4px 8px', fontSize: '0.7rem', borderRadius: '4px', fontWeight: 'bold', textTransform: 'capitalize' }}>
                      {key.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="recommend-content">
                    <h4 style={{ fontSize: '0.9rem', marginBottom: '8px' }}>{item.name}</h4>
                    <div className="recommend-meta">
                      <span className="price">₹{item.price}</span>
                      <button className="add-btn-small" onClick={() => addToCart(item)}>Add</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* 3. TRENDING TODAY (Span 12) (Dynamic) */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}
            className="glass-card span-12 trending-section"
          >
            <h2 className="section-title"><Flame size={28} /> Trending Today</h2>
            <div className="trending-grid">
              {trending.map((dish, i) => (
                <div key={dish.id || i} className="trending-card">
                  <div className="trending-img-container">
                    <img src={resolveImagePath(dish.img)} alt={dish.name} />
                    <div className="trending-overlay">
                      <button className="icon-btn-light" onClick={() => addToCart(dish)}><Plus size={20}/></button>
                    </div>
                  </div>
                  <div className="trending-info">
                    <h4>{dish.name}</h4>
                    <p>₹{dish.price}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* 2. ENHANCED AMMA RECOMMENDS (Span 8) */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}
            className="glass-card span-8"
          >
            <div className="recommends-header">
              <h2 className="section-title" style={{ margin: 0 }}><Star size={28} /> Amma Recommends</h2>
              <div className="meal-tabs">
                {['Breakfast', 'Lunch', 'Dinner'].map(tab => (
                  <button key={tab} className={`tab-btn ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
                    {tab}
                  </button>
                ))}
              </div>
            </div>
            
            <p className="recommendation-context"><TrendingUp size={16} /> {getMealRecommendation()}</p>
            
            <div className="recommends-grid">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.3 }}
                  style={{ display: 'contents' }}
                >
                  {recommendedDishes.map((dish, i) => (
                    <div 
                      key={`${activeTab}-${i}`}
                      className="recommend-card"
                    >
                      <img src={resolveImagePath(dish.img)} alt={dish.name} />
                      <div className="recommend-content">
                        <h4>{dish.name}</h4>
                        <div className="recommend-meta">
                          <span className="price">₹{dish.price}</span>
                          <button className="add-btn-small" onClick={() => addToCart(dish)}>Add</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>

          {/* 4. HOME STYLE SCORE (Span 4) */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}
            className="glass-card span-4 score-card"
          >
            <h2 className="section-title"><ShieldCheck size={28} /> Home Style Score</h2>
            <div className="score-container">
              <div className="score-circle">
                <svg viewBox="0 0 36 36" className="circular-chart">
                  <path className="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path className="circle" strokeDasharray="98, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <text x="18" y="20.35" className="percentage">98%</text>
                </svg>
                <span>Authenticity</span>
              </div>
              <div className="score-metrics">
                <div className="metric-row"><Leaf size={16} /> <span>100% Fresh Ingredients</span></div>
                <div className="metric-row"><Star size={16} /> <span>4.9/5 Quality Rating</span></div>
                <div className="metric-row"><Utensils size={16} /> <span>Zero Preservatives</span></div>
              </div>
            </div>
          </motion.div>

          {/* 5. CUSTOMER FOOD JOURNEY (Span 6) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
            className="glass-card span-6 food-journey-card"
          >
            <h2 className="section-title"><Heart size={28} /> Your Food Journey</h2>
            <div className="journey-grid">
              <div className="journey-stat">
                <span className="stat-label">Member Since</span>
                <span className="stat-value">Jan 2024</span>
              </div>
              <div className="journey-stat">
                <span className="stat-label">Orders Completed</span>
                <span className="stat-value">42</span>
              </div>
              <div className="journey-stat highlight-stat">
                <span className="stat-label">Favorite Dish</span>
                <span className="stat-value text-accent">Ghee Roast Dosa</span>
              </div>
              <div className="journey-stat">
                <span className="stat-label">Lifetime Savings</span>
                <span className="stat-value text-success">₹1,240</span>
              </div>
            </div>
          </motion.div>

          {/* 6. ENHANCED REWARDS (Span 6) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
            className="glass-card span-6 rewards-card-premium"
          >
            <div className="rewards-header">
              <h2 className="section-title" style={{ margin: 0, color: 'white' }}><Award size={28} /> Amma Rewards</h2>
              <span className="tier-badge gold">Gold Tier</span>
            </div>
            
            <div className="points-display">
              <span className="points-large">2,450</span> <span className="points-label">pts</span>
            </div>
            
            <div className="progress-container">
              <div className="progress-labels">
                <span>Current: Gold</span>
                <span>Platinum at 2500</span>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: '90%' }}>
                  <div className="progress-glow"></div>
                </div>
              </div>
              <p className="reward-unlock">Unlock <strong>Free Filter Coffee</strong> in 50 pts!</p>
            </div>
          </motion.div>

          {/* 8. SMART CATERING PREVIEW (Span 8) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
            className="glass-card span-8 catering-preview"
          >
            <div className="catering-content">
              <h2>Planning a Special Event?</h2>
              <p>Bring the authentic taste of Amma's Kitchen to your guests. Pristine hospitality and hot live tiffin counters.</p>
              
              <div className="event-pills">
                <span>🎉 Birthday</span>
                <span>💍 Wedding</span>
                <span>🏢 Office Lunch</span>
                <span>🏡 House Warming</span>
              </div>
              
              <button className="premium-btn-outline" onClick={() => navigate('/bulk-orders')}>Get Instant Quote</button>
            </div>
            <div className="catering-image"></div>
          </motion.div>

          {/* 7. FESTIVAL EXPERIENCES (Span 4) (Dynamic) */}
          {festivals.is_active && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}
              className="glass-card span-4 festival-card"
              style={{ backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.8)), url('${resolveImagePath(festivals.bg_image)}')`, backgroundSize: 'cover' }}
            >
              <div className="festival-overlay">
                <span className="festival-tag">{festivals.tag}</span>
                <h2 style={{ color: 'white', fontFamily: "'Playfair Display', serif", margin: "10px 0" }}>{festivals.title}</h2>
                <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: "0.9rem" }}>{festivals.description}</p>
                <button className="festival-btn">{festivals.btn_text}</button>
              </div>
            </motion.div>
          )}

        </div>
      </div>
    </div>
  );
};

export default CustomerHome;
