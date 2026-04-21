import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import {MemoryRouter, useNavigate} from 'react-router-dom';
import {vi, describe, it, expect, beforeEach} from 'vitest';
import Register from './Register';
import {useRegister} from '../../hooks/useAuth';

vi.mock('../../hooks/useAuth');

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: vi.fn(),
    };
});

describe('Register Component', () => {
    const mockNavigate = vi.fn();
    const mockMutateAsync = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        (useNavigate as any).mockReturnValue(mockNavigate);
        (useRegister as any).mockReturnValue({
            mutateAsync: mockMutateAsync,
            isPending: false,
        });
    });

    it('renders registration form correctly', () => {
        render(
            <MemoryRouter>
                <Register/>
            </MemoryRouter>
        );

        expect(screen.getByLabelText(/^Username/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/^Email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/^Password/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Confirm Password/i)).toBeInTheDocument();
        expect(screen.getByRole('button', {name: /Sign Up/i})).toBeInTheDocument();
    });

    it('shows validation errors for empty fields', async () => {
        render(
            <MemoryRouter>
                <Register/>
            </MemoryRouter>
        );

        fireEvent.click(screen.getByRole('button', {name: /Sign Up/i}));

        expect(await screen.findByText(/Username is required/i)).toBeInTheDocument();
        expect(await screen.findByText(/Email is required/i)).toBeInTheDocument();
        expect(await screen.findByText(/Password is required/i)).toBeInTheDocument();
    });

    it('shows error for mismatched passwords', async () => {
        render(
            <MemoryRouter>
                <Register/>
            </MemoryRouter>
        );

        fireEvent.change(screen.getByLabelText(/^Password/i), {target: {name: 'password', value: 'Password123!'}});
        fireEvent.change(screen.getByLabelText(/Confirm Password/i), {
            target: {
                name: 'confirmPassword',
                value: 'DifferentPass123!'
            }
        });

        fireEvent.click(screen.getByRole('button', {name: /Sign Up/i}));

        expect(await screen.findByText(/Passwords do not match/i)).toBeInTheDocument();
    });

    it('toggles password visibility when icon is clicked', () => {
        render(
            <MemoryRouter>
                <Register/>
            </MemoryRouter>
        );

        const passwordInput = screen.getByLabelText(/^Password/i);
        // Find the IconButton by targeting the SVG testId or querying the parent element
        const toggleButton = screen.getByRole('button', {name: ''});

        expect(passwordInput).toHaveAttribute('type', 'password');

        fireEvent.click(toggleButton);
        expect(passwordInput).toHaveAttribute('type', 'text');

        fireEvent.click(toggleButton);
        expect(passwordInput).toHaveAttribute('type', 'password');
    });

    it('calls register mutation and navigates to confirm page on success', async () => {
        mockMutateAsync.mockResolvedValue({success: true});

        render(
            <MemoryRouter>
                <Register/>
            </MemoryRouter>
        );

        // Fill valid data
        fireEvent.change(screen.getByLabelText(/^Username/i), {target: {name: 'username', value: 'newuser'}});
        fireEvent.change(screen.getByLabelText(/^Email/i), {target: {name: 'email', value: 'test@example.com'}});
        fireEvent.change(screen.getByLabelText(/^Password/i), {target: {name: 'password', value: 'Password123!'}});
        fireEvent.change(screen.getByLabelText(/Confirm Password/i), {
            target: {
                name: 'confirmPassword',
                value: 'Password123!'
            }
        });

        fireEvent.click(screen.getByRole('button', {name: /Sign Up/i}));

        await waitFor(() => {
            expect(mockMutateAsync).toHaveBeenCalledWith({
                username: 'newuser',
                email: 'test@example.com',
                password: 'Password123!',
            });
            expect(mockNavigate).toHaveBeenCalledWith('/confirm', {state: {username: 'newuser'}});
        });
    });

    it('shows loading state when registration is pending', () => {
        (useRegister as any).mockReturnValue({
            mutateAsync: mockMutateAsync,
            isPending: true,
        });

        render(
            <MemoryRouter>
                <Register/>
            </MemoryRouter>
        );

        expect(screen.getByRole('progressbar')).toBeInTheDocument();

        const submitButton = screen.getByRole('progressbar').closest('button');
        expect(submitButton).toBeDisabled();
    });
});