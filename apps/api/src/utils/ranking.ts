/**
 * Reddit-style hot ranking algorithm.
 * Based on: log10(max(|score|, 1)) + sign(score) * (seconds / 45000)
 */
export function calculateHotScore(score: number, createdAt: Date): number {
  const epochSeconds = createdAt.getTime() / 1000;
  // Reference epoch: Jan 1, 2024
  const referenceEpoch = 1704067200;
  const secondsAge = epochSeconds - referenceEpoch;

  const order = Math.log10(Math.max(Math.abs(score), 1));
  const sign = score > 0 ? 1 : score < 0 ? -1 : 0;

  return order + (sign * secondsAge) / 45000;
}
