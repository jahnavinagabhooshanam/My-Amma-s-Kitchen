import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminNavbar from '../../components/AdminNavbar';
import apiClient from '../../services/api';
import '../../assets/styles/admin-style.css';
import '../../assets/styles/tables.css';
import { 
  Plus, 
  Search, 
  Pencil, 
  Trash2, 
  FolderOpen, 
  Save, 
  X, 
  CheckCircle, 
  AlertTriangle 
} from 'lucide-react';

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

const ReadyToEat = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Form Fields State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    offer_price: '',
    diet_type: 'Veg',
    is_available: true,
    image: '/assets/images/placeholder.jpg'
  });

  const [activeFilter, setActiveFilter] = useState('All');

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/products?category=ready_to_eat');
      setProducts(response.data);
    } catch (err) {
      console.error("Failed to load ready to eat items:", err);
      setErrorMsg("Failed to load products. Using fallback catalog list.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      offer_price: '',
      diet_type: 'Veg',
      is_available: true,
      image: '/assets/images/placeholder.jpg'
    });
    setErrorMsg('');
    setShowModal(true);
  };

  const handleOpenEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      offer_price: product.offer_price || '',
      diet_type: product.diet_type || 'Veg',
      is_available: product.in_stock !== undefined ? product.in_stock : product.is_available,
      image: product.image
    });
    setErrorMsg('');
    setShowModal(true);
  };

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
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });
      setFormData(prev => ({ ...prev, image: response.data.image_url }));
      setSuccessMsg("Image uploaded successfully!");
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error("Image upload failed:", err);
      setErrorMsg("Failed to upload image. Please try again.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price) {
      setErrorMsg("Product Name and Price are required.");
      return;
    }

    const payload = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      offer_price: formData.offer_price ? parseFloat(formData.offer_price) : null,
      category: 'ready_to_eat',
      image: formData.image,
      diet_type: formData.diet_type,
      stock_count: 50,
      in_stock: formData.is_available
    };

    try {
      if (editingProduct) {
        // Edit flow
        await apiClient.put(`/products/${editingProduct.id}`, payload);
        setSuccessMsg("Product updated successfully!");
      } else {
        // Add flow
        await apiClient.post('/products/', payload);
        setSuccessMsg("Product added successfully!");
      }
      setShowModal(false);
      fetchProducts();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error("Save product failed:", err);
      setErrorMsg(err.response?.data?.error || "Failed to save product catalog. Check fields.");
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this food item?")) return;
    try {
      await apiClient.delete(`/products/${id}`);
      setSuccessMsg("Product deleted successfully!");
      fetchProducts();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error("Delete product failed:", err);
      setErrorMsg("Failed to delete product from database.");
    }
  };

  const handleToggleAvailability = async (product) => {
    const newAvailability = !(product.in_stock !== undefined ? product.in_stock : product.is_available);
    const payload = {
      in_stock: newAvailability,
      stock_count: newAvailability ? 50 : 0
    };
    try {
      await apiClient.put(`/products/${product.id}`, payload);
      setSuccessMsg(`Status updated for ${product.name}`);
      fetchProducts();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error("Failed to toggle availability:", err);
      setErrorMsg("Failed to update availability status.");
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    let matchesFilter = true;
    if (activeFilter === 'Veg') matchesFilter = (p.diet_type === 'Veg' || !p.diet_type);
    else if (activeFilter === 'Non-Veg') matchesFilter = p.diet_type === 'Non-Veg';

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="admin-wrapper">
      <AdminSidebar />
      <div className="admin-container">
        <AdminNavbar />

        <div className="admin-content">
          <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
            <div className="page-title-area">
              <h2>Ready To Eat Management</h2>
              <p>Create new food entries, adjust availability status, and modify serving prices</p>
            </div>

            <button className="page-action-btn" onClick={handleOpenAddModal} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Plus size={16} /> Add Food Item
            </button>
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

          {/* Table Toolbar Search and Filters */}
          <div className="premium-card" style={{ padding: '15px 25px', marginBottom: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
            <div style={{ display: 'flex', gap: '10px' }}>
              {['All', 'Veg', 'Non-Veg'].map(filter => (
                <button 
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`th-btn ${activeFilter === filter ? 'style9' : 'style10'}`} 
                  style={{ border: 'none', cursor: 'pointer', padding: '8px 16px', borderRadius: '20px', fontSize: '13px' }}
                >
                  {filter}
                </button>
              ))}
            </div>
            <div className="navbar-search" style={{ margin: 0, width: '320px', border: '1px solid #EAE6DB', borderRadius: '10px', display: 'flex', alignItems: 'center' }}>
              <Search size={16} style={{ marginRight: '8px', color: '#888' }} />
              <input
                type="text"
                placeholder="Search food items by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
            <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--body-color)' }}>
              Showing {filteredProducts.length} Items
            </div>
          </div>

          {loading ? (
            <div className="admin-food-grid">
              {[1, 2, 3, 4].map(n => (
                <div key={n} style={{ height: '280px', backgroundColor: '#e2ebd9', borderRadius: '16px', animation: 'pulse 1.5s infinite' }} />
              ))}
            </div>
          ) : (
            <div className="admin-food-grid">
              {filteredProducts.map((p) => {
                const inStock = p.in_stock !== undefined ? p.in_stock : p.is_available;
                return (
                  <div className={`food-standard-card ${!inStock ? 'unavailable' : ''}`} key={p.id}>
                    <div className="food-card-image">
                      <img src={resolveImagePath(p.image)} alt={p.name} onError={(e) => { e.target.src = '/assets/images/placeholder.jpg' }} />
                      <span className="food-badge">{p.unit || '1 Portion'}</span>
                      <div className="actions" style={{ display: 'flex', gap: '4px' }}>
                        <button className="icon-btn" onClick={() => handleOpenEditModal(p)} title="Edit Food Details" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Pencil size={12} />
                        </button>
                        <button className="icon-btn danger" onClick={() => handleDeleteProduct(p.id)} title="Delete Food Item" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>

                    <div className="food-card-content">
                      <div className="food-rating">
                        <span className={`badge-status ${inStock ? 'active' : 'inactive'}`}>
                          {inStock ? 'Available' : 'Out of Stock'}
                        </span>
                        <label className="switch" style={{ position: 'relative', display: 'inline-block', width: '34px', height: '20px', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={inStock}
                            onChange={() => handleToggleAvailability(p)}
                            style={{ position: 'absolute', opacity: 0, width: '100%', height: '100%', cursor: 'pointer', zIndex: 5, margin: 0 }}
                          />
                          <span className="slider round" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: inStock ? 'var(--theme-color)' : '#ccc', transition: '.4s', borderRadius: '34px', pointerEvents: 'none' }}>
                            <span style={{ position: 'absolute', content: '""', height: '14px', width: '14px', left: inStock ? '16px' : '4px', bottom: '3px', backgroundColor: 'white', transition: '.4s', borderRadius: '50%' }} />
                          </span>
                        </label>
                      </div>

                      <h3 className="product-title">{p.name}</h3>
                      <p className="product-desc">{p.description || "Fresh and authentic prepared daily with quality ingredients."}</p>

                      <div className="food-card-footer">
                        <div className="price">
                          ₹{p.price.toFixed(2)}
                          {p.offer_price && <del>₹{p.offer_price.toFixed(2)}</del>}
                        </div>
                        <div className="stock-badge">
                          Stock: {p.stock_count || p.stock || 0}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredProducts.length === 0 && (
                <div style={{ gridColumn: '1 / -1', padding: '50px', textAlign: 'center', backgroundColor: '#fff', borderRadius: '15px', border: '1px solid var(--border-color)', color: '#888' }}>
                  <FolderOpen size={40} style={{ marginBottom: '15px', color: 'var(--theme-color2)', marginLeft: 'auto', marginRight: 'auto' }} />
                  <div>No ready-to-eat products match your search.</div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Form Dialog */}
        {showModal && (
          <div className="admin-modal show">
            <div className="admin-modal-content">
              <div className="admin-modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3>{editingProduct ? 'Edit Food Item Details' : 'Add New Food Item'}</h3>
                <button className="admin-modal-close" onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  <X size={18} />
                </button>
              </div>
              <form onSubmit={handleFormSubmit}>
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
                        style={{ height: '38px', background: '#fff' }}
                      >
                        <option value="true">Available</option>
                        <option value="false">Out of Stock</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-field">
                    <label>Food Description *</label>
                    <textarea
                      rows="3"
                      required
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Steaming hot and crispy Dosa base served with sambar and fresh tomato-onion chutney."
                    />
                  </div>

                  <div className="form-field">
                    <label>Product Image</label>
                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginTop: '5px' }}>
                      <img src={resolveImagePath(formData.image)} alt="Preview" style={{ width: '60px', height: '60px', borderRadius: '10px', objectFit: 'cover', border: '1px solid #EAE6DB' }} onError={(e) => { e.target.src = '/assets/images/placeholder.jpg' }} />
                      <div style={{ flexGrow: 1 }}>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          style={{ border: 'none', padding: 0 }}
                        />
                        {uploadingImage && <span style={{ fontSize: '11px', color: 'var(--theme-color)', display: 'block', marginTop: '4px' }}>Uploading image...</span>}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="admin-modal-footer">
                  <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="page-action-btn" style={{ borderRadius: '20px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <Save size={16} /> Save Changes
                  </button>
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

export default ReadyToEat;
