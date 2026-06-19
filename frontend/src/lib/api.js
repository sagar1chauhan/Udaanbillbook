import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Match the backend server URL
});

// Add a request interceptor to attach the JWT token
api.interceptors.request.use(
  (config) => {
    const authData = localStorage.getItem('Udaan.auth');
    if (authData) {
      try {
        const parsed = JSON.parse(authData);
        if (parsed.token) {
          config.headers.Authorization = `Bearer ${parsed.token}`;
        }
      } catch (e) {
        console.error('Failed to parse auth data for token', e);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token expiration/unauthorized errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token and session cache
      localStorage.removeItem('Udaan.auth');
      // Trigger a page reload to force routing layout to redirect to login
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

export default api;
