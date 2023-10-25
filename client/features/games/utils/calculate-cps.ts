export const calculateCPs = (
  wpm: number,
  acc: number,
  playersCount: number,
  pos: number
) => {
  const score = wpm - 39 + (acc - 98) + 2 * (playersCount - pos);
  return +score.toFixed(0);
};
