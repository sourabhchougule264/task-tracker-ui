import React, { createContext, useState, useContext, useEffect } from 'react';
import authService from '../api/authService';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      try {
        const decoded = jwtDecode(accessToken);
        // Check if token is expired
        if (decoded.exp * 1000 > Date.now()) {
          setUser({
            username: decoded['cognito:username'] || decoded.username,
            email: decoded.email,
            roles: decoded['cognito:groups'] || [],
          });
        } else {
          localStorage.clear();
        }
      } catch (error) {
        console.error('Error decoding token:', error);
        localStorage.clear();
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const response = await authService.login(username, password);

      // Check if there's a challenge required
      if (response.challengeName) {
        return {
          success: false,
          challenge: response.challengeName,
          session: response.session,
          error: response.message || 'Challenge required',
        };
      }

      // Store tokens
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('idToken', response.idToken);
      localStorage.setItem('refreshToken', response.refreshToken);

      // Decode and set user info
      const decoded = jwtDecode(response.accessToken);
      setUser({
        username: decoded['cognito:username'] || decoded.username,
        email: decoded.email,
        roles: decoded['cognito:groups'] || [],
      });

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Login failed',
      };
    }
  };

  const register = async (username, password, email) => {
    try {
      const response = await authService.register(username, password, email);
      return { success: true, message: response.message };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Registration failed',
      };
    }
  };

  const confirm = async (username, confirmationCode) => {
    try {
      const response = await authService.confirm(username, confirmationCode);
      return { success: true, message: response.message };
    } catch (error) {
      console.error('Confirmation error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Confirmation failed',
      };
    }
  };

  const completeNewPasswordChallenge = async (username, newPassword, session) => {
    try {
      const response = await authService.newPasswordChallenge(username, newPassword, session);

      // Store tokens
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('idToken', response.idToken);
      localStorage.setItem('refreshToken', response.refreshToken);

      // Decode and set user info
      const decoded = jwtDecode(response.accessToken);
      setUser({
        username: decoded['cognito:username'] || decoded.username,
        email: decoded.email,
        roles: decoded['cognito:groups'] || [],
      });

      return { success: true };
    } catch (error) {
      console.error('New password challenge error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to set new password',
      };
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const hasRole = (role) => {
    return user?.roles?.includes(role) || false;
  };

  const isAdmin = () => hasRole('ADMIN');
  const canCreateTasks = () => hasRole('ADMIN') || hasRole('TASK_CREATOR');
  const isReadOnly = () => hasRole('READ_ONLY') && !hasRole('ADMIN') && !hasRole('TASK_CREATOR');

  const value = {
    user,
    loading,
    login,
    register,
    confirm,
    completeNewPasswordChallenge,
    logout,
    hasRole,
    isAdmin,
    canCreateTasks,
    isReadOnly,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

