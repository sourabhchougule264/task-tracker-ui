import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter, useNavigate, useLocation } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import ConfirmRegistration from './ConfirmRegistration';
import { useConfirm } from '../../hooks/useAuth';

vi.mock('../../hooks/useAuth');
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: vi.fn(),
        useLocation: vi.fn(),
    };
});

describe('ConfirmRegistration Component', () => {
    const mockNavigate = vi.fn();
    const mockMutateAsync = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        vi.useRealTimers();
        (useNavigate as any).mockReturnValue(mockNavigate);
        (useConfirm as any).mockReturnValue({
            mutateAsync: mockMutateAsync,
            isPending: false,
        });
        (useLocation as any).mockReturnValue({
            state: { username: 'testuser' },
        });
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('renders correctly with username from navigation state', () => {
        render(
            <MemoryRouter>
                <ConfirmRegistration />
            </MemoryRouter>
        );

        expect(screen.getByLabelText(/username/i)).toHaveValue('testuser');
        expect(screen.getByText(/confirm your email/i)).toBeInTheDocument();
    });

    it('shows validation errors when submitting empty fields', async () => {
        (useLocation as any).mockReturnValue({ state: null });

        render(
            <MemoryRouter>
                <ConfirmRegistration />
            </MemoryRouter>
        );

        const submitBtn = screen.getByRole('button', { name: /confirm email/i });
        fireEvent.click(submitBtn);

        expect(await screen.findByText(/username is required/i)).toBeInTheDocument();
        expect(await screen.findByText(/confirmation code is required/i)).toBeInTheDocument();
    });

    it('calls confirm mutation and navigates to login on success', async () => {
        vi.useFakeTimers();
        mockMutateAsync.mockResolvedValue({ success: true });

        render(
            <MemoryRouter>
                <ConfirmRegistration />
            </MemoryRouter>
        );

        const codeInput = screen.getByLabelText(/confirmation code/i);
        fireEvent.change(codeInput, { target: { name: 'confirmationCode', value: '123456' } });

        const submitBtn = screen.getByRole('button', { name: /confirm email/i });

        fireEvent.click(submitBtn);

        await act(async () => {
            await vi.advanceTimersByTimeAsync(2000);
        });

        expect(mockMutateAsync).toHaveBeenCalledWith({
            username: 'testuser',
            code: '123456',
        });

        expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    it('shows loading state when mutation is pending', () => {
        (useConfirm as any).mockReturnValue({
            mutateAsync: mockMutateAsync,
            isPending: true,
        });

        render(
            <MemoryRouter>
                <ConfirmRegistration />
            </MemoryRouter>
        );

        const button = screen.getByRole('button');
        expect(button).toBeDisabled();
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
});