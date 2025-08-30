import axios from 'axios';

// Create a custom Axios instance for non-Supabase API calls (like the backend AI service)
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor for any special handling
axiosInstance.interceptors.request.use(
  (config) => {
    // Special handling for FormData uploads
    if (config.data instanceof FormData) {
      // Let the browser set the Content-Type with boundary
      delete config.headers['Content-Type'];
      console.log('FormData detected in axios request:', config.url);
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// Add a response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Enhanced error logging for better debugging
    if (error.response) {
      console.error('Axios error response:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
      });
    } else if (error.request) {
      console.error('Axios error request:', error.request);
    } else {
      console.error('Axios error message:', error.message);
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
