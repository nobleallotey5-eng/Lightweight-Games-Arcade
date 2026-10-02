import { useCallback, useEffect, useRef, useState } from 'react';
import {
  MemoryGameView,
  type MemoryCard,
} from '@/components/GameViews';
import { keepBestScore, readScore } from './scoreStorage';

const BEST_KEY = 'quickplay:memory-moves';
const symbols = ['A', 'B', 'C', 'D', 'E', 'F'];

function shuffledBoard(): MemoryCard[] {
  const cards = symbols.flatMap((value, pair) => [
    { id: `pair-${pair}-a`, value },
    { id: `pair-${pair}-b`, value },
  ]);
  for (let index = cards.length - 1; index > 0; index -= 1) {
    const other = Math.floor(Math.random() * (index + 1));
    [cards[index], cards[other]] = [cards[other], cards[index]];
  }
  return cards;
}

export function MemoryGame() {
  const [board, setBoard] = useState<MemoryCard[]>(shuffledBoard);
  const [matched, setMatched] = useState<MemoryCard['id'][]>([]);
  const [flipped, setFlipped] = useState<MemoryCard['id'][]>([]);
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(0);
  const [started, setStarted] = useState(false);
  const [bestMoves, setBestMoves] = useState<number | null>(() => readScore(BEST_KEY));
  const mismatchTimeoutRef = useRef<number | null>(null);
  const complete = matched.length === board.length && board.length > 0;

  useEffect(() => {
    if (!started || complete) return;
    const interval = window.setInterval(() => setTime((elapsed) => elapsed + 1), 1000);
    return () => window.clearInterval(interval);
  }, [complete, started]);

  useEffect(() => {
    if (complete) {
      setBestMoves(keepBestScore(BEST_KEY, moves, 'lower'));
    }
  }, [complete, moves]);

  useEffect(
    () => () => {
      if (mismatchTimeoutRef.current !== null) {
        window.clearTimeout(mismatchTimeoutRef.current);
      }
    },
    [],
  );

  const flip = useCallback(
    (id: MemoryCard['id']) => {
      if (complete || flipped.length >= 2 || flipped.includes(id) || matched.includes(id)) {
        return;
      }
      const card = board.find((item) => item.id === id);
      if (!card) return;
      setStarted(true);
      const nextFlipped = [...flipped, id];
      setFlipped(nextFlipped);
      if (nextFlipped.length !== 2) return;

      setMoves((current) => current + 1);
      const firstCard = board.find((item) => item.id === nextFlipped[0]);
      if (firstCard?.value === card.value) {
        setMatched((current) => [...current, ...nextFlipped]);
        setFlipped([]);
      } else {
        mismatchTimeoutRef.current = window.setTimeout(() => {
          setFlipped([]);
          mismatchTimeoutRef.current = null;
        }, 760);
      }
    },
    [board, complete, flipped, matched],
  );

  const restart = useCallback(() => {
    if (mismatchTimeoutRef.current !== null) {
      window.clearTimeout(mismatchTimeoutRef.current);
      mismatchTimeoutRef.current = null;
    }
    setBoard(shuffledBoard());
    setMatched([]);
    setFlipped([]);
    setMoves(0);
    setTime(0);
    setStarted(false);
  }, []);

  return (
    <MemoryGameView
      board={board}
      matched={matched}
      flipped={flipped}
      moves={moves}
      time={time}
      bestMoves={bestMoves}
      complete={complete}
      actions={{ onFlip: flip, onRestart: restart }}
    />
  );
}