import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import {MemoryRouter} from 'react-router-dom';
import {vi, describe, it, expect, beforeEach} from 'vitest';
import ProjectsView from './ProjectsView';
import {useProjects, useCreateProject, useUpdateProject, useDeleteProject} from '../../hooks/useProjects';
import {useAppSelector} from '../../store';
import {canCreateProject, canUpdateProject, canDeleteProject} from '../../utils/permissions';

vi.mock('../../hooks/useProjects');
vi.mock('../../store', () => ({
    useAppSelector: vi.fn(),
}));
vi.mock('../../utils/permissions');

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {...actual, useNavigate: () => mockNavigate};
});

describe('ProjectsView Component', () => {
    const mockMutateCreate = vi.fn();
    const mockMutateUpdate = vi.fn();
    const mockMutateDelete = vi.fn();

    const mockProjects = [
        {
            id: 1,
            name: 'Project Alpha',
            description: 'Alpha Description',
            ownerUsername: 'admin',
            startDate: '2026-01-01',
            endDate: '2026-12-31',
        },
    ];

    beforeEach(() => {
        vi.clearAllMocks();


        (useProjects as any).mockReturnValue({data: mockProjects, isLoading: false});
        (useCreateProject as any).mockReturnValue({mutateAsync: mockMutateCreate, isPending: false});
        (useUpdateProject as any).mockReturnValue({mutateAsync: mockMutateUpdate, isPending: false});
        (useDeleteProject as any).mockReturnValue({mutateAsync: mockMutateDelete, isPending: false});


        (canCreateProject as any).mockReturnValue(true);
        (canUpdateProject as any).mockReturnValue(true);
        (canDeleteProject as any).mockReturnValue(true);


        (useAppSelector as any).mockImplementation((selector: any) =>
            selector({auth: {user: {username: 'admin'}}})
        );
    });

    it('navigates to task view when a project card is clicked', () => {
        render(<MemoryRouter><ProjectsView/></MemoryRouter>);


        const projectTitle = screen.getByText('Project Alpha');


        const card = projectTitle.closest('.MuiCard-root');

        expect(card).not.toBeNull();

        fireEvent.click(card as HTMLElement);

        expect(mockNavigate).toHaveBeenCalledWith('/dashboard/projects/1/tasks');
    });

    it('renders a list of projects correctly', () => {
        render(<MemoryRouter><ProjectsView/></MemoryRouter>);

        expect(screen.getByText('Project Alpha')).toBeInTheDocument();
        expect(screen.getByText('Alpha Description')).toBeInTheDocument();
        expect(screen.getByText(/By: admin/i)).toBeInTheDocument();
    });

    it('navigates to task view when a project card is clicked', () => {
        render(<MemoryRouter><ProjectsView/></MemoryRouter>);

        const card = screen.getByText('Project Alpha').closest('.MuiCard-root');
        fireEvent.click(card!);

        expect(mockNavigate).toHaveBeenCalledWith('/dashboard/projects/1/tasks');
    });

    it('opens "Create New Project" dialog and submits data', async () => {
        render(<MemoryRouter><ProjectsView/></MemoryRouter>);

        const newBtn = screen.getByRole('button', {name: /new project/i});
        fireEvent.click(newBtn);

        expect(screen.getByText('Create New Project')).toBeInTheDocument();

        fireEvent.change(screen.getByLabelText(/project name/i), {target: {value: 'New Project'}});
        fireEvent.change(screen.getByLabelText(/description/i), {target: {value: 'New Desc'}});

        const createBtn = screen.getByRole('button', {name: /^Create$/});
        fireEvent.click(createBtn);

        await waitFor(() => {
            expect(mockMutateCreate).toHaveBeenCalledWith(expect.objectContaining({
                name: 'New Project',
                description: 'New Desc'
            }));
        });
    });

    it('opens "Edit Project" dialog via menu and submits updates', async () => {
        render(<MemoryRouter><ProjectsView/></MemoryRouter>);


        const menuBtn = screen.getByRole('button', {name: ''}); // MoreVert icon button
        fireEvent.click(menuBtn);


        const editOption = screen.getByText(/edit/i);
        fireEvent.click(editOption);

        expect(screen.getByText('Edit Project')).toBeInTheDocument();

        const nameInput = screen.getByLabelText(/project name/i);
        expect(nameInput).toHaveValue('Project Alpha');

        fireEvent.change(nameInput, {target: {value: 'Updated Alpha'}});
        fireEvent.click(screen.getByRole('button', {name: /update/i}));

        await waitFor(() => {
            expect(mockMutateUpdate).toHaveBeenCalledWith(expect.objectContaining({
                id: 1,
                name: 'Updated Alpha'
            }));
        });
    });

    it('calls delete mutation when Delete is clicked and confirmed', async () => {
        vi.spyOn(window, 'confirm').mockReturnValue(true);
        render(<MemoryRouter><ProjectsView/></MemoryRouter>);


        const menuBtn = screen.getByRole('button', {name: ''});
        fireEvent.click(menuBtn);


        const deleteOption = screen.getByText(/delete/i);
        fireEvent.click(deleteOption);

        expect(window.confirm).toHaveBeenCalled();
        await waitFor(() => {
            expect(mockMutateDelete).toHaveBeenCalledWith(1);
        });
    });

    it('hides "New Project" button if user lacks create permissions', () => {
        (canCreateProject as any).mockReturnValue(false);
        render(<MemoryRouter><ProjectsView/></MemoryRouter>);

        expect(screen.queryByRole('button', {name: /new project/i})).not.toBeInTheDocument();
    });

    it('hides the context menu button if user lacks both update and delete permissions', () => {
        (canUpdateProject as any).mockReturnValue(false);
        (canDeleteProject as any).mockReturnValue(false);
        render(<MemoryRouter><ProjectsView/></MemoryRouter>);

        expect(screen.queryByRole('button', {name: ''})).not.toBeInTheDocument();
    });

    it('displays empty state when no projects exist', () => {
        (useProjects as any).mockReturnValue({data: [], isLoading: false});
        render(<MemoryRouter><ProjectsView/></MemoryRouter>);

        expect(screen.getByText(/No Projects Yet/i)).toBeInTheDocument();
        expect(screen.getByText(/Create your first project to get started/i)).toBeInTheDocument();
    });
});