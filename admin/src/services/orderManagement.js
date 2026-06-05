import apiClient from './api';

export const orderManagement = {
  getAll: () => apiClient.get('/orders'),
  getById: (id) => apiClient.get(`/orders/${id}`),
  updateStatus: (id, status) => apiClient.put(`/orders/${id}`, { status })
};

export default orderManagement;
