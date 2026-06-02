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
  MoreVertical, 
  X, 
  CheckCircle, 
  AlertTriangle,
  Save,
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

const BatterProducts = () => {
  const [batters, setBatters] = useState([]);
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [tab, setTab] = useState('variants'); // 'catalogs' or 'variants'
  const [activeDropdown, setActiveDropdown] = useState(null);

  // Modals state
  const [showCatalogModal, setShowCatalogModal] = useState(false);
  const [showVariantModal, setShowVariantModal] = useState(false);

  // Editing state
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
      category: 'batter_products',
      image: catalogForm.image,
      stock_count: parseInt(catalogForm.stock),
      in_stock: catalogForm.is_available
    };

    try {
      if (editingCatalog) {
        await apiClient.put(`/products/${editingCatalog.id}`, payload);
        setSuccessMsg("Batter product catalog updated!");
      } else {
        await apiClient.post('/products/', payload);
        setSuccessMsg("New Batter product catalog added!");
      }
      setShowCatalogModal(false);
      fetchData();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to save batter product catalog.");
    }
  };

  const handleDeleteCatalog = async (id) => {
    if (!window.confirm("Delete this entire batter catalog category?")) return;
    try {
      await apiClient.delete(`/products/${id}`);
      setSuccessMsg("Catalog category deleted!");
      fetchData();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to delete catalog category.");
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
        product_name: batters[0]?.name || 'Artisan Idli & Dosa Batter',
        variant: 'Standard Pack',
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
        setSuccessMsg("Batter size variant updated!");
      } else {
        await apiClient.post('/products/batter-variants', payload);
        setSuccessMsg("New Batter size variant created!");
      }
      setShowVariantModal(false);
      fetchData();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to save batter size variant.");
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

  const filteredCatalogs = batters.filter(b =>
    b.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredVariants = variants.filter(v =>
    v.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.variant.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="admin-wrapper">
      <AdminSidebar />
      <div className="admin-container">
        <AdminNavbar />

        <div className="admin-content">
          <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
            <div className="page-title-area">
              <h2>Batter Products Management</h2>
              <p>Manage raw fermented batters, organic millet grains batters, and control packaging variants</p>
            </div>

            <div className="flex gap-1">
              <button onClick={() => setTab('catalogs')} className={`th-btn ${tab === 'catalogs' ? 'style9' : 'style10'}`} style={{ border: 'none', cursor: 'pointer', padding: '10px 15px', borderRadius: '20px' }}>
                Batter Types
              </button>
              <button onClick={() => setTab('variants')} className={`th-btn ${tab === 'variants' ? 'style9' : 'style10'}`} style={{ border: 'none', cursor: 'pointer', padding: '10px 15px', borderRadius: '20px' }}>
                Size Variants (500g-5kg)
              </button>
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
                placeholder={`Search batter ${tab}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>

            <button className="page-action-btn" onClick={() => tab === 'catalogs' ? handleOpenCatalogModal() : handleOpenVariantModal()} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Plus size={16} /> Add {tab === 'catalogs' ? 'Batter Type' : 'Size Variant'}
            </button>
          </div>

          {loading ? (
            <div style={{ height: '200px', backgroundColor: '#e2ebd9', borderRadius: '15px', animation: 'pulse 1.5s infinite' }} />
          ) : tab === 'catalogs' ? (
            /* Catalogs Grid rendering */
            <div className="admin-food-grid">
              {filteredCatalogs.map(b => (
                <div className="food-standard-card" key={b.id}>
                  <div className="food-card-image">
                    <img src={resolveImagePath(b.image)} alt={b.name} onError={(e) => { e.target.src = '/assets/images/placeholder.jpg' }} />
                    <span className="food-badge">Batter Product</span>
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
                    <div className="food-rating">
                      <span className={`badge-status ${(b.in_stock !== undefined ? b.in_stock : b.is_available) ? 'active' : 'inactive'}`}>
                        {(b.in_stock !== undefined ? b.in_stock : b.is_available) ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </div>
                    <h3 className="product-title">{b.name}</h3>
                    <p className="product-desc">{b.description}</p>
                    <div className="food-card-footer">
                      <span className="price">₹{b.price.toFixed(2)}</span>
                      <span className="stock-badge">Main Catalog ID #{b.id}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Variants Table rendering */
            <div className="premium-card">
              <div className="responsive-table-wrapper" style={{ border: 'none', boxShadow: 'none' }}>
                <table className="responsive-table">
                  <thead>
                    <tr>
                      <th>Variant Details</th>
                      <th>Size / weight</th>
                      <th>Price</th>
                      <th>Offer Price</th>
                      <th>Stock Quantity</th>
                      <th>Manufacture / Expiry</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredVariants.map(v => (
                      <tr key={v.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <img src={resolveImagePath(v.image)} alt={v.variant} style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover' }} onError={(e) => { e.target.src = '/assets/images/placeholder.jpg' }} />
                            <div>
                              <strong>{v.product_name}</strong>
                              <div className="text-muted" style={{ fontSize: '11px' }}>{v.variant}</div>
                            </div>
                          </div>
                        </td>
                        <td><span className="badge-status approved" style={{ padding: '4px 10px' }}>{v.weight || '1kg'}</span></td>
                        <td style={{ fontWeight: '700' }}>₹{v.price.toFixed(2)}</td>
                        <td style={{ fontWeight: '700', color: 'var(--theme-color)' }}>
                          {v.offer_price ? `₹${v.offer_price.toFixed(2)}` : '-'}
                        </td>
                        <td>
                          <span style={{ fontWeight: '700', color: v.stock < 10 ? 'var(--danger-color)' : 'inherit' }}>
                            {v.stock} packs
                          </span>
                        </td>
                        <td style={{ fontSize: '12px' }} className="text-muted">
                          <div>Mfg: {v.manufacture_date || 'N/A'}</div>
                          <div>Exp: {v.expiry_date || 'N/A'}</div>
                        </td>
                        <td>
                          <div style={{ position: 'relative', display: 'inline-block' }} onMouseLeave={() => setActiveDropdown(null)}>
                            <button 
                              onClick={() => setActiveDropdown(activeDropdown === v.id ? null : v.id)}
                              className="btn-secondary"
                              style={{ padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
                            >
                              <MoreVertical size={14} /> Actions
                            </button>
                            {activeDropdown === v.id && (
                              <div style={{
                                position: 'absolute',
                                right: 0,
                                top: '30px',
                                backgroundColor: '#fff',
                                border: '1px solid #EAE6DB',
                                borderRadius: '8px',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                zIndex: 100,
                                minWidth: '140px',
                                display: 'flex',
                                flexDirection: 'column',
                                padding: '4px 0'
                              }}>
                                <button 
                                  onClick={() => { handleOpenVariantModal(v); setActiveDropdown(null); }}
                                  style={{ padding: '8px 12px', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#333' }}
                                >
                                  <Pencil size={12} /> Edit Variant
                                </button>
                                <button 
                                  onClick={() => { handleDeleteVariant(v.id); setActiveDropdown(null); }}
                                  style={{ padding: '8px 12px', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#78281F', borderTop: '1px solid #FAF8F2' }}
                                >
                                  <Trash2 size={12} /> Delete Variant
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Catalog Modal */}
        {showCatalogModal && (
          <div className="admin-modal show">
            <div className="admin-modal-content">
              <div className="admin-modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3>{editingCatalog ? 'Edit Batter Category' : 'Create Batter Category'}</h3>
                <button className="admin-modal-close" onClick={() => setShowCatalogModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  <X size={18} />
                </button>
              </div>
              <form onSubmit={handleCatalogSubmit}>
                <div className="admin-modal-body">
                  <div className="form-field">
                    <label>Batter Name *</label>
                    <input
                      type="text"
                      required
                      value={catalogForm.name}
                      onChange={(e) => setCatalogForm({ ...catalogForm, name: e.target.value })}
                      placeholder="e.g. Traditional Millet Batter"
                    />
                  </div>
                  <div className="form-grid">
                    <div className="form-field">
                      <label>Default Price (₹) *</label>
                      <input
                        type="number"
                        required
                        value={catalogForm.price}
                        onChange={(e) => setCatalogForm({ ...catalogForm, price: e.target.value })}
                      />
                    </div>
                    <div className="form-field">
                      <label>Offer Price (₹)</label>
                      <input
                        type="number"
                        value={catalogForm.offer_price}
                        onChange={(e) => setCatalogForm({ ...catalogForm, offer_price: e.target.value })}
                      />
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
                    <Save size={16} /> Save Category
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Variant Modal */}
        {showVariantModal && (
          <div className="admin-modal show">
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
                    <label>Select Batter Category *</label>
                    <select
                      value={variantForm.product_name}
                      onChange={(e) => setVariantForm({ ...variantForm, product_name: e.target.value })}
                      style={{ height: '38px', background: '#fff' }}
                    >
                      {batters.map(b => (
                        <option key={b.id} value={b.name}>{b.name}</option>
                      ))}
                      {batters.length === 0 && <option value="Artisan Idli & Dosa Batter">Artisan Idli & Dosa Batter</option>}
                    </select>
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
                        style={{ height: '38px', background: '#fff' }}
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
