import {render, screen, fireEvent, waitFor, act} from '@testing-library/react';
import {MemoryRouter, useNavigate} from 'react-router-dom';
import {vi, describe, it, expect, beforeEach, afterEach} from 'vitest';
import ForgotPassword from './ForgotPassword';
import authService from '../../services/authService';
import {useAppDispatch} from '../../store';
import {showNotification} from '../../store/uiSlice';

vi.mock('../../services/authService');
vi.mock('../../store', () => ({
    useAppDispatch: vi.fn(),
}));

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: vi.fn(),
    };
});

describe('ForgotPassword Component', () => {
    const mockNavigate = vi.fn();
    const mockDispatch = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        vi.useRealTimers();
        (useNavigate as any).mockReturnValue(mockNavigate);
        (useAppDispatch as any).mockReturnValue(mockDispatch);
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('renders Step 1 (Enter Username) correctly', () => {
        render(
            <MemoryRouter>
                <ForgotPassword/>
            </MemoryRouter>
        );

        expect(screen.getByRole('heading', {name: /Reset Password/i})).toBeInTheDocument();
        expect(screen.getByLabelText(/Username/i)).toBeInTheDocument();
        expect(screen.getByRole('button', {name: /Send Reset Code/i})).toBeInTheDocument();
    });

    it('progresses to Step 2 after successfully requesting code', async () => {
        (authService.forgotPassword as any).mockResolvedValue({message: 'Code sent!'});

        render(
            <MemoryRouter>
                <ForgotPassword/>
            </MemoryRouter>
        );

        fireEvent.change(screen.getByLabelText(/Username/i), {target: {name: 'username', value: 'testuser'}});
        fireEvent.click(screen.getByRole('button', {name: /Send Reset Code/i}));

        await waitFor(() => {
            expect(authService.forgotPassword).toHaveBeenCalledWith('testuser');
            expect(mockDispatch).toHaveBeenCalledWith(showNotification({message: 'Code sent!', severity: 'success'}));
        });


        const resetPasswordButton = await screen.findByRole('button', {name: /^Reset Password$/i});
        expect(resetPasswordButton).toBeInTheDocument();
        expect(screen.getByLabelText(/Confirmation Code/i)).toBeInTheDocument();
    });

    it('shows validation errors in Step 2 for mismatched passwords', async () => {
        (authService.forgotPassword as any).mockResolvedValue({message: 'ok'});

        render(<MemoryRouter><ForgotPassword/></MemoryRouter>);

        fireEvent.change(screen.getByLabelText(/Username/i), {target: {value: 'testuser'}});
        fireEvent.click(screen.getByRole('button', {name: /Send Reset Code/i}));


        const codeInput = await screen.findByLabelText(/Confirmation Code/i);
        const passInput = screen.getByLabelText(/^New Password/i);
        const confirmInput = screen.getByLabelText(/Confirm Password/i);

        fireEvent.change(codeInput, {target: {name: 'confirmationCode', value: '123456'}});
        fireEvent.change(passInput, {target: {name: 'newPassword', value: 'password123'}});
        fireEvent.change(confirmInput, {target: {name: 'confirmPassword', value: 'wrongpass'}});


        fireEvent.click(screen.getByRole('button', {name: /^Reset Password$/i}));

        expect(await screen.findByText(/Passwords do not match/i)).toBeInTheDocument();
    });

    it('successfully resets password and navigates to login after delay', async () => {

        (authService.forgotPassword as any).mockResolvedValue({message: 'ok'});
        (authService.confirmForgotPassword as any).mockResolvedValue({});

        render(<MemoryRouter><ForgotPassword/></MemoryRouter>);


        fireEvent.change(screen.getByLabelText(/Username/i), {target: {value: 'testuser'}});
        fireEvent.click(screen.getByRole('button', {name: /Send Reset Code/i}));

        const codeInput = await screen.findByLabelText(/Confirmation Code/i);
        fireEvent.change(codeInput, {target: {name: 'confirmationCode', value: '123456'}});
        fireEvent.change(screen.getByLabelText(/^New Password/i), {
            target: {
                name: 'newPassword',
                value: 'newpassword123'
            }
        });
        fireEvent.change(screen.getByLabelText(/Confirm Password/i), {
            target: {
                name: 'confirmPassword',
                value: 'newpassword123'
            }
        });

        vi.useFakeTimers();

        const submitBtn = screen.getByRole('button', {name: /^Reset Password$/i});
        fireEvent.click(submitBtn);

        await act(async () => {
            await vi.advanceTimersByTimeAsync(2000);
        });

        expect(authService.confirmForgotPassword).toHaveBeenCalledWith('testuser', '123456', 'newpassword123');
        expect(mockNavigate).toHaveBeenCalledWith('/login');

        vi.useRealTimers();
    });
});