import React, { useState, useEffect } from 'react';
import ProductCard from '../../components/ProductCard';
import SearchBar from '../../components/SearchBar';
import { Award, RefreshCw, Zap } from 'lucide-react';
import apiClient from '../../services/api';

const BATTER_PRODUCTS = [
  { 
    id: "bat-1", 
    name: "Premium Idli Dosa Batter", 
    price: 80.00, 
    stock: 205, 
    image: "assets/img/product/product_1_12.png", 
    unit: "1kg Pack", 
    description: "Perfectly balanced stone-ground rice and white urad dal batter. Yields pillow-soft idlis and paper-thin crispy dosas." 
  },
  { 
    id: "bat-2", 
    name: "Finger Millet (Ragi) Batter", 
    price: 55.00, 
    stock: 80, 
    image: "assets/img/product/product_1_11.png", 
    unit: "500g Pack", 
    description: "Probiotic finger millet ground slowly with split black gram. Probiotic-rich and high in iron." 
  },
  { 
    id: "bat-3", 
    name: "Sprouted Multigrain Batter", 
    price: 120.00, 
    stock: 8, 
    image: "assets/img/product/product_1_9.png", 
    unit: "1kg Pack", 
    description: "Healthy fermented batter made from sprouted green gram, millets, brown rice, and horse gram." 
  }
];

const COMPARISON_COLUMNS = [
  { name: "Attributes", key: "attr" },
  { name: "Classic Batter", key: "classic" },
  { name: "Ragi Batter", key: "ragi" },
  { name: "Sprouted Multigrain", key: "sprouted" }
];

const COMPARISON_ROWS = [
  { attr: "Fermentation Time", classic: "8 Hours", ragi: "10 Hours", sprouted: "6 Hours" },
  { attr: "Ingredients", classic: "Parboiled Rice, Urad Dal", ragi: "Finger Millet, Rice, Urad", sprouted: "Green Gram, Brown Rice, Horse Gram" },
  { attr: "Key Nutrients", classic: "Carbohydrates, Probiotics", ragi: "Calcium, Iron, High Fiber", sprouted: "Plant Protein, Micronutrients" },
  { attr: "Preservatives & Soda", classic: "0% (Zero Added)", ragi: "0% (Zero Added)", sprouted: "0% (Zero Added)" },
  { attr: "Best Suited For", classic: "Fluffy Idlis, Crispy Dosas", ragi: "Healthy Diet, Weight Loss", sprouted: "Fitness diet, Protein rich" }
];

import SEO from '../../components/SEO';

const BatterProducts = () => {
  const [search, setSearch] = useState('');
  const [batters, setBatters] = useState(BATTER_PRODUCTS);
  const [loading, setLoading] = useState(true);

  const fetchBatters = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/products/', { params: { category: 'batter_products' } });
      if (res.data && res.data.length > 0) {
        setBatters(res.data);
      }
    } catch (err) {
      console.error("Failed to load batter products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatters();
  }, []);

  const filtered = batters.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="batter-products-page space" style={{ backgroundColor: '#FCFBF7', minHeight: '80vh' }}>
      <SEO title="Fresh Probiotic Batters" description="Order stone-ground probiotic batters daily: Classic Idli, Crispy Dosa, Ragi, Multigrain, and Adai batters with zero soda." />
      <div className="container">
        
        {/* Banner Section */}
        <div className="title-area style9 text-center mb-40">
          <span className="sub-title">100% Probiotic & Organic</span>
          <h1 className="sec-title" style={{ fontSize: '2.8rem', color: 'var(--primary-dark)', marginTop: '8px' }}>
            Artisan Stone-Ground Batters
          </h1>
          <p className="text-muted" style={{ maxWidth: '700px', margin: '12px auto 0', fontSize: '1.05rem', lineHeight: '1.6' }}>
            Naturally fermented batters prepared daily in traditional stone grinders. Zero baking soda, zero chemical stabilizers, and zero preservatives.
          </p>
        </div>

        {/* Nutritional & Quality Badges */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '50px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #EAE6DB' }}>
            <div style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: 'var(--secondary-light)', color: 'var(--secondary-color)', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>
              <Award size={24} />
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 'bold', color: 'var(--text-dark)' }}>Naturally Fermented</h4>
              <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>8-10 Hours active natural process</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #EAE6DB' }}>
            <div style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>
              <RefreshCw size={24} />
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 'bold', color: 'var(--text-dark)' }}>Ground Fresh Daily</h4>
              <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Milled every morning at 4 AM</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #EAE6DB' }}>
            <div style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: 'rgba(255,193,7,0.1)', color: '#FFB300', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>
              <Zap size={24} />
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 'bold', color: 'var(--text-dark)' }}>Chemical Free</h4>
              <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Zero soda, yeast or preservatives</p>
            </div>
          </div>
        </div>

        {/* SECTION 1: SEARCH & PRODUCT LIST */}
        <div style={{ marginBottom: '80px' }}>
          <SearchBar value={search} onChange={setSearch} placeholder="Search batters (e.g. Idli, Dosa, Ragi, Millet)..." />

          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>Fetching artisan batters...</div>
          ) : filtered.length > 0 ? (
            <div className="grid-layout" style={{ marginTop: '30px' }}>
              {filtered.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-5">
              <p className="text-muted" style={{ fontSize: '1.2rem' }}>
                No fermented batter products matched your query.
              </p>
            </div>
          )}
        </div>

        {/* SECTION 2: BATTER COMPARISON MATRIX */}
        <div style={{ marginBottom: '80px' }}>
          <div className="title-area style9 text-center mb-40">
            <span className="sub-title">Comparison Matrix</span>
            <h2 className="sec-title" style={{ fontSize: '2rem', color: 'var(--primary-dark)' }}>Which Batter Suit Your Lifestyle?</h2>
          </div>

          <div style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid #EAE6DB', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--primary-color)', color: 'white' }}>
                    {COMPARISON_COLUMNS.map(col => (
                      <th key={col.key} style={{ padding: '16px 20px', fontWeight: '700', fontSize: '0.95rem' }}>{col.name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON_ROWS.map((row, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #EAE6DB', backgroundColor: idx % 2 === 0 ? 'transparent' : '#FAF9F6' }}>
                      <td style={{ padding: '16px 20px', fontWeight: '700', color: 'var(--text-dark)' }}>{row.attr}</td>
                      <td style={{ padding: '16px 20px', color: 'var(--text-muted)' }}>{row.classic}</td>
                      <td style={{ padding: '16px 20px', color: 'var(--text-muted)' }}>{row.ragi}</td>
                      <td style={{ padding: '16px 20px', color: 'var(--text-muted)' }}>{row.sprouted}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>



      </div>
    </div>
  );
};

export default BatterProducts;
export { BATTER_PRODUCTS };
