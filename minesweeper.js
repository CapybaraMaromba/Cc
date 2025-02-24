document.addEventListener('DOMContentLoaded', () => {
  const boardElement = document.getElementById('game-board');
  const startButton = document.getElementById('start-game');
  const gameMessage = document.getElementById('game-message');
  let board = [];
  let mines = new Set();
  let gameStarted = false;
  const size = 6;

  function initBoard(bet, mineCount) {
    board = [];
    mines = new Set();
    boardElement.innerHTML = '';
    // Cria um tabuleiro vazio
    for (let i = 0; i < size; i++) {
      board[i] = [];
      for (let j = 0; j < size; j++) {
        board[i][j] = 0;
      }
    }
    // Distribui minas aleatoriamente
    while (mines.size < mineCount) {
      const x = Math.floor(Math.random() * size);
      const y = Math.floor(Math.random() * size);
      mines.add(`${x},${y}`);
      board[x][y] = -1;
    }
    // Cria os elementos da grade
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.dataset.x = i;
        cell.dataset.y = j;
        cell.addEventListener('click', onCellClick);
        boardElement.appendChild(cell);
      }
    }
    gameMessage.textContent = "Jogo iniciado. Boa sorte!";
    gameStarted = true;
  }

  function onCellClick(e) {
    if (!gameStarted) return;
    const cell = e.currentTarget;
    const x = parseInt(cell.dataset.x);
    const y = parseInt(cell.dataset.y);
    if (cell.classList.contains('revealed')) return;
    cell.classList.add('revealed');
    if (board[x][y] === -1) {
      cell.textContent = "💣";
      gameMessage.textContent = "Você acertou uma bomba! Fim de jogo.";
      gameStarted = false;
      revealMines();
    } else {
      cell.textContent = "💎";
      // Aqui você pode implementar o cálculo do multiplicador e permitir cash-out
    }
  }

  function revealMines() {
    document.querySelectorAll('.cell').forEach(cell => {
      const x = parseInt(cell.dataset.x);
      const y = parseInt(cell.dataset.y);
      if (board[x][y] === -1 && !cell.classList.contains('revealed')) {
        cell.classList.add('revealed');
        cell.textContent = "💣";
      }
    });
  }

  startButton.addEventListener('click', () => {
    const bet = parseInt(document.getElementById('bet').value);
    const mineCount = parseInt(document.getElementById('mines').value);
    if (bet <= 0 || mineCount < 1 || mineCount > 35) {
      alert("Valores inválidos.");
      return;
    }
    initBoard(bet, mineCount);
  });
});
