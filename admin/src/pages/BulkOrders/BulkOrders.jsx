import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminNavbar from '../../components/AdminNavbar';
import apiClient from '../../services/api';
import '../../assets/styles/admin-style.css';
import '../../assets/styles/tables.css';
import { Search, Mail, Phone, FileText, Printer, CheckCircle, AlertTriangle, X, Save } from 'lucide-react';

const BulkOrders = () => {
  const [bulks, setBulks] = useState([]);
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  
  // Quote modal state
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [quoteDetails, setQuoteDetails] = useState({
    pricePerPlate: 250,
    additionalCharges: 1500,
    notes: 'Includes buffet setup, warmers, and transport within Chennai city limits.'
  });

  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchBulksAndPartners = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/bulk_orders/');
      setBulks(response.data);

      const partnersRes = await apiClient.get('/delivery-management/');
      setPartners(partnersRes.data);
    } catch (err) {
      console.error("Failed to load bulk data:", err);
      setErrorMsg("Failed to load bulk inquiries or delivery boys.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBulksAndPartners();
  }, []);

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await apiClient.put(`/bulk_orders/${id}`, { status: newStatus });
      setSuccessMsg(`Inquiry status updated to ${newStatus}`);
      fetchBulksAndPartners();
      setTimeout(() => setSuccessMsg(''), 4500);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to update inquiry status.");
    }
  };

  const handlePartnerChange = async (bulkId, partnerId) => {
    try {
      const pId = partnerId === '' ? null : parseInt(partnerId);
      await apiClient.put(`/bulk_orders/${bulkId}`, { assigned_partner_id: pId });
      setSuccessMsg(`Delivery partner assigned to inquiry successfully.`);
      fetchBulksAndPartners();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to assign delivery partner.");
      setTimeout(() => setErrorMsg(''), 4000);
    }
  };

  const handleOpenQuoteModal = (inquiry) => {
    setSelectedInquiry(inquiry);
    const guests = inquiry.expected_guests || 100;
    setQuoteDetails({
      pricePerPlate: 250,
      additionalCharges: 1500,
      notes: `Includes buffet setup, bio-degradable plates, servers, and transport. Sambar, Chutney, soft Idli, and Artisan Dosa counter setup.`
    });
  };

  const handlePrintQuote = async () => {
    const printWindow = window.open('', '_blank');
    const platePrice = parseFloat(quoteDetails.pricePerPlate) || 0;
    const addCharges = parseFloat(quoteDetails.additionalCharges) || 0;
    const count = selectedInquiry.expected_guests || 0;
    
    // CGST & SGST Calculations
    const taxableSubtotal = (platePrice * count) + addCharges;
    const cgst = taxableSubtotal * 0.025; // 2.5% CGST
    const sgst = taxableSubtotal * 0.025; // 2.5% SGST
    const total = taxableSubtotal + cgst + sgst;

    printWindow.document.write(`
      <html>
        <head>
          <title>Hotel Amma's Kitchen - GST Invoice #${selectedInquiry.id}</title>
          <style>
            body { font-family: 'Inter', sans-serif; padding: 40px; color: #1b3d2b; line-height: 1.5; }
            .header { text-align: center; border-bottom: 3px double #3F9065; padding-bottom: 20px; }
            .logo { font-size: 26px; font-weight: bold; color: #3F9065; }
            .invoice-box { max-width: 800px; margin: auto; }
            .invoice-title { text-align: center; text-transform: uppercase; margin-top: 25px; color: #3F9065; font-size: 20px; font-weight: 800; }
            table { width: 100%; border-collapse: collapse; margin-top: 30px; }
            table th, table td { border: 1px solid #d8ebdE; padding: 12px; text-align: left; }
            table th { background-color: #EDF3F0; }
            .total-row { font-weight: bold; }
            .total-box { text-align: right; margin-top: 35px; font-size: 18px; font-weight: bold; color: #3F9065; }
            .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #888; }
            .badge-gst { float: right; border: 1px solid #3F9065; padding: 3px 8px; color: #3F9065; font-size: 12px; font-weight: bold; border-radius: 4px; }
          </style>
        </head>
        <body>
          <div class="invoice-box">
            <div class="header">
              <span class="badge-gst">GSTIN: 33AAHFH5678Q1Z2</span>
              <div class="logo">HOTEL AMMA'S KITCHEN</div>
              <div>Slow Stone-Ground Heritage Batters & Premium Catering</div>
              <div>Mylapore, Chennai | orders@ammaskitchen.com</div>
            </div>
            
            <h2 class="invoice-title">GST Tax Invoice</h2>
            
            <p><strong>Invoice Number:</strong> AMMA-BULK-${selectedInquiry.id}</p>
            <p><strong>Invoice Date:</strong> ${new Date().toLocaleDateString()}</p>
            <p><strong>Client Name:</strong> ${selectedInquiry.customer_name}</p>
            <p><strong>Email / Mobile:</strong> ${selectedInquiry.email} | ${selectedInquiry.phone}</p>
            <p><strong>Event Category:</strong> ${selectedInquiry.company || 'Catering Lunch'}</p>
            <p><strong>Scheduled Event Date:</strong> ${selectedInquiry.event_date}</p>
            
            <table>
              <thead>
                <tr>
                  <th>Item / Service Description</th>
                  <th>Quantity / Guests</th>
                  <th>Rate per Plate</th>
                  <th>Amount (INR)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Catering Buffet Menu (${selectedInquiry.items_requested || 'Traditional South Indian Meals'})</td>
                  <td>${count} Guests</td>
                  <td>₹${platePrice.toFixed(2)}</td>
                  <td>₹${(platePrice * count).toFixed(2)}</td>
                </tr>
                <tr>
                  <td>Setup, Servers & Logistics Charges</td>
                  <td>1 Event</td>
                  <td>₹${addCharges.toFixed(2)}</td>
                  <td>₹${addCharges.toFixed(2)}</td>
                </tr>
                <tr class="total-row" style="background-color: #fcfcfc;">
                  <td colspan="3" style="text-align: right;">Taxable Subtotal:</td>
                  <td>₹${taxableSubtotal.toFixed(2)}</td>
                </tr>
                <tr>
                  <td colspan="3" style="text-align: right; color: #666; font-size: 13px;">CGST @ 2.5%:</td>
                  <td style="color: #666; font-size: 13px;">₹${cgst.toFixed(2)}</td>
                </tr>
                <tr>
                  <td colspan="3" style="text-align: right; color: #666; font-size: 13px;">SGST @ 2.5%:</td>
                  <td style="color: #666; font-size: 13px;">₹${sgst.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
            
            <div class="total-box">
              Grand Total (Incl. GST): ₹${total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            
            <div style="margin-top: 30px; border-top: 1px dashed #ccc; padding-top: 15px; font-size: 13px;">
              <strong>Terms & Conditions:</strong><br/>
              ${quoteDetails.notes}<br/>
              • 50% advance to be paid for booking confirmation.<br/>
              • GST registration is subject to standard state rules.
            </div>
            
            <div class="footer">
              Thank you for partnering with Hotel Amma's Kitchen. We feed hearts daily.
            </div>
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();

    try {
      await apiClient.put(`/bulk_orders/${selectedInquiry.id}`, { invoice_generated: true });
      setSelectedInquiry(null);
      fetchBulksAndPartners();
    } catch (err) {
      console.error(err);
    }
  };

  // Filtering Logic
  const filteredBulks = bulks.filter(b => {
    const matchesSearch = b.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          b.phone.includes(searchQuery) ||
                          (b.company && b.company.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'All' || b.status === statusFilter;
    const matchesCategory = categoryFilter === 'All' || b.company === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  return (
    <div className="admin-wrapper">
      <AdminSidebar />
      <div className="admin-container">
        <AdminNavbar />
        
        <div className="admin-content">
          <div className="page-header">
            <div className="page-title-area">
              <h2>Bulk Catering Inquiries & ERP Dispatch</h2>
              <p>Moderate catering events, assign drivers, and issue printable GST Tax Invoices.</p>
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
          <div className="premium-card" style={{ padding: '20px 25px', marginBottom: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
            <div className="navbar-search" style={{ margin: 0, width: '300px', border: '1px solid #EAE6DB', borderRadius: '10px', display: 'flex', alignItems: 'center' }}>
              <Search size={16} style={{ marginRight: '8px', color: '#888' }} />
              <input 
                type="text" 
                placeholder="Search by client or phone..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
            
            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
              {/* Category Filter */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600' }}>Event Type:</label>
                <select 
                  value={categoryFilter} 
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  style={{ padding: '8px 12px', border: '1px solid #EAE6DB', borderRadius: '10px', backgroundColor: '#fff', fontSize: '13px' }}
                >
                  <option value="All">All Categories</option>
                  <option value="Corporate">Corporate</option>
                  <option value="Wedding">Wedding</option>
                  <option value="Birthday">Birthday</option>
                  <option value="Temple">Temple</option>
                  <option value="School">School</option>
                  <option value="College">College</option>
                </select>
              </div>

              {/* Status Filter */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600' }}>Status:</label>
                <select 
                  value={statusFilter} 
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{ padding: '8px 12px', border: '1px solid #EAE6DB', borderRadius: '10px', backgroundColor: '#fff', fontSize: '13px' }}
                >
                  <option value="All">All Inquiries</option>
                  <option value="Submitted">Submitted / Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </div>
          </div>

          {loading ? (
            <div style={{ height: '240px', backgroundColor: '#e2ebd9', borderRadius: '15px', animation: 'pulse 1.5s infinite' }} />
          ) : (
            <div className="premium-card">
              <div className="responsive-table-wrapper" style={{ border: 'none', boxShadow: 'none' }}>
                <table className="responsive-table">
                  <thead>
                    <tr>
                      <th>Inquiry ID</th>
                      <th>Customer Details</th>
                      <th>Event Specifications</th>
                      <th>Notes / Menu</th>
                      <th>Invoice</th>
                      <th>Assign Partner</th>
                      <th>Status Moderation</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBulks.map((b) => (
                      <tr key={b.id}>
                        <td><strong>#BULK-{b.id}</strong></td>
                        <td>
                          <strong>{b.customer_name}</strong>
                          <div style={{ fontSize: '11px', color: '#888', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Mail size={10} />{b.email}
                          </div>
                          <div style={{ fontSize: '11px', color: '#888', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Phone size={10} />{b.phone}
                          </div>
                        </td>
                        <td>
                          <div><strong>Type:</strong> {b.company || 'Catering'}</div>
                          <div style={{ fontSize: '12px' }}><strong>Guests:</strong> {b.expected_guests} Plates</div>
                          <div style={{ fontSize: '12px', color: 'var(--theme-color)', fontWeight: '700' }}>
                            <strong>Date:</strong> {b.event_date}
                          </div>
                        </td>
                        <td style={{ fontSize: '12px', fontStyle: 'italic', maxWidth: '200px' }}>
                          "{b.items_requested || 'No special requirements listed.'}"
                        </td>
                        <td>
                          <span className={`badge-status ${b.invoice_generated ? 'completed' : 'pending'}`}>
                            {b.invoice_generated ? 'Issued (GST)' : 'Pending'}
                          </span>
                        </td>
                        <td>
                          <select
                            value={b.assigned_partner_id || ''}
                            onChange={(e) => handlePartnerChange(b.id, e.target.value)}
                            style={{ padding: '6px', fontSize: '12px', border: '1px solid #EAE6DB', borderRadius: '8px', backgroundColor: '#fff', fontWeight: '600', maxWidth: '140px' }}
                          >
                            <option value="">Unassigned</option>
                            {partners.map(p => (
                              <option key={p.id} value={p.id}>{p.name} ({p.status})</option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <select
                            value={b.status}
                            onChange={(e) => handleStatusUpdate(b.id, e.target.value)}
                            style={{ padding: '6px', fontSize: '12px', border: '1px solid #EAE6DB', borderRadius: '8px', backgroundColor: '#fff', fontWeight: '600' }}
                          >
                            <option value="Submitted">Submitted</option>
                            <option value="Approved">Approved</option>
                            <option value="Rejected">Rejected</option>
                          </select>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '5px', flexDirection: 'column' }}>
                            <button onClick={() => handleOpenQuoteModal(b)} className="th-btn" style={{ padding: '6px 10px', fontSize: '12px', border: 'none', cursor: 'pointer', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <FileText size={12} /> GST Invoice
                            </button>
                            <a href={`https://wa.me/${b.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="btn-secondary" style={{ padding: '6px 10px', fontSize: '12px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                              WhatsApp
                            </a>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {filteredBulks.length === 0 && (
                      <tr>
                        <td colSpan="8" className="text-center text-muted" style={{ padding: '40px' }}>
                          No bulk catering requests found matching filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Generate Quote Invoice Modal */}
        {selectedInquiry && (
          <div className="admin-modal show">
            <div className="admin-modal-content" style={{ maxWidth: '500px' }}>
              <div className="admin-modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3>Generate GST Tax Invoice</h3>
                <button className="admin-modal-close" onClick={() => setSelectedInquiry(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'inline-flex' }}>
                  <X size={18} />
                </button>
              </div>
              <div className="admin-modal-body">
                <p style={{ fontSize: '13px' }}>Configure CGST (2.5%) and SGST (2.5%) billing for <strong>{selectedInquiry.customer_name}</strong>'s event.</p>
                
                <div className="form-grid">
                  <div className="form-field">
                    <label>Price Per Plate (₹) *</label>
                    <input 
                      type="number" 
                      value={quoteDetails.pricePerPlate} 
                      onChange={(e) => setQuoteDetails({ ...quoteDetails, pricePerPlate: e.target.value })} 
                    />
                  </div>
                  <div className="form-field">
                    <label>Logistics & Setup Fee (₹)</label>
                    <input 
                      type="number" 
                      value={quoteDetails.additionalCharges} 
                      onChange={(e) => setQuoteDetails({ ...quoteDetails, additionalCharges: e.target.value })} 
                    />
                  </div>
                </div>

                <div className="form-field">
                  <label>Quotation Terms / Notes</label>
                  <textarea 
                    rows="3" 
                    value={quoteDetails.notes} 
                    onChange={(e) => setQuoteDetails({ ...quoteDetails, notes: e.target.value })} 
                  />
                </div>
              </div>
              <div className="admin-modal-footer">
                <button className="btn-secondary" onClick={() => setSelectedInquiry(null)}>Cancel</button>
                <button className="page-action-btn" onClick={handlePrintQuote} style={{ borderRadius: '20px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <Printer size={14} /> Generate &amp; Print GST Invoice
                </button>
              </div>
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

export default BulkOrders;
