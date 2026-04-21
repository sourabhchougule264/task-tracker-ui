import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import UserProfileView from './UserProfileView';
import { useAppSelector } from '../../store';

vi.mock('../../store', () => ({
    useAppSelector: vi.fn(),
}));

describe('UserProfileView Component', () => {
    const mockUser = {
        username: 'testworker',
        email: 'testworker@example.com',
        roles: ['Manager', 'Member'],
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders nothing if user is not logged in', () => {
        (useAppSelector as any).mockImplementation((selector: any) =>
            selector({ auth: { user: null } })
        );

        const { container } = render(<UserProfileView />);
        expect(container.firstChild).toBeNull();
    });

    it('renders basic profile information correctly', () => {
        (useAppSelector as any).mockImplementation((selector: any) =>
            selector({ auth: { user: mockUser } })
        );

        render(<UserProfileView />);

        // Check header
        expect(screen.getByText('My Profile')).toBeInTheDocument();

        // Check Avatar initial (first char of username)
        expect(screen.getByText('T')).toBeInTheDocument();

        // Check displayed username and email in multiple locations
        const usernameElements = screen.getAllByText('testworker');
        expect(usernameElements.length).toBeGreaterThan(0);

        const emailElements = screen.getAllByText('testworker@example.com');
        expect(emailElements.length).toBeGreaterThan(0);
    });

    it('renders account information section labels', () => {
        (useAppSelector as any).mockImplementation((selector: any) =>
            selector({ auth: { user: mockUser } })
        );

        render(<UserProfileView />);

        expect(screen.getByText('Account Information')).toBeInTheDocument();
        expect(screen.getByText('Username')).toBeInTheDocument();
        expect(screen.getByText('Email Address')).toBeInTheDocument();
        expect(screen.getByText('Roles & Permissions')).toBeInTheDocument();
    });

    it('renders all assigned roles as Chips', () => {
        (useAppSelector as any).mockImplementation((selector: any) =>
            selector({ auth: { user: mockUser } })
        );

        render(<UserProfileView />);

        expect(screen.getByText('Manager')).toBeInTheDocument();
        expect(screen.getByText('Member')).toBeInTheDocument();
    });

    it('renders fallback text when no roles are assigned', () => {
        const userNoRoles = { ...mockUser, roles: [] };

        (useAppSelector as any).mockImplementation((selector: any) =>
            selector({ auth: { user: userNoRoles } })
        );

        render(<UserProfileView />);

        expect(screen.getByText('No roles assigned')).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Manager' })).not.toBeInTheDocument();
    });

    it('renders correct avatar based on username capitalization', () => {
        const userLower = { ...mockUser, username: 'alice' };

        (useAppSelector as any).mockImplementation((selector: any) =>
            selector({ auth: { user: userLower } })
        );

        render(<UserProfileView />);

        // Component uses .toUpperCase() for the avatar initial
        expect(screen.getByText('A')).toBeInTheDocument();
    });
});