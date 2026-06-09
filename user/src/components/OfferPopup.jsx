import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import './OfferPopup.css';

const OfferPopup = ({ offer }) => {
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user has already seen this specific offer today
    const seenOffers = JSON.parse(sessionStorage.getItem('seenOffers') || '{}');
    const today = new Date().toDateString();
    
    if (offer && seenOffers[offer.id] !== today) {
      // Delay popup slightly for better UX
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [offer]);

  const handleClose = () => {
    setIsVisible(false);
    // Mark as seen for today
    if (offer) {
      const seenOffers = JSON.parse(sessionStorage.getItem('seenOffers') || '{}');
      seenOffers[offer.id] = new Date().toDateString();
      sessionStorage.setItem('seenOffers', JSON.stringify(seenOffers));
    }
  };

  const handleAction = () => {
    handleClose();
    if (offer.target_type === 'product' && offer.target_id) {
      navigate('/menu'); // Could navigate to specific product if ID matches
    } else {
      navigate('/menu');
    }
  };

  if (!isVisible || !offer) return null;

  return (
    <div className="offer-popup-overlay" onClick={handleClose}>
      <div className="offer-popup-content" onClick={e => e.stopPropagation()}>
        <button className="offer-popup-close" onClick={handleClose}>
          <X size={20} />
        </button>
        
        {offer.image_url && (
          <img src={offer.image_url} alt={offer.title} className="offer-popup-image" />
        )}
        
        <div className="offer-popup-body">
          <h2 className="offer-popup-title">{offer.title}</h2>
          <p className="offer-popup-desc">{offer.description}</p>
          
          {offer.discount_value && (
            <div className="offer-popup-discount">
              Get {offer.discount_value}{offer.discount_type === 'percentage' ? '%' : 'Rs. '} OFF
            </div>
          )}
          
          <div>
            <button className="offer-popup-btn" onClick={handleAction}>
              Claim Offer Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfferPopup;
