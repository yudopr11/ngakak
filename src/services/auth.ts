import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export const login = async (username: string, password: string): Promise<LoginResponse> => {
  try {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);

    const response = await axios.post<LoginResponse>(
      `${API_BASE_URL}/auth/login`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    
    // Store the token in localStorage
    localStorage.setItem('token', response.data.access_token);
    
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.detail || 'Login failed');
    }
    throw new Error('Login failed');
  }
};

export const logout = () => {
  localStorage.removeItem('token');
};

export const getToken = (): string | null => {
  return localStorage.getItem('token');
};

export const isAuthenticated = (): boolean => {
  return !!getToken();
}; 