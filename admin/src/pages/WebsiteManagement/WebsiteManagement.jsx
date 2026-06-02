import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminNavbar from '../../components/AdminNavbar';
import apiClient from '../../services/api';
import '../../assets/styles/admin-style.css';
import '../../assets/styles/tables.css';
import { CheckCircle, AlertTriangle, Monitor, Utensils, FileText, Image, CloudUpload, PlusCircle, Upload, Copy, X, Save } from 'lucide-react';

const resolveImagePath = (path) => {
  if (!path) return '/assets/images/placeholder.jpg';
  let clean = path;

  if (clean.startsWith('http')) return clean;

  // Route backend-provided admin assets or local relative assets to the backend server
  if (clean.startsWith('/assets/') || clean.startsWith('assets/') || clean.startsWith('/api/assets/')) {
    if (clean.startsWith('/api/assets/')) {
      clean = clean.substring(12);
    } else if (clean.startsWith('assets/')) {
      clean = clean.substring(7);
    } else if (clean.startsWith('/assets/')) {
      clean = clean.substring(8);
    }
    return `http://localhost:5000/assets/${clean}`;
  }

  // Handle uploaded files
  if (clean.startsWith('/uploads/') || clean.startsWith('uploads/')) {
    if (clean.startsWith('/')) clean = clean.substring(1);
    return `http://localhost:5000/${clean}`;
  }

  return clean;
};

