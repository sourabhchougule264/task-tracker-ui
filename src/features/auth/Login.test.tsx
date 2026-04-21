import {render, screen, fireEvent, act} from '@testing-library/react';
import {MemoryRouter, useNavigate} from 'react-router-dom';
import {vi, describe, it, expect, beforeEach, afterEach} from 'vitest';
import Login from './Login';
import {useLogin} from '../../hooks/useAuth';
import {useAppSelector} from '../../store';

vi.mock('../../hooks/useAuth');
vi.mock('../../store', () => ({
    useAppSelector: vi.fn(),
}));

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: vi.fn(),
    };
});

describe('Login Component', () => {
    const mockNavigate = vi.fn();
    const mockMutateAsync = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        vi.useRealTimers();
        (useNavigate as any).mockReturnValue(mockNavigate);

        (useAppSelector as any).mockImplementation((selector: any) =>
            selector({auth: {isAuthenticated: false}})
        );

        (useLogin as any).mockReturnValue({
            mutateAsync: mockMutateAsync,
            isPending: false,
        });
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('renders login form correctly', () => {
        render(
            <MemoryRouter>
                <Login/>
            </MemoryRouter>
        );

        expect(screen.getByLabelText(/Username/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();

        expect(screen.getByRole('button', {name: /^Login$/i})).toBeInTheDocument();
    });

    it('redirects to dashboard if already authenticated', async () => {
        vi.useFakeTimers();
        (useAppSelector as any).mockImplementation((selector: any) =>
            selector({auth: {isAuthenticated: true}})
        );

        render(<MemoryRouter><Login/></MemoryRouter>);


        await act(async () => {
            vi.advanceTimersByTime(150);
        });

        expect(mockNavigate).toHaveBeenCalledWith('/dashboard', {replace: true});
    });

    it('calls login mutation and handles success redirect', async () => {
        vi.useFakeTimers();
        mockMutateAsync.mockResolvedValue({success: true});

        render(<MemoryRouter><Login/></MemoryRouter>);

        fireEvent.change(screen.getByLabelText(/Username/i), {target: {value: 'testuser'}});
        fireEvent.change(screen.getByLabelText(/Password/i), {target: {value: 'password123'}});

        fireEvent.click(screen.getByRole('button', {name: /^Login$/i}));


        await Promise.resolve();


        await act(async () => {
            vi.advanceTimersByTime(600);
        });

        expect(mockNavigate).toHaveBeenCalledWith('/dashboard', {replace: true});
    });

    it('shows loading spinner and disables the submit button when login is pending', () => {
        (useLogin as any).mockReturnValue({
            mutateAsync: mockMutateAsync,
            isPending: true,
        });

        render(<MemoryRouter><Login/></MemoryRouter>);


        const progressbar = screen.getByRole('progressbar');
        expect(progressbar).toBeInTheDocument();


        const submitButton = progressbar.closest('button');

        expect(submitButton).toBeDisabled();
        expect(submitButton).toHaveAttribute('type', 'submit');
    });

    it('toggles password visibility', () => {
        render(<MemoryRouter><Login/></MemoryRouter>);
        const passwordInput = screen.getByLabelText(/Password/i);


        screen.getByRole('button', {name: ''});

        const iconButton = screen.getByLabelText(/Password/i).parentElement?.querySelector('button');

        expect(passwordInput).toHaveAttribute('type', 'password');
        if (iconButton) fireEvent.click(iconButton);
        expect(passwordInput).toHaveAttribute('type', 'text');
    });
});