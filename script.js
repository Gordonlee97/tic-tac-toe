(function() {
  'use strict';

  /**
   * Game state
   */
  const cells = Array.from(document.querySelectorAll('.cell'));
  const messageEl = document.getElementById('message');
  const resetBtn = document.getElementById('resetBtn');
  const startWithO = document.getElementById('startWithO');

  let board = Array(9).fill(null); // values: 'X' | 'O' | null
  let currentPlayer = 'X';
  let isGameOver = false;

  const winningLines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  function setMessage(text) {
    messageEl.textContent = text;
  }

  function render() {
    cells.forEach((btn, idx) => {
      const value = board[idx];
      btn.textContent = value ? value : '';
      btn.classList.toggle('cell--x', value === 'X');
      btn.classList.toggle('cell--o', value === 'O');
      btn.disabled = Boolean(value) || isGameOver;
      btn.setAttribute('aria-label', `Cell ${idx + 1}${value ? `: ${value}` : ''}`);
    });
  }

  function highlightWinningLine(line) {
    line.forEach(i => cells[i].classList.add('cell--win'));
  }

  function checkWinner() {
    for (const line of winningLines) {
      const [a, b, c] = line;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return { winner: board[a], line };
      }
    }
    if (board.every(v => v)) return { winner: null, line: null, draw: true };
    return null;
  }

  function nextPlayer() {
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
  }

  function handleMove(index) {
    if (isGameOver || board[index]) return;
    board[index] = currentPlayer;

    const result = checkWinner();
    if (result && result.winner) {
      isGameOver = true;
      highlightWinningLine(result.line);
      setMessage(`Player ${result.winner} wins!`);
    } else if (result && result.draw) {
      isGameOver = true;
      setMessage('It\'s a draw!');
    } else {
      nextPlayer();
      setMessage(`Player ${currentPlayer}\'s turn`);
    }

    render();
  }

  function resetGame() {
    board = Array(9).fill(null);
    isGameOver = false;
    currentPlayer = startWithO.checked ? 'O' : 'X';
    cells.forEach(c => c.classList.remove('cell--win'));
    setMessage(`Player ${currentPlayer}\'s turn`);
    render();
    const firstEmpty = cells.find(c => !c.textContent);
    if (firstEmpty) firstEmpty.focus();
  }

  // Mouse/Touch
  cells.forEach((btn, idx) => {
    btn.addEventListener('click', () => handleMove(idx));
  });

  // Keyboard navigation: arrow keys move focus to the next OPEN cell in the direction
  function moveFocus(currentIdx, dx, dy) {
    const startX = currentIdx % 3;
    const startY = Math.floor(currentIdx / 3);
    let step = 1;
    while (true) {
      const nx = startX + dx * step;
      const ny = startY + dy * step;
      if (nx < 0 || nx > 2 || ny < 0 || ny > 2) break; // out of bounds
      const n = ny * 3 + nx;
      if (board[n] == null && !cells[n].disabled) { // open and interactable
        cells[n].focus();
        return;
      }
      step += 1;
    }
    // If no open cell found in that direction, do nothing (stay on current)
  }

  cells.forEach((btn, idx) => {
    btn.addEventListener('keydown', (e) => {
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          moveFocus(idx, -1, 0);
          break;
        case 'ArrowRight':
          e.preventDefault();
          moveFocus(idx, 1, 0);
          break;
        case 'ArrowUp':
          e.preventDefault();
          moveFocus(idx, 0, -1);
          break;
        case 'ArrowDown':
          e.preventDefault();
          moveFocus(idx, 0, 1);
          break;
        case 'Enter':
        case ' ': // Space
          e.preventDefault();
          handleMove(idx);
          break;
        default:
          break;
      }
    });
  });

  resetBtn.addEventListener('click', resetGame);
  startWithO.addEventListener('change', () => {
    // Only affects next reset; we also reset immediately for convenience
    resetGame();
  });

  // Initialize
  resetGame();
})();
