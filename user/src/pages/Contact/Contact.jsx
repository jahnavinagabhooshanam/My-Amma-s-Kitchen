import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle } from 'lucide-react';

import SEO from '../../components/SEO';

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
    setForm({ name: '', email: '', message: '' });
  };

  return (
    <div className="contact-page space" style={{ backgroundColor: '#FCFBF7', minHeight: '80vh' }}>
      <SEO title="Contact Us" description="Reach out to Hotel Amma's Kitchen support, restaurant coordinates, kitchen address in Mylapore, Chennai, or call us directly." />
      <div className="container">
        
        <div className="title-area style9 text-center mb-40">
          <span className="sub-title">Connect with Amma</span>
          <h1 className="sec-title" style={{ fontSize: '2.5rem', color: 'var(--primary-dark)', marginTop: '8px' }}>
            We'd Love to Hear From You
          </h1>
          <p className="text-muted" style={{ maxWidth: '600px', margin: '12px auto 0' }}>
            Have feedback on our slow stone-ground batter or homestyle breakfast kesari? Reach our kitchen team directly.
          </p>
        </div>

        <div className="row gy-4 justify-content-center align-items-stretch" style={{ marginTop: '20px' }}>
          
          {/* Contact coordinates */}
          <div className="col-lg-5 flex flex-col gap-3">
            <div className="card flex gap-2" style={{ padding: '24px', backgroundColor: '#FFFFFF', border: '1px solid #EAE6DB', borderRadius: '15px', alignItems: 'center' }}>
              <div style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary-color)', padding: '10px', borderRadius: '50%' }}>
                <MapPin size={18} />
              </div>
              <div>
                <h5 style={{ margin: 0, fontWeight: '700' }}>Kitchen Address</h5>
                <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: '4px' }}>45, Temple Car Street, Mylapore, Chennai - 600004</p>
              </div>
            </div>

            <div className="card flex gap-2" style={{ padding: '24px', backgroundColor: '#FFFFFF', border: '1px solid #EAE6DB', borderRadius: '15px', alignItems: 'center' }}>
              <div style={{ backgroundColor: 'var(--secondary-light)', color: 'var(--secondary-color)', padding: '10px', borderRadius: '50%' }}>
                <Phone size={18} />
              </div>
              <div>
                <h5 style={{ margin: 0, fontWeight: '700' }}>Call / WhatsApp</h5>
                <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: '4px' }}>+91 98765 43210 / 044-24641020</p>
              </div>
            </div>

            <div className="card flex gap-2" style={{ padding: '24px', backgroundColor: '#FFFFFF', border: '1px solid #EAE6DB', borderRadius: '15px', alignItems: 'center' }}>
              <div style={{ backgroundColor: '#FEF9E7', color: '#F39C12', padding: '10px', borderRadius: '50%' }}>
                <Mail size={18} />
              </div>
              <div>
                <h5 style={{ margin: 0, fontWeight: '700' }}>Email Support</h5>
                <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: '4px' }}>order@ammaskitchen.com</p>
              </div>
            </div>
          </div>

          {/* Feedback Form */}
          <div className="col-lg-7">
            {sent ? (
              <div className="card text-center" style={{ padding: '50px 30px', backgroundColor: '#FFFFFF', border: '1px solid #EAE6DB', borderRadius: '15px' }}>
                <CheckCircle size={56} style={{ color: 'var(--secondary-color)', margin: '0 auto' }} />
                <h3 className="title-md" style={{ color: 'var(--secondary-dark)', marginTop: '20px' }}>Message Dispatched!</h3>
                <p className="text-muted" style={{ marginTop: '12px' }}>
                  Thank you! Amma reads every feedback submission personally. We will write back to you shortly.
                </p>
                <button onClick={() => setSent(false)} className="th-btn mt-4" style={{ border: 'none', cursor: 'pointer' }}>
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="card flex flex-col gap-2" style={{ padding: '30px', backgroundColor: '#FFFFFF', border: '1px solid #EAE6DB', borderRadius: '15px' }}>
                <h3 className="title-md" style={{ color: 'var(--primary-dark)', borderBottom: '1px solid #EAE6DB', paddingBottom: '10px' }}>
                  Send Direct Feedback
                </h3>

                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input type="text" className="form-control" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input type="email" className="form-control" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>

                <div className="form-group">
                  <label className="form-label">Your Message *</label>
                  <textarea rows="4" className="form-control" required value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
                </div>

                <div className="form-btn" style={{ marginTop: '12px' }}>
                  <button type="submit" className="th-btn style9 th-icon" style={{ border: 'none', cursor: 'pointer', width: '100%' }}>
                    <Send size={16} style={{ marginRight: '6px' }} /> Dispatch Message
                  </button>
                </div>
              </form>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Contact;
