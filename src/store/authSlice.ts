import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { jwtDecode } from 'jwt-decode';
import type { User, AuthState } from '../types';

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null,
};

// Helper function to get user from token
const getUserFromToken = (): User | null => {
  // User information is in the ID token, not the access token!
  const idToken = localStorage.getItem('idToken');
  if (!idToken) {
    console.warn('No idToken found in localStorage');
    return null;
  }

  try {
    const decoded: any = jwtDecode(idToken);

    console.log('Decoded ID token:', decoded);

    // Check token expiration
    if (decoded.exp * 1000 <= Date.now()) {
      console.warn('Token expired');
      localStorage.clear();
      return null;
    }

    // Extract username - try cognito:username first, then username
    const username = decoded['cognito:username'] || decoded.username;

    // Extract email
    const email = decoded.email;

    // Extract roles - try cognito:groups first, then groups, default to empty array
    const roles = decoded['cognito:groups'] || decoded.groups || [];

    if (!username || !email) {
      console.error('Missing username or email in ID token. Decoded:', decoded);
      console.error('Available keys:', Object.keys(decoded));
      return null;
    }

    console.log('User successfully extracted:', { username, email, roles });

    return {
      username,
      email,
      roles: Array.isArray(roles) ? roles : [roles],
    };
  } catch (error) {
    console.error('Error decoding ID token:', error);
    localStorage.clear();
    return null;
  }
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
    loginSuccess: (state, action: PayloadAction<{ accessToken: string; idToken: string; refreshToken: string }>) => {
      const { accessToken, idToken, refreshToken } = action.payload;

      console.log('loginSuccess action called');
      console.log('Tokens received:', {
        hasAccessToken: !!accessToken,
        hasIdToken: !!idToken,
        hasRefreshToken: !!refreshToken
      });

      // Store tokens in localStorage
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('idToken', idToken);
      localStorage.setItem('refreshToken', refreshToken);

      console.log('Tokens stored in localStorage');

      // Extract user from token
      const user = getUserFromToken();
      console.log('User extracted from token:', user);

      if (user) {
        state.user = user;
        state.isAuthenticated = true;
        console.log('User authenticated successfully, isAuthenticated set to:', true);
        console.log('Redux state after update:', {
          user: state.user,
          isAuthenticated: state.isAuthenticated,
          loading: state.loading
        });
      } else {
        console.warn('Failed to extract user from token - isAuthenticated will remain false');
        state.isAuthenticated = false; // Make sure it's explicitly false if user extraction fails
      }
      state.loading = false;
      state.error = null;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      localStorage.clear();
    },
    initializeAuth: (state) => {
      const user = getUserFromToken();
      if (user) {
        state.user = user;
        state.isAuthenticated = true;
      }
      state.loading = false;
    },
  },
});

export const { setUser, setLoading, setError, loginSuccess, logout, initializeAuth } = authSlice.actions;
export default authSlice.reducer;

