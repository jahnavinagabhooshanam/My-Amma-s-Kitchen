import apiClient from './api';

export const customerService = {
  getAll: () => apiClient.get('/customers'),
  getById: (id) => apiClient.get(`/customers/${id}`),
  update: (id, data) => apiClient.put(`/customers/${id}`, data)
};

export default customerService;
