import React, { useState } from 'react';
import { Send, CheckCircle } from 'lucide-react';
import apiClient from '../../services/api';





import SEO from '../../components/SEO';

const BulkOrders = () => {
  const [form, setForm] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    date: '',
    guests: '100',
    items: '',
    notes: '',
    eventType: 'Wedding'
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post('/bulk_orders', {
        customer_name: form.name,
        mobile: form.phone,
        email: form.email,
        event_type: form.eventType,
        event_date: form.date,
        guest_count: parseInt(form.guests),
        location: form.company || 'Chennai',
        food_package: form.items,
        special_request: form.notes
      });
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || 'Failed to submit quote request. Please try again.');
    }
  };

  return (
    <div className="bulk-orders-page space" style={{ backgroundColor: '#FCFBF7', minHeight: '80vh' }}>
      <SEO title="Bulk Catering & Feast Packages" description="Get a premium traditional catering quote from Hotel Amma's Kitchen for weddings, corporate events, and family gatherings." />
      <div className="container">
        
        {/* Banner Title */}
        <div className="title-area style9 text-center mb-50">
          <span className="sub-title">Catering & Wholesalers</span>
          <h1 className="sec-title" style={{ fontSize: '2.8rem', color: 'var(--primary-dark)', marginTop: '8px' }}>
            Bulk Catering & Feast Packages
          </h1>
          <p className="text-muted" style={{ maxWidth: '700px', margin: '12px auto 0', fontSize: '1.05rem', lineHeight: '1.6' }}>
            Enjoy the authentic taste of Amma's kitchen at your special events. From traditional leaf feasts to modern live counters, we deliver premium traditional hospitality.
          </p>
        </div>





        {/* SECTION 4: UPGRADED QUOTE REQUEST FORM */}
        <div id="quote-form" style={{ maxWidth: '800px', margin: '0 auto' }}>
          {submitted ? (
            <div className="card text-center" style={{ padding: '50px 30px', backgroundColor: '#FFFFFF', border: '1px solid #EAE6DB', borderRadius: '15px' }}>
              <CheckCircle size={56} style={{ color: 'var(--secondary-color)', margin: '0 auto' }} />
              <h3 className="title-md" style={{ color: 'var(--secondary-dark)', marginTop: '20px' }}>Inquiry Submitted Successfully!</h3>
              <p className="text-muted" style={{ marginTop: '12px', fontSize: '1rem', lineHeight: '1.6' }}>
                Thank you for contacting Hotel Amma's Kitchen! Our commercial event coordinator has scheduled your request and will call you within 3 hours with a formal proposal.
              </p>
              <button onClick={() => setSubmitted(false)} className="th-btn mt-4" style={{ border: 'none', cursor: 'pointer' }}>
                Submit Another Request
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="card flex flex-col gap-2" style={{ padding: '40px', backgroundColor: '#FFFFFF', border: '1px solid #EAE6DB', borderRadius: '16px', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ borderBottom: '1px solid #EAE6DB', paddingBottom: '15px', marginBottom: '20px' }}>
                <h3 className="title-md" style={{ color: 'var(--primary-dark)', margin: 0, fontSize: '1.5rem', fontFamily: 'var(--font-serif)' }}>
                  Request Commercial Catering Quote
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '6px' }}>Fill in your details below and we will tailor the perfect traditional feast menu.</p>
              </div>

              <div className="row">
                <div className="form-group col-md-6">
                  <label className="form-label">Full Name *</label>
                  <input type="text" className="form-control" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Rajesh Kumar" />
                </div>
                <div className="form-group col-md-6">
                  <label className="form-label">Event Location / Venue *</label>
                  <input type="text" className="form-control" required value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="e.g. Mylapore, Chennai" />
                </div>
              </div>

              <div className="row">
                <div className="form-group col-md-6">
                  <label className="form-label">Email Address *</label>
                  <input type="email" className="form-control" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="e.g. rajesh@example.com" />
                </div>
                <div className="form-group col-md-6">
                  <label className="form-label">Phone Number *</label>
                  <input type="tel" className="form-control" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="e.g. 9876543210" />
                </div>
              </div>

              <div className="row">
                <div className="form-group col-md-4">
                  <label className="form-label">Event Date *</label>
                  <input type="date" className="form-control" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                </div>
                <div className="form-group col-md-4">
                  <label className="form-label">Guest Count Range *</label>
                  <select className="form-control" value={form.guests} onChange={(e) => setForm({ ...form, guests: e.target.value })}>
                    <option value="50">50 - 100 Guests</option>
                    <option value="150">100 - 250 Guests</option>
                    <option value="350">250 - 500 Guests</option>
                    <option value="750">500 - 1000 Guests</option>
                    <option value="1500">1000+ Guests</option>
                  </select>
                </div>
                <div className="form-group col-md-4">
                  <label className="form-label">Event Category *</label>
                  <select className="form-control" value={form.eventType} onChange={(e) => setForm({ ...form, eventType: e.target.value })}>
                    <option value="Wedding">Wedding feast</option>
                    <option value="Corporate">Corporate buffet</option>
                    <option value="Birthday">Birthday party</option>
                    <option value="Traditional Tiffin">Traditional Tiffin Counter</option>
                    <option value="Other">Other celebration</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Selected Package / Menu Preferences *</label>
                <input type="text" className="form-control" required value={form.items} onChange={(e) => setForm({ ...form, items: e.target.value })} placeholder="e.g., Gold Traditional Feast / Only breakfast items" />
              </div>

              <div className="form-group">
                <label className="form-label">Special Inquiries or Requests</label>
                <textarea rows="3" className="form-control" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="e.g., Need live counters for dosas, onion-free items needed for pujas..." />
              </div>

              <div className="form-btn" style={{ marginTop: '16px' }}>
                <button type="submit" className="th-btn style9 th-icon" style={{ border: 'none', cursor: 'pointer', width: '100%', padding: '16px' }}>
                  <Send size={16} style={{ marginRight: '6px' }} /> Submit Catering Inquiry
                </button>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};

export default BulkOrders;
