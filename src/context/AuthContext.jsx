// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Configure axios instance
const api = axios.create({
  baseURL: '/api', // Your backend base URL
  withCredentials: true,
});

// Add request interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const response = await api.get('/auth/me');
          setUser(response.data);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        handleAuthError(error);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  const handleAuthError = (error) => {
    setError(error.response?.data?.message || 'Authentication error');
    localStorage.removeItem('token');
    setUser(null);
  };

  const login = async (credentials) => {
    try {
      setLoading(true);
      const response = await api.post('/auth/login', credentials);
      
      localStorage.setItem('token', response.data.token);
      setUser(response.data.user);
      setError(null);
      navigate('/orders');
    } catch (error) {
      console.error('Login failed:', error);
      handleAuthError(error);
      throw error; // Re-throw for form handling
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  // Add automatic token refresh logic if needed
  const refreshToken = async () => {
    try {
      const response = await api.post('/auth/refresh');
      localStorage.setItem('token', response.data.token);
      return response.data.token;
    } catch (error) {
      logout();
      throw error;
    }
  };

// Add this to the context value
const value = {
  user,
  loading,
  error,
  login,
  logout,
  refreshToken,
  isAuthenticated: !!user,
  isAdmin: user?.role === 'admin',
  api // Add this line to expose the axios instance
};

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};