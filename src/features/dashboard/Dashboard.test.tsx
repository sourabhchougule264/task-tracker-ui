import {render, screen, fireEvent} from '@testing-library/react';
import {MemoryRouter} from 'react-router-dom';
import {vi, describe, it, expect, beforeEach} from 'vitest';
import Dashboard from './Dashboard';
import {useAppDispatch, useAppSelector} from '../../store';
import {setTheme} from '../../store/uiSlice';
import {useLogout} from '../../hooks/useAuth';
import {isAdmin} from '../../utils/permissions';

// Mock sub-views with unique test IDs to avoid text collisions
vi.mock('./OverviewView', () => ({default: () => <div data-testid="overview-view">Overview Content</div>}));
vi.mock('./ProjectsView', () => ({default: () => <div data-testid="projects-view">Projects Content</div>}));
vi.mock('./TasksView', () => ({default: () => <div>Tasks Content</div>}));
vi.mock('./UserProfileView', () => ({default: () => <div>Profile Content</div>}));
vi.mock('./UserManagementView', () => ({default: () => <div>User Management Content</div>}));
vi.mock('../../components/common/Logo', () => ({default: () => <div data-testid="logo">Logo</div>}));

vi.mock('../../store', () => ({
    useAppDispatch: vi.fn(),
    useAppSelector: vi.fn(),
}));

vi.mock('../../store/uiSlice', () => ({
    setTheme: vi.fn(),
}));

vi.mock('../../hooks/useAuth', () => ({
    useLogout: vi.fn(),
}));

vi.mock('../../utils/permissions', () => ({
    isAdmin: vi.fn(),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

describe('Dashboard Component', () => {
    const mockDispatch = vi.fn();
    const mockLogout = vi.fn();
    const mockUser = {
        username: 'testuser',
        email: 'test@example.com',
        roles: ['USER'],
    };

    beforeEach(() => {
        vi.clearAllMocks();
        (useAppDispatch as any).mockReturnValue(mockDispatch);
        (useLogout as any).mockReturnValue(mockLogout);
        (useAppSelector as any).mockImplementation((selector: any) =>
            selector({
                auth: {user: mockUser},
                ui: {theme: 'light'},
            })
        );
        (isAdmin as any).mockReturnValue(false);
    });

    it('renders the drawer menu items correctly', () => {
        render(
            <MemoryRouter>
                <Dashboard/>
            </MemoryRouter>
        );

        // Use getAllByText because MUI renders a hidden mobile drawer and a visible desktop drawer
        const overviewLinks = screen.getAllByText(/^Overview$/i);
        expect(overviewLinks.length).toBeGreaterThan(0);

        // Verify that the main content area (OverviewView) is rendered
        expect(screen.getByTestId('overview-view')).toBeInTheDocument();
    });

    it('renders User Management link only for admins', () => {
        (isAdmin as any).mockReturnValue(true);

        render(
            <MemoryRouter>
                <Dashboard/>
            </MemoryRouter>
        );

        const userMgmtLinks = screen.getAllByText(/User Management/i);
        expect(userMgmtLinks.length).toBeGreaterThan(0);
    });

    it('displays user profile info in the sidebar', () => {
        render(
            <MemoryRouter>
                <Dashboard/>
            </MemoryRouter>
        );

        const usernameElements = screen.getAllByText(mockUser.username);
        expect(usernameElements.length).toBeGreaterThan(0);

        expect(screen.getAllByText(mockUser.email)[0]).toBeInTheDocument();
    });

    it('toggles the theme via the AppBar button', () => {
        render(
            <MemoryRouter>
                <Dashboard/>
            </MemoryRouter>
        );

        const themeBtn = screen.getByTestId('Brightness4Icon').closest('button');
        if (themeBtn) fireEvent.click(themeBtn);

        expect(mockDispatch).toHaveBeenCalledWith(setTheme('dark'));
    });

    it('navigates to projects when clicked in the sidebar', () => {
        render(
            <MemoryRouter>
                <Dashboard/>
            </MemoryRouter>
        );

        const projectsLink = screen.getAllByText(/^Projects$/i)[0];
        fireEvent.click(projectsLink);

        expect(mockNavigate).toHaveBeenCalledWith('/dashboard/projects');
    });

    it('handles logout flow correctly', () => {
        render(
            <MemoryRouter>
                <Dashboard/>
            </MemoryRouter>
        );

        const profileBtn = screen.getByTestId('AccountCircleIcon').closest('button');
        if (profileBtn) fireEvent.click(profileBtn);


        const logoutItem = screen.getByText(/Logout/i);
        fireEvent.click(logoutItem);

        expect(mockLogout).toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    it('toggles mobile drawer when the menu icon is clicked', () => {
        render(
            <MemoryRouter>
                <Dashboard/>
            </MemoryRouter>
        );

        const menuBtn = screen.getByTestId('MenuIcon').closest('button');
        if (menuBtn) fireEvent.click(menuBtn);

        expect(screen.getByRole('presentation')).toBeInTheDocument();
    });
});