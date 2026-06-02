import React from 'react';
import { useCart } from '../context/CartContext';
import maskBg from '../assets/img/bg/food-6-mask-bg.png';
import { resolveImagePath } from './FoodCard';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

  const handleAdd = (e) => {
    e.preventDefault();
    addToCart(product, 1);
  };

  return (
    <div className="product-card-wrapper">
      <div className="admin-food-card">
        <div className="admin-food-img">
          <img src={resolveImagePath(product.image)} alt={product.name} />
          <div className="badge-availability">AVAILABLE</div>
          <a href="#" className="fav-btn" onClick={(e) => e.preventDefault()}>
            <i className="far fa-heart"></i>
          </a>
        </div>
        <div className="admin-food-body">
          <h4 className="admin-food-title">{product.name}</h4>
          <p className="admin-food-desc">{product.description || product.unit}</p>
          <div className="admin-food-footer">
            <div className="price-block">
              <span className="price">₹{product.price.toFixed(2)}</span>
            </div>
            <div className="stock">Stock: {product.stock ?? product.stock_quantity ?? '—'}</div>
          </div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
            <button onClick={handleAdd} className="th-btn" style={{ border: 'none', cursor: 'pointer' }}>
              Add to cart
            </button>
            <button onClick={(e)=>{e.preventDefault();}} className="btn-outline">View</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
