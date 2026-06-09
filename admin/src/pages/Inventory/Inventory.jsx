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
  Save
} from 'lucide-react';

const Inventory = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDropdown, setActiveDropdown] = useState(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);
  
  // Modals & Forms State
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  const [formData, setFormData] = useState({
    item_name: '',
    stock_quantity: '',
    stock_used: '0',
    minimum_stock: '',
    unit: 'kg'
  });

  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/inventory/');
      setItems(response.data);
    } catch (err) {
      console.error("Failed to load inventory:", err);
      setErrorMsg("Failed to load inventory stock.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setFormData({
      item_name: '',
      stock_quantity: '',
      stock_used: '0',
      minimum_stock: '',
      unit: 'kg'
    });
    setErrorMsg('');
    setShowAddModal(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      item_name: item.product_name,
      stock_quantity: item.stock,
      stock_used: item.stock_used.toString(),
      minimum_stock: item.min_required,
      unit: item.unit
    });
    setErrorMsg('');
    setShowAddModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.item_name || formData.stock_quantity === '' || formData.minimum_stock === '') {
      setErrorMsg("All fields are required.");
      return;
    }

    const payload = {
      product_name: formData.item_name,
      stock_quantity: parseInt(formData.stock_quantity),
      stock_used: parseInt(formData.stock_used || 0),
      minimum_stock: parseInt(formData.minimum_stock),
      unit: formData.unit
    };

    try {
      if (editingItem) {
        await apiClient.put(`/inventory/${editingItem.id}`, payload);
        setSuccessMsg("Stock updated successfully!");
      } else {
        await apiClient.post('/inventory/', payload);
        setSuccessMsg("Stock item added successfully!");
      }
      setShowAddModal(false);
      fetchInventory();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to save stock updates.");
    }
  };

  const handleDeleteItem = async (id, name) => {
    if (!window.confirm(`Delete ${name} from inventory tracking?`)) return;
    try {
      await apiClient.delete(`/inventory/${id}`);
      setSuccessMsg("Item deleted successfully!");
      fetchInventory();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to delete inventory item.");
    }
  };

  const filteredItems = items.filter(item => 
    item.product_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="admin-wrapper">
      <AdminSidebar />
      <div className="admin-container">
        <AdminNavbar />
        
        <div className="admin-content">
          <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
            <div className="page-title-area">
              <h2>Inventory & Stock Levels</h2>
              <p>Monitor raw commodities (Rice, Urad Dal, Millet, Oil) and Packaging Materials.</p>
            </div>
            
            <button className="page-action-btn" onClick={handleOpenAddModal} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Plus size={16} /> Add Stock Item
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

          {/* Search Box */}
          <div className="premium-card" style={{ padding: '15px 25px', marginBottom: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
            <div className="navbar-search" style={{ margin: 0, width: '320px', border: '1px solid #EAE6DB', borderRadius: '10px', display: 'flex', alignItems: 'center' }}>
              <Search size={16} style={{ marginRight: '8px', color: '#888' }} />
              <input 
                type="text" 
                placeholder="Search raw ingredients..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
            <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--body-color)' }}>
              Tracking {filteredItems.length} Stock Commodities
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '25px', alignItems: 'start' }}>
            {/* Inventory Levels Table */}
            {loading ? (
              <div style={{ height: '240px', backgroundColor: '#e2ebd9', borderRadius: '15px', animation: 'pulse 1.5s infinite' }} />
            ) : (
              <div className="premium-card" style={{ margin: 0 }}>
                <div className="responsive-table-wrapper" style={{ border: 'none', boxShadow: 'none' }}>
                  <table className="responsive-table">
                    <thead>
                      <tr>
                        <th>Commodity Code</th>
                        <th>Item Name</th>
                        <th>Current Stock</th>
                        <th>Stock Used</th>
                        <th>Remaining Stock</th>
                        <th>Minimum Threshold</th>
                        <th>Stock Alert</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map(item => {
                        const isLow = item.remaining_stock < item.min_required;
                        return (
                          <tr key={item.id}>
                            <td data-label="Commodity Code"><strong>#RAW-{item.id}</strong></td>
                            <td data-label="Item Name">
                              <strong>{item.product_name}</strong>
                            </td>
                            <td data-label="Current Stock">{item.stock} {item.unit}</td>
                            <td data-label="Stock Used">{item.stock_used} {item.unit}</td>
                            <td data-label="Remaining Stock" style={{ fontSize: '15px', fontWeight: '700', color: 'var(--theme-color)' }}>
                              {item.remaining_stock} {item.unit}
                            </td>
                            <td data-label="Minimum Threshold" className="text-muted">{item.min_required} {item.unit}</td>
                            <td data-label="Stock Alert">
                              <span className={`badge-status ${isLow ? 'inactive' : 'approved'}`}>
                                {isLow ? 'Low Stock Warning' : 'Healthy Level'}
                              </span>
                            </td>
                            <td data-label="Actions">
                              <div style={{ position: 'relative', display: 'inline-block' }} onMouseLeave={() => setActiveDropdown(null)}>
                                <button 
                                  onClick={() => setActiveDropdown(activeDropdown === item.id ? null : item.id)}
                                  className="btn-secondary"
                                  style={{ padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
                                >
                                  <MoreVertical size={14} /> Actions
                                </button>
                                {activeDropdown === item.id && (
                                  <div style={{
                                    position: 'absolute',
                                    right: 0,
                                    top: '30px',
                                    backgroundColor: '#fff',
                                    border: '1px solid #EAE6DB',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                    zIndex: 100,
                                    minWidth: '150px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    padding: '4px 0'
                                  }}>
                                    <button 
                                      onClick={() => { handleOpenEditModal(item); setActiveDropdown(null); }}
                                      style={{ padding: '8px 12px', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#333' }}
                                    >
                                      <Pencil size={12} /> Adjust Stock
                                    </button>
                                    <button 
                                      onClick={() => { handleDeleteItem(item.id, item.product_name); setActiveDropdown(null); }}
                                      style={{ padding: '8px 12px', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#78281F', borderTop: '1px solid #FAF8F2' }}
                                    >
                                      <Trash2 size={12} /> Delete Item
                                    </button>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}

                      {filteredItems.length === 0 && (
                        <tr>
                          <td colSpan="8" className="text-center text-muted" style={{ padding: '30px' }}>
                            No raw ingredients found matching filter.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                
                {/* Pagination Controls */}
                {Math.ceil(filteredItems.length / itemsPerPage) > 1 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', padding: '15px 25px', borderTop: '1px solid #FAF8F2', flexWrap: 'wrap', gap: '15px' }}>
                    <div style={{ fontSize: '13px', color: '#666' }}>
                      Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredItems.length)} to {Math.min(currentPage * itemsPerPage, filteredItems.length)} of {filteredItems.length} entries
                    </div>
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <button 
                        disabled={currentPage === 1} 
                        onClick={() => setCurrentPage(prev => prev - 1)}
                        style={{ padding: '6px 12px', fontSize: '12px', border: '1px solid #EAE6DB', borderRadius: '6px', backgroundColor: currentPage === 1 ? '#FAF8F2' : '#fff', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', color: currentPage === 1 ? '#aaa' : '#333' }}
                      >
                        Previous
                      </button>
                      {Array.from({ length: Math.ceil(filteredItems.length / itemsPerPage) }, (_, i) => i + 1).map(page => (
                        <button 
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          style={{ padding: '6px 12px', fontSize: '12px', border: '1px solid', borderColor: currentPage === page ? 'var(--primary-color)' : '#EAE6DB', borderRadius: '6px', backgroundColor: currentPage === page ? 'var(--primary-color)' : '#fff', color: currentPage === page ? '#fff' : '#333', fontWeight: currentPage === page ? '700' : 'normal', cursor: 'pointer' }}
                        >
                          {page}
                        </button>
                      ))}
                      <button 
                        disabled={currentPage === Math.ceil(filteredItems.length / itemsPerPage)} 
                        onClick={() => setCurrentPage(prev => prev + 1)}
                        style={{ padding: '6px 12px', fontSize: '12px', border: '1px solid #EAE6DB', borderRadius: '6px', backgroundColor: currentPage === Math.ceil(filteredItems.length / itemsPerPage) ? '#FAF8F2' : '#fff', cursor: currentPage === Math.ceil(filteredItems.length / itemsPerPage) ? 'not-allowed' : 'pointer', color: currentPage === Math.ceil(filteredItems.length / itemsPerPage) ? '#aaa' : '#333' }}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Add/Edit Stock Modal */}
        {showAddModal && (
          <div className="admin-modal show">
            <div className="admin-modal-content">
              <div className="admin-modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3>{editingItem ? 'Adjust Inventory Stock' : 'Add New Inventory Item'}</h3>
                <button className="admin-modal-close" onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  <X size={18} />
                </button>
              </div>
              <form onSubmit={handleFormSubmit}>
                <div className="admin-modal-body">
                  <div className="form-field">
                    <label>Ingredient / Material Name *</label>
                    <input 
                      type="text" 
                      required 
                      value={formData.item_name} 
                      onChange={(e) => setFormData({ ...formData, item_name: e.target.value })} 
                      placeholder="e.g. Organic Finger Millet"
                    />
                  </div>

                  <div className="form-grid">
                    <div className="form-field">
                      <label>Total Stock Quantity *</label>
                      <input 
                        type="number" 
                        required 
                        value={formData.stock_quantity} 
                        onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })} 
                        placeholder="500"
                      />
                    </div>
                    <div className="form-field">
                      <label>Stock Used *</label>
                      <input 
                        type="number" 
                        required 
                        value={formData.stock_used} 
                        onChange={(e) => setFormData({ ...formData, stock_used: e.target.value })} 
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div className="form-grid">
                    <div className="form-field">
                      <label>Measuring Unit *</label>
                      <input 
                        type="text" 
                        required 
                        value={formData.unit} 
                        onChange={(e) => setFormData({ ...formData, unit: e.target.value })} 
                        placeholder="e.g. kg, Pcs, Litre"
                      />
                    </div>
                    <div className="form-field">
                      <label>Warning Threshold *</label>
                      <input 
                        type="number" 
                        required 
                        value={formData.minimum_stock} 
                        onChange={(e) => setFormData({ ...formData, minimum_stock: e.target.value })} 
                        placeholder="100"
                      />
                    </div>
                  </div>
                </div>
                <div className="admin-modal-footer">
                  <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                  <button type="submit" className="page-action-btn" style={{ borderRadius: '20px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <Save size={16} /> Save Stock Details
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="admin-footer">
          <div>&copy; 2026 <strong>Ammulu's Kitchen Admin</strong>. All Rights Reserved.</div>
        </div>
      </div>
    </div>
  );
};

export default Inventory;
