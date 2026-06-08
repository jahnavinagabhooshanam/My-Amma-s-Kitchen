import React, { useState, useEffect } from 'react';
import FoodCard from './FoodCard';

const RecentlyViewed = () => {
  const [recentItems, setRecentItems] = useState([]);

  useEffect(() => {
    // In a real app, this would come from localStorage or API
    // Using mock data for UI implementation
    const mockRecent = [
      { id: 101, name: 'Filter Coffee', price: 60, image: 'assets/img/category/cat-new-1.webp', description: 'Authentic Kumbakonam degree coffee', unit: 'Cup' },
      { id: 102, name: 'Ghee Roast Dosa', price: 120, image: 'assets/img/category/cat-new-2.webp', description: 'Crispy dosa roasted in pure cow ghee', unit: 'Plate' }
    ];
    setRecentItems(mockRecent);
  }, []);

  if (recentItems.length === 0) return null;

  return (
    <section className="recently-viewed-section space-top overflow-hidden">
      <div className="container">
        <div className="title-area style9 mb-40">
          <h2 className="sec-title" style={{ fontFamily: "'Playfair Display', serif", fontSize: '28px' }}>Recently Viewed</h2>
        </div>
        <div className="grid-auto-fit horizontal-carousel" style={{ gap: '20px' }}>
          {recentItems.map(item => (
            <FoodCard key={`recent-${item.id}`} product={item} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default RecentlyViewed;
