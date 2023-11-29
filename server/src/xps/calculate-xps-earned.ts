export const calculateXPsEarned = (
  wpm: number,
  acc: number,
  position: number,
  paragraph: string,
) => {
  return Math.round((wpm * acc * paragraph.length) / (position * 25 * 1000));
};
