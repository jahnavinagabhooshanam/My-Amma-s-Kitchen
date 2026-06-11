import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import AdminNavbar from '../../components/AdminNavbar';
import apiClient from '../../services/api';
import '../../assets/styles/admin-style.css';
import '../../assets/styles/tables.css';
import { 
  CheckCircle, 
  AlertTriangle, 
  Monitor, 
  Utensils, 
  FileText, 
  Image, 
  CloudUpload, 
  PlusCircle, Pencil, Trash2, FolderOpen, 
  Upload, 
  Copy, 
  X, 
  Save, 
  Tags, 
  Megaphone,
  Eye,
  EyeOff,
  Star
} from 'lucide-react';

const resolveImagePath = (path) => {
  if (!path) return '';
  let clean = path;

  if (clean.startsWith('http')) return clean;

  const backendUrl = import.meta.env.VITE_API_BASE_URL 
    ? import.meta.env.VITE_API_BASE_URL.replace('/api', '') 
    : 'http://127.0.0.1:5000';

  if (clean.startsWith('/assets/') || clean.startsWith('assets/') || clean.startsWith('/api/assets/')) {
    if (clean.startsWith('/api/assets/')) {
      clean = clean.substring(12);
    } else if (clean.startsWith('assets/')) {
      clean = clean.substring(7);
    } else if (clean.startsWith('/assets/')) {
      clean = clean.substring(8);
    }
    return `${backendUrl}/assets/${clean}`;
  }

  if (clean.startsWith('/uploads/') || clean.startsWith('uploads/')) {
    if (clean.startsWith('/')) clean = clean.substring(1);
    return `${backendUrl}/${clean}`;
  }

  return clean;
};

