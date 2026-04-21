import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import PrivateRoute from './PrivateRoute';
import * as hooks from '../store'; // Adjust path to your store hooks

vi.mock('../store', () => ({
    useAppSelector: vi.fn(),
}));

describe('PrivateRoute Component', () => {
    const ProtectedContent = () => <div>Protected Content</div>;
    const LoginPage = () => <div>Login Page</div>;

    beforeEach(() => {
        vi.clearAllMocks();
    });

    /**
     * Helper to mock the auth state
     */
    const mockAuthState = (isAuthenticated: boolean, loading: boolean) => {
        (hooks.useAppSelector as any).mockImplementation((selector: any) =>
            selector({
                auth: { isAuthenticated, loading },
            })
        );
    };

    it('renders a loading spinner when loading is true', () => {
        mockAuthState(false, true);

        render(
            <MemoryRouter>
                <PrivateRoute>
                    <ProtectedContent />
                </PrivateRoute>
            </MemoryRouter>
        );

        expect(screen.getByRole('progressbar')).toBeInTheDocument();
        expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    it('renders children when authenticated and not loading', () => {
        mockAuthState(true, false);

        render(
            <MemoryRouter>
                <PrivateRoute>
                    <ProtectedContent />
                </PrivateRoute>
            </MemoryRouter>
        );

        expect(screen.getByText('Protected Content')).toBeInTheDocument();
        expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    it('redirects to /login when not authenticated', () => {
        mockAuthState(false, false);

        render(
            <MemoryRouter initialEntries={['/protected']}>
                <Routes>
                    <Route
                        path="/protected"
                        element={
                            <PrivateRoute>
                                <ProtectedContent />
                            </PrivateRoute>
                        }
                    />
                    <Route path="/login" element={<LoginPage />} />
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByText('Login Page')).toBeInTheDocument();
        expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });
});