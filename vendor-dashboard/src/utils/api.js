import { isTokenExpired } from './jwt';

const API_URL = import.meta.env.VITE_APP_API_URL;

const clearAuthSession = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('accessToken');
  localStorage.removeItem('user');
  if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
    window.location.href = '/login';
  }
};

const getHeaders = () => {
  const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
  const headers = {};
  
  if (token) {
    if (isTokenExpired(token)) {
      clearAuthSession();
      return headers;
    }
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (response) => {
  const data = await response.json().catch(() => ({}));
  if (response.status === 401) {
    clearAuthSession();
  }
  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }
  return data;
};

const api = {
  get: async (endpoint) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  post: async (endpoint, body, isFormData = false) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: isFormData ? getHeaders() : { ...getHeaders(), 'Content-Type': 'application/json' },
      body: isFormData ? body : JSON.stringify(body),
    });
    return handleResponse(response);
  },

  put: async (endpoint, body, isFormData = false) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'PUT',
      headers: isFormData ? getHeaders() : { ...getHeaders(), 'Content-Type': 'application/json' },
      body: isFormData ? body : JSON.stringify(body),
    });
    return handleResponse(response);
  },

  patch: async (endpoint, body, isFormData = false) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'PATCH',
      headers: isFormData ? getHeaders() : { ...getHeaders(), 'Content-Type': 'application/json' },
      body: isFormData ? body : (body ? JSON.stringify(body) : undefined),
    });
    return handleResponse(response);
  },

  delete: async (endpoint) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },
};

export default api;

