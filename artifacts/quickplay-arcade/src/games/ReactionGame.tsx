import { useCallback, useEffect, useRef, useState } from 'react';
import { ReactionGameView, type ReactionPhase } from '@/components/GameViews';
import { keepBestScore, readScore } from './scoreStorage';

const BEST_KEY = 'quickplay:reaction-average';
const ROUNDS_PER_SET = 5;

export function ReactionGame() {
  const [phase, setPhase] = useState<ReactionPhase>('idle');
  const [result, setResult] = useState<number | null>(null);
  const [best, setBest] = useState<number | null>(() => readScore(BEST_KEY));
  const [round, setRound] = useState(0);
  const [sessionAverage, setSessionAverage] = useState<number | null>(null);
  const [results, setResults] = useState<number[]>([]);
  const timeoutRef = useRef<number | null>(null);
  const readyAtRef = useRef(0);

  const clearTimer = useCallback(() => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  useEffect(() => clearTimer, [clearTimer]);

  const start = useCallback(() => {
    clearTimer();
    const nextResults = phase === 'result' && round >= ROUNDS_PER_SET ? [] : results;
    if (nextResults !== results) {
      setResults(nextResults);
      setRound(0);
      setSessionAverage(null);
    }
    setResult(null);
    setPhase('waiting');
    const delay = 1400 + Math.floor(Math.random() * 2800);
    timeoutRef.current = window.setTimeout(() => {
      readyAtRef.current = performance.now();
      setPhase('ready');
      timeoutRef.current = null;
    }, delay);
  }, [clearTimer, phase, results, round]);

  const press = useCallback(() => {
    if (phase === 'waiting') {
      clearTimer();
      setPhase('early');
      return;
    }
    if (phase !== 'ready') return;
    const elapsed = Math.max(1, Math.round(performance.now() - readyAtRef.current));
    const nextResults = [...results, elapsed];
    setResult(elapsed);
    setResults(nextResults);
    setRound(nextResults.length);
    setPhase('result');

    if (nextResults.length === ROUNDS_PER_SET) {
      const average = Math.round(
        nextResults.reduce((total, value) => total + value, 0) / ROUNDS_PER_SET,
      );
      setSessionAverage(average);
      setBest(keepBestScore(BEST_KEY, average, 'lower'));
    }
  }, [clearTimer, phase, results]);

  const reset = useCallback(() => {
    clearTimer();
    setPhase('idle');
    setResult(null);
    setRound(0);
    setSessionAverage(null);
    setResults([]);
  }, [clearTimer]);

  return (
    <ReactionGameView
      phase={phase}
      result={result}
      best={best}
      round={round}
      sessionAverage={sessionAverage}
      actions={{ onStart: start, onPress: press, onReset: reset }}
    />
  );
}