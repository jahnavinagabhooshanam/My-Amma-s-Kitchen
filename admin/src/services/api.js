import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL
});

// Request Interceptor: Inject JWT token if available
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('amma_admin_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Global Error Handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Admin API Error Response:', error.response || error.message);
    return Promise.reject(error);
  }
);

export default apiClient;

import { io } from 'socket.io-client';
// Use the same base URL but without /api
const SOCKET_URL = API_BASE_URL.replace('/api', '');
export const socket = io(SOCKET_URL, {
  autoConnect: true,
  reconnection: true
});

socket.on('connect', () => {
  console.log('[Socket.IO] Connected to backend real-time server');
});
