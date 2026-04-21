import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import TaskDetailDialog from './TaskDetailDialog';
import { useUpdateTask } from '../../hooks/useTasks';
import { useProjects } from '../../hooks/useProjects';
import { useUsers } from '../../hooks/useUsers';
import { canUpdateTask } from '../../utils/permissions';
import { Task, User, TaskStatus as TaskStatusEnum } from '../../types';

vi.mock('../../hooks/useTasks');
vi.mock('../../hooks/useProjects');
vi.mock('../../hooks/useUsers');
vi.mock('../../utils/permissions');
vi.mock('../../components/common/TaskDetailDialog', () => ({
    default: () => <div data-testid="mock-task-detail-dialog" />
}));

const mockUser: User = {
    username: 'admin_user',
    email: 'admin@example.com',
    roles: ['ADMIN'],
};

const mockTask: Task = {
    id: 1,
    description: 'Original Description',
    projectId: 10,
    projectName: 'Project Alpha',
    assignedUsername: 'jdoe',
    status: TaskStatusEnum.IN_PROGRESS,
    dueDate: '2026-12-31',
    ownerUsername: 'admin_user',
};

describe('TaskDetailDialog Component', () => {
    const mockOnClose = vi.fn();
    const mockMutateAsync = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();

        (useProjects as any).mockReturnValue({
            data: [{ id: 10, name: 'Project Alpha' }, { id: 20, name: 'Project Beta' }]
        });
        (useUsers as any).mockReturnValue({
            data: [{ username: 'jdoe', email: 'j@test.com' }, { username: 'asmith', email: 'a@test.com' }]
        });
        (useUpdateTask as any).mockReturnValue({
            mutateAsync: mockMutateAsync,
            isPending: false,
        });
        (canUpdateTask as any).mockReturnValue(true);
    });

    it('renders nothing when task is null', () => {
        const { container } = render(
            <TaskDetailDialog open={true} task={null} user={mockUser} onClose={mockOnClose} />
        );
        expect(container).toBeEmptyDOMElement();
    });

    it('renders view mode with task details correctly', () => {
        render(<TaskDetailDialog open={true} task={mockTask} user={mockUser} onClose={mockOnClose} />);

        expect(screen.getByText('Task Details')).toBeInTheDocument();
        expect(screen.getByText('Original Description')).toBeInTheDocument();
        expect(screen.getByText('Project Alpha')).toBeInTheDocument();
        expect(screen.getByText('jdoe')).toBeInTheDocument();

        expect(screen.getByText('IN PROGRESS')).toBeInTheDocument();
    });

    it('shows Edit button only if user has permissions', () => {
        (canUpdateTask as any).mockReturnValue(false);
        render(<TaskDetailDialog open={true} task={mockTask} user={mockUser} onClose={mockOnClose} />);

        expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument();
    });

    it('switches to edit mode when Edit button is clicked', () => {
        render(<TaskDetailDialog open={true} task={mockTask} user={mockUser} onClose={mockOnClose} />);

        const editBtn = screen.getByRole('button', { name: /edit/i });
        fireEvent.click(editBtn);

        expect(screen.getByText('Edit Task')).toBeInTheDocument();
        expect(screen.getByLabelText(/task description/i)).toHaveValue('Original Description');
    });

    it('reverts changes when Cancel is clicked', () => {
        render(<TaskDetailDialog open={true} task={mockTask} user={mockUser} onClose={mockOnClose} />);

        fireEvent.click(screen.getByRole('button', { name: /edit/i }));

        const input = screen.getByLabelText(/task description/i);
        fireEvent.change(input, { target: { value: 'Something Else' } });
        expect(input).toHaveValue('Something Else');

        fireEvent.click(screen.getByRole('button', { name: /cancel/i }));

        expect(screen.getByText('Original Description')).toBeInTheDocument();
        expect(screen.queryByLabelText(/task description/i)).not.toBeInTheDocument();
    });

    it('calls updateTask mutation and onClose when Save is clicked', async () => {
        render(<TaskDetailDialog open={true} task={mockTask} user={mockUser} onClose={mockOnClose} />);

        fireEvent.click(screen.getByRole('button', { name: /edit/i }));

        const input = screen.getByLabelText(/task description/i);
        fireEvent.change(input, { target: { value: 'New Saved Description' } });

        const saveBtn = screen.getByRole('button', { name: /save changes/i });
        fireEvent.click(saveBtn);

        await waitFor(() => {
            expect(mockMutateAsync).toHaveBeenCalledWith(expect.objectContaining({
                id: 1,
                description: 'New Saved Description',
                status: TaskStatusEnum.IN_PROGRESS
            }));
            expect(mockOnClose).toHaveBeenCalled();
        });
    });

    it('disables Save button if required description is missing', () => {
        render(<TaskDetailDialog open={true} task={mockTask} user={mockUser} onClose={mockOnClose} />);

        fireEvent.click(screen.getByRole('button', { name: /edit/i }));

        const input = screen.getByLabelText(/task description/i);
        fireEvent.change(input, { target: { value: '' } }); // Empty description

        const saveBtn = screen.getByRole('button', { name: /save changes/i });
        expect(saveBtn).toBeDisabled();
    });

    it('displays the "Saving..." state when update is pending', () => {
        (useUpdateTask as any).mockReturnValue({
            mutateAsync: mockMutateAsync,
            isPending: true,
        });

        render(<TaskDetailDialog open={true} task={mockTask} user={mockUser} onClose={mockOnClose} />);
        fireEvent.click(screen.getByRole('button', { name: /edit/i }));

        expect(screen.getByRole('button', { name: /saving\.\.\./i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /saving\.\.\./i })).toBeDisabled();
    });
});