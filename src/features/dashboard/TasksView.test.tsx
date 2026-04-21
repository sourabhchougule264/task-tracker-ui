import {render, screen, fireEvent, waitFor, within} from '@testing-library/react';
import {MemoryRouter} from 'react-router-dom';
import {vi, describe, it, expect, beforeEach} from 'vitest';
import TasksView from './TasksView';
import {useTasks, useUserTasks, useCreateTask, useUpdateTask, useDeleteTask} from '../../hooks/useTasks';
import {useProjects} from '../../hooks/useProjects';
import {useUsers} from '../../hooks/useUsers';
import {useAppSelector} from '../../store';
import {canCreateTask, canUpdateTask, canDeleteTask} from '../../utils/permissions';
import {TaskStatus} from '../../types';

// Mock dependencies
vi.mock('../../hooks/useTasks');
vi.mock('../../hooks/useProjects');
vi.mock('../../hooks/useUsers');
vi.mock('../../store', () => ({
    useAppSelector: vi.fn(),
}));
vi.mock('../../utils/permissions');
vi.mock('../../components/common/TaskDetailDialog', () => ({
    default: () => <div data-testid="mock-detail-dialog"/>
}));

describe('TasksView Component', () => {
    const mockMutateCreate = vi.fn();
    const mockMutateUpdate = vi.fn();
    const mockMutateDelete = vi.fn();

    const mockTasks = [
        {
            id: 1,
            description: 'Task One',
            status: TaskStatus.NEW,
            projectId: 101,
            projectName: 'Alpha',
            assignedUsername: 'jdoe'
        },
        {
            id: 2,
            description: 'Task Two',
            status: TaskStatus.IN_PROGRESS,
            projectId: 102,
            projectName: 'Beta',
            assignedUsername: ''
        },
    ];

    const mockProjects = [
        {id: 101, name: 'Alpha'},
        {id: 102, name: 'Beta'},
    ];

    const mockUsers = [
        {username: 'jdoe', email: 'jdoe@test.com'},
    ];

    beforeEach(() => {
        vi.clearAllMocks();

        // Setup default hook returns
        (useTasks as any).mockReturnValue({data: mockTasks, isLoading: false});
        (useUserTasks as any).mockReturnValue({data: [mockTasks[0]], isLoading: false});
        (useProjects as any).mockReturnValue({data: mockProjects});
        (useUsers as any).mockReturnValue({data: mockUsers});

        (useCreateTask as any).mockReturnValue({mutateAsync: mockMutateCreate});
        (useUpdateTask as any).mockReturnValue({mutateAsync: mockMutateUpdate});
        (useDeleteTask as any).mockReturnValue({mutateAsync: mockMutateDelete});

        // Permissions
        (canCreateTask as any).mockReturnValue(true);
        (canUpdateTask as any).mockReturnValue(true);
        (canDeleteTask as any).mockReturnValue(true);

        // Auth State
        (useAppSelector as any).mockImplementation((selector: any) =>
            selector({auth: {user: {username: 'admin'}}})
        );
    });

    it('renders "All Tasks" title when no projectId is provided', () => {
        render(
            <MemoryRouter>
                <TasksView/>
            </MemoryRouter>
        );
        expect(screen.getByText('All Tasks')).toBeInTheDocument();
    });

    it('renders "My Tasks" when showMyTasks prop is true', () => {
        render(
            <MemoryRouter>
                <TasksView showMyTasks={true}/>
            </MemoryRouter>
        );
        expect(screen.getByText('My Tasks')).toBeInTheDocument();
        // Should only show Task One based on useUserTasks mock
        expect(screen.getByText('Task One')).toBeInTheDocument();
        expect(screen.queryByText('Task Two')).not.toBeInTheDocument();
    });

    it('filters tasks by status when using the Select dropdown', async () => {
        render(<MemoryRouter><TasksView /></MemoryRouter>);

        // 1. Find the "Filters:" anchor to get the filter bar container
        const filterSection = screen.getByText(/Filters:/i).parentElement as HTMLElement;

        // 2. Find all "Status" texts in the filter bar and take the first one (usually the label)
        const statusLabels = within(filterSection).getAllByText(/Status/i);

        // 3. Navigate to the actual clickable trigger.
        // In MUI, the clickable div is a sibling of the label within the FormControl
        const statusSelect = statusLabels[0].parentElement?.querySelector('[role="combobox"]');

        if (!statusSelect) throw new Error('Status select not found');
        fireEvent.mouseDown(statusSelect);

        // 4. Options are in a Portal (outside the component), so search global screen
        const option = await screen.findByRole('option', { name: 'New' });
        fireEvent.click(option);

        expect(screen.getByText('Task One')).toBeInTheDocument();
        expect(screen.queryByText('Task Two')).not.toBeInTheDocument();
    });

    it('opens Create Task dialog and submits data', async () => {
        render(<MemoryRouter><TasksView /></MemoryRouter>);

        fireEvent.click(screen.getByRole('button', { name: /new task/i }));

        // 1. Target the Dialog exclusively
        const dialog = await screen.findByRole('dialog');
        const dialogScope = within(dialog);

        fireEvent.change(dialogScope.getByLabelText(/Task Description/i), {
            target: { value: 'Spec Task' }
        });

        // 2. Find the "Project" label inside the dialog.
        // MUI often renders two: one in the <label> and one in the <legend> (for the border).
        const projectLabels = dialogScope.getAllByText(/^Project$/i);

        // 3. Find the combobox inside the same FormControl as the label
        const projectSelect = projectLabels[0].parentElement?.querySelector('[role="combobox"]');

        if (!projectSelect) throw new Error('Project select in dialog not found');
        fireEvent.mouseDown(projectSelect);

        // 4. Select the option from the portal
        const projectOption = await screen.findByRole('option', { name: 'Alpha' });
        fireEvent.click(projectOption);

        // 5. Submit
        fireEvent.click(dialogScope.getByRole('button', { name: /^Create$/i }));

        await waitFor(() => {
            expect(mockMutateCreate).toHaveBeenCalledWith(expect.objectContaining({
                description: 'Spec Task',
                projectId: 101
            }));
        });
    });


    it('opens Task Detail dialog when a task card is clicked', () => {
        render(
            <MemoryRouter>
                <TasksView/>
            </MemoryRouter>
        );

        fireEvent.click(screen.getByText('Task One'));
        expect(screen.getByTestId('mock-detail-dialog')).toBeInTheDocument();
    });

    it('calls delete mutation after confirmation', async () => {
        vi.spyOn(window, 'confirm').mockReturnValue(true);
        render(
            <MemoryRouter>
                <TasksView/>
            </MemoryRouter>
        );

        // Open Menu for Task One
        const menuButtons = screen.getAllByRole('button');
        // Find the MoreVert button (icon buttons often don't have text, so we target the icon container)
        fireEvent.click(menuButtons.find(btn => btn.innerHTML.includes('MoreVert'))!);

        fireEvent.click(screen.getByText(/Delete/i));

        expect(window.confirm).toHaveBeenCalled();
        await waitFor(() => {
            expect(mockMutateDelete).toHaveBeenCalledWith(1);
        });
    });

    it('hides "New Task" button if user lacks permissions', () => {
        (canCreateTask as any).mockReturnValue(false);
        render(
            <MemoryRouter>
                <TasksView/>
            </MemoryRouter>
        );
        expect(screen.queryByRole('button', {name: /new task/i})).not.toBeInTheDocument();
    });

    it('displays loading skeletons when isLoading is true', () => {
        (useTasks as any).mockReturnValue({isLoading: true});
        render(
            <MemoryRouter>
                <TasksView/>
            </MemoryRouter>
        );
        // Skeletons are spans in MUI
        const skeletons = document.querySelectorAll('.MuiSkeleton-root');
        expect(skeletons.length).toBeGreaterThan(0);
    });
});