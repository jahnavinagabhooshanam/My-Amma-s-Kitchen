import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle, MessageCircle, ExternalLink } from 'lucide-react';

import SEO from '../../components/SEO';
import './Contact.css';

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSent(true);
      setForm({ name: '', email: '', message: '' });
    }, 1200);
  };

  return (
    <div className="contact-page">
      <SEO title="Contact Us" description="Reach out to Hotel Amma's Kitchen support, restaurant coordinates, kitchen address in Mylapore, Chennai, or call us directly." />
      <div className="container">
        
        {/* Minimized Hero */}
        <div className="contact-hero">
          <span className="sub-title">Connect with Amma</span>
          <h1 className="sec-title">We'd Love to Hear From You</h1>
          <p>Have feedback on our slow stone-ground batter or homestyle breakfast? Reach our kitchen team directly.</p>
        </div>

        <div className="row gy-4 align-items-stretch">
          
          {/* Action-Oriented Contact Cards */}
          <div className="col-lg-5">
            <div className="contact-cards-wrapper">
              
              <a href="#map" className="contact-action-card">
                <div className="contact-card-left">
                  <div className="contact-card-icon icon-map">
                    <MapPin size={24} />
                  </div>
                  <div className="contact-card-info">
                    <h4>Kitchen Address</h4>
                    <p>45, Temple Car Street, Mylapore, Chennai</p>
                  </div>
                </div>
                <div className="contact-action-btn">
                  Open In Maps <ExternalLink size={14} style={{ marginLeft: '4px' }} />
                </div>
              </a>

              <a href="tel:+919876543210" className="contact-action-card">
                <div className="contact-card-left">
                  <div className="contact-card-icon icon-phone">
                    <Phone size={24} />
                  </div>
                  <div className="contact-card-info">
                    <h4>Call Support</h4>
                    <p>+91 98765 43210 / 044-24641020</p>
                  </div>
                </div>
                <div className="contact-action-btn">Call Now</div>
              </a>

              <a href="https://wa.me/919876543210" target="_blank" rel="noreferrer" className="contact-action-card">
                <div className="contact-card-left">
                  <div className="contact-card-icon icon-whatsapp">
                    <MessageCircle size={24} />
                  </div>
                  <div className="contact-card-info">
                    <h4>WhatsApp Support</h4>
                    <p>Instant messaging for quick queries</p>
                  </div>
                </div>
                <div className="contact-action-btn">Chat Now</div>
              </a>

              <a href="mailto:order@ammaskitchen.com" className="contact-action-card">
                <div className="contact-card-left">
                  <div className="contact-card-icon icon-email">
                    <Mail size={24} />
                  </div>
                  <div className="contact-card-info">
                    <h4>Email Support</h4>
                    <p>order@ammaskitchen.com</p>
                  </div>
                </div>
                <div className="contact-action-btn">Send Email</div>
              </a>

            </div>
          </div>

          {/* Premium Form */}
          <div className="col-lg-7">
            <div className="premium-contact-form">
              {sent ? (
                <div className="success-state">
                  <CheckCircle size={64} style={{ color: '#008000', margin: '0 auto 20px' }} />
                  <h3 style={{ fontSize: '2rem', fontFamily: 'Playfair Display, serif', color: '#1A1A1A' }}>Message Dispatched!</h3>
                  <p style={{ color: '#666', marginTop: '12px', fontSize: '1.1rem', lineHeight: '1.6' }}>
                    Thank you! Amma reads every feedback submission personally. We will write back to you shortly.
                  </p>
                  <button onClick={() => setSent(false)} className="submit-btn" style={{ marginTop: '30px' }}>
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div style={{ marginBottom: '30px' }}>
                    <h3 style={{ fontSize: '1.8rem', fontFamily: 'Playfair Display, serif', color: '#1A1A1A', margin: '0 0 16px' }}>
                      Send Direct Feedback
                    </h3>
                    
                    {/* Quick Contact Pills */}
                    <div className="quick-contact-pills">
                      <a href="tel:+919876543210" className="quick-pill"><Phone size={14}/> Call Us</a>
                      <a href="https://wa.me/919876543210" target="_blank" rel="noreferrer" className="quick-pill"><MessageCircle size={14}/> WhatsApp Us</a>
                      <a href="mailto:order@ammaskitchen.com" className="quick-pill"><Mail size={14}/> Email Us</a>
                    </div>
                  </div>

                  {/* Floating Label Inputs */}
                  <div className="floating-group">
                    <input type="text" className="floating-input" placeholder=" " required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                    <label className="floating-label">Full Name</label>
                  </div>

                  <div className="floating-group">
                    <input type="email" className="floating-input" placeholder=" " required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                    <label className="floating-label">Email Address</label>
                  </div>

                  <div className="floating-group">
                    <textarea className="floating-input" placeholder=" " required value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
                    <label className="floating-label">Your Message</label>
                  </div>

                  <button type="submit" className="submit-btn" disabled={loading}>
                    {loading ? (
                      <span>Sending...</span>
                    ) : (
                      <>
                        <Send size={18} /> Dispatch Message
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Interactive Map & Business Hours */}
        <div id="map" className="map-section">
          <div className="business-hours">
            <div className="business-hours-icon">
              <Clock size={28} />
            </div>
            <div className="business-hours-info">
              <p>Mon – Sun</p>
              <h5>6:00 AM – 10:00 PM</h5>
            </div>
          </div>
          <iframe 
            className="map-iframe"
            title="Location Map"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15547.469950796332!2d80.2647754!3d13.0336053!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a5267b2d56a22f7%3A0xc3c544bd0a4b160b!2sMylapore%2C%20Chennai%2C%20Tamil%20Nadu!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin" 
            allowFullScreen="" 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade">
          </iframe>
        </div>

      </div>
    </div>
  );
};

export default Contact;
