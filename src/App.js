import { useState } from 'react';

function Square({ value, onSquareClick, isHighlighted }) {
  return (
    <button 
      className={`square ${isHighlighted ? 'highlight' : ''}`} 
      onClick={onSquareClick}
    >
      {value}
    </button>
  );
}

function Board({ xIsNext, squares, onPlay, highlight }) {
  const winnerInfo = calculateWinner(squares);
  const winner = winnerInfo ? winnerInfo.winner : null;

  function handleClick(i) {
    if (winner || squares[i]) {
      return;
    }
    const nextSquares = squares.slice();
    if (xIsNext) {
      nextSquares[i] = 'X';
    } else {
      nextSquares[i] = 'O';
    }
    onPlay(nextSquares, i);
  }

  let status;
  if (winner) {
    status = 'Winner: ' + winner;
  } else if (squares.every(square => square !== null)) {
    status = 'It\'s a draw!';
  } else {
    status = 'Next player: ' + (xIsNext ? 'X' : 'O');
  }

  return (
    <>
      <div className="status"><h1>{status}</h1></div>
      {[0, 1, 2].map(row => (
        <div key={row} className="board-row">
          {[0, 1, 2].map(col => {
            const index = row * 3 + col;
            const isHighlighted = highlight.includes(index);
            return (
              <Square 
                key={index} 
                value={squares[index]} 
                onSquareClick={() => handleClick(index)} 
                isHighlighted={isHighlighted}
              />
            );
          })}
        </div>
      ))}
    </>
  );
}

export default function Game() {
  const [history, setHistory] = useState([{ squares: Array(9).fill(null), lastMove: null }]);
  const [currentMove, setCurrentMove] = useState(0);
  const [isAscending, setIsAscending] = useState(true);
  const [highlight, setHighlight] = useState([]);
  const xIsNext = currentMove % 2 === 0;
  const currentSquares = history[currentMove].squares;

  function handlePlay(nextSquares, moveIndex) {
    const nextHistory = [...history.slice(0, currentMove + 1), { squares: nextSquares, lastMove: moveIndex }];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);

    const winnerInfo = calculateWinner(nextSquares);
    if (winnerInfo) {
      setHighlight(winnerInfo.line);
    }
  }

  function jumpTo(nextMove) {
    setCurrentMove(nextMove);
    setHighlight([]);
  }

  function toggleSortOrder() {
    setIsAscending(!isAscending);
  }

  let moves = history.map((step, move) => {
    const { lastMove } = step;
    let description = move > 0 ? `Go to move #${move}` : 'Go to game start';

    if (move === currentMove) {
      description = `You are at move #${move}`;
    }

    if (lastMove !== null) {
      const row = Math.floor(lastMove / 3) + 1;
      const col = (lastMove % 3) + 1;
      description += ` (Row: ${row}, Col: ${col})`;
    }

    return (
      <li key={move}>
        {move === currentMove ? (
          <p>{description}</p>
        ) : (
          <button onClick={() => jumpTo(move)}>{description}</button>
        )}
      </li>
    );
  });

  if (!isAscending) {
    moves.reverse();
  }

  return (
    <div className="game">
      <div className="game-board">
        <Board
          xIsNext={xIsNext}
          squares={currentSquares}
          onPlay={handlePlay}
          highlight={highlight}
        />
      </div>
      <div className="game-info">
        <button onClick={toggleSortOrder}>
          Sort {isAscending ? 'Descending' : 'Ascending'}
        </button>
        {isAscending ? <ol>{moves}</ol> : <ol reversed>{moves}</ol>}
      </div>
    </div>
  );
}

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a], line: [a, b, c] };
    }
  }
  return null;
}
