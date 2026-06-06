import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import CategoryCard from '../../components/CategoryCard';
import SEO from '../../components/SEO';
import FoodCard from '../../components/FoodCard';
import { resolveImagePath } from '../../components/FoodCard';
import { useCart } from '../../context/CartContext';
import './Home.css';
import apiClient from '../../services/api';
import OfferPopup from '../../components/OfferPopup';

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
  { name: "Mrs. Meenakshi Sundaram,", desig: "Mylapore, Chennai", rating: 5, text: "“Amma's Classic Batter is a lifesaver. The idlis come out incredibly soft and fluffy, exactly like my mother used to grind in the stone mortar. My kids enjoy the crispy ghee roast dosa every weekend.”" },
  { name: "Dr. Karthik Raja,", desig: "Adyar, Chennai", rating: 5, text: "“The Ragi Batter is perfect for my healthy diabetic breakfast diet. It is completely natural, sour-fermented just right, and absolutely free of baking soda. The delivery is extremely prompt.”" },
  { name: "Rajesh & Kavitha,", desig: "IT Corridor, OMR", rating: 5, text: "“We ordered the family bulk catering for our housewarming function. The live dosa counter was a stellar success. Pristine hygiene, premium ingredients, and authentic South Indian tastes.”" }
];

const Home = () => {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  
  const [activeSlide, setActiveSlide] = useState(0);
  const [activeTesti, setActiveTesti] = useState(0);
  const [activePopupOffer, setActivePopupOffer] = useState(null);

  const [readyToEatItems, setReadyToEatItems] = useState([]);
  const [batterItems, setBatterItems] = useState([]);
  const [readyToCookItems, setReadyToCookItems] = useState([]);

  const [config, setConfig] = useState({
    headline: "Slow Stone-Ground Heritage Batters",
    opening_hours: "6am to 10pm",
    contact_phone: "+91 98765 43210",
    contact_email: "orders@ammaskitchen.com",
    about_us: "Hotel Amma's Kitchen serves traditional stone-ground batters, ready-to-cook delicacies, and hot ready-to-eat vegetarian meals prepared with absolute cleanliness and natural flavor."
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
      <OfferPopup offer={activePopupOffer} />
      <SEO title="Home" />
      
      {/* Swiper Hero Slider Area */}
      <div className="th-hero-wrapper hero-10" style={{ backgroundImage: `url(${resolveImagePath('assets/img/bg/hero-10-shape.png')})` }}>
        <div className="container-fluid p-0 hero-10-container">
          <div className="swiper th-slider">
            <div className="swiper-wrapper">
              <div className="swiper-slide swiper-slide-active" style={{ opacity: 1, transition: 'all 0.5s ease-in-out' }}>
                <div className="hero-inner">
                  <div className="row gy-40 gx-80 align-items-center">
                    <div className="col-xl-6 col-lg-6">
                      <div className="hero-style10">
                        <h1 className="hero-title" style={{ animation: 'none' }}>
                          {activeSlide === 0 ? (config.headline || HERO_SLIDES[0].title) : HERO_SLIDES[activeSlide].title}
                        </h1>
                        <p className="hero-text me-xl-5 pe-xxl-5">
                          {HERO_SLIDES[activeSlide].text}
                        </p>
                        <div className="btn-group">
                          <Link to="/ready-to-eat" className="th-btn th-icon style11">
                            Order Food <i className="fa-light fa-arrow-right"></i>
                          </Link>
                          <Link to="/batter-products" className="th-btn th-icon style10">
                            Explore Batters <i className="fa-light fa-arrow-right"></i>
                          </Link>
                        </div>
                      </div>
                    </div>
                    <div className="col-xl-6 col-lg-6">
                      <div className="hero10-img">
                        <div className="img-main" style={{ WebkitMaskImage: `url(${resolveImagePath('assets/img/bg/hero10-mask.png')})`, maskImage: `url(${resolveImagePath('assets/img/bg/hero10-mask.png')})`, WebkitMaskSize: 'contain', maskSize: 'contain', WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat', WebkitMaskPosition: 'center', maskPosition: 'center' }}>
                          <img src={resolveImagePath(HERO_SLIDES[activeSlide].img)} alt="Steaming South Indian Platter" style={{ width: '100%', height: '100%', objectFit: 'cover' }} className="zoom-anim-img" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>



        </div>
      </div>



      {/* Decorative Brand Categories Grid */}
      <section className="category-sec-4 space overflow-hidden">
        <div className="container">
          <div className="title-area style9 text-center mb-60">
            <span className="sub-title">Food Category</span>
            <h2 className="sec-title">Homestyle South Indian Specialties</h2>
          </div>
          <div className="centered-food-grid">
            <div className="category-card style-dark">
              <div className="dark-card-bg">
                <img src={resolveImagePath("assets/img/category/cat-new-1.webp")} alt="Ready to Eat" />
              </div>
              <div className="dark-card-overlay"></div>
              


              <div className="dark-card-content">
                <h3 className="box-title">Ready to Eat</h3>
                <p className="box-subtitle">Hot fresh tiffin plates</p>
                <Link to="/ready-to-eat" className="dark-card-btn">
                  Explore Menu
                </Link>
              </div>
            </div>
            <div className="category-card style-dark">
              <div className="dark-card-bg">
                <img src={resolveImagePath("assets/img/category/cat-new-2.webp")} alt="Ready to Cook" />
              </div>
              <div className="dark-card-overlay"></div>
              


              <div className="dark-card-content">
                <h3 className="box-title">Ready to Cook</h3>
                <p className="box-subtitle">Smart prep kits & stone-ground batters</p>
                <Link to="/ready-to-cook" className="dark-card-btn">
                  Explore Menu
                </Link>
              </div>
            </div>
            <div className="category-card style-dark">
              <div className="dark-card-bg">
                <img src={resolveImagePath("assets/img/category/cat-new-4.webp")} alt="Bulk Orders" />
              </div>
              <div className="dark-card-overlay"></div>
              


              <div className="dark-card-content">
                <h3 className="box-title">Bulk Orders</h3>
                <p className="box-subtitle">Premium custom tiffin catering</p>
                <Link to="/bulk-orders" className="dark-card-btn">
                  Explore Menu
                </Link>
              </div>
            </div>
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

      {/* Featured Ready to Eat Section */}
      <section className="food-sec-1 space overflow-hidden" style={{ backgroundColor: '#FCFBF7' }}>
        <div className="container">
          <div className="title-area style9 text-center mb-40">
            <span className="sub-title">Premium South Indian Delicacies</span>
            <h2 className="sec-title">Featured Ready-To-Eat Meals</h2>
            <p className="text-muted" style={{ maxWidth: '600px', margin: '12px auto 0' }}>
              Authentic, piping-hot tiffins, multi-layered parotta combos, and aromatic slow-cooked biryanis prepared with pure cow ghee.
            </p>
          </div>
          <div className="swiper th-slider">
            <div className="swiper-wrapper grid-layout grid-auto-fit">
              {readyToEatItems.map((item) => (
                <FoodCard key={item.id} product={item} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Batter Products Section (Premium Segment) */}
      <section className="space overflow-hidden" id="batter-sec" style={{ backgroundColor: '#FAF8F0', borderTop: '1px solid #EAE6DB', borderBottom: '1px solid #EAE6DB' }}>
        <div className="container">
          <div className="title-area style9 text-center mb-40">
            <span className="sub-title">100% Stone-Ground & Probiotic</span>
            <h2 className="sec-title">Fresh Artisan Batter Showcase</h2>
            <p className="text-muted" style={{ maxWidth: '600px', margin: '12px auto 0' }}>
              Naturally fermented for 8 hours with zero chemicals, soda, or preservatives. Ground daily under strict sanitary guidelines.
            </p>
          </div>
          
          <div className="grid-auto-fit" style={{ gap: '30px' }}>
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
                  border: '1px solid #EAE6DB', 
                  borderRadius: '16px', 
                  padding: '24px', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'space-between',
                  transition: 'var(--transition)'
                }}>
                  {/* Badges */}
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                    <span style={{ 
                      backgroundColor: 'var(--secondary-light)', 
                      color: 'var(--secondary-color)', 
                      fontSize: '0.75rem', 
                      fontWeight: '600', 
                      padding: '4px 10px', 
                      borderRadius: '9999px',
                      fontFamily: 'var(--font-sans)'
                    }}>
                      🍃 Freshly Ground
                    </span>
                    <span style={{ 
                      backgroundColor: 'var(--primary-light)', 
                      color: 'var(--primary-color)', 
                      fontSize: '0.75rem', 
                      fontWeight: '600', 
                      padding: '4px 10px', 
                      borderRadius: '9999px',
                      fontFamily: 'var(--font-sans)'
                    }}>
                      🛡️ No Preservatives
                    </span>
                  </div>

                  {/* Image */}
                  <div style={{ 
                    height: '180px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    backgroundColor: '#FCFBF7', 
                    borderRadius: '12px',
                    marginBottom: '16px',
                    overflow: 'hidden'
                  }}>
                    <img src={resolveImagePath(item.image)} alt={item.name} style={{ maxHeight: '100%', objectFit: 'contain' }} />
                  </div>

                  {/* Details */}
                  <h3 style={{ 
                    fontFamily: 'var(--font-serif)', 
                    fontSize: '1.4rem', 
                    fontWeight: '700', 
                    color: 'var(--primary-dark)',
                    marginBottom: '8px'
                  }}>{item.name}</h3>
                  
                  <p style={{ 
                    fontSize: '0.85rem', 
                    color: 'var(--text-muted)', 
                    lineHeight: '1.4', 
                    marginBottom: '16px',
                    minHeight: '60px'
                  }}>{item.description}</p>

                  {/* Pricing & Size Selection */}
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    borderTop: '1px solid #EAE6DB', 
                    paddingTop: '16px',
                    marginTop: 'auto'
                  }}>
                    <div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Choose Pack Size:</span>
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
                              border: selectedSize === size ? '1px solid var(--primary-color)' : '1px solid #EAE6DB',
                              backgroundColor: selectedSize === size ? 'var(--primary-light)' : '#FFFFFF',
                              color: selectedSize === size ? 'var(--primary-color)' : 'var(--text-dark)',
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
                        fontFamily: 'var(--font-sans)', 
                        fontSize: '1.6rem', 
                        fontWeight: '700', 
                        color: 'var(--text-dark)' 
                      }}>
                        ₹{finalPrice}
                      </div>
                      <button 
                        onClick={handleAddBatter} 
                        className="th-btn" 
                        style={{ 
                          padding: '8px 16px', 
                          fontSize: '0.85rem', 
                          border: 'none', 
                          cursor: 'pointer',
                          marginTop: '6px'
                        }}
                      >
                        Add
                      </button>
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
        <div className="container">
          <div className="title-area style9 text-center mb-40">
            <span className="sub-title">Zero Labor Home Prep</span>
            <h2 className="sec-title">Ready-To-Cook Smart Meal Kits</h2>
            <p className="text-muted" style={{ maxWidth: '600px', margin: '12px auto 0' }}>
              Prepared with high-quality ingredients, portion-controlled, and packed under sterile vacuum conditions. Just heat or fry and serve hot.
            </p>
          </div>

          <div className="grid-auto-fit" style={{ gap: '30px' }}>
            {readyToCookItems.map((item) => {
              const handleAddRTC = (e) => {
                e.preventDefault();
                addToCart(item, 1);
              };

              return (
                <div className="card meal-kit-card" key={item.id} style={{ 
                  backgroundColor: '#FFFFFF', 
                  border: '1px solid #EAE6DB', 
                  borderRadius: '16px', 
                  padding: '24px', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'space-between',
                  transition: 'var(--transition)'
                }}>
                  {/* Product Image */}
                  <div style={{ 
                    height: '180px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    backgroundColor: '#FCFBF7', 
                    borderRadius: '12px',
                    marginBottom: '16px',
                    overflow: 'hidden'
                  }}>
                    <img src={resolveImagePath(item.image)} alt={item.name} style={{ maxHeight: '100%', objectFit: 'contain' }} />
                  </div>

                  {/* Details */}
                  <h3 style={{ 
                    fontFamily: 'var(--font-serif)', 
                    fontSize: '1.3rem', 
                    fontWeight: '700', 
                    color: 'var(--primary-dark)',
                    marginBottom: '8px'
                  }}>{item.name}</h3>

                  <p style={{ 
                    fontSize: '0.85rem', 
                    color: 'var(--text-muted)', 
                    lineHeight: '1.4', 
                    marginBottom: '12px',
                    minHeight: '40px'
                  }}>{item.description}</p>

                  {/* Metrics */}
                  <div className="grid-auto-fit" style={{ 
                    gap: '24px', 
                    marginTop: '20px',
                    backgroundColor: '#FCFBF7', 
                    borderRadius: '8px', 
                    padding: '10px', 
                    marginBottom: '16px',
                    fontSize: '0.75rem',
                    border: '1px solid #EAE6DB'
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ color: 'var(--text-muted)' }}>⏱️ Prep Time</div>
                      <div style={{ fontWeight: '700', color: 'var(--text-dark)' }}>{item.cookingTime}</div>
                    </div>
                    <div style={{ textAlign: 'center', borderLeft: '1px solid #EAE6DB', borderRight: '1px solid #EAE6DB' }}>
                      <div style={{ color: 'var(--text-muted)' }}>🍽️ Serves</div>
                      <div style={{ fontWeight: '700', color: 'var(--text-dark)' }}>{item.servingSize}</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ color: 'var(--text-muted)' }}>❄️ Shelf Life</div>
                      <div style={{ fontWeight: '700', color: 'var(--text-dark)' }}>{item.shelfLife}</div>
                    </div>
                  </div>

                  {/* Price and Add to Cart */}
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    marginTop: 'auto',
                    borderTop: '1px solid #EAE6DB', 
                    paddingTop: '16px'
                  }}>
                    <div style={{ 
                      fontFamily: 'var(--font-sans)', 
                      fontSize: '1.4rem', 
                      fontWeight: '700', 
                      color: 'var(--text-dark)' 
                    }}>
                      ₹{item.price.toFixed(2)}
                    </div>
                    <button 
                      onClick={handleAddRTC} 
                      className="th-btn" 
                      style={{ 
                        padding: '10px 20px', 
                        fontSize: '0.85rem', 
                        border: 'none', 
                        cursor: 'pointer' 
                      }}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Carousel Section */}
      <section className="testi-sec-10 overflow-hidden space overflow-hidden" style={{ backgroundColor: '#1E1D19' }}>
        <div className="container">
          <div className="title-area style9 text-center mb-40">
            <span className="sub-title text-theme2">Patron Reviews</span>
            <h2 className="sec-title text-white">Loved by Our Community</h2>
          </div>
          <div className="testi-slider10">
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
        <div className="container">
          <div className="row gx-80 gy-30 align-items-center justify-content-center">
            <div className="col-xl-6">
              <div className="title-area style9 mb-4">
                <span className="sub-title">Bulk & Commercial Catering</span>
                <h2 className="sec-title">Catering Solutions for Every Occasion</h2>
                <p className="text-muted" style={{ marginTop: '8px', fontSize: '0.9rem', lineHeight: '1.4' }}>
                  Amma provides premium catering services across Chennai:
                </p>
                <div className="grid-auto-sm" style={{ marginTop: '12px', color: 'var(--text-dark)', fontWeight: '600', fontSize: '0.9rem' }}>
                  <div>🌸 Wedding Catering</div>
                  <div>💼 Corporate Events</div>
                  <div>🎂 Birthday Functions</div>
                  <div>🏫 School Events</div>
                  <div>🎓 College Events</div>
                  <div>🏡 Family Celebrations</div>
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
