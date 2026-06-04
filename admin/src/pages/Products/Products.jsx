import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminNavbar from '../../components/AdminNavbar';
import '../../assets/styles/admin-style.css';
import '../../assets/styles/tables.css';
import apiClient from '../../services/api';
import { CheckCircle, AlertTriangle } from 'lucide-react';

const Products = () => {
  const [rtes, setRtes] = useState([]);
  const [rtcs, setRtcs] = useState([]);
  const [batters, setBatters] = useState([]);
  const [category, setCategory] = useState('batter'); // 'batter', 'rte', 'rtc'
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({ name: '', price: '', unit: '', type: 'Veg' });
  const [showAddForm, setShowAddForm] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchCatalog = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const productsRes = await apiClient.get('/products/');
      const allProducts = productsRes.data;
      
      setRtes(allProducts.filter(p => p.category === 'ready-to-eat' || p.category === 'ready_to_eat'));
      setRtcs(allProducts.filter(p => p.category === 'ready-to-cook' || p.category === 'ready_to_cook'));

      const batterRes = await apiClient.get('/products/batter-variants');
      setBatters(batterRes.data.map(b => ({
        id: b.id,
        name: b.product_name,
        price: b.price,
        unit: b.variant || b.weight,
        description: `Variant: ${b.variant}, Weight: ${b.weight}, Stock: ${b.stock}`
      })));
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to load catalog data from the server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, []);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price) return;
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (category === 'batter') {
        const payload = {
          product_name: form.name,
          variant: form.unit || '1kg Pouch',
          weight: form.unit || '1kg',
          price: parseFloat(form.price),
          stock: 100,
          expiry_date: '',
          manufacture_date: '',
          image: '/assets/images/placeholder.jpg'
        };
        await apiClient.post('/products/batter-variants', payload);
      } else {
        const payload = {
          name: form.name,
          price: parseFloat(form.price),
          category: category === 'rte' ? 'ready_to_eat' : 'ready_to_cook',
          description: "Homestyle authentic item prepared daily with organic components.",
          image: '/assets/images/placeholder.jpg',
          stock: 100,
          in_stock: true,
          diet_type: form.type
        };
        await apiClient.post('/products/', payload);
      }

      setSuccessMsg("Catalog item added successfully.");
      setForm({ name: '', price: '', unit: '', type: 'Veg' });
      setShowAddForm(false);
      fetchCatalog();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to create catalog item.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this catalog item?")) return;
    setErrorMsg('');
    setSuccessMsg('');
    try {
      if (category === 'batter') {
        await apiClient.delete(`/products/batter-variants/${id}`);
      } else {
        await apiClient.delete(`/products/${id}`);
      }
      setSuccessMsg("Catalog item deleted successfully.");
      fetchCatalog();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to delete catalog item.");
    }
  };

  const getActiveList = () => {
    if (category === 'batter') return batters;
    if (category === 'rte') return rtes;
    return rtcs;
  };

  return (
    <div className="admin-wrapper">
      <AdminSidebar />
      
      <div className="admin-container">
        <AdminNavbar />
 
        <div className="admin-content">
          <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="page-title-area">
              <h2>Menu Catalog Management</h2>
              <p>Create new food entries, modify public prices, and review batter lists</p>
            </div>
            
            <div className="flex gap-1">
              <button onClick={() => setCategory('batter')} className={`th-btn ${category === 'batter' ? 'style9' : 'style10'}`} style={{ border: 'none', cursor: 'pointer', padding: '10px 20px' }}>
                Artisan Batters
              </button>
              <button onClick={() => setCategory('rte')} className={`th-btn ${category === 'rte' ? 'style9' : 'style10'}`} style={{ border: 'none', cursor: 'pointer', padding: '10px 20px' }}>
                Ready to Eat
              </button>
              <button onClick={() => setCategory('rtc')} className={`th-btn ${category === 'rtc' ? 'style9' : 'style10'}`} style={{ border: 'none', cursor: 'pointer', padding: '10px 20px' }}>
                Ready to Cook
              </button>
            </div>
          </div>
 
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
            <button onClick={() => setShowAddForm(!showAddForm)} className="th-btn style9" style={{ border: 'none', cursor: 'pointer' }}>
              + Add Catalog Item
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
 
          {/* Inline Add Item Form */}
          {showAddForm && (
            <form onSubmit={handleAddSubmit} className="card flex flex-col gap-2" style={{ padding: '24px', marginBottom: '30px', backgroundColor: '#FFFFFF', border: '2px solid var(--primary-light)', borderRadius: '15px' }}>
              <h4 style={{ color: 'var(--primary-dark)', margin: 0 }}>Add New Item to {category.toUpperCase()}</h4>
              
              <div className="row">
                <div className="form-group col-md-3">
                  <label className="form-label">Product Name *</label>
                  <input type="text" className="form-control" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="form-group col-md-3">
                  <label className="form-label">Price (₹) *</label>
                  <input type="number" step="0.01" className="form-control" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
                </div>
                <div className="form-group col-md-3">
                  <label className="form-label">Weight / Pack Unit *</label>
                  <input type="text" className="form-control" placeholder="e.g., 1kg Pack" required value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
                </div>
                <div className="form-group col-md-3">
                  <label className="form-label">Diet Type *</label>
                  <select className="form-control" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} style={{ height: '50px' }}>
                    <option value="Veg">Veg</option>
                    <option value="Non-Veg">Non-Veg</option>
                  </select>
                </div>
              </div>
 
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="submit" className="th-btn" style={{ border: 'none', cursor: 'pointer' }}>Save Item</button>
                <button type="button" onClick={() => setShowAddForm(false)} className="btn-secondary" style={{ border: '1px solid #EAE6DB', padding: '10px 20px', borderRadius: '50px', cursor: 'pointer' }}>Cancel</button>
              </div>
            </form>
          )}
 
          {/* Main items grid/table list */}
          <div className="premium-card">
            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>Loading catalog items...</div>
            ) : (
              <div className="responsive-table-wrapper" style={{ border: 'none', boxShadow: 'none' }}>
                <table className="responsive-table">
                  <thead>
                    <tr>
                      <th>Item ID</th>
                      <th>Product Details</th>
                      <th>Price</th>
                      <th>Pack Unit</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getActiveList().map((p) => (
                      <tr key={p.id}>
                        <td>#{p.id}</td>
                        <td>
                          <strong>{p.name}</strong>
                          <div className="text-muted" style={{ fontSize: '11px' }}>{p.description || "Homestyle authentic item prepared daily."}</div>
                        </td>
                        <td style={{ fontWeight: '700' }}>₹{p.price.toFixed(2)}</td>
                        <td className="text-muted">{p.unit}</td>
                        <td>
                          <button onClick={() => handleDelete(p.id)} className="btn-secondary text-danger" style={{ padding: '6px 12px', border: '1px solid #EAE6DB', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                    {getActiveList().length === 0 && (
                      <tr>
                        <td colSpan="5" className="text-center text-muted" style={{ padding: '40px' }}>No items in this category.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
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
 
export default Products;
