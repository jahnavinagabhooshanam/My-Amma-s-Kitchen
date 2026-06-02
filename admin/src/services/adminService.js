import apiClient from './api';

export const adminService = {
  login: (email, password) => apiClient.post('/auth/login', { email, password }),
  getProfile: () => apiClient.get('/auth/me')
};

export default adminService;
