import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from './App';
import { initializeAuth } from './store/authSlice';

// 1. Mock Feature Components
vi.mock('./features/auth/Login', () => ({
  default: () => <div data-testid="login-page">Login Page</div>
}));
vi.mock('./features/dashboard/Dashboard', () => ({
  default: () => <div data-testid="dashboard-page">Dashboard Page</div>
}));
vi.mock('./components/common/Notification', () => ({
  default: () => <div data-testid="notification-component" />
}));
vi.mock('./components/common/AuthDebugger', () => ({
  default: () => null
}));

// 2. Setup the Dynamic Store Mock
// We use a mock function for the selector so we can change its return value per test
const mockSelector = vi.fn();

vi.mock('./store', async () => {
  const actual = await vi.importActual('./store');
  return {
    ...actual,
    useAppSelector: (selectorFn: any) => selectorFn(mockSelector()),
    useAppDispatch: () => vi.fn(),
    // Mock the store object itself if App.tsx imports it directly
    store: {
      getState: () => mockSelector(),
      dispatch: vi.fn(),
      subscribe: vi.fn(),
    }
  };
});

// 3. Mock the Auth Action
vi.mock('./store/authSlice', async () => {
  const actual = await vi.importActual('./store/authSlice');
  return {
    ...actual,
    initializeAuth: vi.fn(() => ({ type: 'auth/initialize' })),
  };
});

describe('App Root Component', () => {
  const baseState = {
    auth: { isAuthenticated: false, loading: false, user: null },
    ui: {
      theme: 'light',
      sidebarOpen: true,
      notification: { open: false, message: '', severity: 'info' }
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should render Login Page when unauthenticated and NOT loading', async () => {
    // Setup state for this test
    mockSelector.mockReturnValue(baseState);

    render(<App />);

    await waitFor(() => {
      expect(screen.getByTestId('login-page')).toBeInTheDocument();
    });
  });

  // it('should render the spinner when auth is LOADING', async () => {
  //   // SETUP STATE: This is the critical part that forces the spinner
  //   mockSelector.mockReturnValue({
  //     ...baseState,
  //     auth: { ...baseState.auth, loading: true }
  //   });
  //
  //   render(<App />);
  //
  //   // findByRole is asynchronous and retries until the timeout
  //   const spinner = await screen.findByRole('progressbar', {}, { timeout: 2000 });
  //   expect(spinner).toBeInTheDocument();
  //
  //   // Explicitly verify the Login Page is NOT present
  //   expect(screen.queryByTestId('login-page')).not.toBeInTheDocument();
  // });

  it('should trigger auth initialization on mount', () => {
    mockSelector.mockReturnValue(baseState);
    render(<App />);
    expect(initializeAuth).toHaveBeenCalled();
  });
});