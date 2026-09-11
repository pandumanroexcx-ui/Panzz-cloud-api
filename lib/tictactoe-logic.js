function checkWinner(board) {
  const lines = [
    [0,1,2],[3,4,5],[6,7,8], // baris
    [0,3,6],[1,4,7],[2,5,8], // kolom
    [0,4,8],[2,4,6],         // diagonal
  ];
  for (const [a,b,c] of lines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
  }
  if (board.every((cell) => cell)) return 'draw';
  return null;
}

function aiMove(board) {
  // 1. Menang kalau bisa
  for (let i = 0; i < 9; i++) {
    if (!board[i]) {
      const copy = [...board]; copy[i] = 'O';
      if (checkWinner(copy) === 'O') return i;
    }
  }
  // 2. Blok lawan kalau mau menang
  for (let i = 0; i < 9; i++) {
    if (!board[i]) {
      const copy = [...board]; copy[i] = 'X';
      if (checkWinner(copy) === 'X') return i;
    }
  }
  // 3. Ambil tengah kalau kosong
  if (!board[4]) return 4;
  // 4. Random kotak kosong
  const empty = board.map((v, i) => (!v ? i : null)).filter((v) => v !== null);
  return empty[Math.floor(Math.random() * empty.length)];
}

module.exports = { checkWinner, aiMove };
