import { fireEvent, render, screen, within } from '@testing-library/react';
import App from './App';

function getBoard() {
  return screen.getByRole('grid', { name: /tic-tac-toe board/i });
}

function getSquares() {
  // The board contains 9 Square buttons; each button has aria-label "Square N" (and value when filled).
  return within(getBoard()).getAllByRole('button');
}

function clickSquare(indexZeroBased) {
  const squares = getSquares();
  fireEvent.click(squares[indexZeroBased]);
}

describe('Tic-Tac-Toe gameplay', () => {
  test('renders game title and initial status', () => {
    render(<App />);
    expect(screen.getByText(/tic-tac-toe/i)).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent(/next player:\s*x/i);

    const squares = getSquares();
    expect(squares).toHaveLength(9);
    squares.forEach((sq) => {
      expect(sq).toBeEnabled();
      // Empty square: aria-label should be "Square N" with no ": X/O" suffix.
      expect(sq).not.toHaveAccessibleName(/:\s*[xo]/i);
    });
  });

  test('allows placing a mark and alternates turns', () => {
    render(<App />);

    // X moves
    clickSquare(0);
    expect(getSquares()[0]).toHaveAccessibleName(/square 1:\s*x/i);
    expect(screen.getByRole('status')).toHaveTextContent(/next player:\s*o/i);

    // O moves
    clickSquare(1);
    expect(getSquares()[1]).toHaveAccessibleName(/square 2:\s*o/i);
    expect(screen.getByRole('status')).toHaveTextContent(/next player:\s*x/i);
  });

  test('does not allow playing on an already-filled square', () => {
    render(<App />);

    clickSquare(0); // X at 0
    expect(screen.getByRole('status')).toHaveTextContent(/next player:\s*o/i);

    // Square becomes disabled when filled; attempting to click it again should not change turn.
    const firstSquare = getSquares()[0];
    expect(firstSquare).toBeDisabled();

    fireEvent.click(firstSquare);
    expect(screen.getByRole('status')).toHaveTextContent(/next player:\s*o/i);

    // Another square should still be playable by O.
    clickSquare(1);
    expect(getSquares()[1]).toHaveAccessibleName(/square 2:\s*o/i);
  });

  test('detects a winner and prevents further moves', () => {
    render(<App />);

    // X wins top row: indices [0,1,2]
    // X:0, O:3, X:1, O:4, X:2 => Winner: X
    clickSquare(0); // X
    clickSquare(3); // O
    clickSquare(1); // X
    clickSquare(4); // O
    clickSquare(2); // X wins

    expect(screen.getByRole('status')).toHaveTextContent(/winner:\s*x/i);

    // After game over, all squares should be disabled (App passes disabled={gameOver || value}).
    getSquares().forEach((sq) => expect(sq).toBeDisabled());

    // Ensure no additional marks can be placed (pick an originally empty square).
    const before = getSquares()[8].getAttribute('aria-label');
    fireEvent.click(getSquares()[8]);
    const after = getSquares()[8].getAttribute('aria-label');
    expect(after).toEqual(before);
  });

  test('detects a draw when the board is full with no winner', () => {
    render(<App />);

    // Fill board with a known draw sequence (no 3-in-a-row):
    // X O X
    // X X O
    // O X O
    // Note: move order matters; ensure no winning line is created.
    // Verified draw move order:
    // X:0 O:1 X:2 O:4 X:3 O:5 X:7 O:6 X:8
    // Final board:
    // X O X
    // X O O
    // O X X
    const moves = [0, 1, 2, 4, 3, 5, 7, 6, 8];
    moves.forEach((idx) => clickSquare(idx));

    expect(screen.getByRole('status')).toHaveTextContent(/^draw$/i);

    // Board full => all squares disabled (either filled or gameOver).
    getSquares().forEach((sq) => expect(sq).toBeDisabled());
  });

  test('reset game clears the board and restores initial turn', () => {
    render(<App />);

    // Make a couple of moves so we can verify reset actually clears.
    clickSquare(0); // X
    clickSquare(1); // O
    expect(screen.getByRole('status')).toHaveTextContent(/next player:\s*x/i);

    fireEvent.click(screen.getByRole('button', { name: /reset game/i }));

    // Status resets to X and all squares are enabled + empty.
    expect(screen.getByRole('status')).toHaveTextContent(/next player:\s*x/i);
    const squares = getSquares();
    squares.forEach((sq, i) => {
      expect(sq).toBeEnabled();
      expect(sq).toHaveAccessibleName(new RegExp(`^square\\s+${i + 1}$`, 'i'));
    });
  });
});
