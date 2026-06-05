import apiClient from './api';

export const customerManagement = {
  getAll: () => apiClient.get('/customers'),
  getById: (id) => apiClient.get(`/customers/${id}`)
};

export default customerManagement;
