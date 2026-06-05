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
  X, 
  CheckCircle, 
  AlertTriangle,
  Save,
  FolderOpen
} from 'lucide-react';

const CATEGORIES = [
  { id: 'traditional', label: 'Traditional Batters' },
  { id: 'millet', label: 'Millet Batters' },
  { id: 'health', label: 'Health Batters' },
  { id: 'family_packs', label: 'Family Packs' },
  { id: 'premium', label: 'Premium Batters' },
  { id: 'subscription', label: 'Subscription Plans' }
];

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

const BatterProducts = () => {
  const [batters, setBatters] = useState([]);
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('traditional');

  // Modals state
  const [showCatalogModal, setShowCatalogModal] = useState(false);
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [showManageVariantsModal, setShowManageVariantsModal] = useState(false);

  // Selected entities
  const [selectedProductForVariants, setSelectedProductForVariants] = useState(null);
  const [editingCatalog, setEditingCatalog] = useState(null);
  const [editingVariant, setEditingVariant] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Catalog Form Fields
  const [catalogForm, setCatalogForm] = useState({
    name: '',
    description: '',
    price: '',
    offer_price: '',
    stock: 50,
    is_available: true,
    category: 'traditional',
    image: '/assets/images/placeholder.jpg'
  });

  // Variant Form Fields
  const [variantForm, setVariantForm] = useState({
    product_name: '',
    variant: 'Standard Pouch',
    weight: '1kg',
    price: '',
    offer_price: '',
    stock: 50,
    expiry_date: '',
    manufacture_date: '',
    image: '/assets/images/placeholder.jpg'
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const catalogsRes = await apiClient.get('/products?category=batter_products');
      setBatters(catalogsRes.data);

      const variantsRes = await apiClient.get('/products/batter-variants');
      setVariants(variantsRes.data);
    } catch (err) {
      console.error("Failed to load batter products data:", err);
      setErrorMsg("Failed to load batter items. Check backend connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Image Upload helper
  const handleImageUpload = async (e, formType) => {
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
      if (formType === 'catalog') {
        setCatalogForm(prev => ({ ...prev, image: response.data.image_url }));
      } else {
        setVariantForm(prev => ({ ...prev, image: response.data.image_url }));
      }
      setSuccessMsg("Image uploaded successfully!");
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error("Upload failed:", err);
      setErrorMsg("Failed to upload image.");
    } finally {
      setUploadingImage(false);
    }
  };

  // Catalog Handlers
  const handleOpenCatalogModal = (cat = null) => {
    if (cat) {
      setEditingCatalog(cat);
      setCatalogForm({
        name: cat.name,
        description: cat.description,
        price: cat.price,
        offer_price: cat.offer_price || '',
        stock: cat.stock_count || cat.stock || 0,
        is_available: cat.in_stock !== undefined ? cat.in_stock : cat.is_available,
        category: cat.category ? cat.category.replace('-', '_') : 'traditional',
        image: cat.image
      });
    } else {
      setEditingCatalog(null);
      setCatalogForm({
        name: '',
        description: '',
        price: '',
        offer_price: '',
        stock: 50,
        is_available: true,
        category: activeCategory,
        image: '/assets/images/placeholder.jpg'
      });
    }
    setErrorMsg('');
    setShowCatalogModal(true);
  };

  const handleCatalogSubmit = async (e) => {
    e.preventDefault();
    if (!catalogForm.name || !catalogForm.price) {
      setErrorMsg("Name and Price are required.");
      return;
    }
    const payload = {
      name: catalogForm.name,
      description: catalogForm.description,
      price: parseFloat(catalogForm.price),
      offer_price: catalogForm.offer_price ? parseFloat(catalogForm.offer_price) : null,
      category: catalogForm.category,
      image: catalogForm.image,
      stock_count: parseInt(catalogForm.stock),
      in_stock: catalogForm.is_available
    };

    try {
      if (editingCatalog) {
        await apiClient.put(`/products/${editingCatalog.id}`, payload);
        setSuccessMsg("Catalog item updated!");
      } else {
        await apiClient.post('/products/', payload);
        setSuccessMsg("New catalog item added!");
      }
      setShowCatalogModal(false);
      fetchData();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to save catalog item.");
    }
  };

  const handleDeleteCatalog = async (id) => {
    if (!window.confirm("Delete this catalog item?")) return;
    try {
      await apiClient.delete(`/products/${id}`);
      setSuccessMsg("Catalog item deleted!");
      fetchData();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to delete catalog item.");
    }
  };

  // Variant Handlers
  const handleOpenVariantModal = (v = null) => {
    if (v) {
      setEditingVariant(v);
      setVariantForm({
        product_name: v.product_name,
        variant: v.variant,
        weight: v.weight,
        price: v.price,
        offer_price: v.offer_price || '',
        stock: v.stock,
        expiry_date: v.expiry_date || '',
        manufacture_date: v.manufacture_date || '',
        image: v.image
      });
    } else {
      setEditingVariant(null);
      setVariantForm({
        product_name: selectedProductForVariants ? selectedProductForVariants.name : (batters[0]?.name || ''),
        variant: 'Standard Pouch',
        weight: '1kg',
        price: '',
        offer_price: '',
        stock: 50,
        expiry_date: '',
        manufacture_date: '',
        image: '/assets/images/placeholder.jpg'
      });
    }
    setErrorMsg('');
    setShowVariantModal(true);
  };

  const handleVariantSubmit = async (e) => {
    e.preventDefault();
    if (!variantForm.product_name || !variantForm.price) {
      setErrorMsg("Main product mapping and price are required.");
      return;
    }
    const payload = {
      product_name: variantForm.product_name,
      variant: variantForm.variant,
      weight: variantForm.weight,
      price: parseFloat(variantForm.price),
      offer_price: variantForm.offer_price ? parseFloat(variantForm.offer_price) : null,
      stock: parseInt(variantForm.stock),
      expiry_date: variantForm.expiry_date,
      manufacture_date: variantForm.manufacture_date,
      image: variantForm.image
    };

    try {
      if (editingVariant) {
        await apiClient.put(`/products/batter-variants/${editingVariant.id}`, payload);
        setSuccessMsg("Size variant updated!");
      } else {
        await apiClient.post('/products/batter-variants', payload);
        setSuccessMsg("New size variant created!");
      }
      setShowVariantModal(false);
      fetchData();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to save size variant.");
    }
  };

  const handleDeleteVariant = async (id) => {
    if (!window.confirm("Are you sure you want to delete this size variant?")) return;
    try {
      await apiClient.delete(`/products/batter-variants/${id}`);
      setSuccessMsg("Variant deleted!");
      fetchData();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to delete size variant.");
    }
  };

  // Filter products by selected category and search query
  const filteredCatalogs = batters.filter(b => {
    const matchesSearch = b.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          b.description.toLowerCase().includes(searchQuery.toLowerCase());
    const dbCat = b.category ? b.category.replace('-', '_') : '';
    const matchesCategory = dbCat === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="admin-wrapper">
      <AdminSidebar />
      <div className="admin-container">
        <AdminNavbar />

        <div className="admin-content">
          <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
            <div className="page-title-area">
              <h2>Batter Product Catalog</h2>
              <p>Manage traditional, millet, health batters, subscription plans, and configure pack variants.</p>
            </div>

            <div className="flex gap-1" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {CATEGORIES.map(cat => (
                <button 
                  key={cat.id} 
                  onClick={() => setActiveCategory(cat.id)} 
                  className={`th-btn ${activeCategory === cat.id ? 'style9' : 'style10'}`} 
                  style={{ border: 'none', cursor: 'pointer', padding: '8px 16px', borderRadius: '20px', fontSize: '13px' }}
                >
                  {cat.label}
                </button>
              ))}
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

          {/* Table Toolbar */}
          <div className="premium-card" style={{ padding: '15px 25px', marginBottom: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
            <div className="navbar-search" style={{ margin: 0, width: '320px', border: '1px solid #EAE6DB', borderRadius: '10px', display: 'flex', alignItems: 'center' }}>
              <Search size={16} style={{ marginRight: '8px', color: '#888' }} />
              <input
                type="text"
                placeholder="Search catalog products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>

            <button className="page-action-btn" onClick={() => handleOpenCatalogModal()} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Plus size={16} /> Add Product
            </button>
          </div>

          {loading ? (
            <div style={{ height: '200px', backgroundColor: '#e2ebd9', borderRadius: '15px', animation: 'pulse 1.5s infinite' }} />
          ) : (
            <div className="admin-food-grid">
              {filteredCatalogs.map(b => {
                const inStock = b.in_stock !== undefined ? b.in_stock : b.is_available;
                return (
                  <div className={`food-standard-card ${!inStock ? 'unavailable' : ''}`} key={b.id}>
                    <div className="food-card-image">
                    <img src={resolveImagePath(b.image)} alt={b.name} onError={(e) => { e.target.src = '/assets/images/placeholder.jpg' }} />
                    <span className="food-badge" style={{ textTransform: 'capitalize' }}>
                      {b.category?.replace('_', ' ')}
                    </span>
                    <div className="actions" style={{ display: 'flex', gap: '4px' }}>
                      <button className="icon-btn" onClick={() => handleOpenCatalogModal(b)} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Pencil size={12} />
                      </button>
                      <button className="icon-btn danger" onClick={() => handleDeleteCatalog(b.id)} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                  <div className="food-card-content">
                    <div className="food-rating" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className={`badge-status ${(b.in_stock !== undefined ? b.in_stock : b.is_available) ? 'active' : 'inactive'}`}>
                        {(b.in_stock !== undefined ? b.in_stock : b.is_available) ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </div>
                    <h3 className="product-title" style={{ fontSize: '15px', margin: '8px 0' }}>{b.name}</h3>
                    <p className="product-desc" style={{ fontSize: '12px', minHeight: '36px' }}>{b.description}</p>
                    
                    <div className="food-card-footer" style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px', borderTop: '1px dashed #EAE6DB', paddingTop: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                        <span className="price" style={{ fontWeight: '700', fontSize: '1.1rem', color: 'var(--primary-color)' }}>
                          ₹{b.price.toFixed(2)}
                        </span>
                        <span className="stock-badge" style={{ fontSize: '11px', color: '#666' }}>
                          Stock: {b.stock_count}
                        </span>
                      </div>
                      
                      <button 
                        onClick={() => {
                          setSelectedProductForVariants(b);
                          setShowManageVariantsModal(true);
                        }}
                        className="btn-secondary"
                        style={{ width: '100%', padding: '8px 12px', fontSize: '12px', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', border: '1px solid #C9AB81', color: 'var(--title-color)', cursor: 'pointer', fontWeight: '600' }}
                      >
                        <FolderOpen size={14} /> Manage Variants
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
              {filteredCatalogs.length === 0 && (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#7E7A6B' }}>
                  No products found under this category.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Catalog Modal */}
        {showCatalogModal && (
          <div className="admin-modal show">
            <div className="admin-modal-content">
              <div className="admin-modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3>{editingCatalog ? 'Edit Product Item' : 'Create Product Item'}</h3>
                <button className="admin-modal-close" onClick={() => setShowCatalogModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  <X size={18} />
                </button>
              </div>
              <form onSubmit={handleCatalogSubmit}>
                <div className="admin-modal-body">
                  <div className="form-field">
                    <label>Product Name *</label>
                    <input
                      type="text"
                      required
                      value={catalogForm.name}
                      onChange={(e) => setCatalogForm({ ...catalogForm, name: e.target.value })}
                      placeholder="e.g. Millet Dosa Batter"
                    />
                  </div>

                  <div className="form-field">
                    <label>Category *</label>
                    <select
                      value={catalogForm.category}
                      onChange={(e) => setCatalogForm({ ...catalogForm, category: e.target.value })}
                      style={{ height: '38px', background: '#fff', border: '1px solid #EAE6DB', borderRadius: '8px', padding: '0 10px', width: '100%' }}
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-grid">
                    <div className="form-field">
                      <label>Default Price (₹) *</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={catalogForm.price}
                        onChange={(e) => setCatalogForm({ ...catalogForm, price: e.target.value })}
                      />
                    </div>
                    <div className="form-field">
                      <label>Offer Price (₹)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={catalogForm.offer_price}
                        onChange={(e) => setCatalogForm({ ...catalogForm, offer_price: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-grid">
                    <div className="form-field">
                      <label>Stock Count *</label>
                      <input
                        type="number"
                        required
                        value={catalogForm.stock}
                        onChange={(e) => setCatalogForm({ ...catalogForm, stock: e.target.value })}
                      />
                    </div>
                    <div className="form-field" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '30px' }}>
                      <input
                        type="checkbox"
                        id="is_available_chk"
                        checked={catalogForm.is_available}
                        onChange={(e) => setCatalogForm({ ...catalogForm, is_available: e.target.checked })}
                      />
                      <label htmlFor="is_available_chk" style={{ margin: 0, cursor: 'pointer' }}>Available in Store</label>
                    </div>
                  </div>

                  <div className="form-field">
                    <label>Description *</label>
                    <textarea
                      rows="3"
                      required
                      value={catalogForm.description}
                      onChange={(e) => setCatalogForm({ ...catalogForm, description: e.target.value })}
                    />
                  </div>

                  <div className="form-field">
                    <label>Image</label>
                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                      <img src={resolveImagePath(catalogForm.image)} alt="Preview" style={{ width: '50px', height: '50px', borderRadius: '8px', objectFit: 'cover' }} onError={(e) => { e.target.src = '/assets/images/placeholder.jpg' }} />
                      <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'catalog')} />
                    </div>
                  </div>
                </div>
                <div className="admin-modal-footer">
                  <button type="button" className="btn-secondary" onClick={() => setShowCatalogModal(false)}>Cancel</button>
                  <button type="submit" className="page-action-btn" style={{ borderRadius: '20px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <Save size={16} /> Save Product
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Manage Variants Modal */}
        {showManageVariantsModal && selectedProductForVariants && (
          <div className="admin-modal show">
            <div className="admin-modal-content" style={{ maxWidth: '800px', width: '90%' }}>
              <div className="admin-modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: 0 }}>Variants for {selectedProductForVariants.name}</h3>
                  <p className="text-muted" style={{ fontSize: '12px', margin: '4px 0 0 0' }}>Manage packaging sizes (500g, 1kg, 2kg, 5kg) and pricing</p>
                </div>
                <button 
                  className="admin-modal-close" 
                  onClick={() => {
                    setShowManageVariantsModal(false);
                    setSelectedProductForVariants(null);
                  }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <X size={18} />
                </button>
              </div>
              <div className="admin-modal-body">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                  <span style={{ fontSize: '13px', fontWeight: '600' }}>Active Pack Sizes</span>
                  <button 
                    type="button" 
                    className="page-action-btn"
                    onClick={() => handleOpenVariantModal()}
                    style={{ padding: '6px 12px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Plus size={14} /> Add Size Variant
                  </button>
                </div>

                <div className="responsive-table-wrapper" style={{ border: 'none', boxShadow: 'none' }}>
                  <table className="responsive-table" style={{ fontSize: '13px' }}>
                    <thead>
                      <tr>
                        <th>Pack Type</th>
                        <th>Size</th>
                        <th>Price</th>
                        <th>Offer Price</th>
                        <th>Stock</th>
                        <th>Mfg / Exp</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {variants.filter(v => v.product_name === selectedProductForVariants.name).length > 0 ? (
                        variants
                          .filter(v => v.product_name === selectedProductForVariants.name)
                          .map(v => (
                            <tr key={v.id}>
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <img 
                                    src={resolveImagePath(v.image)} 
                                    alt={v.variant} 
                                    style={{ width: '30px', height: '30px', borderRadius: '4px', objectFit: 'cover' }} 
                                    onError={(e) => { e.target.src = '/assets/images/placeholder.jpg' }} 
                                  />
                                  <strong>{v.variant}</strong>
                                </div>
                              </td>
                              <td><span className="badge-status approved" style={{ padding: '3px 8px' }}>{v.weight || '1kg'}</span></td>
                              <td style={{ fontWeight: '700' }}>₹{v.price.toFixed(2)}</td>
                              <td style={{ fontWeight: '700', color: 'var(--theme-color)' }}>
                                {v.offer_price ? `₹${v.offer_price.toFixed(2)}` : '-'}
                              </td>
                              <td>
                                <span style={{ fontWeight: '700', color: v.stock < 10 ? 'var(--danger-color)' : 'inherit' }}>
                                  {v.stock} packs
                                </span>
                              </td>
                              <td style={{ fontSize: '11px' }} className="text-muted">
                                <div>Mfg: {v.manufacture_date || 'N/A'}</div>
                                <div>Exp: {v.expiry_date || 'N/A'}</div>
                              </td>
                              <td>
                                <div style={{ display: 'flex', gap: '5px' }}>
                                  <button 
                                    type="button"
                                    onClick={() => handleOpenVariantModal(v)}
                                    className="icon-btn" 
                                    style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '6px' }}
                                    title="Edit Variant"
                                  >
                                    <Pencil size={12} />
                                  </button>
                                  <button 
                                    type="button"
                                    onClick={() => handleDeleteVariant(v.id)}
                                    className="icon-btn danger" 
                                    style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '6px' }}
                                    title="Delete Variant"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                      ) : (
                        <tr>
                          <td colSpan="7" style={{ textAlign: 'center', padding: '20px' }} className="text-muted">
                            No size packaging variants configured for this product.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="admin-modal-footer">
                <button 
                  type="button" 
                  className="btn-secondary" 
                  onClick={() => {
                    setShowManageVariantsModal(false);
                    setSelectedProductForVariants(null);
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Variant Modal */}
        {showVariantModal && (
          <div className="admin-modal show" style={{ zIndex: 1100 }}>
            <div className="admin-modal-content">
              <div className="admin-modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3>{editingVariant ? 'Edit Size Variant' : 'Add Size Variant'}</h3>
                <button className="admin-modal-close" onClick={() => setShowVariantModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  <X size={18} />
                </button>
              </div>
              <form onSubmit={handleVariantSubmit}>
                <div className="admin-modal-body">
                  <div className="form-field">
                    <label>Selected Product *</label>
                    <input
                      type="text"
                      readOnly
                      disabled
                      value={variantForm.product_name}
                      style={{ height: '38px', background: '#eee', cursor: 'not-allowed', width: '100%', border: '1px solid #EAE6DB', borderRadius: '8px', padding: '0 10px' }}
                    />
                  </div>

                  <div className="form-grid">
                    <div className="form-field">
                      <label>Variant Pack Label *</label>
                      <input
                        type="text"
                        required
                        value={variantForm.variant}
                        onChange={(e) => setVariantForm({ ...variantForm, variant: e.target.value })}
                        placeholder="e.g. Family Pack"
                      />
                    </div>
                    <div className="form-field">
                      <label>Size / Weight *</label>
                      <select
                        value={variantForm.weight}
                        onChange={(e) => setVariantForm({ ...variantForm, weight: e.target.value })}
                        style={{ height: '38px', background: '#fff', border: '1px solid #EAE6DB', borderRadius: '8px', padding: '0 10px', width: '100%' }}
                      >
                        <option value="500g">500g</option>
                        <option value="1kg">1kg</option>
                        <option value="2kg">2kg</option>
                        <option value="5kg">5kg</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-grid">
                    <div className="form-field">
                      <label>Price (₹) *</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={variantForm.price}
                        onChange={(e) => setVariantForm({ ...variantForm, price: e.target.value })}
                      />
                    </div>
                    <div className="form-field">
                      <label>Offer Price (₹)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={variantForm.offer_price}
                        onChange={(e) => setVariantForm({ ...variantForm, offer_price: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-grid">
                    <div className="form-field">
                      <label>Stock Count *</label>
                      <input
                        type="number"
                        required
                        value={variantForm.stock}
                        onChange={(e) => setVariantForm({ ...variantForm, stock: e.target.value })}
                      />
                    </div>
                    <div className="form-field">
                      <label>Manufacture Date</label>
                      <input
                        type="date"
                        value={variantForm.manufacture_date}
                        onChange={(e) => setVariantForm({ ...variantForm, manufacture_date: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-field">
                    <label>Expiry Date</label>
                    <input
                      type="date"
                      value={variantForm.expiry_date}
                      onChange={(e) => setVariantForm({ ...variantForm, expiry_date: e.target.value })}
                    />
                  </div>

                  <div className="form-field">
                    <label>Image</label>
                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                      <img src={resolveImagePath(variantForm.image)} alt="Preview" style={{ width: '50px', height: '50px', borderRadius: '8px', objectFit: 'cover' }} onError={(e) => { e.target.src = '/assets/images/placeholder.jpg' }} />
                      <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'variant')} />
                    </div>
                  </div>
                </div>
                <div className="admin-modal-footer">
                  <button type="button" className="btn-secondary" onClick={() => setShowVariantModal(false)}>Cancel</button>
                  <button type="submit" className="page-action-btn" style={{ borderRadius: '20px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <Save size={16} /> Save Variant
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

export default BatterProducts;
