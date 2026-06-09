import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import CategoryCard from '../../components/CategoryCard';
import SEO from '../../components/SEO';
import FoodCard from '../../components/FoodCard';
import { resolveImagePath } from '../../components/FoodCard';
import StickySearch from '../../components/StickySearch';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import './Home.css';
import apiClient from '../../services/api';
import OfferPopup from '../../components/OfferPopup';
import SmartOffers from '../../components/SmartOffers';
import RecentlyViewed from '../../components/RecentlyViewed';

// Slides details tailored for premium South Indian culinary branding
const HERO_SLIDES = [
  {
    title: "Authentic South Indian Food & Fresh Artisan Batters",
    text: "Traditional recipes prepared fresh every day. Experience our Ready-to-Eat tiffin meals, zero-prep Ready-to-Cook kits, stone-ground batters, and catering solutions.",
    img: "assets/img/hero/hero-10-1.webp"
  },
  {
    title: "Stone-Ground Probiotic Batters For Fluffy Idlis & Crispy Dosas",
    text: "Naturally fermented for 8 hours with zero preservatives or soda. Freshly ground daily under strict sanitary guidelines to ensure the best health for your family.",
    img: "assets/img/hero/hero-10-2.webp"
  },
  {
    title: "Premium Catering & Live Counters For Every Occasion",
    text: "Pristine traditional hospitality and delicious hot live tiffin counters for weddings, corporate galas, and family milestones across Chennai.",
    img: "assets/img/hero/hero-10-3.jpg"
  }
];

// Removed mock arrays to enforce DB connection

// Testimonials Patrons
const TESTIMONIALS = [
  { name: "Mrs. Meenakshi Sundaram,", desig: "Mylapore, Chennai", rating: 5, text: "â€œAmma's Classic Batter is a lifesaver. The idlis come out incredibly soft and fluffy, exactly like my mother used to grind in the stone mortar. My kids enjoy the crispy ghee roast dosa every weekend.â€" },
  { name: "Dr. Karthik Raja,", desig: "Adyar, Chennai", rating: 5, text: "â€œThe Ragi Batter is perfect for my healthy diabetic breakfast diet. It is completely natural, sour-fermented just right, and absolutely free of baking soda. The delivery is extremely prompt.â€" },
  { name: "Rajesh & Kavitha,", desig: "IT Corridor, OMR", rating: 5, text: "â€œWe ordered the family bulk catering for our housewarming function. The live dosa counter was a stellar success. Pristine hygiene, premium ingredients, and authentic South Indian tastes.â€" }
];

