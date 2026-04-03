import { render, screen } from '@testing-library/react';
import App from './App';

test('renders without crashing', () => {
  render(<App />);
  // Basic smoke test to ensure app renders
  expect(screen.getByText(/Task Tracker/i)).toBeInTheDocument();
});