const WebsiteManagement = () => {
  const [config, setConfig] = useState({
    banner: '',
    headline: '',
    popup_title: '',
    popup_message: '',
    opening_hours: '',
    contact_phone: '',
    contact_email: '',
    social_facebook: '',
    social_instagram: '',
    social_twitter: '',
    footer_text: '',
    categories: '',
    hero_cta_label: '',
    hero_cta_link: '',
    hero_bg_image: '',
    show_promo_popup: true,
    show_featured_review: true,
    show_recipe_suggest: true,
    about_us: '',
    whatsapp_number: ''
  });

  const [products, setProducts] = useState([]);
  const [batterVariants, setBatterVariants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Tabs
  const [activeTab, setActiveTab] = useState('hero'); // 'hero', 'catalog', 'content', 'media'
  const [catalogSubTab, setCatalogSubTab] = useState('standard'); // 'standard', 'batter'

  // Product Modals & Forms
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isEditingProduct, setIsEditingProduct] = useState(false);
  const [currentProduct, setCurrentProduct] = useState({
    id: null,
    name: '',
    description: '',
    price: '',
    offer_price: '',
    category: 'ready_to_eat', // 'ready_to_eat', 'ready_to_cook'
    image: '',
    stock: 50,
    is_available: true
  });

  const [isBatterModalOpen, setIsBatterModalOpen] = useState(false);
  const [isEditingBatter, setIsEditingBatter] = useState(false);
  const [currentBatter, setCurrentBatter] = useState({
    id: null,
    product_name: '',
    variant: '1kg Pouch',
    weight: '1kg',
    price: '',
    offer_price: '',
    stock: 50,
    expiry_date: '',
    manufacture_date: '',
    image: ''
  });

  // Media upload state
  const [mediaList, setMediaList] = useState([]);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);

  const fetchConfigData = async () => {
    setLoading(true);
    try {
      const configRes = await apiClient.get('/admin/website-config');
      setConfig(configRes.data);

      const productsRes = await apiClient.get('/products/');
      setProducts(productsRes.data);

      const batterRes = await apiClient.get('/products/batter-variants');
      setBatterVariants(batterRes.data);

      // Fetch dynamic media list from the backend uploads directory
      try {
        const mediaRes = await apiClient.get('/products/media');
        setMediaList(mediaRes.data);
      } catch (mediaErr) {
        console.error("Failed to load dynamic media files:", mediaErr);
        // Fallback to static mock images if backend fails
        setMediaList([
          { name: 'Artisan Batter Hero', url: '/assets/img/hero-bg.jpg' },
          { name: 'Hotel Amma Logo', url: '/assets/img/cropped-logo.webp' },
          { name: 'Idli Batter Tub', url: '/assets/img/batter-idli.jpg' },
          { name: 'Paneer Butter Masala RTE', url: '/assets/img/paneer-rte.jpg' }
        ]);
      }
    } catch (err) {
      console.error("Failed to load control center data:", err);
      setErrorMsg("Failed to load storefront configuration details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigData();
  }, []);

  const handleSaveConfig = async (e) => {
    e.preventDefault();
    setIsSaved(false);
    setErrorMsg('');
    try {
      await apiClient.post('/admin/website-config', config);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 4000);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to save website configuration.");
    }
  };

  // Product CRUD
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      const payload = {
        name: currentProduct.name,
        description: currentProduct.description,
        price: parseFloat(currentProduct.price),
        offer_price: currentProduct.offer_price ? parseFloat(currentProduct.offer_price) : null,
        category: currentProduct.category,
        image: currentProduct.image || '/assets/images/placeholder.jpg',
        stock: parseInt(currentProduct.stock || 0),
        is_available: currentProduct.is_available
      };

      if (isEditingProduct) {
        await apiClient.put(`/products/${currentProduct.id}`, payload);
        setSuccessMsg(`Product "${payload.name}" updated successfully.`);
      } else {
        await apiClient.post('/products/', payload);
        setSuccessMsg(`Product "${payload.name}" added to catalog.`);
      }

      setIsProductModalOpen(false);
      // Reload products
      const productsRes = await apiClient.get('/products/');
      setProducts(productsRes.data);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to save product.");
    }
  };

  const handleEditProductClick = (p) => {
    setIsEditingProduct(true);
    setCurrentProduct({
      id: p.id,
      name: p.name,
      description: p.description,
      price: p.price,
      offer_price: p.offer_price || '',
      category: p.category?.replace('-', '_') || 'ready_to_eat',
      image: p.image,
      stock: p.stock_count || p.stock || 50,
      is_available: p.in_stock || p.is_available
    });
    setIsProductModalOpen(true);
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await apiClient.delete(`/products/${productId}`);
      setSuccessMsg("Product deleted successfully.");
      const productsRes = await apiClient.get('/products/');
      setProducts(productsRes.data);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to delete product.");
    }
  };

  // Batter CRUD
  const handleBatterSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      const payload = {
        product_name: currentBatter.product_name,
        variant: currentBatter.variant,
        weight: currentBatter.weight,
        price: parseFloat(currentBatter.price),
        offer_price: currentBatter.offer_price ? parseFloat(currentBatter.offer_price) : null,
        stock: parseInt(currentBatter.stock || 0),
        expiry_date: currentBatter.expiry_date,
        manufacture_date: currentBatter.manufacture_date,
        image: currentBatter.image || '/assets/images/placeholder.jpg'
      };

      if (isEditingBatter) {
        await apiClient.put(`/products/batter-variants/${currentBatter.id}`, payload);
        setSuccessMsg(`Batter variant "${payload.product_name}" updated.`);
      } else {
        await apiClient.post('/products/batter-variants', payload);
        setSuccessMsg(`Batter variant "${payload.product_name}" created.`);
      }

      setIsBatterModalOpen(false);
      // Reload batters
      const batterRes = await apiClient.get('/products/batter-variants');
      setBatterVariants(batterRes.data);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to save batter variant.");
    }
  };

  const handleEditBatterClick = (b) => {
    setIsEditingBatter(true);
    setCurrentBatter({
      id: b.id,
      product_name: b.product_name,
      variant: b.variant,
      weight: b.weight,
      price: b.price,
      offer_price: b.offer_price || '',
      stock: b.stock || 50,
      expiry_date: b.expiry_date || '',
      manufacture_date: b.manufacture_date || '',
      image: b.image || ''
    });
    setIsBatterModalOpen(true);
  };

  const handleDeleteBatter = async (batterId) => {
    if (!window.confirm("Are you sure you want to delete this batter variant?")) return;
    try {
      await apiClient.delete(`/products/batter-variants/${batterId}`);
      setSuccessMsg("Batter variant deleted successfully.");
      const batterRes = await apiClient.get('/products/batter-variants');
      setBatterVariants(batterRes.data);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to delete batter variant.");
    }
  };

  // Media upload
  const handleMediaUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingMedia(true);
    setErrorMsg('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await apiClient.post('/products/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const newMedia = {
        name: file.name,
        url: response.data.image_url
      };
      setMediaList(prev => [newMedia, ...prev]);
      setSuccessMsg("Media file uploaded successfully.");
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to upload media file.");
    } finally {
      setUploadingMedia(false);
    }
  };

  const [successMsg, setSuccessMsg] = useState('');

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="admin-wrapper">
      <AdminSidebar />
      <div className="admin-container">
        <AdminNavbar />

        <div className="admin-content">
          <div className="page-header">
            <div className="page-title-area">
              <h2>Website Control Center</h2>
              <p>Configure client-facing announcement banners, modify Hero slides, manage food catalogs, and upload media assets.</p>
            </div>
          </div>

          {isSaved && (
            <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#e2ebd9', color: '#1b3d2b', border: '1px solid var(--border-color)', padding: '12px 18px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', marginBottom: '20px' }}>
              <CheckCircle size={16} style={{ marginRight: '6px' }} /> Storefront configuration saved and live on user site!
            </div>
          )}

          {successMsg && (
            <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#e2ebd9', color: '#1b3d2b', border: '1px solid var(--border-color)', padding: '12px 18px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', marginBottom: '20px' }}>
              <CheckCircle size={16} style={{ marginRight: '6px' }} /> {successMsg}
            </div>
          )}

          {errorMsg && (
            <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#fcdcd8', color: 'var(--danger-color)', border: '1px solid #f8b4ac', padding: '12px 18px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', marginBottom: '20px' }}>
              <AlertTriangle size={16} style={{ marginRight: '6px' }} /> {errorMsg}
            </div>
          )}

          {/* Website Control Center Navigation Tabs */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '25px', borderBottom: '2px solid #EAE6DB', paddingBottom: '10px' }}>
            <button 
              onClick={() => setActiveTab('hero')}
              style={{
                padding: '10px 20px', fontSize: '13px', fontWeight: '700', borderRadius: '8px', border: 'none', cursor: 'pointer',
                backgroundColor: activeTab === 'hero' ? 'var(--primary-color)' : 'transparent',
                color: activeTab === 'hero' ? '#fff' : 'var(--title-color)', transition: 'all 0.3s'
              }}
            >
              <Monitor size={14} style={{ marginRight: '6px' }} /> Hero & Popups Editor
            </button>
            
            <button 
              onClick={() => setActiveTab('catalog')}
              style={{
                padding: '10px 20px', fontSize: '13px', fontWeight: '700', borderRadius: '8px', border: 'none', cursor: 'pointer',
                backgroundColor: activeTab === 'catalog' ? 'var(--primary-color)' : 'transparent',
                color: activeTab === 'catalog' ? '#fff' : 'var(--title-color)', transition: 'all 0.3s'
              }}
            >
              <Utensils size={14} style={{ marginRight: '6px' }} /> Menu Catalog Editor
            </button>
            
            <button 
              onClick={() => setActiveTab('content')}
              style={{
                padding: '10px 20px', fontSize: '13px', fontWeight: '700', borderRadius: '8px', border: 'none', cursor: 'pointer',
                backgroundColor: activeTab === 'content' ? 'var(--primary-color)' : 'transparent',
                color: activeTab === 'content' ? '#fff' : 'var(--title-color)', transition: 'all 0.3s'
              }}
            >
              <FileText size={14} style={{ marginRight: '6px' }} /> Content & Support Info
            </button>
            
            <button 
              onClick={() => setActiveTab('media')}
              style={{
                padding: '10px 20px', fontSize: '13px', fontWeight: '700', borderRadius: '8px', border: 'none', cursor: 'pointer',
                backgroundColor: activeTab === 'media' ? 'var(--primary-color)' : 'transparent',
                color: activeTab === 'media' ? '#fff' : 'var(--title-color)', transition: 'all 0.3s'
              }}
            >
              <Image size={14} style={{ marginRight: '6px' }} /> Media Assets Library
            </button>
          </div>

          <div className="premium-card" style={{ padding: '30px', margin: 0 }}>
            {loading ? (
              <div style={{ height: '300px', backgroundColor: '#e2ebd9', borderRadius: '15px', animation: 'pulse 1.5s infinite' }} />
            ) : (
              <>
                {/* 1. Hero tab */}
                {activeTab === 'hero' && (
                  <form onSubmit={handleSaveConfig} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <h3 style={{ margin: '0 0 10px', fontSize: '18px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', color: 'var(--title-color)' }}>
                      Storefront Hero Section Controls
                    </h3>

                    <div className="form-field">
                      <label>Announcement Ticker Message</label>
                      <input 
                        type="text" 
                        value={config.banner}
                        onChange={(e) => setConfig({ ...config, banner: e.target.value })}
                        placeholder="Promotional banner text at header"
                      />
                    </div>

                    <div className="form-grid">
                      <div className="form-field">
                        <label>Main Hero Headline</label>
                        <input 
                          type="text" 
                          value={config.headline}
                          onChange={(e) => setConfig({ ...config, headline: e.target.value })}
                        />
                      </div>
                      <div className="form-field">
                        <label>Hero Background Image URL</label>
                        <input 
                          type="text" 
                          value={config.hero_bg_image || ''}
                          onChange={(e) => setConfig({ ...config, hero_bg_image: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="form-grid">
                      <div className="form-field">
                        <label>Hero Call-to-Action Label</label>
                        <input 
                          type="text" 
                          value={config.hero_cta_label || ''}
                          onChange={(e) => setConfig({ ...config, hero_cta_label: e.target.value })}
                        />
                      </div>
                      <div className="form-field">
                        <label>Hero Call-to-Action Link Path</label>
                        <input 
                          type="text" 
                          value={config.hero_cta_link || ''}
                          onChange={(e) => setConfig({ ...config, hero_cta_link: e.target.value })}
                        />
                      </div>
                    </div>

                    <h3 style={{ margin: '15px 0 10px', fontSize: '18px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', color: 'var(--title-color)' }}>
                      Promotion Popups & Banner Visibility Toggles
                    </h3>

                    <div className="form-grid">
                      <div className="form-field">
                        <label>Promo Popup Header Title</label>
                        <input 
                          type="text" 
                          value={config.popup_title}
                          onChange={(e) => setConfig({ ...config, popup_title: e.target.value })}
                        />
                      </div>
                      <div className="form-field">
                        <label>Promo Popup Body Message</label>
                        <input 
                          type="text" 
                          value={config.popup_message}
                          onChange={(e) => setConfig({ ...config, popup_message: e.target.value })}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginTop: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <input 
                          type="checkbox" 
                          id="show_promo_popup" 
                          checked={config.show_promo_popup}
                          onChange={(e) => setConfig({ ...config, show_promo_popup: e.target.checked })}
                          style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                        />
                        <label htmlFor="show_promo_popup" style={{ fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>Show Promotional Popup Dialog</label>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <input 
                          type="checkbox" 
                          id="show_featured_review" 
                          checked={config.show_featured_review}
                          onChange={(e) => setConfig({ ...config, show_featured_review: e.target.checked })}
                          style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                        />
                        <label htmlFor="show_featured_review" style={{ fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>Show Featured Customer Reviews Section</label>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <input 
                          type="checkbox" 
                          id="show_recipe_suggest" 
                          checked={config.show_recipe_suggest}
                          onChange={(e) => setConfig({ ...config, show_recipe_suggest: e.target.checked })}
                          style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                        />
                        <label htmlFor="show_recipe_suggest" style={{ fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>Show AI Recipe Suggestion Box</label>
                      </div>
                    </div>

                    <div style={{ marginTop: '20px' }}>
                      <button type="submit" className="page-action-btn" style={{ padding: '12px 24px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <CloudUpload size={16} /> Save Hero Configuration
                      </button>
                    </div>
                  </form>
                )}

                {/* 2. Catalog tab */}
                {activeTab === 'catalog' && (
                  <div>
                    {/* Catalog Sub Tabs */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #EAE6DB', paddingBottom: '10px' }}>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                          onClick={() => setCatalogSubTab('standard')}
                          style={{
                            padding: '6px 15px', fontSize: '12px', fontWeight: '700', borderRadius: '20px', border: '1px solid #EAE6DB', cursor: 'pointer',
                            backgroundColor: catalogSubTab === 'standard' ? 'var(--primary-color)' : '#fff',
                            color: catalogSubTab === 'standard' ? '#fff' : '#666'
                          }}
                        >
                          Standard Dishes (Ready to Eat & Cook)
                        </button>
                        <button
                          onClick={() => setCatalogSubTab('batter')}
                          style={{
                            padding: '6px 15px', fontSize: '12px', fontWeight: '700', borderRadius: '20px', border: '1px solid #EAE6DB', cursor: 'pointer',
                            backgroundColor: catalogSubTab === 'batter' ? 'var(--primary-color)' : '#fff',
                            color: catalogSubTab === 'batter' ? '#fff' : '#666'
                          }}
                        >
                          Batter Variant Stock Lists
                        </button>
                      </div>

                      <button 
                        className="page-action-btn"
                        style={{ padding: '8px 16px', fontSize: '12px' }}
                        onClick={() => {
                          if (catalogSubTab === 'standard') {
                            setIsEditingProduct(false);
                            setCurrentProduct({ id: null, name: '', description: '', price: '', offer_price: '', category: 'ready_to_eat', image: '', stock: 50, is_available: true });
                            setIsProductModalOpen(true);
                          } else {
                            setIsEditingBatter(false);
                            setCurrentBatter({ id: null, product_name: '', variant: '1kg Pouch', weight: '1kg', price: '', offer_price: '', stock: 50, expiry_date: '', manufacture_date: '', image: '' });
                            setIsBatterModalOpen(true);
                          }
                        }}
                      >
                        <PlusCircle size={14} style={{ marginRight: '4px' }} /> Add Catalog Item
                      </button>
                    </div>

                    {catalogSubTab === 'standard' ? (
                      <div className="responsive-table-wrapper" style={{ border: 'none', boxShadow: 'none' }}>
                        <table className="responsive-table">
                          <thead>
                            <tr>
                              <th>Preview</th>
                              <th>Name</th>
                              <th>Category</th>
                              <th>Base Price</th>
                              <th>Offer Price</th>
                              <th>In Stock</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {products.map(p => (
                              <tr key={p.id}>
                                <td>
                                  <img 
                                    src={resolveImagePath(p.image)} 
                                    alt={p.name} 
                                    style={{ width: '45px', height: '45px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #EAE6DB' }} 
                                  />
                                </td>
                                <td><strong>{p.name}</strong><div className="text-muted" style={{ fontSize: '11px' }}>{p.description?.substring(0, 50)}...</div></td>
                                <td style={{ textTransform: 'capitalize' }}>{p.category?.replace('_', ' ')}</td>
                                <td style={{ fontWeight: '700' }}>₹{p.price.toFixed(2)}</td>
                                <td>{p.offer_price ? `₹${p.offer_price.toFixed(2)}` : 'N/A'}</td>
                                <td>
                                  <span style={{
                                    padding: '3px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: '700',
                                    backgroundColor: p.in_stock ? '#D4EFDF' : '#FADBD8',
                                    color: p.in_stock ? '#196F3D' : '#943126'
                                  }}>
                                    {p.in_stock ? 'In Stock' : 'Out of Stock'}
                                  </span>
                                </td>
                                <td>
                                  <div style={{ display: 'flex', gap: '6px' }}>
                                    <button onClick={() => handleEditProductClick(p)} className="btn-secondary" style={{ padding: '4px 8px', fontSize: '11px' }}>Edit</button>
                                    <button onClick={() => handleDeleteProduct(p.id)} className="btn-secondary" style={{ padding: '4px 8px', fontSize: '11px', backgroundColor: '#FDEDEC', color: '#78281F', borderColor: '#F5B7B1' }}>Delete</button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="responsive-table-wrapper" style={{ border: 'none', boxShadow: 'none' }}>
                        <table className="responsive-table">
                          <thead>
                            <tr>
                              <th>Preview</th>
                              <th>Batter Name</th>
                              <th>Variant</th>
                              <th>Weight</th>
                              <th>Price</th>
                              <th>Offer Price</th>
                              <th>Stock Qty</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {batterVariants.map(b => (
                              <tr key={b.id}>
                                <td>
                                  <img 
                                    src={resolveImagePath(b.image)} 
                                    alt={b.product_name} 
                                    style={{ width: '45px', height: '45px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #EAE6DB' }} 
                                  />
                                </td>
                                <td><strong>{b.product_name}</strong></td>
                                <td>{b.variant}</td>
                                <td>{b.weight}</td>
                                <td style={{ fontWeight: '700' }}>₹{b.price.toFixed(2)}</td>
                                <td>{b.offer_price ? `₹${b.offer_price.toFixed(2)}` : 'N/A'}</td>
                                <td><strong>{b.stock}</strong> pouches</td>
                                <td>
                                  <div style={{ display: 'flex', gap: '6px' }}>
                                    <button onClick={() => handleEditBatterClick(b)} className="btn-secondary" style={{ padding: '4px 8px', fontSize: '11px' }}>Edit</button>
                                    <button onClick={() => handleDeleteBatter(b.id)} className="btn-secondary" style={{ padding: '4px 8px', fontSize: '11px', backgroundColor: '#FDEDEC', color: '#78281F', borderColor: '#F5B7B1' }}>Delete</button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {/* 3. Content tab */}
                {activeTab === 'content' && (
                  <form onSubmit={handleSaveConfig} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <h3 style={{ margin: '0 0 10px', fontSize: '18px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', color: 'var(--title-color)' }}>
                      Contact & Content Settings
                    </h3>

                    <div className="form-field">
                      <label>About Us Description Text</label>
                      <textarea 
                        rows="4" 
                        value={config.about_us || ''}
                        onChange={(e) => setConfig({ ...config, about_us: e.target.value })}
                        style={{ width: '100%', padding: '10px', border: '1px solid #EAE6DB', borderRadius: '8px', fontFamily: 'inherit' }}
                      />
                    </div>

                    <div className="form-grid">
                      <div className="form-field">
                        <label>Opening Hours Display</label>
                        <input 
                          type="text" 
                          value={config.opening_hours}
                          onChange={(e) => setConfig({ ...config, opening_hours: e.target.value })}
                        />
                      </div>
                      <div className="form-field">
                        <label>Support Phone Line</label>
                        <input 
                          type="text" 
                          value={config.contact_phone}
                          onChange={(e) => setConfig({ ...config, contact_phone: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="form-grid">
                      <div className="form-field">
                        <label>WhatsApp Chat Support Number</label>
                        <input 
                          type="text" 
                          value={config.whatsapp_number || ''}
                          onChange={(e) => setConfig({ ...config, whatsapp_number: e.target.value })}
                          placeholder="e.g. +919876543210"
                        />
                      </div>
                      <div className="form-field">
                        <label>Support Email Address</label>
                        <input 
                          type="email" 
                          value={config.contact_email}
                          onChange={(e) => setConfig({ ...config, contact_email: e.target.value })}
                        />
                      </div>
                    </div>

                    <h3 style={{ margin: '15px 0 10px', fontSize: '18px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', color: 'var(--title-color)' }}>
                      Footer & Social Handles Links
                    </h3>

                    <div className="form-grid">
                      <div className="form-field">
                        <label>Instagram Page Link</label>
                        <input 
                          type="text" 
                          value={config.social_instagram}
                          onChange={(e) => setConfig({ ...config, social_instagram: e.target.value })}
                        />
                      </div>
                      <div className="form-field">
                        <label>Facebook Page Link</label>
                        <input 
                          type="text" 
                          value={config.social_facebook}
                          onChange={(e) => setConfig({ ...config, social_facebook: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="form-grid">
                      <div className="form-field">
                        <label>Twitter/X Profile Link</label>
                        <input 
                          type="text" 
                          value={config.social_twitter}
                          onChange={(e) => setConfig({ ...config, social_twitter: e.target.value })}
                        />
                      </div>
                      <div className="form-field">
                        <label>Categories (Main Nav Filter Columns)</label>
                        <input 
                          type="text" 
                          value={config.categories}
                          onChange={(e) => setConfig({ ...config, categories: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="form-field">
                      <label>Footer Copyright Text</label>
                      <input 
                        type="text" 
                        value={config.footer_text}
                        onChange={(e) => setConfig({ ...config, footer_text: e.target.value })}
                      />
                    </div>

                    <div style={{ marginTop: '10px' }}>
                      <button type="submit" className="page-action-btn" style={{ padding: '12px 24px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <CloudUpload size={16} /> Save Support & Content Settings
                      </button>
                    </div>
                  </form>
                )}

                {/* 4. Media tab */}
                {activeTab === 'media' && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #EAE6DB', paddingBottom: '15px' }}>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '18px', color: 'var(--title-color)' }}>Media Assets Library</h3>
                        <p className="text-muted" style={{ margin: '4px 0 0', fontSize: '12px' }}>Upload dish graphics or hero banners here and copy their link paths to apply them live.</p>
                      </div>

                      <div>
                        <label className="page-action-btn" style={{ cursor: 'pointer', padding: '8px 16px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <Upload size={14} />
                          {uploadingMedia ? 'Uploading...' : 'Upload File'}
                          <input 
                            type="file" 
                            accept="image/*" 
                            style={{ display: 'none' }}
                            onChange={handleMediaUpload}
                            disabled={uploadingMedia}
                          />
                        </label>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
                      {mediaList.map((m, idx) => (
                        <div key={idx} style={{ border: '1px solid #EAE6DB', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#FAF8F2' }}>
                          <img src={m.url} alt={m.name} style={{ width: '100%', height: '120px', objectFit: 'cover' }} />
                          <div style={{ padding: '12px' }}>
                            <strong style={{ fontSize: '12px', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '8px' }}>{m.name}</strong>
                            <button 
                              onClick={() => copyToClipboard(m.url, idx)} 
                              className="btn-secondary" 
                              style={{ width: '100%', padding: '6px 0', fontSize: '11px', borderRadius: '6px' }}
                            >
                              <Copy size={12} /> {copiedIndex === idx ? 'Copied!' : 'Copy Link Path'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Product Modal */}
        {isProductModalOpen && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
            <div className="premium-card" style={{ width: '480px', padding: '30px', borderRadius: '15px', backgroundColor: '#fff', boxShadow: '0 8px 30px rgba(0,0,0,0.15)' }}>
              <h3 style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{isEditingProduct ? 'Edit Catalog Product' : 'Add Catalog Product'}</span>
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'inline-flex' }} onClick={() => setIsProductModalOpen(false)}>
                  <X size={18} />
                </button>
              </h3>
              <form onSubmit={handleProductSubmit}>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Dish Name *</label>
                  <input 
                    type="text" 
                    required 
                    value={currentProduct.name} 
                    onChange={(e) => setCurrentProduct({ ...currentProduct, name: e.target.value })}
                    style={{ width: '100%', padding: '8px', border: '1px solid #EAE6DB', borderRadius: '6px' }}
                  />
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Description</label>
                  <input 
                    type="text" 
                    value={currentProduct.description} 
                    onChange={(e) => setCurrentProduct({ ...currentProduct, description: e.target.value })}
                    style={{ width: '100%', padding: '8px', border: '1px solid #EAE6DB', borderRadius: '6px' }}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Category *</label>
                    <select 
                      value={currentProduct.category} 
                      onChange={(e) => setCurrentProduct({ ...currentProduct, category: e.target.value })}
                      style={{ width: '100%', padding: '8px', border: '1px solid #EAE6DB', borderRadius: '6px', backgroundColor: '#fff' }}
                    >
                      <option value="ready_to_eat">Ready To Eat</option>
                      <option value="ready_to_cook">Ready To Cook</option>
                      <option value="batter_products">Batter Product fallback</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Price (₹) *</label>
                    <input 
                      type="number" 
                      required 
                      value={currentProduct.price} 
                      onChange={(e) => setCurrentProduct({ ...currentProduct, price: e.target.value })}
                      style={{ width: '100%', padding: '8px', border: '1px solid #EAE6DB', borderRadius: '6px' }}
                    />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Offer Price (₹)</label>
                    <input 
                      type="number" 
                      value={currentProduct.offer_price} 
                      onChange={(e) => setCurrentProduct({ ...currentProduct, offer_price: e.target.value })}
                      style={{ width: '100%', padding: '8px', border: '1px solid #EAE6DB', borderRadius: '6px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Inventory Stock Qty</label>
                    <input 
                      type="number" 
                      value={currentProduct.stock} 
                      onChange={(e) => setCurrentProduct({ ...currentProduct, stock: e.target.value })}
                      style={{ width: '100%', padding: '8px', border: '1px solid #EAE6DB', borderRadius: '6px' }}
                    />
                  </div>
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Image URL / Path</label>
                  <input 
                    type="text" 
                    value={currentProduct.image} 
                    onChange={(e) => setCurrentProduct({ ...currentProduct, image: e.target.value })}
                    style={{ width: '100%', padding: '8px', border: '1px solid #EAE6DB', borderRadius: '6px' }}
                    placeholder="/assets/img/dishes/..."
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                  <input 
                    type="checkbox" 
                    id="is_available" 
                    checked={currentProduct.is_available} 
                    onChange={(e) => setCurrentProduct({ ...currentProduct, is_available: e.target.checked })}
                    style={{ width: '16px', height: '16px' }}
                  />
                  <label htmlFor="is_available" style={{ fontSize: '12px', fontWeight: '700' }}>Item Available for Storefront Purchases</label>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button type="button" className="btn-secondary" onClick={() => setIsProductModalOpen(false)}>Cancel</button>
                  <button type="submit" className="page-action-btn" style={{ padding: '8px 16px', fontSize: '13px' }}>Save Product</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Batter Modal */}
        {isBatterModalOpen && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
            <div className="premium-card" style={{ width: '480px', padding: '30px', borderRadius: '15px', backgroundColor: '#fff', boxShadow: '0 8px 30px rgba(0,0,0,0.15)' }}>
              <h3 style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{isEditingBatter ? 'Edit Batter Variant' : 'Add Batter Variant'}</span>
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'inline-flex' }} onClick={() => setIsBatterModalOpen(false)}>
                  <X size={18} />
                </button>
              </h3>
              <form onSubmit={handleBatterSubmit}>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Batter Product Name *</label>
                  <input 
                    type="text" 
                    required 
                    value={currentBatter.product_name} 
                    onChange={(e) => setCurrentBatter({ ...currentBatter, product_name: e.target.value })}
                    style={{ width: '100%', padding: '8px', border: '1px solid #EAE6DB', borderRadius: '6px' }}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Variant Packaging *</label>
                    <input 
                      type="text" 
                      required 
                      value={currentBatter.variant} 
                      onChange={(e) => setCurrentBatter({ ...currentBatter, variant: e.target.value })}
                      style={{ width: '100%', padding: '8px', border: '1px solid #EAE6DB', borderRadius: '6px' }}
                      placeholder="e.g. 1kg Tub, 500g Pouch"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Weight *</label>
                    <input 
                      type="text" 
                      required 
                      value={currentBatter.weight} 
                      onChange={(e) => setCurrentBatter({ ...currentBatter, weight: e.target.value })}
                      style={{ width: '100%', padding: '8px', border: '1px solid #EAE6DB', borderRadius: '6px' }}
                      placeholder="e.g. 1kg, 500g"
                    />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Price (₹) *</label>
                    <input 
                      type="number" 
                      required 
                      value={currentBatter.price} 
                      onChange={(e) => setCurrentBatter({ ...currentBatter, price: e.target.value })}
                      style={{ width: '100%', padding: '8px', border: '1px solid #EAE6DB', borderRadius: '6px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Offer Price (₹)</label>
                    <input 
                      type="number" 
                      value={currentBatter.offer_price} 
                      onChange={(e) => setCurrentBatter({ ...currentBatter, offer_price: e.target.value })}
                      style={{ width: '100%', padding: '8px', border: '1px solid #EAE6DB', borderRadius: '6px' }}
                    />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Stock Quantity</label>
                    <input 
                      type="number" 
                      value={currentBatter.stock} 
                      onChange={(e) => setCurrentBatter({ ...currentBatter, stock: e.target.value })}
                      style={{ width: '100%', padding: '8px', border: '1px solid #EAE6DB', borderRadius: '6px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Image URL / Path</label>
                    <input 
                      type="text" 
                      value={currentBatter.image} 
                      onChange={(e) => setCurrentBatter({ ...currentBatter, image: e.target.value })}
                      style={{ width: '100%', padding: '8px', border: '1px solid #EAE6DB', borderRadius: '6px' }}
                      placeholder="/assets/img/batter/..."
                    />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Manufacture Date</label>
                    <input 
                      type="text" 
                      value={currentBatter.manufacture_date} 
                      onChange={(e) => setCurrentBatter({ ...currentBatter, manufacture_date: e.target.value })}
                      style={{ width: '100%', padding: '8px', border: '1px solid #EAE6DB', borderRadius: '6px' }}
                      placeholder="e.g. 2026-06-02"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Expiry Date</label>
                    <input 
                      type="text" 
                      value={currentBatter.expiry_date} 
                      onChange={(e) => setCurrentBatter({ ...currentBatter, expiry_date: e.target.value })}
                      style={{ width: '100%', padding: '8px', border: '1px solid #EAE6DB', borderRadius: '6px' }}
                      placeholder="e.g. 2026-06-05"
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button type="button" className="btn-secondary" onClick={() => setIsBatterModalOpen(false)}>Cancel</button>
                  <button type="submit" className="page-action-btn" style={{ padding: '8px 16px', fontSize: '13px' }}>Save Batter Variant</button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="admin-footer">
          <div>&copy; 2026 <strong>Amma's Kitchen Admin</strong>. All Rights Reserved.</div>
        </div>
      </div>
    </div>
  );
};

export default WebsiteManagement;
