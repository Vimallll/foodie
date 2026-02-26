import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = sessionStorage.getItem('token');
    if (token) {
      try {
        // Try regular auth first
        try {
          const response = await api.get('/auth/me');
          const user = response.data.user;
          // Block delivery guys from accessing regular auth
          if (user.role === 'delivery') {
            // Try delivery auth endpoint
            const deliveryResponse = await api.get('/delivery/me');
            setUser({
              ...deliveryResponse.data.user,
              role: 'delivery',
            });
          } else {
            setUser(user);
          }
          setIsAuthenticated(true);
        } catch (authError) {
          // If regular auth fails, try delivery auth
          try {
            const deliveryResponse = await api.get('/delivery/auth/me');
            setUser({
              ...deliveryResponse.data.data,
              role: 'delivery',
            });
            setIsAuthenticated(true);
          } catch (deliveryError) {
            throw authError; // Re-throw original error
          }
        }
      } catch (error) {
        sessionStorage.removeItem('token');
        setUser(null);
        setIsAuthenticated(false);
      }
    }
    setLoading(false);
  };

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;

      // Block delivery guys from using regular login
      if (user.role === 'delivery') {
        return {
          success: false,
          message: 'Delivery partners must use the delivery login page',
        };
      }

      sessionStorage.setItem('token', token);
      setUser(user);
      setIsAuthenticated(true);
      setIsAuthenticated(true);
      return { success: true, user };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed',
      };
    }
  };

  const deliveryLogin = async (loginData) => {
    try {
      const response = await api.post('/delivery/auth/login', loginData);
      const { token, data, warning } = response.data;
      sessionStorage.setItem('token', token);
      setUser({
        ...data,
        role: 'delivery',
      });
      setIsAuthenticated(true);
      return {
        success: true,
        warning: warning // Pass warning to be shown as info toast, not error
      };
    } catch (error) {
      const errorData = error.response?.data || {};

      // Handle verification required cases
      if (errorData.requiresVerification) {
        return {
          success: false,
          message: errorData.message,
          requiresVerification: true,
          verificationType: errorData.verificationType,
          phoneNumber: errorData.phoneNumber,
          email: errorData.email,
        };
      }

      return {
        success: false,
        message: errorData.message || 'Login failed',
      };
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await api.post('/auth/register', { name, email, password });

      if (!response.data) {
        return {
          success: false,
          message: 'No response data received',
        };
      }

      const { token, user } = response.data;

      if (!token) {
        return {
          success: false,
          message: 'No token received from server',
        };
      }

      sessionStorage.setItem('token', token);
      setUser(user);
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Registration failed',
      };
    }
  };

  const logout = async () => {
    // If user is a delivery partner, set status to OFFLINE before logging out
    if (user && user.role === 'delivery') {
      try {
        await api.patch('/delivery/status', { availabilityStatus: 'OFFLINE' });
      } catch (error) {
        console.error('Error setting status to OFFLINE during logout:', error);
        // Continue with logout even if this fails
      }
    }

    sessionStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    deliveryLogin,
    register,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

