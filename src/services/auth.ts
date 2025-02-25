import axios from 'axios';
import axiosInstance from './axiosConfig';
import toast from 'react-hot-toast';

interface LoginResponse {
  access_token: string;
  token_type: string;
}


export const login = async (username: string, password: string): Promise<LoginResponse> => {
  try {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);

    const response = await axiosInstance.post<LoginResponse>(
      '/auth/login',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true,
        noAuth: true // Mark this request to skip auth interceptor
      } as any // Type assertion for custom config
    );
    
    // Store the access token in localStorage
    localStorage.setItem('token', response.data.access_token);
    
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // Clear any existing token to prevent refresh attempts
      localStorage.removeItem('token');
      
      if (error.response?.status === 401) {
        throw new Error('Invalid username or password');
      }
      throw new Error(error.response?.data?.detail || 'Login failed');
    }
    throw new Error('Login failed');
  }
};

export const refreshToken = async (): Promise<LoginResponse> => {
  try {
    const response = await axiosInstance.post<LoginResponse>(
      '/auth/refresh',
      {},
      {
        withCredentials: true, // Important: needed to send cookies
      }
    );
    
    // Update the access token in localStorage
    localStorage.setItem('token', response.data.access_token);
    
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.detail || 'Token refresh failed');
    }
    throw new Error('Token refresh failed');
  }
};

export const logout = async () => {
  try {
    // Call logout endpoint to clear refresh token cookie
    await axiosInstance.post('/auth/logout', {}, {
      withCredentials: true
    });
  } catch (error) {
    // Only show user-friendly message without exposing error details
    const errorMessage = axios.isAxiosError(error)
      ? error.response?.data?.detail || 'Failed to logout properly'
      : 'Failed to logout properly';
    
    // Only log in development
    if (import.meta.env.DEV) {
      console.error('Logout error:', error);
    }

    toast.error(errorMessage, {
      duration: 5000,
      icon: '⚠️'
    });
  } finally {
    // Always clear local storage token
    localStorage.removeItem('token');
  }
};

export const getToken = (): string | null => {
  return localStorage.getItem('token');
};

export const isAuthenticated = (): boolean => {
  return !!getToken();
}; 