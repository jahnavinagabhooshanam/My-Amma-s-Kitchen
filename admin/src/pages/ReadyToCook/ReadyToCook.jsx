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
  Clock, 
  Save, 
  X, 
  CheckCircle, 
  AlertTriangle,
  FolderOpen
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

const ReadyToCook = () => {
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
    cooking_instructions: '',
    shelf_life: '',
    price: '',
    offer_price: '',
    diet_type: 'Veg',
    is_available: true,
    image: '/assets/images/placeholder.jpg'
  });

  const [activeFilter, setActiveFilter] = useState('All');

  const parseDescription = (desc) => {
    try {
      const parsed = JSON.parse(desc);
      return {
        text: parsed.text || '',
        instructions: parsed.instructions || '',
        shelf_life: parsed.shelf_life || ''
      };
    } catch (e) {
      return {
        text: desc || '',
        instructions: '',
        shelf_life: ''
      };
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/products?category=ready_to_cook');
      setProducts(response.data);
    } catch (err) {
      console.error("Failed to load ready to cook items:", err);
      setErrorMsg("Failed to load products. Check backend connectivity.");
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
      cooking_instructions: '',
      shelf_life: '',
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
    const parsedDesc = parseDescription(product.description);
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: parsedDesc.text,
      cooking_instructions: parsedDesc.instructions,
      shelf_life: parsedDesc.shelf_life,
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
      setErrorMsg("Failed to upload image.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price) {
      setErrorMsg("Product name and price are required.");
      return;
    }

    const descriptionJSON = JSON.stringify({
      text: formData.description,
      instructions: formData.cooking_instructions,
      shelf_life: formData.shelf_life
    });

    const payload = {
      name: formData.name,
      description: descriptionJSON,
      price: parseFloat(formData.price),
      offer_price: formData.offer_price ? parseFloat(formData.offer_price) : null,
      category: 'ready_to_cook',
      image: formData.image,
      diet_type: formData.diet_type,
      stock_count: 50,
      in_stock: formData.is_available
    };

    try {
      if (editingProduct) {
        await apiClient.put(`/products/${editingProduct.id}`, payload);
        setSuccessMsg("Ready to Cook product updated successfully!");
      } else {
        await apiClient.post('/products/', payload);
        setSuccessMsg("Ready to Cook product added successfully!");
      }
      setShowModal(false);
      fetchProducts();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error("Save product failed:", err);
      setErrorMsg(err.response?.data?.error || "Failed to save product.");
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this ready-to-cook pack?")) return;
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
    const currentStatus = product.in_stock !== undefined ? product.in_stock : product.is_available;
    const newAvailability = !currentStatus;

    // Optimistic UI update
    setProducts(prevProducts => 
      prevProducts.map(p => 
        p.id === product.id 
          ? { ...p, in_stock: newAvailability, is_available: newAvailability, stock: newAvailability ? 50 : 0, stock_count: newAvailability ? 50 : 0 } 
          : p
      )
    );

    try {
      await apiClient.patch(`/products/${product.id}/status`, { is_available: newAvailability });
      setSuccessMsg(newAvailability ? `Product Activated: ${product.name}` : `Product Marked Out Of Stock: ${product.name}`);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error("Failed to toggle availability:", err);
      // Rollback on failure
      setProducts(prevProducts => 
        prevProducts.map(p => 
          p.id === product.id 
            ? { ...p, in_stock: currentStatus, is_available: currentStatus, stock: currentStatus ? 50 : 0, stock_count: currentStatus ? 50 : 0 } 
            : p
        )
      );
      setErrorMsg("Failed to update availability status.");
      setTimeout(() => setErrorMsg(''), 3000);
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesFilter = true;
    if (activeFilter === 'Veg') matchesFilter = p.diet_type === 'Veg' || !p.diet_type;
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
              <h2>Ready To Cook Management</h2>
              <p>Manage instant mixes, shelf life, prep times, and cook ingredients packs</p>
            </div>

            <button className="page-action-btn" onClick={handleOpenAddModal} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Plus size={16} /> Add Product
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

          {/* Table Toolbar */}
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
                placeholder="Search ready-to-cook list..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
            <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--body-color)' }}>
              Showing {filteredProducts.length} Products
            </div>
          </div>

          {loading ? (
            <div className="admin-food-grid">
              {[1, 2, 3].map(n => (
                <div key={n} style={{ height: '280px', backgroundColor: '#e2ebd9', borderRadius: '16px', animation: 'pulse 1.5s infinite' }} />
              ))}
            </div>
          ) : (
            <div className="admin-food-grid">
              {filteredProducts.map((p) => {
                const parsed = parseDescription(p.description);
                const inStock = p.in_stock !== undefined ? p.in_stock : p.is_available;
                return (
                  <div className={`food-standard-card ${!inStock ? 'unavailable' : ''}`} key={p.id}>
                    <div className="food-card-image">
                      <img src={resolveImagePath(p.image)} alt={p.name} onError={(e) => { e.target.src = '/assets/images/placeholder.jpg' }} />
                      <span className="food-badge" style={{ backgroundColor: 'var(--theme-color2)', color: '#000' }}>RTC Mix</span>
                      <div className="actions" style={{ display: 'flex', gap: '4px' }}>
                        <button className="icon-btn" onClick={() => handleOpenEditModal(p)} title="Edit Details" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Pencil size={12} />
                        </button>
                        <button className="icon-btn danger" onClick={() => handleDeleteProduct(p.id)} title="Delete Product" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>

                    <div className="food-card-content">
                      <div className="food-rating">
                        <span className={`badge-status ${inStock ? 'active' : 'inactive'}`}>
                          {inStock ? 'Available' : 'Out of Stock'}
                        </span>
                        <label className="switch" style={{ position: 'relative', display: 'inline-block', width: '34px', height: '20px', cursor: 'pointer', marginLeft: '8px' }}>
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
                        {parsed.shelf_life && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: '600', color: '#888' }}>
                            <Clock size={12} /> Shelf Life: {parsed.shelf_life}
                          </span>
                        )}
                      </div>

                      <h3 className="product-title">{p.name}</h3>
                      <p className="product-desc" style={{ maxHeight: '55px', overflow: 'hidden' }}>{parsed.text}</p>

                      {parsed.instructions && (
                        <div style={{ fontSize: '11px', backgroundColor: 'var(--smoke-color)', padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--border-color)', margin: '8px 0', color: 'var(--title-color)', fontStyle: 'italic' }}>
                          <strong>Instructions:</strong> {parsed.instructions}
                        </div>
                      )}

                      <div className="food-card-footer" style={{ marginTop: 'auto' }}>
                        <div className="price">
                          ₹{p.price.toFixed(2)}
                          {p.offer_price && <del>₹{p.offer_price.toFixed(2)}</del>}
                        </div>
                        <div className="stock-badge">
                          {p.unit || 'Pack'}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredProducts.length === 0 && (
                <div style={{ gridColumn: '1 / -1', padding: '50px', textAlign: 'center', backgroundColor: '#fff', borderRadius: '15px', border: '1px solid var(--border-color)', color: '#888' }}>
                  <FolderOpen size={40} style={{ marginBottom: '15px', color: 'var(--theme-color2)', marginLeft: 'auto', marginRight: 'auto' }} />
                  <div>No ready-to-cook items found.</div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Form */}
        {showModal && (
          <div className="admin-modal show">
            <div className="admin-modal-content">
              <div className="admin-modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3>{editingProduct ? 'Edit Ready To Cook Details' : 'Add Ready To Cook Product'}</h3>
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
                      placeholder="e.g. Paneer Tikka Gravy Mix"
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
                        placeholder="180.00"
                      />
                    </div>
                    <div className="form-field">
                      <label>Offer Price (₹)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.offer_price}
                        onChange={(e) => setFormData({ ...formData, offer_price: e.target.value })}
                        placeholder="160.00"
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
                      <label>Shelf Life</label>
                      <input
                        type="text"
                        value={formData.shelf_life}
                        onChange={(e) => setFormData({ ...formData, shelf_life: e.target.value })}
                        placeholder="e.g. 3 Months"
                      />
                    </div>
                  </div>

                  <div className="form-field">
                    <label>Cooking Instructions</label>
                    <input
                      type="text"
                      value={formData.cooking_instructions}
                      onChange={(e) => setFormData({ ...formData, cooking_instructions: e.target.value })}
                      placeholder="e.g. Heat for 5 mins, add paneer chunks and serve."
                    />
                  </div>

                  <div className="form-field">
                    <label>Product Description *</label>
                    <textarea
                      rows="2"
                      required
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Rich and creamy cashew-tomato base mix."
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
                        {formData.image && formData.image !== '/assets/images/placeholder.jpg' ? (
                          <img src={resolveImagePath(formData.image)} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.src = '/assets/images/placeholder.jpg' }} />
                        ) : (
                          <Plus size={30} color="#aaa" />
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          style={{ display: 'none' }}
                        />
                      </label>
                      <div style={{ flexGrow: 1 }}>
                        <div style={{ fontSize: '13px', color: '#666', marginBottom: '4px' }}>
                          Click the box to {formData.image && formData.image !== '/assets/images/placeholder.jpg' ? 'change' : 'upload'} image
                        </div>
                        {uploadingImage && <span style={{ fontSize: '12px', color: 'var(--theme-color)', display: 'block', fontWeight: 'bold' }}>Uploading image...</span>}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="admin-modal-footer">
                  <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="page-action-btn" style={{ borderRadius: '20px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <Save size={16} /> Save Product
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

export default ReadyToCook;
