import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import footerLogo from '../assets/img/logo.webp';
import footerTopImg1 from '../assets/img/icon/footer7-top.png';
import footerTopImg2 from '../assets/img/icon/footer8-top.png';
import footerTopLeftImg from '../assets/img/icon/footer9-top-left.png';
import footerLeftImg from '../assets/img/icon/footer8-left.png';
import footerRightImg from '../assets/img/icon/footer7-right.png';
import footerRightBottomImg from '../assets/img/icon/footer9-lef-t-bottom.png';
import openBorderImg from '../assets/img/bg/footer-1-open-border.png';
import apiClient from '../services/api';

const Footer = () => {
  const [config, setConfig] = useState({
    opening_hours: "Opening Hour: 6am to 10pm",
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
    <footer className="footer-wrapper footer-layout1 space-top">
      {/* Decorative shape mockups - matched from original HTML */}
      <div className="shape-mockup jump d-none d-xxl-block" style={{ left: '0px', top: '0px' }}>
        <img src={footerTopImg1} alt="img" />
      </div>
      <div className="shape-mockup d-none d-xxl-block" style={{ left: '33%', top: '0px' }}>
        <img src={footerTopImg2} alt="img" />
      </div>
      <div className="shape-mockup movingX d-none d-xxl-block" style={{ left: '1%', top: '0px' }}>
        <img src={footerTopLeftImg} alt="img" />
      </div>
      <div className="shape-mockup jump d-none d-xxl-block" style={{ left: '0%', bottom: '5%' }}>
        <img src={footerLeftImg} alt="img" />
      </div>
      <div className="shape-mockup jump d-none d-xxl-block" style={{ right: '0px', top: '3%' }}>
        <img src={footerRightImg} alt="img" />
      </div>
      <div className="shape-mockup jump d-none d-xxl-block" style={{ right: '0%', bottom: '6%' }}>
        <img src={footerRightBottomImg} alt="img" />
      </div>

      <div className="container">
        <div className="footer-logo">
          <div className="footer-border left"></div>
          <Link to="/">
            <img src={footerLogo} alt="Amma's Kitchen Logo" style={{ maxHeight: '100px', width: 'auto' }} />
          </Link>
          <div className="footer-border right"></div>
        </div>

        <div className="widget-area">
          <div className="row justify-content-center">
            {/* Useful Links */}
            <div className="col-xl-4 col-lg-4 col-sm-6">
              <div className="widget widget_nav_menu footer-widget">
                <h3 className="widget_title">Useful Links</h3>
                <div className="menu-all-pages-container">
                  <ul className="menu">
                    <li><Link to="/">Home</Link></li>
                    <li><Link to="/ready-to-eat">Ready to Eat</Link></li>
                    <li><Link to="/ready-to-cook">Ready to Cook</Link></li>
                    <li><Link to="/batter-products">Artisan Batters</Link></li>
                    <li><Link to="/bulk-orders">Bulk Orders</Link></li>
                    <li><Link to="/contact">Contact</Link></li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Opening hours & Socials */}
            <div className="col-xl-4 col-lg-4 col-sm-6">
              <div className="widget widget_info footer-widget">
                <div className="opening-time">
                  <div className="event-info-mask" style={{ maskImage: `url(${openBorderImg})`, WebkitMaskImage: `url(${openBorderImg})` }}></div>
                  <div className="content-wrap">
                    <div className="icon"><i className="fa-light fa-clock"></i></div>
                    <p className="top-text">We’re currently open!</p>
                    <p className="opening-text">{config.opening_hours}</p>
                    <p className="opening-text">All Days Open</p>
                  </div>
                </div>
                <div className="th-social">
                  <a href={config.social_facebook} target="_blank" rel="noreferrer"><i className="fab fa-facebook-f"></i></a>
                  <a href={config.social_twitter} target="_blank" rel="noreferrer"><i className="fab fa-twitter"></i></a>
                  <a href={config.social_instagram} target="_blank" rel="noreferrer"><i className="fab fa-instagram"></i></a>
                  <a href={`https://wa.me/${config.whatsapp_number?.replace(/\+/g, '').replace(/\s/g, '')}`} target="_blank" rel="noreferrer"><i className="fab fa-whatsapp"></i></a>
                </div>
              </div>
            </div>

            {/* Favorite categories */}
            <div className="col-xl-4 col-lg-4 col-sm-6">
              <div className="widget widget_nav_menu footer-widget favorite-menu">
                <h3 className="widget_title">Favorite Menu</h3>
                <div className="menu-all-pages-container">
                  <ul className="menu">
                    <li><Link to="/batter-products">Premium Dosa Batter</Link></li>
                    <li><Link to="/batter-products">Classic Idli Batter</Link></li>
                    <li><Link to="/batter-products">Ragi Batter</Link></li>
                    <li><Link to="/batter-products">Millet Batter</Link></li>
                    <li><Link to="/batter-products">Family Batter Pack</Link></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="copyright-wrap">
        <div className="container">
          <div className="row gy-3 align-items-center">
            <div className="col-lg-6">
              <p className="copyright-text">
                {config.footer_text}
              </p>
            </div>
            <div className="col-lg-6 text-center text-lg-end">
              <div className="footer-links">
                <ul>
                  <li><a href="#">Privacy Policy</a></li>
                  <li><a href="#">Terms &amp; Condition</a></li>
                  <li><a href="#">Support policy</a></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
