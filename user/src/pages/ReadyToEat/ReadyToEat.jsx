import React, { useState, useEffect } from 'react';
import FoodCard from '../../components/FoodCard';
import SEO from '../../components/SEO';
import SearchBar from '../../components/SearchBar';
import Filters from '../../components/Filters';
import apiClient from '../../services/api';

const RTE_PRODUCTS = [
  { id: "rte-1", name: "Mysore Masala Dosa", category: "Breakfast", type: "Veg", price: 149, stock: 120, image: "assets/img/product/product_1_1.png", unit: "Plate", description: "Crispy dosa with red garlic chutney and spiced potato masala filling." },
  { id: "rte-2", name: "Ghee Roast Dosa", category: "Breakfast", type: "Veg", price: 169, stock: 95, image: "assets/img/product/product_1_2.png", unit: "Plate", description: "Golden crispy dosa prepared with pure home-churned ghee." },
  { id: "rte-3", name: "Idli Vada Combo", category: "Breakfast", type: "Veg", price: 129, stock: 150, image: "assets/img/product/product_1_3.png", unit: "Plate", description: "Two steaming soft idlis and one crispy medu vada served with sambar." },
  { id: "rte-4", name: "Classic Pongal", category: "Breakfast", type: "Veg", price: 119, stock: 80, image: "assets/img/product/product_1_4.png", unit: "Plate", description: "Hot ghee khara pongal spiced with black pepper, cumin, and cashews." },
  { id: "rte-5", name: "Premium Mini Tiffin", category: "Breakfast", type: "Veg", price: 179, stock: 70, image: "assets/img/product/product_1_5.png", unit: "Plate", description: "Sampler plate containing one idli, mini pongal, mini kesari, and one mini dosa." },
  { id: "rte-6", name: "Chicken Biryani", category: "Main Course", type: "Non-Veg", price: 239, stock: 45, image: "assets/img/product/product_1_7.png", unit: "Portion", description: "Homestyle basmati chicken biryani slow-cooked with fresh mint and spices." },
  { id: "rte-7", name: "Mutton Biryani", category: "Main Course", type: "Non-Veg", price: 279, stock: 12, image: "assets/img/product/product_1_8.png", unit: "Portion", description: "Tender local mutton layered with aromatic ghee rice, slow cooked on dum." }
];

const ReadyToEat = () => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [products, setProducts] = useState(RTE_PRODUCTS);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/products/', { params: { category: 'ready_to_eat' } });
      if (res.data && res.data.length > 0) {
        // Map backend properties if needed (type, category fields matching storefront breakfast/main course)
        const mapped = res.data.map(p => ({
          ...p,
          type: p.name.toLowerCase().includes('chicken') || p.name.toLowerCase().includes('mutton') ? 'Non-Veg' : 'Veg',
          category: p.name.toLowerCase().includes('biryani') || p.name.toLowerCase().includes('parotta') ? 'Main Course' : 'Breakfast'
        }));
        setProducts(mapped);
      }
    } catch (err) {
      console.error("Failed to fetch ready to eat products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filterOptions = [
    { label: "All Items", value: "All" },
    { label: "Breakfast (Tiffins)", value: "Breakfast" },
    { label: "Main Course (Biryanis)", value: "Main Course" }
  ];

  const filtered = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                          p.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'All' || p.category === category;
    return matchesSearch && matchesCategory;
  });


  return (
    <div className="ready-to-eat-page space" style={{ backgroundColor: '#FCFBF7', minHeight: '80vh' }}>
      <SEO title="Ready-to-Eat South Indian Menu" description="Order hot, fresh South Indian ready-to-eat meals online including Mysore Masala Dosa, Ghee Roast Dosa, Idli Vada combos, and Basmati Biryanis." />
      <div className="container">
        
        <div className="title-area style9 text-center mb-40">
          <span className="sub-title">Freshly Prepared Hot Food</span>
          <h1 className="sec-title" style={{ fontSize: '2.5rem', color: 'var(--primary-dark)', marginTop: '8px' }}>
            Ready-to-Eat Delicacies
          </h1>
          <p className="text-muted" style={{ maxWidth: '600px', margin: '12px auto 0' }}>
            Steaming tiffin plates, fluffy idlis, crispy dosas, and aromatic dum biryanis cooked fresh on order with pristine quality ingredients.
          </p>
        </div>

        <SearchBar value={search} onChange={setSearch} placeholder="Search hot dishes (e.g., Dosa, Biryani, Pongal)..." />
        
        <Filters activeFilter={category} onFilterChange={setCategory} options={filterOptions} />

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>Fetching fresh ready-to-eat menu...</div>
        ) : filtered.length > 0 ? (
          <div className="centered-food-grid" style={{ 
            marginTop: '30px' 
          }}>
            {filtered.map(product => (
              <FoodCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-5">
            <p className="text-muted" style={{ fontSize: '1.2rem', fontFamily: "'Jost', sans-serif" }}>
              No hot ready-to-eat dishes matched your criteria.
            </p>
          </div>
        )}

      </div>
    </div>
  );
};

export default ReadyToEat;
export { RTE_PRODUCTS };
