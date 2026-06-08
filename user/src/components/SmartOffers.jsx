import React from 'react';
import './SmartOffers.css';

const SmartOffers = () => {
  const dummyOffers = [
    { id: 1, title: 'Flash Sale', desc: 'Flat 50% Off on Batters', code: 'FLASH50', type: 'flash', expiry: 'Ends in 2h' },
    { id: 2, title: 'Weekend Offer', desc: 'Free Delivery on Orders above ₹500', code: 'FREEWEEKEND', type: 'weekend', expiry: 'Valid till Sun' },
    { id: 3, title: 'Combo Offer', desc: 'Buy 2 Idli Batter, Get 1 Dosa Batter Free', code: 'B2G1', type: 'combo', expiry: 'Limited Time' }
  ];

  return (
    <section className="smart-offers-container container space-top">
      <div className="title-area style9 mb-40">
        <h2 className="sec-title" style={{ fontFamily: "'Playfair Display', serif", fontSize: '28px' }}>Today's Deals</h2>
      </div>
      <div className="horizontal-carousel">
        {dummyOffers.map(offer => (
          <div key={offer.id} className={`smart-offer-card bg-${offer.type}`}>
            <div className="offer-content">
              <h3>{offer.title}</h3>
              <p>{offer.desc}</p>
              <div className="offer-meta">
                <span className="offer-code">{offer.code}</span>
                <span className="offer-expiry">⏱️ {offer.expiry}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default SmartOffers;
