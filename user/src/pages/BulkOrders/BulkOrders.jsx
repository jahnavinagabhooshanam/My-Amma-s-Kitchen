import React, { useState, useEffect } from 'react';
import { Send, CheckCircle, Gem, CalendarHeart, Briefcase, Home, Flame } from 'lucide-react';
import apiClient from '../../services/api';
import SEO from '../../components/SEO';
import './BulkOrders.css';

// Using actual traditional food images from the project
import gal1 from '../../assets/img/product/product_1_1.webp';
import gal2 from '../../assets/img/product/product_1_5.webp';
import gal3 from '../../assets/img/product/product_1_7.webp';
import gal4 from '../../assets/img/product/product_1_2.webp';
import gal5 from '../../assets/img/product/product_1_3.webp';

const BulkOrders = () => {
  const [form, setForm] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    date: '',
    guests: '100',
    items: '',
    notes: '',
    eventType: 'Wedding'
  });

  const [products, setProducts] = useState([]);
  const [foodCategory, setFoodCategory] = useState(''); // 'Veg' or 'Non-Veg'
  const [selectedItems, setSelectedItems] = useState({}); // { id: { name, quantity } }

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await apiClient.get('/products/', { params: { limit: 200 } });
        if (res.data) {
          setProducts(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch products:", err);
      }
    };
    fetchProducts();
  }, []);

  const handleCheckboxChange = (product, isChecked) => {
    setSelectedItems(prev => {
      const newItems = { ...prev };
      if (isChecked) {
        newItems[product.id] = { name: product.name, quantity: parseInt(form.guests) || 100 };
      } else {
        delete newItems[product.id];
      }
      return newItems;
    });
  };

  const handleQuantityChange = (productId, qty) => {
    setSelectedItems(prev => {
      if (!prev[productId]) return prev;
      return {
        ...prev,
        [productId]: { ...prev[productId], quantity: qty }
      };
    });
  };

  const displayedProducts = products.filter(p => {
    // Exclude batters and ready_to_cook items
    const isBatter = ['traditional', 'millet', 'health', 'batter_products', 'family_packs', 'premium', 'ready_to_cook', 'ready-to-cook'].includes(p.category) || p.name.toLowerCase().includes('batter');
    if (isBatter) return false;

    const isNonVegItem = p.type === 'Non-Veg' || p.diet_type === 'Non-Veg' || (['chicken', 'mutton', 'fish', 'egg', 'prawn', 'crab', 'beef', 'pork', 'meat', 'biriyani', 'prawns'].some(keyword => p.name.toLowerCase().includes(keyword)) && !p.name.toLowerCase().includes('veg bir'));
    if (foodCategory === 'Veg') return !isNonVegItem;
    if (foodCategory === 'Non-Veg') return isNonVegItem;
    return false;
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const selectedItemsList = Object.values(selectedItems).map(item => `${item.name} (x${item.quantity})`).join(', ');
      const finalNotes = selectedItemsList ? `Selected Items: ${selectedItemsList}\n\nAdditional Notes: ${form.notes}` : form.notes;
      const finalPackage = form.items || (selectedItemsList ? 'Custom Selection' : 'Not specified');

      await apiClient.post('/bulk_orders', {
        customer_name: form.name,
        mobile: form.phone,
        email: form.email,
        event_type: form.eventType,
        event_date: form.date,
        guest_count: parseInt(form.guests),
        location: form.company || 'Chennai',
        food_package: finalPackage.substring(0, 250),
        special_request: finalNotes
      });
      setSubmitted(true);
      setForm({...form, items: '', notes: ''});
      setSelectedItems({});
      setFoodCategory('');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || 'Failed to submit quote request. Please try again.');
    }
  };

  return (
    <div className="bulk-page">
      <SEO title="Premium Catering & Feast Packages" description="Get a premium traditional catering quote from Hotel Ammulu's Kitchen." />
      
      {/* Hero Background wraps both form and text */}
      <div className="bulk-hero">
        
        {/* Inquiry Form at the very top */}
        <div className="container" style={{ position: 'relative', zIndex: 10 }}>
          <div className="bulk-form-container" id="quote-form">
            {submitted ? (
              <div className="text-center" style={{ padding: '40px 20px' }}>
                <CheckCircle size={56} style={{ color: '#008000', margin: '0 auto' }} />
                <h3 className="bulk-section-title" style={{ marginTop: '20px', fontSize: '2rem' }}>Inquiry Received!</h3>
                <p style={{ marginTop: '12px', fontSize: '1.1rem', color: '#666', lineHeight: '1.6' }}>
                  Thank you for choosing Hotel Ammulu's Kitchen. Our event coordinator is reviewing your requirements and will contact you within 3 hours.
                </p>
                <button onClick={() => setSubmitted(false)} className="th-btn mt-4" style={{ border: 'none', cursor: 'pointer', background: '#1A5D1A', color: 'white', padding: '12px 30px', borderRadius: '8px' }}>
                  Submit Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-2">
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                  <h3 className="bulk-section-title" style={{ margin: 0, fontSize: '2.2rem' }}>
                    Request A Proposal
                  </h3>
                  <p style={{ color: '#666', marginTop: '10px' }}>Fill in your event details and let us craft the perfect menu.</p>
                </div>

                <div className="row">
                  <div className="form-group col-md-6">
                    <label className="form-label" style={{ fontWeight: '600' }}>Full Name *</label>
                    <input type="text" className="form-control" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Rajesh Kumar" />
                  </div>
                  <div className="form-group col-md-6">
                    <label className="form-label" style={{ fontWeight: '600' }}>Event Location / Venue *</label>
                    <input type="text" className="form-control" required value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="e.g. Mylapore, Chennai" />
                  </div>
                </div>

                <div className="row">
                  <div className="form-group col-md-6">
                    <label className="form-label" style={{ fontWeight: '600' }}>Email Address *</label>
                    <input type="email" className="form-control" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="e.g. rajesh@example.com" />
                  </div>
                  <div className="form-group col-md-6">
                    <label className="form-label" style={{ fontWeight: '600' }}>Phone Number *</label>
                    <input type="tel" className="form-control" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="e.g. 9876543210" />
                  </div>
                </div>

                <div className="row">
                  <div className="form-group col-md-6">
                    <label className="form-label" style={{ fontWeight: '600' }}>Event Date *</label>
                    <input type="date" className="form-control" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                  </div>
                  <div className="form-group col-md-6">
                    <label className="form-label" style={{ fontWeight: '600' }}>Guest Count *</label>
                    <select className="form-control" value={form.guests} onChange={(e) => setForm({ ...form, guests: e.target.value })}>
                      <option value="50">50 - 100 Guests</option>
                      <option value="150">100 - 250 Guests</option>
                      <option value="350">250 - 500 Guests</option>
                      <option value="750">500 - 1000 Guests</option>
                      <option value="1500">1000+ Guests</option>
                    </select>
                  </div>
                </div>

                <div className="row" style={{ marginTop: '10px' }}>
                  <div className="form-group col-md-4">
                    <label className="form-label" style={{ fontWeight: '600' }}>Event Category *</label>
                    <select className="form-control" value={form.eventType} onChange={(e) => setForm({ ...form, eventType: e.target.value })}>
                      <option value="Wedding">Wedding feast</option>
                      <option value="Corporate">Corporate buffet</option>
                      <option value="Birthday">Birthday party</option>
                      <option value="Temple Event">Temple / Puja Event</option>
                      <option value="Housewarming">Housewarming</option>
                      <option value="Other">Other celebration</option>
                    </select>
                  </div>

                  <div className="form-group col-md-8">
                    <label className="form-label" style={{ fontWeight: '600' }}>Select Food Items</label>
                    <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                      <button 
                        type="button"
                        onClick={() => setFoodCategory(foodCategory === 'Veg' ? '' : 'Veg')}
                        style={{ 
                          flex: 1, padding: '10px', borderRadius: '8px', fontWeight: 'bold', 
                          border: foodCategory === 'Veg' ? '2px solid #27AE60' : '1px solid #DCECDC',
                          background: foodCategory === 'Veg' ? '#E8F5E9' : '#F5FAF5',
                          color: foodCategory === 'Veg' ? '#27AE60' : '#666',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                        }}
                      >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect x="0.5" y="0.5" width="15" height="15" rx="2" stroke={foodCategory === 'Veg' ? '#27AE60' : '#888'}/>
                          <circle cx="8" cy="8" r="4" fill={foodCategory === 'Veg' ? '#27AE60' : '#888'}/>
                        </svg>
                        Vegetarian
                      </button>
                      <button 
                        type="button"
                        onClick={() => setFoodCategory(foodCategory === 'Non-Veg' ? '' : 'Non-Veg')}
                        style={{ 
                          flex: 1, padding: '10px', borderRadius: '8px', fontWeight: 'bold', 
                          border: foodCategory === 'Non-Veg' ? '2px solid #E74C3C' : '1px solid #DCECDC',
                          background: foodCategory === 'Non-Veg' ? '#FDEDEC' : '#F5FAF5',
                          color: foodCategory === 'Non-Veg' ? '#E74C3C' : '#666',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                        }}
                      >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect x="0.5" y="0.5" width="15" height="15" rx="2" stroke={foodCategory === 'Non-Veg' ? '#E74C3C' : '#888'}/>
                          <path d="M8 4L12 11H4L8 4Z" fill={foodCategory === 'Non-Veg' ? '#E74C3C' : '#888'}/>
                        </svg>
                        Non-Vegetarian
                      </button>
                    </div>

                    {foodCategory && (
                      <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #DCECDC', borderRadius: '8px', padding: '15px', background: '#F5FAF5', marginBottom: '15px' }}>
                        {displayedProducts.length > 0 ? displayedProducts.map(p => (
                          <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #DCECDC' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                              <input 
                                type="checkbox" 
                                id={`item-${p.id}`}
                                checked={!!selectedItems[p.id]}
                                onChange={(e) => handleCheckboxChange(p, e.target.checked)}
                                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                              />
                              <label htmlFor={`item-${p.id}`} style={{ cursor: 'pointer', margin: 0, fontWeight: '500', color: '#333' }}>
                                {p.name}
                              </label>
                            </div>
                            {selectedItems[p.id] && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '12px', color: '#666' }}>Qty:</span>
                                <input 
                                  type="number" 
                                  min="1"
                                  value={selectedItems[p.id].quantity}
                                  onChange={(e) => handleQuantityChange(p.id, parseInt(e.target.value) || 1)}
                                  style={{ width: '70px', padding: '5px', borderRadius: '4px', border: '1px solid #ccc', textAlign: 'center' }}
                                />
                              </div>
                            )}
                          </div>
                        )) : (
                          <div style={{ textAlign: 'center', color: '#999', padding: '20px' }}>Loading items...</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: '600' }}>Additional Menu Preferences</label>
                  <input type="text" className="form-control" value={form.items} onChange={(e) => setForm({ ...form, items: e.target.value })} placeholder="e.g., Traditional South Indian Breakfast / Full Banana Leaf Lunch" />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: '600' }}>Special Inquiries or Requests</label>
                  <textarea rows="3" className="form-control" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="e.g., Need live counters for dosas, onion-free items needed..." />
                </div>

                <div className="form-btn" style={{ marginTop: '20px' }}>
                  <button type="submit" className="th-btn" style={{ background: '#1A5D1A', color: 'white', border: 'none', cursor: 'pointer', width: '100%', padding: '16px', borderRadius: '8px', fontSize: '1.1rem', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Send size={18} style={{ marginRight: '8px' }} /> Submit Catering Inquiry
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

      </div>

      {/* Event Types Section */}
      <div className="bulk-section" style={{ paddingTop: '20px' }}>
        <h2 className="bulk-section-title">Events We Cater</h2>
        <p className="bulk-section-subtitle">Tailored culinary experiences for every occasion</p>
        
        <div className="bulk-event-grid">
          <div className="bulk-event-card">
            <div className="bulk-event-icon"><Gem size={28} /></div>
            <div className="bulk-event-name">Weddings</div>
          </div>
          <div className="bulk-event-card">
            <div className="bulk-event-icon"><CalendarHeart size={28} /></div>
            <div className="bulk-event-name">Birthdays</div>
          </div>
          <div className="bulk-event-card">
            <div className="bulk-event-icon"><Briefcase size={28} /></div>
            <div className="bulk-event-name">Corporate</div>
          </div>
          <div className="bulk-event-card">
            <div className="bulk-event-icon"><Home size={28} /></div>
            <div className="bulk-event-name">Housewarming</div>
          </div>
          <div className="bulk-event-card">
            <div className="bulk-event-icon"><Flame size={28} /></div>
            <div className="bulk-event-name">Temple Events</div>
          </div>
        </div>
      </div>


      {/* Testimonials */}
      <div className="bulk-section" style={{ paddingBottom: '40px', paddingTop: '40px' }}>
        <h2 className="bulk-section-title">What Our Guests Say</h2>
        <p className="bulk-section-subtitle">Real experiences from our catered events</p>
        
        <div className="bulk-testimonials">
          <div className="bulk-test-card">
            <div className="bulk-test-quote">"The banana leaf service at our wedding was flawlessly executed. The food tasted exactly like authentic home cooking."</div>
            <div className="bulk-test-author">
              <div className="bulk-test-avatar">K</div>
              <div>
                <strong>Karthik & Priya</strong><br/><span style={{fontSize: '0.85rem', color: '#666'}}>Wedding Ceremony</span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default BulkOrders;
