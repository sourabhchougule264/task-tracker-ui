import { render, screen, fireEvent, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import Notification from './Notification';
import * as hooks from '../../store'; // Adjust this path to where your hooks are defined
import { hideNotification } from '../../store/uiSlice';

vi.mock('../../store', () => ({
    useAppDispatch: vi.fn(),
    useAppSelector: vi.fn(),
}));

describe('Notification Component', () => {
    const mockDispatch = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        (hooks.useAppDispatch as any).mockReturnValue(mockDispatch);
    });

    const setupMockState = (open: boolean, message: string, severity: string) => {
        (hooks.useAppSelector as any).mockImplementation((selector: any) =>
            selector({
                ui: {
                    notification: { open, message, severity },
                },
            })
        );
    };

    it('should render the notification message correctly', async () => {
        setupMockState(true, 'Action Successful', 'success');

        render(<Notification />);

        // Use findBy to handle MUI's internal entry delay
        const alert = await screen.findByRole('alert');
        expect(screen.getByText(/Action Successful/i)).toBeInTheDocument();
        expect(alert).toHaveClass('MuiAlert-filledSuccess');
    });

    it('should not render anything when open is false', () => {
        setupMockState(false, 'Hidden message', 'info');

        render(<Notification />);

        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('should dispatch hideNotification when the close button is clicked', async () => {
        setupMockState(true, 'Click the X', 'warning');

        render(<Notification />);

        const closeButton = await screen.findByLabelText(/close/i);

        fireEvent.click(closeButton);

        expect(mockDispatch).toHaveBeenCalledWith(hideNotification());
    });

    it('should auto-hide after the specified duration', async () => {
        vi.useFakeTimers();
        setupMockState(true, 'Auto hide test', 'info');

        render(<Notification />);

        act(() => {
            vi.advanceTimersByTime(6000);
        });

        expect(mockDispatch).toHaveBeenCalledWith(hideNotification());

        vi.useRealTimers();
    });

    it('should not dispatch hideNotification when clicking away', async () => {
        setupMockState(true, 'Ignore clickaway', 'error');

        render(<Notification />);

        // Target the presentation layer/backdrop
        const presentation = await screen.findByRole('presentation');

        // MUI Snackbar triggers handleClose(event, 'clickaway') when backdrop is clicked
        // We simulate the click on the container
        fireEvent.click(presentation);

        // Verify dispatch was NOT called
        expect(mockDispatch).not.toHaveBeenCalled();
    });
});