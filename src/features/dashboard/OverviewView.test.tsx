import {render, screen, fireEvent} from '@testing-library/react';
import {MemoryRouter} from 'react-router-dom';
import {vi, describe, it, expect, beforeEach} from 'vitest';
import OverviewView from './OverviewView';
import {useProjects} from '../../hooks/useProjects';
import {useTasks, useUserTasks} from '../../hooks/useTasks';
import {useAppSelector} from '../../store';
import {TaskStatus} from '../../types';

vi.mock('../../hooks/useProjects');
vi.mock('../../hooks/useTasks');
vi.mock('../../store', () => ({
    useAppSelector: vi.fn(),
}));

vi.mock('../../components/common/TaskDetailDialog', () => ({
    default: () => <div data-testid="mock-task-detail-dialog">Mock Dialog Content</div>
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

describe('OverviewView Component', () => {
    const mockUser = {username: 'testuser'};
    const mockProjects = [
        {id: 1, name: 'Project 1', description: 'Desc 1', ownerUsername: 'admin'},
        {id: 2, name: 'Project 2', description: 'Desc 2', ownerUsername: 'testuser'},
    ];
    const mockTasks = [
        {id: 101, description: 'Task 1', status: TaskStatus.COMPLETED, projectId: 1, projectName: 'Project 1'},
        {id: 102, description: 'Task 2', status: TaskStatus.IN_PROGRESS, projectId: 1, projectName: 'Project 1'},
        {id: 103, description: 'Task 3', status: TaskStatus.BLOCKED, projectId: 2, projectName: 'Project 2'},
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        (useAppSelector as any).mockImplementation((selector: any) =>
            selector({auth: {user: mockUser}})
        );

        (useProjects as any).mockReturnValue({data: mockProjects, isLoading: false});
        (useTasks as any).mockReturnValue({data: mockTasks, isLoading: false});
        (useUserTasks as any).mockReturnValue({data: [mockTasks[1]], isLoading: false});
    });

    it('renders loading skeletons when data is loading', () => {
        (useProjects as any).mockReturnValue({data: null, isLoading: true});
        render(<MemoryRouter><OverviewView/></MemoryRouter>);
        expect(screen.getByText(/Dashboard Overview/i)).toBeInTheDocument();
    });

    it('calculates and displays statistics correctly', () => {
        render(<MemoryRouter><OverviewView/></MemoryRouter>);

        // Use getAllByText for counts because '1' or '2' might appear multiple times
        // and verify their specific headings exist
        expect(screen.getByText(/Total Projects/i)).toBeInTheDocument();
        expect(screen.getByText('2')).toBeInTheDocument();

        expect(screen.getByText(/Total Tasks/i)).toBeInTheDocument();
        expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('navigates when statistic cards are clicked', () => {
        render(<MemoryRouter><OverviewView/></MemoryRouter>);
        const projectsCard = screen.getByText(/Total Projects/i).closest('.MuiCard-root');
        if (projectsCard) fireEvent.click(projectsCard);
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard/projects');
    });

    it('renders recent projects and navigates on click', () => {
        render(<MemoryRouter><OverviewView/></MemoryRouter>);

        const projectItem = screen.getAllByText('Project 1').find(el => el.tagName === 'SPAN');
        if (projectItem) fireEvent.click(projectItem);

        expect(mockNavigate).toHaveBeenCalledWith('/dashboard/projects/1/tasks');
    });

    it('opens details dialog when a task is clicked', async () => {
        render(<MemoryRouter><OverviewView/></MemoryRouter>);

        const taskItem = screen.getByText('Task 2');
        fireEvent.click(taskItem);

        expect(screen.getByTestId('mock-task-detail-dialog')).toBeInTheDocument();
        expect(screen.getByText(/Mock Dialog Content/i)).toBeInTheDocument();
    });

    it('shows empty state messages when lists are empty', () => {
        (useProjects as any).mockReturnValue({data: [], isLoading: false});
        (useUserTasks as any).mockReturnValue({data: [], isLoading: false});

        render(<MemoryRouter><OverviewView/></MemoryRouter>);

        expect(screen.getByText(/No projects yet/i)).toBeInTheDocument();
        expect(screen.getByText(/No tasks assigned to you yet/i)).toBeInTheDocument();
    });
});