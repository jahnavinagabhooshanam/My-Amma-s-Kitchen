import apiClient from './api';

export const productManagement = {
  getAll: (category) => apiClient.get('/products', { params: { category } }),
  getById: (id) => apiClient.get(`/products/${id}`),
  create: (data) => apiClient.post('/products', data),
  update: (id, data) => apiClient.put(`/products/${id}`, data),
  delete: (id) => apiClient.delete(`/products/${id}`)
};

export default productManagement;
