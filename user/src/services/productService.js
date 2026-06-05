import apiClient from './api';

export const productService = {
  getAll: (category) => apiClient.get('/products', { params: { category } }),
  getById: (id) => apiClient.get(`/products/${id}`)
};

export default productService;
