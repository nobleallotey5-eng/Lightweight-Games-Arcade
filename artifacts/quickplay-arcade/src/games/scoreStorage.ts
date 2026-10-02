export function readScore(key: string): number | null {
  try {
    const value = window.localStorage.getItem(key);
    if (value === null) return null;
    const score = Number(value);
    return Number.isFinite(score) && score >= 0 ? score : null;
  } catch {
    return null;
  }
}

export function keepBestScore(
  key: string,
  value: number,
  direction: 'lower' | 'higher',
): number {
  const current = readScore(key);
  const best =
    current === null
      ? value
      : direction === 'lower'
        ? Math.min(current, value)
        : Math.max(current, value);
  try {
    window.localStorage.setItem(key, String(best));
  } catch {
    // The current session still works when browser storage is unavailable.
  }
  return best;
}