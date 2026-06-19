import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

let dynamicBaseUrl: string | null = null;

/**
 * Helper to fetch the dynamic tunnel URL from S3
 */
const fetchDynamicConfig = async () => {
    try {
        // fetch from the root of domain where S3/CloudFront hosts config.json
        const response = await fetch('/config.json', { cache: 'no-store' });
        const data = await response.json();
        return data.apiBaseUrl + "/api";
    } catch (error) {
        console.error("Could not load dynamic config, falling back to env default", error);
        return process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api';
    }
};

// Create axios instance
const apiClient: AxiosInstance = axios.create({
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

apiClient.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        // 1. If we don't have the dynamic URL yet, fetch it
        if (!dynamicBaseUrl) {
            dynamicBaseUrl = await fetchDynamicConfig();
        }

        // 2. Set the baseURL dynamically for this request
            config.baseURL = dynamicBaseUrl;

        // 3. Existing Auth Logic
        const token = localStorage.getItem('accessToken');
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        if (error.response?.status === 401) {
            localStorage.clear();
            globalThis.location.href = '/login';
        }
        return error;
    }
);

export default apiClient;