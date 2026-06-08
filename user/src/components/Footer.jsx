import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import footerLogo from '../assets/img/my-ammas-logo-new.jpg';
import apiClient from '../services/api';
import './Footer.css';

const isBusinessOpen = () => {
  const now = new Date();
  const minutes = now.getHours() * 60 + now.getMinutes();
  return minutes >= 360 && minutes < 1320;
};

const Footer = () => {
  const [config, setConfig] = useState({
    social_facebook: '#',
    social_instagram: '#',
    social_twitter: '#',
    contact_email: 'orders@ammaskitchen.com',
    whatsapp_number: '+919876543210'
  });
  const [isOpen, setIsOpen] = useState(isBusinessOpen());
  const [openAccordion, setOpenAccordion] = useState(null);

  const toggleAccordion = (section) => {
    // Only works on mobile (screens < 768px)
    if (window.innerWidth <= 768) {
      setOpenAccordion(openAccordion === section ? null : section);
    }
  };

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await apiClient.get('/admin/website-config');
        setConfig(res.data);
      } catch (err) {
        console.error('Failed to load website config in Footer:', err);
      }
    };
    fetchConfig();
  }, []);

  useEffect(() => {
    setIsOpen(isBusinessOpen());
    const interval = setInterval(() => setIsOpen(isBusinessOpen()), 60000);
    return () => clearInterval(interval);
  }, []);

  const whatsappHref = `https://wa.me/${(config.whatsapp_number || '').replace(/\+|\s/g, '')}`;

  return (
    <footer className="premium-footer" style={{ marginTop: '100px' }}>
      {/* Central Overlapping Logo */}
      <div className="footer-logo-overlap">
        <Link to="/">
          <div className="footer-logo-circle">
            <img src={footerLogo} alt="Amma's Kitchen" />
          </div>
        </Link>
      </div>

      <div className="pf-green-area">
        {/* Top Decorative Line */}
        <div className="footer-top-decoration">
          <div className="decor-line"></div>
          <div className="decor-icon">✨</div>
          <div className="decor-line"></div>
        </div>

        <div className="pf-container">
          <div className="pf-grid-4">
            
            {/* Column 1: About */}
            <div className={`pf-col ${openAccordion === 'about' ? 'active' : ''}`}>
              <h3 className="pf-title accordion-title" onClick={() => toggleAccordion('about')}><i className="fas fa-leaf"></i> About Amma's Kitchen</h3>
              <div className="accordion-content">
                <p className="pf-about-text">
                  Serving authentic South Indian flavors made with love and traditional recipes just like amma made it.
                </p>
                
                <div className="pf-features">
                  <div className="pf-feature-item">
                    <div className="pf-feature-icon"><i className="fas fa-seedling"></i></div>
                    <div className="pf-feature-text">
                      <h4>100% Fresh Ingredients</h4>
                      <p>Carefully sourced daily</p>
                    </div>
                  </div>
                  <div className="pf-feature-item">
                    <div className="pf-feature-icon"><i className="fas fa-hat-chef"></i></div>
                    <div className="pf-feature-text">
                      <h4>Hygienic Preparation</h4>
                      <p>Cooked with love & care</p>
                    </div>
                  </div>
                  <div className="pf-feature-item">
                    <div className="pf-feature-icon"><i className="fas fa-heart"></i></div>
                    <div className="pf-feature-text">
                      <h4>Traditional Recipes</h4>
                      <p>Authentic taste since generations</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Column 2: Contact Info */}
            <div className={`pf-col ${openAccordion === 'contact' ? 'active' : ''}`}>
              <h3 className="pf-title accordion-title" onClick={() => toggleAccordion('contact')}><i className="fas fa-map-marker-alt"></i> Contact Information</h3>
              <div className="accordion-content">
                <div className="pf-contact-block">
                  <div className="pf-contact-label"><i className="fas fa-map-marker-alt"></i> ADDRESS</div>
                  <div className="pf-contact-text">
                    2nd Cross,<br/>
                    Gopalappa Nagar,<br/>
                    Near KCC Nagar,<br/>
                    Hosur - 635109
                  </div>
                </div>
                
                <div className="pf-contact-block">
                  <div className="pf-contact-label"><i className="fas fa-phone-alt"></i> PHONE</div>
                  <div className="pf-contact-text">+91 98765 43210</div>
                </div>

                <div className="pf-contact-block">
                  <div className="pf-contact-label"><i className="fas fa-envelope"></i> EMAIL</div>
                  <div className="pf-contact-text">orders@ammaskitchen.com</div>
                </div>
              </div>
            </div>

            {/* Column 3: Quick Links */}
            <div className={`pf-col ${openAccordion === 'links' ? 'active' : ''}`}>
              <h3 className="pf-title accordion-title" onClick={() => toggleAccordion('links')}><i className="fas fa-link"></i> Quick Links</h3>
              <div className="accordion-content">
                <ul className="pf-links">
                  <li><Link to="/" className="pf-link-item"><span className="link-arrow">&gt;</span> Home</Link></li>
                  <li><Link to="/menu" className="pf-link-item"><span className="link-arrow">&gt;</span> Menu</Link></li>
                  <li><Link to="/ready-to-eat" className="pf-link-item"><span className="link-arrow">&gt;</span> Ready To Eat</Link></li>
                  <li><Link to="/ready-to-cook" className="pf-link-item"><span className="link-arrow">&gt;</span> Ready To Cook</Link></li>
                  <li><Link to="/bulk-orders" className="pf-link-item"><span className="link-arrow">&gt;</span> Bulk Orders</Link></li>
                  <li><Link to="/certificates" className="pf-link-item"><span className="link-arrow">&gt;</span> Certificates</Link></li>
                  <li><Link to="/contact" className="pf-link-item"><span className="link-arrow">&gt;</span> Contact</Link></li>
                </ul>
              </div>
            </div>

            {/* Column 4: Center Card & Socials */}
            <div className="pf-col pf-col-center">
              <div className="pf-hours-card">
                <div className="pf-hours-icon-top">
                  <i className="far fa-clock"></i>
                </div>
                <motion.h3 
                  className="pf-hours-status"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  style={{ color: isOpen ? '#25D366' : '#FF6B35' }}
                >
                  <motion.span
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    style={{ 
                      display: 'inline-block', 
                      width: '10px', 
                      height: '10px', 
                      background: isOpen ? '#25D366' : '#FF6B35', 
                      borderRadius: '50%', 
                      marginRight: '8px' 
                    }}
                  />
                  {isOpen ? "We're Currently Open!" : "We're Currently Closed!"}
                </motion.h3>
                <div className="pf-hours-divider">
                  <span>Business Hours</span>
                </div>
                <p className="pf-hours-days">Monday - Sunday</p>
                <div className="pf-hours-time">6:00 AM - 10:00 PM</div>
              </div>

              <div className="pf-social-section">
                <div className="pf-social-divider">
                  <span className="decor-line"></span>
                  <span className="social-text">Follow Us On</span>
                  <span className="decor-line"></span>
                </div>
                <div className="pf-socials">
                  <a href={config.social_facebook} target="_blank" rel="noreferrer" className="pf-social-link"><i className="fab fa-facebook-f" /></a>
                  <a href={config.social_instagram} target="_blank" rel="noreferrer" className="pf-social-link"><i className="fab fa-instagram" /></a>
                  <a href={whatsappHref} target="_blank" rel="noreferrer" className="pf-social-link"><i className="fab fa-whatsapp" /></a>
                  <a href={`mailto:${config.contact_email}`} className="pf-social-link"><i className="far fa-envelope" /></a>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      <div className="pf-bottom">
        <div className="pf-container pf-bottom-inner">
          <div className="pf-copyright">
            &copy; 2026 <span className="pf-highlight">Amma's Kitchen</span>. All Rights Reserved.
          </div>
          <div className="pf-love-text">
            <i className="fas fa-heart" style={{ color: '#F5B941' }}></i> Made with love, just like amma made it
          </div>
          <div className="pf-legal">
            <Link to="/privacy" className="pf-legal-link">Privacy Policy</Link>
            <span className="pf-legal-dot">&bull;</span>
            <Link to="/terms" className="pf-legal-link">Terms &amp; Conditions</Link>
            <span className="pf-legal-dot">&bull;</span>
            <Link to="/refund" className="pf-legal-link">Refund Policy</Link>
          </div>
        </div>
      </div>

      <button
        type="button"
        className="pf-back-top"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Back to top"
      >
        <i className="fa-solid fa-arrow-up" />
      </button>

      <a
        href={`https://wa.me/917200942596?text=Need%20Help?%20Order%20On%20WhatsApp`}
        target="_blank"
        rel="noreferrer"
        className="pf-whatsapp-float"
        aria-label="Order on WhatsApp"
      >
        <i className="fab fa-whatsapp" />
      </a>
    </footer>
  );
};

export default Footer;
