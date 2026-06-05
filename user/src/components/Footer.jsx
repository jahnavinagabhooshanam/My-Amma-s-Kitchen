import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import footerLogo from '../assets/img/logo.png';
import apiClient from '../services/api';
import './Footer.css';

const Footer = () => {
  const [config, setConfig] = useState({
    opening_hours: "6:00 AM — 10:00 PM",
    social_facebook: "#",
    social_instagram: "#",
    social_twitter: "#",
    whatsapp_number: "+919876543210",
    footer_text: "© 2026 Hotel Amma's Kitchen. Traditional stone-ground heritage batter and healthy meals."
  });

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await apiClient.get('/admin/website-config');
        setConfig(res.data);
      } catch (err) {
        console.error("Failed to load website config in Footer:", err);
      }
    };
    fetchConfig();
  }, []);

  return (
    <footer className="premium-footer">
      <div className="pf-container">
        <div className="pf-grid">
          {/* Column 1 - Brand */}
          <div className="pf-brand">
            <Link to="/">
              <img src={footerLogo} alt="Amma's Kitchen" className="pf-logo" />
            </Link>
            <div className="pf-motto">Authentic South Indian Homemade Foods &amp; Batters.</div>
          </div>

          {/* Column 2 - Quick Links */}
          <div>
            <h3 className="pf-title">Quick Links</h3>
            <ul className="pf-links">
              <li><Link to="/" className="pf-link-item">Home</Link></li>
              <li><Link to="/menu" className="pf-link-item">Menu</Link></li>
              <li><Link to="/ready-to-eat" className="pf-link-item">Ready To Eat</Link></li>
              <li><Link to="/ready-to-cook" className="pf-link-item">Ready To Cook</Link></li>
              <li><Link to="/bulk-orders" className="pf-link-item">Bulk Orders</Link></li>
              <li><Link to="/certificates" className="pf-link-item">Certificates</Link></li>
              <li><Link to="/contact" className="pf-link-item">Contact</Link></li>
            </ul>
          </div>

          {/* Column 3 - Contact Info */}
          <div>
            <h3 className="pf-title">Contact Information</h3>
            <div className="pf-contact-block">
              <div className="pf-contact-label">Address</div>
              <div className="pf-contact-text">2nd Cross,<br/>Gopalappa Nagar,<br/>Near KCC Nagar,<br/>Hosur - 635109</div>
            </div>
            <div className="pf-contact-block">
              <div className="pf-contact-label">Phone</div>
              <div className="pf-contact-text">+91 72009 42596</div>
            </div>
            <div className="pf-contact-block">
              <div className="pf-contact-label">Business Hours</div>
              <div className="pf-contact-text">Monday - Sunday<br/>6:00 AM - 10:00 PM</div>
            </div>
          </div>

          {/* Column 4 - Certifications */}
          <div>
            <h3 className="pf-title">Business Certifications</h3>
            <ul className="pf-links">
              <li className="pf-link-item">GST Registered</li>
              <li className="pf-link-item">FSSAI Licensed</li>
            </ul>
            <div style={{ marginTop: 12, display: 'flex', gap: 10 }}>
              <button className="btn-cert" onClick={() => window.dispatchEvent(new CustomEvent('open-pdf', { detail: { file: '/certificates/gst-registration.pdf', title: 'GST Registration Certificate' } }))}>View GST Certificate</button>
              <button className="btn-cert" onClick={() => window.dispatchEvent(new CustomEvent('open-pdf', { detail: { file: '/certificates/fssai-license.pdf', title: 'FSSAI Food License' } }))}>View FSSAI Certificate</button>
            </div>
          </div>

        </div>

        <div className="pf-bottom">
          <div>{config.footer_text}</div>
          <div>Crafted with love by Amma's Kitchen</div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
