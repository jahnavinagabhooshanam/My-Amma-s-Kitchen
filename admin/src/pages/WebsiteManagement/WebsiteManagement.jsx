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
  PlusCircle, 
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
  if (!path) return '/assets/images/placeholder.jpg';
  let clean = path;

  if (clean.startsWith('http')) return clean;

  if (clean.startsWith('/assets/') || clean.startsWith('assets/') || clean.startsWith('/api/assets/')) {
    if (clean.startsWith('/api/assets/')) {
      clean = clean.substring(12);
    } else if (clean.startsWith('assets/')) {
      clean = clean.substring(7);
    } else if (clean.startsWith('/assets/')) {
      clean = clean.substring(8);
    }
    return `http://127.0.0.1:5000/assets/${clean}`;
  }

  if (clean.startsWith('/uploads/') || clean.startsWith('uploads/')) {
    if (clean.startsWith('/')) clean = clean.substring(1);
    return `http://127.0.0.1:5000/${clean}`;
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
    featured_products: []
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

            <button 
              onClick={() => navigate('/admin/website-management?tab=marketing')}
              style={{
                padding: '10px 20px', fontSize: '13px', fontWeight: '700', borderRadius: '8px', border: 'none', cursor: 'pointer',
                backgroundColor: activeTab === 'marketing' ? 'var(--primary-color)' : 'transparent',
                color: activeTab === 'marketing' ? '#fff' : 'var(--title-color)', transition: 'all 0.3s'
              }}
            >
              <Megaphone size={14} style={{ marginRight: '6px' }} /> Marketing Hub
            </button>
          </div>

          <div className="premium-card" style={{ padding: '30px', margin: 0 }}>
            {loading ? (
              <div style={{ height: '300px', backgroundColor: '#e2ebd9', borderRadius: '15px', animation: 'pulse 1.5s infinite' }} />
            ) : (
              <>
                {/* 1. Homepage Sections tab */}
                {activeTab === 'homepage' && (
                  <form onSubmit={(e) => { e.preventDefault(); saveConfigToServer(config); }} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <h3 style={{ margin: '0 0 10px', fontSize: '18px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', color: 'var(--title-color)' }}>
                      Homepage & Hero Carousel Configuration
                    </h3>

                    <div className="form-grid">
                      <div className="form-field">
                        <label>Main Hero Title Headline</label>
                        <input 
                          type="text" 
                          value={config.headline}
                          onChange={(e) => setConfig({ ...config, headline: e.target.value })}
                          required
                        />
                      </div>
                      <div className="form-field">
                        <label>Hero Background Image Link path</label>
                        <input 
                          type="text" 
                          value={config.hero_bg_image || ''}
                          onChange={(e) => setConfig({ ...config, hero_bg_image: e.target.value })}
                          placeholder="e.g. /assets/img/hero-bg.jpg"
                        />
                      </div>
                    </div>

                    <div className="form-grid">
                      <div className="form-field">
                        <label>Hero CTA Button Text</label>
                        <input 
                          type="text" 
                          value={config.hero_cta_label || ''}
                          onChange={(e) => setConfig({ ...config, hero_cta_label: e.target.value })}
                          placeholder="e.g. Order Now"
                        />
                      </div>
                      <div className="form-field">
                        <label>Hero CTA Button Target Link</label>
                        <input 
                          type="text" 
                          value={config.hero_cta_link || ''}
                          onChange={(e) => setConfig({ ...config, hero_cta_link: e.target.value })}
                          placeholder="e.g. /ready-to-eat"
                        />
                      </div>
                    </div>

                    <h3 style={{ margin: '15px 0 10px', fontSize: '18px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', color: 'var(--title-color)' }}>
                      Homepage Component Visibility Toggles
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <input 
                          type="checkbox" 
                          id="show_featured_review" 
                          checked={config.show_featured_review}
                          onChange={(e) => setConfig({ ...config, show_featured_review: e.target.checked })}
                          style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                        />
                        <label htmlFor="show_featured_review" style={{ fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>Show Featured Reviews Section</label>
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
                        <Save size={16} /> Sync Homepage Settings
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
                        <Save size={16} /> Save Content Configurations
                      </button>
                    </div>
                  </form>
                )}

                {/* 5. Marketing Hub tab */}
                {activeTab === 'marketing' && (
                  <form onSubmit={(e) => { e.preventDefault(); saveConfigToServer(config); }} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <h3 style={{ margin: '0 0 10px', fontSize: '18px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', color: 'var(--title-color)' }}>
                      Storefront Announcements & Promotional Banners
                    </h3>

                    <div className="form-field">
                      <label>Top Navbar Announcement Ticker Message</label>
                      <input 
                        type="text" 
                        value={config.banner}
                        onChange={(e) => setConfig({ ...config, banner: e.target.value })}
                        placeholder="Promotional banner message shown at header"
                      />
                    </div>

                    <h3 style={{ margin: '15px 0 10px', fontSize: '18px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', color: 'var(--title-color)' }}>
                      Storefront Modal Popup Promo Dialog
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
                        <label>Promo Popup Message content</label>
                        <input 
                          type="text" 
                          value={config.popup_message}
                          onChange={(e) => setConfig({ ...config, popup_message: e.target.value })}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '5px' }}>
                      <input 
                        type="checkbox" 
                        id="show_promo_popup" 
                        checked={config.show_promo_popup}
                        onChange={(e) => setConfig({ ...config, show_promo_popup: e.target.checked })}
                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                      />
                      <label htmlFor="show_promo_popup" style={{ fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>Show Modal Popup Dialog on storefront loading</label>
                    </div>

                    <div style={{ marginTop: '20px' }}>
                      <button type="submit" className="page-action-btn" style={{ padding: '12px 24px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <Save size={16} /> Sync Marketing Campaign
                      </button>
                    </div>
                  </form>
                )}
              </>
            )}
          </div>
        </div>

        <div className="admin-footer">
          <div>&copy; 2026 <strong>Amma's Kitchen Admin</strong>. All Rights Reserved.</div>
        </div>
      </div>
    </div>
  );
};

export default WebsiteManagement;
