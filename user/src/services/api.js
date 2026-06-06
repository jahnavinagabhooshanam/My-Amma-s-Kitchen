import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor: Inject JWT token if available
apiClient.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('amma_token');
    
    console.log(`[API-DEBUG] Request to: ${config.url}`);
    console.log(`[API-DEBUG] Token exists: ${!!token}`);
    console.log(`[API-DEBUG] Token value (first 30 chars): ${token ? token.substring(0, 30) : 'NONE'}`);
    
    if (token) {
      // Add Authorization header
      config.headers.Authorization = `Bearer ${token}`;
      console.log(`[API-DEBUG] Authorization header set: ${config.headers.Authorization.substring(0, 40)}...`);
    } else {
      console.warn('[API-DEBUG] NO TOKEN - Request will fail with 401');
    }
    
    // Handle FormData
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    return config;
  },
  (error) => {
    console.error('[API] Request preparation error:', error);
    return Promise.reject(error);
  }
);

// Response Interceptor: Global Error Handling
apiClient.interceptors.response.use(
  (response) => {
    console.log(`[API] ✓ ${response.status} response from ${response.config.url}`);
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      const token = localStorage.getItem('amma_token');
      console.error(`[API] 401 UNAUTHORIZED on ${error.config?.url}`);
      console.error(`[API] Token in localStorage: ${token ? 'YES - ' + token.substring(0, 30) + '...' : 'NO'}`);
      console.error(`[API] Authorization header was: ${error.config?.headers?.Authorization ? error.config.headers.Authorization.substring(0, 40) + '...' : 'NOT SET'}`);
    } else if (error.response) {
      console.error(`[API] Error ${error.response.status}: ${error.response.data?.error || error.response.statusText}`);
    } else {
      console.error('[API] Error:', error.message);
    }
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
