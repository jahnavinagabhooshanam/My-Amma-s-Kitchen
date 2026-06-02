import apiClient from './api';

export const authService = {
  login: (email, password) => apiClient.post('/auth/login', { email, password }),
  register: (name, email, phone, password) => apiClient.post('/auth/register', { name, email, phone, password }),
  getProfile: () => apiClient.get('/auth/profile'),
  forgotPassword: (email) => apiClient.post('/auth/forgot-password', { email }),
  verifyOtp: (email, otp) => apiClient.post('/auth/verify-otp', { email, otp }),
  logout: () => apiClient.post('/auth/logout'),
  completeProfile: (profileData) => apiClient.post('/auth/complete-profile', profileData),
  changePassword: (passwordData) => apiClient.post('/auth/change-password', passwordData),
  uploadAvatar: (formData) => apiClient.post('/auth/upload-avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  ,
  exchangeFirebaseToken: (idToken) => apiClient.post('/auth/exchange-firebase-token', { idToken })
};

export default authService;
