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
          
          {/* Brand Column */}
          <div className="pf-brand">
            <Link to="/">
              <img src={footerLogo} alt="Amma's Kitchen" className="pf-logo" />
            </Link>
            <div className="pf-motto">
              Authentic Flavors.<br/>Timeless Traditions.
            </div>
            <div className="pf-socials">
              <a href={config.social_facebook} target="_blank" rel="noreferrer" className="pf-social-link"><i className="fab fa-facebook-f"></i></a>
              <a href={config.social_twitter} target="_blank" rel="noreferrer" className="pf-social-link"><i className="fab fa-twitter"></i></a>
              <a href={config.social_instagram} target="_blank" rel="noreferrer" className="pf-social-link"><i className="fab fa-instagram"></i></a>
            </div>
          </div>

          {/* Links Column */}
          <div>
            <h3 className="pf-title">Explore Menu</h3>
            <ul className="pf-links">
              <li><Link to="/menu" className="pf-link-item">Digital Menu</Link></li>
              <li><Link to="/ready-to-eat" className="pf-link-item">Premium Dining</Link></li>
              <li><Link to="/ready-to-cook" className="pf-link-item">Artisan Batters</Link></li>
              <li><Link to="/bulk-orders" className="pf-link-item">Catering</Link></li>
            </ul>
          </div>

          {/* Links Column 2 */}
          <div>
            <h3 className="pf-title">Help & Info</h3>
            <ul className="pf-links">
              <li><Link to="/customer-profile" className="pf-link-item">My Account</Link></li>
              <li><Link to="/customer-orders" className="pf-link-item">Track Order</Link></li>
              <li><Link to="/contact" className="pf-link-item">Contact Us</Link></li>
              <li><Link to="#" className="pf-link-item">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Contact Column */}
          <div>
            <h3 className="pf-title">Visit Us</h3>
            
            <div className="pf-contact-block">
              <div className="pf-contact-label">Location</div>
              <div className="pf-contact-text">123 Heritage Lane, Culinary District<br/>Food City, FC 500001</div>
            </div>

            <div className="pf-contact-block">
              <div className="pf-contact-label">Hours</div>
              <div className="pf-contact-text">{config.opening_hours}<br/>Open All Days</div>
            </div>

            <div className="pf-contact-block">
              <div className="pf-contact-label">Reservations & Delivery</div>
              <div className="pf-contact-text">{config.whatsapp_number}</div>
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
