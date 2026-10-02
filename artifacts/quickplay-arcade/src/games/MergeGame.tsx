import { useCallback, useEffect, useState } from 'react';
import {
  MergeGameView,
  type MergeDirection,
  type MergeStatus,
} from '@/components/GameViews';
import { keepBestScore, readScore } from './scoreStorage';

const BEST_KEY = 'quickplay:merge-score';
type Board = number[][];

type Snapshot = {
  board: Board;
  score: number;
  status: MergeStatus;
};

function emptyBoard(): Board {
  return Array.from({ length: 4 }, () => Array<number>(4).fill(0));
}

function addRandomTile(board: Board): Board {
  const next = board.map((row) => [...row]);
  const empty: { row: number; column: number }[] = [];
  next.forEach((row, rowIndex) =>
    row.forEach((value, columnIndex) => {
      if (value === 0) empty.push({ row: rowIndex, column: columnIndex });
    }),
  );
  if (empty.length === 0) return next;
  const position = empty[Math.floor(Math.random() * empty.length)];
  next[position.row][position.column] = Math.random() < 0.9 ? 2 : 4;
  return next;
}

function newBoard(): Board {
  return addRandomTile(addRandomTile(emptyBoard()));
}

function slideLeft(line: number[]): { line: number[]; points: number } {
  const compact = line.filter((value) => value !== 0);
  let points = 0;
  for (let index = 0; index < compact.length - 1; index += 1) {
    if (compact[index] === compact[index + 1]) {
      compact[index] *= 2;
      points += compact[index];
      compact.splice(index + 1, 1);
    }
  }
  while (compact.length < 4) compact.push(0);
  return { line: compact, points };
}

function transpose(board: Board): Board {
  return board[0].map((_, column) => board.map((row) => row[column]));
}

function moveBoard(
  board: Board,
  direction: MergeDirection,
): { board: Board; points: number; moved: boolean } {
  let oriented = board.map((row) => [...row]);
  if (direction === 'up' || direction === 'down') oriented = transpose(oriented);
  if (direction === 'right' || direction === 'down') {
    oriented = oriented.map((row) => [...row].reverse());
  }

  let points = 0;
  const slid = oriented.map((row) => {
    const result = slideLeft(row);
    points += result.points;
    return result.line;
  });

  let next = slid;
  if (direction === 'right' || direction === 'down') {
    next = next.map((row) => [...row].reverse());
  }
  if (direction === 'up' || direction === 'down') next = transpose(next);

  const moved = next.some((row, rowIndex) =>
    row.some((value, columnIndex) => value !== board[rowIndex][columnIndex]),
  );
  return { board: next, points, moved };
}

function isGameOver(board: Board): boolean {
  if (board.some((row) => row.includes(0))) return false;
  for (let row = 0; row < 4; row += 1) {
    for (let column = 0; column < 4; column += 1) {
      const value = board[row][column];
      if (row < 3 && board[row + 1][column] === value) return false;
      if (column < 3 && board[row][column + 1] === value) return false;
    }
  }
  return true;
}

export function MergeGame() {
  const [board, setBoard] = useState<Board>(newBoard);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState<number | null>(() => readScore(BEST_KEY));
  const [status, setStatus] = useState<MergeStatus>('ready');
  const [previous, setPrevious] = useState<Snapshot | null>(null);

  const move = useCallback(
    (direction: MergeDirection) => {
      if (status === 'over') return;
      const moved = moveBoard(board, direction);
      if (!moved.moved) return;

      const nextBoard = addRandomTile(moved.board);
      const nextScore = score + moved.points;
      const won = status === 'won' || moved.board.some((row) => row.some((value) => value >= 2048));
      const nextStatus: MergeStatus = won
        ? 'won'
        : isGameOver(nextBoard)
          ? 'over'
          : 'playing';

      setPrevious({ board, score, status });
      setBoard(nextBoard);
      setScore(nextScore);
      setStatus(nextStatus);
      if (nextScore > (bestScore ?? 0)) {
        setBestScore(keepBestScore(BEST_KEY, nextScore, 'higher'));
      }
    },
    [bestScore, board, score, status],
  );

  useEffect(() => {
    const directions: Record<string, MergeDirection | undefined> = {
      ArrowUp: 'up',
      ArrowDown: 'down',
      ArrowLeft: 'left',
      ArrowRight: 'right',
      w: 'up',
      s: 'down',
      a: 'left',
      d: 'right',
    };
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))
      ) {
        return;
      }
      const direction = directions[event.key];
      if (!direction) return;
      event.preventDefault();
      move(direction);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [move]);

  const restart = useCallback(() => {
    setBoard(newBoard());
    setScore(0);
    setStatus('ready');
    setPrevious(null);
  }, []);

  const undo = useCallback(() => {
    if (!previous) return;
    setBoard(previous.board);
    setScore(previous.score);
    setStatus(previous.status);
    setPrevious(null);
  }, [previous]);

  return (
    <MergeGameView
      board={board}
      score={score}
      bestScore={bestScore}
      status={status}
      actions={{ onMove: move, onRestart: restart, onUndo: previous ? undo : undefined }}
    />
  );
}