import React, { useState, useEffect } from 'react';
import ProductCard from '../../components/ProductCard';
import SearchBar from '../../components/SearchBar';
import { Award, RefreshCw, Zap, Sparkles, Check } from 'lucide-react';
import apiClient from '../../services/api';

const RTC_PRODUCTS = [
  { id: "rtc-1", name: "Paneer Tikka Gravy Mix", cookingTime: "10 mins", shelfLife: "3 Months", price: 180.00, stock: 110, image: "assets/img/product/product_details_1_1.png", unit: "200g Pack", description: "Rich, creamy cashew and tomato onion gravy base. Add paneer cubes and serve hot." },
  { id: "rtc-2", name: "Sambar Paste Mix", cookingTime: "5 mins", shelfLife: "6 Months", price: 120.00, stock: 240, image: "assets/img/product/product_1_3.png", unit: "150g Pouch", description: "Traditional stone-ground sambar masala paste prepared with fresh coriander." },
  { id: "rtc-3", name: "Madras Curry Gravy Base", cookingTime: "12 mins", shelfLife: "4 Months", price: 160.00, stock: 15, image: "assets/img/product/product_1_7.png", unit: "250g Pack", description: "Spicy tamarind and coconut curry base suited for South Indian vegetable curries." },
  { id: "rtc-4", name: "Chettinad Masala Paste", cookingTime: "15 mins", shelfLife: "3 Months", price: 190.00, stock: 85, image: "assets/img/product/product_1_10.png", unit: "180g Pouch", description: "Fiery, pepper-loaded authentic Chettinad spice paste roasted in cold-pressed sesame oil." }
];

const BATTER_PRODUCTS = [
  { id: "bat-1", name: "Premium Idli Dosa Batter", price: 80.00, stock: 205, image: "assets/img/product/product_1_12.png", unit: "1kg Pack", description: "Perfect rice & urad dal batter. Yields soft idlis & crispy dosas." },
  { id: "bat-2", name: "Finger Millet (Ragi) Batter", price: 55.00, stock: 80, image: "assets/img/product/product_1_11.png", unit: "500g Pack", description: "Millet ground slowly with split black gram. Probiotic-rich and high in iron." },
  { id: "bat-3", name: "Sprouted Multigrain Batter", price: 120.00, stock: 8, image: "assets/img/product/product_1_9.png", unit: "1kg Pack", description: "Fermented batter made from sprouted green gram, millets, brown rice, and horse gram." }
];

import SEO from '../../components/SEO';

const ReadyToCook = () => {
  const [search, setSearch] = useState('');
  const [rtcItems, setRtcItems] = useState(RTC_PRODUCTS);
  const [batterItems, setBatterItems] = useState(BATTER_PRODUCTS);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/products/');
      const all = res.data;
      
      const rtcs = all.filter(p => p.category === 'ready-to-cook' || p.category === 'ready_to_cook');
      if (rtcs.length > 0) setRtcItems(rtcs);
      
      const batters = all.filter(p => p.category === 'batter-products' || p.category === 'batter_products');
      if (batters.length > 0) setBatterItems(batters);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredRTC = rtcItems.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.description.toLowerCase().includes(search.toLowerCase())
  );

  const filteredBatters = batterItems.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="ready-to-cook-page space" style={{ backgroundColor: '#FCFBF7', minHeight: '80vh' }}>
      <SEO title="Ready-to-Cook South Indian Gravies & Batters" description="Browse ready-to-cook South Indian curry pastes, gravies, and naturally fermented fresh batters with zero preservatives." />
      <div className="container">
        
        <div className="title-area style9 text-center mb-40">
          <span className="sub-title">Zero Labor Prep Kits & Fresh Batters</span>
          <h1 className="sec-title" style={{ fontSize: '2.5rem', color: 'var(--primary-dark)', marginTop: '8px' }}>
            Ready-to-Cook & Artisan Batters
          </h1>
          <p className="text-muted" style={{ maxWidth: '600px', margin: '12px auto 0' }}>
            Instant curry gravies, pure sambar concentrates, and naturally fermented batters. Gourmet dinners prepared in minutes at home.
          </p>
        </div>

        <SearchBar value={search} onChange={setSearch} placeholder="Search curry packs or batters (e.g. Sambar, Paneer, Idli, Dosa)..." />

        {loading && <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>Fetching fresh menu items...</div>}

        {!loading && (
          <>
            {/* Ready to Cook Section */}
            <div style={{ marginTop: '50px', marginBottom: '40px' }}>
              <h3 style={{ fontSize: '1.8rem', color: 'var(--primary-dark)', borderBottom: '2px solid #EAE6DB', paddingBottom: '10px', marginBottom: '20px' }}>Curry Pastes & Gravies</h3>
              {filteredRTC.length > 0 ? (
                <div className="centered-food-grid">
                  {filteredRTC.map(product => <ProductCard key={product.id} product={product} />)}
                </div>
              ) : (
                <p className="text-muted">No ready-to-cook items matched your search query.</p>
              )}
            </div>

            {/* Batter Products Section */}
            <div style={{ marginBottom: '40px' }}>
              <h3 style={{ fontSize: '1.8rem', color: 'var(--primary-dark)', borderBottom: '2px solid #EAE6DB', paddingBottom: '10px', marginBottom: '20px' }}>Stone-Ground Batters</h3>
              
              {/* Badges */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', backgroundColor: 'white', padding: '15px', borderRadius: '12px', border: '1px solid #EAE6DB' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--secondary-light)', color: 'var(--secondary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Award size={20} />
                  </div>
                  <div><h4 style={{ margin: 0, fontSize: '1rem' }}>Naturally Fermented</h4></div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', backgroundColor: 'white', padding: '15px', borderRadius: '12px', border: '1px solid #EAE6DB' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <RefreshCw size={20} />
                  </div>
                  <div><h4 style={{ margin: 0, fontSize: '1rem' }}>Ground Fresh Daily</h4></div>
                </div>
              </div>

              {filteredBatters.length > 0 ? (
                <div className="centered-food-grid">
                  {filteredBatters.map(product => <ProductCard key={product.id} product={product} />)}
                </div>
              ) : (
                <p className="text-muted">No batters matched your search query.</p>
              )}
            </div>
          </>
        )}

      </div>
    </div>
  );
};

export default ReadyToCook;
export { RTC_PRODUCTS };
