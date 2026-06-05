import apiClient from './api';

export const inventoryManagement = {
  getAll: () => apiClient.get('/inventory'),
  updateStock: (id, stock) => apiClient.put(`/inventory/${id}`, { stock })
};

export default inventoryManagement;
