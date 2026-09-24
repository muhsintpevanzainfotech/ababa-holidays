const API_URL = import.meta.env.VITE_APP_API_URL;

const getHeaders = () => {
  const token = localStorage.getItem('token');
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const api = {
  get: async (endpoint) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      headers: getHeaders(),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Something went wrong');
    return data;
  },

  post: async (endpoint, body, isFormData = false) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: isFormData ? getHeaders() : { ...getHeaders(), 'Content-Type': 'application/json' },
      body: isFormData ? body : JSON.stringify(body),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Something went wrong');
    return data;
  },

  put: async (endpoint, body, isFormData = false) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'PUT',
      headers: isFormData ? getHeaders() : { ...getHeaders(), 'Content-Type': 'application/json' },
      body: isFormData ? body : JSON.stringify(body),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Something went wrong');
    return data;
  },

  delete: async (endpoint) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Something went wrong');
    return data;
  },
};

export default api;
