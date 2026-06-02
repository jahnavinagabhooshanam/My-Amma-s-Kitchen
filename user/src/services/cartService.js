import apiClient from './api';

export const cartService = {
  getCart: () => apiClient.get('/cart'),
  addToCart: (productId, quantity) => apiClient.post('/cart', { product_id: productId, quantity }),
  removeFromCart: (productId) => apiClient.delete(`/cart/${productId}`)
};

export default cartService;
