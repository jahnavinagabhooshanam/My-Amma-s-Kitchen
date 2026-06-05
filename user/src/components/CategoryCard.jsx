import React from 'react';
import { Link } from 'react-router-dom';
import { resolveImagePath } from './FoodCard';

const CategoryCard = ({ title, image, link }) => {
  return (
    <div className="swiper-slide">
      <div className="new-cat-card">
        <div className="card-bg">
          <img src={resolveImagePath(image)} alt={title} />
        </div>
        <div className="card-overlay"></div>
        <h3 className="box-title">
          <Link to={link}>{title}</Link>
        </h3>
      </div>
    </div>
  );
};

export default CategoryCard;
