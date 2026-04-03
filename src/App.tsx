import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { store, useAppDispatch, useAppSelector } from './store';
import { initializeAuth } from './store/authSlice';
import { lightTheme, darkTheme } from './styles/theme';
import PrivateRoute from './components/PrivateRoute';
import Login from './features/auth/Login';
import Register from './features/auth/Register';
import ConfirmRegistration from './features/auth/ConfirmRegistration';
import ForgotPassword from './features/auth/ForgotPassword';
import Dashboard from './features/dashboard/Dashboard';
import Notification from './components/common/Notification';
import AuthDebugger from './components/common/AuthDebugger';

// Create QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Auth initialization component
const AuthInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  return <>{children}</>;
};

// Main App with theme
const ThemedApp: React.FC = () => {
  const theme = useAppSelector((state) => state.ui.theme);
  const selectedTheme = theme === 'dark' ? darkTheme : lightTheme;

  return (
    <ThemeProvider theme={selectedTheme}>
      <CssBaseline />
      <AuthDebugger />
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/confirm" element={<ConfirmRegistration />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route
            path="/dashboard/*"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
      <Notification />
    </ThemeProvider>
  );
};

// Root App component with all providers
const App: React.FC = () => {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <AuthInitializer>
          <ThemedApp />
        </AuthInitializer>
      </QueryClientProvider>
    </Provider>
  );
};

export default App;

