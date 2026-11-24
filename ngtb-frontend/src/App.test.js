import { render, screen } from '@testing-library/react';
import App from './App';

jest.mock('mqtt', () => ({
  __esModule: true,
  default: {
    connect: jest.fn(() => ({
      connected: false,
      on: jest.fn(),
      removeListener: jest.fn(),
      subscribe: jest.fn(),
    })),
  },
}));

test('renders the app title and current light selection status', () => {
  render(<App />);

  expect(screen.getByRole('heading', { name: /hemmTree lights app/i })).toBeInTheDocument();
  expect(screen.getByRole('status')).toHaveTextContent('Current lights: Waiting for a selection');
});
