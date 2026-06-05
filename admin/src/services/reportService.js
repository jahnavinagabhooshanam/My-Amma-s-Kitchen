import apiClient from './api';

export const reportService = {
  getSalesSummary: () => apiClient.get('/orders'), // Mock integration using orders
  getInventoryAlerts: () => apiClient.get('/inventory') // Mock integration
};

export default reportService;
