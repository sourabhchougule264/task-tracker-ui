import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import apiClient from './apiClient';

describe('apiClient Utility', () => {
    const originalLocation = window.location;

    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();

        // 1. Mock window.location.href safely
        // @ts-ignore
        delete window.location;
        window.location = { ...originalLocation, href: '' } as any;

        // 2. Mock global fetch so fetchDynamicConfig() works smoothly
        global.fetch = vi.fn().mockResolvedValue({
            json: async () => ({ apiBaseUrl: 'https://mock-tunnel.com' }),
        });
    });

    afterEach(() => {
        window.location = originalLocation;
        vi.restoreAllMocks();
    });

    describe('Configuration', () => {
        it('should be initialized with the correct base URL and settings', () => {
            // NOTE: baseURL is intentionally undefined at initialization
            // because it is set dynamically in the request interceptor.
            expect(apiClient.defaults.baseURL).toBeUndefined();

            // Check headers on the instance defaults object
            expect(apiClient.defaults.headers['Content-Type']).toBe('application/json');
            expect(apiClient.defaults.withCredentials).toBe(true);
        });
    });

    describe('Request Interceptor', () => {
        it('should add Authorization header if token exists in localStorage', async () => {
            const mockToken = 'test-token-123';
            localStorage.setItem('accessToken', mockToken);

            // Access the interceptor handler directly
            // @ts-ignore
            const requestHandler = (apiClient.interceptors.request as any).handlers[0].fulfilled;

            // Mock standard Axios config format
            const mockConfig = { headers: {} } as any;

            // Await because fetchDynamicConfig makes this an async interceptor
            const result = await requestHandler(mockConfig);

            // Assertions
            expect(result.baseURL).toBe('https://mock-tunnel.com/api');
            expect(result.headers['Authorization']).toBe(`Bearer ${mockToken}`);
        });

        it('should not add Authorization header if token is missing', async () => {
            // @ts-ignore
            const requestHandler = (apiClient.interceptors.request as any).handlers[0].fulfilled;

            const mockConfig = { headers: {} } as any;
            const result = await requestHandler(mockConfig);

            expect(result.baseURL).toBe('https://mock-tunnel.com/api');
            expect(result.headers['Authorization']).toBeUndefined();
        });
    });

    describe('Response Interceptor', () => {
        it('should pass through successful responses', () => {
            // @ts-ignore
            const responseHandler = (apiClient.interceptors.response as any).handlers[0].fulfilled;
            const mockResponse = { data: 'success', status: 200 };

            const result = responseHandler(mockResponse);
            expect(result).toBe(mockResponse);
        });

        it('should clear storage and redirect to login on 401 error', async () => {
            // @ts-ignore
            const errorHandler = (apiClient.interceptors.response as any).handlers[0].rejected;

            const mockError = {
                response: { status: 401 },
                isAxiosError: true,
            };

            localStorage.setItem('accessToken', 'stale-token');

            try {
                await errorHandler(mockError);
            } catch (e) {
                // Expected rejection
            }

            expect(localStorage.length).toBe(0); // tests localStorage.clear()
            expect(window.location.href).toBe('/login');
        });

        it('should reject non-401 errors without redirecting', async () => {
            // @ts-ignore
            const errorHandler = (apiClient.interceptors.response as any).handlers[0].rejected;

            const mockError = {
                response: { status: 500 },
                message: 'Server Error',
            };

            await expect(errorHandler(mockError)).rejects.toEqual(mockError);
            expect(window.location.href).not.toBe('/login');
        });
    });
});