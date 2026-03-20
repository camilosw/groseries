const LAMBDA = Math.LN2 / 30; // half-life of 30 days
const MS_PER_DAY = 1000 * 60 * 60 * 24;
const PRUNE_DAYS = 180;

export function frequencyScore(
  history: number[],
  now: number = Date.now(),
): number {
  if (history.length === 0) return 0;
  return history.reduce((sum, ts) => {
    const daysSince = (now - ts) / MS_PER_DAY;
    return sum + Math.exp(-LAMBDA * daysSince);
  }, 0);
}

export function purchaseInterval(history: number[]): number | null {
  if (history.length < 2) return null;
  const sorted = [...history].sort((a, b) => a - b);
  const gaps: number[] = [];
  for (let i = 1; i < sorted.length; i++) {
    gaps.push((sorted[i] - sorted[i - 1]) / MS_PER_DAY);
  }
  gaps.sort((a, b) => a - b);
  const mid = Math.floor(gaps.length / 2);
  return gaps.length % 2 === 0 ? (gaps[mid - 1] + gaps[mid]) / 2 : gaps[mid];
}

export function pruneHistory(
  history: number[],
  now: number = Date.now(),
): number[] {
  const cutoff = now - PRUNE_DAYS * MS_PER_DAY;
  return history.filter((ts) => ts >= cutoff);
}
