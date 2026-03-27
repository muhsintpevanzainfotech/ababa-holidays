import axios from 'axios';
import { API_BASE_URL } from './constants';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Interceptor to add Authorization header to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor to handle 401/403 errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && [401, 403].includes(error.response.status)) {
      // Clear storage and reload on auth failure
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('userInfo'); // Clear stale key if present
      
      // We use a hard reload to reset the app state and trigger the Navigate to /login in App.js
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
