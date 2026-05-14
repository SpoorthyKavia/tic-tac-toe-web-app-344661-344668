import { render, screen } from '@testing-library/react';
import App from './App';

test('renders game title and initial status', () => {
  render(<App />);
  expect(screen.getByText(/tic-tac-toe/i)).toBeInTheDocument();
  expect(screen.getByText(/next player: x/i)).toBeInTheDocument();
});
