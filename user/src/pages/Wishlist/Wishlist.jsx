import React, { useEffect, useState } from 'react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import wishlistService from '../../services/wishlistService';

const Wishlist = () => {
  const { addToCart } = useCart();
  const { token } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      wishlistService.getAll().then(res => {
        setWishlist(res.data);
      }).catch(err => {
        console.error(err);
      }).finally(() => {
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [token]);

  const handleRemove = async (id, productId) => {
    try {
      if (token) await wishlistService.remove(productId);
      setWishlist(wishlist.filter(item => item.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const handleMoveToCart = (item) => {
    addToCart(item, 1);
    handleRemove(item.id, item.id);
  };

  return (
    <div className="wishlist-page space" style={{ backgroundColor: '#FCFBF7', minHeight: '80vh' }}>
      <div className="container">
        
        <div className="title-area style9 text-center mb-40">
          <span className="sub-title">Your Favorites</span>
          <h1 className="sec-title" style={{ fontSize: '2.5rem', color: 'var(--primary-dark)', marginTop: '8px' }}>
            My Wishlist
          </h1>
          <p className="text-muted" style={{ maxWidth: '600px', margin: '12px auto 0' }}>
            Keep track of your favorite artisan batters, ready-to-eat breakfasts, and homestyle food items.
          </p>
        </div>

        {loading ? (
          <div className="text-center" style={{ padding: '60px' }}>Loading wishlist...</div>
        ) : !token ? (
          <div className="card text-center" style={{ padding: '60px 30px', backgroundColor: '#FFFFFF', border: '1px solid #EAE6DB', borderRadius: '15px', maxWidth: '600px', margin: '0 auto' }}>
            <Heart size={56} style={{ color: 'var(--primary-color)', margin: '0 auto', opacity: 0.3 }} />
            <h3 className="title-md" style={{ color: 'var(--primary-dark)', marginTop: '20px' }}>Please login</h3>
            <p className="text-muted" style={{ marginTop: '12px' }}>
              Login to view and save items to your wishlist.
            </p>
            <Link to="/login" className="th-btn mt-4" style={{ border: 'none' }}>
              Login Now
            </Link>
          </div>
        ) : wishlist.length === 0 ? (
          <div className="card text-center" style={{ padding: '60px 30px', backgroundColor: '#FFFFFF', border: '1px solid #EAE6DB', borderRadius: '15px', maxWidth: '600px', margin: '0 auto' }}>
            <Heart size={56} style={{ color: 'var(--primary-color)', margin: '0 auto', opacity: 0.3 }} />
            <h3 className="title-md" style={{ color: 'var(--primary-dark)', marginTop: '20px' }}>Your Wishlist is Empty</h3>
            <p className="text-muted" style={{ marginTop: '12px' }}>
              Explore our selection of traditional food products and save your favorites here.
            </p>
            <Link to="/batter-products" className="th-btn mt-4" style={{ border: 'none' }}>
              Explore Products
            </Link>
          </div>
        ) : (
          <div className="row gy-4 justify-content-center">
            <div className="col-lg-10">
              <div className="card" style={{ padding: '20px', backgroundColor: '#FFFFFF', border: '1px solid #EAE6DB', borderRadius: '15px' }}>
                <div className="responsive-table-wrapper" style={{ border: 'none', boxShadow: 'none' }}>
                  <table className="responsive-table">
                    <thead>
                      <tr>
                        <th>Product Details</th>
                        <th>Price</th>
                        <th>Status</th>
                        <th className="text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {wishlist.map((item) => (
                        <tr key={item.id}>
                          <td>
                            <div className="flex gap-2" style={{ alignItems: 'center' }}>
                              <div style={{
                                width: '50px',
                                height: '50px',
                                backgroundColor: '#F5F5F0',
                                borderRadius: '10px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.4rem'
                              }}>🍶</div>
                              <div>
                                <strong style={{ fontSize: '1.05rem', color: 'var(--primary-dark)' }}>{item.name}</strong>
                                <div className="text-muted" style={{ fontSize: '12px' }}>{item.unit}</div>
                              </div>
                            </div>
                          </td>
                          <td style={{ fontWeight: '700', fontSize: '1.05rem' }}>₹{item.price.toFixed(2)}</td>
                          <td>
                            <span className="status-badge status-delivered" style={{ padding: '4px 10px', fontSize: '11px' }}>
                              In Stock
                            </span>
                          </td>
                          <td className="text-end">
                            <div className="flex gap-2 justify-content-end" style={{ alignItems: 'center' }}>
                              <button onClick={() => handleMoveToCart(item)} className="th-btn style9" style={{ border: 'none', padding: '10px 18px', cursor: 'pointer', fontSize: '12px' }}>
                                <ShoppingBag size={14} style={{ marginRight: '6px' }} /> Move to Basket
                              </button>
                              <button onClick={() => handleRemove(item.wishlist_id || item.id, item.id)} className="icon-btn text-danger" style={{ backgroundColor: 'transparent', border: 'none', cursor: 'pointer' }} title="Remove item">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Wishlist;
