import React, { useState, useEffect } from 'react';
import { resolveImagePath } from './FoodCard';

const OfferPopup = () => {
  const [mounted, setMounted] = useState(true);
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Mount element, then trigger CSS slide-in transition after 200ms
    const timer = setTimeout(() => {
      setShow(true);
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setShow(false);
    // Unmount from DOM after slide-out transition completes
    setTimeout(() => {
      setMounted(false);
    }, 600);
  };

  if (!mounted) return null;

  const offers = [
    { name: "Mysore Masala Dosa", desc: "Spicy red chutney with potato filling", price: "₹129", img: "assets/img/menu/menu-item-11-1.png", tag: "Best Seller", discount: "15% OFF" },
    { name: "Idli Combo", desc: "Soft idlis with sambar & chutneys", price: "₹99", img: "assets/img/menu/menu-item-11-2.png", tag: "Popular", discount: "10% OFF" },
    { name: "Ghee Roast", desc: "Crispy dosa roasted in pure ghee", price: "₹149", img: "assets/img/menu/menu-item-11-3.png", tag: "Amma's Choice", discount: "20% OFF" },
    { name: "Parotta Combo", desc: "Flaky parottas with spicy salna", price: "₹140", img: "assets/img/menu/menu-item-11-4.png", tag: "Must Try", discount: "15% OFF" },
    { name: "Meals Combo", desc: "Authentic full South Indian thali", price: "₹180", img: "assets/img/menu/menu-item-11-5.png", tag: "Premium", discount: "10% OFF" },
    { name: "Batter Products", desc: "Freshly ground idli & dosa batter", price: "₹80", img: "assets/img/menu/menu-item-11-6.png", tag: "Organic", discount: "5% OFF" }
  ];

  const duplicatedOffers = [...offers, ...offers];

  return (
    <div className={`premium-popup-overlay ${show ? 'show' : ''}`} id="premiumPopup" style={{ zIndex: 99999 }}>
      <div className="premium-popup-modal">
        <div className="popup-decorative-circle circle-1"></div>
        <div className="popup-decorative-circle circle-2"></div>
        
        <button className="popup-close-btn" id="closePopupBtn" onClick={handleClose} aria-label="Close">
          <i className="far fa-times"></i>
        </button>

        <div className="popup-header-container">
          <h2 className="popup-title">Amma's Special Offers</h2>
          <div className="popup-title-divider">
            <span className="divider-line"></span>
            <i className="fas fa-utensils divider-icon"></i>
            <span className="divider-line"></span>
          </div>
          <p className="popup-subtitle">Savor the authentic taste of freshly-made traditional delicacies at exclusive rates</p>
        </div>

        <div className="popup-slider-container-wrapper">
          <div className="popup-slider-fade-overlay left"></div>
          <div className="popup-slider-fade-overlay right"></div>
          
          <div className="popup-slider-container">
            <div className="popup-slider-track">
              {duplicatedOffers.map((off, idx) => (
                <div className="popup-offer-card" key={idx}>
                  <div className="popup-offer-img-wrapper">
                    <img src={resolveImagePath(off.img)} alt={off.name} />
                    <span className="popup-card-discount">{off.discount}</span>
                  </div>
                  <div className="popup-offer-info">
                    <div className="popup-card-header-row">
                      <span className="popup-card-tag">{off.tag}</span>
                    </div>
                    <h3 className="popup-offer-name">{off.name}</h3>
                    <p className="popup-offer-desc">{off.desc}</p>
                    <div className="popup-offer-footer">
                      <span className="popup-offer-price">{off.price}</span>
                      <button className="popup-card-order-btn">
                        Add <i className="fas fa-plus"></i>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfferPopup;
