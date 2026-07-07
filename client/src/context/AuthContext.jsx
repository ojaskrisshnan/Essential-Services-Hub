import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [providerDetails, setProviderDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sync profile details on boot if token exists
  useEffect(() => {
    const bootstrapAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await api.get('/profile');
          setUser(res.data.user);
          if (res.data.provider) {
            setProviderDetails(res.data.provider);
          }
        } catch (error) {
          console.error('Failed to load user profile on boot', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
          setProviderDetails(null);
        }
      }
      setLoading(false);
    };

    bootstrapAuth();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.post('/register'.replace('register', 'login'), { email, password });
      localStorage.setItem('token', res.data.token);
      
      // Fetch complete profile details (address / provider metadata)
      const profileRes = await api.get('/profile');
      setUser(profileRes.data.user);
      if (profileRes.data.provider) {
        setProviderDetails(profileRes.data.provider);
      }
      return profileRes.data.user;
    } catch (error) {
      logout();
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const res = await api.post('/register', userData);
      localStorage.setItem('token', res.data.token);
      
      // Fetch full profile info
      const profileRes = await api.get('/profile');
      setUser(profileRes.data.user);
      if (profileRes.data.provider) {
        setProviderDetails(profileRes.data.provider);
      }
      return profileRes.data.user;
    } catch (error) {
      logout();
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setProviderDetails(null);
  };

  const updateProfile = async (profileData) => {
    try {
      const res = await api.put('/profile', profileData);
      setUser(res.data.user);
      if (res.data.provider) {
        setProviderDetails(res.data.provider);
      }
      return res.data;
    } catch (error) {
      console.error('Failed to update profile', error);
      throw error;
    }
  };

  const value = {
    user,
    providerDetails,
    loading,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isProvider: user?.role === 'provider',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
export default AuthContext;
