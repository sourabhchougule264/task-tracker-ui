import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token to requests
axiosInstance.interceptors.request.use(
  (config) => {
    // List of public endpoints that don't require authentication
    const publicEndpoints = ['/auth/login', '/auth/register', '/auth/confirm'];
    const isPublicEndpoint = publicEndpoints.some(endpoint =>
      config.url?.includes(endpoint)
    );

    // Only add Authorization header if not a public endpoint and token exists
    if (!isPublicEndpoint) {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Don't redirect on 401 for public endpoints (auth, register, login)
    const publicEndpoints = ['/auth/login', '/auth/register', '/auth/confirm'];
    const isPublicEndpoint = publicEndpoints.some(endpoint => 
      originalRequest.url?.includes(endpoint)
    );

    // If error is 401 and we haven't retried yet, and it's not a public endpoint
    if (error.response?.status === 401 && !originalRequest._retry && !isPublicEndpoint) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          });

          const { accessToken } = response.data;
          localStorage.setItem('accessToken', accessToken);

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          // Refresh failed, logout user
          localStorage.clear();
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token, logout user
        localStorage.clear();
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;

