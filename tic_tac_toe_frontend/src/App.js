import React, { useEffect, useMemo, useState } from 'react';
import './App.css';

const PLAYER_X = 'X';
const PLAYER_O = 'O';

const WINNING_LINES = [
  // Rows
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  // Columns
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  // Diagonals
  [0, 4, 8],
  [2, 4, 6],
];

/**
 * Determine the winner (if any) for the given board.
 * Returns:
 * - "X" or "O" when there is a winner
 * - null otherwise
 */
function calculateWinner(squares) {
  for (const [a, b, c] of WINNING_LINES) {
    const v = squares[a];
    if (v && v === squares[b] && v === squares[c]) return v;
  }
  return null;
}

/**
 * Returns whether the board is full (no nulls).
 */
function isBoardFull(squares) {
  return squares.every((sq) => sq !== null);
}

/**
 * The status string shown to the user based on current game state.
 */
function getStatusText({ winner, isDraw, xIsNext }) {
  if (winner) return `Winner: ${winner}`;
  if (isDraw) return `Draw`;
  return `Next player: ${xIsNext ? PLAYER_X : PLAYER_O}`;
}

/**
 * Single square button on the board.
 */
// PUBLIC_INTERFACE
function Square({ value, onClick, disabled, isWinningSquare, index }) {
  return (
    <button
      type="button"
      className={[
        'ttt-square',
        value ? 'ttt-square--filled' : '',
        isWinningSquare ? 'ttt-square--winning' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={onClick}
      disabled={disabled}
      aria-label={`Square ${index + 1}${value ? `: ${value}` : ''}`}
    >
      <span className="ttt-square__value" aria-hidden="true">
        {value}
      </span>
    </button>
  );
}

// PUBLIC_INTERFACE
function App() {
  const [theme, setTheme] = useState('light');

  const [squares, setSquares] = useState(() => Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);

  // Effect to apply theme to document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const winner = useMemo(() => calculateWinner(squares), [squares]);
  const isDraw = useMemo(() => !winner && isBoardFull(squares), [winner, squares]);

  const gameOver = Boolean(winner) || isDraw;

  const winningLine = useMemo(() => {
    if (!winner) return null;
    for (const line of WINNING_LINES) {
      const [a, b, c] = line;
      const v = squares[a];
      if (v && v === squares[b] && v === squares[c]) return line;
    }
    return null;
  }, [squares, winner]);

  const statusText = useMemo(
    () => getStatusText({ winner, isDraw, xIsNext }),
    [winner, isDraw, xIsNext]
  );

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const handleSquareClick = (i) => {
    // Ignore clicks when:
    // - game ended (win/draw)
    // - square already taken
    if (gameOver || squares[i]) return;

    const next = squares.slice();
    next[i] = xIsNext ? PLAYER_X : PLAYER_O;
    setSquares(next);
    setXIsNext((prev) => !prev);
  };

  const handleReset = () => {
    setSquares(Array(9).fill(null));
    setXIsNext(true);
  };

  return (
    <div className="App">
      <header className="ttt-header">
        <div className="ttt-header__bar">
          <div className="ttt-brand">
            <div className="ttt-brand__title">Tic-Tac-Toe</div>
            <div className="ttt-brand__subtitle">Local two‑player game</div>
          </div>

          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
          </button>
        </div>
      </header>

      <main className="ttt-main">
        <section className="ttt-card" aria-label="Game">
          <div className="ttt-status" role="status" aria-live="polite">
            {statusText}
          </div>

          <div className="ttt-board" role="grid" aria-label="Tic-Tac-Toe board">
            {squares.map((value, idx) => (
              <Square
                key={idx}
                index={idx}
                value={value}
                onClick={() => handleSquareClick(idx)}
                disabled={gameOver || Boolean(value)}
                isWinningSquare={Boolean(winningLine && winningLine.includes(idx))}
              />
            ))}
          </div>

          <div className="ttt-actions">
            <button type="button" className="ttt-btn ttt-btn--primary" onClick={handleReset}>
              Reset game
            </button>
          </div>

          <div className="ttt-hint" aria-label="How to play">
            Click an empty square to place your mark. Players alternate turns. First to get 3 in
            a row wins.
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