const Home = () => {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [activeSlide, setActiveSlide] = useState(0);
  const [activeTesti, setActiveTesti] = useState(0);
  const [activePopupOffer, setActivePopupOffer] = useState(null);

  const [readyToEatItems, setReadyToEatItems] = useState([]);
  const [batterItems, setBatterItems] = useState([]);
  const [readyToCookItems, setReadyToCookItems] = useState([]);
  
  // New States for Desktop Premium Redesign
  const [trendingItems, setTrendingItems] = useState([]);
  const [recommendedItems, setRecommendedItems] = useState([]);
  const [bestSellerItems, setBestSellerItems] = useState([]);

  const [config, setConfig] = useState({
    headline: "Slow Stone-Ground Heritage Batters",
    opening_hours: "6am to 10pm",
    contact_phone: "+91 98765 43210",
    contact_email: "ammuluskitchen57@gmail.com",
    about_us: "Hotel Ammulu's Kitchen serves traditional stone-ground batters, ready-to-cook delicacies, and hot ready-to-eat vegetarian meals prepared with absolute cleanliness and natural flavor."
  });
  
  // Track selected batter sizes dynamically
  const [selectedSizes, setSelectedSizes] = useState({
    "bat-1": "1kg",
    "bat-2": "1kg",
    "bat-3": "1kg",
    "bat-4": "1kg",
    "bat-5": "1kg",
    "bat-6": "1kg"
  });
  
  // Form states for delivery/catering reservation
  const [reserveForm, setReserveForm] = useState({ name: '', phone: '', email: '', subject: 'Wedding Feast' });
  const [reserveSubmitted, setReserveSubmitted] = useState(false);

  const loadData = async () => {
    try {
      const configRes = await apiClient.get('/admin/website-config');
      setConfig(configRes.data);

      try {
        const offersRes = await apiClient.get('/offers/active');
        const popupOffer = offersRes.data.find(o => o.display_locations.includes('home_popup'));
        if (popupOffer) setActivePopupOffer(popupOffer);
      } catch (e) {
        console.error("Failed to load offers:", e);
      }

      const productsRes = await apiClient.get('/products/');
      const allProds = productsRes.data;

      const rtesMapped = allProds
        .filter(p => p.category === 'ready-to-eat' || p.category === 'ready_to_eat')
        .map(p => ({
          id: p.id,
          name: p.name,
          price: p.price,
          offer_price: p.offer_price,
          image: p.image,
          rating: 5,
          unit: p.unit || "Plate",
          description: p.description
        }));

      const battersMapped = allProds
        .filter(p => p.category === 'batter-products' || p.category === 'batter_products')
        .map(p => ({
          id: p.id,
          name: p.name,
          basePrice: p.price,
          offer_price: p.offer_price,
          image: p.image,
          description: p.description
        }));

      const rtcsMapped = allProds
        .filter(p => p.category === 'ready-to-cook' || p.category === 'ready_to_cook')
        .map(p => ({
          id: p.id,
          name: p.name,
          price: p.price,
          offer_price: p.offer_price,
          image: p.image,
          unit: p.unit || "Kit",
          description: p.description,
          cookingTime: "10 mins",
          servingSize: "4-5 People",
          shelfLife: "3 Days"
        }));

      setReadyToEatItems(rtesMapped);
      setBatterItems(battersMapped);
      setReadyToCookItems(rtcsMapped);

      // Populate new sections with varied items
      const baseFoodItems = allProds.map(p => ({
        id: p.id,
        name: p.name,
        price: p.price,
        offer_price: p.offer_price,
        image: p.image,
        rating: (Math.random() * 0.5 + 4.5).toFixed(1), // 4.5 - 5.0
        deliveryTime: "25-30 mins",
        description: p.description
      }));
      setTrendingItems(baseFoodItems.slice(0, 8)); // 8 items for Trending Today
      setRecommendedItems(baseFoodItems.slice(8, 12)); // 4 items for Amma Recommends
      setBestSellerItems(baseFoodItems.slice(3, 7)); // 4 items for Best Sellers
    } catch (err) {
      console.error("Failed to load dynamic data for homepage:", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // Autoplay hero slider
    const timer = setInterval(() => {
      setActiveSlide(prev => (prev + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleNextSlide = () => setActiveSlide(prev => (prev + 1) % HERO_SLIDES.length);
  const handlePrevSlide = () => setActiveSlide(prev => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);

  const handleNextTesti = () => setActiveTesti(prev => (prev + 1) % TESTIMONIALS.length);
  const handlePrevTesti = () => setActiveTesti(prev => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);

  const handleFormChange = (e) => {
    setReserveForm({ ...reserveForm, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setReserveSubmitted(true);
    setReserveForm({ name: '', phone: '', email: '', subject: 'Wedding Feast' });
  };

  return (
    <div className="home-10">
      <StickySearch />
      <OfferPopup offer={activePopupOffer} />
      <SEO title="Home" />
      
      {/* Swiper Hero Slider Area */}
      <div className="container desktop-container mobile-hero-padding" style={{ paddingTop: '40px' }}>
        <div className="premium-hero-container mobile-hero-height">
          <div className="premium-hero-overlay"></div>
          <div className="premium-hero-content" style={{ padding: '60px 40px' }}>
            <div className="layout-45-55">
              <div className="layout-45" style={{ paddingRight: '40px' }}>
                <h1 className="premium-hero-title">
                  Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}, <span className="highlight">{user ? user.name.split(' ')[0] : 'Guest'}</span> ‘‹
                </h1>
                <p className="premium-hero-desc" style={{ marginTop: '20px', marginBottom: '20px' }}>
                  {activeSlide === 0 ? (config.headline || HERO_SLIDES[0].text) : HERO_SLIDES[activeSlide].text}
                </p>
                
                {/* Desktop Search Bar - Hidden on mobile */}
                <div className="desktop-hero-search d-none d-lg-flex">
                  <i className="fa-regular fa-search" style={{ color: '#777', fontSize: '18px', paddingLeft: '10px' }}></i>
                  <input type="text" placeholder="Search for 'Crispy Dosa', 'Filter Coffee'..." />
                  <button className="desktop-hero-search-btn" onClick={() => navigate('/menu')}>Search</button>
                </div>

                <div className="premium-glass-card mt-4 d-none d-lg-block">
                  <span style={{ background: '#F5B941', color: '#1E1E1E', fontSize: '12px', fontWeight: '800', padding: '4px 12px', borderRadius: '20px', display: 'inline-block', marginBottom: '10px' }}>TODAY'S SPECIAL</span>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
                    <div>
                      <h3 style={{ color: 'white', fontFamily: "'Playfair Display', serif", fontSize: '28px', margin: '0 0 10px 0' }}>Signature Mini Tiffin Combo</h3>
                      <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', display: 'flex', gap: '15px' }}>
                        <span>â­ 4.9 Rating</span>
                        <span> Fast Delivery</span>
                        <span>¡ Home Style</span>
                      </div>
                    </div>
                    <Link to="/ready-to-eat" className="premium-order-now-btn" style={{ whiteSpace: 'nowrap' }}>Order Now</Link>
                  </div>
                </div>
              </div>
              <div className="layout-55 premium-hero-img-container" style={{ display: 'flex', justifyContent: 'center' }}>
                <div style={{ position: 'relative' }}>
                  {/* Floating Badges */}
                  <div className="d-none d-lg-flex hover-lift" style={{ position: 'absolute', top: '10%', left: '-5%', background: 'white', padding: '10px 20px', borderRadius: '50px', alignItems: 'center', gap: '10px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', zIndex: 10 }}>
                    <span style={{ fontSize: '24px' }}></span>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '12px', color: '#777', fontWeight: '600' }}>Super Fast</span>
                      <span style={{ fontSize: '14px', color: '#1E1E1E', fontWeight: '800' }}>Delivery</span>
                    </div>
                  </div>
                  <div className="d-none d-lg-flex hover-lift" style={{ position: 'absolute', bottom: '15%', right: '-5%', background: 'white', padding: '10px 20px', borderRadius: '50px', alignItems: 'center', gap: '10px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', zIndex: 10 }}>
                    <span style={{ fontSize: '24px', color: '#FFC107' }}>â­</span>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '14px', color: '#1E1E1E', fontWeight: '800' }}>4.9/5</span>
                      <span style={{ fontSize: '12px', color: '#777', fontWeight: '600' }}>1k+ Reviews</span>
                    </div>
                  </div>

                  <motion.img 
                    src={resolveImagePath(HERO_SLIDES[activeSlide].img)} 
                    alt="Steaming South Indian Platter" 
                    style={{ width: '90%', height: 'auto', borderRadius: '50%', objectFit: 'cover' }}
                    animate={{ y: [0, -15, 0] }}
                    transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions (Mobile Only 2x2 Grid) */}
      <div className="container d-lg-none" style={{ marginTop: '20px', marginBottom: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <Link to="/orders" style={{ background: '#F5F5F0', padding: '15px', borderRadius: '12px', textDecoration: 'none', color: '#1E1E1E', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
            <span style={{ fontSize: '24px', marginBottom: '5px' }}>„</span>
            <span style={{ fontSize: '12px', fontWeight: '600' }}>Reorder</span>
          </Link>
          <Link to="/orders" style={{ background: '#F5F5F0', padding: '15px', borderRadius: '12px', textDecoration: 'none', color: '#1E1E1E', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
            <span style={{ fontSize: '24px', marginBottom: '5px' }}>“</span>
            <span style={{ fontSize: '12px', fontWeight: '600' }}>Track Order</span>
          </Link>
          <Link to="/bulk-orders" style={{ background: '#F5F5F0', padding: '15px', borderRadius: '12px', textDecoration: 'none', color: '#1E1E1E', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
            <span style={{ fontSize: '24px', marginBottom: '5px' }}></span>
            <span style={{ fontSize: '12px', fontWeight: '600' }}>Book Catering</span>
          </Link>
          <Link to="/menu" style={{ background: '#F5F5F0', padding: '15px', borderRadius: '12px', textDecoration: 'none', color: '#1E1E1E', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
            <span style={{ fontSize: '24px', marginBottom: '5px' }}>¥</span>
            <span style={{ fontSize: '12px', fontWeight: '600' }}>Offers</span>
          </Link>
        </div>
      </div>

      {/* Quick Actions (Desktop 4 Cards Dashboard Style) */}
      <div className="container desktop-container d-none d-lg-block" style={{ marginTop: '40px', marginBottom: '40px' }}>
        <div className="grid-desktop-4">
          <Link to="/orders" className="hover-lift" style={{ background: 'white', border: '1px solid #EAEAEA', padding: '25px', borderRadius: '20px', textDecoration: 'none', color: '#1E1E1E', display: 'flex', alignItems: 'center', gap: '20px', boxShadow: '0 8px 25px rgba(0,0,0,0.04)' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '15px', background: 'rgba(46, 139, 87, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>„</div>
            <div>
              <h4 style={{ margin: '0 0 5px 0', fontSize: '18px', fontWeight: '700' }}>Express Reorder</h4>
              <p style={{ margin: 0, fontSize: '13px', color: '#777' }}>Order your favorites again</p>
            </div>
          </Link>
          <Link to="/orders" className="hover-lift" style={{ background: 'white', border: '1px solid #EAEAEA', padding: '25px', borderRadius: '20px', textDecoration: 'none', color: '#1E1E1E', display: 'flex', alignItems: 'center', gap: '20px', boxShadow: '0 8px 25px rgba(0,0,0,0.04)' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '15px', background: 'rgba(255, 140, 0, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>“</div>
            <div>
              <h4 style={{ margin: '0 0 5px 0', fontSize: '18px', fontWeight: '700' }}>Track Order</h4>
              <p style={{ margin: 0, fontSize: '13px', color: '#777' }}>Live status of your food</p>
            </div>
          </Link>
          <Link to="/bulk-orders" className="hover-lift" style={{ background: 'white', border: '1px solid #EAEAEA', padding: '25px', borderRadius: '20px', textDecoration: 'none', color: '#1E1E1E', display: 'flex', alignItems: 'center', gap: '20px', boxShadow: '0 8px 25px rgba(0,0,0,0.04)' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '15px', background: 'rgba(138, 43, 226, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}></div>
            <div>
              <h4 style={{ margin: '0 0 5px 0', fontSize: '18px', fontWeight: '700' }}>Bulk Catering</h4>
              <p style={{ margin: 0, fontSize: '13px', color: '#777' }}>For events & functions</p>
            </div>
          </Link>
          <Link to="/menu" className="hover-lift" style={{ background: 'white', border: '1px solid #EAEAEA', padding: '25px', borderRadius: '20px', textDecoration: 'none', color: '#1E1E1E', display: 'flex', alignItems: 'center', gap: '20px', boxShadow: '0 8px 25px rgba(0,0,0,0.04)' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '15px', background: 'rgba(218, 165, 32, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>¥</div>
            <div>
              <h4 style={{ margin: '0 0 5px 0', fontSize: '18px', fontWeight: '700' }}>Today's Offers</h4>
              <p style={{ margin: 0, fontSize: '13px', color: '#777' }}>Save on delicious food</p>
            </div>
          </Link>
        </div>
      </div>
      <SmartOffers />
      <section className="category-sec-4 space overflow-hidden" style={{ background: 'transparent' }}>
        <div className="container desktop-container">
          <div className="title-area style9 mb-60" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px' }}>
            <div>
              <h2 className="sec-title" style={{ fontFamily: "'Playfair Display', serif", fontSize: '42px', color: '#1E1E1E', marginBottom: '5px' }}>Explore Our Categories</h2>
              <p style={{ color: '#666', fontSize: '18px', margin: 0 }}>Fresh, homestyle and ready-to-cook delights for every craving.</p>
            </div>
            <Link to="/menu" style={{ border: '1px solid #2E8B57', color: '#2E8B57', borderRadius: '50px', padding: '12px 24px', fontWeight: '600', transition: '0.3s ease', textDecoration: 'none' }} onMouseOver={e => { e.target.style.background = '#2E8B57'; e.target.style.color = 'white'; }} onMouseOut={e => { e.target.style.background = 'transparent'; e.target.style.color = '#2E8B57'; }}>View All Categories â†—</Link>
          </div>
          
          {/* Mobile Categories (Horizontal Scroll) */}
          <div className="grid-auto-fit horizontal-carousel d-lg-none" style={{ gap: '20px' }}>
            <Link to="/ready-to-eat" className="premium-category-card" style={{ textDecoration: 'none' }}>
              <img src={resolveImagePath("assets/img/category/cat-new-1.webp")} alt="Ready to Eat" className="premium-category-img" />
              <h3 className="premium-category-title">Ready to Eat</h3>
              <span className="premium-category-count">24 Items Available</span>
            </Link>
            <Link to="/ready-to-cook" className="premium-category-card premium-category-featured" style={{ textDecoration: 'none' }}>
              <img src={resolveImagePath("assets/img/category/cat-new-2.webp")} alt="Ready to Cook" className="premium-category-img" />
              <h3 className="premium-category-title" style={{ color: 'white' }}>Ready to Cook</h3>
              <span className="premium-category-count" style={{ color: 'rgba(255,255,255,0.8)' }}>23 Items Available</span>
            </Link>
            <Link to="/batter-products" className="premium-category-card" style={{ textDecoration: 'none' }}>
              <img src={resolveImagePath("assets/img/category/cat-new-3.webp")} alt="Artisan Batters" className="premium-category-img" />
              <h3 className="premium-category-title">Artisan Batters</h3>
              <span className="premium-category-count">22 Items Available</span>
            </Link>
            <Link to="/bulk-orders" className="premium-category-card" style={{ textDecoration: 'none' }}>
              <img src={resolveImagePath("assets/img/category/cat-new-4.webp")} alt="Bulk Orders" className="premium-category-img" />
              <h3 className="premium-category-title">Bulk Orders</h3>
              <span className="premium-category-count">10 Items Available</span>
            </Link>
          </div>

          {/* Desktop Categories (6-Column Grid) */}
          <div className="grid-desktop-6 d-none d-lg-grid" style={{ gap: '20px' }}>
            <Link to="/ready-to-eat" className="premium-category-card hover-lift" style={{ width: '100%', height: 'auto', paddingBottom: '30px', textDecoration: 'none' }}>
              <img src={resolveImagePath("assets/img/category/cat-new-1.webp")} alt="Ready to Eat" className="premium-category-img" style={{ width: '150px', height: '150px' }} />
              <h3 className="premium-category-title" style={{ fontSize: '24px' }}>Ready to Eat</h3>
              <span className="premium-category-count" style={{ fontSize: '14px' }}>24 Items</span>
            </Link>
            <Link to="/ready-to-cook" className="premium-category-card premium-category-featured hover-lift" style={{ width: '100%', height: 'auto', paddingBottom: '30px', textDecoration: 'none' }}>
              <img src={resolveImagePath("assets/img/category/cat-new-2.webp")} alt="Ready to Cook" className="premium-category-img" style={{ width: '150px', height: '150px' }} />
              <h3 className="premium-category-title" style={{ color: 'white', fontSize: '24px' }}>Ready to Cook</h3>
              <span className="premium-category-count" style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px' }}>23 Items</span>
            </Link>
            <Link to="/batter-products" className="premium-category-card hover-lift" style={{ width: '100%', height: 'auto', paddingBottom: '30px', textDecoration: 'none' }}>
              <img src={resolveImagePath("assets/img/category/cat-new-3.webp")} alt="Artisan Batters" className="premium-category-img" style={{ width: '150px', height: '150px' }} />
              <h3 className="premium-category-title" style={{ fontSize: '24px' }}>Artisan Batters</h3>
              <span className="premium-category-count" style={{ fontSize: '14px' }}>22 Items</span>
            </Link>
            <Link to="/bulk-orders" className="premium-category-card hover-lift" style={{ width: '100%', height: 'auto', paddingBottom: '30px', textDecoration: 'none' }}>
              <img src={resolveImagePath("assets/img/category/cat-new-4.webp")} alt="Bulk Orders" className="premium-category-img" style={{ width: '150px', height: '150px' }} />
              <h3 className="premium-category-title" style={{ fontSize: '24px' }}>Bulk Orders</h3>
              <span className="premium-category-count" style={{ fontSize: '14px' }}>10 Items</span>
            </Link>
            <Link to="/menu" className="premium-category-card hover-lift" style={{ width: '100%', height: 'auto', paddingBottom: '30px', textDecoration: 'none' }}>
              <img src={resolveImagePath("assets/img/menu/menu_1_1.png")} alt="Combos" className="premium-category-img" style={{ width: '150px', height: '150px', background: '#F5F5F0' }} />
              <h3 className="premium-category-title" style={{ fontSize: '24px' }}>Combos</h3>
              <span className="premium-category-count" style={{ fontSize: '14px' }}>15 Items</span>
            </Link>
            <Link to="/menu" className="premium-category-card hover-lift" style={{ width: '100%', height: 'auto', paddingBottom: '30px', textDecoration: 'none' }}>
              <img src={resolveImagePath("assets/img/menu/menu_1_2.png")} alt="Beverages" className="premium-category-img" style={{ width: '150px', height: '150px', background: '#F5F5F0' }} />
              <h3 className="premium-category-title" style={{ fontSize: '24px' }}>Beverages</h3>
              <span className="premium-category-count" style={{ fontSize: '14px' }}>8 Items</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Counters display block */}
      <div className="space-bottom overflow-hidden">
        <div className="container">
          <div className="counter-card-wrap" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-around' }}>
            <div className="counter-card">
              <div className="media-body">
                <h2 className="box-number"><span className="counter-number">1000</span><span className="counter-sign">+</span></h2>
                <p className="box-text">Daily Orders</p>
              </div>
            </div>
            <div className="divider"></div>
            <div className="counter-card">
              <div className="media-body">
                <h2 className="box-number"><span className="counter-number">500</span><span className="counter-sign">+</span></h2>
                <p className="box-text">Happy Families</p>
              </div>
            </div>
            <div className="divider"></div>
            <div className="counter-card">
              <div className="media-body">
                <h2 className="box-number"><span className="counter-number">50</span><span className="counter-sign">+</span></h2>
                <p className="box-text">Corporate Clients</p>
              </div>
            </div>
            <div className="divider"></div>
            <div className="counter-card">
              <div className="media-body">
                <h2 className="box-number"><span className="counter-number">10</span><span className="counter-sign">+</span></h2>
                <p className="box-text">Batter Varieties</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <RecentlyViewed />

      {/* Trending Today Section (Swiggy Style Cards) */}
      <section className="space overflow-hidden" style={{ backgroundColor: '#fff', borderTop: '1px solid #EAE6DB' }}>
        <div className="container desktop-container">
          <div className="title-area style9 mb-40">
            <h2 className="sec-title" style={{ fontFamily: "'Playfair Display', serif", fontSize: '32px', color: '#1E1E1E' }}>Trending Today</h2>
            <p style={{ color: '#666', fontSize: '16px' }}>What others are ordering right now.</p>
          </div>
          <div className="grid-desktop-4" style={{ gap: '20px' }}>
            {trendingItems.map((item) => (
              <div key={item.id} className="premium-product-card hover-lift" style={{ textAlign: 'left', alignItems: 'flex-start', padding: '15px' }}>
                <div style={{ position: 'relative', width: '100%', height: '220px', borderRadius: '15px', overflow: 'hidden', marginBottom: '15px' }}>
                  <img src={resolveImagePath(item.image)} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} className="hover-scale" />
                  <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'white', borderRadius: '50%', width: '35px', height: '35px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 5px 15px rgba(0,0,0,0.1)' }}>
                    <i className="fa-regular fa-heart" style={{ color: '#FF3D00' }}></i>
                  </div>
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '5px', color: '#1E1E1E' }}>{item.name}</h3>
                <div style={{ display: 'flex', gap: '15px', color: '#777', fontSize: '13px', marginBottom: '15px' }}>
                  <span style={{ fontWeight: '600', color: '#2E8B57' }}>â­ {item.rating}</span>
                  <span>â€¢ {item.deliveryTime}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginTop: 'auto' }}>
                  <div style={{ fontSize: '20px', fontWeight: '700', color: '#1E1E1E' }}>Rs. {item.price}</div>
                  <button onClick={(e) => { e.preventDefault(); addToCart(item, 1); }} style={{ background: 'transparent', color: '#2E8B57', border: '1px solid #2E8B57', padding: '6px 20px', borderRadius: '8px', fontWeight: '700', textTransform: 'uppercase', fontSize: '12px', transition: '0.3s ease' }} onMouseOver={e => { e.target.style.background = '#2E8B57'; e.target.style.color = 'white'; }} onMouseOut={e => { e.target.style.background = 'transparent'; e.target.style.color = '#2E8B57'; }}>Add</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Amma Recommends Section */}
      <section className="space overflow-hidden" style={{ backgroundColor: '#FAF8F3' }}>
        <div className="container desktop-container">
          <div className="title-area style9 mb-40 text-center">
            <h2 className="sec-title" style={{ fontFamily: "'Playfair Display', serif", fontSize: '32px', color: '#1E1E1E' }}>Amma Recommends</h2>
            <p style={{ color: '#666', fontSize: '16px' }}>Handpicked traditional favorites for you.</p>
          </div>
          <div className="grid-desktop-3" style={{ gap: '30px' }}>
            {recommendedItems.map((item, index) => (
              <div key={item.id} className="hover-lift" style={{ display: 'flex', background: 'white', borderRadius: '20px', padding: '20px', gap: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                <div style={{ width: '120px', height: '120px', borderRadius: '15px', overflow: 'hidden', flexShrink: 0 }}>
                  <img src={resolveImagePath(item.image)} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <span style={{ background: index === 0 ? '#FF3D00' : index === 1 ? '#2E8B57' : '#F5B941', color: 'white', fontSize: '10px', padding: '4px 8px', borderRadius: '12px', alignSelf: 'flex-start', marginBottom: '8px', fontWeight: '700', textTransform: 'uppercase' }}>
                    {index === 0 ? 'Best Seller' : index === 1 ? 'Healthy Choice' : 'Popular'}
                  </span>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', margin: '0 0 5px 0' }}>{item.name}</h3>
                  <div style={{ fontSize: '18px', fontWeight: '700', color: '#1E1E1E', margin: '10px 0' }}>Rs. {item.price}</div>
                  <button onClick={(e) => { e.preventDefault(); addToCart(item, 1); }} style={{ color: '#2E8B57', background: 'transparent', border: 'none', padding: 0, fontWeight: '700', alignSelf: 'flex-start', cursor: 'pointer' }}>+ Add to Cart</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Promotional Banners */}
      <section className="space overflow-hidden">
        <div className="container desktop-container d-none d-lg-block">
          <div className="grid-desktop-3">
            <div className="promo-banner hover-lift">
              <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: `url(${resolveImagePath('assets/img/hero/hero-10-1.webp')}) center/cover` }}></div>
              <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(to right, rgba(0,0,0,0.8), rgba(0,0,0,0.2))' }}></div>
              <div className="promo-banner-content">
                <div className="promo-banner-title">Flat 20% OFF</div>
                <div className="promo-banner-subtitle">On your first artisan batter order</div>
                <Link to="/batter-products" className="promo-banner-btn">Order Now</Link>
              </div>
            </div>
            <div className="promo-banner hover-lift">
              <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: `url(${resolveImagePath('assets/img/hero/hero-10-2.webp')}) center/cover` }}></div>
              <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(to right, rgba(138, 43, 226, 0.8), rgba(0,0,0,0.2))' }}></div>
              <div className="promo-banner-content">
                <div className="promo-banner-title">Weekend Special</div>
                <div className="promo-banner-subtitle">Free delivery on orders above Rs. 500</div>
                <Link to="/ready-to-eat" className="promo-banner-btn">Explore Menu</Link>
              </div>
            </div>
            <div className="promo-banner hover-lift">
              <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: `url(${resolveImagePath('assets/img/hero/hero-10-3.jpg')}) center/cover` }}></div>
              <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(to right, rgba(46, 139, 87, 0.8), rgba(0,0,0,0.2))' }}></div>
              <div className="promo-banner-content">
                <div className="promo-banner-title">Festival Combo</div>
                <div className="promo-banner-subtitle">Save up to 30% on family packs</div>
                <Link to="/bulk-orders" className="promo-banner-btn">View Combos</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Best Sellers Section */}
      <section className="space overflow-hidden" style={{ backgroundColor: '#fff' }}>
        <div className="container desktop-container">
          <div className="title-area style9 mb-40 text-center">
            <h2 className="sec-title" style={{ fontFamily: "'Playfair Display', serif", fontSize: '32px', color: '#1E1E1E' }}>Our Best Sellers</h2>
            <p style={{ color: '#666', fontSize: '16px' }}>The most loved items by our customers.</p>
          </div>
          <div className="grid-desktop-4" style={{ gap: '20px' }}>
            {bestSellerItems.map((item) => (
              <div key={item.id} className="premium-product-card hover-lift" style={{ textAlign: 'left', alignItems: 'flex-start', padding: '15px' }}>
                <div style={{ position: 'relative', width: '100%', height: '220px', borderRadius: '15px', overflow: 'hidden', marginBottom: '15px' }}>
                  <span style={{ position: 'absolute', top: '10px', left: '10px', background: '#F5B941', color: '#1E1E1E', fontSize: '10px', padding: '4px 8px', borderRadius: '12px', fontWeight: '800', zIndex: 5, textTransform: 'uppercase' }}>Best Seller</span>
                  <img src={resolveImagePath(item.image)} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} className="hover-scale" />
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '5px', color: '#1E1E1E' }}>{item.name}</h3>
                <div style={{ display: 'flex', gap: '15px', color: '#777', fontSize: '13px', marginBottom: '15px' }}>
                  <span style={{ fontWeight: '600', color: '#2E8B57' }}>â­ {item.rating}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginTop: 'auto' }}>
                  <div style={{ fontSize: '20px', fontWeight: '700', color: '#1E1E1E' }}>Rs. {item.price}</div>
                  <button onClick={(e) => { e.preventDefault(); addToCart(item, 1); }} style={{ background: 'transparent', color: '#2E8B57', border: '1px solid #2E8B57', padding: '6px 20px', borderRadius: '8px', fontWeight: '700', textTransform: 'uppercase', fontSize: '12px', transition: '0.3s ease' }} onMouseOver={e => { e.target.style.background = '#2E8B57'; e.target.style.color = 'white'; }} onMouseOut={e => { e.target.style.background = 'transparent'; e.target.style.color = '#2E8B57'; }}>Add</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Ready to Eat Section */}
      <section className="food-sec-1 space overflow-hidden" style={{ backgroundColor: '#FCFBF7' }}>
        <div className="container desktop-container">
          <div className="title-area style9 text-center mb-40">
            <span className="sub-title">Premium South Indian Delicacies</span>
            <h2 className="sec-title">Featured Ready-To-Eat Meals</h2>
            <p className="text-muted" style={{ maxWidth: '600px', margin: '12px auto 0' }}>
              Authentic, piping-hot tiffins, multi-layered parotta combos, and aromatic slow-cooked biryanis prepared with pure cow ghee.
            </p>
          </div>
          
          <div className="swiper th-slider d-lg-none">
            <div className="swiper-wrapper grid-layout grid-auto-fit horizontal-carousel">
              {readyToEatItems.map((item) => (
                <FoodCard key={item.id} product={item} />
              ))}
            </div>
          </div>
          
          <div className="grid-desktop-4 d-none d-lg-grid" style={{ gap: '30px' }}>
            {readyToEatItems.slice(0, 8).map((item) => (
              <FoodCard key={item.id} product={item} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Batter Products Section (Premium Segment) */}
      <section className="space overflow-hidden" id="batter-sec" style={{ backgroundColor: '#FAF8F0', borderTop: '1px solid #EAE6DB', borderBottom: '1px solid #EAE6DB' }}>
        <div className="container desktop-container">
          <div className="title-area style9 text-center mb-40">
            <span className="sub-title">100% Stone-Ground & Probiotic</span>
            <h2 className="sec-title">Fresh Artisan Batter Showcase</h2>
            <p className="text-muted" style={{ maxWidth: '600px', margin: '12px auto 0' }}>
              Naturally fermented for 8 hours with zero chemicals, soda, or preservatives. Ground daily under strict sanitary guidelines.
            </p>
          </div>
          
          <div className="grid-auto-fit horizontal-carousel d-lg-none" style={{ gap: '30px' }}>
            {batterItems.map((item) => {
              const selectedSize = selectedSizes[item.id] || "1kg";
              // Calculate price based on size
              let priceFactor = 1.0;
              if (selectedSize === "500g") priceFactor = 0.65;
              else if (selectedSize === "2kg") priceFactor = 1.85;
              const finalPrice = Math.round(item.basePrice * priceFactor);

              const handleAddBatter = (e) => {
                e.preventDefault();
                addToCart({
                  id: item.id, // Do not append selectedSize to ID because backend needs integer DB ID
                  name: `${item.name} (${selectedSize})`,
                  price: finalPrice,
                  image: item.image,
                  unit: selectedSize
                }, 1);
              };

              return (
                <div className="card batter-premium-card" key={item.id} style={{ 
                  backgroundColor: '#FFFFFF', 
                  border: 'none', 
                  borderRadius: '24px', 
                  padding: '30px', 
                  boxShadow: '0 15px 35px rgba(0,0,0,0.08)',
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'space-between',
                  transition: 'var(--transition)'
                }}>
                  {/* Badges */}
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                    <span style={{ 
                      backgroundColor: '#73C69D', 
                      color: 'white', 
                      fontSize: '0.75rem', 
                      fontWeight: '600', 
                      padding: '4px 10px', 
                      borderRadius: '9999px',
                      fontFamily: 'var(--font-sans)'
                    }}>
                      ƒ Freshly Ground
                    </span>
                    <span style={{ 
                      backgroundColor: '#73C69D', 
                      color: 'white', 
                      fontSize: '0.75rem', 
                      fontWeight: '600', 
                      padding: '4px 10px', 
                      borderRadius: '9999px',
                      fontFamily: 'var(--font-sans)'
                    }}>
                      ›¡ï¸ No Preservatives
                    </span>
                  </div>

                  {/* Image */}
                  <div style={{ 
                    height: '180px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    backgroundColor: '#FAF8F3', 
                    borderRadius: '12px',
                    marginBottom: '16px',
                    overflow: 'hidden'
                  }}>
                    <img src={resolveImagePath(item.image)} alt={item.name} style={{ maxHeight: '100%', objectFit: 'contain' }} />
                  </div>

                  {/* Details */}
                  <h3 style={{ 
                    fontFamily: "'Playfair Display', serif", 
                    fontSize: '1.4rem', 
                    fontWeight: '700', 
                    color: '#1E1E1E',
                    marginBottom: '8px'
                  }}>{item.name}</h3>
                  
                  <p style={{ 
                    fontSize: '0.85rem', 
                    color: '#666', 
                    lineHeight: '1.4', 
                    marginBottom: '16px',
                    minHeight: '60px'
                  }}>{item.description}</p>

                  {/* Pricing & Size Selection */}
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    borderTop: '1px solid #EAEAEA', 
                    paddingTop: '16px',
                    marginTop: 'auto'
                  }}>
                    <div>
                      <span style={{ fontSize: '0.8rem', color: '#666' }}>Choose Pack Size:</span>
                      <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                        {["500g", "1kg", "2kg"].map((size) => (
                          <button 
                            key={size}
                            onClick={() => setSelectedSizes(prev => ({ ...prev, [item.id]: size }))}
                            style={{
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              border: '1px solid #2E8B57',
                              backgroundColor: selectedSize === size ? '#2E8B57' : '#FFFFFF',
                              color: selectedSize === size ? 'white' : '#2E8B57',
                              cursor: 'pointer',
                              transition: 'var(--transition)'
                            }}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ 
                        fontFamily: "'Outfit', sans-serif", 
                        fontSize: '1.6rem', 
                        fontWeight: '700', 
                        color: '#1E1E1E' 
                      }}>
                        Rs. {finalPrice}
                      </div>
                      <button 
                        onClick={handleAddBatter} 
                        className="premium-add-cart-btn"
                        style={{ padding: '10px 20px', fontSize: '14px', marginTop: '8px' }}
                      >
                        Add to cart
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid-desktop-4 d-none d-lg-grid" style={{ gap: '30px' }}>
            {batterItems.slice(0, 8).map((item) => {
              const selectedSize = selectedSizes[item.id] || "1kg";
              // Calculate price based on size
              let priceFactor = 1.0;
              if (selectedSize === "500g") priceFactor = 0.65;
              else if (selectedSize === "2kg") priceFactor = 1.85;
              const finalPrice = Math.round(item.basePrice * priceFactor);

              const handleAddBatter = (e) => {
                e.preventDefault();
                addToCart({
                  id: item.id, // Do not append selectedSize to ID because backend needs integer DB ID
                  name: `${item.name} (${selectedSize})`,
                  price: finalPrice,
                  image: item.image,
                  unit: selectedSize
                }, 1);
              };

              return (
                <div className="card batter-premium-card hover-lift" key={`desk-${item.id}`} style={{ 
                  backgroundColor: '#FFFFFF', 
                  border: 'none', 
                  borderRadius: '24px', 
                  padding: '30px', 
                  boxShadow: '0 15px 35px rgba(0,0,0,0.08)',
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'space-between',
                  transition: 'var(--transition)'
                }}>
                  {/* Badges */}
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                    <span style={{ backgroundColor: '#73C69D', color: 'white', fontSize: '0.75rem', fontWeight: '600', padding: '4px 10px', borderRadius: '9999px', fontFamily: 'var(--font-sans)' }}>ƒ Freshly Ground</span>
                    <span style={{ backgroundColor: '#73C69D', color: 'white', fontSize: '0.75rem', fontWeight: '600', padding: '4px 10px', borderRadius: '9999px', fontFamily: 'var(--font-sans)' }}>›¡ï¸ No Preservatives</span>
                  </div>

                  {/* Image */}
                  <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FAF8F3', borderRadius: '12px', marginBottom: '16px', overflow: 'hidden' }}>
                    <img src={resolveImagePath(item.image)} alt={item.name} style={{ maxHeight: '100%', objectFit: 'contain' }} className="hover-scale" />
                  </div>

                  {/* Details */}
                  <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.4rem', fontWeight: '700', color: '#1E1E1E', marginBottom: '8px' }}>{item.name}</h3>
                  <p style={{ fontSize: '0.85rem', color: '#666', lineHeight: '1.4', marginBottom: '16px', minHeight: '60px' }}>{item.description}</p>

                  {/* Pricing & Size Selection */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #EAEAEA', paddingTop: '16px', marginTop: 'auto' }}>
                    <div>
                      <span style={{ fontSize: '0.8rem', color: '#666' }}>Choose Pack Size:</span>
                      <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                        {["500g", "1kg", "2kg"].map((size) => (
                          <button key={size} onClick={() => setSelectedSizes(prev => ({ ...prev, [item.id]: size }))} style={{ fontSize: '0.75rem', fontWeight: '600', padding: '4px 8px', borderRadius: '4px', border: '1px solid #2E8B57', backgroundColor: selectedSize === size ? '#2E8B57' : '#FFFFFF', color: selectedSize === size ? 'white' : '#2E8B57', cursor: 'pointer', transition: 'var(--transition)' }}>{size}</button>
                        ))}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.6rem', fontWeight: '700', color: '#1E1E1E' }}>Rs. {finalPrice}</div>
                      <button onClick={handleAddBatter} className="premium-add-cart-btn" style={{ padding: '10px 20px', fontSize: '14px', marginTop: '8px' }}>Add to cart</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Ready to Cook Section */}
      <section className="space overflow-hidden" style={{ backgroundColor: '#FCFBF7', borderBottom: '1px solid #EAE6DB' }}>
        <div className="container desktop-container">
          <div className="title-area style9 text-center mb-40">
            <span className="sub-title">Zero Labor Home Prep</span>
            <h2 className="sec-title">Ready-To-Cook Smart Meal Kits</h2>
            <p className="text-muted" style={{ maxWidth: '600px', margin: '12px auto 0' }}>
              Prepared with high-quality ingredients, portion-controlled, and packed under sterile vacuum conditions. Just heat or fry and serve hot.
            </p>
          </div>

          <div className="grid-auto-fit horizontal-carousel d-lg-none" style={{ gap: '30px' }}>
            {readyToCookItems.map((item) => {
              const handleAddRTC = (e) => {
                e.preventDefault();
                addToCart(item, 1);
              };

              return (
                <div className="card meal-kit-card" key={item.id} style={{ backgroundColor: '#FFFFFF', border: '1px solid #EAE6DB', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', transition: 'var(--transition)' }}>
                  <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FCFBF7', borderRadius: '12px', marginBottom: '16px', overflow: 'hidden' }}>
                    <img src={resolveImagePath(item.image)} alt={item.name} style={{ maxHeight: '100%', objectFit: 'contain' }} />
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', fontWeight: '700', color: 'var(--primary-dark)', marginBottom: '8px' }}>{item.name}</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.4', marginBottom: '12px', minHeight: '40px' }}>{item.description}</p>
                  <div className="grid-auto-fit" style={{ gap: '24px', marginTop: '20px', backgroundColor: '#FCFBF7', borderRadius: '8px', padding: '10px', marginBottom: '16px', fontSize: '0.75rem', border: '1px solid #EAE6DB' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ color: 'var(--text-muted)' }}>â±ï¸ Prep Time</div>
                      <div style={{ fontWeight: '700', color: 'var(--text-dark)' }}>{item.cookingTime}</div>
                    </div>
                    <div style={{ textAlign: 'center', borderLeft: '1px solid #EAE6DB', borderRight: '1px solid #EAE6DB' }}>
                      <div style={{ color: 'var(--text-muted)' }}>½ï¸ Serves</div>
                      <div style={{ fontWeight: '700', color: 'var(--text-dark)' }}>{item.servingSize}</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ color: 'var(--text-muted)' }}>â„ï¸ Shelf Life</div>
                      <div style={{ fontWeight: '700', color: 'var(--text-dark)' }}>{item.shelfLife}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', borderTop: '1px solid #EAE6DB', paddingTop: '16px' }}>
                    <div style={{ fontFamily: 'var(--font-sans)', fontSize: '1.4rem', fontWeight: '700', color: 'var(--text-dark)' }}>Rs. {item.price.toFixed(2)}</div>
                    <button onClick={handleAddRTC} className="th-btn" style={{ padding: '10px 20px', fontSize: '0.85rem', border: 'none', cursor: 'pointer' }}>Add to Cart</button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid-desktop-4 d-none d-lg-grid" style={{ gap: '30px' }}>
            {readyToCookItems.slice(0, 8).map((item) => {
              const handleAddRTC = (e) => {
                e.preventDefault();
                addToCart(item, 1);
              };

              return (
                <div className="card meal-kit-card hover-lift" key={`desk-${item.id}`} style={{ backgroundColor: '#FFFFFF', border: '1px solid #EAE6DB', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', transition: 'var(--transition)' }}>
                  <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FCFBF7', borderRadius: '12px', marginBottom: '16px', overflow: 'hidden' }}>
                    <img src={resolveImagePath(item.image)} alt={item.name} style={{ maxHeight: '100%', objectFit: 'contain' }} className="hover-scale" />
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', fontWeight: '700', color: 'var(--primary-dark)', marginBottom: '8px' }}>{item.name}</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.4', marginBottom: '12px', minHeight: '40px' }}>{item.description}</p>
                  <div className="grid-auto-fit" style={{ gap: '15px', marginTop: '10px', backgroundColor: '#FCFBF7', borderRadius: '8px', padding: '10px', marginBottom: '16px', fontSize: '0.75rem', border: '1px solid #EAE6DB' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ color: 'var(--text-muted)' }}>â±ï¸ Time</div>
                      <div style={{ fontWeight: '700', color: 'var(--text-dark)' }}>{item.cookingTime}</div>
                    </div>
                    <div style={{ textAlign: 'center', borderLeft: '1px solid #EAE6DB', borderRight: '1px solid #EAE6DB' }}>
                      <div style={{ color: 'var(--text-muted)' }}>½ï¸ Serves</div>
                      <div style={{ fontWeight: '700', color: 'var(--text-dark)' }}>{item.servingSize}</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ color: 'var(--text-muted)' }}>â„ï¸ Shelf</div>
                      <div style={{ fontWeight: '700', color: 'var(--text-dark)' }}>{item.shelfLife}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', borderTop: '1px solid #EAE6DB', paddingTop: '16px' }}>
                    <div style={{ fontFamily: 'var(--font-sans)', fontSize: '1.4rem', fontWeight: '700', color: 'var(--text-dark)' }}>Rs. {item.price.toFixed(2)}</div>
                    <button onClick={handleAddRTC} className="th-btn hover-lift" style={{ padding: '8px 15px', fontSize: '0.85rem', border: 'none', cursor: 'pointer', borderRadius: '20px' }}>Add</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Carousel Section */}
      <section className="testi-sec-10 overflow-hidden space" style={{ backgroundColor: '#1E1D19' }}>
        <div className="container desktop-container">
          <div className="title-area style9 text-center mb-40">
            <span className="sub-title text-theme2">Patron Reviews</span>
            <h2 className="sec-title text-white">Loved by Our Community</h2>
          </div>
          
          {/* Mobile Testimonials */}
          <div className="testi-slider10 d-lg-none">
            <div className="swiper th-slider">
              <div className="swiper-wrapper">
                <div className="swiper-slide text-center" style={{ display: 'block', padding: '30px' }}>
                  <div className="testi-card2 style2 style3 style4">
                    <div className="media-body">
                      <div className="testi-card_profile">
                        <div className="testi-card_content">
                          <div className="reating">
                            <ul>
                              {[...Array(TESTIMONIALS[activeTesti].rating)].map((_, i) => (
                                <li key={i}><i className="fa-solid fa-star"></i></li>
                              ))}
                            </ul>
                          </div>
                          <p className="testi-card_text" style={{ fontSize: '1.2rem', color: '#EAE6DB', fontStyle: 'italic', marginBottom: '20px' }}>
                            {TESTIMONIALS[activeTesti].text}
                          </p>
                          <h3 className="testi-card_name" style={{ color: 'var(--primary-color)' }}>
                            {TESTIMONIALS[activeTesti].name}
                          </h3>
                          <span className="testi-card_desig" style={{ color: '#B5B2A9' }}>
                            {TESTIMONIALS[activeTesti].desig}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="sec-btn text-center" style={{ marginTop: '20px' }}>
                <div className="testi10-icon-arrow" style={{ display: 'inline-flex', gap: '20px' }}>
                  <button onClick={handlePrevTesti} className="slider-arrow style3 default slider-prev">
                    <i className="fa-solid fa-chevron-left" style={{ marginRight: '6px' }}></i>Prev
                  </button>
                  <button onClick={handleNextTesti} className="slider-arrow style3 default slider-next">
                    Next<i className="fa-solid fa-chevron-right" style={{ marginLeft: '6px' }}></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Testimonials (3 Columns) */}
          <div className="grid-desktop-3 d-none d-lg-grid" style={{ gap: '30px' }}>
            {TESTIMONIALS.map((testi, idx) => (
              <div key={idx} className="testi-card2 style2 style3 style4 hover-lift" style={{ display: 'block', padding: '30px', margin: 0, height: '100%', borderRadius: '20px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div className="media-body">
                  <div className="testi-card_profile">
                    <div className="testi-card_content">
                      <div className="reating" style={{ marginBottom: '15px' }}>
                        <ul style={{ padding: 0, display: 'flex', justifyContent: 'center', gap: '5px' }}>
                          {[...Array(testi.rating)].map((_, i) => (
                            <li key={i} style={{ color: '#F5B941' }}><i className="fa-solid fa-star"></i></li>
                          ))}
                        </ul>
                      </div>
                      <p className="testi-card_text" style={{ fontSize: '1.1rem', color: '#EAE6DB', fontStyle: 'italic', marginBottom: '20px', lineHeight: '1.6' }}>
                        {testi.text}
                      </p>
                      <h3 className="testi-card_name" style={{ color: 'var(--primary-color)', fontSize: '1.2rem', marginBottom: '5px' }}>
                        {testi.name}
                      </h3>
                      <span className="testi-card_desig" style={{ color: '#B5B2A9', fontSize: '0.9rem' }}>
                        {testi.desig}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bulk Orders & Premium Catering Banner & Booking Form */}
      <section className="food-delivery-sec-1 space overflow-hidden" id="catering-booking">
        <div className="food-delivery-top">
          <div className="img-box"><img src={resolveImagePath("assets/img/normal/food-delivery-top.png")} alt="" /></div>
        </div>
        <div className="food-delivery-bottom">
          <div className="img-box"><img src={resolveImagePath("assets/img/normal/food-delivery-bottom.png")} alt="" /></div>
        </div>
        <div className="container desktop-container">
          <div className="row gx-80 gy-30 align-items-center justify-content-center">
            <div className="col-xl-6">
              <div className="title-area style9 mb-4">
                <span className="sub-title">Bulk & Commercial Catering</span>
                <h2 className="sec-title">Catering Solutions for Every Occasion</h2>
                <p className="text-muted" style={{ marginTop: '8px', fontSize: '0.9rem', lineHeight: '1.4' }}>
                  Amma provides premium catering services across Chennai:
                </p>
                <div className="grid-auto-sm" style={{ marginTop: '12px', color: 'var(--text-dark)', fontWeight: '600', fontSize: '0.9rem' }}>
                  <div> Wedding Catering</div>
                  <div> Corporate Events</div>
                  <div> Birthday Functions</div>
                  <div>« School Events</div>
                  <div> College Events</div>
                  <div>¡ Family Celebrations</div>
                </div>
              </div>
              
              {reserveSubmitted ? (
                <div className="alert alert-success py-4 text-center">
                  <h4 style={{ color: 'var(--secondary-dark)' }}>Quote Request Submitted!</h4>
                  <p className="mb-0">Namaste! Amma's catering manager has scheduled your request. We will phone you shortly to discuss menu choices.</p>
                </div>
              ) : (
                <form onSubmit={handleFormSubmit} className="contact-form food-delivery1-form">
                  <div className="row">
                    <div className="col-12">
                      <p className="box-text mb-3">*inquiries recommended 48 hours in advance</p>
                    </div>
                    <div className="form-group col-md-6">
                      <input type="text" className="form-control" name="name" placeholder="Your Name" value={reserveForm.name} onChange={handleFormChange} required /> 
                      <i className="fal fa-user"></i>
                    </div>
                    <div className="form-group col-md-6">
                      <input type="text" className="form-control" name="phone" placeholder="Phone Number" value={reserveForm.phone} onChange={handleFormChange} required /> 
                      <i className="fal fa-phone"></i>
                    </div>
                    <div className="form-group col-md-6">
                      <input type="email" className="form-control" name="email" placeholder="Your Email" value={reserveForm.email} onChange={handleFormChange} required /> 
                      <i className="fal fa-envelope"></i>
                    </div>
                    <div className="form-group col-md-6 style-border">
                      <select name="subject" className="form-select" value={reserveForm.subject} onChange={handleFormChange}>
                        <option value="Wedding Feast">Wedding Feast</option>
                        <option value="Corporate Buffet">Corporate Buffet</option>
                        <option value="Birthday Party">Birthday Party</option>
                        <option value="College Festival">College Festival</option>
                        <option value="Traditional Tiffin Party">Traditional Tiffin Party</option>
                      </select>
                    </div>
                    <div className="form-btn col-12">
                      <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
                        <button type="submit" className="th-btn style9 th-icon" style={{ border: 'none', cursor: 'pointer', flex: 1 }}>
                          Get Instant Quote <i className="fa-light fa-arrow-right"></i>
                        </button>
                        <button type="submit" className="th-btn style10 th-icon" style={{ border: 'none', cursor: 'pointer', flex: 1 }}>
                          Book Catering <i className="fa-light fa-arrow-right"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              )}
            </div>
            <div className="col-xl-6">
              <div className="food-delivery-main">
                <img src={resolveImagePath("assets/img/normal/food-delivery-main-1.webp")} alt="Delivery Boy" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Video Call banner / Let's Talk quote */}
      <div className="video-area-4 style-2 z-index-common" style={{ backgroundImage: `url(${resolveImagePath('assets/img/bg/video-5-bg.jpg')})` }}>
        <div className="container">
          <div className="video-box4">
            <h2 className="sec-title text-white">Let's Talk Catering</h2>
            <div className="video-4">
              <a href="#catering-booking" className="quote-btn">Instant Free Quote</a>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Home;
