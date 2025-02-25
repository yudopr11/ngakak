import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { logout, refreshToken } from './auth';
import toast from 'react-hot-toast';

// Extend axios request config to include _retry flag and noAuth flag
interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
  noAuth?: boolean;
}

// Create axios instance with base URL
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
});

// Flag to prevent multiple refresh token requests
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token as string);
    }
  });
  failedQueue = [];
};

// Add request interceptor to handle auth header
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    const extendedConfig = config as ExtendedAxiosRequestConfig;
    
    // Skip auth header for login request
    if (extendedConfig.noAuth) {
      return config;
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as ExtendedAxiosRequestConfig;
    
    // Skip refresh token logic for login request
    if (originalRequest?.noAuth) {
      return Promise.reject(error);
    }
    
    // If error is not 401 or request already retried, reject
    if (!error.response || error.response.status !== 401 || !originalRequest || originalRequest._retry) {
      return Promise.reject(error);
    }

    // If already refreshing, queue the request
    if (isRefreshing) {
      try {
        const token = await new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        });
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return axiosInstance(originalRequest);
      } catch (err) {
        return Promise.reject(err);
      }
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const response = await refreshToken();
      const { access_token } = response;
      
      originalRequest.headers.Authorization = `Bearer ${access_token}`;
      
      processQueue(null, access_token);
      return axiosInstance(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      
      // If refresh token fails, logout user
      toast.error('Session expired. Please login again.', {
        duration: 5000,
        icon: '🔒'
      });
      
      await logout();
      window.location.href = '/login';
      
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default axiosInstance; 