const WebsiteManagement = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const activeTabParam = searchParams.get('tab') || 'homepage';

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
    whatsapp_number: '',
    featured_products: [],
    trending_products: [],
    recommended_products: []
  });

  
  
  const [showModal, setShowModal] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState({
    name: '', price: '', offer_price: '', diet_type: 'Veg', is_available: true, description: '', img: ''
  });

  const [homepageConfig, setHomepageConfig] = useState({
    trending_today: [],
    amma_recommends: []
  });

  const [products, setProducts] = useState([]);
  const [batterVariants, setBatterVariants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  // Tabs
  const [activeTab, setActiveTab] = useState('homepage'); // 'homepage', 'content', 'marketing'

  useEffect(() => {
    if (activeTabParam === 'hero') {
      setActiveTab('homepage');
    } else {
      setActiveTab(activeTabParam);
    }
  }, [activeTabParam]);

  // Category Editor helper states
  const [categoryList, setCategoryList] = useState([]);
  const [newCatName, setNewCatName] = useState('');
  const [editingCatIndex, setEditingCatIndex] = useState(null);
  const [editingCatValue, setEditingCatValue] = useState('');

  // Media Library states
  const [mediaList, setMediaList] = useState([]);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);

  const fetchAllConfig = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const configRes = await apiClient.get('/admin/website-config');
      const data = configRes.data;
      setConfig(data);
      
      // Parse category list from config string
      const parsedCats = data.categories ? data.categories.split(',').map(c => c.trim()).filter(Boolean) : [];
      setCategoryList(parsedCats);

      
      // Fetch Homepage Config
      try {
        const hpRes = await apiClient.get('/homepage/');
        if (hpRes.data) {
          setHomepageConfig({
            trending_today: hpRes.data.trending_today || [],
            amma_recommends: Array.isArray(hpRes.data.amma_recommends) ? hpRes.data.amma_recommends : []
          });
        }
      } catch (err) {
        console.error("Failed to load homepage config", err);
      }

      const productsRes = await apiClient.get('/products/');
      setProducts(productsRes.data);

      const batterRes = await apiClient.get('/products/batter-variants');
      setBatterVariants(batterRes.data);

      try {
        const mediaRes = await apiClient.get('/products/media');
        setMediaList(mediaRes.data);
      } catch (mediaErr) {
        console.error("Failed to load dynamic media files:", mediaErr);
        setMediaList([
          { name: 'Artisan Batter Hero', url: '/assets/img/hero-bg.jpg' },
          { name: 'Hotel Amma Logo', url: '/assets/img/cropped-logo.webp' },
          { name: 'Idli Batter Tub', url: '/assets/img/batter-idli.jpg' },
          { name: 'Paneer Butter Masala RTE', url: '/assets/img/paneer-rte.jpg' }
        ]);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to load storefront control configs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllConfig();
  }, []);

  const saveConfigToServer = async (updatedConfig) => {
    setErrorMsg('');
    try {
      const res = await apiClient.post('/admin/website-config', updatedConfig);
      setConfig(res.data.config || updatedConfig);
      setSuccessMsg("Storefront adjustments saved successfully and live on user website!");
      setTimeout(() => setSuccessMsg(''), 4000);
      return true;
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to sync configurations to storefront backend.");
      return false;
    }
  };

  // 1. Category Manager actions
  
  
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingImage(true);
    setErrorMsg('');

    const uploadFormData = new FormData();
    uploadFormData.append('file', file);

    try {
      const token = localStorage.getItem('amma_admin_token') || 'mock-jwt-token-for-admin';
      const response = await apiClient.post('/products/upload', uploadFormData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setFormData(prev => ({ ...prev, img: response.data.image_url }));
      setSuccessMsg("Image uploaded successfully!");
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error("Image upload failed:", err);
      setErrorMsg("Failed to upload image. Please try again.");
    } finally {
      setUploadingImage(false);
    }
  };

  const openAddModal = (section) => {
    if (homepageConfig[section].length >= 4) {
      setErrorMsg(`Maximum 4 items allowed.`);
      setTimeout(() => setErrorMsg(''), 3000);
      return;
    }
    setEditingSection(section);
    setEditingIndex(null);
    setFormData({ name: '', price: '', offer_price: '', diet_type: 'Veg', is_available: true, description: '', img: '' });
    setShowModal(true);
  };

  const openEditModal = (section, index, item) => {
    setEditingSection(section);
    setEditingIndex(index);
    setFormData({
      name: item.name || '',
      price: item.price || '',
      offer_price: item.offer_price || '',
      diet_type: item.diet_type || 'Veg',
      is_available: item.is_available !== false,
      description: item.description || '',
      img: item.img || ''
    });
    setShowModal(true);
  };

  const handleModalSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price) {
      setErrorMsg("Product Name and Price are required.");
      return;
    }
    const newArr = [...homepageConfig[editingSection]];
    if (editingIndex !== null) {
      newArr[editingIndex] = { ...formData };
    } else {
      newArr.push({ ...formData });
    }
    setHomepageConfig({ ...homepageConfig, [editingSection]: newArr });
    setShowModal(false);
  };

  const saveHomepageConfig = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      await apiClient.put('/homepage/', homepageConfig);
      setSuccessMsg("Homepage configurations saved successfully!");
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to save homepage config.");
    }
  };

  
  const renderProductListEditor = (title, field) => (
    <div style={{ marginBottom: '30px', background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #EAE6DB', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '1px solid #EAE6DB', paddingBottom: '15px' }}>
        <h3 style={{ margin: 0, fontSize: '18px', color: 'var(--title-color)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          {title}
        </h3>
        <button
          type="button"
          onClick={() => openAddModal(field)}
          style={{ background: '#e53935', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <PlusCircle size={16} /> Add Item
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {homepageConfig[field].map((item, index) => (
          <div key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#faf9f6', padding: '15px', borderRadius: '10px', border: '1px solid #f0eee5' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '8px', overflow: 'hidden', background: '#eae6db' }}>
                <img src={resolveImagePath(item.img)} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.src = '/assets/images/placeholder.jpg' }} />
              </div>
              <div>
                <h4 style={{ margin: '0 0 5px 0', fontSize: '15px', color: '#333' }}>{item.name}</h4>
                <div style={{ fontSize: '14px', color: '#666' }}>Rs. {item.price}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="button" onClick={() => openEditModal(field, index, item)} style={{ background: '#e2ebd9', color: '#2e8b57', border: 'none', width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <Pencil size={16} />
              </button>
              <button type="button" onClick={() => {
                const newArr = [...homepageConfig[field]];
                newArr.splice(index, 1);
                setHomepageConfig({ ...homepageConfig, [field]: newArr });
              }} style={{ background: '#fcdcd8', color: '#e53935', border: 'none', width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
        {(!homepageConfig[field] || homepageConfig[field].length === 0) && (
          <div style={{ textAlign: 'center', padding: '30px', color: '#888', background: '#faf9f6', borderRadius: '10px', border: '1px dashed #ccc' }}>
            <FolderOpen size={30} style={{ marginBottom: '10px', opacity: 0.5 }} />
            <div>No items added yet. Click "Add Item" to add.</div>
          </div>
        )}
      </div>
    </div>
  );



  const handleAddCategory = () => {
    if (!newCatName.trim()) return;
    if (categoryList.includes(newCatName.trim())) {
      setErrorMsg("Category already exists.");
      return;
    }
    const updatedCats = [...categoryList, newCatName.trim()];
    setCategoryList(updatedCats);
    setNewCatName('');
    
    // Save updated config
    const updatedConfig = { ...config, categories: updatedCats.join(', ') };
    saveConfigToServer(updatedConfig);
  };

  const handleEditCategoryStart = (index) => {
    setEditingCatIndex(index);
    setEditingCatValue(categoryList[index]);
  };

  const handleEditCategorySave = () => {
    if (!editingCatValue.trim()) return;
    const updatedCats = [...categoryList];
    const oldCatName = updatedCats[editingCatIndex];
    updatedCats[editingCatIndex] = editingCatValue.trim();
    setCategoryList(updatedCats);
    setEditingCatIndex(null);

    const updatedConfig = { ...config, categories: updatedCats.join(', ') };
    saveConfigToServer(updatedConfig);
  };

  const handleDeleteCategory = (index) => {
    if (!window.confirm(`Are you sure you want to remove category "${categoryList[index]}"?`)) return;
    const updatedCats = categoryList.filter((_, i) => i !== index);
    setCategoryList(updatedCats);

    const updatedConfig = { ...config, categories: updatedCats.join(', ') };
    saveConfigToServer(updatedConfig);
  };

  // 2. Product settings (visibility and featured product toggle)
  const handleProductVisibilityToggle = async (p) => {
    try {
      const updatedAvailability = !p.is_available;
      await apiClient.put(`/products/${p.id}`, {
        name: p.name,
        price: p.price,
        category: p.category,
        is_available: updatedAvailability
      });
      setSuccessMsg(`Visibility for "${p.name}" updated successfully.`);
      // Reload products
      
      // Fetch Homepage Config
      try {
        const hpRes = await apiClient.get('/homepage/');
        if (hpRes.data) {
          setHomepageConfig({
            trending_today: hpRes.data.trending_today || [],
            amma_recommends: Array.isArray(hpRes.data.amma_recommends) ? hpRes.data.amma_recommends : []
          });
        }
      } catch (err) {
        console.error("Failed to load homepage config", err);
      }

      const productsRes = await apiClient.get('/products/');
      setProducts(productsRes.data);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to toggle product visibility status.");
    }
  };

  const handleProductFeaturedToggle = (productId) => {
    let featuredList = config.featured_products ? [...config.featured_products] : [];
    if (featuredList.includes(productId)) {
      featuredList = featuredList.filter(id => id !== productId);
    } else {
      featuredList.push(productId);
    }

    const updatedConfig = { ...config, featured_products: featuredList };
    saveConfigToServer(updatedConfig);
  };

  // 3. Media Upload Action
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
      setSuccessMsg("Media file uploaded successfully!");
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to upload media asset to server uploads directory.");
    } finally {
      setUploadingMedia(false);
    }
  };

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2500);
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

          <div className="module-tabs">
            <button 
              onClick={() => navigate('/admin/website-management?tab=content')}
              style={{
                padding: '10px 20px', fontSize: '13px', fontWeight: '700', borderRadius: '8px', border: 'none', cursor: 'pointer',
                backgroundColor: activeTab === 'content' ? 'var(--primary-color)' : 'transparent',
                color: activeTab === 'content' ? '#fff' : 'var(--title-color)', transition: 'all 0.3s'
              }}
            >
              <FileText size={14} style={{ marginRight: '6px' }} /> Content Editor
            </button>
          </div>

          <div className="premium-card" style={{ padding: '30px', margin: 0 }}>
            {loading ? (
              <div style={{ height: '300px', backgroundColor: '#e2ebd9', borderRadius: '15px', animation: 'pulse 1.5s infinite' }} />
            ) : (
              <>
                {/* 1. Homepage Sections tab */}
                {activeTab === 'homepage' && (
                  <form onSubmit={saveHomepageConfig} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {renderProductListEditor('Trending Today', 'trending_today')}
                    {renderProductListEditor('Ammulu Recommends', 'amma_recommends')}

                    <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-start' }}>
                      <button type="submit" className="page-action-btn" style={{ padding: '12px 24px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        Save Homepage Settings
                      </button>
                    </div>
                  </form>
                )}

                {/* 4. Content Editor tab */}
                {activeTab === 'content' && (
                  <form onSubmit={(e) => { e.preventDefault(); saveConfigToServer(config); }} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <h3 style={{ margin: '0 0 10px', fontSize: '18px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', color: 'var(--title-color)' }}>
                      Storefront Content & Support Parameters
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
                        <label>Business Opening Hours Description</label>
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
                          placeholder="e.g. +917200942596"
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

                    <div className="form-field">
                      <label>Footer Copyright Text</label>
                      <input 
                        type="text" 
                        value={config.footer_text}
                        onChange={(e) => setConfig({ ...config, footer_text: e.target.value })}
                      />
                    </div>

                    <h3 style={{ margin: '15px 0 10px', fontSize: '18px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', color: 'var(--title-color)' }}>
                      Catalogue Management
                    </h3>
                    
                    <div className="form-grid">
                      <div className="form-field">
                        <label>Trending Today's</label>
                        <select
                          multiple
                          size="4"
                          value={config.trending_products || []}
                          onChange={(e) => {
                            const selectedValues = Array.from(e.target.selectedOptions, option => parseInt(option.value));
                            setConfig({ ...config, trending_products: selectedValues });
                          }}
                          style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #EAE6DB' }}
                        >
                          {products.map(p => (
                            <option key={p.id} value={p.id}>{p.name} - ₹{p.price}</option>
                          ))}
                        </select>
                        <small style={{ color: '#888' }}>Hold Ctrl/Cmd to select multiple daily trending dishes.</small>
                      </div>
                      
                      <div className="form-field">
                        <label>Ammulu Recommends</label>
                        <select
                          multiple
                          size="4"
                          value={config.recommended_products || []}
                          onChange={(e) => {
                            const selectedValues = Array.from(e.target.selectedOptions, option => parseInt(option.value));
                            setConfig({ ...config, recommended_products: selectedValues });
                          }}
                          style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #EAE6DB' }}
                        >
                          {products.map(p => (
                            <option key={p.id} value={p.id}>{p.name} - ₹{p.price}</option>
                          ))}
                        </select>
                        <small style={{ color: '#888' }}>Hold Ctrl/Cmd to select multiple recommended dishes.</small>
                      </div>
                    </div>

                    <div style={{ marginTop: '10px' }}>
                      <button type="submit" className="page-action-btn" style={{ padding: '12px 24px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <Save size={16} /> Save Content Configurations
                      </button>
                    </div>
                  </form>
                )}
              </>
            )}
          </div>
        </div>

        <div className="admin-footer">
          <div>&copy; 2026 <strong>Ammulu's Kitchen Admin</strong>. All Rights Reserved.</div>
        </div>

        {/* Modal Form Dialog */}
        {showModal && (
          <div className="admin-modal show" style={{ zIndex: 1000 }}>
            <div className="admin-modal-content">
              <div className="admin-modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3>{editingIndex !== null ? 'Edit Food Item' : 'ADD NEW FOOD ITEM'}</h3>
                <button type="button" className="admin-modal-close" onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  <X size={18} />
                </button>
              </div>
              <form onSubmit={handleModalSubmit}>
                <div className="admin-modal-body">
                  <div className="form-field">
                    <label>Product Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Mysore Masala Dosa"
                    />
                  </div>

                  <div className="form-grid">
                    <div className="form-field">
                      <label>Regular Price (₹) *</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        placeholder="120.00"
                      />
                    </div>
                    <div className="form-field">
                      <label>Offer Price (₹)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.offer_price}
                        onChange={(e) => setFormData({ ...formData, offer_price: e.target.value })}
                        placeholder="99.00"
                      />
                    </div>
                  </div>

                  <div className="form-grid">
                    <div className="form-field">
                      <label>Diet Type *</label>
                      <select
                        value={formData.diet_type}
                        onChange={(e) => setFormData({ ...formData, diet_type: e.target.value })}
                        style={{ height: '38px', background: '#fff', border: '1px solid #EAE6DB', borderRadius: '8px', padding: '0 10px', width: '100%' }}
                      >
                        <option value="Veg">Veg</option>
                        <option value="Non-Veg">Non-Veg</option>
                      </select>
                    </div>
                    <div className="form-field">
                      <label>Availability</label>
                      <select
                        value={formData.is_available}
                        onChange={(e) => setFormData({ ...formData, is_available: e.target.value === 'true' })}
                        style={{ height: '38px', background: '#fff', border: '1px solid #EAE6DB', borderRadius: '8px', padding: '0 10px', width: '100%' }}
                      >
                        <option value="true">Available</option>
                        <option value="false">Out of Stock</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-field">
                    <label>Food Description</label>
                    <textarea
                      rows="3"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Steaming hot and crispy Dosa base served with sambar and fresh tomato-onion chutney."
                      style={{ width: '100%', padding: '10px', border: '1px solid #EAE6DB', borderRadius: '8px', fontFamily: 'inherit' }}
                    />
                  </div>

                  <div className="form-field">
                    <label>Product Image</label>
                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginTop: '5px' }}>
                      <label style={{ 
                        width: '80px', 
                        height: '80px', 
                        borderRadius: '10px', 
                        border: '2px dashed #ccc', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        cursor: 'pointer',
                        overflow: 'hidden',
                        backgroundColor: '#f9f9f9',
                        position: 'relative'
                      }}>
                        {formData.img && formData.img !== '' ? (
                          <img src={resolveImagePath(formData.img)} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.src = '/assets/images/placeholder.jpg' }} />
                        ) : (
                          <PlusCircle size={30} color="#aaa" />
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          style={{ display: 'none' }}
                        />
                      </label>
                      <div style={{ fontSize: '13px', color: '#666' }}>
                        {uploadingImage ? 'Uploading...' : 'Click the box to upload image'}
                      </div>
                    </div>
                  </div>

                </div>
                <div className="admin-modal-footer">
                  <button type="button" className="admin-btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="admin-btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Save size={16} /> Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default WebsiteManagement;
