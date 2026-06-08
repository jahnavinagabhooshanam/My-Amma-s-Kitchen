import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import maskBg from '../assets/img/bg/food-6-mask-bg.png';

const resolveImagePath = (path) => {
  if (!path) return '';
  let clean = path;

  if (clean.startsWith('http')) return clean;

  // Get backend URL dynamically from environment variables
  const backendUrl = import.meta.env.VITE_API_BASE_URL 
    ? import.meta.env.VITE_API_BASE_URL.replace('/api', '') 
    : 'http://127.0.0.1:5000';

  // Route backend-provided admin assets to the backend server
  if (clean.startsWith('/assets/') || clean.startsWith('assets/Food images/') || clean.startsWith('assets/images/') || clean.startsWith('uploads/') || clean.startsWith('/uploads/')) {
    if (clean.startsWith('/')) clean = clean.substring(1);
    return `${backendUrl}/${clean}`;
  }

  if (clean.startsWith('../user/assets/')) {
    clean = clean.replace('../user/assets/', '/src/assets/');
  } else if (clean.startsWith('assets/')) {
    clean = clean.replace('assets/', '/src/assets/');
  }
  return clean;
};

const FoodCard = ({ product }) => {
  const { addToCart } = useCart();

  const handleAdd = (e) => {
    e.preventDefault();
    addToCart(product, 1);
  };

  return (
    <div className="product-card-wrapper" style={{ height: '100%' }}>
      <div className="premium-product-card mobile-compact-card">
        <img src={resolveImagePath(product.image)} alt={product.name} className="premium-product-img mobile-compact-img" />
        <div className="premium-product-rating">
          <i className="fas fa-star"></i>
          <i className="fas fa-star"></i>
          <i className="fas fa-star"></i>
          <i className="fas fa-star"></i>
          <i className="fas fa-star-half-alt"></i>
          <span style={{ fontSize: '14px', color: '#666', marginLeft: '5px' }}>4.8</span>
        </div>
        <h4 className="premium-product-title mobile-compact-title">
          {product.name}
        </h4>
        <p className="premium-product-desc mobile-compact-desc">
          {product.description || product.unit}
        </p>
        <div className="premium-product-price mobile-compact-price">
          ₹{Number(product.price).toFixed(2)}
        </div>
        <div className="mobile-compact-btn-wrapper" style={{ display: 'flex', gap: '8px', width: '100%', justifyContent: 'center' }}>
          {(product.stock === 0 || product.stock_quantity === 0) ? (
            <button disabled className="premium-add-cart-btn mobile-compact-btn" style={{ backgroundColor: '#e0e0e0', color: '#999', cursor: 'not-allowed', width: '100%' }}>
              Out of Stock
            </button>
          ) : (
            <button onClick={handleAdd} className="premium-add-cart-btn mobile-compact-btn" style={{ width: '100%', cursor: 'pointer' }}>
              Add to cart
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const MemoizedFoodCard = React.memo(FoodCard);
export default MemoizedFoodCard;
export { resolveImagePath };
