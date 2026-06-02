import apiClient from './api';

export const orderService = {
  getAll: () => apiClient.get('/orders'),
  getById: (id) => apiClient.get(`/orders/${id}`),
  place: (data) => apiClient.post('/orders', data),
  updateStatus: (id, status) => apiClient.put(`/orders/${id}`, { status })
};

export default orderService;
