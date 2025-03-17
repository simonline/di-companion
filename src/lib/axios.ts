import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
  id: number;
  iat: number;
  exp: number;
}

// Create a custom Axios instance
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://api.di.sce.de',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Function to check if token is expired
export const isTokenExpired = (): boolean => {
  try {
    const jwt = localStorage.getItem('strapi_jwt');
    if (!jwt) return true;

    const decoded = jwtDecode<JwtPayload>(jwt);
    const currentTime = Date.now() / 1000;

    return decoded.exp < currentTime;
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true;
  }
};

// Add a request interceptor to add the token to every request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('strapi_jwt');

    // Check if token exists and is not expired
    if (token && !isTokenExpired()) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// Create a custom event for logout
export const authEvents = {
  on(event: string, callback: (data?: any) => void) {
    document.addEventListener(event, (e: any) => callback(e.detail));
  },
  dispatch(event: string, data?: any) {
    document.dispatchEvent(new CustomEvent(event, { detail: data }));
  },
  remove(event: string, callback: (data?: any) => void) {
    document.removeEventListener(event, callback);
  },
};

// Add a response interceptor to handle 401 errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle expired token (401 Unauthorized)
    if (error.response && error.response.status === 401) {
      // Dispatch logout event
      authEvents.dispatch('logout');

      // Redirect to login page if needed
      // window.location.href = '/login';
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
