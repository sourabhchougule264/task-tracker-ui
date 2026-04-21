import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import UserManagementView from './UserManagementView';
import { useUsers, useUpdateUserRole, useDeleteUser } from '../../hooks/useUsers';

vi.mock('../../hooks/useUsers', () => ({
    useUsers: vi.fn(),
    useUpdateUserRole: vi.fn(),
    useDeleteUser: vi.fn(),
}));

describe('UserManagementView Component', () => {
    const mockUpdateMutate = vi.fn();
    const mockDeleteMutate = vi.fn();

    const mockUsers = [
        { username: 'jdoe', email: 'jdoe@example.com', roles: ['Member'], isActive: true },
        { username: 'admin_user', email: 'admin@example.com', roles: ['Admin'], isActive: true },
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        (useUsers as any).mockReturnValue({ data: mockUsers, isLoading: false });
        (useUpdateUserRole as any).mockReturnValue({ mutateAsync: mockUpdateMutate, isPending: false });
        (useDeleteUser as any).mockReturnValue({ mutateAsync: mockDeleteMutate, isPending: false });
    });

    it('renders loading skeletons initially', () => {
        (useUsers as any).mockReturnValue({ data: null, isLoading: true });
        render(<UserManagementView />);
        const skeletons = document.querySelectorAll('.MuiSkeleton-root');
        expect(skeletons.length).toBeGreaterThan(0);
    });

    it('renders the user table with correct data', () => {
        render(<UserManagementView />);
        expect(screen.getByText('jdoe')).toBeInTheDocument();
        expect(screen.getByText('jdoe@example.com')).toBeInTheDocument();
        expect(screen.getAllByText('Member').length).toBeGreaterThan(0);
    });

    it('successfully updates a user role', async () => {
        render(<UserManagementView />);

        // Scope to table row
        const table = screen.getByRole('table');
        const userCell = within(table).getByRole('cell', { name: 'jdoe' });
        const row = userCell.closest('tr')!;
        fireEvent.click(within(row).getByTitle('Edit Role'));

        const dialog = await screen.findByRole('dialog');
        expect(within(dialog).getByText('jdoe')).toBeInTheDocument();

        const roleSelect = within(dialog).getByRole('combobox');
        fireEvent.mouseDown(roleSelect);

        const managerOption = await screen.findByRole('option', { name: 'Manager' });
        fireEvent.click(managerOption);

        fireEvent.click(within(dialog).getByRole('button', { name: /Update Role/i }));

        await waitFor(() => {
            expect(mockUpdateMutate).toHaveBeenCalledWith({
                username: 'jdoe',
                role: 'Manager',
            });
        });
    });

    it('calls delete mutation when user confirms deletion', async () => {
        const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
        render(<UserManagementView />);

        const table = screen.getByRole('table');
        const row = within(table).getByRole('cell', { name: 'jdoe' }).closest('tr')!;
        fireEvent.click(within(row).getByTitle('Delete User'));

        expect(confirmSpy).toHaveBeenCalledWith(expect.stringContaining('jdoe'));
        await waitFor(() => {
            expect(mockDeleteMutate).toHaveBeenCalledWith('jdoe');
        });
    });

    it('does not delete user if window.confirm is cancelled', async () => {
        const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
        render(<UserManagementView />);

        const table = screen.getByRole('table');
        const row = within(table).getByRole('cell', { name: 'jdoe' }).closest('tr')!;
        fireEvent.click(within(row).getByTitle('Delete User'));

        expect(confirmSpy).toHaveBeenCalled();
        expect(mockDeleteMutate).not.toHaveBeenCalled();
    });

    it('displays empty state when no users are returned', () => {
        (useUsers as any).mockReturnValue({ data: [], isLoading: false });
        render(<UserManagementView />);
        expect(screen.getByText(/No Users Found/i)).toBeInTheDocument();
    });
});