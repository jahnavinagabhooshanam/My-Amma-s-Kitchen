import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import SEO from '../../components/SEO';
import { resolveImagePath } from '../../components/FoodCard';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../services/api';
import OfferPopup from '../../components/OfferPopup';
import './Home.css';
import { Search } from 'lucide-react';

const Home = () => {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activePopupOffer, setActivePopupOffer] = useState(null);
  const [recommendedItems, setRecommendedItems] = useState([]);
  const [bestSellerItems, setBestSellerItems] = useState([]);
  const [todaysSpecial, setTodaysSpecial] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = async () => {
    try {
      try {
        const offersRes = await apiClient.get('/offers/active');
        const popupOffer = offersRes.data.find(o => o.display_locations.includes('home_popup'));
        if (popupOffer) setActivePopupOffer(popupOffer);
      } catch (e) {
        console.error("Failed to load offers:", e);
      }

      const productsRes = await apiClient.get('/products/');
      const allProds = productsRes.data;

      const formattedProds = allProds.map(p => ({
        id: p.id,
        name: p.name,
        price: p.price,
        offer_price: p.offer_price,
        image: p.image,
        rating: (Math.random() * 0.5 + 4.5).toFixed(1), // 4.5 - 5.0
        deliveryTime: "25-30 mins",
        description: p.description
      }));

      // Fetch website config for dynamic sections
      let trendingList = [];
      let recommendedList = [];
      try {
        const hpRes = await apiClient.get('/homepage/');
        if (hpRes.data) {
          trendingList = hpRes.data.trending_today || [];
          recommendedList = hpRes.data.amma_recommends || [];
        }
      } catch (e) {
        console.error("Failed to load homepage config:", e);
      }

      // Distribute products into sections based on config, fallback to slice if empty
      if (recommendedList.length > 0) {
        setRecommendedItems(recommendedList.map(item => ({
          id: item.id || Math.random(),
          name: item.name,
          price: item.price,
          image: item.img || item.image,
          rating: (Math.random() * 0.5 + 4.5).toFixed(1),
          deliveryTime: "25-30 mins"
        })));
      } else {
        setRecommendedItems(formattedProds.slice(0, 4));
      }

      if (trendingList.length > 0) {
        setTodaysSpecial(trendingList.map(item => ({
          id: item.id || Math.random(),
          name: item.name,
          price: item.price,
          image: item.img || item.image,
          rating: (Math.random() * 0.5 + 4.5).toFixed(1),
          deliveryTime: "25-30 mins"
        })));
      } else {
        setTodaysSpecial(formattedProds.slice(8, 12));
      }
      
      setBestSellerItems(formattedProds.slice(4, 8)); // Keeping Best Sellers static or fallback
    } catch (err) {
      console.error("Failed to load dynamic data for homepage:", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/menu?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="home-modern pb-20">
      <SEO title="Home | Authentic South Indian Food" />
      <OfferPopup offer={activePopupOffer} />

      {/* 1. Compact Hero */}
      <section className="compact-hero">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">
              Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}, 
              <br/><span className="text-primary">{user ? user.name.split(' ')[0] : 'Guest'}</span>
            </h1>
            <p className="hero-subtitle">What are you craving today?</p>
          </div>
        </div>
      </section>

      {/* 2. Search */}
      <section className="home-search-section">
        <div className="container">
          <form onSubmit={handleSearchSubmit} className="search-bar-wrapper">
            <Search className="search-icon" size={20} />
            <input 
              type="text" 
              placeholder="Search for Idli batter, Dosa, Meals..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </form>
        </div>
      </section>

      {/* 3. Categories */}
      <section className="home-categories">
        <div className="container">
          <h2 className="section-title">Explore Categories</h2>
          <div className="category-scroll">
            <Link to="/ready-to-eat" className="cat-pill">
              <img src={resolveImagePath("assets/img/category/cat-new-1.webp")} alt="Ready to Eat" />
              <span>Ready To Eat</span>
            </Link>
            <Link to="/ready-to-cook" className="cat-pill">
              <img src={resolveImagePath("assets/img/category/cat-new-2.webp")} alt="Ready To Cook" />
              <span>Ready To Cook</span>
            </Link>
            <Link to="/batter-products" className="cat-pill">
              <img src={resolveImagePath("assets/img/category/cat-new-3.webp")} alt="Batters" />
              <span>Artisan Batters</span>
            </Link>
            <Link to="/bulk-orders" className="cat-pill">
              <img src={resolveImagePath("assets/img/category/cat-new-4.webp")} alt="Bulk Orders" />
              <span>Bulk Catering</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 4. Amma Recommends */}
      <section className="home-products">
        <div className="container">
          <div className="flex-between mb-15">
            <h2 className="section-title mb-0">Amma Recommends</h2>
            <Link to="/menu" className="view-all">View All →</Link>
          </div>
          <div className="product-scroll">
            {recommendedItems.map(item => (
              <div key={item.id} className="modern-food-card">
                <div className="food-img-wrapper" onClick={() => navigate('/menu')}>
                  <img src={resolveImagePath(item.image)} alt={item.name} />
                  <div className="food-time-badge">{item.deliveryTime}</div>
                </div>
                <div className="food-info">
                  <div className="food-rating">★ {item.rating}</div>
                  <h3 className="food-name">{item.name}</h3>
                  <div className="food-price-row">
                    <span className="food-price">₹{item.price}</span>
                    <button className="add-btn" onClick={() => addToCart(item, 1)}>ADD</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Best Sellers */}
      <section className="home-products">
        <div className="container">
          <div className="flex-between mb-15">
            <h2 className="section-title mb-0">Best Sellers</h2>
          </div>
          <div className="product-grid">
            {bestSellerItems.map(item => (
              <div key={item.id} className="modern-food-card">
                <div className="bestseller-badge">Best Seller</div>
                <div className="food-img-wrapper" onClick={() => navigate('/menu')}>
                  <img src={resolveImagePath(item.image)} alt={item.name} />
                </div>
                <div className="food-info">
                  <h3 className="food-name">{item.name}</h3>
                  <div className="food-price-row">
                    <span className="food-price">₹{item.price}</span>
                    <button className="add-btn outline" onClick={() => addToCart(item, 1)}>ADD</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Today's Special */}
      <section className="home-products">
        <div className="container">
          <div className="special-banner">
            <div className="special-content">
              <h3>Today's Special Combos</h3>
              <p>Save up to 20% on family packs!</p>
              <Link to="/offers" className="btn-light">Claim Offer</Link>
            </div>
            <img src={resolveImagePath("assets/img/hero/hero-10-1.webp")} alt="Special" className="special-img" />
          </div>
        </div>
      </section>

      {/* 7. Why Ammulu's Kitchen */}
      <section className="home-why">
        <div className="container text-center">
          <h2 className="section-title text-center">Why Ammulu's Kitchen?</h2>
          <div className="why-grid">
            <div className="why-item">
              <div className="why-icon">🍃</div>
              <h4>100% Natural</h4>
              <p>No preservatives or baking soda.</p>
            </div>
            <div className="why-item">
              <div className="why-icon">🪨</div>
              <h4>Stone Ground</h4>
              <p>Authentic traditional taste.</p>
            </div>
            <div className="why-item">
              <div className="why-icon">⏱️</div>
              <h4>Freshly Made</h4>
              <p>Prepared daily for your family.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Reviews */}
      <section className="home-reviews">
        <div className="container">
          <h2 className="section-title text-center">Loved By Chennai</h2>
          <div className="review-scroll">
            <div className="review-card">
              <div className="review-stars">★★★★★</div>
              <p>"The idlis come out incredibly soft and fluffy. Just like my mother used to make!"</p>
              <h5>- Mrs. Meenakshi S.</h5>
            </div>
            <div className="review-card">
              <div className="review-stars">★★★★★</div>
              <p>"Ragi batter is perfect for my diabetic diet. Perfectly fermented."</p>
              <h5>- Dr. Karthik Raja</h5>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
