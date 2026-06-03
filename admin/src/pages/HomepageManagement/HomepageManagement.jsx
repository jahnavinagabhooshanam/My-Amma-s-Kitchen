import React, { useState, useEffect } from 'react';
import apiClient from '../../services/api';
import './HomepageManagement.css'; // Optional, I can add it next
import { Save, RefreshCw } from 'lucide-react';

const HomepageManagement = () => {
  const [config, setConfig] = useState({
    hero_banner: {},
    kitchen_pulse: {},
    trending_today: [],
    festivals: {},
    amma_recommends: {}
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/homepage/');
      setConfig({
        hero_banner: res.data.hero_banner || {},
        kitchen_pulse: res.data.kitchen_pulse || {},
        trending_today: res.data.trending_today || [],
        festivals: res.data.festivals || {},
        amma_recommends: res.data.amma_recommends || {}
      });
    } catch (err) {
      console.error(err);
      setMessage('Failed to fetch config');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      await apiClient.put('/homepage/', config);
      setMessage('Homepage configuration saved successfully!');
    } catch (err) {
      console.error(err);
      setMessage('Failed to save config');
    }
    setSaving(false);
  };

  const handleHeroChange = (field, value) => {
    setConfig(prev => ({
      ...prev,
      hero_banner: { ...prev.hero_banner, [field]: value }
    }));
  };

  const handlePulseChange = (key, field, value) => {
    setConfig(prev => ({
      ...prev,
      kitchen_pulse: {
        ...prev.kitchen_pulse,
        [key]: { ...prev.kitchen_pulse[key], [field]: value }
      }
    }));
  };

  const handleFestivalChange = (field, value) => {
    setConfig(prev => ({
      ...prev,
      festivals: { ...prev.festivals, [field]: value }
    }));
  };

  if (loading) return <div>Loading CMS...</div>;

  return (
    <div className="homepage-management-container">
      <div className="header-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Homepage Content Management</h2>
        <button className="btn-primary" onClick={handleSave} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: 'var(--primary-color, #28a745)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          <Save size={18} /> {saving ? 'Saving...' : 'Publish Changes'}
        </button>
      </div>

      {message && <div style={{ padding: '10px', background: message.includes('Failed') ? '#f8d7da' : '#d4edda', color: message.includes('Failed') ? '#721c24' : '#155724', marginBottom: '20px', borderRadius: '4px' }}>{message}</div>}

      <div className="cms-section">
        <h3>1. Hero Banner Settings</h3>
        <div className="form-group">
          <label>Background Image URL</label>
          <input type="text" value={config.hero_banner.bg_image || ''} onChange={(e) => handleHeroChange('bg_image', e.target.value)} />
        </div>
        <div className="form-group">
          <label>Title</label>
          <input type="text" value={config.hero_banner.title || ''} onChange={(e) => handleHeroChange('title', e.target.value)} />
        </div>
        <div className="form-group">
          <label>Subtitle</label>
          <input type="text" value={config.hero_banner.subtitle || ''} onChange={(e) => handleHeroChange('subtitle', e.target.value)} />
        </div>
        <div className="form-group">
          <label>Special Tag</label>
          <input type="text" value={config.hero_banner.special_tag || ''} onChange={(e) => handleHeroChange('special_tag', e.target.value)} />
        </div>
        <div className="form-group">
          <label>Special Title</label>
          <input type="text" value={config.hero_banner.special_title || ''} onChange={(e) => handleHeroChange('special_title', e.target.value)} />
        </div>
      </div>

      <div className="cms-section">
        <h3>2. Kitchen Pulse Cards</h3>
        <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '15px' }}>Override the dynamic cards shown in the Kitchen Pulse section.</p>
        <div className="pulse-grid-admin">
          {['most_ordered', 'customer_favorite', 'chef_recommendation', 'trending_product', 'todays_offer', 'seasonal_special'].map((key) => (
            <div key={key} className="pulse-item-editor">
              <h4 style={{ textTransform: 'capitalize', margin: '0 0 10px 0' }}>{key.replace('_', ' ')}</h4>
              <label>Dish Name</label>
              <input type="text" value={config.kitchen_pulse[key]?.name || ''} onChange={(e) => handlePulseChange(key, 'name', e.target.value)} />
              <label>Price</label>
              <input type="number" value={config.kitchen_pulse[key]?.price || ''} onChange={(e) => handlePulseChange(key, 'price', e.target.value)} />
              <label>Image URL</label>
              <input type="text" value={config.kitchen_pulse[key]?.img || ''} onChange={(e) => handlePulseChange(key, 'img', e.target.value)} />
            </div>
          ))}
        </div>
      </div>

      <div className="cms-section">
        <h3>3. Festival Experiences</h3>
        <div className="form-group">
          <label>Is Active?</label>
          <input type="checkbox" checked={config.festivals.is_active || false} onChange={(e) => handleFestivalChange('is_active', e.target.checked)} />
        </div>
        {config.festivals.is_active && (
          <>
            <div className="form-group">
              <label>Tag</label>
              <input type="text" value={config.festivals.tag || ''} onChange={(e) => handleFestivalChange('tag', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Title</label>
              <input type="text" value={config.festivals.title || ''} onChange={(e) => handleFestivalChange('title', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Description</label>
              <input type="text" value={config.festivals.description || ''} onChange={(e) => handleFestivalChange('description', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Button Text</label>
              <input type="text" value={config.festivals.btn_text || ''} onChange={(e) => handleFestivalChange('btn_text', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Background Image URL</label>
              <input type="text" value={config.festivals.bg_image || ''} onChange={(e) => handleFestivalChange('bg_image', e.target.value)} />
            </div>
          </>
        )}
      </div>

    </div>
  );
};

export default HomepageManagement;
